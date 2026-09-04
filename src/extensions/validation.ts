import { useMemo, useRef } from "react"
import { DEBOUNCE_MS } from "../debounce"
import { useDebouncedValue } from "../useDebouncedValue"
import type { FormStudioState } from "../FormStudioContext"
import type { FormStudioExtensionRegistry } from "./registry"
import type { FormStudioDiagnostic, FormStudioValidationResult } from "./types"

interface ExtensionValidationState {
  schema: object
  uiSchema: object
  extensionValues: Readonly<Record<string, unknown>>
}

export function validateRegisteredExtensions(
  registry: FormStudioExtensionRegistry,
  state: ExtensionValidationState
): FormStudioValidationResult {
  const diagnostics = registry.extensions.flatMap((extension) => {
    try {
      return extension
        .validate({
          schema: state.schema,
          uiSchema: state.uiSchema,
          value: state.extensionValues[extension.id],
        })
        .map((diagnostic) => ({
          ...diagnostic,
          source: extension.id,
          sourceLabel: extension.label,
        }))
    } catch (error) {
      return [validatorFailureDiagnostic(extension.id, extension.label, error)]
    }
  })

  return {
    diagnostics,
    blocked: diagnostics.some((diagnostic) => diagnostic.blocksCommit),
  }
}

export function useDebouncedExtensionDiagnostics(
  registry: FormStudioExtensionRegistry,
  state: Pick<FormStudioState, "schema" | "uiSchema" | "extensionValues">
): FormStudioDiagnostic[] {
  const input = useStableExtensionValidationState(state)
  const debouncedInput = useDebouncedValue(input, DEBOUNCE_MS)

  return useMemo(
    () => validateRegisteredExtensions(registry, debouncedInput).diagnostics,
    [registry, debouncedInput]
  )
}

function useStableExtensionValidationState(
  state: Pick<FormStudioState, "schema" | "uiSchema" | "extensionValues">
): ExtensionValidationState {
  const input: ExtensionValidationState = {
    schema: state.schema,
    uiSchema: state.uiSchema,
    extensionValues: state.extensionValues,
  }
  const fingerprint = JSON.stringify(input)
  const ref = useRef({ fingerprint, input })
  if (ref.current.fingerprint !== fingerprint) {
    ref.current = { fingerprint, input }
  }
  return ref.current.input
}

function validatorFailureDiagnostic(
  source: string,
  sourceLabel: string,
  error: unknown
): FormStudioDiagnostic {
  return {
    source,
    sourceLabel,
    code: "FS_EXTENSION_VALIDATION_FAILED",
    stage: "validation",
    message: error instanceof Error ? error.message : "Validation failed unexpectedly",
    severity: "error",
    blocksCommit: true,
  }
}
