import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { renderToStaticMarkup } from "react-dom/server"
import { withTheme } from "@rjsf/core"
import validator from "@rjsf/validator-ajv8"
import Card from "../src/Card"
import CardModal from "../src/CardModal"
import DaisyTheme from "../src/DaisyTheme"
import CompatibilityCard from "../src/CompatibilityCard"
import FormStudio, { type FormStudioProps } from "../src/FormStudio"
import JsonSchemaForm from "../src/JsonSchemaForm"
import Section from "../src/Section"
import SemanticBindingSectionView from "../src/semantic-v1/SemanticBindingSection"
import { semanticV1Extension } from "../src/semantic-v1/extension"
import type { SemanticV1Component } from "../src/semantic-v1"
import { FormStudioProvider, useFormStudio } from "../src/FormStudioContext"
import { FieldExtensionOutlet } from "../src/extensions/outlets"
import { buildChildFieldPointer, escapeJsonPointerToken } from "../src/fieldPointer"
import { computeSemanticDiagnostics } from "../src/semantic-v1/semanticValidation"
import { createDebouncer, DEBOUNCE_MS } from "../src/debounce"
import { StudioPanelErrorFallback } from "../src/StudioPanelErrorBoundary"
import { resolveLocalDefinitionReference } from "../src/localReferences"
import {
  builderControlAppearanceClass,
  controlAppearanceClass,
} from "../src/controlAppearance"
import DEFAULT_FORM_INPUTS from "../src/defaults/defaultFormInputs"
import {
  StringArrayParameterInputs,
  updateArrayIntegerConstraint,
  updateItemConstraint,
} from "../src/defaults/stringArrayInputs"
import {
  classifyCard,
  checkForUnsupportedFeatures,
  generateCategoryHash,
  generateElementComponentsFromSchemas,
  generateElementPropsFromSchemas,
  updateSchemas,
} from "../src/utils"

type Status = "pass" | "lossy" | "unsupported" | "blocked" | "unverified"

const test: typeof import("node:test") = createRequire(import.meta.url)("node:test")

interface CapabilityFixture {
  id: string
  schema: Record<string, any>
  uiSchema: Record<string, any>
  expectations: {
    rjsfRendering: { status: Status }
    formStudioAuthoring: { status: Status }
    formStudioPreservation?: { status: Status }
  }
}

const fixtureRoot = path.join(
  process.env.MARKER_TEMPLATE_SPEC_ROOT ?? path.resolve(process.cwd(), "../marker-template-spec"),
  "fixtures",
  "v1",
  "capabilities"
)
const ThemedForm = withTheme(DaisyTheme)
const categoryHash = generateCategoryHash(DEFAULT_FORM_INPUTS)
const SEMANTIC_TEST_EXTENSIONS = [semanticV1Extension] as const

function SemanticFormStudio({
  initialSemantics,
  ...props
}: FormStudioProps & { initialSemantics?: SemanticV1Component | string }) {
  const parsedSemantics =
    typeof initialSemantics === "string"
      ? (JSON.parse(initialSemantics) as SemanticV1Component)
      : initialSemantics
  return (
    <FormStudio
      {...props}
      extensions={SEMANTIC_TEST_EXTENSIONS}
      initialExtensionValues={
        parsedSemantics === undefined
          ? {}
          : { [semanticV1Extension.id]: parsedSemantics }
      }
    />
  )
}

interface SemanticAuthoringContextValue {
  rootSchema: object
  semantics: SemanticV1Component | undefined
  onSemanticsChange: (value: SemanticV1Component | undefined) => void
  diagnostics: ReturnType<typeof computeSemanticDiagnostics>
}

function SemanticAuthoringProvider({
  value,
  children,
}: {
  value: SemanticAuthoringContextValue
  children: React.ReactNode
}) {
  return (
    <FormStudioProvider
      extensions={SEMANTIC_TEST_EXTENSIONS}
      initialSchema={value.rootSchema}
      initialExtensionValues={
        value.semantics === undefined
          ? {}
          : { [semanticV1Extension.id]: value.semantics }
      }
    >
      {children}
    </FormStudioProvider>
  )
}

function SemanticBindingSection({ fieldPointer }: { fieldPointer: string }) {
  const { state, getExtensionValue, setExtensionValue, extensionDiagnostics } = useFormStudio()
  return (
    <SemanticBindingSectionView
      fieldPointer={fieldPointer}
      rootSchema={state.schema}
      semantics={getExtensionValue(semanticV1Extension)}
      onSemanticsChange={(value) => setExtensionValue(semanticV1Extension, value)}
      diagnostics={extensionDiagnostics.filter(
        (diagnostic) => diagnostic.source === semanticV1Extension.id
      )}
    />
  )
}

function classifyField(dataOptions: Record<string, any>, uiOptions: Record<string, any> = {}) {
  return classifyCard(
    {
      name: "field",
      required: false,
      dataOptions,
      uiOptions,
      $ref: dataOptions.$ref,
      propType: "card",
      neighborNames: [],
    },
    categoryHash
  )
}

