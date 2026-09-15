"use client"

import React from "react"
import Editor from "@monaco-editor/react"
import { PlusIcon } from "@heroicons/react/20/solid"
import type { SemanticV1Component } from "@staple-verse/marker-template-runtime"
import type { ExtensionDocumentProps } from "../extensions/types"
import { useSyncedJsonDocument } from "../useSyncedJsonDocument"
import RemoveSemanticComponentControl from "./RemoveSemanticComponentControl"

export const STARTER_SEMANTICS: SemanticV1Component = {
  root: { classIri: "https://example.org/ChangeMe" },
  bindings: [],
}

export default function SemanticDocument({
  value: semantics,
  setValue: setSemantics,
}: ExtensionDocumentProps<SemanticV1Component>) {
  const semanticsDoc = useSyncedJsonDocument(
    semantics ?? STARTER_SEMANTICS,
    setSemantics,
    STARTER_SEMANTICS
  )

  return (
    <div
      className="flex-1 min-w-0 flex flex-col h-[500px] lg:h-full"
      data-json-editor-document="semantics"
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider">
          Semantics
        </h4>
        {semantics !== undefined && (
          <RemoveSemanticComponentControl onRemove={() => setSemantics(undefined)} />
        )}
      </div>

      {semantics === undefined ? (
        <>
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
          {/* Matches the h-12 footer in the editor branch below, so this
              column's height doesn't change when a semantic component is
              added/removed. */}
          <div className="mt-2 h-12 shrink-0" />
        </>
      ) : (
        <>
          <div className="bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden relative">
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
          {/* Fixed height and always mounted (even with no error) so this
              column stays the same height as Data Schema/UI Schema
              regardless of which one currently has a parse error. */}
          <div className="mt-2 h-12 shrink-0 overflow-y-auto">
            {semanticsDoc.parseError && (
              <p className="text-xs text-error font-mono break-words" role="alert">
                Invalid JSON — not yet applied: {semanticsDoc.parseError}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
