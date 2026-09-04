import type { FormStudioExtension } from "./types"

export type AnyFormStudioExtension = FormStudioExtension<any>

export interface FormStudioExtensionRegistry {
  readonly extensions: readonly AnyFormStudioExtension[]
  readonly ids: readonly string[]
  readonly byId: ReadonlyMap<string, AnyFormStudioExtension>
}

export function createFormStudioExtensionRegistry(
  extensions: readonly AnyFormStudioExtension[]
): FormStudioExtensionRegistry {
  const registered = [...extensions]
  const byId = new Map<string, AnyFormStudioExtension>()

  for (const extension of registered) {
    if (extension.id.trim().length === 0) {
      throw new Error("Form Studio extension IDs must be non-empty strings.")
    }
    if (byId.has(extension.id)) {
      throw new Error(`Duplicate Form Studio extension ID: ${extension.id}`)
    }
    byId.set(extension.id, extension)
  }

  return {
    extensions: Object.freeze(registered),
    ids: Object.freeze(registered.map((extension) => extension.id)),
    byId,
  }
}

export function assertStableFormStudioExtensionRegistry(
  registry: FormStudioExtensionRegistry,
  nextExtensions: readonly AnyFormStudioExtension[]
): void {
  const changed =
    registry.extensions.length !== nextExtensions.length ||
    registry.extensions.some(
      (extension, index) =>
        extension !== nextExtensions[index] || extension.id !== registry.ids[index]
    )

  if (changed) {
    throw new Error(
      "FormStudioProvider extensions must remain stable for the provider lifetime. Remount the provider to change registration."
    )
  }
}

export function assertRegisteredFormStudioExtension(
  registry: FormStudioExtensionRegistry,
  extension: AnyFormStudioExtension
): void {
  if (registry.byId.get(extension.id) !== extension) {
    throw new Error(
      `Form Studio extension "${extension.id}" is not registered with this provider.`
    )
  }
}

export function createInitialExtensionValues(
  registry: FormStudioExtensionRegistry,
  initialValues: Readonly<Record<string, unknown>>
): Record<string, unknown> {
  for (const id of Object.keys(initialValues)) {
    if (!registry.byId.has(id)) {
      throw new Error(`Initial value supplied for unregistered Form Studio extension: ${id}`)
    }
  }

  return orderExtensionValues(registry, initialValues)
}

export function setRegisteredExtensionValue(
  registry: FormStudioExtensionRegistry,
  currentValues: Readonly<Record<string, unknown>>,
  extension: AnyFormStudioExtension,
  value: unknown
): Record<string, unknown> {
  assertRegisteredFormStudioExtension(registry, extension)

  const nextValues = { ...currentValues }
  if (value === undefined) {
    delete nextValues[extension.id]
  } else {
    nextValues[extension.id] = value
  }

  return orderExtensionValues(registry, nextValues)
}

function orderExtensionValues(
  registry: FormStudioExtensionRegistry,
  values: Readonly<Record<string, unknown>>
): Record<string, unknown> {
  const ordered: Record<string, unknown> = {}
  for (const extension of registry.extensions) {
    const value = values[extension.id]
    if (value !== undefined) {
      ordered[extension.id] = value
    }
  }
  return ordered
}