async function loadFixtures(): Promise<CapabilityFixture[]> {
  const files = (await readdir(fixtureRoot)).filter((file) => file.endsWith(".json")).sort()
  return Promise.all(
    files.map(async (file) => JSON.parse(await readFile(path.join(fixtureRoot, file), "utf8")))
  )
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function normalizeSchema(value: any): any {
  if (Array.isArray(value)) return value.map(normalizeSchema)
  if (!value || typeof value !== "object") return value

  const normalized: Record<string, any> = {}
  for (const [key, child] of Object.entries(value)) {
    const next = normalizeSchema(child)
    if (key === "dependencies" && Object.keys(next).length === 0) continue
    if (key === "required" && Array.isArray(next) && next.length === 0) continue
    normalized[key] = key === "required" && Array.isArray(next) ? [...next].sort() : next
  }
  return normalized
}

function defaultFieldOrder(schema: any): string[] {
  const order = Object.keys(schema?.properties ?? {})
  for (const dependency of Object.values<any>(schema?.dependencies ?? {})) {
    const alternatives = dependency?.oneOf ?? [dependency]
    for (const alternative of alternatives) {
      for (const name of Object.keys(alternative?.properties ?? {})) {
        if (!order.includes(name)) order.push(name)
      }
    }
  }
  return order
}

function normalizeUiSchema(uiSchema: any, schema: any): any {
  if (!uiSchema || typeof uiSchema !== "object" || Array.isArray(uiSchema)) return uiSchema

  const normalized: Record<string, any> = {}
  for (const [key, value] of Object.entries(uiSchema)) {
    if (key === "ui:order") {
      const propertyOrder = defaultFieldOrder(schema)
      if (
        Array.isArray(value) &&
        value.length === propertyOrder.length &&
        value.every((name, index) => name === propertyOrder[index])
      ) {
        continue
      }
    }

    const next = normalizeUiSchema(value, schema?.properties?.[key])
    if (next && typeof next === "object" && !Array.isArray(next) && Object.keys(next).length === 0) {
      continue
    }
    normalized[key] = next
  }
  return normalized
}

function roundTrip(schemaInput: Record<string, any>, uiSchemaInput: Record<string, any>) {
  const schema = clone(schemaInput)
  const uiSchema = clone(uiSchemaInput)
  const elements = generateElementPropsFromSchemas({
    schema,
    uischema: uiSchema,
    definitionData: schema.definitions,
    definitionUi: uiSchema.definitions,
    categoryHash,
  })

  let outputSchema: Record<string, any> | undefined
  let outputUiSchema: Record<string, any> | undefined
  updateSchemas(elements, {
    schema,
    uischema: uiSchema,
    definitionData: schema.definitions,
    definitionUi: uiSchema.definitions,
    categoryHash,
    onChange: (nextSchema, nextUiSchema) => {
      outputSchema = clone(nextSchema)
      outputUiSchema = clone(nextUiSchema)
    },
  })

  assert.ok(outputSchema)
  assert.ok(outputUiSchema)

  const equivalent =
    JSON.stringify(normalizeSchema(schemaInput)) === JSON.stringify(normalizeSchema(outputSchema)) &&
    JSON.stringify(normalizeUiSchema(uiSchemaInput, schemaInput)) ===
      JSON.stringify(normalizeUiSchema(outputUiSchema, outputSchema))

  const opaqueRootKeywordsPreserved = ["allOf", "dependencies"].every(
    (keyword) =>
      !Object.prototype.hasOwnProperty.call(schemaInput, keyword) ||
      JSON.stringify(schemaInput[keyword]) === JSON.stringify(outputSchema![keyword])
  )
  const preservationStatus: Status =
    equivalent && opaqueRootKeywordsPreserved ? "pass" : "lossy"

  const unsupportedVisualFields = elements
    .filter((element) => element.propType === "card" && element.compatibility?.kind === "readOnly")
    .map((element) => element.name)

  const migrationFields = elements
    .filter((element) => element.propType === "card" && element.compatibility?.kind === "migration")
    .map((element) => element.name)

  const unsupportedRootComposition = ["allOf", "anyOf", "oneOf", "not"].some((keyword) =>
    Object.prototype.hasOwnProperty.call(schemaInput, keyword)
  )

  const status: Status =
    unsupportedVisualFields.length || migrationFields.length || unsupportedRootComposition
      ? "unsupported"
      : !equivalent
        ? "lossy"
        : "pass"

  return { status, preservationStatus, outputSchema, outputUiSchema }
}

function roundTripWithElementEdit(
  schemaInput: Record<string, any>,
  uiSchemaInput: Record<string, any>,
  edit: (elements: ReturnType<typeof generateElementPropsFromSchemas>) => void
) {
  const schema = clone(schemaInput)
  const uiSchema = clone(uiSchemaInput)
  const elements = generateElementPropsFromSchemas({
    schema,
    uischema: uiSchema,
    definitionData: schema.definitions,
    definitionUi: uiSchema.definitions,
    categoryHash,
  })
  edit(elements)

  let outputSchema: Record<string, any> | undefined
  let outputUiSchema: Record<string, any> | undefined
  updateSchemas(elements, {
    schema,
    uischema: uiSchema,
    definitionData: schema.definitions,
    definitionUi: uiSchema.definitions,
    categoryHash,
    onChange: (nextSchema, nextUiSchema) => {
      outputSchema = clone(nextSchema)
      outputUiSchema = clone(nextUiSchema)
    },
  })

  assert.ok(outputSchema)
  assert.ok(outputUiSchema)
  return { outputSchema, outputUiSchema }
}

const fixtures = await loadFixtures()

test("Form Studio compatibility coordinates match the recorded current stack", async () => {
  const readVersion = async (packagePath: string) =>
    JSON.parse(await readFile(path.join(process.cwd(), packagePath), "utf8")).version

  assert.equal(await readVersion("package.json"), "0.2.0-rc.4")
  assert.equal(await readVersion("node_modules/@rjsf/core/package.json"), "6.6.2")
  assert.equal(await readVersion("node_modules/@rjsf/validator-ajv8/package.json"), "6.6.2")
  assert.equal(await readVersion("node_modules/ajv/package.json"), "8.20.0")
})

test("Form Studio classifies editable, read-only, and migration fields explicitly", () => {
  assert.deepEqual(classifyField({ type: "string" }), {
    kind: "editable",
    category: "shortAnswer",
  })
  assert.equal(classifyField({ type: "array", items: { type: "object" } }).kind, "readOnly")
  assert.deepEqual(classifyField({ type: "array", items: { type: "string" } }), {
    kind: "editable",
    category: "stringArray",
  })
  assert.equal(classifyField({ type: "array", items: { type: "number" } }).kind, "readOnly")
  assert.equal(classifyField({ type: "array", items: { type: "boolean" } }).kind, "readOnly")
  assert.equal(
    classifyField({
      type: "array",
      items: { type: "string", oneOf: [{ const: "a" }, { const: "b" }] },
    }).kind,
    "readOnly"
  )
  assert.equal(classifyField({ oneOf: [{ const: "a" }, { const: "b" }] }).kind, "readOnly")
  assert.equal(
    classifyField({ type: "string", readOnly: true }, { "ui:widget": "hidden" }).kind,
    "readOnly"
  )
  assert.equal(classifyField({ type: "string", format: "unknown-format" }).kind, "readOnly")
  assert.equal(classifyField({ type: "string", format: "textarea" }).kind, "migration")
})

test("local reference diagnostics inspect the same resolved object shape as the visual builder", () => {
  const schema = {
    type: "object",
    definitions: {
      email: {
        type: "string",
        title: "Contact email",
        format: "email",
      },
      contact: {
        type: "object",
        title: "Contact details",
        properties: {
          email: { $ref: "#/definitions/email" },
        },
      },
    },
    properties: {
      contact: { $ref: "#/definitions/contact" },
    },
  }
  const uiSchema = {
    contact: {
      email: { "ui:placeholder": "name@example.org" },
    },
  }
  const originalSchema = clone(schema)
  const originalUiSchema = clone(uiSchema)

  const diagnostics = checkForUnsupportedFeatures(
    schema,
    uiSchema,
    DEFAULT_FORM_INPUTS,
    schema.definitions
  )
  const elements = generateElementPropsFromSchemas({
    schema,
    uischema: uiSchema,
    definitionData: schema.definitions,
    categoryHash,
  })

  assert.doesNotMatch(diagnostics.join("\n"), /UI Property: email for contact/)
  assert.equal(elements[0]?.propType, "section")
  assert.equal(elements[0]?.referenceResolution, "resolved")
  assert.deepEqual(schema, originalSchema)
  assert.deepEqual(uiSchema, originalUiSchema)
})

test("resolved scalar references still validate their actual UI options", () => {
  const schema = {
    type: "object",
    definitions: {
      email: { type: "string", format: "email" },
    },
    properties: {
      email: { $ref: "#/definitions/email" },
    },
  }

  assert.deepEqual(
    checkForUnsupportedFeatures(
      schema,
      { email: { "ui:placeholder": "name@example.org" } },
      DEFAULT_FORM_INPUTS,
      schema.definitions
    ),
    []
  )
  assert.match(
    checkForUnsupportedFeatures(
      schema,
      { email: { unexpected: true } },
      DEFAULT_FORM_INPUTS,
      schema.definitions
    ).join("\n"),
    /UI Property: unexpected for email/
  )
})

test("local definition resolution follows chains, handles escaped names, and does not mutate input", () => {
  const definitions = {
    contactAlias: { $ref: "#/definitions/contact~1details" },
    "contact/details": {
      type: "object",
      title: "Contact details",
      properties: {
        email: { type: "string", format: "email" },
      },
    },
  }
  const definitionUi = {
    "contact/details": {
      email: { "ui:placeholder": "name@example.org" },
    },
  }
  const schema = { $ref: "#/definitions/contactAlias" }
  const uiSchema = { "ui:description": "Instance guidance" }
  const original = clone({ schema, uiSchema, definitions, definitionUi })

  const resolution = resolveLocalDefinitionReference({
    schema,
    uiSchema,
    definitions,
    definitionUi,
  })

  assert.equal(resolution.status, "resolved")
  assert.equal(resolution.schema.type, "object")
  assert.equal(resolution.schema.$ref, "#/definitions/contactAlias")
  assert.equal(resolution.uiSchema.email["ui:placeholder"], "name@example.org")
  assert.equal(resolution.uiSchema["ui:description"], "Instance guidance")
  assert.deepEqual({ schema, uiSchema, definitions, definitionUi }, original)
})

test("cyclic, unresolved, unsupported local, and external references are read-only instead of throwing", () => {
  const definitions = {
    cycleA: { $ref: "#/definitions/cycleB" },
    cycleB: { $ref: "#/definitions/cycleA" },
  }
  const schema = {
    type: "object",
    definitions,
    properties: {
      cyclic: { $ref: "#/definitions/cycleA" },
      missing: { $ref: "#/definitions/missing" },
      otherLocal: { $ref: "#/properties/cyclic" },
      external: { $ref: "https://example.org/contact.schema.json" },
    },
  }

  const elements = generateElementPropsFromSchemas({
    schema,
    uischema: {},
    definitionData: definitions,
    categoryHash,
  })
  const compatibilityCodes = Object.fromEntries(
    elements.map((element) => [
      element.name,
      element.compatibility?.kind === "readOnly" ? element.compatibility.code : undefined,
    ])
  )

  assert.deepEqual(compatibilityCodes, {
    cyclic: "FS_REFERENCE_CYCLE_READ_ONLY",
    missing: "FS_REFERENCE_UNRESOLVED_READ_ONLY",
    otherLocal: "FS_REFERENCE_UNSUPPORTED_LOCAL_READ_ONLY",
    external: "FS_REFERENCE_EXTERNAL_READ_ONLY",
  })
})

test("read-only compatibility cards expose diagnostics without destructive controls", () => {
  const compatibility = classifyField({ type: "array", items: { type: "object" } })
  assert.notEqual(compatibility.kind, "editable")
  if (compatibility.kind === "editable") return

  const markup = renderToStaticMarkup(
    <CompatibilityCard
      name="contributors"
      title="Contributors"
      compatibility={compatibility}
    />
  )

  assert.match(markup, /data-compatibility-code="FS_OBJECT_ARRAY_READ_ONLY"/)
  assert.match(markup, /Read-only/)
  assert.match(markup, /\/properties\/contributors/)
  assert.doesNotMatch(markup, /<(input|select|button)\b/)
})

test("generated object-array fields use the read-only compatibility presentation", () => {
  const components = generateElementComponentsFromSchemas({
    schemaData: {
      type: "object",
      properties: {
        contributors: {
          type: "array",
          title: "Contributors",
          items: { type: "object", properties: { name: { type: "string" } } },
        },
      },
    },
    uiSchemaData: {},
    onChange: () => undefined,
    path: "root",
    cardOpenState: {},
    setCardOpenState: () => undefined,
    allFormInputs: DEFAULT_FORM_INPUTS,
    categoryHash,
    Card,
    Section,
  })
  const markup = renderToStaticMarkup(<>{components}</>)

  assert.match(markup, /data-compatibility-code="FS_OBJECT_ARRAY_READ_ONLY"/)
  assert.doesNotMatch(markup, /Item Type/)
})

test("generated legacy textarea fields show actionable migration diagnostics without controls", () => {
  const components = generateElementComponentsFromSchemas({
    schemaData: {
      type: "object",
      properties: {
        description: {
          type: "string",
          format: "textarea",
          title: "Description",
        },
      },
    },
    uiSchemaData: {},
    onChange: () => undefined,
    path: "root",
    cardOpenState: {},
    setCardOpenState: () => undefined,
    allFormInputs: DEFAULT_FORM_INPUTS,
    categoryHash,
    Card,
    Section,
  })
  const markup = renderToStaticMarkup(<>{components}</>)

  assert.match(markup, /data-compatibility-kind="migration"/)
  assert.match(markup, /data-compatibility-code="FS_TEXTAREA_MIGRATION"/)
  assert.match(markup, /Migration required/)
  assert.match(markup, /remove &quot;format&quot;/)
  assert.match(markup, /ui:widget &quot;textarea&quot;/)
  assert.doesNotMatch(markup, /<(input|select|button|textarea)\b/)
})

test("RJSF preview styles single-line, multiline, and nested object fields consistently", () => {
  const markup = renderToStaticMarkup(
    <ThemedForm
      schema={{
        type: "object",
        title: "Preview style test",
        properties: {
          title: { type: "string", title: "Title" },
          website: { type: "string", title: "Website", format: "uri" },
          issued: { type: "string", title: "Issued", format: "date" },
          count: { type: "integer", title: "Count", minimum: 0 },
          description: { type: "string", title: "Description" },
          contact: {
            type: "object",
            title: "Contact details",
            properties: {
              email: { type: "string", title: "Contact email", format: "email" },
            },
          },
        },
      }}
      uiSchema={{
        description: {
          "ui:widget": "textarea",
          "ui:placeholder": "Enter a multiline description",
        },
        "ui:submitButtonOptions": { norender: true },
      }}
      validator={validator}
    />
  )

  assert.match(markup, /<legend class="[^"]*text-2xl[^"]*"/)
  assert.match(markup, /<fieldset id="root_contact" class="[^"]*mt-8[^"]*min-w-0[^"]*"/)
  assert.match(markup, /<legend class="[^"]*mb-4[^"]*text-xl[^"]*"[^>]*>.*Contact details/)
  assert.doesNotMatch(markup, /<fieldset id="root_contact" class="[^"]*(?:rounded|border|bg-|px-|pl-)/)
  assert.doesNotMatch(markup, /class="[^"]*border-l-2[^"]*"/)
  assert.match(markup, /class="[^"]*mb-5[^"]*"/)
  assert.doesNotMatch(markup, /class="[^"]*last:mb-0[^"]*"/)
  assert.match(markup, /<label class="[^"]*mb-1[^"]*block[^"]*"[^>]*>Title/)
  assert.match(
    markup,
    /<input[^>]*class="[^"]*input-bordered[^"]*w-full[^"]*border-primary[^"]*bg-base-300[^"]*focus:ring-2[^"]*"/
  )
  for (const [id, type] of [
    ["root_website", "url"],
    ["root_issued", "date"],
    ["root_count", "number"],
  ]) {
    assert.match(
      markup,
      new RegExp(
        `<input id="${id}"[^>]*class="[^"]*input-bordered[^"]*border-primary[^"]*bg-base-300[^"]*"[^>]*type="${type}"`
      )
    )
  }
  assert.match(
    markup,
    /<textarea[^>]*class="[^"]*textarea-bordered[^"]*w-full[^"]*border-primary[^"]*bg-base-300[^"]*focus:ring-2[^"]*"/
  )
  assert.match(markup, /placeholder="Enter a multiline description"/)
})

