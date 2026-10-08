// @vitest-environment jsdom

import React, { useState } from "react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import FormBuilder from "../src/FormBuilder"
import { parseOptionsCsv } from "../src/parseOptionsCsv"
import { mergeImportedOptions } from "../src/mergeImportedOptions"

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

describe("parseOptionsCsv", () => {
  test("reads one option per line, trimming and skipping blank lines", () => {
    expect(parseOptionsCsv("France\r\n  Spain \n\nItaly\n").options).toEqual([
      { value: "France" },
      { value: "Spain" },
      { value: "Italy" },
    ])
  })

  test("a second column becomes the display label", () => {
    expect(parseOptionsCsv("fr,French\nes,Spanish").options).toEqual([
      { value: "fr", label: "French" },
      { value: "es", label: "Spanish" },
    ])
  })

  test("ignores a header row and a byte-order mark", () => {
    expect(parseOptionsCsv("﻿value,label\nfr,French").options).toEqual([
      { value: "fr", label: "French" },
    ])
    expect(parseOptionsCsv("Options\nA\nB").options.map((o) => o.value)).toEqual(["A", "B"])
  })

  test("keeps commas, quotes and line breaks inside quoted cells", () => {
    const { options } = parseOptionsCsv('"Korea, Republic of",KR\n"She said ""hi""",x\n"two\nlines",y')
    expect(options).toEqual([
      { value: "Korea, Republic of", label: "KR" },
      { value: 'She said "hi"', label: "x" },
      { value: "two\nlines", label: "y" },
    ])
  })

  test("understands semicolon and tab separated files", () => {
    expect(parseOptionsCsv("a;A\nb;B").options).toEqual([
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ])
    expect(parseOptionsCsv("a\tA").options).toEqual([{ value: "a", label: "A" }])
  })

  test("drops repeated values and counts them", () => {
    expect(parseOptionsCsv("a\nb\na\na")).toEqual({
      options: [{ value: "a" }, { value: "b" }],
      duplicates: 2,
    })
  })
})

describe("mergeImportedOptions", () => {
  test("adds after the existing choices, skipping ones already there and blank placeholders", () => {
    const merged = mergeImportedOptions(["a", ""], undefined, [{ value: "a" }, { value: "b" }], "string")
    expect(merged).toMatchObject({ values: ["a", "b"], names: undefined, added: 1, alreadyPresent: 1 })
  })

  test("turns on display labels when the file has them, keeping existing options' text", () => {
    const merged = mergeImportedOptions(["a"], undefined, [{ value: "b", label: "Bee" }], "string")
    expect(merged.values).toEqual(["a", "b"])
    expect(merged.names).toEqual(["a", "Bee"])
  })

  test("keeps display labels on when the field already has them", () => {
    const merged = mergeImportedOptions(["a"], ["Ay"], [{ value: "b" }], "string")
    expect(merged.names).toEqual(["Ay", "b"])
  })

  test("numeric fields take numbers and skip the rest", () => {
    const merged = mergeImportedOptions([], undefined, [{ value: "1" }, { value: "x" }, { value: "2.5" }], "number")
    expect(merged).toMatchObject({ values: [1, 2.5], added: 2, notNumbers: 1 })
  })
})

function Host({
  initialSchema,
  initialUi = {},
  onChanged,
}: {
  initialSchema: object
  initialUi?: object
  onChanged: (s: any) => void
}) {
  const [schema, setSchema] = useState(JSON.stringify(initialSchema))
  return (
    <FormBuilder
      schema={schema}
      uiSchema={JSON.stringify(initialUi)}
      onChange={(newSchema) => {
        setSchema(newSchema)
        onChanged(JSON.parse(newSchema))
      }}
    />
  )
}

const upload = (content: string, name = "options.csv") => {
  const input = document.querySelector("[data-test='import-options-file']") as HTMLInputElement
  fireEvent.change(input, { target: { files: [new File([content], name, { type: "text/csv" })] } })
}

describe("importing options in the builder", () => {
  afterEach(cleanup)

  const dropdown = {
    type: "object",
    properties: { country: { type: "string", title: "Country", enum: ["Canada"] } },
  }
  const checkboxes = {
    type: "object",
    properties: {
      langs: { type: "array", title: "Languages", items: { type: "string", enum: [] }, uniqueItems: true },
    },
  }

  test("a dropdown gets the imported options added to its list", async () => {
    let latest: any
    render(<Host initialSchema={dropdown} onChanged={(s) => (latest = s)} />)
    fireEvent.click(screen.getByText("Country"))
    upload("Canada\nFrance\nSpain\nFrance")

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(
        "Added 2 options (skipped 1 repeated in the file, 1 already in the list)."
      )
    )
    expect(latest.properties.country.enum).toEqual(["Canada", "France", "Spain"])
  })

  test("a checkboxes list takes options and labels from a two-column file", async () => {
    let latest: any
    render(<Host
        initialSchema={checkboxes}
        initialUi={{ langs: { "ui:widget": "checkboxes" } }}
        onChanged={(s) => (latest = s)}
      />)
    fireEvent.click(screen.getByText("Languages"))
    upload("value,label\nfr,French\nes,Spanish")

    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Added 2 options."))
    expect(latest.properties.langs.items.enum).toEqual(["fr", "es"])
    expect(latest.properties.langs.items.enumNames).toEqual(["French", "Spanish"])
  })

  test("an empty or oversized file shows a message and changes nothing", async () => {
    let latest: any
    render(<Host initialSchema={dropdown} onChanged={(s) => (latest = s)} />)
    fireEvent.click(screen.getByText("Country"))

    upload("\n\n")
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("No options were found in that file.")
    )

    upload(Array.from({ length: 1001 }, (_, i) => `option ${i}`).join("\n"))
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(
        "That file has 1001 options; the limit is 1000."
      )
    )
    expect(latest).toBeUndefined()
  })

  test("remove all options clears the list after confirming", () => {
    let latest: any
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true)
    render(
      <Host
        initialSchema={{
          type: "object",
          properties: { pick: { type: "string", title: "Pick", enum: ["a", "b", "c"] } },
        }}
        onChanged={(s) => (latest = s)}
      />
    )
    fireEvent.click(screen.getByText("Pick"))
    fireEvent.click(screen.getByText("Remove all options"))
    expect(confirm).toHaveBeenCalledWith("Remove all 3 options?")
    expect(latest.properties.pick.enum).toEqual([])
    confirm.mockRestore()
  })
})
