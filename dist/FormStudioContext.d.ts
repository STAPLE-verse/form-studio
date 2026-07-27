import React, { ReactNode } from "react";
export interface FormStudioState {
    schema: object;
    uiSchema: object;
    formData: object;
}
interface FormStudioContextType {
    state: FormStudioState;
    setSchema: (newSchema: object) => void;
    setUiSchema: (newUiSchema: object) => void;
    setFormData: (newFormData: object) => void;
    updateState: (newState: Partial<FormStudioState>) => void;
}
export interface FormStudioProviderProps {
    initialSchema?: object | string;
    initialUiSchema?: object | string;
    initialFormData?: object;
    children?: ReactNode;
}
export declare function FormStudioProvider({ initialSchema, initialUiSchema, initialFormData, children, }: FormStudioProviderProps): React.JSX.Element;
export declare function useFormStudio(): FormStudioContextType;
export {};
//# sourceMappingURL=FormStudioContext.d.ts.map