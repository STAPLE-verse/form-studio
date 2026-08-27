"use client"

import Editor from "@monaco-editor/react"
import { PlusIcon } from "@heroicons/react/20/solid"
import type { SemanticV1Component } from "@staple-verse/marker-template-runtime"
import { useFormStudio } from "./FormStudioContext"
import { useSyncedJsonDocument } from "./useSyncedJsonDocument"
import RemoveSemanticComponentControl from "./RemoveSemanticComponentControl"

const EMPTY_OBJECT = {}

// A deliberately valid (not merely syntactically well-formed) starter so
// clicking "Add semantic component" never emits the invalid
// `{ "bindings": [] }` shape the authoring plan §3 rules out.
const STARTER_SEMANTICS: SemanticV1Component = {
  root: { classIri: "https://example.org/ChangeMe" },
  bindings: [],
}

function ParseErrorNotice({ message }: { message: string }) {
  return (
    <p className="mt-2 text-xs text-error font-mono break-words" role="alert">
      Invalid JSON — not yet applied: {message}
    </p>
  )
}

export default function JsonEditor() {
  const { state, setSchema, setUiSchema, setSemantics, semanticDiagnostics } = useFormStudio()

  const schemaDoc = useSyncedJsonDocument(state.schema, setSchema, EMPTY_OBJECT)
  const uiSchemaDoc = useSyncedJsonDocument(state.uiSchema, setUiSchema, EMPTY_OBJECT)

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col lg:flex-row gap-6 w-full h-full overflow-y-auto pb-8 pt-4">
        <div className="flex-1 min-w-0 flex flex-col h-[500px] lg:h-full">
          <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-2">Data Schema</h4>
          <div className="bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden py-2 relative">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={schemaDoc.text}
              onChange={schemaDoc.handleChange}
              options={{
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                formatOnPaste: true,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          {schemaDoc.parseError && <ParseErrorNotice message={schemaDoc.parseError} />}
        </div>

        <div className="flex-1 min-w-0 flex flex-col h-[500px] lg:h-full">
          <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-2">UI Schema</h4>
          <div className="bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden py-2 relative">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={uiSchemaDoc.text}
              onChange={uiSchemaDoc.handleChange}
              options={{
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                formatOnPaste: true,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          {uiSchemaDoc.parseError && <ParseErrorNotice message={uiSchemaDoc.parseError} />}
        </div>

        <SemanticsDocumentColumn
          semantics={state.semantics}
          setSemantics={setSemantics}
          diagnosticsCount={semanticDiagnostics.length}
        />
      </div>
    </div>
  )
}

function SemanticsDocumentColumn({
  semantics,
  setSemantics,
  diagnosticsCount,
}: {
  semantics: SemanticV1Component | undefined
  setSemantics: (newSemantics: SemanticV1Component | undefined) => void
  diagnosticsCount: number
}) {
  // Always call the hook (Rules of Hooks); while absent it tracks a value
  // that is never shown or committed anywhere.
  const semanticsDoc = useSyncedJsonDocument(semantics ?? STARTER_SEMANTICS, setSemantics, STARTER_SEMANTICS)

  return (
    <div className="flex-1 min-w-0 flex flex-col h-[500px] lg:h-full" data-json-editor-document="semantics">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider">Semantics</h4>
        {semantics !== undefined && (
          <RemoveSemanticComponentControl onRemove={() => setSemantics(undefined)} />
        )}
      </div>

      {semantics === undefined ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-base-200 rounded-lg border border-dashed border-base-300 p-8 text-center">
          <p className="text-base-content/60 italic">
            This form has no Semantic V1 component yet.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1.5"
            onClick={() => setSemantics(STARTER_SEMANTICS)}
          >
            <PlusIcon className="w-4 h-4" />
            Add semantic component
          </button>
        </div>
      ) : (
        <>
          <div className="bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden py-2 relative">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={semanticsDoc.text}
              onChange={semanticsDoc.handleChange}
              options={{
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                formatOnPaste: true,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          {semanticsDoc.parseError ? (
            <ParseErrorNotice message={semanticsDoc.parseError} />
          ) : diagnosticsCount > 0 ? (
            <p className="mt-2 text-xs text-warning">
              {diagnosticsCount === 1 ? "1 semantic issue" : `${diagnosticsCount} semantic issues`} — see
              summary above.
            </p>
          ) : (
            <p className="mt-2 text-xs text-success">Semantics valid.</p>
          )}
        </>
      )}
    </div>
  )
}
