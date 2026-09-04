import React, { ReactElement } from "react"
import type { FieldCompatibility } from "./types"
import FieldAuthoringControls from "./FieldAuthoringControls"

export default function CompatibilityCard({
  name,
  title,
  compatibility,
  fieldPointer,
}: {
  name: string
  title?: string
  compatibility: Exclude<FieldCompatibility, { kind: "editable" }>
  /** RFC 6901 pointer rooted at the form schema for this instance-bearing field. */
  fieldPointer?: string
}): ReactElement {
  const isMigration = compatibility.kind === "migration"
  const pointer = `/properties/${name.replace(/~/g, "~0").replace(/\//g, "~1")}`

  return (
    <div
      className={`card-container border rounded-xl shadow-sm p-4 ${
        isMigration
          ? "border-warning/50 bg-warning/10"
          : "border-base-300 bg-base-200"
      }`}
      data-compatibility-kind={compatibility.kind}
      data-compatibility-code={compatibility.code}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-lg font-bold">{title || name}</h4>
        <span className={`badge ${isMigration ? "badge-warning" : "badge-ghost"}`}>
          {isMigration ? "Migration required" : "Read-only"}
        </span>
      </div>
      <p className="mt-3 text-sm">{compatibility.message}</p>
      <p className="mt-2 font-mono text-xs text-base-content/60">{pointer}</p>
      <p className="mt-3 text-sm text-base-content/70">
        Visual controls are disabled to avoid reinterpreting this field. Use the JSON Editor to
        inspect or change it.
      </p>
      {fieldPointer !== undefined && (
        <div className="mt-4 pt-4 border-t border-base-300">
          <FieldAuthoringControls fieldPointer={fieldPointer} compatibility={compatibility} />
        </div>
      )}
    </div>
  )
}
