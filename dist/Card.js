import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import FBCheckbox from "./checkbox/FBCheckbox";
import Collapse from "./Collapse/Collapse";
import CardModal from "./CardModal";
import CardGeneralParameterInputs from "./CardGeneralParameterInputs";
import Add from "./Add";
import Tooltip from "./Tooltip";
import { getRandomId } from "./utils";
import { ArrowsPointingOutIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
export default function Card({ componentProps, onChange, onDelete, TypeSpecificParameters, addElem, cardOpen, setCardOpen, allFormInputs, mods, showObjectNameInput = true, addProperties, dragHandleProps, }) {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [elementId] = React.useState(getRandomId());
    return (_jsxs(React.Fragment, { children: [_jsxs(Collapse, { isOpen: cardOpen, toggleCollapse: () => setCardOpen(!cardOpen), title: _jsxs("div", { className: "flex justify-between items-center w-full", children: [_jsxs("span", { onClick: () => setCardOpen(!cardOpen), className: "text-lg font-bold cursor-pointer select-none", children: [componentProps.title || componentProps.name, " ", componentProps.parent ? (_jsx(Tooltip, { text: `Depends on ${componentProps.parent}`, id: `${elementId}_parentinfo`, type: "alert" })) : (""), componentProps.$ref !== undefined ? (_jsx(Tooltip, { text: `Is an instance of pre-configured component ${componentProps.$ref}`, id: `${elementId}_refinfo`, type: "alert" })) : ("")] }), _jsx("span", { ...(dragHandleProps ?? {}), className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-grab active:cursor-grabbing p-1", "data-tip": "Drag to move form item", id: `${elementId}_moveformcard`, children: _jsx(ArrowsPointingOutIcon, { className: "w-6 h-6 stroke-2 text-base-content/50 hover:text-base-content transition-colors", onClick: () => { } }) })] }), className: `card-container ${componentProps.dependent ? "card-dependent" : ""} ${componentProps.$ref === undefined ? "" : "card-reference"}`, children: [_jsx("div", { className: "cardEntries", children: _jsx(CardGeneralParameterInputs, { parameters: componentProps, onChange: onChange, allFormInputs: allFormInputs, mods: mods, showObjectNameInput: showObjectNameInput }) }), _jsxs("div", { className: "flex items-center justify-end gap-4 w-full mt-6 pt-4 border-t border-base-200", children: [_jsx(FBCheckbox, { onChangeValue: () => onChange({
                                    ...componentProps,
                                    required: !componentProps.required,
                                }), isChecked: !!componentProps.required, label: "Required", id: `${elementId}_required` }), _jsx("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer p-1", "data-tip": "Additional configurations for this item", id: `${elementId}_editinfo`, children: _jsx(PencilIcon, { className: "w-5 h-5 text-secondary hover:text-primary transition-colors", onClick: () => setModalOpen(true) }) }), _jsx("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer p-1", "data-tip": "Delete item", id: `${elementId}_trashinfo`, children: _jsx(TrashIcon, { className: "w-5 h-5 text-warning hover:text-error transition-colors", onClick: () => onDelete && onDelete() }) })] }), _jsx(CardModal, { componentProps: componentProps, isOpen: modalOpen, onClose: () => setModalOpen(false), onChange: (newComponentProps) => {
                            onChange(newComponentProps);
                        }, TypeSpecificParameters: TypeSpecificParameters })] }), mods?.components?.add && mods?.components?.add(addProperties), !mods?.components?.add && addElem && (_jsx(Add, { tooltipDescription: ((mods || {}).tooltipDescriptions || {}).add, addElem: (choice) => addElem(choice) }))] }));
}
