"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react"
import type {
  FormStudioDiagnostic,
  FormStudioExtension,
  FormStudioValidationResult,
} from "./extensions/types"
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
import {
  useDebouncedExtensionDiagnostics,
  validateRegisteredExtensions,
} from "./extensions/validation"

export interface FormStudioState {
  schema: object
  uiSchema: object
  /** JSON-serializable values for the provider's registered extensions. */
  extensionValues: Record<string, unknown>
  formData: object
}

/**
 * Single source of truth for "did the authored (non-preview) part of the
 * state change" — used for the panel error-boundary reset key and the
 * autosave/dirty-state comparisons. Keeping base and registered extension
 * values here prevents recovery and dirty-state paths from drifting as
 * authored documents are added.
 */
export function computeStateFingerprint(
  state: Pick<FormStudioState, "schema" | "uiSchema" | "extensionValues">
): string {
  return JSON.stringify({
    schema: state.schema,
    uiSchema: state.uiSchema,
    extensionValues: state.extensionValues,
  })
}

// The authored part of the state: what undo and redo move between. Preview data is not
// included, so trying out the form never creates (or erases) undo steps.
type AuthoredSnapshot = Pick<FormStudioState, "schema" | "uiSchema" | "extensionValues">

/** Most undo steps kept; older ones are dropped. */
export const UNDO_HISTORY_LIMIT = 100
/** Changes closer together than this (e.g. typing a title) share one undo step. */
export const UNDO_GROUP_MS = 1000

export interface FormStudioContextValue {
  state: FormStudioState
  /** Steps back to the state before the latest change (or group of quick changes). */
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  /** Stable registration order captured when the provider mounts. */
  extensions: readonly AnyFormStudioExtension[]
  setSchema: (newSchema: object) => void
  setUiSchema: (newUiSchema: object) => void
  setFormData: (newFormData: object) => void
  updateState: (newState: Partial<Omit<FormStudioState, "extensionValues">>) => void
  getExtensionValue: <TValue>(extension: FormStudioExtension<TValue>) => TValue | undefined
  setExtensionValue: <TValue>(
    extension: FormStudioExtension<TValue>,
    value: TValue | undefined
  ) => void
  /** Debounced, derived diagnostics in stable registry order. */
  extensionDiagnostics: FormStudioDiagnostic[]
  /** Fresh synchronous validation against the current provider state. */
  validateForCommit: () => FormStudioValidationResult
}

const FormStudioContext = createContext<FormStudioContextValue | undefined>(undefined)

export interface FormStudioProviderProps {
  /** Registration is fixed for this provider's lifetime; remount to change it. */
  extensions?: readonly AnyFormStudioExtension[]
  /** Values whose keys match registered extension IDs. Undefined means absent. */
  initialExtensionValues?: Readonly<Record<string, unknown>>
  initialSchema?: object | string
  initialUiSchema?: object | string
  initialFormData?: object
  children?: ReactNode
}

