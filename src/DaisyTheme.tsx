// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  WidgetProps,
  BaseInputTemplateProps,
  RegistryWidgetsType,
  TemplatesType,
  FieldTemplateProps,
  ArrayFieldItemTemplateProps,
  IconButtonProps,
  FormContextType,
  TitleFieldProps,
  RJSFSchema,
  StrictRJSFSchema,
  DescriptionFieldProps,
  ObjectFieldTemplateProps,
  getTemplate,
  getUiOptions,
  getSubmitButtonOptions,
  SubmitButtonProps,
  schemaRequiresTrueValue,
  descriptionId,
  ariaDescribedByIds,
  enumOptionSelectedValue,
  enumOptionValueDecoder,
  enumOptionValueEncoder,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
  enumOptionsDeselectValue,
  getOptionValueFormat,
  optionId,
  canExpand,
  buttonId,
  titleId,
  examplesId,
  getInputProps,
  TranslatableString,
} from "@rjsf/utils"
import { useCallback } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

import { SchemaExamples, ThemeProps } from "@rjsf/core"
import { controlAppearanceClass } from "./controlAppearance"

// required information symbol
const REQUIRED_FIELD_SYMBOL = " *"

// required label information
type LabelProps = {
  /** The label for the field */
  label?: string
  /** A boolean value stating if the field is required */
  required?: boolean
  /** The id of the input field being labeled */
  id?: string
}

function Label(props: LabelProps) {
  const { label, required, id } = props
  if (!label) {
    return null
  }
  return (
    <label className="mb-1 block text-base font-semibold text-base-content" htmlFor={id}>
      {label}
      {required && <span className="text-error">{REQUIRED_FIELD_SYMBOL}</span>}
    </label>
  )
}

// template updates

// title field template the top template
function MyTitleField<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: TitleFieldProps<T, S, F>) {
  const { id, title, required } = props
  return (
    <legend id={id} className="mb-4 text-xl font-semibold text-base-content">
      {title}
      {required && <span className="text-error">{REQUIRED_FIELD_SYMBOL}</span>}
    </legend>
  )
}

// description field template
function MyDescriptionField<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: DescriptionFieldProps<T, S, F>) {
  const { id, description } = props
  if (!description) {
    return null
  }
  if (typeof description === "string") {
    return (
      <div
        id={id}
        className="markdown-display prose max-w-none dark:prose-invert text-md italic mb-2"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{description}</ReactMarkdown>
      </div>
    )
  } else {
    return (
      <div id={id} className="text-md italic">
        {description}
      </div>
    )
  }
}

// field template
function MyFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: FieldTemplateProps<T, S, F>) {
  const {
    id,
    label,
    children,
    errors,
    help,
    description,
    hidden,
    required,
    displayLabel,
    registry,
    uiSchema,
  } = props
  const uiOptions = getUiOptions(uiSchema)
  const WrapIfAdditionalTemplate = getTemplate<"WrapIfAdditionalTemplate", T, S, F>(
    "WrapIfAdditionalTemplate",
    registry,
    uiOptions
  )
  if (hidden) {
    return <div className="hidden">{children}</div>
  }
  return (
    <WrapIfAdditionalTemplate {...props}>
      <div className="rjsf-field-layout mb-5 min-w-0 px-1">
        {displayLabel && <Label label={label} required={required} id={id} />}
        {displayLabel && description ? description : null}
        <div className="min-w-0">{children}</div>
        {errors}
        {help}
      </div>
    </WrapIfAdditionalTemplate>
  )
}

function MyArrayFieldItemTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: ArrayFieldItemTemplateProps<T, S, F>) {
  const { children, className, buttonsProps, hasToolbar, registry, uiSchema } = props
  const options = getUiOptions(uiSchema)
  const ArrayFieldItemButtonsTemplate = getTemplate<
    "ArrayFieldItemButtonsTemplate",
    T,
    S,
    F
  >("ArrayFieldItemButtonsTemplate", registry, options)

  return (
    <div
      className={`${className} mb-3 flex w-full min-w-0 items-end gap-2 [&_.rjsf-field-layout]:mb-0`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {hasToolbar ? (
        <div className="flex shrink-0 items-center gap-1 py-1">
          <ArrayFieldItemButtonsTemplate {...buttonsProps} />
        </div>
      ) : null}
    </div>
  )
}

function MyObjectFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: ObjectFieldTemplateProps<T, S, F>) {
  const {
    description,
    disabled,
    fieldPathId,
    formData,
    onAddProperty,
    optionalDataControl,
    properties,
    readonly,
    registry,
    required,
    schema,
    title,
    uiSchema,
  } = props
  const options = getUiOptions(uiSchema)
  const DescriptionFieldTemplate = getTemplate<"DescriptionFieldTemplate", T, S, F>(
    "DescriptionFieldTemplate",
    registry,
    options
  )
  const { AddButton } = registry.templates.ButtonTemplates
  const isRoot = fieldPathId.path.length === 0
  const showOptionalDataControlInTitle = !readonly && !disabled

  return (
    <fieldset
      id={fieldPathId.$id}
      className={isRoot ? "min-w-0" : "mt-8 min-w-0"}
    >
      {title && (
        <legend
          className={
            isRoot
              ? "mb-6 block w-full text-2xl font-bold text-base-content"
              : "mb-4 block w-full text-xl font-semibold text-base-content"
          }
        >
          <span id={titleId(fieldPathId)}>{title}</span>
          {required && <span className="text-error">{REQUIRED_FIELD_SYMBOL}</span>}
          {showOptionalDataControlInTitle ? optionalDataControl : undefined}
        </legend>
      )}
      {description && (
        <DescriptionFieldTemplate
          id={descriptionId(fieldPathId)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      {!showOptionalDataControlInTitle ? optionalDataControl : undefined}
      <div className="min-w-0">
        {properties.map((property) => (
          <div key={property.name}>{property.content}</div>
        ))}
      </div>
      {canExpand(schema, uiSchema, formData) && (
        <AddButton
          id={buttonId(fieldPathId, "add")}
          className="rjsf-object-property-expand"
          onClick={onAddProperty}
          disabled={disabled || readonly}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
    </fieldset>
  )
}

// button templates
function MySubmitButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ uiSchema }: SubmitButtonProps<T, S, F>) {
  const {
    submitText,
    norender,
    props: submitButtonProps = {},
  } = getSubmitButtonOptions<T, S, F>(uiSchema)
  if (norender) {
    return null
  }
  return (
    <div>
      <button
        type="submit"
        {...submitButtonProps}
        className={`btn btn-primary ${submitButtonProps.className || ""}`}
      >
        {submitText}
      </button>
    </div>
  )
}

const actionButtonClassName =
  "btn h-11 min-h-11 gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 focus:ring-offset-base-100"

function buttonLabel(props: IconButtonProps, key: TranslatableString) {
  return props.registry.translateString(key)
}

function MyAddButton(props: IconButtonProps) {
  const { registry, uiSchema: _uiSchema, className, ...buttonProps } = props
  const label = buttonLabel(props, TranslatableString.AddButton)
  return (
    <button
      type="button"
      {...buttonProps}
      className={`${actionButtonClassName} btn-primary ml-1 mt-1 ${className || ""}`}
      title={label}
      aria-label={label}
    >
      <PlusIcon className="h-4 w-4" aria-hidden="true" />
      <span>{label} item</span>
    </button>
  )
}

function MyRemoveButton(props: IconButtonProps) {
  const { registry, uiSchema: _uiSchema, className, ...buttonProps } = props
  const label = buttonLabel(props, TranslatableString.RemoveButton)
  return (
    <button
      type="button"
      {...buttonProps}
      className={`${actionButtonClassName} btn-error btn-outline ${className || ""}`}
      title={label}
      aria-label={label}
    >
      <TrashIcon className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function MyMoveUpButton(props: IconButtonProps) {
  const { registry, uiSchema: _uiSchema, className, ...buttonProps } = props
  const label = buttonLabel(props, TranslatableString.MoveUpButton)
  return (
    <button
      type="button"
      {...buttonProps}
      className={`${actionButtonClassName} btn-square btn-ghost border border-base-300 ${className || ""}`}
      title={label}
      aria-label={label}
    >
      <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

function MyMoveDownButton(props: IconButtonProps) {
  const { registry, uiSchema: _uiSchema, className, ...buttonProps } = props
  const label = buttonLabel(props, TranslatableString.MoveDownButton)
  return (
    <button
      type="button"
      {...buttonProps}
      className={`${actionButtonClassName} btn-square btn-ghost border border-base-300 ${className || ""}`}
      title={label}
      aria-label={label}
    >
      <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

function MyCopyButton(props: IconButtonProps) {
  const { registry, uiSchema: _uiSchema, className, ...buttonProps } = props
  const label = buttonLabel(props, TranslatableString.CopyButton)
  return (
    <button
      type="button"
      {...buttonProps}
      className={`${actionButtonClassName} btn-square btn-ghost border border-base-300 ${className || ""}`}
      title={label}
      aria-label={label}
    >
      <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

function MyClearButton(props: IconButtonProps) {
  const { registry, uiSchema: _uiSchema, className, ...buttonProps } = props
  const label = buttonLabel(props, TranslatableString.ClearButton)
  return (
    <button
      type="button"
      {...buttonProps}
      className={`${actionButtonClassName} btn-square btn-ghost border border-base-300 ${className || ""}`}
      title={label}
      aria-label={label}
    >
      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

// here's the custom widgets

const inputClassName =
  `input input-bordered input-primary h-11 w-full text-base text-base-content ${controlAppearanceClass}`

const textareaClassName =
  `textarea textarea-bordered textarea-primary min-h-28 w-full resize-y text-base text-base-content ${controlAppearanceClass}`

const choiceFocusClassName =
  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 focus:ring-offset-base-100"

const checkboxClassName = `checkbox checkbox-primary ${choiceFocusClassName}`
const radioClassName = `radio radio-primary ${choiceFocusClassName}`
const selectClassName =
  `select select-bordered select-primary w-full text-base text-base-content ${controlAppearanceClass}`

function MyBaseInputTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: BaseInputTemplateProps<T, S, F>) {
  const {
    id,
    name: _name,
    htmlName,
    value,
    readonly,
    disabled,
    autofocus,
    onBlur,
    onFocus,
    onChange,
    onChangeOverride,
    options,
    schema,
    uiSchema: _uiSchema,
    registry,
    rawErrors: _rawErrors,
    type,
    hideLabel: _hideLabel,
    hideError: _hideError,
    className,
    ...rest
  } = props
  const { ClearButton } = registry.templates.ButtonTemplates
  if (!id) {
    throw new Error("RJSF base input requires an id")
  }
  const inputProps = {
    ...rest,
    ...getInputProps(schema, type, options),
  }
  const inputValue =
    inputProps.type === "number" || inputProps.type === "integer"
      ? value || value === 0
        ? value
        : ""
      : value == null
        ? ""
        : value
  const handleChange = useCallback(
    ({ target: { value: nextValue } }) =>
      onChange(nextValue === "" ? options.emptyValue : nextValue),
    [onChange, options]
  )
  const handleBlur = useCallback(
    ({ target }) => onBlur(id, target?.value),
    [id, onBlur]
  )
  const handleFocus = useCallback(
    ({ target }) => onFocus(id, target?.value),
    [id, onFocus]
  )
  const handleClear = useCallback(
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      onChange(options.emptyValue ?? "")
    },
    [onChange, options.emptyValue]
  )

  return (
    <div className="min-w-0 py-1">
      <input
        id={id}
        name={htmlName || id}
        className={`${inputClassName} ${className || ""}`.trim()}
        readOnly={readonly}
        disabled={disabled}
        autoFocus={autofocus}
        value={inputValue}
        {...inputProps}
        list={schema.examples ? examplesId(id) : undefined}
        onChange={onChangeOverride || handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        aria-describedby={ariaDescribedByIds(id, !!schema.examples)}
      />
      {options.allowClearTextInputs && !readonly && !disabled && inputValue ? (
        <ClearButton registry={registry} onClick={handleClear} />
      ) : null}
      <SchemaExamples id={id} schema={schema} />
    </div>
  )
}

const MyTextareaWidget = (props: WidgetProps) => {
  return (
    <div className="min-w-0 py-1">
      <textarea
        id={props.id}
        name={props.htmlName || props.id}
        className={textareaClassName}
        value={props.value ?? ""}
        placeholder={props.placeholder}
        required={props.required}
        disabled={props.disabled}
        readOnly={props.readonly}
        autoFocus={props.autofocus}
        rows={typeof props.options.rows === "number" ? props.options.rows : 5}
        onChange={(event) =>
          props.onChange(event.target.value === "" ? props.options.emptyValue : event.target.value)
        }
        onBlur={(event) => props.onBlur(props.id, event.target.value)}
        onFocus={(event) => props.onFocus(props.id, event.target.value)}
        aria-describedby={ariaDescribedByIds(props.id)}
      />
    </div>
  )
}

const MyCheckboxWidget = (props: WidgetProps) => {
  const {
    id,
    value,
    disabled,
    readonly,
    label,
    hideLabel,
    onChange,
    onBlur,
    onFocus,
    options,
    schema,
    uiSchema,
    registry,
    htmlName,
    autofocus,
  } = props
  const DescriptionFieldTemplate = getTemplate("DescriptionFieldTemplate", registry, options)
  const description = options.description ?? schema.description
  const required = schemaRequiresTrueValue(schema)

  return (
    <div className="field-checkbox py-1">
      {!hideLabel && !!description && (
        <DescriptionFieldTemplate
          id={descriptionId(id)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <label
        className={`flex items-center gap-3 ${disabled || readonly ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        htmlFor={id}
      >
        <input
          type="checkbox"
          id={id}
          name={htmlName || id}
          className={checkboxClassName}
          checked={typeof value === "undefined" ? false : value}
          required={required}
          disabled={disabled || readonly}
          autoFocus={autofocus}
          aria-describedby={ariaDescribedByIds(id)}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={(e) => onBlur(id, e.target.checked)}
          onFocus={(e) => onFocus(id, e.target.checked)}
        />
        {!hideLabel && label ? (
          <span className="text-base font-semibold text-base-content">
            {label}
            {required && <span className="text-error">{REQUIRED_FIELD_SYMBOL}</span>}
          </span>
        ) : null}
      </label>
    </div>
  )
}

const getSelectValue = (event, multiple) =>
  multiple
    ? Array.from(event.target.options)
        .filter((option: any) => option.selected)
        .map((option: any) => option.value)
    : event.target.value

const MySelectWidget = (props: WidgetProps) => {
  const {
    schema,
    id,
    options,
    value,
    required,
    disabled,
    readonly,
    multiple = false,
    autofocus = false,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    htmlName,
  } = props
  const { enumOptions, enumDisabled, emptyValue: optionEmptyValue } = options
  const emptyValue = multiple ? [] : ""
  const optionValueFormat = getOptionValueFormat(options)
  const selectedValue = enumOptionSelectedValue(
    value,
    enumOptions,
    multiple,
    optionValueFormat,
    emptyValue
  )
  const decodeValue = (event) =>
    enumOptionValueDecoder(
      getSelectValue(event, multiple),
      enumOptions,
      optionValueFormat,
      optionEmptyValue
    )

  return (
    <div className="min-w-0 py-1">
      <select
        id={id}
        name={htmlName || id}
        multiple={multiple}
        className={`${selectClassName} ${multiple ? "min-h-28" : "h-11"}`}
        value={selectedValue}
        required={required}
        disabled={disabled || readonly}
        autoFocus={autofocus}
        onChange={(event) => onChange(decodeValue(event))}
        onBlur={(event) => onBlur(id, decodeValue(event))}
        onFocus={(event) => onFocus(id, decodeValue(event))}
        aria-describedby={ariaDescribedByIds(id)}
      >
        {!multiple && schema.default === undefined ? <option value="">{placeholder}</option> : null}
        {Array.isArray(enumOptions)
          ? enumOptions.map(({ value: optionValue, label: optionLabel }, index) => (
              <option
                key={String(optionValue)}
                value={enumOptionValueEncoder(optionValue, index, optionValueFormat)}
                disabled={Array.isArray(enumDisabled) && enumDisabled.includes(optionValue)}
              >
                {optionLabel}
              </option>
            ))
          : null}
      </select>
    </div>
  )
}

const MyRadioWidget = (props: WidgetProps) => {
  const {
    options,
    value,
    required,
    disabled,
    readonly,
    autofocus = false,
    onBlur,
    onFocus,
    onChange,
    id,
    htmlName,
  } = props
  const { enumOptions, enumDisabled, inline = false, emptyValue } = options
  const optionValueFormat = getOptionValueFormat(options)

  return (
    <div
      className={`flex gap-3 py-1 ${inline ? "flex-row flex-wrap" : "flex-col"}`}
      id={id}
      role="radiogroup"
    >
      {Array.isArray(enumOptions)
        ? enumOptions.map((option, index) => {
            const itemDisabled =
              disabled || readonly ||
              (Array.isArray(enumDisabled) && enumDisabled.includes(option.value))
            const encodedValue = enumOptionValueEncoder(option.value, index, optionValueFormat)
            const decodeValue = (event) =>
              enumOptionValueDecoder(
                event.target.value,
                enumOptions,
                optionValueFormat,
                emptyValue
              )

            return (
              <label
                key={String(option.value)}
                className={`flex items-center gap-3 ${itemDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                htmlFor={optionId(id, index)}
              >
                <input
                  type="radio"
                  className={radioClassName}
                  id={optionId(id, index)}
                  checked={enumOptionsIsSelected(option.value, value)}
                  name={htmlName || id}
                  required={required}
                  value={encodedValue}
                  disabled={itemDisabled}
                  autoFocus={autofocus && index === 0}
                  onChange={() => onChange(option.value)}
                  onBlur={(event) => onBlur(id, decodeValue(event))}
                  onFocus={(event) => onFocus(id, decodeValue(event))}
                  aria-describedby={ariaDescribedByIds(id)}
                />
                <span className="text-base text-base-content">{option.label}</span>
              </label>
            )
          })
        : null}
    </div>
  )
}

const MyCheckboxesWidget = (props: WidgetProps) => {
  const {
    id,
    disabled,
    options,
    value,
    readonly,
    onChange,
    onBlur,
    onFocus,
    autofocus = false,
    htmlName,
  } = props
  const { enumOptions, enumDisabled, emptyValue, inline = false } = options
  const checkboxesValues = Array.isArray(value) ? value : [value]
  const optionValueFormat = getOptionValueFormat(options)

  return (
    <div
      className={`checkboxes-group flex gap-3 py-1 ${inline ? "flex-row flex-wrap" : "flex-col"}`}
      id={id}
    >
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index) => {
          const checked = enumOptionsIsSelected(option.value, checkboxesValues)
          const itemDisabled =
            Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1
          const isDisabled = disabled || itemDisabled || readonly
          const encodedValue = enumOptionValueEncoder(option.value, index, optionValueFormat)
          const decodeValue = (event) =>
            enumOptionValueDecoder(
              event.target.value,
              enumOptions,
              optionValueFormat,
              emptyValue
            )

          return (
            <label
              key={String(option.value)}
              className={`checkboxes-option flex items-center gap-3 ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              htmlFor={optionId(id, index)}
            >
              <input
                type="checkbox"
                className={checkboxClassName}
                id={optionId(id, index)}
                name={htmlName || id}
                checked={checked}
                value={encodedValue}
                disabled={isDisabled}
                autoFocus={autofocus && index === 0}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange(enumOptionsSelectValue(index, checkboxesValues, enumOptions))
                  } else {
                    onChange(enumOptionsDeselectValue(index, checkboxesValues, enumOptions))
                  }
                }}
                onBlur={(event) => onBlur(id, decodeValue(event))}
                onFocus={(event) => onFocus(id, decodeValue(event))}
                aria-describedby={ariaDescribedByIds(id)}
              />
              <span>{option.label}</span>
            </label>
          )
        })}
    </div>
  )
}

// create Registry information
// templates
const myTemplates: Partial<TemplatesType> = {
  TitleFieldTemplate: MyTitleField,
  DescriptionFieldTemplate: MyDescriptionField,
  FieldTemplate: MyFieldTemplate,
  ObjectFieldTemplate: MyObjectFieldTemplate,
  ArrayFieldItemTemplate: MyArrayFieldItemTemplate,
  BaseInputTemplate: MyBaseInputTemplate,
  ButtonTemplates: {
    SubmitButton: MySubmitButton,
    AddButton: MyAddButton,
    CopyButton: MyCopyButton,
    MoveDownButton: MyMoveDownButton,
    MoveUpButton: MyMoveUpButton,
    RemoveButton: MyRemoveButton,
    ClearButton: MyClearButton,
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
}

// templates
const myWidgets: RegistryWidgetsType = {
  TextareaWidget: MyTextareaWidget,
  CheckboxWidget: MyCheckboxWidget,
  CheckboxesWidget: MyCheckboxesWidget,
  RadioWidget: MyRadioWidget,
  SelectWidget: MySelectWidget,
}

// create the overall theme to use on the other page
const DaisyTheme: ThemeProps = {
  widgets: myWidgets,
  templates: myTemplates,
}
export default DaisyTheme
