// @vitest-environment jsdom

import React from "react"
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import type { SemanticV1Component } from "@staple-verse/marker-template-runtime"
import FormBuilder from "../src/FormBuilder"
import { FormStudioUI } from "../src/FormStudio"
import {
  FormStudioProvider,
  useFormStudio,
  type FormStudioState,
} from "../src/FormStudioContext"
import JsonEditor from "../src/JsonEditor"
import SemanticDiagnosticsSummary from "../src/semantic-v1/SemanticDiagnosticsSummary"
import { semanticV1Extension } from "../src/semantic-v1/extension"
import {
  getSemanticV1Value,
  useSemanticV1Value,
} from "../src/semantic-v1/accessors"
import { DEBOUNCE_MS } from "../src/debounce"

const runtimeValidationSpy = vi.hoisted(() => vi.fn())

vi.mock("@staple-verse/marker-template-runtime", async (importOriginal) => {
  const runtime = await importOriginal<
    typeof import("@staple-verse/marker-template-runtime")
  >()
  return {
    ...runtime,
    validateSemanticV1: (...args: Parameters<typeof runtime.validateSemanticV1>) => {
      runtimeValidationSpy(...args)
      return runtime.validateSemanticV1(...args)
    },
  }
})

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

const schemaWithName = {
  type: "object",
  properties: { name: { type: "string", title: "Name" } },
}

const validSemantics: SemanticV1Component = {
  root: { classIri: "https://example.org/Person" },
  bindings: [
    {
      fieldPointer: "/properties/name",
      predicate: "https://example.org/name",
      valueKind: "literal",
    },
  ],
}

const invalidSemantics: SemanticV1Component = {
  ...validSemantics,
  bindings: [{ ...validSemantics.bindings[0], predicate: "not-an-iri" }],
}

const SEMANTIC_EXTENSIONS = [semanticV1Extension] as const

function SemanticProvider({
  initialSchema,
  initialSemantics,
  children,
}: {
  initialSchema?: object
  initialSemantics?: SemanticV1Component | string
  children: React.ReactNode
}) {
  const parsedSemantics =
    typeof initialSemantics === "string"
      ? (JSON.parse(initialSemantics) as SemanticV1Component)
      : initialSemantics
  return (
    <FormStudioProvider
      extensions={SEMANTIC_EXTENSIONS}
      initialSchema={initialSchema}
      initialExtensionValues={
        parsedSemantics === undefined
          ? {}
          : { [semanticV1Extension.id]: parsedSemantics }
      }
    >
      {children}
    </FormStudioProvider>
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  runtimeValidationSpy.mockClear()
})

function StateProbe() {
  const { state, setSchema } = useFormStudio()
  const { value: semantics, setValue: setSemantics } = useSemanticV1Value()

  return (
    <>
      <output data-testid="semantic-state">
        {semantics === undefined ? "absent" : JSON.stringify(semantics)}
      </output>
      <output data-testid="semantic-descriptor-state">
        {getSemanticV1Value(state) === undefined
          ? "absent"
          : JSON.stringify(getSemanticV1Value(state))}
      </output>
      <button type="button" onClick={() => setSemantics(validSemantics)}>
        Restore semantics externally
      </button>
      <button
        type="button"
        onClick={() => setSchema({ type: "object", properties: {} })}
      >
        Remove bound field
      </button>
      <button type="button" onClick={() => setSemantics(invalidSemantics)}>
        Make semantics invalid
      </button>
    </>
  )
}

function ConnectedBuilder() {
  const { state, setSchema, setUiSchema } = useFormStudio()

  return (
    <FormBuilder
      schema={JSON.stringify(state.schema)}
      uiSchema={JSON.stringify(state.uiSchema)}
      onChange={(schema, uiSchema) => {
        setSchema(JSON.parse(schema))
        setUiSchema(JSON.parse(uiSchema))
      }}
    />
  )
}

async function settleDebouncedWork() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
  })
}

