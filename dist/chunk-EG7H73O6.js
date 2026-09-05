"use client";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/extensions/types.ts
function getFormStudioExtensionValue(state, extension) {
  return state.extensionValues[extension.id];
}
function defineFormStudioExtension(extension) {
  const id = extension.id;
  return Object.freeze({
    ...extension,
    getValue: (state) => state.extensionValues[id]
  });
}

// src/FormStudioContext.tsx
import {
  createContext,
  useContext,
  useEffect as useEffect2,
  useMemo as useMemo2,
  useRef as useRef3,
  useState as useState2
} from "react";

// src/extensions/registry.ts
function createFormStudioExtensionRegistry(extensions) {
  const registered = [...extensions];
  const byId = /* @__PURE__ */ new Map();
  for (const extension of registered) {
    if (extension.id.trim().length === 0) {
      throw new Error("Form Studio extension IDs must be non-empty strings.");
    }
    if (byId.has(extension.id)) {
      throw new Error(`Duplicate Form Studio extension ID: ${extension.id}`);
    }
    byId.set(extension.id, extension);
  }
  return {
    extensions: Object.freeze(registered),
    ids: Object.freeze(registered.map((extension) => extension.id)),
    byId
  };
}
function assertStableFormStudioExtensionRegistry(registry, nextExtensions) {
  const changed = registry.extensions.length !== nextExtensions.length || registry.extensions.some(
    (extension, index) => extension !== nextExtensions[index] || extension.id !== registry.ids[index]
  );
  if (changed) {
    throw new Error(
      "FormStudioProvider extensions must remain stable for the provider lifetime. Remount the provider to change registration."
    );
  }
}
function assertRegisteredFormStudioExtension(registry, extension) {
  if (registry.byId.get(extension.id) !== extension) {
    throw new Error(
      `Form Studio extension "${extension.id}" is not registered with this provider.`
    );
  }
}
function createInitialExtensionValues(registry, initialValues) {
  for (const id of Object.keys(initialValues)) {
    if (!registry.byId.has(id)) {
      throw new Error(`Initial value supplied for unregistered Form Studio extension: ${id}`);
    }
  }
  return orderExtensionValues(registry, initialValues);
}
function setRegisteredExtensionValue(registry, currentValues, extension, value) {
  assertRegisteredFormStudioExtension(registry, extension);
  const nextValues = { ...currentValues };
  if (value === void 0) {
    delete nextValues[extension.id];
  } else {
    nextValues[extension.id] = value;
  }
  return orderExtensionValues(registry, nextValues);
}
function orderExtensionValues(registry, values) {
  const ordered = {};
  for (const extension of registry.extensions) {
    const value = values[extension.id];
    if (value !== void 0) {
      ordered[extension.id] = value;
    }
  }
  return ordered;
}

// src/extensions/validation.ts
import { useMemo, useRef as useRef2 } from "react";

// src/debounce.ts
var DEBOUNCE_MS = 1500;
function createDebouncer(delayMs) {
  let handle;
  return {
    schedule(callback) {
      if (handle !== void 0) clearTimeout(handle);
      handle = setTimeout(callback, delayMs);
    },
    cancel() {
      if (handle !== void 0) clearTimeout(handle);
      handle = void 0;
    }
  };
}

// src/useDebouncedValue.ts
import { useEffect, useRef, useState } from "react";
function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  const debouncerRef = useRef(void 0);
  if (!debouncerRef.current) {
    debouncerRef.current = createDebouncer(delayMs);
  }
  useEffect(() => {
    debouncerRef.current.schedule(() => setDebounced(value));
    return () => debouncerRef.current.cancel();
  }, [value, delayMs]);
  return debounced;
}

// src/extensions/validation.ts
function validateRegisteredExtensions(registry, state) {
  const diagnostics = registry.extensions.flatMap((extension) => {
    try {
      return extension.validate({
        schema: state.schema,
        uiSchema: state.uiSchema,
        value: state.extensionValues[extension.id]
      }).map((diagnostic) => ({
        ...diagnostic,
        source: extension.id,
        sourceLabel: extension.label
      }));
    } catch (error) {
      return [validatorFailureDiagnostic(extension.id, extension.label, error)];
    }
  });
  return {
    diagnostics,
    blocked: diagnostics.some((diagnostic) => diagnostic.blocksCommit)
  };
}
function useDebouncedExtensionDiagnostics(registry, state) {
  const input = useStableExtensionValidationState(state);
  const debouncedInput = useDebouncedValue(input, DEBOUNCE_MS);
  return useMemo(
    () => validateRegisteredExtensions(registry, debouncedInput).diagnostics,
    [registry, debouncedInput]
  );
}
function useStableExtensionValidationState(state) {
  const input = {
    schema: state.schema,
    uiSchema: state.uiSchema,
    extensionValues: state.extensionValues
  };
  const fingerprint = JSON.stringify(input);
  const ref = useRef2({ fingerprint, input });
  if (ref.current.fingerprint !== fingerprint) {
    ref.current = { fingerprint, input };
  }
  return ref.current.input;
}
function validatorFailureDiagnostic(source, sourceLabel, error) {
  return {
    source,
    sourceLabel,
    code: "FS_EXTENSION_VALIDATION_FAILED",
    stage: "validation",
    message: error instanceof Error ? error.message : "Validation failed unexpectedly",
    severity: "error",
    blocksCommit: true
  };
}

