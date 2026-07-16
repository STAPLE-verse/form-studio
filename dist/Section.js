import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import MarkdownDescriptionInput from "./MarkdownDescriptionInput";
import FBCheckbox from "./checkbox/FBCheckbox";
import Collapse from "./Collapse/Collapse";
import CardModal from "./CardModal";
import { CardDefaultParameterInputs } from "./defaults/defaultInputs";
import Tooltip from "./Tooltip";
import Add from "./Add";
import Card from "./Card";
import { checkForUnsupportedFeatures, generateElementComponentsFromSchemas, addCardObj, addSectionObj, onDragEnd, DROPPABLE_TYPE, } from "./utils";
import { getRandomId } from "./utils";
import { ArrowsPointingOutIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "./fieldLayout";
const sectionHeadClass = `section-head ${fieldStackClass}`;
const sectionEntryClass = `section-entry ${fieldClass}`;
const sectionLabelClass = fieldLabelClass;
const sectionControlClass = fieldControlClass;
export default function Section({ name, required, schema, uischema, onChange, onNameChange, onRequireToggle, onDependentsChange, onDelete, path, definitionData, definitionUi, hideKey, reference, dependents, dependent, parent, parentProperties, neighborNames, cardOpen, setCardOpen, allFormInputs, mods, categoryHash, dragHandleProps, }) {
    const unsupportedFeatures = checkForUnsupportedFeatures(schema || {}, uischema || {}, allFormInputs);
    const schemaData = schema || {};
    const [cardOpenState, setCardOpenState] = React.useState({});
    // keep name in state to avoid losing focus
    const [keyName, setKeyName] = React.useState(name);
    const [keyError, setKeyError] = React.useState(null);
    // keep requirements in state to avoid rapid updates
    const [modalOpen, setModalOpen] = React.useState(false);
    const [elementId] = React.useState(getRandomId());
    const addProperties = {
        schema,
        uischema,
        mods,
        onChange,
        definitionData,
        definitionUi,
        categoryHash,
    };
    const hideAddButton = schemaData.properties && Object.keys(schemaData.properties).length !== 0;
    return (_jsxs(React.Fragment, { children: [_jsxs(Collapse, { isOpen: cardOpen, toggleCollapse: () => setCardOpen(!cardOpen), title: _jsxs("div", { className: "flex justify-between items-center w-full", children: [_jsxs("span", { onClick: () => setCardOpen(!cardOpen), className: "text-xl font-bold cursor-pointer select-none", children: [schemaData.title || keyName, " ", parent ? (_jsx(Tooltip, { text: `Depends on ${parent}`, id: `${elementId}_parentinfo`, type: "alert" })) : ("")] }), _jsx("span", { ...(dragHandleProps ?? {}), className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-grab active:cursor-grabbing p-1", "data-tip": "Drag to move section", id: `${elementId}_moveinfosection`, children: _jsx(ArrowsPointingOutIcon, { className: "w-6 h-6 stroke-2 text-base-content/50 hover:text-base-content transition-colors", onClick: () => { } }) })] }), className: `section-container sectionContainer ${dependent ? "section-dependent" : ""} ${reference ? "section-reference" : ""}`, children: [_jsxs("div", { className: `section-entries ${reference ? "section-reference" : ""}`, children: [_jsxs("div", { className: sectionHeadClass, children: [reference ? (_jsxs("div", { className: `${sectionEntryClass} section-reference`, children: [_jsx("h5", { className: sectionLabelClass, children: "Reference Section" }), _jsx("select", { className: `select select-bordered ${sectionControlClass} text-primary border-primary border-2 bg-primary-content`, value: reference, onChange: (e) => {
                                                    onChange(schema, uischema, e.target.value);
                                                }, children: Object.keys(definitionData).map((key) => (_jsx("option", { value: `#/definitions/${key}`, children: `#/definitions/${key}` }, `#/definitions/${key}`))) })] })) : (""), _jsxs("div", { className: sectionEntryClass, "data-test": "section-object-name", children: [_jsxs("h5", { className: sectionLabelClass, children: ["Section Variable Name", " ", _jsx(Tooltip, { text: mods &&
                                                            mods.tooltipDescriptions &&
                                                            mods.tooltipDescriptions &&
                                                            typeof mods.tooltipDescriptions.cardSectionObjectName === "string"
                                                            ? mods.tooltipDescriptions.cardSectionObjectName
                                                            : "The name in the downloaded data for this section.", id: `${elementId}_nameinfo`, type: "help" })] }), _jsxs("div", { className: "form-control w-full", children: [_jsx("input", { value: keyName || "", placeholder: "Key", type: "text", onChange: (ev) => setKeyName(ev.target.value), onBlur: (ev) => {
                                                            const { value } = ev.target;
                                                            if (value === name || !(neighborNames && neighborNames.includes(value))) {
                                                                setKeyError(null);
                                                                onNameChange(value);
                                                            }
                                                            else {
                                                                setKeyName(name);
                                                                setKeyError(`"${value}" is already in use.`);
                                                                onNameChange(name);
                                                            }
                                                        }, className: `input input-primary input-bordered ${sectionControlClass} card-text ${keyError !== null ? 'input-error' : ''}`, readOnly: hideKey }), keyError && (_jsx("div", { className: "label px-0 pb-0 pt-1", children: _jsx("span", { className: "label-text-alt text-error", children: keyError }) }))] })] }), _jsxs("div", { className: sectionEntryClass, "data-test": "section-display-name", children: [_jsxs("h5", { className: sectionLabelClass, children: ["Section Display Name", " ", _jsx(Tooltip, { text: mods &&
                                                            mods.tooltipDescriptions &&
                                                            mods.tooltipDescriptions &&
                                                            typeof mods.tooltipDescriptions.cardSectionDisplayName === "string"
                                                            ? mods.tooltipDescriptions.cardSectionDisplayName
                                                            : "The name of the section that will be shown to contributors completing the form.", id: `${elementId}_titleinfo`, type: "help" })] }), _jsx("input", { value: schemaData.title || "", placeholder: "Title", type: "text", onChange: (ev) => onChange({
                                                    ...schema,
                                                    title: ev.target.value,
                                                }, uischema), className: `input input-primary input-bordered ${sectionControlClass} card-text` })] }), _jsxs("div", { className: sectionEntryClass, "data-test": "section-description", children: [_jsxs("h5", { className: sectionLabelClass, children: ["Section Description", " ", _jsx(Tooltip, { text: mods &&
                                                            mods.tooltipDescriptions &&
                                                            mods.tooltipDescriptions &&
                                                            typeof mods.tooltipDescriptions.cardSectionDescription === "string"
                                                            ? mods.tooltipDescriptions.cardSectionDescription
                                                            : "A description of the section which will be visible on the form.", id: `${elementId}_descriptioninfo`, type: "help" })] }), _jsx(MarkdownDescriptionInput, { value: schemaData.description || "", onChange: (val) => onChange({ ...schema, description: val }, uischema) })] }), _jsxs("div", { className: "alert alert-warning mb-4 mt-4 flex-col items-start", style: {
                                            display: unsupportedFeatures.length === 0 ? "none" : "flex",
                                        }, children: [_jsx("h5", { className: "font-bold", children: "Unsupported Features:" }), _jsx("ul", { className: "list-disc pl-5", children: unsupportedFeatures.map((message) => (_jsx("li", { children: message }, `${elementId}_${message}`))) })] })] }), _jsx("div", { className: "section-body", children: _jsx(DragDropContext, { onDragEnd: (result) => onDragEnd(result, {
                                        schema,
                                        uischema,
                                        onChange,
                                        definitionData,
                                        definitionUi,
                                        categoryHash,
                                    }), children: _jsx(Droppable, { droppableId: "droppable", type: DROPPABLE_TYPE, children: (providedDroppable) => (_jsxs("div", { ref: providedDroppable.innerRef, ...providedDroppable.droppableProps, className: "mt-4", children: [generateElementComponentsFromSchemas({
                                                    schemaData: schema,
                                                    uiSchemaData: uischema,
                                                    onChange,
                                                    path,
                                                    definitionData,
                                                    definitionUi,
                                                    cardOpenState,
                                                    setCardOpenState,
                                                    allFormInputs,
                                                    mods,
                                                    categoryHash,
                                                    Card,
                                                    Section,
                                                }).map((element, index) => (
                                                // @ts-ignore: suppress key error, can't change key assignment
                                                _jsx(Draggable, { draggableId: element.key, index: index, children: (providedDraggable, snapshot) => (_jsx("div", { ref: providedDraggable.innerRef, ...providedDraggable.draggableProps, style: providedDraggable.draggableProps.style, className: `pb-4 ${snapshot.isDragging && !snapshot.isDropAnimating ? "opacity-60" : ""}`, children: React.cloneElement(element, {
                                                            dragHandleProps: providedDraggable.dragHandleProps,
                                                        }) })) }, element.key))), providedDroppable.placeholder] })) }) }) }), _jsxs("div", { className: "section-footer", children: [!hideAddButton && mods?.components?.add && mods.components.add(addProperties), !mods?.components?.add && (_jsx(Add, { tooltipDescription: ((mods || {}).tooltipDescriptions || {}).add, addElem: (choice) => {
                                            if (choice === "card") {
                                                addCardObj(addProperties);
                                            }
                                            else if (choice === "section") {
                                                addSectionObj(addProperties);
                                            }
                                        }, hidden: hideAddButton }))] }), _jsx("div", { className: "section-interactions", children: _jsxs("div", { className: "flex items-center justify-end gap-4 w-full mt-6 pt-4 border-t border-base-200", children: [_jsx(FBCheckbox, { onChangeValue: () => onRequireToggle(), isChecked: required, label: "Required", id: `${elementId}_required` }), _jsx("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer p-1", "data-tip": "Additional configurations for this section", id: `${elementId}_editinfo`, children: _jsx(PencilIcon, { className: "w-5 h-5 text-secondary hover:text-primary transition-colors", onClick: () => setModalOpen(true) }) }), _jsx("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer p-1", "data-tip": "Delete section", id: `${elementId}_trashinfo`, children: _jsx(TrashIcon, { className: "w-5 h-5 text-warning hover:text-error transition-colors", onClick: () => (onDelete ? onDelete() : {}) }) })] }) })] }), _jsx(CardModal, { componentProps: {
                            dependents,
                            neighborNames,
                            name: keyName,
                            schema,
                            type: "object",
                            "ui:column": uischema["ui:column"] ?? "",
                            "ui:options": uischema["ui:options"] ?? "",
                        }, isOpen: modalOpen, onClose: () => setModalOpen(false), onChange: (newComponentProps) => {
                            onDependentsChange(newComponentProps.dependents);
                            onChange(schema, {
                                ...uischema,
                                "ui:column": newComponentProps["ui:column"],
                            });
                        }, TypeSpecificParameters: CardDefaultParameterInputs })] }), mods?.components?.add && mods.components.add(parentProperties), !mods?.components?.add && (_jsx(Add, { tooltipDescription: ((mods || {}).tooltipDescriptions || {}).add, addElem: (choice) => {
                    if (choice === "card") {
                        addCardObj(parentProperties);
                    }
                    else if (choice === "section") {
                        addSectionObj(parentProperties);
                    }
                    setCardOpen(false);
                } }))] }));
}
