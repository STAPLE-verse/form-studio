import React, { ReactElement, ReactNode } from 'react';
import { I as InitParameters, M as Mods, F as FormStudioExtension, a as FormStudioDiagnostic, b as FormStudioValidationResult } from './types-C5lOkV8d.js';
export { A as AddFormObjectParametersType, C as CardComponentPropsType, c as CardComponentType, d as CardModalProps, e as CardModalType, f as CardProps, g as CardPropsType, h as CardType, i as ComponentProps, D as DataOptions, j as DataType, k as DefinedFormStudioExtension, l as DefinitionData, E as ElementProps, m as ExtensionDocumentProps, n as FieldCompatibility, o as FieldExtensionControlProps, p as FormElement, q as FormExtensionControlProps, r as FormInput, s as FormStudioExtensionControlProps, t as FormStudioExtensionSlots, u as FormStudioExtensionState, v as FormStudioExtensionValidationInput, w as FormStudioFieldContext, x as InputSelectDataType, y as ModLabels, S as SectionProps, z as SectionPropsType, B as SectionType, G as defineFormStudioExtension, H as getFormStudioExtensionValue } from './types-C5lOkV8d.js';

declare function FormBuilder({ schema, uiSchema, onMount, onChange, mods, className, }: {
    schema: string;
    uiSchema: string;
    onMount?: (parameters: InitParameters) => any;
    onChange: (schema: string, uiSchema: string) => any;
    mods?: Mods;
    className?: string;
}): ReactElement;

type AnyFormStudioExtension = FormStudioExtension<any>;

interface FormStudioState {
    schema: object;
    uiSchema: object;
    /** JSON-serializable values for the provider's registered extensions. */
    extensionValues: Record<string, unknown>;
    formData: object;
}
/**
 * Single source of truth for "did the authored (non-preview) part of the
 * state change" — used for the panel error-boundary reset key and the
 * autosave/dirty-state comparisons. Keeping base and registered extension
 * values here prevents recovery and dirty-state paths from drifting as
 * authored documents are added.
 */
declare function computeStateFingerprint(state: Pick<FormStudioState, "schema" | "uiSchema" | "extensionValues">): string;
interface FormStudioContextValue {
    state: FormStudioState;
    /** Stable registration order captured when the provider mounts. */
    extensions: readonly AnyFormStudioExtension[];
    setSchema: (newSchema: object) => void;
    setUiSchema: (newUiSchema: object) => void;
    setFormData: (newFormData: object) => void;
    updateState: (newState: Partial<Omit<FormStudioState, "extensionValues">>) => void;
    getExtensionValue: <TValue>(extension: FormStudioExtension<TValue>) => TValue | undefined;
    setExtensionValue: <TValue>(extension: FormStudioExtension<TValue>, value: TValue | undefined) => void;
    /** Debounced, derived diagnostics in stable registry order. */
    extensionDiagnostics: FormStudioDiagnostic[];
    /** Fresh synchronous validation against the current provider state. */
    validateForCommit: () => FormStudioValidationResult;
}
interface FormStudioProviderProps {
    /** Registration is fixed for this provider's lifetime; remount to change it. */
    extensions?: readonly AnyFormStudioExtension[];
    /** Values whose keys match registered extension IDs. Undefined means absent. */
    initialExtensionValues?: Readonly<Record<string, unknown>>;
    initialSchema?: object | string;
    initialUiSchema?: object | string;
    initialFormData?: object;
    children?: ReactNode;
}
declare function FormStudioProvider({ extensions, initialExtensionValues, initialSchema, initialUiSchema, initialFormData, children, }: FormStudioProviderProps): ReactElement;
declare function useFormStudio(): FormStudioContextValue;

type FormStudioSaveStatus = "synced" | "unsaved" | "saving";
interface FormStudioUIProps {
    onAutoSave?: (state: FormStudioState) => Promise<void> | void;
    onSave?: (state: FormStudioState) => Promise<void>;
    onSaveNewVersion?: (state: FormStudioState) => Promise<void>;
    onCancel?: () => void;
    mods?: Mods;
    /** When provided, the route layer owns save-status semantics (§8.11.4). */
    saveStatus?: FormStudioSaveStatus;
    /** Notified with current debounced diagnostics in registry order. */
    onDiagnosticsChange?: (diagnostics: FormStudioDiagnostic[]) => void;
}
interface FormStudioProps extends FormStudioUIProps {
    extensions?: FormStudioProviderProps["extensions"];
    initialExtensionValues?: FormStudioProviderProps["initialExtensionValues"];
    initialSchema?: string | object;
    initialUiSchema?: string | object;
    initialFormData?: object;
}
declare function FormStudioUI({ onAutoSave, onSave, onSaveNewVersion, onCancel, mods, saveStatus, onDiagnosticsChange, }: FormStudioUIProps): ReactElement;
declare function FormStudio(props: FormStudioProps): ReactElement;

declare function JsonEditor(): ReactElement;

declare function FormPreview(): React.ReactElement;

type JsonSchemaDocument = Record<string, unknown>;
interface JsonSchemaFormEvent<TFormData extends object = Record<string, unknown>> {
    formData: TFormData;
}
interface JsonSchemaFormValidationError {
    name?: string;
    property?: string;
    message?: string;
    params?: Record<string, unknown>;
    stack?: string;
    schemaPath?: string;
}
interface JsonSchemaFormProps<TFormData extends object = Record<string, unknown>> {
    schema: JsonSchemaDocument;
    uiSchema?: JsonSchemaDocument;
    formData?: TFormData;
    onChange?: (event: JsonSchemaFormEvent<TFormData>) => void;
    onSubmit?: (event: JsonSchemaFormEvent<TFormData>) => void | Promise<void>;
    onError?: (errors: JsonSchemaFormValidationError[]) => void;
    disabled?: boolean;
    readonly?: boolean;
    className?: string;
    idPrefix?: string;
    name?: string;
    noHtml5Validate?: boolean;
    focusOnFirstError?: boolean;
}
/**
 * Canonical context-free JSON Schema renderer shared by Form Studio consumers.
 * RJSF, its validator, and the DaisyUI theme remain private implementation details.
 */
declare function JsonSchemaForm<TFormData extends object = Record<string, unknown>>({ schema, uiSchema, formData, onChange, onSubmit, onError, ...formProps }: JsonSchemaFormProps<TFormData>): ReactElement;

declare function FormStudioDiagnostics(): React.ReactElement | null;

export { FormBuilder, FormPreview, FormStudio, type FormStudioContextValue, FormStudioDiagnostic, FormStudioDiagnostics, FormStudioExtension, type FormStudioProps, FormStudioProvider, type FormStudioProviderProps, type FormStudioSaveStatus, type FormStudioState, FormStudioUI, type FormStudioUIProps, FormStudioValidationResult, InitParameters, JsonEditor, type JsonSchemaDocument, JsonSchemaForm, type JsonSchemaFormEvent, type JsonSchemaFormProps, type JsonSchemaFormValidationError, Mods, computeStateFingerprint, useFormStudio };
