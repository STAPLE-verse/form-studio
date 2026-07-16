import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { getTemplate, getUiOptions, getSubmitButtonOptions, schemaRequiresTrueValue, descriptionId, ariaDescribedByIds, enumOptionsIsSelected, enumOptionsSelectValue, enumOptionsDeselectValue, enumOptionsValueForIndex, optionId, } from "@rjsf/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
// required information symbol
const REQUIRED_FIELD_SYMBOL = " *";
function Label(props) {
    const { label, required, id } = props;
    if (!label) {
        return null;
    }
    return (_jsxs("label", { className: "text-lg font-bold", htmlFor: id, children: [label, required && _jsx("span", { className: "font-red italic", children: REQUIRED_FIELD_SYMBOL })] }));
}
// template updates
// title field template the top template
function MyTitleField(props) {
    const { id, title, required } = props;
    return (_jsxs("legend", { id: id, className: "text-xl font-bold", children: [title, required && _jsx("span", { className: "required", children: REQUIRED_FIELD_SYMBOL })] }));
}
// description field template
function MyDescriptionField(props) {
    const { id, description } = props;
    if (!description) {
        return null;
    }
    if (typeof description === "string") {
        return (_jsx("div", { id: id, className: "markdown-display prose max-w-none dark:prose-invert text-md italic mb-2", children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm, remarkBreaks], children: description }) }));
    }
    else {
        return (_jsx("div", { id: id, className: "text-md italic", children: description }));
    }
}
// field template
function MyFieldTemplate(props) {
    const { id, label, children, errors, help, description, hidden, required, displayLabel, registry, uiSchema, } = props;
    const uiOptions = getUiOptions(uiSchema);
    const WrapIfAdditionalTemplate = getTemplate("WrapIfAdditionalTemplate", registry, uiOptions);
    if (hidden) {
        return _jsx("div", { className: "hidden", children: children });
    }
    return (_jsxs(WrapIfAdditionalTemplate, { ...props, children: [displayLabel && _jsx(Label, { label: label, required: required, id: id }), displayLabel && description ? description : null, children, errors, help] }));
}
// button templates
function MySubmitButton({ uiSchema }) {
    const { submitText, norender, props: submitButtonProps = {}, } = getSubmitButtonOptions(uiSchema);
    if (norender) {
        return null;
    }
    return (_jsx("div", { children: _jsx("button", { type: "submit", ...submitButtonProps, className: `btn btn-primary ${submitButtonProps.className || ""}`, children: submitText }) }));
}
// here's the custom widgets
// text input field
const MyTextWidget = (props) => {
    return (_jsx("div", { className: "flex", children: _jsx("input", { type: "text", style: { fontSize: "1rem" }, className: "input input-primary input-bordered w-full mt-2", value: props.value || "", required: props.required, onChange: (event) => props.onChange(event.target.value) }) }));
};
const MyEmailWidget = (props) => {
    return (_jsx("div", { className: "flex", children: _jsx("input", { type: "email", style: { fontSize: "1rem" }, className: "input input-primary input-bordered w-full mt-2", value: props.value || "", required: props.required, onChange: (event) => props.onChange(event.target.value) }) }));
};
const MyCheckboxWidget = (props) => {
    const { id, value, disabled, readonly, label, hideLabel, onChange, onBlur, onFocus, options, schema, uiSchema, registry, } = props;
    const DescriptionFieldTemplate = getTemplate("DescriptionFieldTemplate", registry, options);
    const description = options.description ?? schema.description;
    const required = schemaRequiresTrueValue(schema);
    return (_jsxs("div", { className: "field-checkbox", children: [!hideLabel && label && (_jsxs("label", { className: "text-lg font-bold block mb-1", htmlFor: id, children: [label, required && _jsx("span", { className: "italic", children: REQUIRED_FIELD_SYMBOL })] })), !hideLabel && !!description && (_jsx(DescriptionFieldTemplate, { id: descriptionId(id), description: description, schema: schema, uiSchema: uiSchema, registry: registry })), _jsx("label", { className: "flex items-center gap-2 mt-1 cursor-pointer", children: _jsx("input", { type: "checkbox", id: id, name: id, checked: typeof value === "undefined" ? false : value, required: required, disabled: disabled || readonly, "aria-describedby": ariaDescribedByIds(id), onChange: (e) => onChange(e.target.checked), onBlur: (e) => onBlur(id, e.target.checked), onFocus: (e) => onFocus(id, e.target.checked) }) })] }));
};
const MyCheckboxesWidget = (props) => {
    const { id, disabled, options, value, readonly, onChange, onBlur, onFocus, autofocus = false, } = props;
    const { enumOptions, enumDisabled, emptyValue } = options;
    const checkboxesValues = Array.isArray(value) ? value : [value];
    return (_jsx("div", { className: "checkboxes-group", id: id, children: Array.isArray(enumOptions) &&
            enumOptions.map((option, index) => {
                const checked = enumOptionsIsSelected(option.value, checkboxesValues);
                const itemDisabled = Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1;
                const disabledCls = disabled || itemDisabled || readonly ? "disabled" : "";
                return (_jsxs("label", { className: `checkboxes-option ${disabledCls}`, children: [_jsx("input", { type: "checkbox", id: optionId(id, index), name: id, checked: checked, value: String(index), disabled: disabled || itemDisabled || readonly, autoFocus: autofocus && index === 0, onChange: (event) => {
                                if (event.target.checked) {
                                    onChange(enumOptionsSelectValue(index, checkboxesValues, enumOptions));
                                }
                                else {
                                    onChange(enumOptionsDeselectValue(index, checkboxesValues, enumOptions));
                                }
                            }, onBlur: ({ target: { value: v } }) => onBlur(id, enumOptionsValueForIndex(v, enumOptions, emptyValue)), onFocus: ({ target: { value: v } }) => onFocus(id, enumOptionsValueForIndex(v, enumOptions, emptyValue)), "aria-describedby": ariaDescribedByIds(id) }), _jsx("span", { children: option.label })] }, index));
            }) }));
};
// create Registry information
// templates
const myTemplates = {
    TitleFieldTemplate: MyTitleField,
    DescriptionFieldTemplate: MyDescriptionField,
    FieldTemplate: MyFieldTemplate,
    ButtonTemplates: {
        SubmitButton: MySubmitButton,
        // AddButton: DefaultTemplate,
        // CopyButton: DefaultTemplate,
        // MoveDownButton: DefaultTemplate,
        // MoveUpButton: DefaultTemplate,
        // RemoveButton: DefaultTemplate,
    },
    // ArrayFieldTemplate: DefaultTemplate,
    // ArrayFieldDescriptionTemplate: DefaultTemplate,
    // ArrayFieldItemTemplate: DefaultTemplate,
    // ArrayFieldTitleTemplate: DefaultTemplate,
    // ObjectFieldTemplate: DefaultTemplate,
    // ErrorListTemplate: DefaultTemplate,
    // BaseInputTemplate: DefaultTemplate,
    // UnsupportedFieldTemplate: DefaultTemplate,
    // FieldErrorTemplate: DefaultTemplate,
    // FieldHelpTemplate: DefaultTemplate,
    // WrapIfAdditionalTemplate: DefaultTemplate,
};
// templates
const myWidgets = {
    TextWidget: MyTextWidget,
    EmailWidget: MyEmailWidget,
    CheckboxWidget: MyCheckboxWidget,
    CheckboxesWidget: MyCheckboxesWidget,
};
// create the overall theme to use on the other page
const DaisyTheme = {
    widgets: myWidgets,
    templates: myTemplates,
};
export default DaisyTheme;
