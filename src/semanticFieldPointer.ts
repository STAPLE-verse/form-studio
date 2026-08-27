/**
 * RFC 6901 field-pointer construction rooted at `form.schema` (§5.3). This
 * mirrors the escaping and `properties`-segment shape the runtime's
 * `analyzeSemanticV1Bindings`/`validateSemanticV1` resolver expects, so a
 * pointer built here is guaranteed to resolve the same way the runtime
 * resolves it — there is exactly one field-pointer algorithm, not a second
 * Form Studio-local approximation (§5.3).
 *
 * Only object nesting is represented (`/properties/<name>` chains). Form
 * Studio's Visual Builder never recurses into array-of-object items (those
 * render as a single read-only compatibility card for the array field
 * itself), so an `items` segment is never needed here.
 */
export function escapeJsonPointerToken(token: string): string {
  return token.replace(/~/g, "~0").replace(/\//g, "~1")
}

/** `parentFieldPointer` is `""` for a top-level field directly under `form.schema`. */
export function buildChildFieldPointer(parentFieldPointer: string, name: string): string {
  return `${parentFieldPointer}/properties/${escapeJsonPointerToken(name)}`
}
