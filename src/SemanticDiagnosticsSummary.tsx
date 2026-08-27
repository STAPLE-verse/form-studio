import React from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import type { ConformanceDiagnostic } from "@staple-verse/marker-template-runtime"
import { useFormStudio } from "./FormStudioContext"

/**
 * Compact form-level summary of semantic diagnostics that cannot yet be
 * shown beside their originating field (§7). Field-specific presentation is
 * added alongside the Visual Builder binding controls; until then every
 * diagnostic — including field-pointer and relationship errors — surfaces
 * here so an invalid component is never mistaken for a conformant save.
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
