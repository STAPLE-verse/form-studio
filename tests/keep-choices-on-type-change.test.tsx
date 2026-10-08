// @vitest-environment jsdom

import React, { useState } from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import FormBuilder from "../src/FormBuilder"
import { carryOverChoices } from "../src/carryOverChoices"

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

describe("carryOverChoices", () => {
  test("radio <-> dropdown keeps enum and display labels", () => {
    expect(
      carryOverChoices({ category: "dropdown", type: "string", enum: ["a", "b"], enumNames: ["A", "B"] }, "radio")
    ).toEqual({ enum: ["a", "b"], enumNames: ["A", "B"], type: "string" })
  })

  test("a forced-number type survives radio <-> dropdown", () => {
    expect(carryOverChoices({ category: "radio", type: "number", enum: [1, 2] }, "dropdown")).toEqual({
      enum: [1, 2],
      type: "number",
    })
  })

  test("dropdown -> checkboxes moves choices into items, as strings", () => {
    expect(carryOverChoices({ category: "dropdown", type: "number", enum: [1, 2] }, "checkboxes")).toEqual({
      items: { type: "string", enum: ["1", "2"] },
    })
  })

  test("checkboxes -> radio moves choices out of items", () => {
    expect(
      carryOverChoices(
        { category: "checkboxes", items: { type: "string", enum: ["x", "y"], enumNames: ["X", "Y"] } },
        "radio"
      )
    ).toEqual({ enum: ["x", "y"], enumNames: ["X", "Y"] })
  })

  test("carries nothing to or from a non-choice type", () => {
    expect(carryOverChoices({ category: "dropdown", enum: ["a"] }, "shortAnswer")).toEqual({})
    expect(carryOverChoices({ category: "shortAnswer" }, "radio")).toEqual({})
    expect(carryOverChoices({ category: "radio", enum: ["a"] }, "radio")).toEqual({})
  })
})

function Host({ initialSchema, onSchema }: { initialSchema: object; onSchema: (s: any) => void }) {
  const [schema, setSchema] = useState(JSON.stringify(initialSchema))
  const [uiSchema, setUiSchema] = useState("{}")
  return (
    <FormBuilder
      schema={schema}
      uiSchema={uiSchema}
      onChange={(newSchema, newUiSchema) => {
        setSchema(newSchema)
        setUiSchema(newUiSchema)
        onSchema(JSON.parse(newSchema))
      }}
    />
  )
}

function switchType(newCategory: string) {
  const typeSelect = document.querySelector("select") as HTMLSelectElement
  fireEvent.change(typeSelect, { target: { value: newCategory } })
}

describe("changing item type in the builder", () => {
  afterEach(cleanup)

  const dropdownSchema = {
    type: "object",
    properties: {
      pick: { type: "string", title: "Pick", enum: ["a", "b"], enumNames: ["A", "B"] },
    },
  }

  test("a dropdown keeps its answer choices when changed to checkboxes and back to radio", () => {
    let latest: any
    render(<Host initialSchema={dropdownSchema} onSchema={(s) => (latest = s)} />)
    fireEvent.click(screen.getByText("Pick"))

    switchType("checkboxes")
    expect(latest.properties.pick.type).toBe("array")
    expect(latest.properties.pick.items.enum).toEqual(["a", "b"])
    expect(latest.properties.pick.items.enumNames).toEqual(["A", "B"])

    switchType("radio")
    expect(latest.properties.pick.type).toBe("string")
    expect(latest.properties.pick.enum).toEqual(["a", "b"])
    expect(latest.properties.pick.enumNames).toEqual(["A", "B"])
    expect(latest.properties.pick.items).toBeUndefined()
  })

  test("changing to a non-choice type drops the choices", () => {
    let latest: any
    render(<Host initialSchema={dropdownSchema} onSchema={(s) => (latest = s)} />)
    fireEvent.click(screen.getByText("Pick"))

    switchType("shortAnswer")
    expect(latest.properties.pick.enum).toBeUndefined()
    expect(latest.properties.pick.items).toBeUndefined()
  })
})
