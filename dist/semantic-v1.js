"use client";
import {
  fieldClass,
  fieldControlClass,
  fieldLabelClass,
  fieldStackClass
} from "./chunk-I4JU2HDP.js";
import {
  defineFormStudioExtension,
  useFormStudio,
  useSyncedJsonDocument
} from "./chunk-CTI3H5C4.js";

// src/semantic-v1/SemanticBindingSection.tsx
import { useMemo } from "react";
import { TrashIcon } from "@heroicons/react/20/solid";
import {
  analyzeSemanticV1Bindings,
  findAncestorNodeBindings
} from "@staple-verse/marker-template-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function SemanticBindingSection({
  fieldPointer,
  rootSchema,
  semantics,
  onSemanticsChange,
  diagnostics
}) {
  const bindings = semantics?.bindings ?? [];
  const bindingIndex = bindings.findIndex((candidate) => candidate.fieldPointer === fieldPointer);
  const binding = bindingIndex >= 0 ? bindings[bindingIndex] : void 0;
  const fieldDiagnostics = bindingIndex >= 0 ? diagnostics.filter(
    (d) => d.pointer?.startsWith(`/semantics/bindings/${bindingIndex}`)
  ) : [];
  const analysis = useMemo(
    () => analyzeSemanticV1Bindings({ form: { schema: rootSchema }, semantics }),
    [rootSchema, semantics]
  )[bindingIndex];
  const ancestorNodeBindings = useMemo(
    () => findAncestorNodeBindings(bindings, fieldPointer),
    [bindings, fieldPointer]
  );
  function commitBindings(nextBindings) {
    if (nextBindings.length === 0 && !semantics?.root) {
      onSemanticsChange(void 0);
      return;
    }
    const nextComponent = { ...semantics, bindings: nextBindings };
    onSemanticsChange(nextComponent);
  }
  function updateBinding(next) {
    const nextBindings = [...bindings];
    nextBindings[bindingIndex] = next;
    commitBindings(nextBindings);
  }
  function addBinding() {
    const nextBinding = { fieldPointer, predicate: "", valueKind: "literal" };
    commitBindings([...bindings, nextBinding]);
  }
  function removeBinding() {
    commitBindings(bindings.filter((_, index) => index !== bindingIndex));
  }
  const showParentControl = ancestorNodeBindings.length > 0 || binding?.parentNodePointer !== void 0;
  return /* @__PURE__ */ jsxs("div", { className: fieldStackClass, "data-semantic-binding-section": "true", "data-field-pointer": fieldPointer, children: [
    /* @__PURE__ */ jsx("h5", { className: fieldLabelClass, children: "Semantic binding" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs font-mono text-base-content/60 break-all -mt-2", children: fieldPointer }),
    !binding ? /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-outline btn-sm self-start", onClick: addBinding, children: "Add semantic binding" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: fieldClass, children: [
        /* @__PURE__ */ jsx("label", { className: fieldLabelClass, children: "Predicate IRI" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: binding.predicate,
            placeholder: "https://example.org/predicate",
            type: "text",
            onChange: (ev) => updateBinding({ ...binding, predicate: ev.target.value }),
            className: `input input-bordered input-sm ${fieldControlClass}`
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: fieldClass, children: [
        /* @__PURE__ */ jsx("label", { className: fieldLabelClass, children: "Value kind" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: `select select-bordered select-sm ${fieldControlClass}`,
            value: binding.valueKind,
            onChange: (ev) => updateBinding(changeValueKind(binding, ev.target.value)),
            children: [
              /* @__PURE__ */ jsx("option", { value: "literal", children: "Literal" }),
              /* @__PURE__ */ jsx("option", { value: "iri", children: "IRI" }),
              /* @__PURE__ */ jsx("option", { value: "node", children: "Node" })
            ]
          }
        )
      ] }),
      binding.valueKind === "literal" && /* @__PURE__ */ jsx(LiteralBindingControls, { binding, onChange: updateBinding }),
      binding.valueKind === "iri" && /* @__PURE__ */ jsx(IriBindingControls, { binding, onChange: updateBinding }),
      binding.valueKind === "node" && /* @__PURE__ */ jsx(NodeBindingControls, { binding, onChange: updateBinding }),
      showParentControl && /* @__PURE__ */ jsx(
        ParentNodePointerControl,
        {
          binding,
          ancestors: ancestorNodeBindings,
          onChange: updateBinding
        }
      ),
      analysis && /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60", children: [
        "Effective Core field type:",
        " ",
        analysis.resolutionStatus !== "resolved" ? analysis.resolutionStatus : analysis.unsupportedType || analysis.valueSchemas.length === 0 ? "unresolved" : Array.from(new Set(analysis.valueSchemas.map((s) => s.type))).join(" | ")
      ] }),
      fieldDiagnostics.length > 0 && /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-1", children: fieldDiagnostics.map((diagnostic, index) => /* @__PURE__ */ jsxs("li", { className: "text-xs text-error", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: diagnostic.code }),
        " \u2014 ",
        diagnostic.message
      ] }, index)) }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "btn btn-ghost btn-xs text-error self-start gap-1",
          onClick: removeBinding,
          children: [
            /* @__PURE__ */ jsx(TrashIcon, { className: "w-3.5 h-3.5" }),
            "Remove binding"
          ]
        }
      )
    ] })
  ] });
}
function changeValueKind(binding, newKind) {
  const base = {
    fieldPointer: binding.fieldPointer,
    predicate: binding.predicate,
    parentNodePointer: binding.parentNodePointer
  };
  if (newKind === "iri") return { ...base, valueKind: "iri" };
  if (newKind === "node") return { ...base, valueKind: "node" };
  return { ...base, valueKind: "literal" };
}
function LiteralBindingControls({
  binding,
  onChange
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx("label", { className: fieldLabelClass, children: "Datatype IRI (optional)" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: binding.datatypeIri ?? "",
          placeholder: "http://www.w3.org/2001/XMLSchema#date",
          type: "text",
          disabled: binding.language !== void 0,
          onChange: (ev) => onChange({ ...binding, datatypeIri: ev.target.value || void 0, language: void 0 }),
          className: `input input-bordered input-sm ${fieldControlClass}`
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx("label", { className: fieldLabelClass, children: "Language tag (optional)" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: binding.language ?? "",
          placeholder: "en",
          type: "text",
          disabled: binding.datatypeIri !== void 0,
          onChange: (ev) => onChange({ ...binding, language: ev.target.value || void 0, datatypeIri: void 0 }),
          className: `input input-bordered input-sm ${fieldControlClass}`
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60 -mt-2", children: "Only one of datatype IRI or language tag may be set." })
  ] });
}
function parseMappingValue(raw) {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw !== "" && !Number.isNaN(Number(raw)) && Number(raw).toString() === raw) return Number(raw);
  return raw;
}
function IriBindingControls({
  binding,
  onChange
}) {
  const hasMappings = binding.valueMappings !== void 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx("label", { className: fieldLabelClass, children: "IRI behavior" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: `select select-bordered select-sm ${fieldControlClass}`,
          value: hasMappings ? "mapped" : "direct",
          onChange: (ev) => {
            if (ev.target.value === "direct") {
              onChange({ ...binding, valueMappings: void 0 });
            } else {
              onChange({
                ...binding,
                valueMappings: binding.valueMappings?.length ? binding.valueMappings : [{ value: "", iri: "" }]
              });
            }
          },
          children: [
            /* @__PURE__ */ jsx("option", { value: "direct", children: "Direct \u2014 field value is the IRI" }),
            /* @__PURE__ */ jsx("option", { value: "mapped", children: "Mapped \u2014 exact local value \u2192 IRI" })
          ]
        }
      )
    ] }),
    hasMappings && /* @__PURE__ */ jsxs("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx("label", { className: fieldLabelClass, children: "Value \u2192 IRI mappings" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        (binding.valueMappings ?? []).map((mapping, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input input-bordered input-sm flex-1 min-w-0",
              placeholder: "Value",
              value: String(mapping.value),
              onChange: (ev) => {
                const next = [...binding.valueMappings ?? []];
                next[index] = { ...mapping, value: parseMappingValue(ev.target.value) };
                onChange({ ...binding, valueMappings: next });
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input input-bordered input-sm flex-1 min-w-0",
              placeholder: "https://example.org/value",
              value: mapping.iri,
              onChange: (ev) => {
                const next = [...binding.valueMappings ?? []];
                next[index] = { ...mapping, iri: ev.target.value };
                onChange({ ...binding, valueMappings: next });
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "aria-label": "Remove mapping",
              className: "btn btn-ghost btn-xs text-error",
              onClick: () => {
                const next = (binding.valueMappings ?? []).filter((_, i) => i !== index);
                onChange({ ...binding, valueMappings: next.length ? next : [{ value: "", iri: "" }] });
              },
              children: /* @__PURE__ */ jsx(TrashIcon, { className: "w-3.5 h-3.5" })
            }
          )
        ] }, index)),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-outline btn-xs self-start",
            onClick: () => onChange({
              ...binding,
              valueMappings: [...binding.valueMappings ?? [], { value: "", iri: "" }]
            }),
            children: "Add mapping"
          }
        )
      ] })
    ] })
  ] });
}
function NodeBindingControls({
  binding,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: fieldClass, children: [
    /* @__PURE__ */ jsx("label", { className: fieldLabelClass, children: "Class IRI (optional)" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        value: binding.classIri ?? "",
        placeholder: "https://example.org/YourClass",
        type: "text",
        onChange: (ev) => onChange({ ...binding, classIri: ev.target.value || void 0 }),
        className: `input input-bordered input-sm ${fieldControlClass}`
      }
    )
  ] });
}
function ParentNodePointerControl({
  binding,
  ancestors,
  onChange
}) {
  const nearest = ancestors.find((ancestor) => ancestor.nearest);
  const currentIsKnownAncestor = ancestors.some(
    (ancestor) => ancestor.binding.fieldPointer === binding.parentNodePointer
  );
  return /* @__PURE__ */ jsxs("div", { className: fieldClass, children: [
    /* @__PURE__ */ jsx("label", { className: fieldLabelClass, children: "Parent node" }),
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: `select select-bordered select-sm ${fieldControlClass}`,
        value: binding.parentNodePointer ?? "",
        onChange: (ev) => onChange({ ...binding, parentNodePointer: ev.target.value || void 0 }),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Not set" }),
          ancestors.map((ancestor) => /* @__PURE__ */ jsxs("option", { value: ancestor.binding.fieldPointer, children: [
            ancestor.binding.fieldPointer,
            ancestor.nearest ? " (nearest)" : ""
          ] }, ancestor.binding.fieldPointer)),
          binding.parentNodePointer !== void 0 && !currentIsKnownAncestor && /* @__PURE__ */ jsxs("option", { value: binding.parentNodePointer, children: [
            binding.parentNodePointer,
            " (not a containing node)"
          ] })
        ]
      }
    ),
    nearest && binding.parentNodePointer !== nearest.binding.fieldPointer && /* @__PURE__ */ jsxs("p", { className: "text-xs text-warning mt-1", children: [
      "Recommended: the nearest containing node is ",
      nearest.binding.fieldPointer
    ] })
  ] });
}

