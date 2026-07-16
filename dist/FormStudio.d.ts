import type { Mods } from "./types";
export type FormStudioSaveStatus = "synced" | "unsaved" | "saving";
interface FormStudioUIProps {
    onAutoSave?: (state: {
        schema: object;
        uiSchema: object;
        formData: object;
    }) => Promise<void> | void;
    onSave?: (state: {
        schema: object;
        uiSchema: object;
        formData: object;
    }) => Promise<void>;
    onSaveNewVersion?: (state: {
        schema: object;
        uiSchema: object;
        formData: object;
    }) => Promise<void>;
    onCancel?: () => void;
    mods?: Mods;
    /** When provided, the route layer owns save-status semantics (§8.11.4). */
    saveStatus?: FormStudioSaveStatus;
}
interface FormStudioProps extends FormStudioUIProps {
    initialSchema?: string | object;
    initialUiSchema?: string | object;
}
export declare function FormStudioUI({ onAutoSave, onSave, onSaveNewVersion, onCancel, mods, saveStatus, }: FormStudioUIProps): import("react").JSX.Element;
export default function FormStudio(props: FormStudioProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FormStudio.d.ts.map