test("exported JSON Schema renderer owns the themed RJSF integration without studio context", () => {
  const markup = renderToStaticMarkup(
    <JsonSchemaForm
      schema={{
        type: "object",
        properties: {
          website: { type: "string", title: "Website", format: "uri" },
          access: { type: "string", title: "Access", enum: ["open", "restricted"] },
        },
        required: ["website"],
      }}
      uiSchema={{ "ui:submitButtonOptions": { norender: true } }}
      formData={{ website: "https://example.org", access: "open" }}
    />
  )

  assert.match(markup, /<input[^>]*type="url"/)
  assert.match(markup, /class="[^"]*input-bordered[^"]*bg-base-300[^"]*"/)
  assert.match(markup, /<select[^>]*class="[^"]*select-primary[^"]*"/)
  assert.doesNotMatch(markup, /type="submit"/)
})

test("Visual Builder and Live Preview share control surface and focus treatments", () => {
  assert.match(controlAppearanceClass, /border border-primary/)
  assert.match(controlAppearanceClass, /bg-base-300/)
  assert.match(controlAppearanceClass, /focus:ring-2 focus:ring-primary\/40/)

  for (const control of ["input", "textarea", "select"]) {
    assert.match(builderControlAppearanceClass, new RegExp(`\\[&_\\.${control}\\]:border`))
    assert.match(builderControlAppearanceClass, new RegExp(`\\[&_\\.${control}\\]:bg-base-300`))
    assert.match(
      builderControlAppearanceClass,
      new RegExp(`\\[&_\\.${control}:focus\\]:ring-primary/40`)
    )
  }
})

