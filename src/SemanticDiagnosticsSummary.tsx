import React from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import type { ConformanceDiagnostic } from "@staple-verse/marker-template-runtime"
import { useFormStudio } from "./FormStudioContext"

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
  const { semanticDiagnostics } = useFormStudio()

  if (semanticDiagnostics.length === 0) return null

  return (
    <div
      className="alert alert-error alert-vertical sm:alert-horizontal items-start shadow-sm"
      role="alert"
      data-semantic-diagnostics="true"
      data-semantic-diagnostics-count={semanticDiagnostics.length}
    >
      <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold">
          {semanticDiagnostics.length === 1
            ? "1 semantic issue"
            : `${semanticDiagnostics.length} semantic issues`}{" "}
          must be resolved before this component can be saved
        </h4>
        <ul className="mt-2 flex flex-col gap-2">
          {semanticDiagnostics.map((diagnostic, index) => (
            <SemanticDiagnosticItem key={`${diagnostic.pointer}-${index}`} diagnostic={diagnostic} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function SemanticDiagnosticItem({
  diagnostic,
}: {
  diagnostic: ConformanceDiagnostic
}): React.ReactElement {
  return (
    <li
      className="text-sm bg-base-100/40 rounded-lg px-3 py-2"
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
