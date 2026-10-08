import { generateElementPropsFromSchemas, updateSchemas } from "./utils"
import { nextCopyName } from "./duplicateName"
import type { AddFormObjectParametersType, ElementProps } from "./types"

/** A form the host app lets the user copy items from. */
export interface ItemSourceForm {
  id: string | number
  title: string
  /** Optional extra line, e.g. a version or last-edited date. */
  description?: string
}

/** The JSON of a form, as stored by the host app. */
export interface ItemSourceFormContents {
  schema: { [key: string]: any }
  uiSchema?: { [key: string]: any } | null
}

/**
 * Lets the host app supply the user's other forms so items can be copied from them.
 * Form Studio only ever reads through this; it never writes to the source form.
 */
export interface ItemSource {
  listForms: () => Promise<ItemSourceForm[]>
  getForm: (id: ItemSourceForm["id"]) => Promise<ItemSourceFormContents>
}

export interface CopyableItem {
  name: string
  title: string
  kind: "card" | "section"
  /** Number of answer choices, for items that have a list. */
  choiceCount?: number
  /** Set when the item can't be copied yet, with a reason to show the user. */
  unavailableReason?: string
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

function containsRef(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsRef)
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, child]) => key === "$ref" || containsRef(child))
  }
  return false
}

function sourceElements(
  contents: ItemSourceFormContents,
  categoryHash: { [key: string]: string }
): ElementProps[] {
  return generateElementPropsFromSchemas({
    schema: contents.schema,
    uischema: contents.uiSchema ?? {},
    categoryHash,
  })
}

// The items of a form that can be offered for copying (its top-level items and sections)
export function listCopyableItems(
  contents: ItemSourceFormContents,
  categoryHash: { [key: string]: string }
): CopyableItem[] {
  const properties = contents.schema.properties ?? {}
  return sourceElements(contents, categoryHash).map((element) => {
    const property = properties[element.name]
    const choices = Array.isArray(property?.enum)
      ? property.enum
      : Array.isArray(property?.items?.enum)
        ? property.items.enum
        : undefined
    return {
      name: element.name,
      title: property?.title || element.name,
      kind: element.propType === "section" ? "section" : "card",
      choiceCount: choices?.length,
      unavailableReason: containsRef(property)
        ? "Uses a shared component, which can't be copied yet"
        : undefined,
    }
  })
}

// Adds copies of the named items from `contents` to the form being edited. Each copy is a
// standalone item (the source's conditional "show if" links are not carried over) and is
// renamed if its name is already used.
export function addCopiedItems(
  parameters: AddFormObjectParametersType,
  contents: ItemSourceFormContents,
  names: string[]
) {
  const { schema, uischema, onChange, definitionData, definitionUi, index, categoryHash } =
    parameters
  const wanted = new Set(names)
  const elements = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  })
  const taken = elements.map((element) => element.name)

  // original name -> the name used in this form
  const copies: Array<{ original: string; name: string }> = []
  let insertAt = index !== undefined && index !== null ? index + 1 : elements.length
  sourceElements(contents, categoryHash)
    .filter((element) => wanted.has(element.name))
    .filter((element) => !containsRef(contents.schema.properties?.[element.name]))
    .forEach((element) => {
      const name = taken.includes(element.name) ? nextCopyName(element.name, taken) : element.name
      taken.push(name)
      copies.push({ original: element.name, name })
      elements.splice(insertAt, 0, {
        ...element,
        name,
        dependents: undefined,
        dependent: false,
        parent: undefined,
      })
      insertAt += 1
    })
  if (copies.length === 0) return

  updateSchemas(elements, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
    onChange: (newSchema, newUiSchema) => {
      // The visual model doesn't capture every keyword, so take each copy straight from
      // the source form's JSON so nothing it carried is lost.
      copies.forEach(({ original, name }) => {
        const property = contents.schema.properties?.[original]
        if (property && newSchema.properties?.[name]) {
          newSchema.properties[name] = clone(property)
        }
        const ui = contents.uiSchema?.[original]
        if (ui !== undefined) newUiSchema[name] = clone(ui)
      })
      onChange(newSchema, newUiSchema)
    },
  })
}
