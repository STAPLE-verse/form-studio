export type LocalReferenceResolutionStatus =
  | "resolved"
  | "unresolved"
  | "unsupportedLocal"
  | "external"
  | "cycle"

export interface LocalReferenceResolution {
  status: LocalReferenceResolutionStatus
  reference: string
  schema: Record<string, any>
  uiSchema: Record<string, any>
  definitionName?: string
}

interface ResolveLocalDefinitionReferenceOptions {
  schema: Record<string, any>
  uiSchema?: Record<string, any>
  definitions?: Record<string, any>
  definitionUi?: Record<string, any>
}

function cloneJsonValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneJsonValue(item)) as T
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneJsonValue(child)])
    ) as T
  }
  return value
}

function decodePointerToken(token: string): string | undefined {
  if (/~(?:[^01]|$)/.test(token)) return undefined
  return token.replace(/~1/g, "/").replace(/~0/g, "~")
}

export function getLocalDefinitionName(reference: string): string | undefined {
  if (!reference.startsWith("#")) return undefined

  let pointer: string
  try {
    pointer = decodeURIComponent(reference.slice(1))
  } catch {
    return undefined
  }

  const path = pointer.split("/")
  if (path.length !== 3 || path[0] !== "" || path[1] !== "definitions") {
    return undefined
  }
  return decodePointerToken(path[2]!)
}

/**
 * Resolves the effective shape of a Form Studio-supported local definition reference.
 *
 * Resolution is for inspection only: callers retain the original `$ref`, and this
 * function never changes the supplied schema, UI schema, or definition maps.
 */
export function resolveLocalDefinitionReference({
  schema,
  uiSchema = {},
  definitions = {},
  definitionUi = {},
}: ResolveLocalDefinitionReferenceOptions): LocalReferenceResolution {
  const sourceSchema = cloneJsonValue(schema)
  const sourceUiSchema = cloneJsonValue(uiSchema)
  const reference = typeof schema.$ref === "string" ? schema.$ref : ""

  const unresolved = (
    status: Exclude<LocalReferenceResolutionStatus, "resolved">,
    currentReference = reference
  ): LocalReferenceResolution => ({
    status,
    reference: currentReference,
    schema: sourceSchema,
    uiSchema: sourceUiSchema,
  })

  if (!reference) return unresolved("unresolved")
  if (!reference.startsWith("#")) return unresolved("external")

  const resolve = (
    currentSchema: Record<string, any>,
    currentUiSchema: Record<string, any>,
    seenReferences: Set<string>
  ): LocalReferenceResolution => {
    const currentReference =
      typeof currentSchema.$ref === "string" ? currentSchema.$ref : ""
    if (!currentReference) {
      return {
        status: "resolved",
        reference,
        schema: cloneJsonValue(currentSchema),
        uiSchema: cloneJsonValue(currentUiSchema),
      }
    }
    if (!currentReference.startsWith("#")) {
      return unresolved("external", currentReference)
    }

    const definitionName = getLocalDefinitionName(currentReference)
    if (definitionName === undefined) {
      return unresolved("unsupportedLocal", currentReference)
    }
    if (seenReferences.has(currentReference)) {
      return unresolved("cycle", currentReference)
    }

    const definition = definitions[definitionName]
    if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
      return unresolved("unresolved", currentReference)
    }

    const nextSeenReferences = new Set(seenReferences)
    nextSeenReferences.add(currentReference)
    const definedUiSchema =
      definitionUi[definitionName] && typeof definitionUi[definitionName] === "object"
        ? definitionUi[definitionName]
        : {}

    let resolvedDefinition = cloneJsonValue(definition)
    let resolvedDefinitionUi = cloneJsonValue(definedUiSchema)
    if (typeof definition.$ref === "string") {
      const nestedResolution = resolve(definition, definedUiSchema, nextSeenReferences)
      if (nestedResolution.status !== "resolved") return nestedResolution
      resolvedDefinition = nestedResolution.schema
      resolvedDefinitionUi = nestedResolution.uiSchema
    }

    return {
      status: "resolved",
      reference,
      definitionName,
      schema: {
        ...resolvedDefinition,
        ...cloneJsonValue(currentSchema),
      },
      uiSchema: {
        ...resolvedDefinitionUi,
        ...cloneJsonValue(currentUiSchema),
      },
    }
  }

  return resolve(schema, uiSchema, new Set())
}
