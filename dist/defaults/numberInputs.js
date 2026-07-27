import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import FBCheckbox from "../checkbox/FBCheckbox";
import Tooltip from "../Tooltip";
import { getRandomId } from "../utils";
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "../fieldLayout";
const hasNumberValue = (value) => typeof value === "number";
const updateNumberParameter = (parameters, key, value, inactiveKey) => {
    const nextParameters = { ...parameters };
    if (inactiveKey)
        delete nextParameters[inactiveKey];
    if (value === null) {
        delete nextParameters[key];
    }
    else {
        nextParameters[key] = value;
    }
    return nextParameters;
};
// specify the inputs required for a number type object
const CardNumberParameterInputs = ({ parameters, onChange }) => {
    const [elementId] = useState(getRandomId());
    return (_jsxs("div", { className: fieldStackClass, children: [_jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: fieldLabelClass, children: ["Multiple of", " ", _jsx(Tooltip, { id: `${elementId}_multiple`, type: "help", text: "Require number to be a multiple of this number" })] }), _jsx("input", { value: parameters.multipleOf ? parameters.multipleOf : "", placeholder: "ex: 2", type: "number", onChange: (ev) => {
                            let newVal = parseFloat(ev.target.value);
                            if (Number.isNaN(newVal))
                                newVal = null;
                            onChange(updateNumberParameter(parameters, "multipleOf", newVal));
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "multipleOf")] }), _jsxs("div", { className: fieldClass, children: [_jsx("div", { className: fieldLabelClass, children: "Minimum" }), _jsx("input", { value: parameters.minimum ?? parameters.exclusiveMinimum ?? "", placeholder: "ex: 3", type: "number", onChange: (ev) => {
                            let newVal = parseFloat(ev.target.value);
                            if (Number.isNaN(newVal))
                                newVal = null;
                            // change either min or exclusiveMin depending on which one is active
                            if (hasNumberValue(parameters.exclusiveMinimum)) {
                                onChange(updateNumberParameter(parameters, "exclusiveMinimum", newVal, "minimum"));
                            }
                            else {
                                onChange(updateNumberParameter(parameters, "minimum", newVal, "exclusiveMinimum"));
                            }
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "minimum")] }), _jsx("div", { className: `${fieldClass} card-modal-boolean`, children: _jsx(FBCheckbox
                // @ts-ignore: suppress key error, can't change key assignment
                , { onChangeValue: () => {
                        const newMin = parameters.minimum ?? parameters.exclusiveMinimum;
                        if (!hasNumberValue(newMin))
                            return;
                        if (hasNumberValue(parameters.exclusiveMinimum)) {
                            onChange(updateNumberParameter(parameters, "minimum", newMin, "exclusiveMinimum"));
                        }
                        else {
                            onChange(updateNumberParameter(parameters, "exclusiveMinimum", newMin, "minimum"));
                        }
                    }, isChecked: hasNumberValue(parameters.exclusiveMinimum), disabled: !hasNumberValue(parameters.minimum) &&
                        !hasNumberValue(parameters.exclusiveMinimum), label: "Exclusive Minimum" }, "exclusiveMinimum") }), _jsxs("div", { className: fieldClass, children: [_jsx("div", { className: fieldLabelClass, children: "Maximum" }), _jsx("input", { value: parameters.maximum ?? parameters.exclusiveMaximum ?? "", placeholder: "ex: 8", type: "number", onChange: (ev) => {
                            let newVal = parseFloat(ev.target.value);
                            if (Number.isNaN(newVal))
                                newVal = null;
                            // change either max or exclusiveMax depending on which one is active
                            if (hasNumberValue(parameters.exclusiveMaximum)) {
                                onChange(updateNumberParameter(parameters, "exclusiveMaximum", newVal, "maximum"));
                            }
                            else {
                                onChange(updateNumberParameter(parameters, "maximum", newVal, "exclusiveMaximum"));
                            }
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "maximum")] }), _jsx("div", { className: `${fieldClass} card-modal-boolean`, children: _jsx(FBCheckbox
                // @ts-ignore: suppress key error, can't change key assignment
                , { onChangeValue: () => {
                        const newMax = parameters.maximum ?? parameters.exclusiveMaximum;
                        if (!hasNumberValue(newMax))
                            return;
                        if (hasNumberValue(parameters.exclusiveMaximum)) {
                            onChange(updateNumberParameter(parameters, "maximum", newMax, "exclusiveMaximum"));
                        }
                        else {
                            onChange(updateNumberParameter(parameters, "exclusiveMaximum", newMax, "maximum"));
                        }
                    }, isChecked: hasNumberValue(parameters.exclusiveMaximum), disabled: !hasNumberValue(parameters.maximum) &&
                        !hasNumberValue(parameters.exclusiveMaximum), label: "Exclusive Maximum" }, "exclusiveMaximum") })] }));
};
const NumberField = ({ parameters, onChange }) => {
    return (_jsxs(React.Fragment, { children: [_jsx("h5", { children: "Default Number" }), _jsx("input", { value: (parameters.default ?? ""), placeholder: "Default", type: "number", onChange: (ev) => onChange({
                    ...parameters,
                    default: parseFloat(ev.target.value),
                }), className: "input input-primary input-bordered w-full" })] }));
};
const numberInputs = {
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
};
export default numberInputs;
