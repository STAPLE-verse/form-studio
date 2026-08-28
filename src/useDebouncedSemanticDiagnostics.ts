import { useMemo, useRef } from "react"
import type { ConformanceDiagnostic, SemanticV1Component } from "@staple-verse/marker-template-runtime"
import { useDebouncedValue } from "./useDebouncedValue"
import { computeSemanticDiagnostics, type SemanticValidationInput } from "./semanticValidation"
import { DEBOUNCE_MS } from "./debounce"

const EMPTY_INPUT: SemanticValidationInput = { schema: {}, semantics: undefined }

/**
 * Keeps returning the same object reference for `input` as long as its JSON
 * value hasn't changed. `FormBuilder` re-parses `schema`/`uiSchema` from
 * their string props on every render, so without this, a fresh-but-
 * equivalent `{ schema, semantics }` pair would look "changed" to
 * `useDebouncedValue` on every render — including renders with no actual
 * edit — and keep resetting the debounce timer indefinitely.
 */
function useStableInput(input: SemanticValidationInput): SemanticValidationInput {
  const fingerprint = JSON.stringify(input)
  const ref = useRef({ fingerprint, input })
  if (ref.current.fingerprint !== fingerprint) {
    ref.current = { fingerprint, input }
  }
  return ref.current.input
}

/**
 * Debounced Semantic V1 revalidation (§8), shared by `FormStudioContext` and
 * the standalone `FormBuilder` so both defer to the same schedule instead of
 * two independent debounce implementations. The runtime's field-pointer
 * resolution re-walks `form.schema` from scratch for every binding with no
 * caching, so recomputing this on every Visual Builder keystroke gets
 * expensive for forms with many bindings; diagnostics instead settle
 * `DEBOUNCE_MS` after the last `schema`/`semantics` change — the same
 * trailing-debounce delay Form Studio already uses for the autosave
 * recovery buffer (§4.2) — rather than running synchronously per keystroke.
 *
 * Debouncing only defers *recomputing* diagnostics. Bindings themselves are
 * never touched here (§8 point 1), and the previously computed diagnostics
 * stay visible the entire time a schema edit is settling, so an invalid
 * component never reads as conformant merely because a keystroke is still
 * in flight.
 *
 * Pass `enabled: false` (e.g. a `FormBuilder` host that never opted into
 * semantic authoring via `onSemanticsChange`) to skip touching the runtime
 * entirely rather than debouncing a computation whose result is always `[]`.
 */
export function useDebouncedSemanticDiagnostics(
  schema: object,
  semantics: SemanticV1Component | undefined,
  enabled = true
): ConformanceDiagnostic[] {
  const stableInput = useStableInput(enabled ? { schema, semantics } : EMPTY_INPUT)
  const debouncedInput = useDebouncedValue(stableInput, DEBOUNCE_MS)

  return useMemo(
    () => (enabled ? computeSemanticDiagnostics(debouncedInput) : []),
    [debouncedInput, enabled]
  )
}
