import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { excludeKeys, generateElementComponentsFromSchemas, generateCategoryHash } from "../utils";
import Card from "../Card";
import Section from "../Section";
import FBCheckbox from "../checkbox/FBCheckbox";
import shortAnswerInputs from "./shortAnswerInputs";
import longAnswerInputs from "./longAnswerInputs";
import numberInputs from "./numberInputs";
import defaultInputs from "./defaultInputs";
import { getRandomId } from "../utils";
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "../fieldLayout";
// specify the inputs required for a string type object
const CardArrayParameterInputs = ({ parameters, onChange }) => {
    return (_jsxs("div", { className: fieldStackClass, children: [_jsxs("div", { className: fieldClass, children: [_jsx("div", { className: fieldLabelClass, children: "Minimum Items" }), _jsx("input", { value: parameters.minItems || "", placeholder: "ex: 2", type: "number", onChange: (ev) => {
                            onChange({
                                ...parameters,
                                minItems: parseInt(ev.target.value, 10),
                            });
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "minimum")] }), _jsxs("div", { className: fieldClass, children: [_jsx("div", { className: fieldLabelClass, children: "Maximum Items" }), _jsx("input", { value: parameters.maxItems || "", placeholder: "ex: 2", type: "number", onChange: (ev) => {
                            onChange({
                                ...parameters,
                                maxItems: parseInt(ev.target.value, 10),
                            });
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "maximum")] })] }));
};
const InnerCard = ({ parameters, onChange, mods }) => {
    const [elementId] = useState(getRandomId);
    const newDataProps = {};
    const newUiProps = {};
    const allFormInputs = excludeKeys(Object.assign({}, defaultFormInputs, (mods && mods.customFormInputs) || {}), mods && mods.deactivatedFormInputs);
    // parse components into data and ui relevant pieces
    Object.keys(parameters).forEach((propName) => {
        if (propName.startsWith("ui:*")) {
            newUiProps[propName.substring(4)] = parameters[propName];
        }
        else if (propName.startsWith("ui:")) {
            newUiProps[propName] = parameters[propName];
        }
        else if (!["name", "required"].includes(propName)) {
            newDataProps[propName] = parameters[propName];
        }
    });
    const definitionData = parameters.definitionData ? parameters.definitionData : {};
    const definitionUi = parameters.definitionUi ? parameters.definitionUi : {};
    const [cardOpenState, setCardOpenState] = React.useState({});
    if (parameters.type !== "array") {
        return _jsx("h4", { children: "Not an array " });
    }
    return (_jsxs("div", { className: "card-array", children: [_jsx(FBCheckbox, { onChangeValue: () => {
                    if (newDataProps.items.type === "object") {
                        onChange({
                            ...parameters,
                            items: {
                                ...newDataProps.items,
                                type: "string",
                            },
                        });
                    }
                    else {
                        onChange({
                            ...parameters,
                            items: {
                                ...newDataProps.items,
                                type: "object",
                            },
                        });
                    }
                }, isChecked: newDataProps.items.type === "object", label: "Section", id: `${elementId}_issection` }), generateElementComponentsFromSchemas({
                schemaData: { properties: { item: newDataProps.items } },
                uiSchemaData: { item: newUiProps.items },
                onChange: (schema, uischema) => {
                    onChange({
                        ...parameters,
                        items: schema.properties.item,
                        "ui:*items": uischema.item || {},
                    });
                },
                path: elementId,
                definitionData,
                definitionUi,
                hideKey: true,
                cardOpenState,
                setCardOpenState,
                allFormInputs,
                mods,
                categoryHash: generateCategoryHash(allFormInputs),
                Card: (props) => _jsx(Card, { ...props, showObjectNameInput: false }),
                Section,
            })] }));
};
function getInnerCardComponent() {
    return InnerCard;
}
const defaultFormInputs = {
    ...defaultInputs,
    ...shortAnswerInputs,
    ...longAnswerInputs,
    ...numberInputs,
};
defaultFormInputs.array = {
    displayName: "Array",
    matchIf: [
        {
            types: ["array"],
        },
    ],
    defaultDataSchema: {
        items: { type: "string" },
    },
    defaultUiSchema: {},
    type: "array",
    cardBody: getInnerCardComponent(),
    modalBody: CardArrayParameterInputs,
};
const ArrayInputs = {
    array: {
        displayName: "Array",
        matchIf: [
            {
                types: ["array"],
            },
        ],
        defaultDataSchema: {
            items: { type: "string" },
        },
        defaultUiSchema: {},
        type: "array",
        cardBody: getInnerCardComponent(),
        modalBody: CardArrayParameterInputs,
    },
};
export default ArrayInputs;
