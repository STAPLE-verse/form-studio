// @vitest-environment jsdom

import React from "react"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import { FormStudioUI } from "../src/FormStudio"
import {
  FormStudioProvider,
  computeStateFingerprint,
  useFormStudio,
  type FormStudioState,
} from "../src/FormStudioContext"
import { DEBOUNCE_MS } from "../src/debounce"
import {
  defineFormStudioExtension,
  type DefinedFormStudioExtension,
  type FormStudioDiagnostic,
} from "../src/extensions/types"

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

interface NotesValue {
  enabled: boolean
  note: string
}

function createNotesExtension(
  id = "test.notes",
  validate: () => FormStudioDiagnostic[] = () => []
) {
  return defineFormStudioExtension<NotesValue>({
    id,
    label: "Test notes",
    validate,
  })
}

const initialNotes: NotesValue = { enabled: true, note: "Initial" }
const updatedNotes: NotesValue = { enabled: false, note: "Updated" }

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function RegistryProbe({
  extension,
}: {
  extension: DefinedFormStudioExtension<NotesValue>
}) {
  const {
    state,
    extensions,
    getExtensionValue,
    setExtensionValue,
  } = useFormStudio()

  return (
    <>
      <output data-testid="registered-extension-ids">
        {extensions.map((candidate) => candidate.id).join(",")}
      </output>
      <output data-testid="extension-value-keys">
        {Object.keys(state.extensionValues).join(",")}
      </output>
      <output data-testid="context-extension-value">
        {JSON.stringify(getExtensionValue(extension))}
      </output>
      <output data-testid="descriptor-extension-value">
        {JSON.stringify(extension.getValue(state))}
      </output>
      <button type="button" onClick={() => setExtensionValue(extension, updatedNotes)}>
        Update extension value
      </button>
      <button type="button" onClick={() => setExtensionValue(extension, undefined)}>
        Remove extension value
      </button>
    </>
  )
}

function EmptyRegistryProbe() {
  const { state, extensions } = useFormStudio()
  return (
    <>
      <output data-testid="registered-extension-ids">
        {extensions.map((candidate) => candidate.id).join(",")}
      </output>
      <output data-testid="extension-value-keys">
        {Object.keys(state.extensionValues).join(",")}
      </output>
    </>
  )
}

function SetExtensionValueButton({
  extension,
}: {
  extension: DefinedFormStudioExtension<NotesValue>
}) {
  const { setExtensionValue } = useFormStudio()
  return (
    <button type="button" onClick={() => setExtensionValue(extension, updatedNotes)}>
      Set recovery extension value
    </button>
  )
}