export function FormStudioProvider({
  extensions = [],
  initialExtensionValues = {},
  initialSchema = {},
  initialUiSchema = {},
  initialFormData = {},
  children,
}: FormStudioProviderProps): ReactElement {
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

  const [state, setState] = useState<FormStudioState>(() => ({
    schema: parseJSON(initialSchema),
    uiSchema: parseJSON(initialUiSchema),
    extensionValues: createInitialExtensionValues(registry, initialExtensionValues),
    formData: initialFormData,
  }))

  const setSchema = (newSchema: object) => {
    setState((prev) => ({ ...prev, schema: newSchema }))
  }

  const setUiSchema = (newUiSchema: object) => {
    setState((prev) => ({ ...prev, uiSchema: newUiSchema }))
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

  // --- undo / redo -------------------------------------------------------------------
  // History is recorded by watching the authored state change, so every way of changing it
  // (builder, JSON editor, extension edits) is covered, and one user action that writes the
  // schema and uiSchema separately still counts as a single step.
  const authoredFingerprint = useMemo(
    () => computeStateFingerprint(state),
    [state.schema, state.uiSchema, state.extensionValues]
  )
  const pastRef = useRef<AuthoredSnapshot[]>([])
  const futureRef = useRef<AuthoredSnapshot[]>([])
  const currentRef = useRef<AuthoredSnapshot>(state)
  const fingerprintRef = useRef(authoredFingerprint)
  const lastChangeAtRef = useRef(0)
  const applyingHistoryRef = useRef(false)
  const [, setHistoryVersion] = useState(0)

  useEffect(() => {
    if (authoredFingerprint === fingerprintRef.current) return
    const previous = currentRef.current
    currentRef.current = state
    fingerprintRef.current = authoredFingerprint

    if (applyingHistoryRef.current) {
      // this change is an undo/redo being applied, not a new edit
      applyingHistoryRef.current = false
      return
    }

    const now = Date.now()
    if (now - lastChangeAtRef.current > UNDO_GROUP_MS) {
      pastRef.current.push(previous)
      if (pastRef.current.length > UNDO_HISTORY_LIMIT) pastRef.current.shift()
    }
    lastChangeAtRef.current = now
    futureRef.current = []
    setHistoryVersion((version) => version + 1)
  }, [authoredFingerprint])

  const applySnapshot = (from: AuthoredSnapshot[], to: AuthoredSnapshot[]) => {
    // skip snapshots identical to what's showing (they would look like a dead click)
    while (from.length > 0) {
      const target = from.pop()!
      if (computeStateFingerprint(target) === fingerprintRef.current) continue
      to.push(currentRef.current)
      applyingHistoryRef.current = true
      lastChangeAtRef.current = 0
      setState((prev) => ({
        ...prev,
        schema: target.schema,
        uiSchema: target.uiSchema,
        extensionValues: target.extensionValues,
      }))
      break
    }
    setHistoryVersion((version) => version + 1)
  }
  const undo = () => applySnapshot(pastRef.current, futureRef.current)
  const redo = () => applySnapshot(futureRef.current, pastRef.current)

  const extensionDiagnostics = useDebouncedExtensionDiagnostics(registry, state)
  const validateForCommit = (): FormStudioValidationResult =>
    validateRegisteredExtensions(registry, state)

  return (
    <FormStudioContext.Provider
      value={{
        state,
        undo,
        redo,
        canUndo: pastRef.current.length > 0,
        canRedo: futureRef.current.length > 0,
        extensions: registry.extensions,
        setSchema,
        setUiSchema,
        setFormData,
        updateState,
        getExtensionValue,
        setExtensionValue,
        extensionDiagnostics,
        validateForCommit,
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

export interface FormStudioCommitResult {
  /** Live, debounced blocking diagnostics — for disabling a commit control preemptively. */
  blockingDiagnostics: FormStudioDiagnostic[]
  /** Diagnostics surfaced by the most recent blocked commit attempt; cleared once resolved. */
  commitDiagnostics: FormStudioDiagnostic[]
  /**
   * Runs a fresh, synchronous validation and only invokes `commit` if nothing
   * blocks. Live `extensionDiagnostics` are debounced, so every commit attempt
   * (a save, a "done" navigation, anything a consumer gates on validity)
   * re-validates the current provider state before proceeding, rather than
   * trusting a possibly-stale debounced value.
   */
  attemptCommit: (commit: (state: FormStudioState) => void | Promise<void>) => void
}

/**
 * The commit-gating logic every known consumer needs around its own save/done
 * controls (STAPLE's `commitIfValid`, `FormStudioUI`'s built-in buttons, and
 * any host application with its own custom action buttons). Extracted as a
 * shared primitive so consumers with bespoke chrome don't have to hand-roll
 * this validate-then-commit sequence themselves and risk drifting from
 * `FormStudioUI`'s own behavior as the registry/validation contract evolves.
 */
export function useFormStudioCommit(): FormStudioCommitResult {
  const { state, extensionDiagnostics, validateForCommit } = useFormStudio()

  const blockingDiagnostics = useMemo(
    () => extensionDiagnostics.filter((diagnostic) => diagnostic.blocksCommit),
    [extensionDiagnostics]
  )

  const [commitDiagnostics, setCommitDiagnostics] = useState<FormStudioDiagnostic[]>([])
  useEffect(() => {
    if (blockingDiagnostics.length === 0) setCommitDiagnostics([])
  }, [blockingDiagnostics])

  const attemptCommit = (commit: (state: FormStudioState) => void | Promise<void>) => {
    const result = validateForCommit()
    if (result.blocked) {
      setCommitDiagnostics(result.diagnostics.filter((diagnostic) => diagnostic.blocksCommit))
      return
    }
    setCommitDiagnostics([])
    void commit(state)
  }

  return { blockingDiagnostics, commitDiagnostics, attemptCommit }
}

/** Internal optional lookup used by provider-optional FormBuilder outlets. */
export function useOptionalFormStudio(): FormStudioContextValue | undefined {
  return useContext(FormStudioContext)
}
