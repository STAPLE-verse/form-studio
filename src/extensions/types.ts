export interface FormStudioDiagnostic {
  source: string
  sourceLabel: string
  code: string
  pointer?: string
  stage?: string
  message: string
  severity: "warning" | "error"
  blocksCommit: boolean
}

export interface FormStudioExtensionValidationInput<TValue> {
  schema: object
  uiSchema: object
  value: TValue | undefined
}

/**
 * The state surface needed by a typed extension accessor. Keeping this shape
 * independent of FormStudioState avoids a dependency from the generic
 * extension contract back into the provider implementation.
 */
export interface FormStudioExtensionState {
  readonly extensionValues: Readonly<Record<string, unknown>>
}

/**
 * Static authoring capability registered for one provider lifetime. Document
 * values live in FormStudioState.extensionValues, never on this descriptor.
 */
export interface FormStudioExtension<TValue = unknown> {
  readonly id: string
  readonly label: string
  validate(input: FormStudioExtensionValidationInput<TValue>): FormStudioDiagnostic[]
}

export interface DefinedFormStudioExtension<TValue> extends FormStudioExtension<TValue> {
  getValue(state: FormStudioExtensionState): TValue | undefined
}

/**
 * Centralizes the only cast needed to recover a descriptor's value type from
 * the heterogeneous provider record.
 */
export function getFormStudioExtensionValue<TValue>(
  state: FormStudioExtensionState,
  extension: FormStudioExtension<TValue>
): TValue | undefined {
  return state.extensionValues[extension.id] as TValue | undefined
}

/**
 * Creates an immutable descriptor with a typed state accessor. Consumers may
 * pass a structural FormStudioExtension directly, but extension packages
 * should prefer this helper so reads remain cast-free at their call sites.
 */
export function defineFormStudioExtension<TValue>(
  extension: FormStudioExtension<TValue>
): Readonly<DefinedFormStudioExtension<TValue>> {
  const id = extension.id
  return Object.freeze({
    ...extension,
    getValue: (state: FormStudioExtensionState) =>
      state.extensionValues[id] as TValue | undefined,
  })
}
