import React from "react"
import type { FieldCompatibility } from "./types"
import { FieldExtensionOutlet, type FieldExtensionValueOverride } from "./extensions/outlets"

/**
 * One generic field-authoring insertion point for editable and compatibility
 * fields. Registered extensions own every contributed control.
 */
export default function FieldAuthoringControls({
  fieldPointer,
  compatibility,
  valueOverride,
}: {
  fieldPointer: string
  compatibility?: FieldCompatibility
  valueOverride?: FieldExtensionValueOverride
}) {
  return (
    <FieldExtensionOutlet
      fieldPointer={fieldPointer}
      compatibility={compatibility}
      valueOverride={valueOverride}
    />
  )
}