// src/semantic-v1/SemanticDocument.tsx
import Editor from "@monaco-editor/react";
import { PlusIcon } from "@heroicons/react/20/solid";

// src/semantic-v1/RemoveSemanticComponentControl.tsx
import { useState } from "react";
import { TrashIcon as TrashIcon2 } from "@heroicons/react/20/solid";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function RemoveSemanticComponentControl({
  onRemove,
  className
}) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return /* @__PURE__ */ jsxs2(
      "div",
      {
        className: `alert alert-warning py-2 text-sm items-center ${className ?? ""}`,
        role: "alert",
        children: [
          /* @__PURE__ */ jsx2("span", { children: "Remove the entire semantic component? This cannot be undone." }),
          /* @__PURE__ */ jsxs2("div", { className: "flex gap-2 ml-auto", children: [
            /* @__PURE__ */ jsx2("button", { type: "button", className: "btn btn-xs btn-ghost", onClick: () => setConfirming(false), children: "Cancel" }),
            /* @__PURE__ */ jsx2(
              "button",
              {
                type: "button",
                className: "btn btn-xs btn-error",
                onClick: () => {
                  onRemove();
                  setConfirming(false);
                },
                children: "Remove"
              }
            )
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs2(
    "button",
    {
      type: "button",
      className: `btn btn-ghost btn-xs text-error gap-1 ${className ?? ""}`,
      onClick: () => setConfirming(true),
      children: [
        /* @__PURE__ */ jsx2(TrashIcon2, { className: "w-3.5 h-3.5" }),
        "Remove semantic component"
      ]
    }
  );
}

// src/semantic-v1/SemanticDocument.tsx
import { Fragment as Fragment2, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var STARTER_SEMANTICS = {
  root: { classIri: "https://example.org/ChangeMe" },
  bindings: []
};
function SemanticDocument({
  value: semantics,
  setValue: setSemantics
}) {
  const semanticsDoc = useSyncedJsonDocument(
    semantics ?? STARTER_SEMANTICS,
    setSemantics,
    STARTER_SEMANTICS
  );
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: "flex-1 min-w-0 flex flex-col h-[500px] lg:h-full",
      "data-json-editor-document": "semantics",
      children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx3("h4", { className: "text-sm font-semibold text-base-content/70 uppercase tracking-wider", children: "Semantics" }),
          semantics !== void 0 && /* @__PURE__ */ jsx3(RemoveSemanticComponentControl, { onRemove: () => setSemantics(void 0) })
        ] }),
        semantics === void 0 ? /* @__PURE__ */ jsxs3("div", { className: "flex-1 flex flex-col items-center justify-center gap-3 bg-base-200 rounded-lg border border-dashed border-base-300 p-8 text-center", children: [
          /* @__PURE__ */ jsx3("p", { className: "text-base-content/60 italic", children: "This form has no Semantic V1 component yet." }),
          /* @__PURE__ */ jsxs3(
            "button",
            {
              type: "button",
              className: "btn btn-primary btn-sm gap-1.5",
              onClick: () => setSemantics(STARTER_SEMANTICS),
              children: [
                /* @__PURE__ */ jsx3(PlusIcon, { className: "w-4 h-4" }),
                "Add semantic component"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxs3(Fragment2, { children: [
          /* @__PURE__ */ jsx3("div", { className: "bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden py-2 relative", children: /* @__PURE__ */ jsx3(
            Editor,
            {
              height: "100%",
              language: "json",
              theme: "vs-dark",
              value: semanticsDoc.text,
              onChange: semanticsDoc.handleChange,
              options: {
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                formatOnPaste: true,
                scrollBeyondLastLine: false
              }
            }
          ) }),
          semanticsDoc.parseError && /* @__PURE__ */ jsxs3("p", { className: "mt-2 text-xs text-error font-mono break-words", role: "alert", children: [
            "Invalid JSON \u2014 not yet applied: ",
            semanticsDoc.parseError
          ] })
        ] })
      ]
    }
  );
}

// src/semantic-v1/SemanticRootClassInput.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function SemanticRootClassInput({
  semantics,
  onSemanticsChange
}) {
  const handleClassIriChange = (value) => {
    if (value === "") {
      if (!semantics) return;
      const bindings = semantics.bindings ?? [];
      if (bindings.length === 0) {
        onSemanticsChange(void 0);
        return;
      }
      const { root: _root, ...withoutRoot } = semantics;
      onSemanticsChange(withoutRoot);
      return;
    }
    if (!semantics) {
      onSemanticsChange({ root: { classIri: value }, bindings: [] });
      return;
    }
    onSemanticsChange({ ...semantics, root: { classIri: value } });
  };
  return /* @__PURE__ */ jsxs4("div", { children: [
    /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsx4("h5", { "data-test": "semantic-root-class-label", className: "font-semibold", children: "Semantic root class (optional)" }),
      semantics !== void 0 && /* @__PURE__ */ jsx4(RemoveSemanticComponentControl, { onRemove: () => onSemanticsChange(void 0) })
    ] }),
    /* @__PURE__ */ jsx4(
      "input",
      {
        value: semantics?.root?.classIri ?? "",
        placeholder: "https://example.org/YourClass",
        type: "text",
        onChange: (ev) => handleClassIriChange(ev.target.value),
        className: "input input-bordered w-full",
        "data-test": "semantic-root-class-input"
      }
    ),
    /* @__PURE__ */ jsx4("p", { className: "mt-1.5 text-xs text-base-content/60", children: "The absolute IRI of the class this form instance represents. Leave blank for a Core-only form." })
  ] });
}

// src/semantic-v1/constants.ts
var SEMANTIC_V1_EXTENSION_ID = "semantic-v1";
var SEMANTIC_V1_EXTENSION_LABEL = "Semantic V1";

// src/semantic-v1/semanticValidation.ts
import { validateSemanticV1 } from "@staple-verse/marker-template-runtime";
function buildSemanticValidationDocument(state) {
  return {
    form: { schema: state.schema },
    semantics: state.semantics
  };
}
function computeSemanticDiagnostics(state) {
  if (state.semantics === void 0) return [];
  return validateSemanticV1(buildSemanticValidationDocument(state));
}

// src/semantic-v1/extension.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function SemanticFormControls({
  value,
  setValue
}) {
  return /* @__PURE__ */ jsx5("div", { className: "formHead border border-base-300 rounded-xl bg-base-200 shadow-sm p-4 mt-4", children: /* @__PURE__ */ jsx5(SemanticRootClassInput, { semantics: value, onSemanticsChange: setValue }) });
}
function SemanticFieldControls({
  value,
  setValue,
  diagnostics,
  field
}) {
  return /* @__PURE__ */ jsx5(
    SemanticBindingSection,
    {
      fieldPointer: field.fieldPointer,
      rootSchema: field.rootSchema,
      semantics: value,
      onSemanticsChange: setValue,
      diagnostics
    }
  );
}
var semanticV1Extension = defineFormStudioExtension({
  id: SEMANTIC_V1_EXTENSION_ID,
  label: SEMANTIC_V1_EXTENSION_LABEL,
  validate({ schema, value }) {
    return computeSemanticDiagnostics({ schema, semantics: value }).map(
      (diagnostic) => ({
        source: SEMANTIC_V1_EXTENSION_ID,
        sourceLabel: SEMANTIC_V1_EXTENSION_LABEL,
        code: diagnostic.code,
        pointer: diagnostic.pointer,
        stage: diagnostic.stage,
        message: diagnostic.message,
        severity: "error",
        blocksCommit: true
      })
    );
  },
  slots: {
    FormControls: SemanticFormControls,
    FieldControls: SemanticFieldControls,
    JsonDocument: SemanticDocument
  }
});

