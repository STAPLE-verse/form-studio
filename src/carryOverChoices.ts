// Radio and Dropdown keep their answer choices in `enum` (+ `enumNames` for display
// labels); Checkboxes keeps them in `items.enum` (+ `items.enumNames`).
const FLAT_CHOICE_CATEGORIES = ["radio", "dropdown"]
const CHOICE_CATEGORIES = [...FLAT_CHOICE_CATEGORIES, "checkboxes"]

interface ChoiceHolder {
  category?: string
  type?: unknown
  enum?: unknown[]
  enumNames?: unknown
  items?: unknown
}

function readChoices(params: ChoiceHolder): { values: unknown[]; names?: string[] } {
  const source: ChoiceHolder =
    params.category === "checkboxes" ? ((params.items as ChoiceHolder) ?? {}) : params
  return {
    values: Array.isArray(source.enum) ? source.enum : [],
    names: Array.isArray(source.enumNames) ? source.enumNames.map((name) => `${name}`) : undefined,
  }
}

// When the field type is changed between two choice types, returns the answer choices
// reshaped for the new type so they survive the switch. Returns nothing to carry over
// when either side has no choices (e.g. switching to or from Short Answer).
export function carryOverChoices(
  current: ChoiceHolder,
  newCategory: string
): { [key: string]: unknown } {
  if (
    !current.category ||
    current.category === newCategory ||
    !CHOICE_CATEGORIES.includes(current.category) ||
    !CHOICE_CATEGORIES.includes(newCategory)
  ) {
    return {}
  }

  const { values, names } = readChoices(current)

  if (newCategory === "checkboxes") {
    // checkbox options are always strings
    return {
      items: {
        type: "string",
        enum: values.map((value) => `${value}`),
        ...(names ? { enumNames: names } : {}),
      },
    }
  }

  return {
    enum: values,
    ...(names ? { enumNames: names } : {}),
    // Radio <-> Dropdown keeps a forced-number type; from Checkboxes it is a string
    ...(current.category !== "checkboxes" && current.type ? { type: current.type } : {}),
  }
}
