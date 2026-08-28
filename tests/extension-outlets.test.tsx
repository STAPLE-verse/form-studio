// @vitest-environment jsdom

import React, { useState } from "react"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import CardModal from "../src/CardModal"
import CompatibilityCard from "../src/CompatibilityCard"
import FormBuilder from "../src/FormBuilder"
import {
  FormStudioProvider,
  useFormStudio,
} from "../src/FormStudioContext"
import JsonEditor from "../src/JsonEditor"
import { DEBOUNCE_MS } from "../src/debounce"
import FormStudioDiagnostics from "../src/extensions/diagnostics"
import {
  defineFormStudioExtension,
  type ExtensionDocumentProps,
  type FieldExtensionControlProps,
  type FormExtensionControlProps,
  type FormStudioDiagnostic,
  type FormStudioValidationResult,
} from "../src/extensions/types"

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange }: { value?: string; onChange?: (value?: string) => void }) => (
    <textarea
      data-testid="monaco-json-editor"
      value={value ?? ""}
      onChange={(event) => onChange?.(event.currentTarget.value)}
    />
  ),
}))

vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Droppable: ({ children }: { children: (provided: object) => React.ReactNode }) => (
    <>{children({ innerRef: () => undefined, droppableProps: {}, placeholder: null })}</>
  ),
  Draggable: ({
    children,
  }: {
    children: (provided: object, snapshot: object) => React.ReactNode
  }) => (
    <>
      {children(
        { innerRef: () => undefined, draggableProps: { style: {} }, dragHandleProps: {} },
        { isDragging: false, isDropAnimating: false }
      )}
    </>
  ),
}))

interface TestExtensionValue {
  status: "valid" | "invalid"
  revision: number
}

const validValue: TestExtensionValue = { status: "valid", revision: 0 }

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function TestFormControls({
  extension,
  value,
  setValue,
}: FormExtensionControlProps<TestExtensionValue>) {
  return (
    <section data-test-form-slot={extension.id}>
      <span>{extension.label} form controls</span>
      <output data-testid={`${extension.id}-form-value`}>{JSON.stringify(value)}</output>
      <button
        type="button"
        onClick={() => setValue({ status: "invalid", revision: (value?.revision ?? 0) + 1 })}
      >
        Invalidate {extension.id}
      </button>
    </section>
  )
}

function TestFieldControls({
  extension,
  field,
  diagnostics,
}: FieldExtensionControlProps<TestExtensionValue>) {
  return (
    <section data-test-field-slot={extension.id}>
      <span>{field.fieldPointer}</span>
      <span data-field-schema-title={extension.id}>
        {(field.fieldSchema as { title?: string }).title}
      </span>
      <span data-field-compatibility={extension.id}>{field.compatibility?.kind ?? "editable"}</span>
      <span data-field-diagnostics={extension.id}>
        {diagnostics.map((diagnostic) => diagnostic.code).join(",")}
      </span>
    </section>
  )
}

function TestJsonDocument({ extension, value }: ExtensionDocumentProps<TestExtensionValue>) {
  return (
    <section data-test-json-slot={extension.id}>
      {extension.label} JSON document {JSON.stringify(value)}
    </section>
  )
}

function diagnosticFor(
  id: string,
  severity: "warning" | "error" = "error",
  blocksCommit = true
): FormStudioDiagnostic {
  return {
    source: "extension-supplied-source-is-normalized",
    sourceLabel: "Extension-supplied label is normalized",
    code: `${id.toUpperCase()}_INVALID`,
    pointer: `/extensions/${id}`,
    stage: "test",
    message: `${id} is invalid`,
    severity,
    blocksCommit,
  }
}

function createTestExtension(
  id: string,
  label: string,
  validate = ({ value }: { value: TestExtensionValue | undefined }) =>
    value?.status === "invalid" ? [diagnosticFor(id)] : []
) {
  return defineFormStudioExtension<TestExtensionValue>({
    id,
    label,
    validate,
    slots: {
      FormControls: TestFormControls,
      FieldControls: TestFieldControls,
      JsonDocument: TestJsonDocument,
    },
  })
}

function ConnectedFormBuilder({ showFormHead = true }: { showFormHead?: boolean }) {
  const { state, setSchema, setUiSchema } = useFormStudio()
  return (
    <FormBuilder
      schema={JSON.stringify(state.schema)}
      uiSchema={JSON.stringify(state.uiSchema)}
      onChange={(schema, uiSchema) => {
        setSchema(JSON.parse(schema))
        setUiSchema(JSON.parse(uiSchema))
      }}
      mods={{ showFormHead }}
    />
  )
}

function OpenCardModal() {
  return (
    <CardModal
      componentProps={{
        name: "name",
        required: false,
        dependents: [],
        neighborNames: [],
        schema: { type: "string", title: "Name" },
        type: "string",
        "ui:column": "",
        fieldPointer: "/properties/name",
      }}
      isOpen
      onClose={() => undefined}
      onChange={() => undefined}
      TypeSpecificParameters={() => null}
    />
  )
}

