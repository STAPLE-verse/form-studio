import { useState } from "react"

export interface UseSyncedJsonDocumentResult {
  /** Raw editor text — may be temporarily unparsable while the user edits. */
  text: string
  /** Message from the last failed `JSON.parse`, or `null` while text is valid JSON. */
  parseError: string | null
  /** Wire directly to the editor's onChange. */
  handleChange: (value: string | undefined) => void
}

/**
 * Local-text/master-state synchronization for one JSON Editor document:
 * keeps a raw text buffer that can be temporarily invalid JSON while the
 * user edits, mirrors successfully parsed edits into the master value via
 * `onChange`, and reflects master-state changes that originate elsewhere
 * (e.g. the Visual Builder) back into the text without clobbering an
 * in-progress edit that already matches.
 *
 * `defaultValue` is compared (by JSON value, not reference) against an
 * externally changed master value only while the local text is unparsable;
 * it exists so a transient re-render that produces a fresh-but-equivalent
 * "nothing meaningful here yet" object (e.g. `{}`) doesn't stomp the user's
 * in-progress typing. It is not a fallback ever written into the document.
 *
 * Extracted so Data Schema, UI Schema, and Semantics (§6) share one
 * implementation instead of three hand-copied copies of this logic.
 */
export function useSyncedJsonDocument<T>(
  masterValue: T,
  onChange: (parsed: T) => void,
  defaultValue: T
): UseSyncedJsonDocumentResult {
  const [text, setText] = useState(() => JSON.stringify(masterValue, null, 2))
  const [prevMaster, setPrevMaster] = useState(masterValue)
  const [parseError, setParseError] = useState<string | null>(null)

  // Render-phase state update: reconcile local text with an externally
  // changed master value before this render commits.
  if (masterValue !== prevMaster) {
    setPrevMaster(masterValue)
    try {
      const parsedLocal = JSON.parse(text)
      if (JSON.stringify(parsedLocal) !== JSON.stringify(masterValue)) {
        setText(JSON.stringify(masterValue, null, 2))
        setParseError(null)
      }
    } catch {
      if (JSON.stringify(masterValue) !== JSON.stringify(defaultValue)) {
        setText(JSON.stringify(masterValue, null, 2))
        setParseError(null)
      }
    }
  }

  const handleChange = (value: string | undefined) => {
    const val = value ?? ""
    setText(val)
    try {
      const parsed = JSON.parse(val)
      onChange(parsed)
      setParseError(null)
    } catch (e) {
      // Keep the raw text and the last-committed master value untouched;
      // the caller must not treat this as a synchronized, saveable state.
      setParseError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  return { text, parseError, handleChange }
}