// src/semantic-v1/accessors.ts
function getSemanticV1Value(state) {
  return semanticV1Extension.getValue(state);
}
function useSemanticV1Value() {
  const context = useFormStudio();
  return {
    value: context.getExtensionValue(semanticV1Extension),
    setValue: (value) => context.setExtensionValue(semanticV1Extension, value),
    diagnostics: context.extensionDiagnostics.filter(
      (diagnostic) => diagnostic.source === semanticV1Extension.id
    )
  };
}

// src/semantic-v1/SemanticDiagnosticsSummary.tsx
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function SemanticDiagnosticsSummary() {
  const { extensionDiagnostics } = useFormStudio();
  const semanticDiagnostics = extensionDiagnostics.filter(
    (diagnostic) => diagnostic.source === SEMANTIC_V1_EXTENSION_ID
  );
  if (semanticDiagnostics.length === 0) return null;
  return /* @__PURE__ */ jsxs5(
    "div",
    {
      className: "rounded-xl border border-error/50 bg-error/10 shadow-sm p-4",
      role: "alert",
      "data-semantic-diagnostics": "true",
      "data-semantic-diagnostics-count": semanticDiagnostics.length,
      children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 text-lg", children: [
          /* @__PURE__ */ jsx6(ExclamationTriangleIcon, { className: "h-[1em] w-[1em] shrink-0 text-error", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxs5("h4", { className: "text-lg font-bold", children: [
            semanticDiagnostics.length === 1 ? "1 semantic issue" : `${semanticDiagnostics.length} semantic issues`,
            " ",
            "must be resolved before this component can be saved"
          ] })
        ] }),
        /* @__PURE__ */ jsx6("ul", { className: "mt-3 flex flex-col gap-2", children: semanticDiagnostics.map((diagnostic, index) => /* @__PURE__ */ jsx6(SemanticDiagnosticItem, { diagnostic }, `${diagnostic.pointer}-${index}`)) })
      ]
    }
  );
}
function SemanticDiagnosticItem({
  diagnostic
}) {
  return /* @__PURE__ */ jsxs5(
    "li",
    {
      className: "text-sm rounded-lg border border-error/40 bg-error/20 px-3 py-2",
      "data-semantic-diagnostic-code": diagnostic.code,
      "data-semantic-diagnostic-stage": diagnostic.stage,
      children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx6("span", { className: "badge badge-outline badge-sm font-mono", children: diagnostic.code }),
          /* @__PURE__ */ jsx6("span", { className: "font-mono text-xs opacity-70", children: diagnostic.pointer })
        ] }),
        /* @__PURE__ */ jsx6("p", { className: "mt-1", children: diagnostic.message })
      ]
    }
  );
}
export {
  SemanticDiagnosticsSummary,
  buildSemanticValidationDocument,
  computeSemanticDiagnostics,
  getSemanticV1Value,
  semanticV1Extension,
  useSemanticV1Value
};
//# sourceMappingURL=semantic-v1.js.map