function ValidationHarness({ extensionId }: { extensionId: string }) {
  const { extensions, setExtensionValue, extensionDiagnostics, validateForCommit } = useFormStudio()
  const extension = extensions.find((candidate) => candidate.id === extensionId)!
  const [commitResult, setCommitResult] = useState<FormStudioValidationResult | null>(null)

  return (
    <>
      <output data-testid="live-extension-diagnostics">
        {extensionDiagnostics.map((diagnostic) => diagnostic.code).join(",")}
      </output>
      <output data-testid="commit-validation-result">{JSON.stringify(commitResult)}</output>
      <button
        type="button"
        onClick={() => setExtensionValue(extension, { status: "invalid", revision: 1 })}
      >
        Set invalid extension value
      </button>
      <button
        type="button"
        onClick={() => setExtensionValue(extension, { status: "invalid", revision: 2 })}
      >
        Set newer invalid extension value
      </button>
      <button type="button" onClick={() => setCommitResult(validateForCommit())}>
        Validate current state for commit
      </button>
    </>
  )
}

function ThrowingSlot({ slot }: { slot: string }): never {
  throw new Error(`${slot} slot failed`)
}

describe("Phase 2 generic extension outlets", () => {
  test("form, compatibility-field, and JSON contributions render in registry order", () => {
    const first = createTestExtension("test.first", "First")
    const second = createTestExtension("test.second", "Second")
    const schema = {
      type: "object",
      properties: { name: { type: "string", title: "Name" } },
    }
    const { container } = render(
      <FormStudioProvider
        extensions={[second, first]}
        initialSchema={schema}
        initialExtensionValues={{ [first.id]: validValue, [second.id]: validValue }}
      >
        <ConnectedFormBuilder showFormHead={false} />
        <CompatibilityCard
          name="name"
          title="Name"
          compatibility={{
            kind: "readOnly",
            code: "FS_UNKNOWN_FIELD_READ_ONLY",
            message: "Test read-only field",
          }}
          fieldPointer="/properties/name"
        />
        <JsonEditor />
      </FormStudioProvider>
    )

    expect(container.querySelector('[data-test="form-head"]')).toBeNull()
    expect(
      Array.from(container.querySelectorAll("[data-test-form-slot]"), (node) =>
        node.getAttribute("data-test-form-slot")
      )
    ).toEqual(["test.second", "test.first"])
    expect(
      Array.from(container.querySelectorAll("[data-test-field-slot]"), (node) =>
        node.getAttribute("data-test-field-slot")
      )
    ).toEqual(["test.second", "test.first"])
    expect(
      Array.from(container.querySelectorAll("[data-test-json-slot]"), (node) =>
        node.getAttribute("data-test-json-slot")
      )
    ).toEqual(["test.second", "test.first"])
    const baseDocuments = container.querySelectorAll('[data-testid="monaco-json-editor"]')
    const firstExtensionDocument = container.querySelector('[data-test-json-slot="test.second"]')
    expect(baseDocuments).toHaveLength(2)
    expect(container.querySelector('[data-json-editor-document="semantics"]')).toBeNull()
    expect(
      baseDocuments[1] && firstExtensionDocument
        ? baseDocuments[1].compareDocumentPosition(firstExtensionDocument) &
            Node.DOCUMENT_POSITION_FOLLOWING
        : 0
    ).not.toBe(0)
    expect(container.querySelector('[data-field-schema-title="test.second"]')?.textContent).toBe(
      "Name"
    )
    expect(container.querySelector('[data-field-compatibility="test.second"]')?.textContent).toBe(
      "readOnly"
    )

    fireEvent.click(screen.getByRole("button", { name: "Invalidate test.second" }))
    expect(screen.getByTestId("test.second-form-value").textContent).toBe(
      JSON.stringify({ status: "invalid", revision: 1 })
    )
    expect(container.querySelector('[data-test-json-slot="test.second"]')?.textContent).toContain(
      JSON.stringify({ status: "invalid", revision: 1 })
    )
  })

  test("editable field controls render in CardModal's generic field outlet", () => {
    const extension = createTestExtension("test.field", "Field")
    const { container } = render(
      <FormStudioProvider
        extensions={[extension]}
        initialSchema={{
          type: "object",
          properties: { name: { type: "string", title: "Name" } },
        }}
      >
        <OpenCardModal />
      </FormStudioProvider>
    )

    expect(container.querySelector('[data-test-field-slot="test.field"]')).not.toBeNull()
    expect(container.querySelector('[data-field-compatibility="test.field"]')?.textContent).toBe(
      "editable"
    )
  })

  test("no provider or an empty registry contributes no generic UI", () => {
    const { container: standalone } = render(
      <FormBuilder schema="{}" uiSchema="{}" onChange={() => undefined} />
    )
    expect(standalone.querySelector("[data-form-studio-extension-outlet]")).toBeNull()
    cleanup()

    const { container: emptyProvider } = render(
      <FormStudioProvider>
        <ConnectedFormBuilder />
        <OpenCardModal />
        <JsonEditor />
      </FormStudioProvider>
    )
    expect(emptyProvider.querySelector("[data-form-studio-extension-outlet]")).toBeNull()
    expect(emptyProvider.querySelector("[data-test-json-slot]")).toBeNull()
  })

  test("render failures are isolated independently in every generic outlet", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const extension = defineFormStudioExtension<TestExtensionValue>({
      id: "test.throwing",
      label: "Throwing extension",
      validate: () => [],
      slots: {
        FormControls: () => <ThrowingSlot slot="form" />,
        FieldControls: () => <ThrowingSlot slot="field" />,
        JsonDocument: () => <ThrowingSlot slot="json-document" />,
      },
    })
    const { container } = render(
      <FormStudioProvider
        extensions={[extension]}
        initialSchema={{
          type: "object",
          properties: { name: { type: "string", title: "Name" } },
        }}
      >
        <ConnectedFormBuilder />
        <OpenCardModal />
        <JsonEditor />
      </FormStudioProvider>
    )

    expect(
      Array.from(container.querySelectorAll('[data-extension-slot-error="test.throwing"]'), (node) =>
        node.getAttribute("data-extension-slot")
      )
    ).toEqual(["form", "field", "json-document"])
    expect(screen.getByText("Data Schema")).not.toBeNull()
  })
})

