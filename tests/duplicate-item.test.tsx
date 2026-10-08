// @vitest-environment jsdom

import React, { useState } from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import FormBuilder from "../src/FormBuilder"
import { nextCopyName } from "../src/duplicateName"

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

describe("nextCopyName", () => {
  test("appends _copy, then numbers further copies", () => {
    expect(nextCopyName("age", ["age"])).toBe("age_copy")
    expect(nextCopyName("age", ["age", "age_copy"])).toBe("age_copy2")
    expect(nextCopyName("age", ["age", "age_copy", "age_copy2"])).toBe("age_copy3")
  })
})

function Host({
  initialSchema,
  initialUi,
  onChanged,
}: {
  initialSchema: object
  initialUi: object
  onChanged: (schema: any, ui: any) => void
}) {
  const [schema, setSchema] = useState(JSON.stringify(initialSchema))
  const [uiSchema, setUiSchema] = useState(JSON.stringify(initialUi))
  return (
    <FormBuilder
      schema={schema}
      uiSchema={uiSchema}
      onChange={(newSchema, newUiSchema) => {
        setSchema(newSchema)
        setUiSchema(newUiSchema)
        onChanged(JSON.parse(newSchema), JSON.parse(newUiSchema))
      }}
    />
  )
}

const clickDuplicate = (container: HTMLElement, which = 0) =>
  fireEvent.click(container.querySelectorAll("[id$='_duplicateinfo'] svg")[which]!)

describe("duplicating an item", () => {
  afterEach(cleanup)

  const schema = {
    type: "object",
    required: ["pick"],
    properties: {
      pick: {
        type: "string",
        title: "Pick",
        $comment: "kept on the copy",
        enum: ["a", "b", "c"],
        enumNames: ["A", "B", "C"],
      },
      other: { type: "string", title: "Other" },
    },
  }
  const ui = { pick: { "ui:widget": "radio" } }

  test("copies the item right below it with its choices, rules, widget and required flag", () => {
    let schemaOut: any
    let uiOut: any
    const { container } = render(
      <Host
        initialSchema={schema}
        initialUi={ui}
        onChanged={(s, u) => {
          schemaOut = s
          uiOut = u
        }}
      />
    )
    clickDuplicate(container)

    expect(Object.keys(schemaOut.properties).sort()).toEqual(["other", "pick", "pick_copy"])
    expect(schemaOut.properties.pick_copy).toEqual(schemaOut.properties.pick)
    expect(schemaOut.properties.pick_copy.$comment).toBe("kept on the copy")
    expect(schemaOut.required).toEqual(expect.arrayContaining(["pick", "pick_copy"]))
    expect(uiOut.pick_copy).toEqual({ "ui:widget": "radio" })
    expect(uiOut["ui:order"]).toEqual(["pick", "pick_copy", "other"])
  })

  test("duplicating twice gives distinct names and leaves the original untouched", () => {
    let schemaOut: any
    let uiOut: any
    const { container } = render(
      <Host
        initialSchema={schema}
        initialUi={ui}
        onChanged={(s, u) => {
          schemaOut = s
          uiOut = u
        }}
      />
    )
    clickDuplicate(container)
    clickDuplicate(container)

    // form order is ui:order, not the key order of `properties`
    expect(uiOut["ui:order"]).toEqual(["pick", "pick_copy2", "pick_copy", "other"])
    expect(schemaOut.properties.pick.enum).toEqual(["a", "b", "c"])
  })

  test("the copy opens ready to edit", () => {
    const { container } = render(
      <Host initialSchema={schema} initialUi={ui} onChanged={() => undefined} />
    )
    clickDuplicate(container)
    expect(screen.getByDisplayValue("pick_copy")).toBeTruthy()
    expect(container.querySelectorAll("div.block.mt-4.pt-4.border-t").length).toBe(1)
  })
})
