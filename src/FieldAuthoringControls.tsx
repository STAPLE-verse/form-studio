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
  className,
}: {
  fieldPointer: string
  compatibility?: FieldCompatibility
  valueOverride?: FieldExtensionValueOverride
  className?: string
}) {
  return (
    <FieldExtensionOutlet
      fieldPointer={fieldPointer}
      compatibility={compatibility}
      valueOverride={valueOverride}
      className={className}
    />
  )
}
