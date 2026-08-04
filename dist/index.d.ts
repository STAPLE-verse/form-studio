import * as react from 'react';
import react__default, { FunctionComponent, ReactElement, ReactNode } from 'react';

type LocalReferenceResolutionStatus = "resolved" | "unresolved" | "unsupportedLocal" | "external" | "cycle";

interface ComponentProps {
    dependents: {
        children: string[];
        value?: any;
    }[];
    neighborNames: string[];
    name: string;
    schema: {
        [key: string]: any;
    };
    type: string;
    "ui:column": string;
    hideKey?: string;
}
interface InputSelectDataType {
    $ref: string;
    title: string;
    default: string;
    type: string;
    category: string;
}
type FieldCompatibility = {
    kind: "editable";
    category: string;
} | {
    kind: "readOnly";
    code: "FS_OBJECT_ARRAY_READ_ONLY" | "FS_SCALAR_ARRAY_READ_ONLY" | "FS_UNSUPPORTED_ARRAY_READ_ONLY" | "FS_ONE_OF_READ_ONLY" | "FS_COMPOSITION_READ_ONLY" | "FS_HIDDEN_READ_ONLY" | "FS_REFERENCE_CYCLE_READ_ONLY" | "FS_REFERENCE_EXTERNAL_READ_ONLY" | "FS_REFERENCE_UNRESOLVED_READ_ONLY" | "FS_REFERENCE_UNSUPPORTED_LOCAL_READ_ONLY" | "FS_UNKNOWN_FIELD_READ_ONLY";
    message: string;
} | {
    kind: "migration";
    code: "FS_TEXTAREA_MIGRATION";
    message: string;
};
interface CardComponentPropsType {
    name: string;
    required?: boolean;
    hideKey?: boolean;
    definitionData?: {
        [key: string]: any;
    };
    definitionUi?: {
        [key: string]: any;
    };
    neighborNames?: string[];
    dependents?: {
        children: string[];
        value?: any;
    }[];
    dependent?: boolean;
    parent?: string;
    "ui:options"?: {
        [key: string]: any;
    };
    category?: string;
    schema?: {
        [key: string]: any;
    };
    type?: string;
    "ui:column"?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    "ui:autofocus"?: boolean;
    "ui:placeholder"?: string;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    title?: string;
    $ref?: string;
    format?: string;
    "ui:autocomplete"?: string;
    default?: string | number | boolean;
    items?: {
        [key: string]: any;
    };
    "ui:*items"?: {
        [key: string]: any;
    };
    multipleOf?: number | null;
    minimum?: number | null;
    exclusiveMinimum?: number | null;
    maximum?: number | null;
    exclusiveMaximum?: number | null;
    enum?: (number | string)[];
    enumNames?: string[] | null;
    description?: string;
}
interface CardModalProps {
    componentProps: CardComponentPropsType;
    onChange: (arg0: any) => void;
    isOpen: boolean;
    onClose: () => void;
    TypeSpecificParameters: FunctionComponent<{
        parameters: CardComponentPropsType;
        onChange: (newParams: CardComponentPropsType) => void;
    }>;
}
type CardModalType = FunctionComponent<CardModalProps>;
interface SectionPropsType {
    name: string;
    required: boolean;
    schema: {
        [key: string]: any;
    };
    uischema: {
        [key: string]: any;
    };
    onChange: (schema: {
        [key: string]: any;
    }, uischema: {
        [key: string]: any;
    }, ref?: string) => void;
    onNameChange: (arg0: string) => void;
    onDependentsChange: (arg0: {
        children: string[];
        value?: any;
    }[]) => void;
    onRequireToggle: () => any;
    onDelete: () => any;
    onMoveUp?: () => any;
    onMoveDown?: () => any;
    path: string;
    definitionData: {
        [key: string]: any;
    };
    definitionUi: {
        [key: string]: any;
    };
    dependents?: Array<{
        children: Array<string>;
        value?: any;
    }>;
    parentProperties: AddFormObjectParametersType;
    neighborNames?: Array<string>;
    cardOpen: boolean;
    setCardOpen: (newState: boolean) => void;
    allFormInputs: {
        [key: string]: FormInput;
    };
    categoryHash: {
        [key: string]: string;
    };
    hideKey?: boolean;
    reference?: string;
    dependent?: boolean;
    parent?: string;
    mods?: Mods;
    dragHandleProps?: any;
}
type SectionType = FunctionComponent<SectionPropsType>;
interface CardPropsType {
    componentProps: CardComponentPropsType;
    onChange: (newParams: CardComponentPropsType) => void;
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    TypeSpecificParameters: FunctionComponent<{
        parameters: CardComponentPropsType;
        onChange: (newParams: CardComponentPropsType) => void;
    }>;
    addElem?: (choice: string) => void;
    cardOpen: boolean;
    setCardOpen: (newState: boolean) => void;
    mods?: Mods;
    allFormInputs: {
        [key: string]: FormInput;
    };
    showObjectNameInput?: boolean;
    addProperties?: {
        [key: string]: any;
    };
    dragHandleProps?: any;
}
type CardType = FunctionComponent<CardPropsType>;
type CardProps = {
    name: string;
    required: boolean;
    dataOptions: {
        [key: string]: any;
    };
    uiOptions: {
        [key: string]: any;
    };
    compatibility?: FieldCompatibility;
    $ref?: string;
    referenceResolution?: LocalReferenceResolutionStatus;
    dependents?: Array<{
        children: Array<string>;
        value?: any;
    }>;
    dependent?: boolean;
    parent?: string;
    propType: string;
    neighborNames: Array<string>;
};
type SectionProps = {
    name: string;
    required: boolean;
    schema: {
        [key: string]: any;
    };
    uischema: {
        [key: string]: any;
    };
    $ref?: string;
    referenceResolution?: LocalReferenceResolutionStatus;
    dependents?: Array<{
        children: Array<string>;
        value?: any;
    }>;
    dependent?: boolean;
    propType: string;
    neighborNames: Array<string>;
};
type ElementProps = CardProps & SectionProps;
type DataType = "string" | "number" | "boolean" | "integer" | "array" | "object" | "null";
interface MatchType {
    types: Array<DataType>;
    widget?: string;
    field?: string;
    format?: string;
    $ref?: boolean;
    enum?: boolean;
}
type CardComponentType = FunctionComponent<{
    parameters: CardComponentPropsType;
    onChange: (newParams: CardComponentPropsType) => void;
    mods?: Mods;
}>;
interface FormInputType {
    displayName: string;
    matchIf: Array<MatchType>;
    possibleOptions?: Array<string>;
    defaultDataSchema: {
        [key: string]: any;
    };
    defaultUiSchema: {
        [key: string]: any;
    };
    type: DataType;
    cardBody: CardComponentType;
    modalBody?: CardComponentType;
}
interface DataOptions {
    title: string;
    type?: string;
    description?: string;
    $ref?: string;
    default?: string | number;
}
interface ModLabels {
    formNameLabel?: string;
    formDescriptionLabel?: string;
    objectNameLabel?: string;
    displayNameLabel?: string;
    descriptionLabel?: string;
    inputTypeLabel?: string;
    addElementLabel?: string;
    addSectionLabel?: string;
}
interface Mods {
    customFormInputs?: {
        [key: string]: FormInputType;
    };
    components?: {
        add?: (properties?: {
            [key: string]: any;
        }) => ReactElement | ReactElement[] | [];
    };
    tooltipDescriptions?: {
        add?: string;
        cardObjectName?: string;
        cardDisplayName?: string;
        cardDescription?: string;
        cardInputType?: string;
        cardSectionObjectName?: string;
        cardSectionDisplayName?: string;
        cardSectionDescription?: string;
    };
    labels?: ModLabels;
    showFormHead?: boolean;
    deactivatedFormInputs?: Array<string>;
    newElementDefaultDataOptions?: DataOptions;
    newElementDefaultUiSchema?: {
        [key: string]: any;
    };
}
type FormInput = FormInputType;
interface InitParameters {
    categoryHash?: {
        [key: string]: string;
    };
}
interface FormElement {
    name?: string;
    title?: string;
    description?: string;
    required?: boolean;
    $ref?: string;
    referenceResolution?: LocalReferenceResolutionStatus;
    schema?: {
        [key: string]: any;
    };
    uischema?: {
        [key: string]: any;
    };
    propType?: string;
    dataOptions?: {
        [key: string]: any;
    };
    uiOptions?: {
        [key: string]: any;
    };
    compatibility?: FieldCompatibility;
    type?: string;
    dependents?: {
        [key: string]: any;
    };
    dependent?: boolean;
    parent?: string;
    neighborNames?: string[];
    children?: string[];
    value?: any;
}
interface AddFormObjectParametersType {
    schema: {
        [key: string]: any;
    };
    uischema: {
        [key: string]: any;
    };
    mods?: Mods;
    onChange: (schema: {
        [key: string]: any;
    }, uischema: {
        [key: string]: any;
    }) => any;
    definitionData: {
        [key: string]: any;
    };
    definitionUi: {
        [key: string]: any;
    };
    index?: number;
    categoryHash: {
        [key: string]: string;
    };
}
interface DefinitionData {
    [key: string]: {
        [key: string]: any;
    };
}

