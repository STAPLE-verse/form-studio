"use client"

import { createContext, useContext } from "react"
import type { ConformanceDiagnostic, SemanticV1Component } from "@staple-verse/marker-template-runtime"

export interface SemanticAuthoringContextValue {
  /** `form.schema`, needed to resolve field pointers to an effective Core type. */
  rootSchema: object
  semantics: SemanticV1Component | undefined
  onSemanticsChange: (newSemantics: SemanticV1Component | undefined) => void
  diagnostics: ConformanceDiagnostic[]
}

const SemanticAuthoringContext = createContext<SemanticAuthoringContextValue | undefined>(undefined)

/**
 * Provided once by `FormBuilder` (only when its host passes
 * `onSemanticsChange`) so deeply nested field-level controls — inside
 * `CardModal`'s "Additional Settings" and `CompatibilityCard` — can read and
 * write semantics without threading three more props through every
 * intermediate component (`Card`, `Section`, `GeneralParameterInputs`, every
 * `defaults/*.tsx` type-specific parameter component, ...). `FormBuilder`
 * remains fully prop-driven and context-free otherwise, so a host that never
 * passes `onSemanticsChange` (e.g. STAPLE's existing direct `FormBuilder`
 * usage) sees no provider and no behavior change.
 */
export const SemanticAuthoringProvider = SemanticAuthoringContext.Provider

export function useSemanticAuthoring(): SemanticAuthoringContextValue | undefined {
  return useContext(SemanticAuthoringContext)
}