// src/FormStudioContext.tsx
import { jsx } from "react/jsx-runtime";
function computeStateFingerprint(state) {
  return JSON.stringify({
    schema: state.schema,
    uiSchema: state.uiSchema,
    extensionValues: state.extensionValues
  });
}
var FormStudioContext = createContext(void 0);
function FormStudioProvider({
  extensions = [],
  initialExtensionValues = {},
  initialSchema = {},
  initialUiSchema = {},
  initialFormData = {},
  children
}) {
  const registryRef = useRef3(void 0);
  if (!registryRef.current) {
    registryRef.current = createFormStudioExtensionRegistry(extensions);
  } else {
    assertStableFormStudioExtensionRegistry(registryRef.current, extensions);
  }
  const registry = registryRef.current;
  const parseJSON = (data) => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }
    return data || {};
  };
  const [state, setState] = useState2(() => ({
    schema: parseJSON(initialSchema),
    uiSchema: parseJSON(initialUiSchema),
    extensionValues: createInitialExtensionValues(registry, initialExtensionValues),
    formData: initialFormData
  }));
  const setSchema = (newSchema) => {
    setState((prev) => ({ ...prev, schema: newSchema }));
  };
  const setUiSchema = (newUiSchema) => {
    setState((prev) => ({ ...prev, uiSchema: newUiSchema }));
  };
  const setFormData = (newFormData) => {
    setState((prev) => ({ ...prev, formData: newFormData }));
  };
  const updateState = (newState) => {
    setState((prev) => ({ ...prev, ...newState }));
  };
  const getExtensionValue = (extension) => {
    assertRegisteredFormStudioExtension(registry, extension);
    return getFormStudioExtensionValue(state, extension);
  };
  const setExtensionValue = (extension, value) => {
    setState((prev) => {
      const extensionValues = setRegisteredExtensionValue(
        registry,
        prev.extensionValues,
        extension,
        value
      );
      if (extensionValues[extension.id] === prev.extensionValues[extension.id]) {
        const previousHasValue = Object.prototype.hasOwnProperty.call(
          prev.extensionValues,
          extension.id
        );
        const nextHasValue = Object.prototype.hasOwnProperty.call(extensionValues, extension.id);
        if (previousHasValue === nextHasValue) return prev;
      }
      return { ...prev, extensionValues };
    });
  };
  const extensionDiagnostics = useDebouncedExtensionDiagnostics(registry, state);
  const validateForCommit = () => validateRegisteredExtensions(registry, state);
  return /* @__PURE__ */ jsx(
    FormStudioContext.Provider,
    {
      value: {
        state,
        extensions: registry.extensions,
        setSchema,
        setUiSchema,
        setFormData,
        updateState,
        getExtensionValue,
        setExtensionValue,
        extensionDiagnostics,
        validateForCommit
      },
      children
    }
  );
}
function useFormStudio() {
  const context = useContext(FormStudioContext);
  if (!context) {
    throw new Error("useFormStudio must be used within a FormStudioProvider");
  }
  return context;
}
function useFormStudioCommit() {
  const { state, extensionDiagnostics, validateForCommit } = useFormStudio();
  const blockingDiagnostics = useMemo2(
    () => extensionDiagnostics.filter((diagnostic) => diagnostic.blocksCommit),
    [extensionDiagnostics]
  );
  const [commitDiagnostics, setCommitDiagnostics] = useState2([]);
  useEffect2(() => {
    if (blockingDiagnostics.length === 0) setCommitDiagnostics([]);
  }, [blockingDiagnostics]);
  const attemptCommit = (commit) => {
    const result = validateForCommit();
    if (result.blocked) {
      setCommitDiagnostics(result.diagnostics.filter((diagnostic) => diagnostic.blocksCommit));
      return;
    }
    setCommitDiagnostics([]);
    void commit(state);
  };
  return { blockingDiagnostics, commitDiagnostics, attemptCommit };
}
function useOptionalFormStudio() {
  return useContext(FormStudioContext);
}

// src/useSyncedJsonDocument.ts
import { useState as useState3 } from "react";
function useSyncedJsonDocument(masterValue, onChange, defaultValue) {
  const [text, setText] = useState3(() => JSON.stringify(masterValue, null, 2));
  const [prevMaster, setPrevMaster] = useState3(masterValue);
  const [parseError, setParseError] = useState3(null);
  if (masterValue !== prevMaster) {
    setPrevMaster(masterValue);
    try {
      const parsedLocal = JSON.parse(text);
      if (JSON.stringify(parsedLocal) !== JSON.stringify(masterValue)) {
        setText(JSON.stringify(masterValue, null, 2));
        setParseError(null);
      }
    } catch {
      if (JSON.stringify(masterValue) !== JSON.stringify(defaultValue)) {
        setText(JSON.stringify(masterValue, null, 2));
        setParseError(null);
      }
    }
  }
  const handleChange = (value) => {
    const val = value ?? "";
    setText(val);
    try {
      const parsed = JSON.parse(val);
      onChange(parsed);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };
  return { text, parseError, handleChange };
}

export {
  __commonJS,
  __toESM,
  __publicField,
  getFormStudioExtensionValue,
  defineFormStudioExtension,
  DEBOUNCE_MS,
  createDebouncer,
  computeStateFingerprint,
  FormStudioProvider,
  useFormStudio,
  useFormStudioCommit,
  useOptionalFormStudio,
  useSyncedJsonDocument
};
//# sourceMappingURL=chunk-EG7H73O6.js.map