describe("Phase 2 extension diagnostics and commit validation", () => {
  test("diagnostics are grouped in registry order with normalized source metadata", () => {
    const first = createTestExtension("test.first", "First", () => [
      diagnosticFor("test.first", "error", true),
    ])
    const second = createTestExtension("test.second", "Second", () => [
      diagnosticFor("test.second", "warning", false),
    ])
    const { container } = render(
      <FormStudioProvider extensions={[second, first]}>
        <FormStudioDiagnostics />
      </FormStudioProvider>
    )

    expect(
      Array.from(container.querySelectorAll("[data-diagnostic-source]"), (node) =>
        node.getAttribute("data-diagnostic-source")
      )
    ).toEqual(["test.second", "test.first"])
    expect(container.querySelector('[data-diagnostic-source="test.second"]')?.textContent).toContain(
      "Second"
    )
    expect(container.querySelector('[data-diagnostic-source="test.first"]')?.textContent).toContain(
      "Resolve the blocking issues"
    )
    expect(container.querySelector('[data-diagnostic-code="TEST.SECOND_INVALID"]')).not.toBeNull()
  })

  test("live validation is debounced once per extension and commit validation uses current state", async () => {
    vi.useFakeTimers()
    const firstValidate = vi.fn(({ value }: { value: TestExtensionValue | undefined }) =>
      value?.status === "invalid" ? [diagnosticFor("test.first")] : []
    )
    const secondValidate = vi.fn(() => [] as FormStudioDiagnostic[])
    const first = createTestExtension("test.first", "First", firstValidate)
    const second = createTestExtension("test.second", "Second", secondValidate)

    render(
      <FormStudioProvider extensions={[first, second]}>
        <ValidationHarness extensionId={first.id} />
        <OpenCardModal />
        <FormStudioDiagnostics />
      </FormStudioProvider>
    )

    expect(firstValidate).toHaveBeenCalledTimes(1)
    expect(secondValidate).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "Set invalid extension value" }))
    fireEvent.click(screen.getByRole("button", { name: "Set newer invalid extension value" }))
    expect(screen.getByTestId("live-extension-diagnostics").textContent).toBe("")
    expect(firstValidate).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: "Validate current state for commit" }))
    expect(firstValidate).toHaveBeenCalledTimes(2)
    expect(secondValidate).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("commit-validation-result").textContent).toContain(
      '"blocked":true'
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
    })
    expect(firstValidate).toHaveBeenCalledTimes(3)
    expect(secondValidate).toHaveBeenCalledTimes(3)
    expect(screen.getByTestId("live-extension-diagnostics").textContent).toBe(
      "TEST.FIRST_INVALID"
    )
    expect(document.querySelector('[data-field-diagnostics="test.first"]')?.textContent).toBe(
      "TEST.FIRST_INVALID"
    )
  })

  test("validator failures become blocking generic diagnostics", () => {
    const extension = createTestExtension("test.broken", "Broken", () => {
      throw new Error("validator exploded")
    })
    const { container } = render(
      <FormStudioProvider extensions={[extension]}>
        <FormStudioDiagnostics />
      </FormStudioProvider>
    )

    expect(container.querySelector('[data-diagnostic-code="FS_EXTENSION_VALIDATION_FAILED"]')).not.toBeNull()
    expect(container.textContent).toContain("validator exploded")
    expect(container.textContent).toContain("Resolve the blocking issues")
  })
})
