import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
export default function MarkdownDescriptionInput({ value, onChange, }) {
    const [mode, setMode] = useState("edit");
    return (_jsxs("div", { className: "form-description-wrapper", children: [_jsxs("div", { className: "form-desc-toolbar flex items-center gap-2 mb-3", children: [_jsxs("div", { className: "join", children: [_jsx("button", { type: "button", className: `btn btn-sm join-item ${mode === "edit" ? "btn-primary" : "btn-ghost"}`, onClick: () => setMode("edit"), children: "Edit" }), _jsx("button", { type: "button", className: `btn btn-sm join-item ${mode === "preview" ? "btn-primary" : "btn-ghost"}`, onClick: () => setMode("preview"), children: "Preview" })] }), _jsx("span", { className: "text-sm opacity-60 italic", children: "Supports Markdown" })] }), mode === "edit" ? (_jsx("textarea", { value: value, placeholder: "Description", rows: 4, className: "textarea textarea-primary textarea-bordered w-full form-description", onChange: (ev) => onChange(ev.target.value) })) : (_jsx("div", { className: "markdown-display prose prose-sm max-w-none prose-p:m-0 dark:prose-invert textarea textarea-primary textarea-bordered w-full h-auto min-h-[6rem]", children: value ? (_jsx(ReactMarkdown, { remarkPlugins: [remarkGfm, remarkBreaks], children: value })) : (_jsx("span", { className: "text-base-content/40 italic", children: "Nothing to preview yet\u2026" })) }))] }));
}
