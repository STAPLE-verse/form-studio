// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  WidgetProps,
  RegistryWidgetsType,
  TemplatesType,
  FieldTemplateProps,
  FormContextType,
  TitleFieldProps,
  RJSFSchema,
  StrictRJSFSchema,
  DescriptionFieldProps,
  getTemplate,
  getUiOptions,
  getSubmitButtonOptions,
  SubmitButtonProps,
  schemaRequiresTrueValue,
  descriptionId,
  ariaDescribedByIds,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
  enumOptionsDeselectValue,
  enumOptionsValueForIndex,
  optionId,
  enumOptionSelectedValue,
  enumOptionValueDecoder,
  enumOptionValueEncoder,
  getOptionValueFormat,
  getInputProps,
  examplesId,
  BaseInputTemplateProps,
} from "@rjsf/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

import { ThemeProps } from "@rjsf/core"

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
    <label className="text-lg font-bold" htmlFor={id}>
      {label}
      {required && <span className="font-red italic">{REQUIRED_FIELD_SYMBOL}</span>}
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
    <legend id={id} className="text-xl font-bold">
      {title}
      {required && <span className="required">{REQUIRED_FIELD_SYMBOL}</span>}
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
    <div className="mb-4">
      <WrapIfAdditionalTemplate {...props}>
        {displayLabel && <Label label={label} required={required} id={id} />}
        {displayLabel && description ? description : null}
        {children}
        {errors}
        {help}
      </WrapIfAdditionalTemplate>
    </div>
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

// here's the custom widgets

// text input field
const MyTextWidget = (props: WidgetProps) => {
  return (
    <div className="flex">
      <input
        type="text"
        style={{ fontSize: "1rem" }}
        className="input input-primary input-bordered focus:outline-secondary bg-base-300 w-full mt-2"
        value={props.value || ""}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  )
}

const MyEmailWidget = (props: WidgetProps) => {
  return (
    <div className="flex">
      <input
        type="email"
        style={{ fontSize: "1rem" }}
        className="input input-primary input-bordered focus:outline-secondary bg-base-300 w-full mt-2"
        value={props.value || ""}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  )
}

const MyTextareaWidget = (props: WidgetProps) => {
  const options = props.options || {}
  const rows = typeof options.rows === "number" || typeof options.rows === "string" ? options.rows : 5
  return (
    <div className="flex">
      <textarea
        style={{ fontSize: "1rem" }}
        className="textarea textarea-primary textarea-bordered focus:outline-secondary bg-base-300 w-full mt-2"
        rows={rows as number}
        value={props.value || ""}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value === "" ? options.emptyValue : event.target.value)}
      />
    </div>
  )
}

// base input template, covers date/datetime/time/number/password/url/color/range/file widgets,
// since RJSF's built-in widgets for those types all delegate to BaseInputTemplate with a different `type`
function MyBaseInputTemplate(props: BaseInputTemplateProps) {
  const {
    id,
    name,
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
    type,
    hideLabel,
    hideError,
    ...rest
  } = props

  const inputProps = {
    ...rest,
    ...getInputProps(schema, type, options),
  }

  let inputValue
  if (inputProps.type === "number" || inputProps.type === "integer") {
    inputValue = value || value === 0 ? value : ""
  } else {
    inputValue = value == null ? "" : value
  }

  const handleChange = (event: any) =>
    onChange(event.target.value === "" ? options.emptyValue : event.target.value)
  const handleBlur = (event: any) => onBlur(id, event.target?.value)
  const handleFocus = (event: any) => onFocus(id, event.target?.value)

  let className = "input input-primary input-bordered focus:outline-secondary bg-base-300 w-full mt-2"
  if (inputProps.type === "range") {
    className = "range range-primary mt-2"
  } else if (inputProps.type === "file") {
    className = "file-input file-input-primary file-input-bordered focus:outline-secondary bg-base-300 w-full mt-2"
  } else if (inputProps.type === "color") {
    className = "input input-primary input-bordered focus:outline-secondary h-12 w-20 p-1 mt-2"
  }

  return (
    <input
      id={id}
      name={htmlName || id}
      className={className}
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
  )
}