test("RJSF preview uses DaisyUI controls for every choice presentation", () => {
  const markup = renderToStaticMarkup(
    <ThemedForm
      schema={{
        type: "object",
        properties: {
          confirmed: { type: "boolean", title: "Confirmed" },
          access: {
            type: "string",
            title: "Access",
            enum: ["open", "restricted", "closed"],
          },
          priority: {
            type: "string",
            title: "Priority",
            enum: ["low", "normal", "high"],
          },
          topics: {
            type: "array",
            title: "Topics",
            items: { type: "string", enum: ["metadata", "validation"] },
            uniqueItems: true,
          },
        },
      }}
      uiSchema={{
        priority: { "ui:widget": "radio" },
        topics: { "ui:widget": "checkboxes" },
        "ui:submitButtonOptions": { norender: true },
      }}
      validator={validator}
    />
  )

  assert.match(
    markup,
    /<select[^>]*class="[^"]*select-bordered[^"]*select-primary[^"]*bg-base-300[^"]*"/
  )
  assert.match(markup, /<input[^>]*type="radio"[^>]*class="[^"]*radio radio-primary[^"]*"/)
  assert.match(
    markup,
    /<input[^>]*type="checkbox"[^>]*class="[^"]*checkbox checkbox-primary[^"]*"/
  )
  assert.match(markup, /role="radiogroup"/)
  assert.match(markup, /metadata/)
  assert.match(markup, /validation/)
})

