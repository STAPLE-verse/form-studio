import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import FBRadioGroup from "./radio/FBRadioGroup";
import { PlusIcon } from "@heroicons/react/24/outline";
export default function Add({ addElem, hidden, tooltipDescription, labels, }) {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [createChoice, setCreateChoice] = useState("card");
    const containerRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setPopoverOpen(false);
            }
        }
        if (popoverOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popoverOpen]);
    if (hidden)
        return _jsx(_Fragment, {});
    return (_jsxs("div", { ref: containerRef, className: "relative flex flex-col items-center mt-4 w-full", children: [_jsx("div", { className: "group w-full py-2 flex justify-center cursor-pointer border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5 rounded-lg transition-all", onClick: () => setPopoverOpen(!popoverOpen), title: tooltipDescription || "Add a new item or section", children: _jsx(PlusIcon, { className: "h-6 w-6 text-base-content/50 group-hover:text-primary transition-colors" }) }), popoverOpen && (_jsxs("div", { className: "absolute top-12 z-50 p-4 shadow-xl bg-base-100 rounded-box w-64 border border-base-300", children: [_jsx("div", { className: "font-bold text-center mb-4 border-b pb-2", children: "Create New" }), _jsx(FBRadioGroup, { className: "choose-create text-sm", defaultValue: createChoice, horizontal: false, options: [
                            {
                                value: "card",
                                label: labels?.addElementLabel ?? "Item",
                            },
                            {
                                value: "section",
                                label: labels?.addSectionLabel ?? "Section",
                            },
                        ], onChange: (selection) => {
                            setCreateChoice(selection);
                        } }), _jsxs("div", { className: "flex justify-between mt-4", children: [_jsx("button", { onClick: () => setPopoverOpen(false), className: "btn btn-sm btn-outline btn-secondary", children: "Cancel" }), _jsx("button", { onClick: () => {
                                    addElem(createChoice);
                                    setPopoverOpen(false);
                                }, className: "btn btn-sm btn-primary", children: "Create" })] })] }))] }));
}
