import React from "react"
import type { FieldCompatibility } from "./types"
import SemanticBindingSection from "./SemanticBindingSection"
import { FieldExtensionOutlet } from "./extensions/outlets"

/**
 * One field-authoring insertion point for editable and compatibility fields.
 * The SemanticBindingSection child is the temporary pre-registry surface and
 * is removed when Semantic V1 becomes a registered extension in Phase 3.
 */
export default function FieldAuthoringControls({
  fieldPointer,
  compatibility,
}: {
  fieldPointer: string
  compatibility?: FieldCompatibility
}) {
  return (
    <>
      <FieldExtensionOutlet fieldPointer={fieldPointer} compatibility={compatibility} />
      <SemanticBindingSection fieldPointer={fieldPointer} />
    </>
  )
}
