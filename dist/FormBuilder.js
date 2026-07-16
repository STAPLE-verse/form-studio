"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Card from "./Card";
import Section from "./Section";
import Add from "./Add";
import MarkdownDescriptionInput from "./MarkdownDescriptionInput";
import { parse, stringify, checkForUnsupportedFeatures, generateElementComponentsFromSchemas, addCardObj, addSectionObj, onDragEnd, generateCategoryHash, excludeKeys, DROPPABLE_TYPE, } from "./utils";
import DEFAULT_FORM_INPUTS from "./defaults/defaultFormInputs";
export default function FormBuilder({ schema, uischema, onMount, onChange, mods, className, }) {
    const schemaData = parse(schema);
    schemaData.type = "object";
    const uiSchemaData = parse(uischema);
    const allFormInputs = excludeKeys(Object.assign({}, DEFAULT_FORM_INPUTS, (mods && mods.customFormInputs) || {}), mods && mods.deactivatedFormInputs);
    const unsupportedFeatures = checkForUnsupportedFeatures(schemaData, uiSchemaData, allFormInputs).filter((msg) => !msg.includes("Object Property: _stapleSchema") &&
        !msg.includes("Property Parameter: readOnly in _stapleSchema") &&
        !msg.includes("UI Widget: hidden for _stapleSchema") &&
        !msg.includes("UI schema property: _stapleSchema") &&
        !msg.includes("allOf"));
    const [cardOpenState, setCardOpenState] = React.useState({});
    const categoryHash = generateCategoryHash(allFormInputs);
    const isFirstRender = React.useRef(true);
    const addProperties = {
        schema: schemaData,
        uischema: uiSchemaData,
        mods: mods,
        onChange: (newSchema, newUiSchema) => onChange(stringify(newSchema), stringify(newUiSchema)),
        definitionData: schemaData.definitions,
        definitionUi: uiSchemaData.definitions,
        categoryHash,
    };
    const hideAddButton = schemaData.properties && Object.keys(schemaData.properties).length !== 0;
    useEffect(() => {
        if (isFirstRender.current) {
            if (onMount)
                onMount({
                    categoryHash,
                });
            isFirstRender.current = false;
        }
    }, [onMount, categoryHash]);
    return (_jsxs("div", { className: `formBuilder ${className || ""}`, children: [_jsxs("div", { className: "alert alert-warning mb-4 flex-col items-start", style: {
                    display: unsupportedFeatures.length === 0 ? "none" : "flex",
                }, children: [_jsx("h5", { className: "font-bold", children: "Unsupported Features:" }), _jsx("ul", { className: "list-disc pl-5", children: unsupportedFeatures.map((message, index) => (_jsx("li", { children: message }, index))) })] }), (!mods || mods.showFormHead !== false) && (_jsxs("div", { className: "formHead", "data-test": "form-head", children: [_jsxs("div", { children: [_jsx("h5", { "data-test": "form-name-label", className: "font-semibold mb-2", children: mods && mods.labels && typeof mods.labels.formNameLabel === "string"
                                    ? mods.labels.formNameLabel
                                    : "Form Name" }), _jsx("input", { value: schemaData.title || "", placeholder: "Title", type: "text", onChange: (ev) => {
                                    onChange(stringify({
                                        ...schemaData,
                                        title: ev.target.value,
                                    }), uischema);
                                }, className: "input input-primary input-bordered w-full form-title mb-4" })] }), _jsxs("div", { children: [_jsx("h5", { "data-test": "form-description-label", className: "font-semibold mb-2", children: mods && mods.labels && typeof mods.labels.formDescriptionLabel === "string"
                                    ? mods.labels.formDescriptionLabel
                                    : "Form Description" }), _jsx(MarkdownDescriptionInput, { value: schemaData.description || "", onChange: (val) => onChange(stringify({
                                    ...schemaData,
                                    description: val,
                                }), uischema) })] })] })), _jsx("div", { className: "form-body formBody mt-6", children: _jsx(DragDropContext, { onDragEnd: (result) => onDragEnd(result, {
                        schema: schemaData,
                        uischema: uiSchemaData,
                        onChange: (newSchema, newUiSchema) => onChange(stringify(newSchema), stringify(newUiSchema)),
                        definitionData: schemaData.definitions,
                        definitionUi: uiSchemaData.definitions,
                        categoryHash,
                    }), children: _jsx(Droppable, { droppableId: "droppable", type: DROPPABLE_TYPE, children: (providedDroppable) => (_jsxs("div", { ref: providedDroppable.innerRef, ...providedDroppable.droppableProps, className: "mb-4", children: [generateElementComponentsFromSchemas({
                                    schemaData,
                                    uiSchemaData,
                                    onChange: (newSchema, newUiSchema) => onChange(stringify(newSchema), stringify(newUiSchema)),
                                    definitionData: schemaData.definitions,
                                    definitionUi: uiSchemaData.definitions,
                                    path: "root",
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
                                        }) })) }, element.key))), providedDroppable.placeholder] })) }) }) }), _jsxs("div", { className: "form-footer formFooter", children: [!hideAddButton && mods?.components?.add && mods.components.add(addProperties), !mods?.components?.add && (_jsx(Add, { tooltipDescription: ((mods || {}).tooltipDescriptions || {}).add, labels: mods?.labels ?? {}, addElem: (choice) => {
                            if (choice === "card") {
                                addCardObj(addProperties);
                            }
                            else if (choice === "section") {
                                addSectionObj(addProperties);
                            }
                        }, hidden: hideAddButton }))] })] }));
}
