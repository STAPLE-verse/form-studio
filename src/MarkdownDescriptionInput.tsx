import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { markdownComponents, MARKDOWN_WRAPPER_CLASS } from "./markdownComponents"

export default function MarkdownDescriptionInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit")

  return (
    <div className="form-description-wrapper">
      <div className="form-desc-toolbar flex items-center gap-2 mb-3">
        <div className="join">
          <button
            type="button"
            className={`btn btn-md text-base join-item ${mode === "edit" ? "btn-primary" : ""}`}
            onClick={() => setMode("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className={`btn btn-md text-base join-item ${mode === "preview" ? "btn-primary" : ""}`}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
        <span className="text-base italic">
          Supports{" "}
          <a
            href="https://www.markdownguide.org/cheat-sheet/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Markdown
          </a>{" "}
          formatting.
        </span>
      </div>
      {mode === "edit" ? (
        <textarea
          value={value}
          placeholder="Description"
          rows={4}
          className="textarea text-base textarea-primary textarea-bordered w-full form-description border-2 focus:!outline-secondary focus:!outline-[3px] focus:!outline-offset-0 focus:![--input-color:var(--color-secondary)]"
          onChange={(ev) => onChange(ev.target.value)}
        />
      ) : (
        <div
          className={`markdown-display textarea text-base textarea-primary textarea-bordered w-full h-auto min-h-[6rem] ${MARKDOWN_WRAPPER_CLASS} border-2 focus:!outline-secondary focus:!outline-[3px] focus:!outline-offset-0 focus:![--input-color:var(--color-secondary)]`}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
              {value}
            </ReactMarkdown>
          ) : (
            <span className="text-base-content/90 italic">Nothing to preview yet…</span>
          )}
        </div>
      )}
    </div>
  )
}
