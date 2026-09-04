import React from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import type { FormStudioDiagnostic } from "../extensions/types"
import { useFormStudio } from "../FormStudioContext"
import { SEMANTIC_V1_EXTENSION_ID } from "./constants"

/**
 * Compact, always-visible summary of every current semantic diagnostic
 * (§7). Bindings also show their own diagnostics in-context beside their
 * "Semantic binding" section (§5.2), but that requires opening the owning
 * field's Additional Settings — a field a user hasn't opened must not be
 * silently invalid, so every diagnostic is duplicated here regardless of
 * whether it also has a field-local presentation. This keeps "an invalid
 * component is never mistaken for a conformant save" true independent of
 * which field panels happen to be open.
 */
export default function SemanticDiagnosticsSummary(): React.ReactElement | null {
  const { extensionDiagnostics } = useFormStudio()
  const semanticDiagnostics = extensionDiagnostics.filter(
    (diagnostic) => diagnostic.source === SEMANTIC_V1_EXTENSION_ID
  )

  if (semanticDiagnostics.length === 0) return null

  return (
    <div
      className="rounded-xl border border-error/50 bg-error/10 shadow-sm p-4"
      role="alert"
      data-semantic-diagnostics="true"
      data-semantic-diagnostics-count={semanticDiagnostics.length}
    >
      <div className="flex items-center gap-2 text-lg">
        <ExclamationTriangleIcon className="h-[1em] w-[1em] shrink-0 text-error" aria-hidden="true" />
        <h4 className="text-lg font-bold">
          {semanticDiagnostics.length === 1
            ? "1 semantic issue"
            : `${semanticDiagnostics.length} semantic issues`}{" "}
          must be resolved before this component can be saved
        </h4>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {semanticDiagnostics.map((diagnostic, index) => (
          <SemanticDiagnosticItem key={`${diagnostic.pointer}-${index}`} diagnostic={diagnostic} />
        ))}
      </ul>
    </div>
  )
}

function SemanticDiagnosticItem({
  diagnostic,
}: {
  diagnostic: FormStudioDiagnostic
}): React.ReactElement {
  return (
    <li
      className="text-sm rounded-lg border border-error/40 bg-error/20 px-3 py-2"
      data-semantic-diagnostic-code={diagnostic.code}
      data-semantic-diagnostic-stage={diagnostic.stage}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge badge-outline badge-sm font-mono">{diagnostic.code}</span>
        <span className="font-mono text-xs opacity-70">{diagnostic.pointer}</span>
      </div>
      <p className="mt-1">{diagnostic.message}</p>
    </li>
  )
}
