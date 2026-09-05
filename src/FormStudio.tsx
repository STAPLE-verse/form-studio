"use client"

import {
  lazy,
  Suspense,
  useState,
  useEffect,
  useRef,
  type ReactElement,
} from "react"
import {
  FormStudioProvider,
  useFormStudio,
  useFormStudioCommit,
  computeStateFingerprint,
  type FormStudioProviderProps,
  type FormStudioState,
} from "./FormStudioContext"
import type { FormStudioDiagnostic } from "./extensions/types"
import FormBuilder from "./FormBuilder"
import FormPreview from "./FormPreview"
import StudioPanelErrorBoundary from "./StudioPanelErrorBoundary"
import FormStudioDiagnostics from "./extensions/diagnostics"
import { createDebouncer, DEBOUNCE_MS } from "./debounce"

import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/20/solid"
import type { Mods } from "./types"

// Lazy-load the JSON editor to prevent loading Monaco until the user actually clicks the tab
const JsonEditor = lazy(() => import("./JsonEditor"))

function JsonEditorFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-base-200 rounded-lg border border-base-300">
      <span className="loading loading-spinner text-primary loading-lg"></span>
    </div>
  )
}

export type FormStudioSaveStatus = "synced" | "unsaved" | "saving"

export interface FormStudioUIProps {
  onAutoSave?: (state: FormStudioState) => Promise<void> | void
  onSave?: (state: FormStudioState) => Promise<void>
  onSaveNewVersion?: (state: FormStudioState) => Promise<void>
  onCancel?: () => void
  mods?: Mods
  /** When provided, the route layer owns save-status semantics (§8.11.4). */
  saveStatus?: FormStudioSaveStatus
  /** Notified with current debounced diagnostics in registry order. */
  onDiagnosticsChange?: (diagnostics: FormStudioDiagnostic[]) => void
}

export interface FormStudioProps extends FormStudioUIProps {
  extensions?: FormStudioProviderProps["extensions"]
  initialExtensionValues?: FormStudioProviderProps["initialExtensionValues"]
  initialSchema?: string | object
  initialUiSchema?: string | object
  initialFormData?: object
}

