"use client"

import React from "react"
import type { SemanticV1Component } from "@staple-verse/marker-template-runtime"
import { defineFormStudioExtension } from "../extensions/types"
import type {
  FieldExtensionControlProps,
  FormExtensionControlProps,
  FormStudioDiagnostic,
} from "../extensions/types"
import SemanticBindingSection from "./SemanticBindingSection"
import SemanticDocument from "./SemanticDocument"
import SemanticRootClassInput from "./SemanticRootClassInput"
import { SEMANTIC_V1_EXTENSION_ID, SEMANTIC_V1_EXTENSION_LABEL } from "./constants"
import { computeSemanticDiagnostics } from "./semanticValidation"

function SemanticFormControls({
  value,
  setValue,
}: FormExtensionControlProps<SemanticV1Component>) {
  return (
    <div className="formHead border border-base-300 rounded-xl bg-base-200 shadow-sm p-4 mt-4">
      <SemanticRootClassInput semantics={value} onSemanticsChange={setValue} />
    </div>
  )
}

function SemanticFieldControls({
  value,
  setValue,
  diagnostics,
  field,
}: FieldExtensionControlProps<SemanticV1Component>) {
  return (
    <SemanticBindingSection
      fieldPointer={field.fieldPointer}
      rootSchema={field.rootSchema}
      semantics={value}
      onSemanticsChange={setValue}
      diagnostics={diagnostics}
    />
  )
}

export const semanticV1Extension = defineFormStudioExtension<SemanticV1Component>({
  id: SEMANTIC_V1_EXTENSION_ID,
  label: SEMANTIC_V1_EXTENSION_LABEL,
  validate({ schema, value }) {
    return computeSemanticDiagnostics({ schema, semantics: value }).map(
      (diagnostic): FormStudioDiagnostic => ({
        source: SEMANTIC_V1_EXTENSION_ID,
        sourceLabel: SEMANTIC_V1_EXTENSION_LABEL,
        code: diagnostic.code,
        pointer: diagnostic.pointer,
        stage: diagnostic.stage,
        message: diagnostic.message,
        severity: "error",
        blocksCommit: true,
      })
    )
  },
  slots: {
    FormControls: SemanticFormControls,
    FieldControls: SemanticFieldControls,
    JsonDocument: SemanticDocument,
  },
})
