// @vitest-environment jsdom

import React, { useState } from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import FormBuilder from "../src/FormBuilder"

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

// FormBuilder is controlled, so the test host has to feed changes back in
function Host({ initialSchema }: { initialSchema: object }) {
  const [schema, setSchema] = useState(JSON.stringify(initialSchema))
  const [uiSchema, setUiSchema] = useState("{}")
  return (
    <FormBuilder
      schema={schema}
      uiSchema={uiSchema}
      onChange={(newSchema, newUiSchema) => {
        setSchema(newSchema)
        setUiSchema(newUiSchema)
      }}
    />
  )
}

// An open Collapse renders its body in a `block mt-4 pt-4` container; closed is `hidden`
const openCount = (container: HTMLElement) =>
  container.querySelectorAll("div.block.mt-4.pt-4.border-t").length

function renameFirstKey(newKey: string) {
  const keyInput = screen.getAllByPlaceholderText("Key")[0]!
  fireEvent.change(keyInput, { target: { value: newKey } })
  fireEvent.blur(keyInput)
}

describe("renaming a variable keeps its box open", () => {
  afterEach(cleanup)

  test("a card stays open after its variable name is changed", () => {
    const { container } = render(
      <Host initialSchema={{ type: "object", properties: { first: { type: "string", title: "First" } } }} />
    )
    fireEvent.click(screen.getByText("First"))
    expect(openCount(container)).toBe(1)

    renameFirstKey("renamed")
    expect(screen.getAllByPlaceholderText("Key")[0]).toHaveProperty("value", "renamed")
    expect(openCount(container)).toBe(1)
  })

  test("renaming one card does not open or close its neighbours", () => {
    const { container } = render(
      <Host
        initialSchema={{
          type: "object",
          properties: {
            first: { type: "string", title: "First" },
            second: { type: "string", title: "Second" },
          },
        }}
      />
    )
    fireEvent.click(screen.getByText("First"))
    renameFirstKey("renamed")
    expect(openCount(container)).toBe(1)
  })

  test("a section stays open after its variable name is changed", () => {
    const { container } = render(
      <Host
        initialSchema={{
          type: "object",
          properties: {
            group: { type: "object", title: "Group", properties: {} },
          },
        }}
      />
    )
    fireEvent.click(screen.getByText("Group"))
    expect(openCount(container)).toBe(1)

    renameFirstKey("renamedGroup")
    expect(openCount(container)).toBe(1)
  })
})
