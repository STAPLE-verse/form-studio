"use client"

import React, { createContext, useContext, useMemo, useState, ReactNode } from "react"
import type { ConformanceDiagnostic, SemanticV1Component } from "@staple-verse/marker-template-runtime"
import { computeSemanticDiagnostics } from "./semanticValidation"

export interface FormStudioState {
  schema: object
  uiSchema: object
  /**
   * Absent when the form is Core-only. A present-but-empty component (e.g.
   * `{ "bindings": [] }` with no root class) is never emitted by Form Studio;
   * see FormStudioContext's setSemantics and the authoring plan §3.
   */
  semantics?: SemanticV1Component
  formData: object
}

/**
 * Single source of truth for "did the authored (non-preview) part of the
 * state change" — used for the panel error-boundary reset key and the
 * autosave/dirty-state comparisons. Keeping one helper means adding a fourth
 * authored document later only means one edit, not a hunt for every
 * hand-copied `JSON.stringify({ schema, uiSchema })` call site.
 */
export function computeStateFingerprint(
  state: Pick<FormStudioState, "schema" | "uiSchema" | "semantics">
): string {
  return JSON.stringify({
    schema: state.schema,
    uiSchema: state.uiSchema,
    semantics: state.semantics,
  })
}

interface FormStudioContextType {
  state: FormStudioState
  setSchema: (newSchema: object) => void
  setUiSchema: (newUiSchema: object) => void
  setSemantics: (newSemantics: SemanticV1Component | undefined) => void
  setFormData: (newFormData: object) => void
  updateState: (newState: Partial<FormStudioState>) => void
  /**
   * Live Semantic V1 diagnostics for the current `schema`/`semantics` pair,
   * from the pinned runtime — always `[]` for a Core-only form. Recomputed
   * whenever either input changes (§7); per-keystroke debouncing during
   * schema edits is deferred to the Visual Builder invalidation work (§8).
   */
  semanticDiagnostics: ConformanceDiagnostic[]
}

const FormStudioContext = createContext<FormStudioContextType | undefined>(undefined)

export interface FormStudioProviderProps {
  initialSchema?: object | string
  initialUiSchema?: object | string
  /** Omit for a Core-only form; see FormStudioState.semantics. */
  initialSemantics?: SemanticV1Component | string
  initialFormData?: object
  children?: ReactNode
}

export function FormStudioProvider({
  initialSchema = {},
  initialUiSchema = {},
  initialSemantics,
  initialFormData = {},
  children,
}: FormStudioProviderProps) {
  const parseJSON = (data: any) => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data)
      } catch (e) {
        return {}
      }
    }
    return data || {}
  }

  // Unlike schema/uiSchema, absence must stay absence: an omitted or
  // unparsable value means "no semantic component", never `{}`.
  const parseOptionalJSON = (data: unknown): SemanticV1Component | undefined => {
    if (data === undefined || data === null) {
      return undefined
    }
    if (typeof data === "string") {
      try {
        return JSON.parse(data)
      } catch (e) {
        return undefined
      }
    }
    return data as SemanticV1Component
  }

  const [state, setState] = useState<FormStudioState>({
    schema: parseJSON(initialSchema),
    uiSchema: parseJSON(initialUiSchema),
    semantics: parseOptionalJSON(initialSemantics),
    formData: initialFormData,
  })

  const setSchema = (newSchema: object) => {
    setState((prev) => ({ ...prev, schema: newSchema }))
  }

  const setUiSchema = (newUiSchema: object) => {
    setState((prev) => ({ ...prev, uiSchema: newUiSchema }))
  }

  const setSemantics = (newSemantics: SemanticV1Component | undefined) => {
    setState((prev) => ({ ...prev, semantics: newSemantics }))
  }

  const setFormData = (newFormData: object) => {
    setState((prev) => ({ ...prev, formData: newFormData }))
  }

  const updateState = (newState: Partial<FormStudioState>) => {
    setState((prev) => ({ ...prev, ...newState }))
  }

  const semanticDiagnostics = useMemo(
    () => computeSemanticDiagnostics({ schema: state.schema, semantics: state.semantics }),
    [state.schema, state.semantics]
  )

  return (
    <FormStudioContext.Provider
      value={{
        state,
        setSchema,
        setUiSchema,
        setSemantics,
        setFormData,
        updateState,
        semanticDiagnostics,
      }}
    >
      {children}
    </FormStudioContext.Provider>
  )
}

export function useFormStudio() {
  const context = useContext(FormStudioContext)
  if (!context) {
    throw new Error("useFormStudio must be used within a FormStudioProvider")
  }
  return context
}