test("RJSF string arrays use full-width fields and labeled DaisyUI actions", () => {
  const markup = renderToStaticMarkup(
    <ThemedForm
      schema={{
        type: "object",
        properties: {
          keywords: {
            type: "array",
            title: "List of text values",
            items: { type: "string", minLength: 1 },
            minItems: 1,
            maxItems: 5,
            uniqueItems: true,
          },
        },
      }}
      uiSchema={{
        keywords: { items: { "ui:placeholder": "Keyword" } },
        "ui:submitButtonOptions": { norender: true },
      }}
      validator={validator}
    />
  )

  assert.match(markup, /array-item[^" ]*[^>]*mb-3 flex w-full min-w-0 items-end gap-2/)
  assert.match(markup, /<input[^>]*id="root_keywords_0"[^>]*class="[^"]*w-full[^"]*"/)
  assert.match(markup, /<button[^>]*aria-label="Remove"[^>]*>.*<svg/)
  assert.match(markup, /<button[^>]*aria-label="Add"[^>]*>.*<svg.*Add item/)
  assert.match(markup, /<button[^>]*class="[^"]*h-11[^"]*min-h-11[^"]*"/)
  assert.match(markup, /<button[^>]*class="[^"]*ml-1[^"]*"[^>]*aria-label="Add"/)
  assert.doesNotMatch(markup, /glyphicon/)
})

test("inactive preview does not render a parseable intermediate Monaco widget", () => {
  const originalError = console.error
  console.error = () => undefined

  try {
    const markup = renderToStaticMarkup(
      <FormStudio
        initialSchema={{
          type: "object",
          properties: {
            description: { type: "string", title: "Description" },
          },
        }}
        initialUiSchema={{
          description: { "ui:widget": "hidde" },
        }}
      />
    )

    assert.match(markup, /data-studio-panel="builder"/)
    assert.match(markup, /FS_UNKNOWN_FIELD_READ_ONLY/)
    assert.doesNotMatch(markup, /data-studio-panel="preview"/)
  } finally {
    console.error = originalError
  }
})

test("Visual Builder shows an empty semantic root class control for a Core-only form", () => {
  const markup = renderToStaticMarkup(
    <SemanticFormStudio
      initialSchema={{
        type: "object",
        properties: { name: { type: "string", title: "Name" } },
      }}
    />
  )

  assert.match(markup, /Semantic root class \(optional\)/)
  assert.match(markup, /data-test="semantic-root-class-input"[^>]*value=""/)
  assert.doesNotMatch(markup, /Remove semantic component/)
})

test("Visual Builder reflects an existing root class and offers removal", () => {
  const markup = renderToStaticMarkup(
    <SemanticFormStudio
      initialSchema={{
        type: "object",
        properties: { name: { type: "string", title: "Name" } },
      }}
      initialSemantics={{
        root: { classIri: "https://example.org/Person" },
        bindings: [],
      }}
    />
  )

  assert.match(markup, /data-test="semantic-root-class-input"[^>]*value="https:\/\/example\.org\/Person"/)
  assert.match(markup, /Remove semantic component/)
})

test("Visual Builder surfaces generic diagnostics for an invalid Semantic V1 component", () => {
  const markup = renderToStaticMarkup(
    <SemanticFormStudio
      initialSchema={{
        type: "object",
        properties: { name: { type: "string", title: "Name" } },
      }}
      initialSemantics={{
        root: { classIri: "https://example.org/Person" },
        bindings: [
          { fieldPointer: "/properties/missing", predicate: "not-an-iri", valueKind: "literal" },
        ],
      }}
    />
  )

  assert.match(markup, /data-form-studio-diagnostics="true"/)
  assert.match(markup, /SEMANTIC_COMPONENT_INVALID/)
})

test("computeSemanticDiagnostics reports a dangling field pointer distinctly from a structurally invalid component", () => {
  const schema = { type: "object", properties: { name: { type: "string" } } }
  const semantics = {
    bindings: [
      { fieldPointer: "/properties/missing", predicate: "https://example.org/name", valueKind: "literal" as const },
    ],
  }

  const diagnostics = computeSemanticDiagnostics({ schema, semantics })

  assert.deepEqual(
    diagnostics.map((d) => d.code),
    ["SEMANTIC_FIELD_POINTER_UNRESOLVED"]
  )
  assert.equal(diagnostics[0].pointer, "/semantics/bindings/0/fieldPointer")
})

test("computeSemanticDiagnostics flags duplicate field pointers across bindings", () => {
  const schema = { type: "object", properties: { name: { type: "string" } } }
  const semantics = {
    bindings: [
      { fieldPointer: "/properties/name", predicate: "https://example.org/a", valueKind: "literal" as const },
      { fieldPointer: "/properties/name", predicate: "https://example.org/b", valueKind: "literal" as const },
    ],
  }

  const diagnostics = computeSemanticDiagnostics({ schema, semantics })

  // Only the later, duplicating binding is flagged; the first occurrence of
  // a field pointer is legitimate on its own.
  assert.deepEqual(
    diagnostics.map((d) => d.code),
    ["SEMANTIC_FIELD_POINTER_DUPLICATE"]
  )
  assert.equal(diagnostics[0].pointer, "/semantics/bindings/1/fieldPointer")
})

test("computeSemanticDiagnostics flags a node binding on a scalar field as type-incompatible", () => {
  const schema = { type: "object", properties: { name: { type: "string" } } }
  const semantics = {
    bindings: [
      { fieldPointer: "/properties/name", predicate: "https://example.org/name", valueKind: "node" as const },
    ],
  }

  const diagnostics = computeSemanticDiagnostics({ schema, semantics })

  assert.deepEqual(
    diagnostics.map((d) => d.code),
    ["SEMANTIC_BINDING_TYPE_INCOMPATIBLE"]
  )
})

test("computeSemanticDiagnostics enforces exact local value-mapping coverage and allowed values", () => {
  const schema = {
    type: "object",
    properties: { access: { type: "string", enum: ["open", "restricted"] } },
  }
  const semantics = {
    bindings: [
      {
        fieldPointer: "/properties/access",
        predicate: "https://example.org/access",
        valueKind: "iri" as const,
        valueMappings: [
          { value: "open", iri: "https://example.org/Open" },
          { value: "unknown", iri: "https://example.org/Unknown" },
        ],
      },
    ],
  }

  const diagnostics = computeSemanticDiagnostics({ schema, semantics })

  assert.deepEqual(
    diagnostics.map((d) => d.code).sort(),
    ["SEMANTIC_MAPPING_ENUM_UNCOVERED", "SEMANTIC_MAPPING_VALUE_NOT_ALLOWED"]
  )
})

test("computeSemanticDiagnostics requires an explicit parentNodePointer for a field nested under a node binding", () => {
  const schema = {
    type: "object",
    properties: {
      address: { type: "object", properties: { city: { type: "string" } } },
    },
  }
  const semantics = {
    bindings: [
      {
        fieldPointer: "/properties/address",
        predicate: "https://example.org/address",
        valueKind: "node" as const,
      },
      {
        fieldPointer: "/properties/address/properties/city",
        predicate: "https://example.org/city",
        valueKind: "literal" as const,
      },
    ],
  }

  const diagnostics = computeSemanticDiagnostics({ schema, semantics })

  assert.deepEqual(
    diagnostics.map((d) => d.code),
    ["SEMANTIC_PARENT_REQUIRED"]
  )
})

test("computeSemanticDiagnostics rejects a parentNodePointer that does not identify any binding", () => {
  const schema = {
    type: "object",
    properties: {
      address: { type: "object", properties: { city: { type: "string" } } },
    },
  }
  const semantics = {
    bindings: [
      {
        fieldPointer: "/properties/address",
        predicate: "https://example.org/address",
        valueKind: "node" as const,
      },
      {
        fieldPointer: "/properties/address/properties/city",
        predicate: "https://example.org/city",
        valueKind: "literal" as const,
        parentNodePointer: "/properties/missing",
      },
    ],
  }

  const diagnostics = computeSemanticDiagnostics({ schema, semantics })

  assert.deepEqual(
    diagnostics.map((d) => d.code),
    ["SEMANTIC_PARENT_NOT_FOUND"]
  )
})

test("computeSemanticDiagnostics detects a parentNodePointer cycle", () => {
  const schema = {
    type: "object",
    properties: {
      a: { type: "object", properties: {} },
      b: { type: "object", properties: {} },
    },
  }
  const semantics = {
    bindings: [
      {
        fieldPointer: "/properties/a",
        predicate: "https://example.org/a",
        valueKind: "node" as const,
        parentNodePointer: "/properties/b",
      },
      {
        fieldPointer: "/properties/b",
        predicate: "https://example.org/b",
        valueKind: "node" as const,
        parentNodePointer: "/properties/a",
      },
    ],
  }

  const diagnostics = computeSemanticDiagnostics({ schema, semantics })

  assert.ok(diagnostics.some((d) => d.code === "SEMANTIC_PARENT_CYCLE"))
})

test("a schema change that removes a bound field surfaces a dangling-pointer diagnostic without altering the stored binding (§8)", () => {
  const semantics = {
    bindings: [
      { fieldPointer: "/properties/name", predicate: "https://example.org/name", valueKind: "literal" as const },
    ],
  }

  const beforeMarkup = renderToStaticMarkup(
    <SemanticFormStudio
      initialSchema={{ type: "object", properties: { name: { type: "string", title: "Name" } } }}
      initialSemantics={semantics}
    />
  )
  assert.doesNotMatch(beforeMarkup, /data-form-studio-diagnostics="true"/)

  // Renaming the field is exactly what a schema edit produces: the schema
  // changes, but nothing in Form Studio's schema-editing code path ever
  // writes to `semantics`, so the very same, now-dangling binding — still
  // pointing at the field that no longer exists — is retained and
  // revalidated rather than silently dropped or guessed at (§8 points 1-3).
  const afterMarkup = renderToStaticMarkup(
    <SemanticFormStudio
      initialSchema={{ type: "object", properties: { fullName: { type: "string", title: "Full name" } } }}
      initialSemantics={semantics}
    />
  )
  assert.match(afterMarkup, /data-form-studio-diagnostics="true"/)
  assert.match(afterMarkup, /SEMANTIC_FIELD_POINTER_UNRESOLVED/)
  assert.match(afterMarkup, /\/properties\/name/)
})

test("an unrelated schema edit leaves valid semantics unchanged", () => {
  const semantics = {
    bindings: [
      { fieldPointer: "/properties/name", predicate: "https://example.org/name", valueKind: "literal" as const },
    ],
  }
  const schema = {
    type: "object",
    properties: {
      name: { type: "string", title: "Name" },
      note: { type: "string", title: "Note" },
    },
  }

  assert.deepEqual(computeSemanticDiagnostics({ schema, semantics }), [])

  const editedSchema = {
    ...schema,
    properties: { ...schema.properties, note: { ...schema.properties.note, title: "Notes" } },
  }
  assert.deepEqual(computeSemanticDiagnostics({ schema: editedSchema, semantics }), [])
})

test("createDebouncer defers a scheduled callback and restarts the wait on repeated calls instead of compounding it (§8)", () => {
  test.mock.timers.enable({ apis: ["setTimeout"] })
  try {
    const debouncer = createDebouncer(DEBOUNCE_MS)
    let calls = 0
    debouncer.schedule(() => calls++)

    test.mock.timers.tick(DEBOUNCE_MS - 1)
    assert.equal(calls, 0)

    // Scheduling again before the delay elapses resets the wait rather than
    // running the callback twice — the essence of a trailing debounce.
    debouncer.schedule(() => calls++)
    test.mock.timers.tick(DEBOUNCE_MS - 1)
    assert.equal(calls, 0)

    test.mock.timers.tick(1)
    assert.equal(calls, 1)
  } finally {
    test.mock.timers.reset()
  }
})

test("createDebouncer cancel discards a pending callback without running it", () => {
  test.mock.timers.enable({ apis: ["setTimeout"] })
  try {
    const debouncer = createDebouncer(DEBOUNCE_MS)
    let called = false
    debouncer.schedule(() => {
      called = true
    })
    debouncer.cancel()

    test.mock.timers.tick(DEBOUNCE_MS)
    assert.equal(called, false)
  } finally {
    test.mock.timers.reset()
  }
})

test("buildChildFieldPointer chains properties segments and escapes RFC 6901 special characters", () => {
  assert.equal(buildChildFieldPointer("", "name"), "/properties/name")
  assert.equal(buildChildFieldPointer("/properties/address", "city"), "/properties/address/properties/city")
  assert.equal(escapeJsonPointerToken("weird/name~x"), "weird~1name~0x")
})

test("generateElementComponentsFromSchemas computes nested RFC 6901 field pointers", () => {
  const outer = generateElementComponentsFromSchemas({
    schemaData: {
      type: "object",
      properties: {
        address: {
          type: "object",
          properties: { "weird/name~x": { type: "string", title: "Weird" } },
        },
      },
    },
    uiSchemaData: {},
    onChange: () => undefined,
    path: "root",
    fieldPointer: "",
    cardOpenState: {},
    setCardOpenState: () => undefined,
    allFormInputs: DEFAULT_FORM_INPUTS,
    categoryHash,
    Card,
    Section,
  })

  const sectionElement = outer[0] as any
  assert.equal(sectionElement.props.fieldPointer, "/properties/address")

  const inner = generateElementComponentsFromSchemas({
    schemaData: sectionElement.props.schema,
    uiSchemaData: sectionElement.props.uischema,
    onChange: () => undefined,
    path: sectionElement.props.path,
    fieldPointer: sectionElement.props.fieldPointer,
    cardOpenState: {},
    setCardOpenState: () => undefined,
    allFormInputs: DEFAULT_FORM_INPUTS,
    categoryHash,
    Card,
    Section,
  })

  const cardElement = inner[0] as any
  assert.equal(cardElement.props.componentProps.fieldPointer, "/properties/address/properties/weird~1name~0x")
})

test("field pointers traverse local $ref sections using the instance-bearing pointer, not a definitions pointer", () => {
  const schema = {
    type: "object",
    definitions: {
      email: { type: "string", title: "Contact email" },
      contact: {
        type: "object",
        title: "Contact details",
        properties: { email: { $ref: "#/definitions/email" } },
      },
    },
    properties: {
      contact: { $ref: "#/definitions/contact" },
    },
  }

  const outer = generateElementComponentsFromSchemas({
    schemaData: schema,
    uiSchemaData: {},
    onChange: () => undefined,
    path: "root",
    fieldPointer: "",
    definitionData: schema.definitions,
    cardOpenState: {},
    setCardOpenState: () => undefined,
    allFormInputs: DEFAULT_FORM_INPUTS,
    categoryHash,
    Card,
    Section,
  })

  const sectionElement = outer[0] as any
  assert.equal(sectionElement.props.fieldPointer, "/properties/contact")

  const inner = generateElementComponentsFromSchemas({
    schemaData: sectionElement.props.schema,
    uiSchemaData: sectionElement.props.uischema,
    onChange: () => undefined,
    path: sectionElement.props.path,
    fieldPointer: sectionElement.props.fieldPointer,
    cardOpenState: {},
    setCardOpenState: () => undefined,
    allFormInputs: DEFAULT_FORM_INPUTS,
    categoryHash,
    Card,
    Section,
  })

  const cardElement = inner[0] as any
  assert.equal(cardElement.props.componentProps.fieldPointer, "/properties/contact/properties/email")
})

function semanticContext(
  overrides: Partial<SemanticAuthoringContextValue> = {}
): SemanticAuthoringContextValue {
  return {
    rootSchema: { type: "object", properties: {} },
    semantics: undefined,
    onSemanticsChange: () => undefined,
    diagnostics: [],
    ...overrides,
  }
}

test("Semantic V1 field controls render nothing outside a registered provider", () => {
  const markup = renderToStaticMarkup(
    <FieldExtensionOutlet fieldPointer="/properties/name" />
  )
  assert.equal(markup, "")
})

test("SemanticBindingSection offers to add the first binding for an unbound field", () => {
  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider value={semanticContext()}>
      <SemanticBindingSection fieldPointer="/properties/name" />
    </SemanticAuthoringProvider>
  )

  assert.match(markup, /data-field-pointer="\/properties\/name"/)
  assert.match(markup, /Add semantic binding/)
  assert.doesNotMatch(markup, /Predicate IRI/)
})

test("SemanticBindingSection exposes literal-kind controls for an existing binding", () => {
  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider
      value={semanticContext({
        semantics: {
          bindings: [
            { fieldPointer: "/properties/name", predicate: "https://example.org/name", valueKind: "literal" },
          ],
        },
      })}
    >
      <SemanticBindingSection fieldPointer="/properties/name" />
    </SemanticAuthoringProvider>
  )

  assert.match(markup, /Predicate IRI/)
  assert.match(markup, /value="https:\/\/example\.org\/name"/)
  assert.match(markup, /Datatype IRI \(optional\)/)
  assert.match(markup, /Language tag \(optional\)/)
  assert.match(markup, /Remove binding/)
  assert.doesNotMatch(markup, /Class IRI/)
})

