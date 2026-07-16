import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { getRandomId } from "../utils";
import Tooltip from "../Tooltip";
import { fieldClass, fieldControlClass, fieldLabelClass } from "../fieldLayout";
export const PlaceholderInput = ({ parameters, onChange }) => {
    const [elementId] = useState(getRandomId());
    return (_jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: fieldLabelClass, children: ["Placeholder", " ", _jsx("a", { href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder", target: "_blank", rel: "noopener noreferrer", children: _jsx(Tooltip, { id: `${elementId}_placeholder`, type: "help", text: "Hint to the user as to what kind of information is expected in the field" }) })] }), _jsx("input", { value: parameters["ui:placeholder"] ? parameters["ui:placeholder"] : "", placeholder: "Placeholder", type: "text", onChange: (ev) => {
                    onChange({
                        ...parameters,
                        "ui:placeholder": ev.target.value,
                    });
                }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "placeholder")] }));
};
