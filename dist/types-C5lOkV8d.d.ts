import { FunctionComponent, ReactElement, ComponentType } from 'react';

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
    /** RFC 6901 pointer rooted at the form schema for this instance-bearing field. */
    fieldPointer?: string;
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
    /** RFC 6901 pointer rooted at the form schema for this instance-bearing section. */
    fieldPointer?: string;
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

interface FormStudioDiagnostic {
    source: string;
    sourceLabel: string;
    code: string;
    pointer?: string;
    stage?: string;
    message: string;
    severity: "warning" | "error";
    blocksCommit: boolean;
}
interface FormStudioExtensionValidationInput<TValue> {
    schema: object;
    uiSchema: object;
    value: TValue | undefined;
}
interface FormStudioExtensionControlProps<TValue> {
    extension: FormStudioExtension<TValue>;
    schema: object;
    uiSchema: object;
    value: TValue | undefined;
    setValue: (value: TValue | undefined) => void;
    diagnostics: readonly FormStudioDiagnostic[];
}
interface FormStudioFieldContext {
    /** RFC 6901 pointer to the instance-bearing field in the root schema. */
    fieldPointer: string;
    fieldSchema: object;
    rootSchema: object;
    compatibility?: FieldCompatibility;
}
interface FieldExtensionControlProps<TValue> extends FormStudioExtensionControlProps<TValue> {
    field: FormStudioFieldContext;
}
type FormExtensionControlProps<TValue> = FormStudioExtensionControlProps<TValue>;
type ExtensionDocumentProps<TValue> = FormStudioExtensionControlProps<TValue>;
interface FormStudioExtensionSlots<TValue> {
    FormControls?: ComponentType<FormExtensionControlProps<TValue>>;
    FieldControls?: ComponentType<FieldExtensionControlProps<TValue>>;
    JsonDocument?: ComponentType<ExtensionDocumentProps<TValue>>;
}
/**
 * The state surface needed by a typed extension accessor. Keeping this shape
 * independent of FormStudioState avoids a dependency from the generic
 * extension contract back into the provider implementation.
 */
interface FormStudioExtensionState {
    readonly extensionValues: Readonly<Record<string, unknown>>;
}
/**
 * Static authoring capability registered for one provider lifetime. Document
 * values live in FormStudioState.extensionValues, never on this descriptor.
 */
interface FormStudioExtension<TValue = unknown> {
    readonly id: string;
    readonly label: string;
    validate(input: FormStudioExtensionValidationInput<TValue>): FormStudioDiagnostic[];
    readonly slots?: FormStudioExtensionSlots<TValue>;
}
interface FormStudioValidationResult {
    diagnostics: FormStudioDiagnostic[];
    blocked: boolean;
}
interface DefinedFormStudioExtension<TValue> extends FormStudioExtension<TValue> {
    getValue(state: FormStudioExtensionState): TValue | undefined;
}
/**
 * Centralizes the only cast needed to recover a descriptor's value type from
 * the heterogeneous provider record.
 */
declare function getFormStudioExtensionValue<TValue>(state: FormStudioExtensionState, extension: FormStudioExtension<TValue>): TValue | undefined;
/**
 * Creates an immutable descriptor with a typed state accessor. Consumers may
 * pass a structural FormStudioExtension directly, but extension packages
 * should prefer this helper so reads remain cast-free at their call sites.
 */
declare function defineFormStudioExtension<TValue>(extension: FormStudioExtension<TValue>): Readonly<DefinedFormStudioExtension<TValue>>;

export { type AddFormObjectParametersType as A, type SectionType as B, type CardComponentPropsType as C, type DataOptions as D, type ElementProps as E, type FormStudioExtension as F, defineFormStudioExtension as G, getFormStudioExtensionValue as H, type InitParameters as I, type Mods as M, type SectionProps as S, type FormStudioDiagnostic as a, type FormStudioValidationResult as b, type CardComponentType as c, type CardModalProps as d, type CardModalType as e, type CardProps as f, type CardPropsType as g, type CardType as h, type ComponentProps as i, type DataType as j, type DefinedFormStudioExtension as k, type DefinitionData as l, type ExtensionDocumentProps as m, type FieldCompatibility as n, type FieldExtensionControlProps as o, type FormElement as p, type FormExtensionControlProps as q, type FormInput as r, type FormStudioExtensionControlProps as s, type FormStudioExtensionSlots as t, type FormStudioExtensionState as u, type FormStudioExtensionValidationInput as v, type FormStudioFieldContext as w, type InputSelectDataType as x, type ModLabels as y, type SectionPropsType as z };
