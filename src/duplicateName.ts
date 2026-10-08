// "age" -> "age_copy", then "age_copy2", "age_copy3"... skipping any name already in use.
export function nextCopyName(name: string, existingNames: string[]): string {
  const taken = new Set(existingNames)
  const base = `${name}_copy`
  if (!taken.has(base)) return base
  let counter = 2
  while (taken.has(`${base}${counter}`)) counter += 1
  return `${base}${counter}`
}
