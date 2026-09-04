import React, { useState } from "react"
import { TrashIcon } from "@heroicons/react/20/solid"

/**
 * Destructive "remove the whole semantic component" action shared by the
 * JSON Editor's Semantics document and the Visual Builder's form-level
 * settings (§5.1, §6) — both clear the same registered value, so
 * this is the one place that implements the required explicit-confirmation
 * step rather than two hand-copied confirm flows.
 */
export default function RemoveSemanticComponentControl({
  onRemove,
  className,
}: {
  onRemove: () => void
  className?: string
}): React.ReactElement {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div
        className={`alert alert-warning py-2 text-sm items-center w-full ${className ?? ""}`}
        role="alert"
      >
        <span>Remove the entire semantic component? This cannot be undone.</span>
        <div className="flex gap-2 ml-auto">
          <button type="button" className="btn btn-xs btn-ghost" onClick={() => setConfirming(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-xs btn-error"
            onClick={() => {
              onRemove()
              setConfirming(false)
            }}
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={`btn btn-ghost btn-xs text-error gap-1 ${className ?? ""}`}
      onClick={() => setConfirming(true)}
    >
      <TrashIcon className="w-3.5 h-3.5" />
      Remove semantic component
    </button>
  )
}
