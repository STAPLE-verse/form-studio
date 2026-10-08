import React, { ReactElement, useRef, useState } from "react"
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline"
import { MAX_IMPORTED_OPTIONS, parseOptionsCsv } from "./parseOptionsCsv"
import { mergeImportedOptions } from "./mergeImportedOptions"

const MAX_IMPORT_FILE_BYTES = 1024 * 1024

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(`${reader.result ?? ""}`)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

interface CardEnumOptionsProps {
  initialValues: Array<any>
  names?: Array<string>
  showNames: boolean
  onChange: (newEnums: Array<any>, newEnumNames?: Array<string>) => void
  type: string
}

// Input field corresponding to an array of values, add and remove
export default function CardEnumOptions({
  initialValues,
  names,
  showNames,
  onChange,
  type,
}: CardEnumOptionsProps): ReactElement {
  const fileInput = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<{ error: boolean; text: string } | null>(null)

  const importFile = async (file: File) => {
    setImportMessage(null)
    if (file.size > MAX_IMPORT_FILE_BYTES) {
      setImportMessage({ error: true, text: "That file is too large (the limit is 1 MB)." })
      return
    }
    let text: string
    try {
      text = await readFileText(file)
    } catch {
      setImportMessage({ error: true, text: "That file could not be read." })
      return
    }
    const parsed = parseOptionsCsv(text)
    if (parsed.options.length === 0) {
      setImportMessage({ error: true, text: "No options were found in that file." })
      return
    }
    if (parsed.options.length > MAX_IMPORTED_OPTIONS) {
      setImportMessage({
        error: true,
        text: `That file has ${parsed.options.length} options; the limit is ${MAX_IMPORTED_OPTIONS}.`,
      })
      return
    }
    const merged = mergeImportedOptions(initialValues, names, parsed.options, type)
    onChange(merged.values, merged.names)
    const skipped = [
      parsed.duplicates > 0 && `${parsed.duplicates} repeated in the file`,
      merged.alreadyPresent > 0 && `${merged.alreadyPresent} already in the list`,
      merged.notNumbers > 0 && `${merged.notNumbers} not numbers`,
    ].filter(Boolean)
    setImportMessage({
      error: false,
      text: `Added ${merged.added} option${merged.added === 1 ? "" : "s"}${
        skipped.length > 0 ? ` (skipped ${skipped.join(", ")})` : ""
      }.`,
    })
  }

  const possibleValues = initialValues.map((value, index) => {
    let name = `${value}`
    if (names && index < names.length) name = names[index] ?? ""
    return (
      //@ts-ignore
      <div key={index} className="flex items-center gap-2 mb-2">
        <input
          value={value === undefined || value === null ? "" : value}
          placeholder="Stored Value"
          key={`val-${index}`}
          type={type === "string" ? "text" : "number"}
          onChange={(ev: any) => {
            let newVal
            switch (type) {
              case "string":
                newVal = ev.target.value
                break
              case "number":
              case "integer":
                newVal = parseFloat(ev.target.value)
                if (Number.isInteger(newVal)) newVal = parseInt(ev.target.value, 10)
                // TODO: Possible unused condition, since we know it is a number or integer in this case.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (Number.isNaN(newVal)) newVal = type === "string" ? "" : 0
                break
              default:
                throw new Error(`Enum called with unknown type ${type}`)
            }
            onChange(
              [...initialValues.slice(0, index), newVal, ...initialValues.slice(index + 1)],
              names
            )
          }}
          className="input input-primary input-bordered input-md text-base w-full border-2 focus:!outline-secondary focus:!outline-[3px] focus:!outline-offset-0 focus:![--input-color:var(--color-secondary)]"
        />
        <input
          value={name || ""}
          placeholder="Label"
          key={`name-${index}`}
          type="text"
          onChange={(ev: any) => {
            if (names)
              onChange(initialValues, [
                ...names.slice(0, index),
                ev.target.value,
                ...names.slice(index + 1),
              ])
          }}
          className="input input-primary input-bordered input-md text-base w-full border-2 focus:!outline-secondary focus:!outline-[3px] focus:!outline-offset-0 focus:![--input-color:var(--color-secondary)]"
          style={{ display: showNames ? "initial" : "none" }}
        />
        <span
          className="cursor-pointer"
          onClick={() => {
            // remove this value
            onChange(
              [...initialValues.slice(0, index), ...initialValues.slice(index + 1)],
              names ? [...names.slice(0, index), ...names.slice(index + 1)] : undefined
            )
          }}
        >
          <XMarkIcon className="h-5 w-5 stroke-warning hover:stroke-error transition-colors" />
        </span>
      </div>
    )
  })

  return (
    <React.Fragment>
      {possibleValues}
      <span
        className="tooltip tooltip-right tooltip-info z-10 before:max-w-xs mt-2 inline-flex cursor-pointer"
        data-tip="Add new possible option"
        onClick={() => {
          // add a new dropdown option
          onChange(
            [...initialValues, type === "string" ? "" : 0],
            names ? [...names, ""] : undefined
          )
        }}
      >
        <PlusIcon
          className="h-6 w-6 stroke-secondary transition-colors hover:stroke-primary"
          strokeWidth={4}
        />
      </span>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn text-base btn-primary"
          onClick={() => fileInput.current?.click()}
        >
          Import options from a file
        </button>
        {initialValues.length > 1 && (
          <button
            type="button"
            className="btn text-base btn-secondary"
            onClick={() => {
              if (window.confirm(`Remove all ${initialValues.length} options?`)) {
                onChange([], names ? [] : undefined)
                setImportMessage(null)
              }
            }}
          >
            Remove all options
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="hidden"
          data-test="import-options-file"
          onChange={(event) => {
            const file = event.target.files?.[0]
            // reset so choosing the same file again still triggers a change
            event.target.value = ""
            if (file) void importFile(file)
          }}
        />
      </div>
      <p className="text-base text-base-content/90 mt-2">
        Import a .csv or .txt file with one option per row. Add a second column to give an option
        different display text than its stored value.
      </p>
      {importMessage && (
        <p
          role="status"
          className={`text-base mt-2 ${importMessage.error ? "text-error" : "text-base-content"}`}
          data-test="import-options-message"
        >
          {importMessage.text}
        </p>
      )}
    </React.Fragment>
  )
}
