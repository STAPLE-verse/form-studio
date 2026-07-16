import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import FBCheckbox from "../checkbox/FBCheckbox";
import Tooltip from "../Tooltip";
import { getRandomId } from "../utils";
import { PlaceholderInput } from "../inputs/PlaceholderInput";
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "../fieldLayout";
// specify the inputs required for a string type object
const CardLongAnswerParameterInputs = ({ parameters, onChange }) => {
    const [elementId] = useState(getRandomId());
    return (_jsxs("div", { className: fieldStackClass, children: [_jsxs("div", { className: fieldClass, children: [_jsx("div", { className: fieldLabelClass, children: "Minimum Length" }), _jsx("input", { value: parameters.minLength ? parameters.minLength : "", placeholder: "Minimum Length", type: "number", onChange: (ev) => {
                            onChange({
                                ...parameters,
                                minLength: parseInt(ev.target.value, 10),
                            });
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "minLength")] }), _jsxs("div", { className: fieldClass, children: [_jsx("div", { className: fieldLabelClass, children: "Maximum Length" }), _jsx("input", { value: parameters.maxLength ? parameters.maxLength : "", placeholder: "Maximum Length", type: "number", onChange: (ev) => {
                            onChange({
                                ...parameters,
                                maxLength: parseInt(ev.target.value, 10),
                            });
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "maxLength")] }), _jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: fieldLabelClass, children: ["Regular Expression Pattern", " ", _jsx("a", { href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions", children: _jsx(Tooltip, { id: `${elementId}_regex`, type: "help", text: "Regular expression pattern that this must satisfy" }) })] }), _jsx("input", { value: parameters.pattern ? parameters.pattern : "", placeholder: "Regular Expression Pattern", type: "text", onChange: (ev) => {
                            onChange({
                                ...parameters,
                                pattern: ev.target.value,
                            });
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "pattern")] }), _jsx(PlaceholderInput, { parameters: parameters, onChange: onChange }), _jsx("div", { className: `${fieldClass} card-modal-boolean`, children: _jsx(FBCheckbox, { onChangeValue: () => {
                        onChange({
                            ...parameters,
                            "ui:autofocus": parameters["ui:autofocus"]
                                ? parameters["ui:autofocus"] !== true
                                : true,
                        });
                    }, isChecked: parameters["ui:autofocus"] ? parameters["ui:autofocus"] === true : false, label: "Auto Focus" }) })] }));
};
const LongAnswer = ({ parameters, onChange }) => {
    return (_jsxs(React.Fragment, { children: [_jsx("h5", { children: "Default Value" }), _jsx("textarea", { value: (parameters.default ?? ""), placeholder: "Default", onChange: (ev) => onChange({ ...parameters, default: ev.target.value }), className: "textarea textarea-primary textarea-bordered w-full" })] }));
};
const longAnswerInput = {
    longAnswer: {
        displayName: "Long Answer",
        matchIf: [
            {
                types: ["string"],
                widget: "textarea",
            },
        ],
        defaultDataSchema: {},
        defaultUiSchema: {
            "ui:widget": "textarea",
        },
        type: "string",
        cardBody: LongAnswer,
        modalBody: CardLongAnswerParameterInputs,
    },
};
export default longAnswerInput;
