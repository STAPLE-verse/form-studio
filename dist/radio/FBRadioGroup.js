import { jsx as _jsx } from "react/jsx-runtime";
import { createElement as _createElement } from "react";
import React from "react";
import classNames from "../classNames";
import FBRadioButton from "./FBRadioButton";
export default function FBRadioGroup(props) {
    const { options, defaultValue, onChange, horizontal, id, autoFocus, disabled } = props;
    const name = React.useId();
    // Removed JSS class usage
    const classes = classNames("fb-radio-group", {
        horizontal,
    });
    // Conditionallly add 'id' prop in case id was not passed in from parent.
    let elementId = {};
    if (id) {
        elementId = { id };
    }
    return (_jsx("div", { ...elementId, className: `${classes} radio-group`, children: options.map((option, index) => (_createElement(FBRadioButton, { value: option.value, label: option.label, ...elementId, name: name, 
            // @ts-ignore: suppress key error, can't change key assignment
            key: option.value, checked: option.value === defaultValue, autoFocus: autoFocus && index === 1, onChange: onChange, disabled: disabled }))) }));
}
