import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import FBCheckbox from "../checkbox/FBCheckbox";
import Tooltip from "../Tooltip";
import { getRandomId } from "../utils";
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "../fieldLayout";
// specify the inputs required for a number type object
const CardNumberParameterInputs = ({ parameters, onChange }) => {
    const [elementId] = useState(getRandomId());
    return (_jsxs("div", { className: fieldStackClass, children: [_jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: fieldLabelClass, children: ["Multiple of", " ", _jsx(Tooltip, { id: `${elementId}_multiple`, type: "help", text: "Require number to be a multiple of this number" })] }), _jsx("input", { value: parameters.multipleOf ? parameters.multipleOf : "", placeholder: "ex: 2", type: "number", onChange: (ev) => {
                            let newVal = parseFloat(ev.target.value);
                            if (Number.isNaN(newVal))
                                newVal = null;
                            onChange({
                                ...parameters,
                                multipleOf: newVal,
                            });
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "multipleOf")] }), _jsxs("div", { className: fieldClass, children: [_jsx("div", { className: fieldLabelClass, children: "Minimum" }), _jsx("input", { value: parameters.minimum || parameters.exclusiveMinimum || "", placeholder: "ex: 3", type: "number", onChange: (ev) => {
                            let newVal = parseFloat(ev.target.value);
                            if (Number.isNaN(newVal))
                                newVal = null;
                            // change either min or exclusiveMin depending on which one is active
                            if (parameters.exclusiveMinimum) {
                                onChange({
                                    ...parameters,
                                    exclusiveMinimum: newVal,
                                    minimum: null,
                                });
                            }
                            else {
                                onChange({
                                    ...parameters,
                                    minimum: newVal,
                                    exclusiveMinimum: null,
                                });
                            }
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "minimum")] }), _jsx("div", { className: `${fieldClass} card-modal-boolean`, children: _jsx(FBCheckbox
                // @ts-ignore: suppress key error, can't change key assignment
                , { onChangeValue: () => {
                        const newMin = parameters.minimum || parameters.exclusiveMinimum;
                        if (parameters.exclusiveMinimum) {
                            onChange({
                                ...parameters,
                                exclusiveMinimum: null,
                                minimum: newMin,
                            });
                        }
                        else {
                            onChange({
                                ...parameters,
                                exclusiveMinimum: newMin,
                                minimum: null,
                            });
                        }
                    }, isChecked: !!parameters.exclusiveMinimum, disabled: !parameters.minimum && !parameters.exclusiveMinimum, label: "Exclusive Minimum" }, "exclusiveMinimum") }), _jsxs("div", { className: fieldClass, children: [_jsx("div", { className: fieldLabelClass, children: "Maximum" }), _jsx("input", { value: parameters.maximum || parameters.exclusiveMaximum || "", placeholder: "ex: 8", type: "number", onChange: (ev) => {
                            let newVal = parseFloat(ev.target.value);
                            if (Number.isNaN(newVal))
                                newVal = null;
                            // change either max or exclusiveMax depending on which one is active
                            if (parameters.exclusiveMinimum) {
                                onChange({
                                    ...parameters,
                                    exclusiveMaximum: newVal,
                                    maximum: null,
                                });
                            }
                            else {
                                onChange({
                                    ...parameters,
                                    maximum: newVal,
                                    exclusiveMaximum: null,
                                });
                            }
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "maximum")] }), _jsx("div", { className: `${fieldClass} card-modal-boolean`, children: _jsx(FBCheckbox
                // @ts-ignore: suppress key error, can't change key assignment
                , { onChangeValue: () => {
                        const newMax = parameters.maximum || parameters.exclusiveMaximum;
                        if (parameters.exclusiveMaximum) {
                            onChange({
                                ...parameters,
                                exclusiveMaximum: null,
                                maximum: newMax,
                            });
                        }
                        else {
                            onChange({
                                ...parameters,
                                exclusiveMaximum: newMax,
                                maximum: null,
                            });
                        }
                    }, isChecked: !!parameters.exclusiveMaximum, disabled: !parameters.maximum && !parameters.exclusiveMaximum, label: "Exclusive Maximum" }, "exclusiveMaximum") })] }));
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