test("SemanticBindingSection disables the language input once a datatype IRI is set, and vice versa", () => {
  const withDatatype = renderToStaticMarkup(
    <SemanticAuthoringProvider
      value={semanticContext({
        semantics: {
          bindings: [
            {
              fieldPointer: "/properties/date",
              predicate: "https://example.org/date",
              valueKind: "literal",
              datatypeIri: "http://www.w3.org/2001/XMLSchema#date",
            },
          ],
        },
      })}
    >
      <SemanticBindingSection fieldPointer="/properties/date" />
    </SemanticAuthoringProvider>
  )
  assert.match(withDatatype, /value="http:\/\/www\.w3\.org\/2001\/XMLSchema#date"[^>]*\/>/)
  assert.match(withDatatype, /placeholder="en"[^>]*disabled=""/)

  const withLanguage = renderToStaticMarkup(
    <SemanticAuthoringProvider
      value={semanticContext({
        semantics: {
          bindings: [
            {
              fieldPointer: "/properties/title",
              predicate: "https://example.org/title",
              valueKind: "literal",
              language: "en",
            },
          ],
        },
      })}
    >
      <SemanticBindingSection fieldPointer="/properties/title" />
    </SemanticAuthoringProvider>
  )
  assert.match(withLanguage, /placeholder="http:\/\/www\.w3\.org\/2001\/XMLSchema#date"[^>]*disabled=""/)
})

test("SemanticBindingSection exposes IRI-kind mapping controls when mappings are set", () => {
  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider
      value={semanticContext({
        semantics: {
          bindings: [
            {
              fieldPointer: "/properties/status",
              predicate: "https://example.org/status",
              valueKind: "iri",
              valueMappings: [{ value: "active", iri: "https://example.org/Active" }],
            },
          ],
        },
      })}
    >
      <SemanticBindingSection fieldPointer="/properties/status" />
    </SemanticAuthoringProvider>
  )

  assert.match(markup, /IRI behavior/)
  assert.match(markup, /Value → IRI mappings/)
  assert.match(markup, /value="active"/)
  assert.match(markup, /value="https:\/\/example\.org\/Active"/)
})

test("SemanticBindingSection exposes node-kind class IRI control", () => {
  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider
      value={semanticContext({
        semantics: {
          bindings: [
            {
              fieldPointer: "/properties/address",
              predicate: "https://example.org/address",
              valueKind: "node",
              classIri: "https://example.org/Address",
            },
          ],
        },
      })}
    >
      <SemanticBindingSection fieldPointer="/properties/address" />
    </SemanticAuthoringProvider>
  )

  assert.match(markup, /Class IRI \(optional\)/)
  assert.match(markup, /value="https:\/\/example\.org\/Address"/)
})

