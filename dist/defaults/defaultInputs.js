import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import FBCheckbox from "../checkbox/FBCheckbox";
import CardEnumOptions from "../CardEnumOptions";
import { getRandomId } from "../utils";
// specify the inputs required for a string type object
export const CardDefaultParameterInputs = () => _jsx("div", {});
const getInputCardBodyComponent = ({ type }) => function InputCardBodyComponent({ parameters, onChange, }) {
    return (_jsxs(React.Fragment, { children: [_jsx("h5", { children: "Default Value" }), _jsx("input", { value: (parameters.default || ""), placeholder: "Default", type: type, onChange: (ev) => onChange({ ...parameters, default: ev.target.value }), className: "input input-primary input-bordered w-full" })] }));
};
const Checkbox = ({ parameters, onChange }) => {
    return (_jsx("div", { className: "card-boolean", children: _jsx(FBCheckbox, { onChangeValue: () => {
                onChange({
                    ...parameters,
                    default: parameters.default ? parameters.default !== true : true,
                });
            }, isChecked: parameters.default ? parameters.default === true : false, label: "Default Unchecked or Checked" }) }));
};
function MultipleChoice({ parameters, onChange, }) {
    // no longer needed
    const enumArray = Array.isArray(parameters.enum) ? parameters.enum : [];
    const containsUnparsableString = enumArray.some((val) => {
        return isNaN(val);
    });
    const containsString = containsUnparsableString || enumArray.some((val) => typeof val === "string");
    const [isNumber, setIsNumber] = React.useState(!!enumArray.length && !containsString);
    const [elementId] = React.useState(getRandomId());
    return (_jsxs("div", { className: "card-enum", children: [_jsx("h5", { children: "Possible Values" }), _jsx(FBCheckbox, { onChangeValue: () => {
                    if (Array.isArray(parameters.enumNames)) {
                        // remove the enumNames
                        onChange({
                            ...parameters,
                            enumNames: null,
                        });
                    }
                    else {
                        // create enumNames as a copy of enum values
                        onChange({
                            ...parameters,
                            enumNames: enumArray.map((val) => `${val}`),
                        });
                    }
                }, isChecked: Array.isArray(parameters.enumNames), label: "Display different text label than the stored value", id: `${elementId}_different` }), _jsx("div", { className: containsUnparsableString || !enumArray.length ? "hidden" : "", children: _jsx(FBCheckbox, { onChangeValue: () => {
                        if (containsString || !isNumber) {
                            // attempt converting enum values into numbers
                            try {
                                const newEnum = enumArray.map((val) => {
                                    let newNum = 0;
                                    if (val)
                                        newNum = parseFloat(val) || 0;
                                    if (Number.isNaN(newNum))
                                        throw new Error(`Could not convert ${val}`);
                                    return newNum;
                                });
                                setIsNumber(true);
                                onChange({
                                    ...parameters,
                                    enum: newEnum,
                                });
                            }
                            catch (error) {
                                console.error(error);
                            }
                        }
                        else {
                            // convert enum values back into strings
                            const newEnum = enumArray.map((val) => `${val || 0}`);
                            setIsNumber(false);
                            onChange({
                                ...parameters,
                                enum: newEnum,
                            });
                        }
                    }, isChecked: isNumber, disabled: containsUnparsableString, label: "Force number", id: `${elementId}_forceNumber` }) }), _jsx(CardEnumOptions, { initialValues: enumArray, names: Array.isArray(parameters.enumNames)
                    ? parameters.enumNames.map((val) => `${val}`)
                    : undefined, showNames: Array.isArray(parameters.enumNames), onChange: (newEnum, newEnumNames) => onChange({
                    ...parameters,
                    enum: newEnum,
                    enumNames: newEnumNames,
                }), type: isNumber ? "number" : "string" })] }));
}
function MultipleChoiceArray({ parameters, onChange, }) {
    const items = parameters.items || {};
    const enumArray = Array.isArray(items.enum) ? items.enum : [];
    const [elementId] = React.useState(getRandomId());
    return (_jsxs("div", { className: "card-enum", children: [_jsx("h5", { children: "Options" }), _jsx(FBCheckbox, { onChangeValue: () => {
                    const hasNames = Array.isArray(items.enumNames);
                    onChange({
                        ...parameters,
                        items: {
                            ...items,
                            enumNames: hasNames ? null : enumArray.map((val) => `${val}`),
                        },
                    });
                }, isChecked: Array.isArray(items.enumNames), label: "Display different text label than the stored value", id: `${elementId}_different` }), _jsx(CardEnumOptions, { initialValues: enumArray, names: Array.isArray(items.enumNames) ? items.enumNames.map((val) => `${val}`) : undefined, showNames: Array.isArray(items.enumNames), onChange: (newEnum, newEnumNames) => onChange({
                    ...parameters,
                    items: { ...items, enum: newEnum, enumNames: newEnumNames },
                }), type: "string" })] }));
}
const defaultInputs = {
    dateTime: {
        displayName: "Date-Time",
        matchIf: [
            {
                types: ["string"],
                format: "date-time",
            },
        ],
        defaultDataSchema: {
            format: "date-time",
        },
        defaultUiSchema: {},
        type: "string",
        cardBody: getInputCardBodyComponent({ type: "datetime-local" }),
        modalBody: CardDefaultParameterInputs,
    },
    date: {
        displayName: "Date",
        matchIf: [
            {
                types: ["string"],
                format: "date",
            },
        ],
        defaultDataSchema: {
            format: "date",
        },
        defaultUiSchema: {},
        type: "string",
        cardBody: getInputCardBodyComponent({ type: "date" }),
        modalBody: CardDefaultParameterInputs,
    },
    time: {
        displayName: "Time",
        matchIf: [
            {
                types: ["string"],
                format: "time",
            },
        ],
        defaultDataSchema: {
            format: "time",
        },
        defaultUiSchema: {},
        type: "string",
        cardBody: getInputCardBodyComponent({ type: "time" }),
        modalBody: CardDefaultParameterInputs,
    },
    checkbox: {
        displayName: "Yes / No",
        matchIf: [
            {
                types: ["boolean"],
            },
        ],
        defaultDataSchema: {},
        defaultUiSchema: {},
        type: "boolean",
        cardBody: Checkbox,
        modalBody: CardDefaultParameterInputs,
    },
    checkboxes: {
        displayName: "Checkboxes (Multi-select)",
        matchIf: [
            {
                types: ["array"],
                widget: "checkboxes",
            },
        ],
        defaultDataSchema: {
            items: { type: "string", enum: [] },
            uniqueItems: true,
        },
        defaultUiSchema: {
            "ui:widget": "checkboxes",
        },
        type: "array",
        cardBody: MultipleChoiceArray,
        modalBody: CardDefaultParameterInputs,
    },
    radio: {
        displayName: "Radio (Single-select)",
        matchIf: [
            {
                types: ["string", "number", "integer", "array", "boolean", "null"],
                widget: "radio",
                enum: true,
            },
        ],
        defaultDataSchema: { enum: [] },
        defaultUiSchema: {
            "ui:widget": "radio",
        },
        type: "string",
        cardBody: MultipleChoice,
        modalBody: CardDefaultParameterInputs,
    },
    dropdown: {
        displayName: "Dropdown",
        matchIf: [
            {
                types: ["string", "number", "integer", "array", "boolean", "null"],
                enum: true,
            },
        ],
        defaultDataSchema: { enum: [] },
        defaultUiSchema: {},
        type: "string",
        cardBody: MultipleChoice,
        modalBody: CardDefaultParameterInputs,
    },
};
export default defaultInputs;
