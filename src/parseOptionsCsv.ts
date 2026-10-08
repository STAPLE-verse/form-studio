export const MAX_IMPORTED_OPTIONS = 1000

export interface ImportedOption {
  value: string
  label?: string
}

export interface ParsedOptions {
  options: ImportedOption[]
  /** Rows dropped because the same value appeared earlier in the file. */
  duplicates: number
}

const HEADER_WORDS = ["value", "values", "option", "options", "label", "labels", "name", "names"]
const DELIMITERS = [",", "\t", ";"]

// Splits CSV text into rows of cells: quoted cells may hold delimiters, line breaks and
// doubled quotes ("").
function splitRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]!
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else {
      cell += char
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

// Picks the delimiter that appears most in the first line (comma unless another clearly wins)
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ""
  let best = ","
  let bestCount = 0
  for (const delimiter of DELIMITERS) {
    const count = firstLine.split(delimiter).length - 1
    if (count > bestCount) {
      best = delimiter
      bestCount = count
    }
  }
  return best
}

// Reads a list of answer choices from CSV/text: one option per row, with an optional second
// column giving the label shown to people. A header row (e.g. "value,label") is ignored.
export function parseOptionsCsv(input: string): ParsedOptions {
  const text = input.replace(/^﻿/, "")
  const rows = splitRows(text, detectDelimiter(text))
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell !== ""))

  if (rows.length > 0 && HEADER_WORDS.includes(rows[0]![0]!.toLowerCase())) rows.shift()

  const seen = new Set<string>()
  const options: ImportedOption[] = []
  let duplicates = 0
  rows.forEach((row) => {
    const value = row[0] ?? ""
    if (value === "") return
    if (seen.has(value)) {
      duplicates += 1
      return
    }
    seen.add(value)
    const label = row[1]
    options.push(label ? { value, label } : { value })
  })
  return { options, duplicates }
}
