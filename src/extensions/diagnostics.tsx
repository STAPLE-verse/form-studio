"use client"

import React from "react"
import { useFormStudio } from "../FormStudioContext"

export default function FormStudioDiagnostics(): React.ReactElement | null {
  const { extensions, extensionDiagnostics } = useFormStudio()
  if (extensionDiagnostics.length === 0) return null

  return (
    <div
      className="flex flex-col gap-4"
      role="alert"
      data-form-studio-diagnostics="true"
      data-form-studio-diagnostics-count={extensionDiagnostics.length}
    >
      {extensions.map((extension) => {
        const diagnostics = extensionDiagnostics.filter(
          (diagnostic) => diagnostic.source === extension.id
        )
        if (diagnostics.length === 0) return null
        const blocksCommit = diagnostics.some((diagnostic) => diagnostic.blocksCommit)

        return (
          <section
            key={extension.id}
            className="rounded-xl border border-base-300 bg-base-200 p-4"
            data-diagnostic-source={extension.id}
          >
            <h4 className="text-lg font-bold">{extension.label}</h4>
            {blocksCommit && (
              <p className="mt-1 text-sm text-error">
                Resolve the blocking issues below before committing this form.
              </p>
            )}
            <ul className="mt-3 flex flex-col gap-2">
              {diagnostics.map((diagnostic, index) => (
                <li
                  key={`${diagnostic.code}-${diagnostic.pointer ?? ""}-${index}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    diagnostic.severity === "error"
                      ? "border-error/40 bg-error/10"
                      : "border-warning/40 bg-warning/10"
                  }`}
                  data-diagnostic-code={diagnostic.code}
                  data-diagnostic-severity={diagnostic.severity}
                  data-diagnostic-blocks-commit={diagnostic.blocksCommit}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-outline badge-sm font-mono">
                      {diagnostic.code}
                    </span>
                    {diagnostic.stage && (
                      <span className="font-mono text-xs opacity-70">{diagnostic.stage}</span>
                    )}
                    {diagnostic.pointer && (
                      <span className="font-mono text-xs opacity-70">{diagnostic.pointer}</span>
                    )}
                  </div>
                  <p className="mt-1">{diagnostic.message}</p>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
