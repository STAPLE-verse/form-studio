// @vitest-environment jsdom

import React from "react"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import FormBuilder from "../src/FormBuilder"
import { FormStudioProvider, UNDO_GROUP_MS, useFormStudio } from "../src/FormStudioContext"

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

function ConnectedBuilder() {
  const { state, setSchema, setUiSchema, updateState } = useFormStudio()
  return (
    <>
      <FormBuilder
        schema={JSON.stringify(state.schema)}
        uiSchema={JSON.stringify(state.uiSchema)}
        onChange={(schema, uiSchema) => {
          setSchema(JSON.parse(schema))
          setUiSchema(JSON.parse(uiSchema))
        }}
      />
      <pre data-testid="names">{Object.keys((state.schema as any).properties ?? {}).join(",")}</pre>
      <pre data-testid="title">{(state.schema as any).title ?? ""}</pre>
      <button onClick={() => updateState({ formData: { previewed: true } })}>fill preview</button>
    </>
  )
}

const renderBuilder = (schema: object = { type: "object", properties: { first: { type: "string" } } }) =>
  render(
    <FormStudioProvider initialSchema={schema}>
      <ConnectedBuilder />
    </FormStudioProvider>
  )

const names = () => screen.getByTestId("names").textContent
const undoButton = () => screen.getByText("Undo").closest("button") as HTMLButtonElement
const redoButton = () => screen.getByText("Redo").closest("button") as HTMLButtonElement

// each call is a separate user action: a card added more than the grouping window apart
let clock = 1_000_000
function addItem() {
  clock += UNDO_GROUP_MS + 500
  fireEvent.click(screen.getAllByTitle("Add a new item or section").at(-1)!)
  fireEvent.click(screen.getByText("Create"))
}

describe("undo and redo", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockImplementation(() => clock)
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test("start disabled, since there is nothing to undo yet", () => {
    renderBuilder()
    expect(undoButton().disabled).toBe(true)
    expect(redoButton().disabled).toBe(true)
  })

  test("undo takes back the last change and redo brings it back", () => {
    renderBuilder()
    addItem()
    expect(names()).toBe("first,newInput1")
    expect(undoButton().disabled).toBe(false)

    fireEvent.click(undoButton())
    expect(names()).toBe("first")
    expect(undoButton().disabled).toBe(true)
    expect(redoButton().disabled).toBe(false)

    fireEvent.click(redoButton())
    expect(names()).toBe("first,newInput1")
    expect(redoButton().disabled).toBe(true)
  })

  test("separate changes undo one at a time, newest first", () => {
    renderBuilder()
    addItem()
    addItem()
    expect(names()).toBe("first,newInput1,newInput2")
    fireEvent.click(undoButton())
    expect(names()).toBe("first,newInput1")
    fireEvent.click(undoButton())
    expect(names()).toBe("first")
  })

  test("a new change after an undo discards what could have been redone", () => {
    renderBuilder()
    addItem()
    fireEvent.click(undoButton())
    expect(redoButton().disabled).toBe(false)
    addItem()
    expect(redoButton().disabled).toBe(true)
  })

  test("quick edits, like typing a title, are one undo step", () => {
    renderBuilder()
    const title = document.querySelector("input.form-title") as HTMLInputElement
    clock += UNDO_GROUP_MS + 500
    for (const text of ["T", "Ti", "Tit", "Title"]) {
      clock += 50
      fireEvent.change(title, { target: { value: text } })
    }
    expect(screen.getByTestId("title").textContent).toBe("Title")
    fireEvent.click(undoButton())
    expect(screen.getByTestId("title").textContent).toBe("")
    expect(undoButton().disabled).toBe(true)
  })

  test("filling in the preview does not create undo steps", () => {
    renderBuilder()
    fireEvent.click(screen.getByText("fill preview"))
    expect(undoButton().disabled).toBe(true)
  })

  test("Ctrl+Z and Ctrl+Shift+Z work from the page, but not while typing in a field", () => {
    renderBuilder()
    addItem()

    const title = document.querySelector("input.form-title") as HTMLInputElement
    title.focus()
    fireEvent.keyDown(title, { key: "z", ctrlKey: true })
    expect(names()).toBe("first,newInput1")

    fireEvent.keyDown(document.body, { key: "z", ctrlKey: true })
    expect(names()).toBe("first")
    fireEvent.keyDown(document.body, { key: "z", ctrlKey: true, shiftKey: true })
    expect(names()).toBe("first,newInput1")
    fireEvent.keyDown(document.body, { key: "z", metaKey: true })
    expect(names()).toBe("first")
  })

  test("no undo controls when the builder is used without a provider", () => {
    render(<FormBuilder schema="{}" uiSchema="{}" onChange={() => undefined} />)
    expect(screen.queryByText("Undo")).toBeNull()
  })
})
