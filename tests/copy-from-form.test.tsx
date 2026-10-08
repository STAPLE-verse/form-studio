// @vitest-environment jsdom

import React, { useState } from "react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import FormBuilder from "../src/FormBuilder"
import type { ItemSource } from "../src/itemSource"

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

const sourceForm = {
  schema: {
    type: "object",
    properties: {
      tenzing: {
        type: "string",
        title: "Tenzing items",
        $comment: "kept on the copy",
        enum: ["one", "two", "three"],
        enumNames: ["One", "Two", "Three"],
      },
      age: { type: "number", title: "Age" },
      shared: { $ref: "#/definitions/thing" },
    },
    definitions: { thing: { type: "string", title: "Thing" } },
  },
  uiSchema: { tenzing: { "ui:widget": "radio" } },
}

const itemSource: ItemSource = {
  listForms: async () => [
    { id: 1, title: "Earlier study", description: "v2" },
    { id: 2, title: "Other study" },
  ],
  getForm: async () => sourceForm,
}

function Host({
  initialSchema,
  source,
  onChanged,
}: {
  initialSchema: object
  source?: ItemSource
  onChanged: (schema: any, ui: any) => void
}) {
  const [schema, setSchema] = useState(JSON.stringify(initialSchema))
  const [uiSchema, setUiSchema] = useState("{}")
  return (
    <FormBuilder
      schema={schema}
      uiSchema={uiSchema}
      mods={{ itemSource: source }}
      onChange={(newSchema, newUiSchema) => {
        setSchema(newSchema)
        setUiSchema(newUiSchema)
        onChanged(JSON.parse(newSchema), JSON.parse(newUiSchema))
      }}
    />
  )
}

const existing = {
  type: "object",
  properties: { age: { type: "number", title: "My age" } },
}

async function openDialogAndPickForm() {
  fireEvent.click(screen.getAllByTitle("Add a new item or section").at(-1)!)
  fireEvent.click(screen.getByLabelText("From another form"))
  fireEvent.click(screen.getByText("Create"))
  const select = (await screen.findByText("Choose a form...")).closest("select")!
  fireEvent.change(select, { target: { value: "1" } })
  await screen.findByText(/Tenzing items/)
}

describe("copy items from another form", () => {
  afterEach(cleanup)

  test("is only offered when the app provides an item source", () => {
    render(<Host initialSchema={existing} onChanged={() => undefined} />)
    fireEvent.click(screen.getAllByTitle("Add a new item or section").at(-1)!)
    expect(screen.queryByLabelText("From another form")).toBeNull()
  })

  test("lists the user's forms and the items in the chosen form", async () => {
    render(<Host initialSchema={existing} source={itemSource} onChanged={() => undefined} />)
    await openDialogAndPickForm()
    expect(screen.getByText(/Earlier study \(v2\)/)).toBeTruthy()
    expect(screen.getByText(/Tenzing items - 3 choices/)).toBeTruthy()
    expect(screen.getByText("Age")).toBeTruthy()
  })

  test("copies a chosen item with its choices, rules and widget; renames one that clashes", async () => {
    let schemaOut: any
    let uiOut: any
    render(
      <Host
        initialSchema={existing}
        source={itemSource}
        onChanged={(s, u) => {
          schemaOut = s
          uiOut = u
        }}
      />
    )
    await openDialogAndPickForm()
    fireEvent.click(screen.getByLabelText(/Tenzing items/))
    fireEvent.click(screen.getByLabelText("Age"))
    fireEvent.click(screen.getByText("Copy 2 items"))

    expect(schemaOut.properties.tenzing).toEqual(sourceForm.schema.properties.tenzing)
    expect(schemaOut.properties.tenzing.$comment).toBe("kept on the copy")
    expect(uiOut.tenzing).toEqual({ "ui:widget": "radio" })
    // "age" already exists in this form, so the copy gets a new name; the original is untouched
    expect(schemaOut.properties.age.title).toBe("My age")
    expect(schemaOut.properties.age_copy.title).toBe("Age")
    expect(uiOut["ui:order"]).toEqual(["age", "tenzing", "age_copy"])
  })

  test("items that use a shared component are shown but can't be selected", async () => {
    render(<Host initialSchema={existing} source={itemSource} onChanged={() => undefined} />)
    await openDialogAndPickForm()
    expect(screen.getByText(/can't be copied yet/)).toBeTruthy()
    expect((screen.getByLabelText(/shared/) as HTMLInputElement).disabled).toBe(true)
  })

  test("shows a message when the forms can't be loaded", async () => {
    const failing: ItemSource = {
      listForms: async () => {
        throw new Error("nope")
      },
      getForm: async () => sourceForm,
    }
    render(<Host initialSchema={existing} source={failing} onChanged={() => undefined} />)
    fireEvent.click(screen.getAllByTitle("Add a new item or section").at(-1)!)
    fireEvent.click(screen.getByLabelText("From another form"))
    fireEvent.click(screen.getByText("Create"))
    await waitFor(() => expect(screen.getByText("Your forms could not be loaded.")).toBeTruthy())
  })
})
