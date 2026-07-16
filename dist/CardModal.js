import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import DependencyField from "./dependencies/DependencyField";
import Tooltip from "./Tooltip";
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "./fieldLayout";
const CardModal = ({ componentProps, onChange, isOpen, onClose, TypeSpecificParameters, }) => {
    // assign state values for parameters that should only change on hitting "Save"
    const [componentPropsState, setComponentProps] = useState(componentProps);
    const [prevComponentProps, setPrevComponentProps] = useState(componentProps);
    if (componentProps !== prevComponentProps) {
        setPrevComponentProps(componentProps);
        setComponentProps(componentProps);
    }
    if (!isOpen)
        return null;
    return (_jsxs("dialog", { className: `modal ${isOpen ? "modal-open" : ""}`, "data-test": "card-modal", onClick: (event) => event.stopPropagation(), onKeyDown: (event) => event.stopPropagation(), onMouseDown: (event) => event.stopPropagation(), onTouchStart: (event) => event.stopPropagation(), children: [_jsxs("div", { className: "modal-box flex max-h-[calc(100vh-4rem)] w-11/12 max-w-3xl flex-col overflow-hidden", children: [_jsx("div", { style: { display: componentProps.hideKey ? "none" : "initial" }, className: "mb-4 shrink-0 border-b border-base-200 pb-2", children: _jsx("h3", { className: "text-xl font-bold", children: "Additional Settings" }) }), _jsxs("div", { className: `min-h-0 flex-1 overflow-y-auto px-1.5 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${fieldStackClass}`, children: [_jsx(TypeSpecificParameters, { parameters: componentPropsState, onChange: (newState) => {
                                    setComponentProps({
                                        ...componentPropsState,
                                        ...newState,
                                    });
                                } }), _jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: `${fieldLabelClass} flex items-center gap-2`, children: ["Column Size", _jsx("a", { href: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout", target: "_blank", rel: "noopener noreferrer", children: _jsx(Tooltip, { id: "column_size_tooltip", type: "help", text: "Set the column size of the item" }) })] }), _jsx("input", { value: componentPropsState["ui:column"] ? componentPropsState["ui:column"] : "", placeholder: "Column Size", type: "number", min: 0, onChange: (ev) => {
                                            setComponentProps({
                                                ...componentPropsState,
                                                "ui:column": ev.target.value,
                                            });
                                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "ui:column")] }), _jsx(DependencyField, { parameters: componentPropsState, onChange: (newState) => {
                                    setComponentProps({
                                        ...componentPropsState,
                                        ...newState,
                                    });
                                } })] }), _jsxs("div", { className: "modal-action shrink-0", children: [_jsx("button", { onClick: () => {
                                    onClose();
                                    setComponentProps(componentProps);
                                }, className: "btn btn-ghost", children: "Cancel" }), _jsx("button", { onClick: () => {
                                    onClose();
                                    onChange(componentPropsState);
                                }, className: "btn btn-primary", children: "Save" })] })] }), _jsx("form", { method: "dialog", className: "modal-backdrop", children: _jsx("button", { onClick: () => onClose(), children: "close" }) })] }));
};
export default CardModal;
