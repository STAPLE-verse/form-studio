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
  properties: {
    topCard: { type: "string", title: "Top card" },
    group: {
      type: "object",
      title: "Group",
      properties: { nestedCard: { type: "string", title: "Nested card" } },
    },
  },
})

// An open Collapse renders its body in a `block mt-4 pt-4` container; closed is `hidden`
const openCount = (container: HTMLElement) =>
  container.querySelectorAll("div.block.mt-4.pt-4.border-t").length

describe("collapse all / expand all", () => {
  afterEach(cleanup)

  test("expands and collapses every card, including ones inside sections", () => {
    const { container } = render(
      <FormBuilder schema={schema} uiSchema="{}" onChange={() => undefined} />
    )
    expect(openCount(container)).toBe(0)

    fireEvent.click(screen.getByText("Expand all"))
    expect(openCount(container)).toBe(3)

    fireEvent.click(screen.getByText("Collapse all"))
    expect(openCount(container)).toBe(0)
  })

  test("collapse all overrides cards opened by hand, and can be pressed repeatedly", () => {
    const { container } = render(
      <FormBuilder schema={schema} uiSchema="{}" onChange={() => undefined} />
    )
    fireEvent.click(screen.getByText("Top card"))
    expect(openCount(container)).toBe(1)

    fireEvent.click(screen.getByText("Collapse all"))
    expect(openCount(container)).toBe(0)

    fireEvent.click(screen.getByText("Expand all"))
    fireEvent.click(screen.getByText("Top card"))
    expect(openCount(container)).toBe(2)

    fireEvent.click(screen.getByText("Expand all"))
    expect(openCount(container)).toBe(3)
  })

  test("shows no controls for an empty form", () => {
    render(<FormBuilder schema="{}" uiSchema="{}" onChange={() => undefined} />)
    expect(screen.queryByText("Expand all")).toBeNull()
  })
})
