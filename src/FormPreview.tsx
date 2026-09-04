"use client"

import React from "react"
import JsonSchemaForm from "./JsonSchemaForm"
import { useFormStudio } from "./FormStudioContext"

// Helper to remove submit button visually from the preview if needed
const hideSubmitButton = (uiSchema: any) => {
  return {
    ...uiSchema,
    "ui:submitButtonOptions": {
      norender: true,
    },
  }
}

export default function FormPreview(): React.ReactElement {
  const { state, setFormData } = useFormStudio()
  const uiSchema = React.useMemo(() => hideSubmitButton(state.uiSchema), [state.uiSchema])

  // Make sure we have a valid schema to render, otherwise it crashes
  if (!state.schema || Object.keys(state.schema).length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-base-200 rounded-box border border-base-300 p-8">
        <p className="text-base-content/60 italic">No form defined to preview.</p>
      </div>
    )
  }

  const handleChange = ({ formData }: any) => {
    setFormData(formData)
  }

  return (
    <div className="h-full overflow-y-auto pt-2 pb-8">
      <JsonSchemaForm
        schema={state.schema as Record<string, unknown>}
        uiSchema={uiSchema}
        formData={state.formData}
        onChange={handleChange}
      />
    </div>
  )
}
