"use client"

import type { SemanticV1Component } from "@staple-verse/marker-template-runtime"
import { useFormStudio } from "../FormStudioContext"
import type { FormStudioExtensionState } from "../extensions/types"
import { semanticV1Extension } from "./extension"

export function getSemanticV1Value(
  state: FormStudioExtensionState
): SemanticV1Component | undefined {
  return semanticV1Extension.getValue(state)
}

export function useSemanticV1Value() {
  const context = useFormStudio()
  return {
    value: context.getExtensionValue(semanticV1Extension),
    setValue: (value: SemanticV1Component | undefined) =>
      context.setExtensionValue(semanticV1Extension, value),
    diagnostics: context.extensionDiagnostics.filter(
      (diagnostic) => diagnostic.source === semanticV1Extension.id
    ),
  }
}
