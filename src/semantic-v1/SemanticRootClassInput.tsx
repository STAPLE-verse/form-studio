import React from "react"
import type { SemanticV1Component } from "@staple-verse/marker-template-runtime"
import RemoveSemanticComponentControl from "./RemoveSemanticComponentControl"
import Tooltip from "../Tooltip"

/**
 * Form-level Semantic V1 settings (§5.1): the optional root class IRI, shown
 * for both Core-only and Semantic V1 forms so authoring can start here. This
 * field alone must never emit the invalid `{ "bindings": [] }` component —
 * see the create/clear logic below and the authoring plan §3.
 */
export default function SemanticRootClassInput({
  semantics,
  onSemanticsChange,
}: {
  semantics: SemanticV1Component | undefined
  onSemanticsChange: (newSemantics: SemanticV1Component | undefined) => void
}): React.ReactElement {
  const handleClassIriChange = (value: string) => {
    if (value === "") {
      if (!semantics) return
      const bindings = semantics.bindings ?? []
      if (bindings.length === 0) {
        // Removing the last root class with no bindings left returns to Core-only (§3).
        onSemanticsChange(undefined)
        return
      }
      const { root: _root, ...withoutRoot } = semantics
      onSemanticsChange(withoutRoot)
      return
    }

    if (!semantics) {
      // The first valid root class creates the component (§3, §5.1).
      onSemanticsChange({ root: { classIri: value }, bindings: [] })
      return
    }

    onSemanticsChange({ ...semantics, root: { classIri: value } })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h5 data-test="semantic-root-class-label" className="font-semibold">
            Semantic root class (optional)
          </h5>
          <Tooltip
            id="semantic_root_class_tooltip"
            type="help"
            text="What kind of thing this whole form describes, for example a Person or a Research Project. Leave this blank if you don't need to connect your data to other systems yet."
          />
        </div>
        {semantics !== undefined && (
          <RemoveSemanticComponentControl onRemove={() => onSemanticsChange(undefined)} />
        )}
      </div>
      <input
        value={semantics?.root?.classIri ?? ""}
        placeholder="https://example.org/YourClass"
        type="text"
        onChange={(ev) => handleClassIriChange(ev.target.value)}
        className="input input-bordered w-full"
        data-test="semantic-root-class-input"
      />
      <p className="mt-1.5 text-xs text-base-content/60">
        The absolute IRI of the class this form instance represents. Leave blank for a Core-only
        form.
      </p>
    </div>
  )
}
