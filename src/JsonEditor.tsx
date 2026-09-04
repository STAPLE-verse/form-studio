"use client"

import Editor from "@monaco-editor/react"
import type { ReactElement } from "react"
import { useFormStudio } from "./FormStudioContext"
import { useSyncedJsonDocument } from "./useSyncedJsonDocument"
import { JsonDocumentExtensionOutlet } from "./extensions/outlets"

const EMPTY_OBJECT = {}

function ParseErrorNotice({ message }: { message: string }) {
  return (
    <p className="mt-2 text-xs text-error font-mono break-words" role="alert">
      Invalid JSON — not yet applied: {message}
    </p>
  )
}

export default function JsonEditor(): ReactElement {
  const { state, setSchema, setUiSchema } = useFormStudio()

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

        <JsonDocumentExtensionOutlet />
      </div>
    </div>
  )
}
