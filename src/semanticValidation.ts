import { validateSemanticV1 } from "@staple-verse/marker-template-runtime"
import type { ConformanceDiagnostic, SemanticV1Component } from "@staple-verse/marker-template-runtime"

export interface SemanticValidationInput {
  schema: object
  semantics?: SemanticV1Component
}

/**
 * The runtime's Semantic V1 validator resolves field pointers against
 * `form.schema`, so it expects the same `{ form: { schema }, semantics }`
 * document shape as the eventual MARKER package rather than the bare
 * component. This is the one place that assembles that shape from Form
 * Studio state; nothing else should hand-build it.
 */
export function buildSemanticValidationDocument(
  state: SemanticValidationInput
): { form: { schema: object }; semantics?: SemanticV1Component } {
  return {
    form: { schema: state.schema },
    semantics: state.semantics,
  }
}

/**
 * Absent semantics is Core-only and never diagnosed — `validateSemanticV1`
 * already returns `[]` for that case, but being explicit here keeps that
 * Core-only guarantee visible at the Form Studio call site too.
 */
export function computeSemanticDiagnostics(
  state: SemanticValidationInput
): ConformanceDiagnostic[] {
  if (state.semantics === undefined) return []
  return validateSemanticV1(buildSemanticValidationDocument(state))
}
