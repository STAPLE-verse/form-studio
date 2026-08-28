"use client";
import {
  useFormStudio,
  useOptionalFormStudio,
  useSyncedJsonDocument
} from "./chunk-CTI3H5C4.js";

// src/JsonEditor.tsx
import Editor from "@monaco-editor/react";

// src/extensions/outlets.tsx
import { Component } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function FormExtensionOutlet({
  schema,
  uiSchema
}) {
  const context = useOptionalFormStudio();
  if (!context || context.extensions.length === 0) return null;
  const extensions = context.extensions.filter((extension) => extension.slots?.FormControls);
  if (extensions.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { "data-form-studio-extension-outlet": "form", children: extensions.map((extension) => {
    const FormControls = extension.slots?.FormControls;
    if (!FormControls) return null;
    const props = createControlProps(context, extension, schema, uiSchema);
    return /* @__PURE__ */ jsx(
      ExtensionSlotErrorBoundary,
      {
        extensionId: extension.id,
        extensionLabel: extension.label,
        slot: "form",
        resetKey: slotResetKey(props),
        children: /* @__PURE__ */ jsx(FormControls, { ...props })
      },
      extension.id
    );
  }) });
}
function FieldExtensionOutlet({
  fieldPointer,
  compatibility
}) {
  const context = useOptionalFormStudio();
  if (!context || context.extensions.length === 0) return null;
  const extensions = context.extensions.filter((extension) => extension.slots?.FieldControls);
  if (extensions.length === 0) return null;
  const rootSchema = context.state.schema;
  const fieldSchema = resolveFieldSchema(rootSchema, fieldPointer);
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-form-studio-extension-outlet": "field",
      "data-field-pointer": fieldPointer,
      children: extensions.map((extension) => {
        const FieldControls = extension.slots?.FieldControls;
        if (!FieldControls) return null;
        const baseProps = createControlProps(
          context,
          extension,
          context.state.schema,
          context.state.uiSchema
        );
        const props = {
          ...baseProps,
          field: {
            fieldPointer,
            fieldSchema,
            rootSchema,
            compatibility
          }
        };
        return /* @__PURE__ */ jsx(
          ExtensionSlotErrorBoundary,
          {
            extensionId: extension.id,
            extensionLabel: extension.label,
            slot: "field",
            resetKey: slotResetKey(props),
            children: /* @__PURE__ */ jsx(FieldControls, { ...props })
          },
          extension.id
        );
      })
    }
  );
}
function JsonDocumentExtensionOutlet() {
  const context = useOptionalFormStudio();
  if (!context || context.extensions.length === 0) return null;
  return /* @__PURE__ */ jsx(Fragment, { children: context.extensions.map((extension) => {
    const JsonDocument = extension.slots?.JsonDocument;
    if (!JsonDocument) return null;
    const props = createControlProps(
      context,
      extension,
      context.state.schema,
      context.state.uiSchema
    );
    return /* @__PURE__ */ jsx(
      ExtensionSlotErrorBoundary,
      {
        extensionId: extension.id,
        extensionLabel: extension.label,
        slot: "json-document",
        resetKey: slotResetKey(props),
        children: /* @__PURE__ */ jsx(JsonDocument, { ...props })
      },
      extension.id
    );
  }) });
}
function createControlProps(context, extension, schema, uiSchema) {
  return {
    extension,
    schema,
    uiSchema,
    value: context.getExtensionValue(extension),
    setValue: (value) => context.setExtensionValue(extension, value),
    diagnostics: context.extensionDiagnostics.filter(
      (diagnostic) => diagnostic.source === extension.id
    )
  };
}
function resolveFieldSchema(rootSchema, fieldPointer) {
  if (fieldPointer === "") return rootSchema;
  const tokens = fieldPointer.split("/").slice(1).map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current = rootSchema;
  for (const token of tokens) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return {};
    current = current[token];
  }
  return current && typeof current === "object" && !Array.isArray(current) ? current : {};
}
function slotResetKey(props) {
  return JSON.stringify({
    schema: props.schema,
    uiSchema: props.uiSchema,
    value: props.value,
    field: "field" in props ? props.field.fieldPointer : void 0
  });
}
var ExtensionSlotErrorBoundary = class extends Component {
  constructor() {
    super(...arguments);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    console.error(
      `Form Studio extension ${this.props.extensionId} ${this.props.slot} render error`,
      error,
      errorInfo
    );
  }
  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "alert alert-warning",
          role: "alert",
          "data-extension-slot-error": this.props.extensionId,
          "data-extension-slot": this.props.slot,
          children: /* @__PURE__ */ jsxs("span", { children: [
            this.props.extensionLabel,
            " ",
            this.props.slot,
            " controls unavailable: ",
            this.state.error.message
          ] })
        }
      );
    }
    return this.props.children;
  }
};

// src/JsonEditor.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var EMPTY_OBJECT = {};
function ParseErrorNotice({ message }) {
  return /* @__PURE__ */ jsxs2("p", { className: "mt-2 text-xs text-error font-mono break-words", role: "alert", children: [
    "Invalid JSON \u2014 not yet applied: ",
    message
  ] });
}
function JsonEditor() {
  const { state, setSchema, setUiSchema } = useFormStudio();
  const schemaDoc = useSyncedJsonDocument(state.schema, setSchema, EMPTY_OBJECT);
  const uiSchemaDoc = useSyncedJsonDocument(state.uiSchema, setUiSchema, EMPTY_OBJECT);
  return /* @__PURE__ */ jsx2("div", { className: "flex flex-col h-full", children: /* @__PURE__ */ jsxs2("div", { className: "flex flex-col lg:flex-row gap-6 w-full h-full overflow-y-auto pb-8 pt-4", children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex-1 min-w-0 flex flex-col h-[500px] lg:h-full", children: [
      /* @__PURE__ */ jsx2("h4", { className: "text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-2", children: "Data Schema" }),
      /* @__PURE__ */ jsx2("div", { className: "bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden py-2 relative", children: /* @__PURE__ */ jsx2(
        Editor,
        {
          height: "100%",
          language: "json",
          theme: "vs-dark",
          value: schemaDoc.text,
          onChange: schemaDoc.handleChange,
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
      schemaDoc.parseError && /* @__PURE__ */ jsx2(ParseErrorNotice, { message: schemaDoc.parseError })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "flex-1 min-w-0 flex flex-col h-[500px] lg:h-full", children: [
      /* @__PURE__ */ jsx2("h4", { className: "text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-2", children: "UI Schema" }),
      /* @__PURE__ */ jsx2("div", { className: "bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden py-2 relative", children: /* @__PURE__ */ jsx2(
        Editor,
        {
          height: "100%",
          language: "json",
          theme: "vs-dark",
          value: uiSchemaDoc.text,
          onChange: uiSchemaDoc.handleChange,
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
      uiSchemaDoc.parseError && /* @__PURE__ */ jsx2(ParseErrorNotice, { message: uiSchemaDoc.parseError })
    ] }),
    /* @__PURE__ */ jsx2(JsonDocumentExtensionOutlet, {})
  ] }) });
}

export {
  FormExtensionOutlet,
  FieldExtensionOutlet,
  JsonEditor
};
//# sourceMappingURL=chunk-4PXDTVNU.js.map