export function FormStudioUI({
  onAutoSave,
  onSave,
  onSaveNewVersion,
  onCancel,
  mods,
  saveStatus,
  onDiagnosticsChange,
}: FormStudioUIProps): ReactElement {
  const { state, setSchema, setUiSchema, extensionDiagnostics } = useFormStudio()
  const { blockingDiagnostics, commitDiagnostics, attemptCommit } = useFormStudioCommit()
  const [activeTab, setActiveTab] = useState<"builder" | "json" | "preview">("builder")
  const panelResetKey = computeStateFingerprint(state)

  useEffect(() => {
    onDiagnosticsChange?.(extensionDiagnostics)
  }, [extensionDiagnostics, onDiagnosticsChange])

  // Track if the JSON tab has ever been visited so we only load the heavy editor once,
  // but keep it mounted in the background to preserve undo history and unsaved text.
  const [hasVisitedJson, setHasVisitedJson] = useState(false)
  if (activeTab === "json" && !hasVisitedJson) {
    setHasVisitedJson(true)
  }

  const isInitialMount = useRef(true)
  const lastBufferedStateRef = useRef<string>("")
  // Uses the same trailing-debounce interval as registered extension
  // validation and schema-change revalidation.
  const autoSaveDebouncerRef = useRef(createDebouncer(DEBOUNCE_MS))

  // Debounced recovery-buffer write (silent — no status pill updates)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      lastBufferedStateRef.current = computeStateFingerprint(state)
      return
    }
    if (!onAutoSave) return

    const currentStateStr = computeStateFingerprint(state)

    if (currentStateStr === lastBufferedStateRef.current) {
      return
    }

    const debouncer = autoSaveDebouncerRef.current
    debouncer.schedule(async () => {
      try {
        await onAutoSave(state)
        lastBufferedStateRef.current = currentStateStr
      } catch (e) {
        console.error("Recovery buffer write failed", e)
      }
    })

    return () => debouncer.cancel()
  }, [state.schema, state.uiSchema, state.extensionValues, onAutoSave, state])

  return (
    <div className="form-studio flex flex-col w-full h-full animate-in fade-in duration-300 bg-base-100 border border-base-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-base-200 px-4 pt-4 bg-base-200 gap-4">
        <div className="tabs tabs-bordered w-full md:w-auto">
          <button
            className={`tab tab-lg transition-all font-semibold ${activeTab === "builder" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`}
            onClick={() => setActiveTab("builder")}
          >
            Visual Builder
          </button>
          <button
            className={`tab tab-lg transition-all font-semibold ${activeTab === "json" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`}
            onClick={() => setActiveTab("json")}
          >
            JSON Editor
          </button>
          <button
            className={`tab tab-lg transition-all font-semibold ${activeTab === "preview" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`}
            onClick={() => setActiveTab("preview")}
          >
            Live Preview
          </button>
        </div>

        <div className="flex items-center gap-3 pb-3">
          {saveStatus !== undefined && (
            <div
              className="flex items-center mr-1 bg-base-100 px-3 py-1.5 rounded-full border border-base-300 shadow-sm min-w-[160px] justify-center transition-all"
              title={
                saveStatus === "unsaved"
                  ? "Backed up in browser · not yet saved to your collection"
                  : undefined
              }
            >
              {saveStatus === "synced" && (
                <span className="text-xs font-medium text-base-content/60 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-success/80" />
                  All changes saved
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="text-xs font-medium text-base-content/70 flex items-center gap-1.5">
                  <span className="loading loading-spinner loading-xs text-primary"></span>
                  Saving…
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="text-xs font-medium text-warning flex items-center gap-1.5">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
            </div>
          )}
          {onCancel && (
            <button className="btn btn-secondary btn-outline transition-all ml-2" onClick={onCancel}>
              Cancel
            </button>
          )}
          {onSave && (
            <div
              className="tooltip tooltip-bottom"
              data-tip={
                blockingDiagnostics.length > 0
                  ? "Resolve the validation issues below before saving."
                  : "Overwrites the current version of this schema."
              }
            >
              <button
                className="btn btn-ghost border border-base-300 hover:border-base-content/30 shadow-sm transition-all"
                disabled={blockingDiagnostics.length > 0}
                onClick={() => attemptCommit(onSave)}
              >
                Save Changes
              </button>
            </div>
          )}
          {onSaveNewVersion && (
            <div
              className="tooltip tooltip-bottom tooltip-primary"
              data-tip={
                blockingDiagnostics.length > 0
                  ? "Resolve the validation issues below before saving."
                  : "Preserves current history and saves edits as a brand new version."
              }
            >
              <button
                className="btn btn-primary shadow-sm hover:shadow-md transition-all"
                disabled={blockingDiagnostics.length > 0}
                onClick={() => attemptCommit(onSaveNewVersion)}
              >
                Save as New Version
              </button>
            </div>
          )}
        </div>
      </div>

      {commitDiagnostics.length > 0 && (
        <div className="px-6 pt-6">
          <div className="alert alert-warning" role="alert">
            <div>
              <p>Validation issues must be resolved before saving.</p>
              <ul className="mt-2 list-disc pl-5">
                {commitDiagnostics.map((diagnostic, index) => (
                  <li key={`${diagnostic.source}-${diagnostic.code}-${index}`}>
                    <span className="font-mono">{diagnostic.code}</span> — {diagnostic.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden p-6">
        {activeTab === "builder" && (
          <div className="block" data-studio-panel="builder">
            <StudioPanelErrorBoundary panelName="Visual Builder" resetKey={panelResetKey}>
              <FormBuilder
                schema={
                  typeof state.schema === "string" ? state.schema : JSON.stringify(state.schema)
                }
                uiSchema={
                  typeof state.uiSchema === "string"
                    ? state.uiSchema
                    : JSON.stringify(state.uiSchema)
                }
                onChange={(newSchemaStr: string, newUiSchemaStr: string) => {
                  try {
                    setSchema(JSON.parse(newSchemaStr))
                    setUiSchema(JSON.parse(newUiSchemaStr))
                  } catch (e) {
                    console.error("Failed to parse schema from FormBuilder", e)
                  }
                }}
                mods={mods}
              />
            </StudioPanelErrorBoundary>
          </div>
        )}
        <div className={activeTab === "json" ? "block h-full" : "hidden"}>
          {hasVisitedJson && (
            <Suspense fallback={<JsonEditorFallback />}>
              <JsonEditor />
            </Suspense>
          )}
        </div>
        {activeTab === "preview" && (
          <div className="block" data-studio-panel="preview">
            <StudioPanelErrorBoundary panelName="Live Preview" resetKey={panelResetKey}>
              <FormPreview />
            </StudioPanelErrorBoundary>
          </div>
        )}
      </div>

      {extensionDiagnostics.length > 0 && (
        <div className="px-6 pb-6">
          <FormStudioDiagnostics />
        </div>
      )}
    </div>
  )
}

export default function FormStudio(props: FormStudioProps): ReactElement {
  return (
    <FormStudioProvider
      extensions={props.extensions}
      initialSchema={props.initialSchema}
      initialUiSchema={props.initialUiSchema}
      initialExtensionValues={props.initialExtensionValues}
      initialFormData={props.initialFormData}
    >
      <FormStudioUI
        onAutoSave={props.onAutoSave}
        onSave={props.onSave}
        onSaveNewVersion={props.onSaveNewVersion}
        onCancel={props.onCancel}
        mods={props.mods}
        saveStatus={props.saveStatus}
        onDiagnosticsChange={props.onDiagnosticsChange}
      />
    </FormStudioProvider>
  )
}
