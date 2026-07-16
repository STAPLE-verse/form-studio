import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classnames from "classnames";
const FBCheckbox = ({ onChangeValue, value = "", isChecked = false, label = "", use = "action", disabled = false, id = "", dataTest = "", labelClassName = "", }) => {
    const classes = classnames("fb-checkbox", {
        "edit-checkbox": !disabled && use === "edit",
        "action-checkbox": !disabled && use === "action",
        "disabled-checked-checkbox": disabled && isChecked,
        "disabled-unchecked-checkbox": disabled && !isChecked,
    });
    const potentialCheckboxId = id !== "" ? id : label;
    const checkboxId = potentialCheckboxId !== "" ? potentialCheckboxId : undefined;
    return (_jsx("div", { "data-test": "checkbox", className: "form-control", children: _jsxs("label", { htmlFor: checkboxId, className: `label cursor-pointer justify-start gap-3 ${labelClassName || ""}`, children: [_jsx("input", { type: "checkbox", id: checkboxId, "data-test": dataTest || undefined, onChange: (event) => {
                        if (!disabled) {
                            onChangeValue(event);
                        }
                    }, value: value, disabled: disabled, checked: isChecked, className: classnames("checkbox checkbox-primary", {
                        "checkbox-disabled": disabled
                    }) }), label && _jsx("span", { className: "label-text text-base", children: label })] }) }));
};
export default FBCheckbox;
