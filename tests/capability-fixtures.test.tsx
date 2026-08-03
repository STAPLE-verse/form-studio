import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { renderToStaticMarkup } from "react-dom/server"
import { withTheme } from "@rjsf/core"
import validator from "@rjsf/validator-ajv8"
import Card from "../src/Card"
import DaisyTheme from "../src/DaisyTheme"
import CompatibilityCard from "../src/CompatibilityCard"
import Section from "../src/Section"
import DEFAULT_FORM_INPUTS from "../src/defaults/defaultFormInputs"
import {
  classifyCard,
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

  const status: Status = unsupportedVisualFields.length || unsupportedRootComposition
    ? "unsupported"
    : !equivalent || migrationFields.length
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

  assert.equal(await readVersion("package.json"), "0.1.0")
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
  assert.equal(classifyField({ type: "array", items: { type: "string" } }).kind, "readOnly")
  assert.equal(classifyField({ oneOf: [{ const: "a" }, { const: "b" }] }).kind, "readOnly")
  assert.equal(
    classifyField({ type: "string", readOnly: true }, { "ui:widget": "hidden" }).kind,
    "readOnly"
  )
  assert.equal(classifyField({ type: "string", format: "unknown-format" }).kind, "readOnly")
  assert.equal(classifyField({ type: "string", format: "textarea" }).kind, "migration")
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
