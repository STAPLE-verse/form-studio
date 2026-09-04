import React from "react"
import FBCheckbox from "../checkbox/FBCheckbox"
import type { CardComponentPropsType, CardComponentType, FormInput } from "../types"
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "../fieldLayout"

type ArrayIntegerConstraint = "minItems" | "maxItems"
type ItemIntegerConstraint = "minLength" | "maxLength"

function parseOptionalNonNegativeInteger(value: string): number | undefined | null {
  if (value === "") return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}

export function updateArrayIntegerConstraint(
  parameters: CardComponentPropsType,
  key: ArrayIntegerConstraint,
  value: string
): CardComponentPropsType {
  const parsed = parseOptionalNonNegativeInteger(value)
  if (parsed === null) return parameters
  if (
    parsed !== undefined &&
    ((key === "minItems" && typeof parameters.maxItems === "number" && parsed > parameters.maxItems) ||
      (key === "maxItems" && typeof parameters.minItems === "number" && parsed < parameters.minItems))
  ) {
    return parameters
  }

  const next = { ...parameters }
  if (parsed === undefined) delete next[key]
  else next[key] = parsed
  return next
}

export function updateItemConstraint(
  parameters: CardComponentPropsType,
  key: ItemIntegerConstraint | "pattern",
  value: string
): CardComponentPropsType {
  const items: { [key: string]: any } = { ...(parameters.items || {}), type: "string" }
  if (key === "pattern") {
    if (value === "") delete items.pattern
    else items.pattern = value
  } else {
    const parsed = parseOptionalNonNegativeInteger(value)
    if (parsed === null) return parameters
    if (
      parsed !== undefined &&
      ((key === "minLength" && typeof items.maxLength === "number" && parsed > items.maxLength) ||
        (key === "maxLength" && typeof items.minLength === "number" && parsed < items.minLength))
    ) {
      return parameters
    }
    if (parsed === undefined) delete items[key]
    else items[key] = parsed
  }
  return { ...parameters, items }
}

const constraintValue = (value: unknown) => (typeof value === "number" ? value : "")

export const StringArrayParameterInputs: CardComponentType = ({ parameters, onChange }) => {
  const items = parameters.items || {}

  return (
    <div className={fieldStackClass} data-string-array-constraints="true">
      <div className="rounded-lg border border-base-300 bg-base-200 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">Item type</span>
          <span className="badge badge-ghost">Text (string)</span>
        </div>
        <p className="mt-2 text-xs text-base-content/70">
          The item type is fixed to keep this editor lossless. Other array shapes remain read-only.
        </p>
      </div>

      <div className={fieldClass}>
        <div className={fieldLabelClass}>Minimum items</div>
        <input
          value={constraintValue(parameters.minItems)}
          placeholder="No minimum"
          type="number"
          min={0}
          max={parameters.maxItems}
          step={1}
          onChange={(event) =>
            onChange(updateArrayIntegerConstraint(parameters, "minItems", event.target.value))
          }
          className={`input input-primary input-bordered input-sm ${fieldControlClass}`}
        />
      </div>

      <div className={fieldClass}>
        <div className={fieldLabelClass}>Maximum items</div>
        <input
          value={constraintValue(parameters.maxItems)}
          placeholder="No maximum"
          type="number"
          min={parameters.minItems ?? 0}
          step={1}
          onChange={(event) =>
            onChange(updateArrayIntegerConstraint(parameters, "maxItems", event.target.value))
          }
          className={`input input-primary input-bordered input-sm ${fieldControlClass}`}
        />
      </div>

      <div className={`${fieldClass} card-modal-boolean`}>
        <FBCheckbox
          onChangeValue={() => {
            const next = { ...parameters }
            if (parameters.uniqueItems === true) delete next.uniqueItems
            else next.uniqueItems = true
            onChange(next)
          }}
          isChecked={parameters.uniqueItems === true}
          label="Require unique items"
        />
      </div>

      <div className={fieldClass}>
        <div className={fieldLabelClass}>Minimum item length</div>
        <input
          value={constraintValue(items.minLength)}
          placeholder="No minimum"
          type="number"
          min={0}
          max={typeof items.maxLength === "number" ? items.maxLength : undefined}
          step={1}
          onChange={(event) =>
            onChange(updateItemConstraint(parameters, "minLength", event.target.value))
          }
          className={`input input-primary input-bordered input-sm ${fieldControlClass}`}
        />
      </div>

      <div className={fieldClass}>
        <div className={fieldLabelClass}>Maximum item length</div>
        <input
          value={constraintValue(items.maxLength)}
          placeholder="No maximum"
          type="number"
          min={typeof items.minLength === "number" ? items.minLength : 0}
          step={1}
          onChange={(event) =>
            onChange(updateItemConstraint(parameters, "maxLength", event.target.value))
          }
          className={`input input-primary input-bordered input-sm ${fieldControlClass}`}
        />
      </div>

      <div className={fieldClass}>
        <div className={fieldLabelClass}>Item pattern</div>
        <input
          value={typeof items.pattern === "string" ? items.pattern : ""}
          placeholder="Optional regular expression"
          type="text"
          onChange={(event) =>
            onChange(updateItemConstraint(parameters, "pattern", event.target.value))
          }
          className={`input input-primary input-bordered input-sm ${fieldControlClass}`}
        />
      </div>
    </div>
  )
}

const StringArrayField: CardComponentType = () => null

const stringArrayInputs: { [key: string]: FormInput } = {
  stringArray: {
    displayName: "List of text values",
    matchIf: [{ types: ["array"] }],
    defaultDataSchema: {
      items: { type: "string" },
    },
    defaultUiSchema: {},
    type: "array",
    cardBody: StringArrayField,
    modalBody: StringArrayParameterInputs,
  },
}

export default stringArrayInputs