declare function FormBuilder({ schema, uiSchema, onMount, onChange, mods, className, }: {
    schema: string;
    uiSchema: string;
    onMount?: (parameters: InitParameters) => any;
    onChange: (schema: string, uiSchema: string) => any;
    mods?: Mods;
    className?: string;
}): ReactElement;

interface FormStudioState {
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
interface FormStudioProviderProps {
    initialSchema?: object | string;
    initialUiSchema?: object | string;
    initialFormData?: object;
    children?: ReactNode;
}
declare function FormStudioProvider({ initialSchema, initialUiSchema, initialFormData, children, }: FormStudioProviderProps): react__default.JSX.Element;
declare function useFormStudio(): FormStudioContextType;

type FormStudioSaveStatus = "synced" | "unsaved" | "saving";
interface FormStudioUIProps {
    onAutoSave?: (state: FormStudioState) => Promise<void> | void;
    onSave?: (state: FormStudioState) => Promise<void>;
    onSaveNewVersion?: (state: FormStudioState) => Promise<void>;
    onCancel?: () => void;
    mods?: Mods;
    /** When provided, the route layer owns save-status semantics (§8.11.4). */
    saveStatus?: FormStudioSaveStatus;
}
interface FormStudioProps extends FormStudioUIProps {
    initialSchema?: string | object;
    initialUiSchema?: string | object;
}
declare function FormStudioUI({ onAutoSave, onSave, onSaveNewVersion, onCancel, mods, saveStatus, }: FormStudioUIProps): react.JSX.Element;
declare function FormStudio(props: FormStudioProps): react.JSX.Element;

declare function JsonEditor(): react.JSX.Element;

declare function FormPreview(): react__default.JSX.Element;

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
declare function JsonSchemaForm<TFormData extends object = Record<string, unknown>>({ schema, uiSchema, formData, onChange, onSubmit, onError, ...formProps }: JsonSchemaFormProps<TFormData>): react.JSX.Element;

export { type AddFormObjectParametersType, type CardComponentPropsType, type CardComponentType, type CardModalProps, type CardModalType, type CardProps, type CardPropsType, type CardType, type ComponentProps, type DataOptions, type DataType, type DefinitionData, type ElementProps, type FieldCompatibility, FormBuilder, type FormElement, type FormInput, FormPreview, FormStudio, FormStudioProvider, type FormStudioProviderProps, type FormStudioSaveStatus, type FormStudioState, FormStudioUI, type InitParameters, type InputSelectDataType, JsonEditor, type JsonSchemaDocument, JsonSchemaForm, type JsonSchemaFormEvent, type JsonSchemaFormProps, type JsonSchemaFormValidationError, type ModLabels, type Mods, type SectionProps, type SectionPropsType, type SectionType, useFormStudio };
