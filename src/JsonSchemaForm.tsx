"use client"

import { withTheme } from "@rjsf/core"
import validator from "@rjsf/validator-ajv8"
import DaisyTheme from "./DaisyTheme"

export type JsonSchemaDocument = Record<string, unknown>

export interface JsonSchemaFormEvent<
  TFormData extends object = Record<string, unknown>
> {
  formData: TFormData
}

export interface JsonSchemaFormValidationError {
  name?: string
  property?: string
  message?: string
  params?: Record<string, unknown>
  stack?: string
  schemaPath?: string
}

export interface JsonSchemaFormProps<
  TFormData extends object = Record<string, unknown>
> {
  schema: JsonSchemaDocument
  uiSchema?: JsonSchemaDocument
  formData?: TFormData
  onChange?: (event: JsonSchemaFormEvent<TFormData>) => void
  onSubmit?: (event: JsonSchemaFormEvent<TFormData>) => void | Promise<void>
  onError?: (errors: JsonSchemaFormValidationError[]) => void
  disabled?: boolean
  readonly?: boolean
  className?: string
  idPrefix?: string
  name?: string
  noHtml5Validate?: boolean
  focusOnFirstError?: boolean
}

const ThemedForm = withTheme(DaisyTheme)

function normalizeValidationErrors(errors: any[]): JsonSchemaFormValidationError[] {
  return errors.map((error) => ({
    name: typeof error?.name === "string" ? error.name : undefined,
    property: typeof error?.property === "string" ? error.property : undefined,
    message: typeof error?.message === "string" ? error.message : undefined,
    params:
      error?.params && typeof error.params === "object" && !Array.isArray(error.params)
        ? error.params
        : undefined,
    stack: typeof error?.stack === "string" ? error.stack : undefined,
    schemaPath: typeof error?.schemaPath === "string" ? error.schemaPath : undefined,
  }))
}

/**
 * Canonical context-free JSON Schema renderer shared by Form Studio consumers.
 * RJSF, its validator, and the DaisyUI theme remain private implementation details.
 */
export default function JsonSchemaForm<
  TFormData extends object = Record<string, unknown>
>({
  schema,
  uiSchema = {},
  formData,
  onChange,
  onSubmit,
  onError,
  ...formProps
}: JsonSchemaFormProps<TFormData>) {
  return (
    <ThemedForm
      {...formProps}
      schema={schema as any}
      uiSchema={uiSchema as any}
      formData={formData}
      validator={validator}
      onChange={
        onChange
          ? ({ formData: nextFormData }) =>
              onChange({ formData: nextFormData as TFormData })
          : undefined
      }
      onSubmit={
        onSubmit
          ? ({ formData: submittedFormData }) =>
              onSubmit({ formData: submittedFormData as TFormData })
          : undefined
      }
      onError={onError ? (errors) => onError(normalizeValidationErrors(errors)) : undefined}
    />
  )
}
