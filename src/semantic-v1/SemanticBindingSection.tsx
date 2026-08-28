import React, { useMemo } from "react"
import { TrashIcon } from "@heroicons/react/20/solid"
import {
  analyzeSemanticV1Bindings,
  findAncestorNodeBindings,
} from "@staple-verse/marker-template-runtime"
import type {
  SemanticAncestorNodeBinding,
  SemanticBinding,
  SemanticIriBinding,
  SemanticLiteralBinding,
  SemanticNodeBinding,
  SemanticV1Component,
} from "@staple-verse/marker-template-runtime"
import type { FormStudioDiagnostic } from "../extensions/types"
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "../fieldLayout"

/**
 * Field-level Semantic V1 binding controls shown in a field's "Additional
 * Settings" (§5.2). Rendered for every instance-bearing field — including
 * read-only compatibility cards, since inability to visually edit a field's
 * schema structure does not prevent attaching a binding to it (§5.2) — as
 * whenever the Semantic V1 extension is registered.
 */
export default function SemanticBindingSection({
  fieldPointer,
  rootSchema,
  semantics,
  onSemanticsChange,
  diagnostics,
}: {
  fieldPointer: string
  rootSchema: object
  semantics: SemanticV1Component | undefined
  onSemanticsChange: (newSemantics: SemanticV1Component | undefined) => void
  diagnostics: readonly FormStudioDiagnostic[]
}): React.ReactElement {

  const bindings = semantics?.bindings ?? []
  const bindingIndex = bindings.findIndex((candidate) => candidate.fieldPointer === fieldPointer)
  const binding = bindingIndex >= 0 ? bindings[bindingIndex] : undefined

  const fieldDiagnostics =
    bindingIndex >= 0
      ? diagnostics.filter((d) =>
          d.pointer?.startsWith(`/semantics/bindings/${bindingIndex}`)
        )
      : []

  const analysis = useMemo(
    () => analyzeSemanticV1Bindings({ form: { schema: rootSchema }, semantics }),
    [rootSchema, semantics]
  )[bindingIndex]

  const ancestorNodeBindings = useMemo(
    () => findAncestorNodeBindings(bindings, fieldPointer),
    [bindings, fieldPointer]
  )

  function commitBindings(nextBindings: SemanticBinding[]) {
    if (nextBindings.length === 0 && !semantics?.root) {
      // Removing the last binding with no root class returns to Core-only (§3).
      onSemanticsChange(undefined)
      return
    }
    const nextComponent: SemanticV1Component = { ...semantics, bindings: nextBindings }
    onSemanticsChange(nextComponent)
  }

  function updateBinding(next: SemanticBinding) {
    const nextBindings = [...bindings]
    nextBindings[bindingIndex] = next
    commitBindings(nextBindings)
  }

  function addBinding() {
    // The first valid field binding creates the component when absent (§3, §5.2).
    const nextBinding: SemanticBinding = { fieldPointer, predicate: "", valueKind: "literal" }
    commitBindings([...bindings, nextBinding])
  }

  function removeBinding() {
    commitBindings(bindings.filter((_, index) => index !== bindingIndex))
  }

  const showParentControl = ancestorNodeBindings.length > 0 || binding?.parentNodePointer !== undefined

  return (
    <div className={fieldStackClass} data-semantic-binding-section="true" data-field-pointer={fieldPointer}>
      <h5 className={fieldLabelClass}>Semantic binding</h5>
      <p className="text-xs font-mono text-base-content/60 break-all -mt-2">{fieldPointer}</p>

      {!binding ? (
        <button type="button" className="btn btn-outline btn-sm self-start" onClick={addBinding}>
          Add semantic binding
        </button>
      ) : (
        <>
          <div className={fieldClass}>
            <label className={fieldLabelClass}>Predicate IRI</label>
            <input
              value={binding.predicate}
              placeholder="https://example.org/predicate"
              type="text"
              onChange={(ev) => updateBinding({ ...binding, predicate: ev.target.value })}
              className={`input input-bordered input-sm ${fieldControlClass}`}
            />
          </div>

          <div className={fieldClass}>
            <label className={fieldLabelClass}>Value kind</label>
            <select
              className={`select select-bordered select-sm ${fieldControlClass}`}
              value={binding.valueKind}
              onChange={(ev) =>
                updateBinding(changeValueKind(binding, ev.target.value as SemanticBinding["valueKind"]))
              }
            >
              <option value="literal">Literal</option>
              <option value="iri">IRI</option>
              <option value="node">Node</option>
            </select>
          </div>

          {binding.valueKind === "literal" && (
            <LiteralBindingControls binding={binding} onChange={updateBinding} />
          )}
          {binding.valueKind === "iri" && <IriBindingControls binding={binding} onChange={updateBinding} />}
          {binding.valueKind === "node" && (
            <NodeBindingControls binding={binding} onChange={updateBinding} />
          )}

          {showParentControl && (
            <ParentNodePointerControl
              binding={binding}
              ancestors={ancestorNodeBindings}
              onChange={updateBinding}
            />
          )}

          {analysis && (
            <p className="text-xs text-base-content/60">
              Effective Core field type:{" "}
              {analysis.resolutionStatus !== "resolved"
                ? analysis.resolutionStatus
                : analysis.unsupportedType || analysis.valueSchemas.length === 0
                  ? "unresolved"
                  : Array.from(new Set(analysis.valueSchemas.map((s) => s.type))).join(" | ")}
            </p>
          )}

          {fieldDiagnostics.length > 0 && (
            <ul className="flex flex-col gap-1">
              {fieldDiagnostics.map((diagnostic, index) => (
                <li key={index} className="text-xs text-error">
                  <span className="font-mono">{diagnostic.code}</span> — {diagnostic.message}
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-xs text-error self-start gap-1"
            onClick={removeBinding}
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Remove binding
          </button>
        </>
      )}
    </div>
  )
}

function changeValueKind(binding: SemanticBinding, newKind: SemanticBinding["valueKind"]): SemanticBinding {
  const base = {
    fieldPointer: binding.fieldPointer,
    predicate: binding.predicate,
    parentNodePointer: binding.parentNodePointer,
  }
  if (newKind === "iri") return { ...base, valueKind: "iri" }
  if (newKind === "node") return { ...base, valueKind: "node" }
  return { ...base, valueKind: "literal" }
}

function LiteralBindingControls({
  binding,
  onChange,
}: {
  binding: SemanticLiteralBinding
  onChange: (next: SemanticBinding) => void
}): React.ReactElement {
  return (
    <>
      <div className={fieldClass}>
        <label className={fieldLabelClass}>Datatype IRI (optional)</label>
        <input
          value={binding.datatypeIri ?? ""}
          placeholder="http://www.w3.org/2001/XMLSchema#date"
          type="text"
          disabled={binding.language !== undefined}
          onChange={(ev) =>
            onChange({ ...binding, datatypeIri: ev.target.value || undefined, language: undefined })
          }
          className={`input input-bordered input-sm ${fieldControlClass}`}
        />
      </div>
      <div className={fieldClass}>
        <label className={fieldLabelClass}>Language tag (optional)</label>
        <input
          value={binding.language ?? ""}
          placeholder="en"
          type="text"
          disabled={binding.datatypeIri !== undefined}
          onChange={(ev) =>
            onChange({ ...binding, language: ev.target.value || undefined, datatypeIri: undefined })
          }
          className={`input input-bordered input-sm ${fieldControlClass}`}
        />
      </div>
      <p className="text-xs text-base-content/60 -mt-2">
        Only one of datatype IRI or language tag may be set.
      </p>
    </>
  )
}

// Exact local value-to-IRI mappings store JSON scalars; this lightweight
// coercion keeps numeric/boolean-looking input usable without a full typed
// editor per mapping.
function parseMappingValue(raw: string): string | number | boolean {
  if (raw === "true") return true
  if (raw === "false") return false
  if (raw !== "" && !Number.isNaN(Number(raw)) && Number(raw).toString() === raw) return Number(raw)
  return raw
}

function IriBindingControls({
  binding,
  onChange,
}: {
  binding: SemanticIriBinding
  onChange: (next: SemanticBinding) => void
}): React.ReactElement {
  const hasMappings = binding.valueMappings !== undefined

  return (
    <>
      <div className={fieldClass}>
        <label className={fieldLabelClass}>IRI behavior</label>
        <select
          className={`select select-bordered select-sm ${fieldControlClass}`}
          value={hasMappings ? "mapped" : "direct"}
          onChange={(ev) => {
            if (ev.target.value === "direct") {
              onChange({ ...binding, valueMappings: undefined })
            } else {
              onChange({
                ...binding,
                valueMappings: binding.valueMappings?.length ? binding.valueMappings : [{ value: "", iri: "" }],
              })
            }
          }}
        >
          <option value="direct">Direct — field value is the IRI</option>
          <option value="mapped">Mapped — exact local value → IRI</option>
        </select>
      </div>

      {hasMappings && (
        <div className={fieldClass}>
          <label className={fieldLabelClass}>Value → IRI mappings</label>
          <div className="flex flex-col gap-2">
            {(binding.valueMappings ?? []).map((mapping, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  className="input input-bordered input-sm flex-1 min-w-0"
                  placeholder="Value"
                  value={String(mapping.value)}
                  onChange={(ev) => {
                    const next = [...(binding.valueMappings ?? [])]
                    next[index] = { ...mapping, value: parseMappingValue(ev.target.value) }
                    onChange({ ...binding, valueMappings: next })
                  }}
                />
                <input
                  className="input input-bordered input-sm flex-1 min-w-0"
                  placeholder="https://example.org/value"
                  value={mapping.iri}
                  onChange={(ev) => {
                    const next = [...(binding.valueMappings ?? [])]
                    next[index] = { ...mapping, iri: ev.target.value }
                    onChange({ ...binding, valueMappings: next })
                  }}
                />
                <button
                  type="button"
                  aria-label="Remove mapping"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => {
                    const next = (binding.valueMappings ?? []).filter((_, i) => i !== index)
                    onChange({ ...binding, valueMappings: next.length ? next : [{ value: "", iri: "" }] })
                  }}
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline btn-xs self-start"
              onClick={() =>
                onChange({
                  ...binding,
                  valueMappings: [...(binding.valueMappings ?? []), { value: "", iri: "" }],
                })
              }
            >
              Add mapping
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function NodeBindingControls({
  binding,
  onChange,
}: {
  binding: SemanticNodeBinding
  onChange: (next: SemanticBinding) => void
}): React.ReactElement {
  return (
    <div className={fieldClass}>
      <label className={fieldLabelClass}>Class IRI (optional)</label>
      <input
        value={binding.classIri ?? ""}
        placeholder="https://example.org/YourClass"
        type="text"
        onChange={(ev) => onChange({ ...binding, classIri: ev.target.value || undefined })}
        className={`input input-bordered input-sm ${fieldControlClass}`}
      />
    </div>
  )
}

function ParentNodePointerControl({
  binding,
  ancestors,
  onChange,
}: {
  binding: SemanticBinding
  ancestors: SemanticAncestorNodeBinding[]
  onChange: (next: SemanticBinding) => void
}): React.ReactElement {
  const nearest = ancestors.find((ancestor) => ancestor.nearest)
  const currentIsKnownAncestor = ancestors.some(
    (ancestor) => ancestor.binding.fieldPointer === binding.parentNodePointer
  )

  return (
    <div className={fieldClass}>
      <label className={fieldLabelClass}>Parent node</label>
      <select
        className={`select select-bordered select-sm ${fieldControlClass}`}
        value={binding.parentNodePointer ?? ""}
        onChange={(ev) => onChange({ ...binding, parentNodePointer: ev.target.value || undefined })}
      >
        <option value="">Not set</option>
        {ancestors.map((ancestor) => (
          <option key={ancestor.binding.fieldPointer} value={ancestor.binding.fieldPointer}>
            {ancestor.binding.fieldPointer}
            {ancestor.nearest ? " (nearest)" : ""}
          </option>
        ))}
        {binding.parentNodePointer !== undefined && !currentIsKnownAncestor && (
          <option value={binding.parentNodePointer}>{binding.parentNodePointer} (not a containing node)</option>
        )}
      </select>
      {nearest && binding.parentNodePointer !== nearest.binding.fieldPointer && (
        <p className="text-xs text-warning mt-1">
          Recommended: the nearest containing node is {nearest.binding.fieldPointer}
        </p>
      )}
    </div>
  )
}
