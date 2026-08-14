import React, { useState } from "react"
import FBCheckbox from "../checkbox/FBCheckbox"
import Tooltip from "../Tooltip"
import { getRandomId } from "../utils"
import type { FormInput, CardComponentType, CardComponentPropsType } from "../types"
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "../fieldLayout"

type NumberParameter =
  | "multipleOf"
  | "minimum"
  | "exclusiveMinimum"
  | "maximum"
  | "exclusiveMaximum"

const hasNumberValue = (value: number | null | undefined): value is number =>
  typeof value === "number"

const updateNumberParameter = (
  parameters: CardComponentPropsType,
  key: NumberParameter,
  value: number | null,
  inactiveKey?: NumberParameter
) => {
  const nextParameters = { ...parameters }

  if (inactiveKey) delete nextParameters[inactiveKey]

  if (value === null) {
    delete nextParameters[key]
  } else {
    nextParameters[key] = value
  }

  return nextParameters
}

// specify the inputs required for a number type object
const CardNumberParameterInputs: CardComponentType = ({ parameters, onChange }) => {
  const [elementId] = useState(getRandomId())
  return (
    <div className={fieldStackClass}>
      <div className={fieldClass}>
        <div className={fieldLabelClass}>
          Multiple of{" "}
          <Tooltip
            id={`${elementId}_multiple`}
            type="help"
            text="Require number to be a multiple of this number"
          />
        </div>
        <input
          value={parameters.multipleOf ? parameters.multipleOf : ""}
          placeholder="ex: 2"
          key="multipleOf"
          type="number"
          onChange={(ev) => {
            let newVal: null | number = parseFloat(ev.target.value)
            if (Number.isNaN(newVal)) newVal = null
            onChange(updateNumberParameter(parameters, "multipleOf", newVal))
          }}
          className={`input input-primary input-bordered focus:outline-secondary input-sm ${fieldControlClass}`}
        />
      </div>
      <div className={fieldClass}>
        <div className={fieldLabelClass}>Minimum</div>
        <input
          value={parameters.minimum ?? parameters.exclusiveMinimum ?? ""}
          placeholder="ex: 3"
          key="minimum"
          type="number"
          onChange={(ev) => {
            let newVal: null | number = parseFloat(ev.target.value)
            if (Number.isNaN(newVal)) newVal = null
            // change either min or exclusiveMin depending on which one is active
            if (hasNumberValue(parameters.exclusiveMinimum)) {
              onChange(
                updateNumberParameter(parameters, "exclusiveMinimum", newVal, "minimum")
              )
            } else {
              onChange(
                updateNumberParameter(parameters, "minimum", newVal, "exclusiveMinimum")
              )
            }
          }}
          className={`input input-primary input-bordered focus:outline-secondary input-sm ${fieldControlClass}`}
        />
      </div>
      <div className={`${fieldClass} card-modal-boolean`}>
        <FBCheckbox
          // @ts-ignore: suppress key error, can't change key assignment
          key="exclusiveMinimum"
          onChangeValue={() => {
            const newMin = parameters.minimum ?? parameters.exclusiveMinimum
            if (!hasNumberValue(newMin)) return

            if (hasNumberValue(parameters.exclusiveMinimum)) {
              onChange(
                updateNumberParameter(parameters, "minimum", newMin, "exclusiveMinimum")
              )
            } else {
              onChange(
                updateNumberParameter(parameters, "exclusiveMinimum", newMin, "minimum")
              )
            }
          }}
          isChecked={hasNumberValue(parameters.exclusiveMinimum)}
          disabled={
            !hasNumberValue(parameters.minimum) &&
            !hasNumberValue(parameters.exclusiveMinimum)
          }
          label="Exclusive Minimum"
        />
      </div>
      <div className={fieldClass}>
        <div className={fieldLabelClass}>Maximum</div>
        <input
          value={parameters.maximum ?? parameters.exclusiveMaximum ?? ""}
          placeholder="ex: 8"
          key="maximum"
          type="number"
          onChange={(ev) => {
            let newVal: null | number = parseFloat(ev.target.value)
            if (Number.isNaN(newVal)) newVal = null
            // change either max or exclusiveMax depending on which one is active
            if (hasNumberValue(parameters.exclusiveMaximum)) {
              onChange(
                updateNumberParameter(parameters, "exclusiveMaximum", newVal, "maximum")
              )
            } else {
              onChange(
                updateNumberParameter(parameters, "maximum", newVal, "exclusiveMaximum")
              )
            }
          }}
          className={`input input-primary input-bordered focus:outline-secondary input-sm ${fieldControlClass}`}
        />
      </div>
      <div className={`${fieldClass} card-modal-boolean`}>
        <FBCheckbox
          // @ts-ignore: suppress key error, can't change key assignment
          key="exclusiveMaximum"
          onChangeValue={() => {
            const newMax = parameters.maximum ?? parameters.exclusiveMaximum
            if (!hasNumberValue(newMax)) return

            if (hasNumberValue(parameters.exclusiveMaximum)) {
              onChange(
                updateNumberParameter(parameters, "maximum", newMax, "exclusiveMaximum")
              )
            } else {
              onChange(
                updateNumberParameter(parameters, "exclusiveMaximum", newMax, "maximum")
              )
            }
          }}
          isChecked={hasNumberValue(parameters.exclusiveMaximum)}
          disabled={
            !hasNumberValue(parameters.maximum) &&
            !hasNumberValue(parameters.exclusiveMaximum)
          }
          label="Exclusive Maximum"
        />
      </div>
    </div>
  )
}

const NumberField: CardComponentType = ({ parameters, onChange }) => {
  return (
    <React.Fragment>
      <h5>Default Number</h5>
      <input
        value={(parameters.default ?? "") as string | number | readonly string[]}
        placeholder="Default"
        type="number"
        onChange={(ev) =>
          onChange({
            ...parameters,
            default: parseFloat(ev.target.value),
          })
        }
        className="input input-primary input-bordered focus:outline-secondary w-full"
      />
    </React.Fragment>
  )
}

const numberInputs: { [key: string]: FormInput } = {
  integer: {
    displayName: "Integer",
    matchIf: [
      {
        types: ["integer"],
      },
      {
        types: ["integer"],
        widget: "number",
      },
    ],
    defaultDataSchema: {},
    defaultUiSchema: {},
    type: "integer",
    cardBody: NumberField,
    modalBody: CardNumberParameterInputs,
  },
  number: {
    displayName: "Number",
    matchIf: [
      {
        types: ["number"],
      },
    ],
    defaultDataSchema: {},
    defaultUiSchema: {},
    type: "number",
    cardBody: NumberField,
    modalBody: CardNumberParameterInputs,
  },
}

export default numberInputs