describe("Phase 1 extension registry state", () => {
  test("an empty registry preserves base state with an empty extension record", () => {
    render(
      <FormStudioProvider initialSchema={{ type: "object" }}>
        <EmptyRegistryProbe />
      </FormStudioProvider>
    )

    expect(screen.getByTestId("registered-extension-ids").textContent).toBe("")
    expect(screen.getByTestId("extension-value-keys").textContent).toBe("")
  })

  test("registered values round-trip through typed context and descriptor accessors", () => {
    const validate = vi.fn(() => [])
    const extension = createNotesExtension("test.notes", validate)

    render(
      <FormStudioProvider
        extensions={[extension]}
        initialExtensionValues={{ [extension.id]: initialNotes }}
      >
        <RegistryProbe extension={extension} />
      </FormStudioProvider>
    )

    expect(screen.getByTestId("context-extension-value").textContent).toBe(
      JSON.stringify(initialNotes)
    )
    expect(screen.getByTestId("descriptor-extension-value").textContent).toBe(
      JSON.stringify(initialNotes)
    )
    expect(validate).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: "Update extension value" }))
    expect(screen.getByTestId("context-extension-value").textContent).toBe(
      JSON.stringify(updatedNotes)
    )
    expect(screen.getByTestId("descriptor-extension-value").textContent).toBe(
      JSON.stringify(updatedNotes)
    )

    fireEvent.click(screen.getByRole("button", { name: "Remove extension value" }))
    expect(screen.getByTestId("context-extension-value").textContent).toBe("")
    expect(screen.getByTestId("descriptor-extension-value").textContent).toBe("")
    expect(screen.getByTestId("extension-value-keys").textContent).toBe("")
  })

  test("registry order controls extension state key order even after a value is re-added", () => {
    const first = createNotesExtension("test.first")
    const second = createNotesExtension("test.second")

    render(
      <FormStudioProvider
        extensions={[second, first]}
        initialExtensionValues={{ [first.id]: initialNotes, [second.id]: updatedNotes }}
      >
        <RegistryProbe extension={second} />
      </FormStudioProvider>
    )

    expect(screen.getByTestId("registered-extension-ids").textContent).toBe(
      "test.second,test.first"
    )
    expect(screen.getByTestId("extension-value-keys").textContent).toBe(
      "test.second,test.first"
    )

    fireEvent.click(screen.getByRole("button", { name: "Remove extension value" }))
    fireEvent.click(screen.getByRole("button", { name: "Update extension value" }))
    expect(screen.getByTestId("extension-value-keys").textContent).toBe(
      "test.second,test.first"
    )
  })

  test("extension values participate in authored-state fingerprints while form data does not", () => {
    const state: FormStudioState = {
      schema: { type: "object" },
      uiSchema: {},
      extensionValues: { "test.notes": initialNotes },
      semantics: undefined,
      formData: { preview: "one" },
    }
    const changedExtensionState: FormStudioState = {
      ...state,
      extensionValues: { "test.notes": updatedNotes },
    }
    const changedPreviewState: FormStudioState = {
      ...state,
      formData: { preview: "two" },
    }

    expect(computeStateFingerprint(changedExtensionState)).not.toBe(
      computeStateFingerprint(state)
    )
    expect(computeStateFingerprint(changedPreviewState)).toBe(computeStateFingerprint(state))
  })

  test("recovery snapshots include the current registered extension values", async () => {
    vi.useFakeTimers()
    const extension = createNotesExtension()
    const onAutoSave = vi.fn<(state: FormStudioState) => Promise<void>>().mockResolvedValue(undefined)

    render(
      <FormStudioProvider extensions={[extension]}>
        <SetExtensionValueButton extension={extension} />
        <FormStudioUI onAutoSave={onAutoSave} />
      </FormStudioProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Set recovery extension value" }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
    })

    expect(onAutoSave).toHaveBeenCalledTimes(1)
    expect(onAutoSave.mock.calls[0][0].extensionValues).toEqual({
      [extension.id]: updatedNotes,
    })
  })

  test("duplicate IDs and initial values for unregistered extensions fail clearly", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const first = createNotesExtension("test.duplicate")
    const duplicate = createNotesExtension("test.duplicate")

    expect(() =>
      render(
        <FormStudioProvider extensions={[first, duplicate]}>
          <div />
        </FormStudioProvider>
      )
    ).toThrow("Duplicate Form Studio extension ID: test.duplicate")

    expect(() =>
      render(
        <FormStudioProvider initialExtensionValues={{ "test.missing": initialNotes }}>
          <div />
        </FormStudioProvider>
      )
    ).toThrow("Initial value supplied for unregistered Form Studio extension: test.missing")
  })

  test("registration accepts a new array of the same descriptors but requires remounting to change them", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const first = createNotesExtension("test.first")
    const replacement = createNotesExtension("test.replacement")
    const { rerender } = render(
      <FormStudioProvider extensions={[first]}>
        <RegistryProbe extension={first} />
      </FormStudioProvider>
    )

    expect(() =>
      rerender(
        <FormStudioProvider extensions={[first]}>
          <RegistryProbe extension={first} />
        </FormStudioProvider>
      )
    ).not.toThrow()

    expect(() =>
      rerender(
        <FormStudioProvider extensions={[replacement]}>
          <RegistryProbe extension={replacement} />
        </FormStudioProvider>
      )
    ).toThrow("FormStudioProvider extensions must remain stable")
  })
})