test("SemanticBindingSection recommends the nearest containing node as an explicit, unforced choice", () => {
  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider
      value={semanticContext({
        semantics: {
          bindings: [
            {
              fieldPointer: "/properties/address",
              predicate: "https://example.org/address",
              valueKind: "node",
              classIri: "https://example.org/Address",
            },
            {
              fieldPointer: "/properties/address/properties/city",
              predicate: "https://example.org/city",
              valueKind: "literal",
            },
          ],
        },
      })}
    >
      <SemanticBindingSection fieldPointer="/properties/address/properties/city" />
    </SemanticAuthoringProvider>
  )

  assert.match(markup, /Parent node/)
  assert.match(markup, /<option value="\/properties\/address">\/properties\/address \(nearest\)<\/option>/)
  assert.match(markup, /Recommended: the nearest containing node is \/properties\/address/)
})

test("SemanticBindingSection scopes diagnostics to the field's own binding index", () => {
  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider
      value={semanticContext({
        semantics: {
          bindings: [
            { fieldPointer: "/properties/a", predicate: "not-an-iri", valueKind: "literal" },
            { fieldPointer: "/properties/b", predicate: "https://example.org/b", valueKind: "literal" },
          ],
        },
        diagnostics: [
          {
            stage: "structural",
            code: "SEMANTIC_COMPONENT_INVALID",
            pointer: "/semantics/bindings/0/predicate",
            message: "must match pattern for an absolute IRI",
          },
        ],
      })}
    >
      <SemanticBindingSection fieldPointer="/properties/b" />
    </SemanticAuthoringProvider>
  )

  assert.doesNotMatch(markup, /SEMANTIC_COMPONENT_INVALID/)
})

test("CardModal exposes the semantic binding section when a field pointer and context are present", () => {
  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider value={semanticContext()}>
      <CardModal
        componentProps={{ name: "name", fieldPointer: "/properties/name" } as any}
        isOpen={true}
        onClose={() => undefined}
        onChange={() => undefined}
        TypeSpecificParameters={() => null}
      />
    </SemanticAuthoringProvider>
  )

  assert.match(markup, /data-semantic-binding-section="true"/)
  assert.match(markup, /Add semantic binding/)
})

test("CardModal omits the semantic binding section without a field pointer", () => {
  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider value={semanticContext()}>
      <CardModal
        componentProps={{ name: "name" } as any}
        isOpen={true}
        onClose={() => undefined}
        onChange={() => undefined}
        TypeSpecificParameters={() => null}
      />
    </SemanticAuthoringProvider>
  )

  assert.doesNotMatch(markup, /data-semantic-binding-section="true"/)
})

test("CompatibilityCard exposes a semantic binding section for its own field pointer when semantics are enabled", () => {
  const compatibility = classifyField({ type: "array", items: { type: "object" } })
  assert.notEqual(compatibility.kind, "editable")
  if (compatibility.kind === "editable") return

  const markup = renderToStaticMarkup(
    <SemanticAuthoringProvider value={semanticContext()}>
      <CompatibilityCard
        name="contributors"
        title="Contributors"
        compatibility={compatibility}
        fieldPointer="/properties/contributors"
      />
    </SemanticAuthoringProvider>
  )

  assert.match(markup, /data-semantic-binding-section="true"/)
  assert.match(markup, /Add semantic binding/)
})

test("panel render failures produce an inline recovery diagnostic", () => {
  const markup = renderToStaticMarkup(
    <StudioPanelErrorFallback
      panelName="Live Preview"
      error={new Error("No widget 'hidde' for type 'string'")}
    />
  )

  assert.match(markup, /data-studio-panel-error="true"/)
  assert.match(markup, /flex min-w-0 flex-col items-start gap-2/)
  assert.match(markup, /Live Preview unavailable/)
  assert.match(markup, /No widget &#x27;hidde&#x27;/)
  assert.match(markup, /Use the JSON Editor/)
})

test("generated string arrays use the constrained text-list editor without a fixed card body", () => {
  const components = generateElementComponentsFromSchemas({
    schemaData: {
      type: "object",
      properties: {
        keywords: {
          type: "array",
          title: "Keywords",
          items: { type: "string", minLength: 1 },
          minItems: 1,
          maxItems: 5,
          uniqueItems: true,
        },
      },
    },
    uiSchemaData: {},
    onChange: () => undefined,
    path: "root",
    cardOpenState: { root_keywords: true },
    setCardOpenState: () => undefined,
    allFormInputs: DEFAULT_FORM_INPUTS,
    categoryHash,
    Card,
    Section,
  })
  const markup = renderToStaticMarkup(<>{components}</>)

  assert.doesNotMatch(markup, /Repeatable list of text values/)
  assert.doesNotMatch(markup, /FS_SCALAR_ARRAY_READ_ONLY/)
})

test("string-array constraints expose a fixed text item type", () => {
  const markup = renderToStaticMarkup(
    <StringArrayParameterInputs
      parameters={{
        name: "keywords",
        type: "array",
        items: { type: "string", minLength: 1 },
        minItems: 1,
        maxItems: 5,
        uniqueItems: true,
      }}
      onChange={() => undefined}
    />
  )

  assert.match(markup, /data-string-array-constraints="true"/)
  assert.match(markup, /Text \(string\)/)
  assert.match(markup, /Minimum items/)
  assert.match(markup, /Require unique items/)
  assert.doesNotMatch(markup, /<select\b/)
})

test("string-array constraint updates reject invalid values and preserve item details", () => {
  const parameters = {
    name: "keywords",
    type: "array",
    minItems: 1,
    items: { type: "string", minLength: 1, format: "uri", "x-note": "opaque" },
  }

  assert.equal(updateArrayIntegerConstraint(parameters, "minItems", "0").minItems, 0)
  assert.strictEqual(updateArrayIntegerConstraint(parameters, "minItems", "1.5"), parameters)
  const rangeConstrainedParameters = { ...parameters, maxItems: 3 }
  assert.strictEqual(
    updateArrayIntegerConstraint(rangeConstrainedParameters, "minItems", "4"),
    rangeConstrainedParameters
  )
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      updateArrayIntegerConstraint(parameters, "minItems", ""),
      "minItems"
    ),
    false
  )

  const updatedItems = updateItemConstraint(parameters, "maxLength", "20").items
  assert.deepEqual(updatedItems, {
    type: "string",
    minLength: 1,
    maxLength: 20,
    format: "uri",
    "x-note": "opaque",
  })
})

test("string-array visual edits preserve unedited array and item constraints", () => {
  const fixture = fixtures.find(({ id }) => id === "scalar-array")
  assert.ok(fixture)

  const result = roundTripWithElementEdit(fixture.schema, fixture.uiSchema, (elements) => {
    const keywords = elements.find(({ name }) => name === "keywords")
    assert.ok(keywords?.dataOptions)
    keywords.dataOptions = {
      ...keywords.dataOptions,
      minItems: 2,
      items: {
        ...keywords.dataOptions.items,
        minLength: 2,
        pattern: "^[A-Za-z]+$",
      },
    }
  })

  assert.deepEqual(result.outputSchema.properties.keywords, {
    type: "array",
    items: { type: "string", minLength: 2, pattern: "^[A-Za-z]+$" },
    minItems: 2,
    maxItems: 5,
    uniqueItems: true,
  })
})

test("conditional-only UI paths survive a no-op visual round trip", () => {
  const fixture = fixtures.find(({ id }) => id === "conditional-if-then")
  assert.ok(fixture)

  const result = roundTrip(fixture.schema, fixture.uiSchema)

  assert.deepEqual(result.outputSchema?.allOf, fixture.schema.allOf)
  assert.deepEqual(result.outputUiSchema, fixture.uiSchema)
})