// radio widget
const MyRadioWidget = (props: WidgetProps) => {
  const { id, options, value, required, disabled, readonly, onChange, htmlName } = props
  const { enumOptions, enumDisabled } = options

  return (
    <div id={id} role="radiogroup" className="flex flex-col gap-1 mt-1">
      {Array.isArray(enumOptions) &&
        enumOptions.map((option: any, i: number) => {
          const checked = option.value === value
          const itemDisabled = Array.isArray(enumDisabled) && enumDisabled.includes(option.value)
          return (
            <label key={String(option.value)} className="label cursor-pointer justify-start gap-3 px-0">
              <input
                type="radio"
                id={optionId(id, i)}
                name={htmlName || id}
                checked={checked}
                required={required}
                value={option.value}
                disabled={disabled || itemDisabled || readonly}
                onChange={() => onChange(option.value)}
                className="radio radio-primary radio-sm"
                aria-describedby={ariaDescribedByIds(id)}
              />
              <span className="label-text text-base">{option.label}</span>
            </label>
          )
        })}
    </div>
  )
}

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
    onChange,
    onBlur,
    onFocus,
    placeholder,
    htmlName,
  } = props
  const { enumOptions, enumDisabled, emptyValue: optEmptyVal } = options
  const emptyValue = multiple ? [] : ""
  const optionValueFormat = getOptionValueFormat(options)

  const getValue = (event: any) => {
    if (multiple) {
      return Array.from(event.target.options as HTMLOptionElement[])
        .filter((o) => o.selected)
        .map((o) => o.value)
    }
    return event.target.value
  }

  const selectValue = enumOptionSelectedValue(value, enumOptions, multiple, optionValueFormat, emptyValue)
  const showPlaceholderOption = !multiple && schema.default === undefined

  return (
    <select
      id={id}
      name={htmlName || id}
      multiple={multiple}
      className="select select-primary select-bordered focus:outline-secondary bg-base-300 w-full mt-2"
      value={selectValue}
      required={required}
      disabled={disabled || readonly}
      onBlur={(event) => onBlur(id, enumOptionValueDecoder(getValue(event), enumOptions, optionValueFormat, optEmptyVal))}
      onFocus={(event) => onFocus(id, enumOptionValueDecoder(getValue(event), enumOptions, optionValueFormat, optEmptyVal))}
      onChange={(event) => onChange(enumOptionValueDecoder(getValue(event), enumOptions, optionValueFormat, optEmptyVal))}
      aria-describedby={ariaDescribedByIds(id)}
    >
      {showPlaceholderOption && <option value="">{placeholder}</option>}
      {Array.isArray(enumOptions) &&
        enumOptions.map(({ value: enumValue, label: enumLabel }: any, i: number) => {
          const isDisabled = enumDisabled && enumDisabled.includes(enumValue)
          return (
            <option key={String(enumValue)} value={enumOptionValueEncoder(enumValue, i, optionValueFormat)} disabled={isDisabled}>
              {enumLabel}
            </option>
          )
        })}
    </select>
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
  } = props
  const DescriptionFieldTemplate = getTemplate("DescriptionFieldTemplate", registry, options)
  const description = options.description ?? schema.description
  const required = schemaRequiresTrueValue(schema)

  return (
    <div className="field-checkbox">
      {!hideLabel && label && (
        <label className="text-lg font-bold block mb-1" htmlFor={id}>
          {label}
          {required && <span className="italic">{REQUIRED_FIELD_SYMBOL}</span>}
        </label>
      )}
      {!hideLabel && !!description && (
        <DescriptionFieldTemplate
          id={descriptionId(id)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <label className="label cursor-pointer justify-start gap-3 mt-1 px-0">
        <input
          type="checkbox"
          id={id}
          name={id}
          className="checkbox checkbox-primary"
          checked={typeof value === "undefined" ? false : value}
          required={required}
          disabled={disabled || readonly}
          aria-describedby={ariaDescribedByIds(id)}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={(e) => onBlur(id, e.target.checked)}
          onFocus={(e) => onFocus(id, e.target.checked)}
        />
      </label>
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
  } = props
  const { enumOptions, enumDisabled, emptyValue } = options
  const checkboxesValues = Array.isArray(value) ? value : [value]

  return (
    <div className="checkboxes-group flex flex-col gap-1" id={id}>
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index) => {
          const checked = enumOptionsIsSelected(option.value, checkboxesValues)
          const itemDisabled =
            Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1
          const disabledCls = disabled || itemDisabled || readonly ? "disabled" : ""

          return (
            <label
              key={index}
              className={`checkboxes-option label cursor-pointer justify-start gap-3 px-0 ${disabledCls}`}
            >
              <input
                type="checkbox"
                id={optionId(id, index)}
                name={id}
                className="checkbox checkbox-primary"
                checked={checked}
                value={String(index)}
                disabled={disabled || itemDisabled || readonly}
                autoFocus={autofocus && index === 0}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange(enumOptionsSelectValue(index, checkboxesValues, enumOptions))
                  } else {
                    onChange(enumOptionsDeselectValue(index, checkboxesValues, enumOptions))
                  }
                }}
                onBlur={({ target: { value: v } }) =>
                  onBlur(id, enumOptionsValueForIndex(v, enumOptions, emptyValue))
                }
                onFocus={({ target: { value: v } }) =>
                  onFocus(id, enumOptionsValueForIndex(v, enumOptions, emptyValue))
                }
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
  BaseInputTemplate: MyBaseInputTemplate,
  // UnsupportedFieldTemplate: DefaultTemplate,
  // FieldErrorTemplate: DefaultTemplate,
  // FieldHelpTemplate: DefaultTemplate,
  // WrapIfAdditionalTemplate: DefaultTemplate,
}

// templates
const myWidgets: RegistryWidgetsType = {
  TextWidget: MyTextWidget,
  EmailWidget: MyEmailWidget,
  TextareaWidget: MyTextareaWidget,
  SelectWidget: MySelectWidget,
  RadioWidget: MyRadioWidget,
  CheckboxWidget: MyCheckboxWidget,
  CheckboxesWidget: MyCheckboxesWidget,
}

// create the overall theme to use on the other page
const DaisyTheme: ThemeProps = {
  widgets: myWidgets,
  templates: myTemplates,
}
export default DaisyTheme
