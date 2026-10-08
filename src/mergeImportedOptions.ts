import type { ImportedOption } from "./parseOptionsCsv"

export interface MergedOptions {
  values: Array<string | number>
  names?: string[]
  added: number
  /** Imported options skipped because the field already has them. */
  alreadyPresent: number
  /** Imported options skipped because a number was expected. */
  notNumbers: number
}

// Adds imported options after the field's existing choices. Options the field already has are
// skipped, and blank placeholder rows are dropped. Labels are used if the file gave any (or if
// the field already shows custom labels), otherwise the field stays value-only.
export function mergeImportedOptions(
  existingValues: Array<string | number>,
  existingNames: string[] | undefined,
  imported: ImportedOption[],
  type: string
): MergedOptions {
  const keep = existingValues
    .map((value, index) => ({ value, name: existingNames?.[index] ?? `${value}` }))
    .filter(({ value }) => value !== "")
  const present = new Set(keep.map(({ value }) => `${value}`))
  const numeric = type !== "string"

  let alreadyPresent = 0
  let notNumbers = 0
  const added: Array<{ value: string | number; name: string; hasLabel: boolean }> = []
  imported.forEach(({ value, label }) => {
    let typed: string | number = value
    if (numeric) {
      typed = Number(value)
      if (Number.isNaN(typed)) {
        notNumbers += 1
        return
      }
    }
    if (present.has(`${typed}`)) {
      alreadyPresent += 1
      return
    }
    present.add(`${typed}`)
    added.push({ value: typed, name: label ?? value, hasLabel: label !== undefined })
  })

  const showNames = existingNames !== undefined || added.some((option) => option.hasLabel)
  const all = [...keep, ...added]
  return {
    values: all.map(({ value }) => value),
    names: showNames ? all.map(({ name }) => name) : undefined,
    added: added.length,
    alreadyPresent,
    notNumbers,
  }
}
