"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { withTheme } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import DaisyTheme from "./DaisyTheme";
import { useFormStudio } from "./FormStudioContext";
// RJSF expects a validator to run its schemas against.
// We bundle it here with DaisyTheme for a seamless experience.
const ThemedForm = withTheme(DaisyTheme);
// Helper to remove submit button visually from the preview if needed
const hideSubmitButton = (uiSchema) => {
    return {
        ...uiSchema,
        "ui:submitButtonOptions": {
            norender: true,
        },
    };
};
export default function FormPreview() {
    const { state, setFormData } = useFormStudio();
    const uiSchema = React.useMemo(() => hideSubmitButton(state.uiSchema), [state.uiSchema]);
    // Make sure we have a valid schema to render, otherwise it crashes
    if (!state.schema || Object.keys(state.schema).length === 0) {
        return (_jsx("div", { className: "flex items-center justify-center h-full bg-base-200 rounded-box border border-base-300 p-8", children: _jsx("p", { className: "text-base-content/60 italic", children: "No form defined to preview." }) }));
    }
    const handleChange = ({ formData }) => {
        setFormData(formData);
    };
    return (_jsx("div", { className: "h-full overflow-y-auto pt-2 pb-8", children: _jsx(ThemedForm, { schema: state.schema, uiSchema: uiSchema, formData: state.formData, onChange: handleChange, validator: validator }) }));
}
