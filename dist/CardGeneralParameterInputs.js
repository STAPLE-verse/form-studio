import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import classNames from "./classNames";
import GeneralParameterInputs from "./GeneralParameterInputs";
import MarkdownDescriptionInput from "./MarkdownDescriptionInput";
import { defaultUiProps, defaultDataProps, categoryToNameMap, categoryType, subtractArray, getRandomId, } from "./utils";
import Tooltip from "./Tooltip";
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "./fieldLayout";
const entryRowClass = `card-entry-row ${fieldStackClass}`;
const entryClass = `card-entry ${fieldClass}`;
const entryLabelClass = fieldLabelClass;
const entryControlClass = fieldControlClass;
// specify the inputs required for any type of object
export default function CardGeneralParameterInputs({ parameters, onChange, allFormInputs, mods, showObjectNameInput = true, }) {
    const [keyState, setKeyState] = React.useState(parameters.name);
    const [keyError, setKeyError] = React.useState(null);
    const [titleState, setTitleState] = React.useState(parameters.title);
    const [elementId] = React.useState(getRandomId());
    const categoryMap = categoryToNameMap(allFormInputs);
    const fetchLabel = (labelName, defaultLabel) => {
        return mods && mods.labels && typeof mods.labels[labelName] === "string"
            ? mods.labels[labelName]
            : defaultLabel;
    };
    const objectNameLabel = fetchLabel("objectNameLabel", "Variable Name");
    const displayNameLabel = fetchLabel("displayNameLabel", "Display Name");
    const descriptionLabel = fetchLabel("descriptionLabel", "Description");
    const inputTypeLabel = fetchLabel("inputTypeLabel", "Item Type");
    const availableInputTypes = () => {
        const definitionsInSchema = parameters.definitionData && Object.keys(parameters.definitionData).length !== 0;
        let inputKeys = Object.keys(categoryMap).filter((key) => key !== "ref" || definitionsInSchema);
        if (mods)
            inputKeys = subtractArray(inputKeys, mods.deactivatedFormInputs);
        // Define manual group order
        const groupOrder = [
            "dateTime",
            "date",
            "time",
            "checkbox",
            "checkboxes",
            "radio",
            "dropdown",
            "shortAnswer",
            "password",
            "longAnswer",
            "integer",
            "number",
            //"array",
            "ref",
        ];
        return groupOrder
            .filter((key) => inputKeys.includes(key))
            .map((key) => ({ value: key, label: categoryMap[key] }));
    };
    return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: entryRowClass, children: [showObjectNameInput && (_jsxs("div", { className: entryClass, children: [_jsxs("h5", { className: entryLabelClass, children: [`${objectNameLabel} `, _jsx(Tooltip, { text: mods &&
                                            mods.tooltipDescriptions &&
                                            typeof mods.tooltipDescriptions.cardObjectName === "string"
                                            ? mods.tooltipDescriptions.cardObjectName
                                            : "The name of the item when you download the data", id: `${elementId}_nameinfo`, type: "help" })] }), _jsxs("div", { className: "form-control w-full", children: [_jsx("input", { value: keyState || "", placeholder: "Key", type: "text", onChange: (ev) => setKeyState(ev.target.value), onBlur: (ev) => {
                                            const { value } = ev.target;
                                            if (value === parameters.name ||
                                                !(parameters.neighborNames && parameters.neighborNames.includes(value))) {
                                                setKeyError(null);
                                                onChange({
                                                    ...parameters,
                                                    name: value,
                                                });
                                            }
                                            else {
                                                setKeyState(parameters.name);
                                                setKeyError(`"${value}" is already in use.`);
                                                onChange({ ...parameters });
                                            }
                                        }, className: `input input-primary input-bordered ${entryControlClass} card-text ${keyError !== null ? 'input-error' : ''}` }), keyError && (_jsx("div", { className: "label px-0 pb-0 pt-1", children: _jsx("span", { className: "label-text-alt text-error", children: keyError }) }))] })] })), _jsxs("div", { className: entryClass, children: [_jsxs("h5", { className: entryLabelClass, children: [`${displayNameLabel} `, _jsx(Tooltip, { text: mods &&
                                            mods.tooltipDescriptions &&
                                            typeof mods.tooltipDescriptions.cardDisplayName === "string"
                                            ? mods.tooltipDescriptions.cardDisplayName
                                            : "The item name shown on the form", id: `${elementId}-titleinfo`, type: "help" })] }), _jsx("input", { value: titleState || "", placeholder: "Title", type: "text", onChange: (ev) => setTitleState(ev.target.value), onBlur: (ev) => {
                                    onChange({ ...parameters, title: ev.target.value });
                                }, className: `input input-primary input-bordered ${entryControlClass} card-text` })] })] }), _jsxs("div", { className: `${entryRowClass} mt-4`, children: [_jsxs("div", { className: entryClass, children: [_jsxs("h5", { className: entryLabelClass, children: [`${descriptionLabel} `, _jsx(Tooltip, { text: mods &&
                                            mods.tooltipDescriptions &&
                                            typeof mods.tooltipDescriptions.cardDescription === "string"
                                            ? mods.tooltipDescriptions.cardDescription
                                            : "This will appear as help text on the form", id: `${elementId}-descriptioninfo`, type: "help" })] }), _jsx(MarkdownDescriptionInput, { value: parameters.description || "", onChange: (val) => onChange({ ...parameters, description: val }) })] }), _jsxs("div", { className: classNames(entryClass, {
                            "wide-card-entry": !showObjectNameInput,
                        }), children: [_jsxs("h5", { className: entryLabelClass, children: [`${inputTypeLabel} `, _jsx(Tooltip, { text: mods &&
                                            mods.tooltipDescriptions &&
                                            typeof mods.tooltipDescriptions.cardInputType === "string"
                                            ? mods.tooltipDescriptions.cardInputType
                                            : "The type of item displayed on the form", id: `${elementId}-inputinfo`, type: "help" })] }), _jsx("select", { className: `select select-primary select-bordered ${entryControlClass}`, value: parameters.category, onChange: (e) => {
                                    const newCategory = e.target.value;
                                    const newProps = {
                                        ...defaultUiProps(newCategory, allFormInputs),
                                        ...defaultDataProps(newCategory, allFormInputs),
                                        name: parameters.name,
                                        required: parameters.required,
                                    };
                                    if (newProps.$ref !== undefined && !newProps.$ref) {
                                        const firstDefinition = Object.keys(parameters.definitionData)[0];
                                        newProps.$ref = `#/definitions/${firstDefinition || "empty"}`;
                                    }
                                    onChange({
                                        ...newProps,
                                        title: newProps.title || parameters.title,
                                        description: parameters.description,
                                        default: newProps.default || "",
                                        type: newProps.type || categoryType(newCategory, allFormInputs),
                                        category: newProps.category || newCategory,
                                    });
                                }, children: availableInputTypes().map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] })] }), _jsx("div", { className: "card-category-options mt-4 pb-1", children: _jsx(GeneralParameterInputs, { category: parameters.category, parameters: parameters, onChange: onChange, mods: mods, allFormInputs: allFormInputs }) }), _jsx("div", { className: `${entryRowClass} mt-4`, children: _jsxs("div", { className: entryClass, children: [_jsxs("h5", { className: entryLabelClass, children: ["Ontology ID (Optional)", ` `, _jsx(Tooltip, { text: "Bind this field to a standard ontology code (e.g., SNOMED:75367002). This drastically improves the reusability and semantic findability of your template!", id: `${elementId}-ontologyinfo`, type: "help" })] }), _jsx("input", { value: parameters.ontologyId || "", placeholder: "e.g. NCIT:C25150", type: "text", onChange: (ev) => onChange({ ...parameters, ontologyId: ev.target.value }), className: `input input-primary input-bordered ${entryControlClass} card-text` })] }) })] }));
}
