import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import classNames from "../classNames";
export default function FBRadioButton(props) {
    const { label, value, checked, name, onChange, required, disabled, autoFocus } = props;
    const id = React.useId();
    const classes = classNames("form-control w-full", { disabled });
    return (_jsx("div", { className: classes, children: _jsxs("label", { htmlFor: id, className: "label cursor-pointer justify-start gap-3", children: [_jsx("input", { id: id, type: "radio", name: name, value: value, checked: checked, required: required, disabled: disabled, autoFocus: autoFocus, onChange: () => onChange(value), className: "radio radio-primary radio-sm" }), _jsx("span", { className: "label-text text-base", children: label })] }) }, value));
}
