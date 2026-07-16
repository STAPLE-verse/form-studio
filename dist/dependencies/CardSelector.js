import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { getRandomId } from "../utils";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { fieldControlClass } from "../fieldLayout";
// a field that lets you choose adjacent blocks
export default function CardSelector({ possibleChoices, chosenChoices, onChange, placeholder, }) {
    const [elementId] = useState(getRandomId());
    return (_jsxs(React.Fragment, { children: [_jsx("ul", { className: "flex flex-col gap-1", children: chosenChoices.map((chosenChoice, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "min-w-0 break-words", children: chosenChoice }), _jsx(XMarkIcon, { className: "h-5 w-5 shrink-0 cursor-pointer stroke-warning hover:stroke-error transition-colors", onClick: () => onChange([...chosenChoices.slice(0, index), ...chosenChoices.slice(index + 1)]) })] }, `${elementId}_neighbor_${index}`))) }), _jsxs("select", { value: "", onChange: (e) => {
                    if (e.target.value) {
                        onChange([...chosenChoices, e.target.value]);
                    }
                }, className: `select select-primary select-bordered select-sm ${fieldControlClass}`, children: [_jsx("option", { value: "", disabled: true, children: placeholder }), possibleChoices
                        .filter((choice) => !chosenChoices.includes(choice))
                        .map((choice) => (_jsx("option", { value: choice, children: choice }, choice)))] })] }));
}