test("reading schemas into the visual model does not annotate the source documents", () => {
  const schema = {
    type: "object",
    properties: { title: { type: "string" } },
  }
  const uiSchema = {
    title: { "ui:placeholder": "Title" },
  }
  const expectedSchema = clone(schema)
  const expectedUiSchema = clone(uiSchema)

  generateElementPropsFromSchemas({ schema, uischema: uiSchema, categoryHash })

  assert.deepEqual(schema, expectedSchema)
  assert.deepEqual(uiSchema, expectedUiSchema)
})

test("conditional schemas and UI survive an unrelated supported-field edit", () => {
  const fixture = fixtures.find(({ id }) => id === "conditional-if-then")
  assert.ok(fixture)

  const result = roundTripWithElementEdit(fixture.schema, fixture.uiSchema, (elements) => {
    const access = elements.find(({ name }) => name === "access")
    assert.ok(access?.dataOptions)
    access.dataOptions = { ...access.dataOptions, title: "Access level" }
  })

  assert.equal(result.outputSchema.properties.access.title, "Access level")
  assert.deepEqual(result.outputSchema.allOf, fixture.schema.allOf)
  assert.deepEqual(result.outputUiSchema, fixture.uiSchema)
})

test("visual reordering retains conditional-only ui:order entries in place", () => {
  const schema = {
    type: "object",
    properties: {
      first: { type: "string" },
      second: { type: "string" },
    },
    allOf: [
      {
        if: { properties: { first: { const: "show" } } },
        then: { properties: { conditionalOnly: { type: "string" } } },
      },
    ],
  }
  const uiSchema = {
    "ui:order": ["first", "conditionalOnly", "second"],
    conditionalOnly: { "ui:widget": "textarea" },
  }

  const result = roundTripWithElementEdit(schema, uiSchema, (elements) => {
    elements.reverse()
  })

  assert.deepEqual(result.outputUiSchema, {
    "ui:order": ["second", "conditionalOnly", "first"],
    conditionalOnly: { "ui:widget": "textarea" },
  })
})

test("supported UI edits preserve opaque root UI options without adding synthetic order", () => {
  const schema = {
    type: "object",
    properties: { title: { type: "string" } },
  }
  const uiSchema = {
    title: { "ui:placeholder": "Original placeholder" },
    "ui:submitButtonOptions": { norender: true },
  }

  const result = roundTripWithElementEdit(schema, uiSchema, (elements) => {
    const title = elements.find(({ name }) => name === "title")
    assert.ok(title?.uiOptions)
    title.uiOptions = { ...title.uiOptions, "ui:placeholder": "Updated placeholder" }
  })

  assert.deepEqual(result.outputUiSchema, {
    title: { "ui:placeholder": "Updated placeholder" },
    "ui:submitButtonOptions": { norender: true },
  })
})

test("draft-07 dependencies remain byte-for-byte unchanged after an unrelated edit", () => {
  const fixture = fixtures.find(({ id }) => id === "legacy-dependencies")
  assert.ok(fixture)

  const result = roundTripWithElementEdit(fixture.schema, fixture.uiSchema, (elements) => {
    const kind = elements.find(({ name }) => name === "kind")
    assert.ok(kind?.dataOptions)
    kind.dataOptions = { ...kind.dataOptions, title: "Kind" }
  })

  assert.equal(result.outputSchema.properties.kind.title, "Kind")
  assert.deepEqual(result.outputSchema.dependencies, fixture.schema.dependencies)
})

test("supported dependency edits change only the represented dependency value", () => {
  const fixture = fixtures.find(({ id }) => id === "legacy-dependencies")
  assert.ok(fixture)

  const result = roundTripWithElementEdit(fixture.schema, fixture.uiSchema, (elements) => {
    const details = elements.find(({ name }) => name === "details")
    assert.ok(details?.dataOptions)
    details.dataOptions = { ...details.dataOptions, title: "Extended details" }
  })

  const alternatives = result.outputSchema.dependencies.kind.oneOf
  assert.deepEqual(alternatives[0], fixture.schema.dependencies.kind.oneOf[0])
  assert.equal(alternatives[1].properties.details.title, "Extended details")
  assert.equal(alternatives[1].properties.details.minLength, 1)
  assert.deepEqual(alternatives[1].required, ["details"])
})

test("legacy textarea schema and UI intent survive an unrelated supported-field edit", () => {
  const legacyTextarea = {
    type: "string",
    format: "textarea",
    title: "Description",
    minLength: 3,
    default: "Existing text",
  }
  const legacyTextareaUi = {
    "ui:placeholder": "Describe the resource",
    "ui:options": { rows: 8 },
  }
  const result = roundTripWithElementEdit(
    {
      type: "object",
      properties: {
        name: { type: "string", title: "Name" },
        description: legacyTextarea,
      },
    },
    {
      description: legacyTextareaUi,
      "ui:order": ["name", "description"],
    },
    (elements) => {
      const name = elements.find((element) => element.name === "name")
      assert.ok(name?.dataOptions)
      name.dataOptions.title = "Resource name"
    }
  )

  assert.deepEqual(result.outputSchema.properties.description, legacyTextarea)
  assert.deepEqual(result.outputUiSchema.description, legacyTextareaUi)
  assert.deepEqual(result.outputUiSchema["ui:order"], ["name", "description"])
})

for (const fixture of fixtures) {
  test(`RJSF 6 renders ${fixture.id} with its expected presentation status`, () => {
    const originalError = console.error
    const originalWarn = console.warn
    console.error = () => undefined
    console.warn = () => undefined

    try {
      const markup = renderToStaticMarkup(
        <ThemedForm
          schema={fixture.schema}
          uiSchema={{
            ...fixture.uiSchema,
            "ui:submitButtonOptions": { norender: true },
          }}
          validator={validator}
        />
      )
      assert.ok(markup.length > 0)

      const rendersTextarea = markup.includes("<textarea")
      const expectedStatus: Status =
        fixture.id === "legacy-textarea-format" && !rendersTextarea ? "lossy" : "pass"
      assert.equal(expectedStatus, fixture.expectations.rjsfRendering.status)

      if (fixture.id === "textarea-widget") assert.equal(rendersTextarea, true)
    } finally {
      console.error = originalError
      console.warn = originalWarn
    }
  })

  test(`Form Studio round trip classifies ${fixture.id}`, () => {
    const originalError = console.error
    console.error = () => undefined
    try {
      const result = roundTrip(fixture.schema, fixture.uiSchema)
      assert.equal(
        result.status,
        fixture.expectations.formStudioAuthoring.status,
        JSON.stringify(
          {
            input: { schema: fixture.schema, uiSchema: fixture.uiSchema },
            output: { schema: result.outputSchema, uiSchema: result.outputUiSchema },
          },
          null,
          2
        )
      )
    } finally {
      console.error = originalError
    }
  })

  if (fixture.expectations.formStudioPreservation) {
    test(`Form Studio round trip records ${fixture.id} preservation independently`, () => {
      const originalError = console.error
      console.error = () => undefined
      try {
        const result = roundTrip(fixture.schema, fixture.uiSchema)
        assert.equal(
          result.preservationStatus,
          fixture.expectations.formStudioPreservation?.status,
          JSON.stringify(
            {
              input: { schema: fixture.schema, uiSchema: fixture.uiSchema },
              output: { schema: result.outputSchema, uiSchema: result.outputUiSchema },
            },
            null,
            2
          )
        )
      } finally {
        console.error = originalError
      }
    })
  }
}
