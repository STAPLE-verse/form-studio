"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const FormStudioContext = createContext(undefined);
export function FormStudioProvider({ initialSchema = {}, initialUiSchema = {}, initialFormData = {}, children, }) {
    const parseJSON = (data) => {
        if (typeof data === "string") {
            try {
                return JSON.parse(data);
            }
            catch (e) {
                return {};
            }
        }
        return data || {};
    };
    const [state, setState] = useState({
        schema: parseJSON(initialSchema),
        uiSchema: parseJSON(initialUiSchema),
        formData: initialFormData,
    });
    const setSchema = (newSchema) => {
        setState((prev) => ({ ...prev, schema: newSchema }));
    };
    const setUiSchema = (newUiSchema) => {
        setState((prev) => ({ ...prev, uiSchema: newUiSchema }));
    };
    const setFormData = (newFormData) => {
        setState((prev) => ({ ...prev, formData: newFormData }));
    };
    const updateState = (newState) => {
        setState((prev) => ({ ...prev, ...newState }));
    };
    return (_jsx(FormStudioContext.Provider, { value: {
            state,
            setSchema,
            setUiSchema,
            setFormData,
            updateState,
        }, children: children }));
}
export function useFormStudio() {
    const context = useContext(FormStudioContext);
    if (!context) {
        throw new Error("useFormStudio must be used within a FormStudioProvider");
    }
    return context;
}
