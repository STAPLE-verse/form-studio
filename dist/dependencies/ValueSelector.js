import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import CardEnumOptions from "../CardEnumOptions";
import CardSelector from "./CardSelector";
import FBCheckbox from "../checkbox/FBCheckbox";
import { getRandomId } from "../utils";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
// handle value options for different card types
export default function ValueSelector({ possibility, onChange, parentEnums, parentType, parentName, parentSchema, }) {
    const [elementId] = useState(getRandomId());
    if (possibility.value) {
        // enum type
        if (parentEnums) {
            const enumType = typeof parentEnums[0] === "number" ? "number" : "string";
            if (enumType === "string")
                return (_jsx(CardSelector, { possibleChoices: parentEnums.map((val) => `${val}`), chosenChoices: possibility.value.enum, onChange: (chosenChoices) => onChange({ ...possibility, value: { enum: chosenChoices } }), placeholder: "Allowed value" }));
            if (enumType === "number")
                return (_jsx(CardSelector, { possibleChoices: parentEnums.map((val) => `${val}`), chosenChoices: possibility.value.enum, onChange: (chosenChoices) => onChange({
                        ...possibility,
                        value: {
                            enum: chosenChoices.map((val) => Number.parseFloat(val)),
                        },
                    }), placeholder: "Allowed value" }));
        }
        // check box type
        if (parentType === "boolean") {
            return (_jsx(FBCheckbox, { onChangeValue: () => {
                    if (possibility.value.enum && possibility.value.enum[0]) {
                        onChange({
                            ...possibility,
                            value: { enum: [false] },
                        });
                    }
                    else {
                        onChange({
                            ...possibility,
                            value: { enum: [true] },
                        });
                    }
                }, isChecked: possibility.value.enum && possibility.value.enum[0], label: parentName }));
        }
        // object type
        if (parentType === "object") {
            const enumArr = possibility.value.enum;
            const getInput = (val, index, key) => {
                switch (typeof val) {
                    case "string":
                        return (_jsx("input", { value: val || "", placeholder: "String value", type: "text", onChange: (ev) => {
                                const newVal = ev.target.value;
                                const oldCombo = possibility.value.enum[index];
                                onChange({
                                    ...possibility,
                                    value: {
                                        enum: [
                                            ...enumArr.slice(0, index),
                                            { ...oldCombo, [key]: newVal },
                                            ...enumArr.slice(index + 1),
                                        ],
                                    },
                                });
                            }, className: "input input-bordered input-sm w-full" }));
                        break;
                    case "number":
                        return (_jsx("input", { value: val || "", placeholder: "Number value", type: "number", onChange: (ev) => {
                                const newVal = Number.parseFloat(ev.target.value);
                                const oldCombo = possibility.value.enum[index];
                                onChange({
                                    ...possibility,
                                    value: {
                                        enum: [
                                            ...enumArr.slice(0, index),
                                            { ...oldCombo, [key]: newVal },
                                            ...enumArr.slice(index + 1),
                                        ],
                                    },
                                });
                            }, className: "input input-bordered input-sm w-full" }));
                        break;
                    case "object":
                        return (_jsx("textarea", { value: JSON.stringify(val) || "", placeholder: "Object in JSON", onChange: (ev) => {
                                let newVal = val;
                                try {
                                    newVal = JSON.parse(ev.target.value);
                                }
                                catch {
                                    console.error("invalid JSON object input");
                                }
                                const oldCombo = possibility.value.enum[index];
                                onChange({
                                    ...possibility,
                                    value: {
                                        enum: [
                                            ...enumArr.slice(0, index),
                                            { ...oldCombo, [key]: newVal },
                                            ...enumArr.slice(index + 1),
                                        ],
                                    },
                                });
                            }, className: "textarea textarea-bordered w-full" }));
                        break;
                }
            };
            return (_jsxs("div", { children: [enumArr.map((combination, index) => (_jsxs("li", { children: [Object.keys(combination).map((key) => {
                                const val = combination[key] ?? "";
                                return (_jsxs("div", { children: [_jsxs("h5", { children: [key, ":"] }), getInput(val, index, key)] }, key));
                            }), _jsx(XMarkIcon, { className: "h-5 w-5 stroke-warning hover:stroke-error cursor-pointer mt-2", onClick: () => onChange({
                                    ...possibility,
                                    value: {
                                        enum: [...enumArr.slice(0, index), ...enumArr.slice(index + 1)],
                                    },
                                }) })] }, `${elementId}_possibleValue${index}`))), _jsx("div", { className: "flex justify-start", children: _jsx(PlusIcon, { className: "h-6 w-6 stroke-2 stroke-secondary hover:stroke-primary transition-colors cursor-pointer mt-4", onClick: () => {
                                const newCase = {};
                                const propArr = parentSchema ? parentSchema.properties : {};
                                Object.keys(propArr).forEach((key) => {
                                    if (propArr[key].type === "number" || propArr[key].type === "integer") {
                                        newCase[key] = 0;
                                    }
                                    else if (propArr[key].type === "array" || propArr[key].enum) {
                                        newCase[key] = [];
                                    }
                                    else if (propArr[key].type === "object" || propArr[key].properties) {
                                        newCase[key] = {};
                                    }
                                    else {
                                        newCase[key] = "";
                                    }
                                });
                                onChange({
                                    ...possibility,
                                    value: { enum: [...enumArr, newCase] },
                                });
                            } }) })] }));
        }
        return (_jsx(CardEnumOptions, { initialValues: possibility.value.enum, onChange: (newEnum) => onChange({ ...possibility, value: { enum: newEnum } }), type: parentType || "string", showNames: false }));
    }
    else {
        return _jsx("h5", { children: " Appear if defined " });
    }
}
