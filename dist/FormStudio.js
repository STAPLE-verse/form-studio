"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { FormStudioProvider, useFormStudio } from "./FormStudioContext";
import FormBuilder from "./FormBuilder";
import FormPreview from "./FormPreview";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/20/solid";
// Lazy-load the JSON editor to prevent loading Monaco until the user actually clicks the tab
const JsonEditor = lazy(() => import("./JsonEditor"));
function JsonEditorFallback() {
    return (_jsx("div", { className: "flex items-center justify-center h-full w-full bg-base-200 rounded-lg border border-base-300", children: _jsx("span", { className: "loading loading-spinner text-primary loading-lg" }) }));
}
export function FormStudioUI({ onAutoSave, onSave, onSaveNewVersion, onCancel, mods, saveStatus, }) {
    const { state, setSchema, setUiSchema } = useFormStudio();
    const [activeTab, setActiveTab] = useState("builder");
    // Track if the JSON tab has ever been visited so we only load the heavy editor once,
    // but keep it mounted in the background to preserve undo history and unsaved text.
    const [hasVisitedJson, setHasVisitedJson] = useState(false);
    if (activeTab === "json" && !hasVisitedJson) {
        setHasVisitedJson(true);
    }
    const isInitialMount = useRef(true);
    const lastBufferedStateRef = useRef("");
    // Debounced recovery-buffer write (silent — no status pill updates)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            lastBufferedStateRef.current = JSON.stringify({ schema: state.schema, uiSchema: state.uiSchema });
            return;
        }
        if (!onAutoSave)
            return;
        const currentStateStr = JSON.stringify({ schema: state.schema, uiSchema: state.uiSchema });
        if (currentStateStr === lastBufferedStateRef.current) {
            return;
        }
        const handler = setTimeout(async () => {
            try {
                await onAutoSave(state);
                lastBufferedStateRef.current = currentStateStr;
            }
            catch (e) {
                console.error("Recovery buffer write failed", e);
            }
        }, 1500);
        return () => clearTimeout(handler);
    }, [state.schema, state.uiSchema, onAutoSave, state]);
    return (_jsxs("div", { className: "flex flex-col w-full h-full animate-in fade-in duration-300 bg-base-100 border border-base-200 rounded-xl shadow-sm overflow-hidden", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-end border-b border-base-200 px-4 pt-4 bg-base-200 gap-4", children: [_jsxs("div", { className: "tabs tabs-bordered w-full md:w-auto", children: [_jsx("button", { className: `tab tab-lg transition-all font-semibold ${activeTab === "builder" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`, onClick: () => setActiveTab("builder"), children: "Visual Builder" }), _jsx("button", { className: `tab tab-lg transition-all font-semibold ${activeTab === "json" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`, onClick: () => setActiveTab("json"), children: "JSON Editor" }), _jsx("button", { className: `tab tab-lg transition-all font-semibold ${activeTab === "preview" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`, onClick: () => setActiveTab("preview"), children: "Live Preview" })] }), _jsxs("div", { className: "flex items-center gap-3 pb-3", children: [saveStatus !== undefined && (_jsxs("div", { className: "flex items-center mr-1 bg-base-100 px-3 py-1.5 rounded-full border border-base-300 shadow-sm min-w-[160px] justify-center transition-all", title: saveStatus === "unsaved"
                                    ? "Backed up in browser · not yet saved to your collection"
                                    : undefined, children: [saveStatus === "synced" && (_jsxs("span", { className: "text-xs font-medium text-base-content/60 flex items-center gap-1.5", children: [_jsx(CheckCircleIcon, { className: "w-4 h-4 text-success/80" }), "All changes saved"] })), saveStatus === "saving" && (_jsxs("span", { className: "text-xs font-medium text-base-content/70 flex items-center gap-1.5", children: [_jsx("span", { className: "loading loading-spinner loading-xs text-primary" }), "Saving\u2026"] })), saveStatus === "unsaved" && (_jsxs("span", { className: "text-xs font-medium text-warning flex items-center gap-1.5", children: [_jsx(ExclamationCircleIcon, { className: "w-4 h-4" }), "Unsaved changes"] }))] })), onCancel && (_jsx("button", { className: "btn btn-secondary btn-outline transition-all ml-2", onClick: onCancel, children: "Cancel" })), onSave && (_jsx("div", { className: "tooltip tooltip-bottom", "data-tip": "Overwrites the current version of this schema.", children: _jsx("button", { className: "btn btn-ghost border border-base-300 hover:border-base-content/30 shadow-sm transition-all", onClick: () => onSave(state), children: "Save Changes" }) })), onSaveNewVersion && (_jsx("div", { className: "tooltip tooltip-bottom tooltip-primary", "data-tip": "Preserves current history and saves edits as a brand new version.", children: _jsx("button", { className: "btn btn-primary shadow-sm hover:shadow-md transition-all", onClick: () => onSaveNewVersion(state), children: "Save as New Version" }) }))] })] }), _jsxs("div", { className: "flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden p-6", children: [_jsx("div", { className: activeTab === "builder" ? "block" : "hidden", children: _jsx(FormBuilder, { schema: typeof state.schema === "string" ? state.schema : JSON.stringify(state.schema), uischema: typeof state.uiSchema === "string" ? state.uiSchema : JSON.stringify(state.uiSchema), onChange: (newSchemaStr, newUiSchemaStr) => {
                                try {
                                    setSchema(JSON.parse(newSchemaStr));
                                    setUiSchema(JSON.parse(newUiSchemaStr));
                                }
                                catch (e) {
                                    console.error("Failed to parse schema from FormBuilder", e);
                                }
                            }, mods: mods }) }), _jsx("div", { className: activeTab === "json" ? "block h-full" : "hidden", children: hasVisitedJson && (_jsx(Suspense, { fallback: _jsx(JsonEditorFallback, {}), children: _jsx(JsonEditor, {}) })) }), _jsx("div", { className: activeTab === "preview" ? "block" : "hidden", children: _jsx(FormPreview, {}) })] })] }));
}
export default function FormStudio(props) {
    return (_jsx(FormStudioProvider, { initialSchema: props.initialSchema, initialUiSchema: props.initialUiSchema, children: _jsx(FormStudioUI, { onAutoSave: props.onAutoSave, onSave: props.onSave, onSaveNewVersion: props.onSaveNewVersion, onCancel: props.onCancel, mods: props.mods, saveStatus: props.saveStatus }) }));
}
