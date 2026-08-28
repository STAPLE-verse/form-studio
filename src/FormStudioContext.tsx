"use client"

import React, { createContext, useContext, useRef, useState, ReactNode } from "react"
import type { ConformanceDiagnostic, SemanticV1Component } from "@staple-verse/marker-template-runtime"
import { useDebouncedSemanticDiagnostics } from "./useDebouncedSemanticDiagnostics"
import type { FormStudioExtension } from "./extensions/types"
import { getFormStudioExtensionValue } from "./extensions/types"
import {
  assertRegisteredFormStudioExtension,
  assertStableFormStudioExtensionRegistry,
  createFormStudioExtensionRegistry,
  createInitialExtensionValues,
  setRegisteredExtensionValue,
  type AnyFormStudioExtension,
  type FormStudioExtensionRegistry,
} from "./extensions/registry"

export interface FormStudioState {
  schema: object
  uiSchema: object
  /** JSON-serializable values for the provider's registered extensions. */
  extensionValues: Record<string, unknown>
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
 * autosave/dirty-state comparisons. Keeping base, legacy semantic, and
 * registered extension values here prevents recovery and dirty-state paths
 * from drifting as authored documents are added or migrated.
 */
export function computeStateFingerprint(
  state: Pick<FormStudioState, "schema" | "uiSchema" | "semantics" | "extensionValues">
): string {
  return JSON.stringify({
    schema: state.schema,
    uiSchema: state.uiSchema,
    semantics: state.semantics,
    extensionValues: state.extensionValues,
  })
}

export interface FormStudioContextValue {
  state: FormStudioState
  /** Stable registration order captured when the provider mounts. */
  extensions: readonly AnyFormStudioExtension[]
  setSchema: (newSchema: object) => void
  setUiSchema: (newUiSchema: object) => void
  setSemantics: (newSemantics: SemanticV1Component | undefined) => void
  setFormData: (newFormData: object) => void
  updateState: (newState: Partial<Omit<FormStudioState, "extensionValues">>) => void
  getExtensionValue: <TValue>(extension: FormStudioExtension<TValue>) => TValue | undefined
  setExtensionValue: <TValue>(
    extension: FormStudioExtension<TValue>,
    value: TValue | undefined
  ) => void
  /**
   * Live Semantic V1 diagnostics for the current `schema`/`semantics` pair,
   * from the pinned runtime — always `[]` for a Core-only form. Recomputed
   * `DEBOUNCE_MS` after either input settles (§7, §8), via the shared
   * `useDebouncedSemanticDiagnostics` — see that hook for why revalidation
   * is deferred rather than run synchronously on every keystroke.
   */
  semanticDiagnostics: ConformanceDiagnostic[]
}

const FormStudioContext = createContext<FormStudioContextValue | undefined>(undefined)

export interface FormStudioProviderProps {
  /** Registration is fixed for this provider's lifetime; remount to change it. */
  extensions?: readonly AnyFormStudioExtension[]
  /** Values whose keys match registered extension IDs. Undefined means absent. */
  initialExtensionValues?: Readonly<Record<string, unknown>>
  initialSchema?: object | string
  initialUiSchema?: object | string
  /** Omit for a Core-only form; see FormStudioState.semantics. */
  initialSemantics?: SemanticV1Component | string
  initialFormData?: object
  children?: ReactNode
}

export function FormStudioProvider({
  extensions = [],
  initialExtensionValues = {},
  initialSchema = {},
  initialUiSchema = {},
  initialSemantics,
  initialFormData = {},
  children,
}: FormStudioProviderProps) {
  const registryRef = useRef<FormStudioExtensionRegistry | undefined>(undefined)
  if (!registryRef.current) {
    registryRef.current = createFormStudioExtensionRegistry(extensions)
  } else {
    assertStableFormStudioExtensionRegistry(registryRef.current, extensions)
  }
  const registry = registryRef.current

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

  const [state, setState] = useState<FormStudioState>(() => ({
    schema: parseJSON(initialSchema),
    uiSchema: parseJSON(initialUiSchema),
    extensionValues: createInitialExtensionValues(registry, initialExtensionValues),
    semantics: parseOptionalJSON(initialSemantics),
    formData: initialFormData,
  }))

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

  const updateState = (newState: Partial<Omit<FormStudioState, "extensionValues">>) => {
    setState((prev) => ({ ...prev, ...newState }))
  }

  const getExtensionValue = <TValue,>(
    extension: FormStudioExtension<TValue>
  ): TValue | undefined => {
    assertRegisteredFormStudioExtension(registry, extension)
    return getFormStudioExtensionValue(state, extension)
  }

  const setExtensionValue = <TValue,>(
    extension: FormStudioExtension<TValue>,
    value: TValue | undefined
  ) => {
    setState((prev) => {
      const extensionValues = setRegisteredExtensionValue(
        registry,
        prev.extensionValues,
        extension,
        value
      )
      if (extensionValues[extension.id] === prev.extensionValues[extension.id]) {
        const previousHasValue = Object.prototype.hasOwnProperty.call(
          prev.extensionValues,
          extension.id
        )
        const nextHasValue = Object.prototype.hasOwnProperty.call(extensionValues, extension.id)
        if (previousHasValue === nextHasValue) return prev
      }
      return { ...prev, extensionValues }
    })
  }

  const semanticDiagnostics = useDebouncedSemanticDiagnostics(state.schema, state.semantics)

  return (
    <FormStudioContext.Provider
      value={{
        state,
        extensions: registry.extensions,
        setSchema,
        setUiSchema,
        setSemantics,
        setFormData,
        updateState,
        getExtensionValue,
        setExtensionValue,
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
