"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { useOptionalFormStudio } from "../FormStudioContext"
import type { FieldCompatibility } from "../types"
import type {
  ExtensionDocumentProps,
  FieldExtensionControlProps,
  FormExtensionControlProps,
  FormStudioExtension,
} from "./types"

export function FormExtensionOutlet({
  schema,
  uiSchema,
}: {
  schema: object
  uiSchema: object
}) {
  const context = useOptionalFormStudio()
  if (!context || context.extensions.length === 0) return null
  const extensions = context.extensions.filter((extension) => extension.slots?.FormControls)
  if (extensions.length === 0) return null

  return (
    <div data-form-studio-extension-outlet="form">
      {extensions.map((extension) => {
        const FormControls = extension.slots?.FormControls
        if (!FormControls) return null
        const props = createControlProps(context, extension, schema, uiSchema)
        return (
          <ExtensionSlotErrorBoundary
            key={extension.id}
            extensionId={extension.id}
            extensionLabel={extension.label}
            slot="form"
            resetKey={slotResetKey(props)}
          >
            <FormControls {...(props as FormExtensionControlProps<any>)} />
          </ExtensionSlotErrorBoundary>
        )
      })}
    </div>
  )
}

/**
 * Lets a staged Save/Cancel host (e.g. CardModal) intercept a field
 * extension's reads/writes instead of binding straight to the live
 * FormStudioContext. Absent, outlets bind directly to context — the
 * live/unstaged behavior every other host (e.g. CompatibilityCard) keeps.
 */
export interface FieldExtensionValueOverride {
  getValue: <TValue>(extension: FormStudioExtension<TValue>) => TValue | undefined
  setValue: <TValue>(extension: FormStudioExtension<TValue>, value: TValue | undefined) => void
}

export function FieldExtensionOutlet({
  fieldPointer,
  compatibility,
  valueOverride,
}: {
  fieldPointer: string
  compatibility?: FieldCompatibility
  valueOverride?: FieldExtensionValueOverride
}) {
  const context = useOptionalFormStudio()
  if (!context || context.extensions.length === 0) return null
  const extensions = context.extensions.filter((extension) => extension.slots?.FieldControls)
  if (extensions.length === 0) return null

  const rootSchema = context.state.schema
  const fieldSchema = resolveFieldSchema(rootSchema, fieldPointer)

  return (
    <div
      data-form-studio-extension-outlet="field"
      data-field-pointer={fieldPointer}
    >
      {extensions.map((extension) => {
        const FieldControls = extension.slots?.FieldControls
        if (!FieldControls) return null
        const baseProps = createControlProps(
          context,
          extension,
          context.state.schema,
          context.state.uiSchema,
          valueOverride
        )
        const props: FieldExtensionControlProps<any> = {
          ...baseProps,
          field: {
            fieldPointer,
            fieldSchema,
            rootSchema,
            compatibility,
          },
        }
        return (
          <ExtensionSlotErrorBoundary
            key={extension.id}
            extensionId={extension.id}
            extensionLabel={extension.label}
            slot="field"
            resetKey={slotResetKey(props)}
          >
            <FieldControls {...props} />
          </ExtensionSlotErrorBoundary>
        )
      })}
    </div>
  )
}

export function JsonDocumentExtensionOutlet() {
  const context = useOptionalFormStudio()
  if (!context || context.extensions.length === 0) return null

  return (
    <>
      {context.extensions.map((extension) => {
        const JsonDocument = extension.slots?.JsonDocument
        if (!JsonDocument) return null
        const props = createControlProps(
          context,
          extension,
          context.state.schema,
          context.state.uiSchema
        )
        return (
          <ExtensionSlotErrorBoundary
            key={extension.id}
            extensionId={extension.id}
            extensionLabel={extension.label}
            slot="json-document"
            resetKey={slotResetKey(props)}
          >
            <JsonDocument {...(props as ExtensionDocumentProps<any>)} />
          </ExtensionSlotErrorBoundary>
        )
      })}
    </>
  )
}

function createControlProps(
  context: NonNullable<ReturnType<typeof useOptionalFormStudio>>,
  extension: FormStudioExtension<any>,
  schema: object,
  uiSchema: object,
  valueOverride?: FieldExtensionValueOverride
): FormExtensionControlProps<any> {
  return {
    extension,
    schema,
    uiSchema,
    value: valueOverride ? valueOverride.getValue(extension) : context.getExtensionValue(extension),
    setValue: (value) =>
      valueOverride
        ? valueOverride.setValue(extension, value)
        : context.setExtensionValue(extension, value),
    // A staged host hasn't committed its draft yet, so debounced diagnostics
    // computed against live context state don't describe it — omit them
    // rather than show feedback for a value the user isn't looking at.
    diagnostics: valueOverride
      ? []
      : context.extensionDiagnostics.filter((diagnostic) => diagnostic.source === extension.id),
  }
}

function resolveFieldSchema(rootSchema: object, fieldPointer: string): object {
  if (fieldPointer === "") return rootSchema
  const tokens = fieldPointer
    .split("/")
    .slice(1)
    .map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"))
  let current: unknown = rootSchema

  for (const token of tokens) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return {}
    current = (current as Record<string, unknown>)[token]
  }

  return current && typeof current === "object" && !Array.isArray(current) ? current : {}
}

function slotResetKey(props: FormExtensionControlProps<any> | FieldExtensionControlProps<any>) {
  return JSON.stringify({
    schema: props.schema,
    uiSchema: props.uiSchema,
    value: props.value,
    field: "field" in props ? props.field.fieldPointer : undefined,
  })
}

interface ExtensionSlotErrorBoundaryProps {
  children: ReactNode
  extensionId: string
  extensionLabel: string
  slot: "form" | "field" | "json-document"
  resetKey: string
}

interface ExtensionSlotErrorBoundaryState {
  error: Error | null
}

class ExtensionSlotErrorBoundary extends Component<
  ExtensionSlotErrorBoundaryProps,
  ExtensionSlotErrorBoundaryState
> {
  state: ExtensionSlotErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ExtensionSlotErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `Form Studio extension ${this.props.extensionId} ${this.props.slot} render error`,
      error,
      errorInfo
    )
  }

  componentDidUpdate(previousProps: ExtensionSlotErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="alert alert-warning"
          role="alert"
          data-extension-slot-error={this.props.extensionId}
          data-extension-slot={this.props.slot}
        >
          <span>
            {this.props.extensionLabel} {this.props.slot} controls unavailable: {this.state.error.message}
          </span>
        </div>
      )
    }
    return this.props.children
  }
}
