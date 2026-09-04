/**
 * RFC 6901 field-pointer construction rooted at the form's JSON Schema.
 * Builder traversal owns this stable, instance-bearing location; extensions
 * consume it without independently rediscovering the visual field path.
 *
 * Only object nesting is represented (`/properties/<name>` chains). Form
 * Studio's Visual Builder never recurses into array-of-object items because
 * those render as one read-only compatibility card for the array field.
 */
export function escapeJsonPointerToken(token: string): string {
  return token.replace(/~/g, "~0").replace(/\//g, "~1")
}

/** `parentFieldPointer` is `""` for a top-level field under the root schema. */
export function buildChildFieldPointer(parentFieldPointer: string, name: string): string {
  return `${parentFieldPointer}/properties/${escapeJsonPointerToken(name)}`
}
