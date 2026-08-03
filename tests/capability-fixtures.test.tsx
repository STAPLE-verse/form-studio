import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { renderToStaticMarkup } from "react-dom/server"
import { withTheme } from "@rjsf/core"
import validator from "@rjsf/validator-ajv8"
import DaisyTheme from "../src/DaisyTheme"
import DEFAULT_FORM_INPUTS from "../src/defaults/defaultFormInputs"
import {
  generateCategoryHash,
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
    .filter(
      (element) =>
        element.propType === "card" &&
        element.dataOptions?.category === "shortAnswer" &&
        (element.dataOptions?.type !== "string" ||
          (element.dataOptions?.readOnly === true && element.uiOptions?.["ui:widget"] === "hidden"))
    )
    .map((element) => element.name)

  const misclassifiedTextareaFields = elements
    .filter(
      (element) =>
        element.propType === "card" &&
        element.dataOptions?.format === "textarea" &&
        element.uiOptions?.["ui:widget"] !== "textarea"
    )
    .map((element) => element.name)

  const status: Status = unsupportedVisualFields.length
    ? "unsupported"
    : !equivalent || misclassifiedTextareaFields.length
      ? "lossy"
      : "pass"

  return { status, preservationStatus, outputSchema, outputUiSchema }
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
