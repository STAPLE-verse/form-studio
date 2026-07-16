import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import FBCheckbox from "../checkbox/FBCheckbox";
import Tooltip from "../Tooltip";
import { getRandomId } from "../utils";
import { PlaceholderInput } from "../inputs/PlaceholderInput";
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "../fieldLayout";
const formatDictionary = {
    "": "None",
    email: "Email",
    hostname: "Hostname",
    uri: "URI",
    regex: "Regular Expression",
};
const formatTypeDictionary = {
    email: "email",
    url: "uri",
};
const autoDictionary = {
    "": "None",
    email: "Email",
    username: "User Name",
    password: "Password",
    "street-address": "Street Address",
    country: "Country",
};
// specify the inputs required for a string type object
const CardShortAnswerParameterInputs = ({ parameters, onChange }) => {
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
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "maxLength")] }), _jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: fieldLabelClass, children: ["Regular Expression Pattern", " ", _jsx("a", { href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions", target: "_blank", rel: "noopener noreferrer", children: _jsx(Tooltip, { id: `${elementId}_regex`, type: "help", text: "Regular expression pattern that this must satisfy" }) })] }), _jsx("input", { value: parameters.pattern ? parameters.pattern : "", placeholder: "Regular Expression Pattern", type: "text", onChange: (ev) => {
                            onChange({
                                ...parameters,
                                pattern: ev.target.value,
                            });
                        }, className: `input input-primary input-bordered input-sm ${fieldControlClass}` }, "pattern")] }), _jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: fieldLabelClass, children: ["Format", " ", _jsx(Tooltip, { id: `${elementId}_format`, type: "help", text: "Require string input to match a certain common format" })] }), _jsx("select", { className: `select select-primary select-bordered select-sm ${fieldControlClass}`, value: parameters.format || "", onChange: (e) => onChange({
                            ...parameters,
                            format: e.target.value,
                        }), children: Object.keys(formatDictionary).map((key) => (_jsx("option", { value: key, children: formatDictionary[key] }, key))) })] }), _jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: fieldLabelClass, children: ["Auto Complete Category", " ", _jsx("a", { href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete", target: "_blank", rel: "noopener noreferrer", children: _jsx(Tooltip, { id: `${elementId}_autocomplete`, type: "help", text: "Suggest entries based on the user's browser history" }) })] }), _jsx("select", { className: `select select-primary select-bordered select-sm ${fieldControlClass}`, value: parameters["ui:autocomplete"] || "", onChange: (e) => onChange({
                            ...parameters,
                            "ui:autocomplete": e.target.value,
                        }), children: Object.keys(autoDictionary).map((key) => (_jsx("option", { value: key, children: autoDictionary[key] }, key))) })] }), _jsx(PlaceholderInput, { parameters: parameters, onChange: onChange }), _jsx("div", { className: `${fieldClass} card-modal-boolean`, children: _jsx(FBCheckbox, { onChangeValue: () => {
                        onChange({
                            ...parameters,
                            "ui:autofocus": parameters["ui:autofocus"]
                                ? parameters["ui:autofocus"] !== true
                                : true,
                        });
                    }, isChecked: parameters["ui:autofocus"] ? parameters["ui:autofocus"] === true : false, label: "Auto Focus" }) })] }));
};
const ShortAnswerField = ({ parameters, onChange }) => {
    return (_jsxs(React.Fragment, { children: [_jsx("h5", { children: "Default Value" }), _jsx("input", { value: (parameters.default ?? ""), placeholder: "Default", type: formatTypeDictionary[parameters.format] ||
                    "text", onChange: (ev) => onChange({ ...parameters, default: ev.target.value }), className: "input input-primary input-bordered w-full" })] }));
};
const Password = ({ parameters, onChange }) => {
    return (_jsxs(React.Fragment, { children: [_jsx("h5", { children: "Default Password" }), _jsx("input", { value: (parameters.default ?? ""), placeholder: "Default", type: "password", onChange: (ev) => onChange({ ...parameters, default: ev.target.value }), className: "input input-primary input-bordered w-full" })] }));
};
const shortAnswerInput = {
    shortAnswer: {
        displayName: "Short Answer",
        matchIf: [
            {
                types: ["string"],
            },
            ...["email", "hostname", "uri", "regex"].map((format) => ({
                types: ["string"],
                format,
            })),
        ],
        defaultDataSchema: {},
        defaultUiSchema: {},
        type: "string",
        cardBody: ShortAnswerField,
        modalBody: CardShortAnswerParameterInputs,
    },
    password: {
        displayName: "Password",
        matchIf: [
            {
                types: ["string"],
                widget: "password",
            },
        ],
        defaultDataSchema: {},
        defaultUiSchema: {
            "ui:widget": "password",
        },
        type: "string",
        cardBody: Password,
        modalBody: CardShortAnswerParameterInputs,
    },
};
export default shortAnswerInput;
