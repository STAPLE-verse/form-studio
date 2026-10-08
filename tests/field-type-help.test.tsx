// @vitest-environment jsdom

import React from "react"
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

const schema = JSON.stringify({
  type: "object",
  properties: { name: { type: "string", title: "Name" } },
})

describe("field type guidance", () => {
  afterEach(cleanup)

  test("the field type explains that rules are set with the pencil", () => {
    const { container } = render(
      <FormBuilder schema={schema} uiSchema="{}" onChange={() => undefined} />
    )
    fireEvent.click(screen.getByText("Name"))
    const help = container.querySelector("[data-test='field-type-help']")
    expect(help?.textContent).toContain("changes how the item looks")
    expect(help?.textContent).toContain("click the pencil")
  })

  test("format options use plain-language names", () => {
    const { container } = render(
      <FormBuilder schema={schema} uiSchema="{}" onChange={() => undefined} />
    )
    fireEvent.click(screen.getByText("Name"))
    fireEvent.click(container.querySelector("[id$='_editinfo'] svg")!)
    const options = Array.from(document.querySelectorAll("option")).map((option) => option.textContent)
    expect(options).toContain("Web link (URL)")
    expect(options).toContain("Email address")
    expect(options).not.toContain("URI")
  })
})