describe("Semantic V1 registry integration", () => {
  test("typed accessors read the registered value and validation normalizes runtime diagnostics", () => {
    const state = {
      extensionValues: { [semanticV1Extension.id]: invalidSemantics },
    }
    expect(getSemanticV1Value(state)).toEqual(invalidSemantics)

    const [diagnostic] = semanticV1Extension.validate({
      schema: schemaWithName,
      uiSchema: {},
      value: invalidSemantics,
    })
    expect(diagnostic).toMatchObject({
      source: semanticV1Extension.id,
      sourceLabel: semanticV1Extension.label,
      code: "SEMANTIC_COMPONENT_INVALID",
      severity: "error",
      blocksCommit: true,
    })
  })

  test("absent semantics skips the runtime and one settled update validates once", async () => {
    vi.useFakeTimers()

    render(
      <SemanticProvider initialSchema={schemaWithName}>
        <StateProbe />
        <ConnectedBuilder />
      </SemanticProvider>
    )

    expect(runtimeValidationSpy).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Restore semantics externally" }))
    expect(runtimeValidationSpy).not.toHaveBeenCalled()

    await settleDebouncedWork()

    expect(runtimeValidationSpy).toHaveBeenCalledTimes(1)
  })

  test("provider initialization, JSON synchronization, invalid local text, and removal share one semantic value", () => {
    render(
      <SemanticProvider
        initialSchema={schemaWithName}
        initialSemantics={JSON.stringify(validSemantics)}
      >
        <JsonEditor />
        <StateProbe />
      </SemanticProvider>
    )

    const semanticEditor = screen.getAllByTestId("monaco-json-editor")[2]
    expect((semanticEditor as HTMLTextAreaElement).value).toBe(JSON.stringify(validSemantics, null, 2))
    expect(screen.getByTestId("semantic-state").textContent).toContain(JSON.stringify(validSemantics))
    expect(screen.getByTestId("semantic-descriptor-state").textContent).toContain(
      JSON.stringify(validSemantics)
    )

    const editedSemantics: SemanticV1Component = {
      ...validSemantics,
      root: { classIri: "https://example.org/Researcher" },
    }
    fireEvent.change(semanticEditor, {
      target: { value: JSON.stringify(editedSemantics, null, 2) },
    })
    expect(screen.getByTestId("semantic-state").textContent).toContain(JSON.stringify(editedSemantics))

    fireEvent.click(screen.getByRole("button", { name: "Restore semantics externally" }))
    expect((semanticEditor as HTMLTextAreaElement).value).toBe(JSON.stringify(validSemantics, null, 2))

    fireEvent.change(semanticEditor, { target: { value: "{ unfinished" } })
    expect((semanticEditor as HTMLTextAreaElement).value).toBe("{ unfinished")
    expect(screen.getByRole("alert").textContent).toContain("Invalid JSON — not yet applied")
    expect(screen.getByTestId("semantic-state").textContent).toContain(JSON.stringify(validSemantics))

    fireEvent.click(screen.getByRole("button", { name: "Remove semantic component" }))
    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(screen.getByTestId("semantic-state").textContent).toContain("absent")
    expect(screen.getByText("This form has no Semantic V1 component yet.")).not.toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Add semantic component" }))
    expect(screen.getByTestId("semantic-state").textContent).toContain(
      JSON.stringify({ root: { classIri: "https://example.org/ChangeMe" }, bindings: [] })
    )
  })

  test("a schema edit invalidates but does not rewrite the stored binding", async () => {
    vi.useFakeTimers()

    render(
      <SemanticProvider initialSchema={schemaWithName} initialSemantics={validSemantics}>
        <StateProbe />
        <SemanticDiagnosticsSummary />
      </SemanticProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Remove bound field" }))
    expect(screen.getByTestId("semantic-state").textContent).toContain(JSON.stringify(validSemantics))
    expect(screen.queryByText("SEMANTIC_FIELD_POINTER_UNRESOLVED")).toBeNull()

    await settleDebouncedWork()

    expect(screen.getByText("SEMANTIC_FIELD_POINTER_UNRESOLVED")).not.toBeNull()
    expect(screen.getByTestId("semantic-state").textContent).toContain(JSON.stringify(validSemantics))
  })

  test("global and open field-local diagnostics settle to the same current result", async () => {
    vi.useFakeTimers()

    const { container } = render(
      <SemanticProvider initialSchema={schemaWithName} initialSemantics={validSemantics}>
        <StateProbe />
        <ConnectedBuilder />
        <SemanticDiagnosticsSummary />
      </SemanticProvider>
    )

    const settingsIcon = container.querySelector(
      '[data-tip="Additional configurations for this item"] svg'
    )
    expect(settingsIcon).not.toBeNull()
    fireEvent.click(settingsIcon!)
    expect(screen.getByText("Semantic binding")).not.toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Make semantics invalid" }))
    await settleDebouncedWork()

    const globalDiagnostics = container.querySelector('[data-semantic-diagnostics="true"]')
    const fieldDiagnostics = container.querySelector('[data-semantic-binding-section="true"]')
    expect(globalDiagnostics).not.toBeNull()
    expect(fieldDiagnostics).not.toBeNull()
    expect(within(globalDiagnostics as HTMLElement).getByText("SEMANTIC_COMPONENT_INVALID")).not.toBeNull()
    expect(within(fieldDiagnostics as HTMLElement).getByText("SEMANTIC_COMPONENT_INVALID")).not.toBeNull()
  })

  test("a save attempt synchronously blocks invalid semantics before debounced diagnostics settle", () => {
    vi.useFakeTimers()
    const onSave = vi.fn<(state: FormStudioState) => Promise<void>>().mockResolvedValue(undefined)

    render(
      <SemanticProvider initialSchema={schemaWithName} initialSemantics={validSemantics}>
        <StateProbe />
        <FormStudioUI onSave={onSave} />
      </SemanticProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Make semantics invalid" }))
    const saveButton = screen.getByRole("button", { name: "Save Changes" })
    expect((saveButton as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(saveButton)

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole("alert").textContent).toContain(
      "Extension validation issues must be resolved before saving"
    )
  })

  test("the recovery buffer receives invalid semantic state after its debounce", async () => {
    vi.useFakeTimers()
    const onAutoSave = vi.fn<(state: FormStudioState) => Promise<void>>().mockResolvedValue(undefined)

    render(
      <SemanticProvider initialSchema={schemaWithName} initialSemantics={validSemantics}>
        <StateProbe />
        <FormStudioUI onAutoSave={onAutoSave} />
      </SemanticProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Make semantics invalid" }))
    expect(onAutoSave).not.toHaveBeenCalled()

    await settleDebouncedWork()

    expect(onAutoSave).toHaveBeenCalledTimes(1)
    expect(onAutoSave.mock.calls[0][0].extensionValues[semanticV1Extension.id]).toEqual(
      invalidSemantics
    )
  })
})
