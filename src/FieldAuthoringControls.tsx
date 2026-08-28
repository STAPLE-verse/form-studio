import React from "react"
import type { FieldCompatibility } from "./types"
import { FieldExtensionOutlet } from "./extensions/outlets"

/**
 * One generic field-authoring insertion point for editable and compatibility
 * fields. Registered extensions own every contributed control.
 */
export default function FieldAuthoringControls({
  fieldPointer,
  compatibility,
}: {
  fieldPointer: string
  compatibility?: FieldCompatibility
}) {
  return <FieldExtensionOutlet fieldPointer={fieldPointer} compatibility={compatibility} />
}
