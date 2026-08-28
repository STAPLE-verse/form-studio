# @staple-verse/form-studio

Visual JSON Schema form builder and preview studio for React. Shared between [MARKER](https://github.com/STAPLE-verse/MARKER) and [STAPLE](https://github.com/STAPLE-verse/STAPLE).

The `FormBuilder` component is based on [Ginkgo Bioworks' react-json-schema-form-builder](https://github.com/ginkgobioworks/react-json-schema-form-builder), with small bug fixes and a restyled UI using Tailwind CSS and daisyUI instead of Material UI.

## Install from GitHub

Add the package to your app's `package.json`:

```json
{
  "dependencies": {
    "@staple-verse/form-studio": "github:STAPLE-verse/form-studio#v0.2.0-rc.1"
  }
}
```

Then run `npm install`. The built `dist/` output is committed to this repo, so no build step runs at install time — installing straight from git works even with npm's script-blocking defaults (npm 12+).

To track the latest commit on `main`:

```json
"@staple-verse/form-studio": "github:STAPLE-verse/form-studio"
```

> **Note:** npm 12+ blocks git dependencies by default. Consuming apps need `--allow-git` (or `allow-git=true` in `.npmrc`) for `npm install` to resolve this package.

## Peer dependencies

Your app must provide:

- `react` and `react-dom` (^18 or ^19)
- `tailwindcss` (^3.3.3 or ^4)
- `daisyui` (^4.6.1 or ^5)

Form Studio bundles its matching RJSF core, utilities, and validator so its behavior does not
depend on which RJSF version the consuming application uses.

## Tailwind / daisyUI

Form Studio ships component class names rather than a compiled stylesheet, so the consuming
app owns CSS generation, its daisyUI theme, and any theme customization.

Tailwind CSS 4 with daisyUI 5 is the native reference environment. Configure the app's global
stylesheet to load Tailwind and daisyUI, and to scan the installed package:

```css
@import "tailwindcss";
@source "../node_modules/@staple-verse/form-studio/dist";
@plugin "daisyui";
```

Adjust the relative `@source` path when the global stylesheet is not directly below the app root.

Tailwind CSS 3 with daisyUI 4 is supported as a legacy host environment. Configure Tailwind to
scan the package:

```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@staple-verse/form-studio/dist/**/*.{js,jsx}",
  ],
}
```

daisyUI 4 and 5 differ in some component layout and control styling. Legacy hosts must provide
scoped compatibility rules for those differences. Form Studio's outer UI element has a stable
`form-studio` class for that purpose and for other host customization. The package's internal
class names are not part of its public styling API.

## Usage

```tsx
import { FormStudio } from "@staple-verse/form-studio"

export default function Page() {
  return (
    <FormStudio
      initialSchema={{}}
      initialUiSchema={{}}
      onSave={async (state) => {
        // persist state.schema, state.uiSchema, state.extensionValues, state.formData
      }}
    />
  )
}
```

For rendering a schema without the studio state provider, use the canonical context-free
renderer. Form Studio owns the matching RJSF, AJV validator, and DaisyUI theme internally:

```tsx
import { JsonSchemaForm } from "@staple-verse/form-studio"

export default function MetadataForm({ schema, uiSchema, formData, save }) {
  return (
    <JsonSchemaForm
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      onSubmit={({ formData }) => save(formData)}
    />
  )
}
```

### Provider-scoped extension state

Extension registration is fixed for a provider's lifetime. Define descriptors
and the ordered registration array outside render, then use the typed context
helpers or descriptor accessor for values:

```tsx
import {
  FormStudioProvider,
  defineFormStudioExtension,
  useFormStudio,
} from "@staple-verse/form-studio"

const notesExtension = defineFormStudioExtension<{ note: string }>({
  id: "example.notes",
  label: "Notes",
  validate: () => [],
})
const extensions = [notesExtension]

function NotesControl() {
  const { state, setExtensionValue } = useFormStudio()
  const value = notesExtension.getValue(state)

  return (
    <input
      value={value?.note ?? ""}
      onChange={(event) => setExtensionValue(notesExtension, { note: event.target.value })}
    />
  )
}

export function Example() {
  return (
    <FormStudioProvider
      extensions={extensions}
      initialExtensionValues={{ [notesExtension.id]: { note: "Initial" } }}
    >
      <NotesControl />
    </FormStudioProvider>
  )
}
```

Changing registration requires remounting the provider. `undefined` removes
an extension value; it is distinct from an invalid or empty object. Registered
slot components contribute form controls, field controls, and JSON documents
through the ordinary `FormBuilder` and `JsonEditor` composition. The provider
exposes debounced `extensionDiagnostics` for live feedback and a synchronous
`validateForCommit()` result for persistence guards.

Semantic V1 is implemented as the first registered extension under
`src/semantic-v1`. It exports `semanticV1Extension`, `getSemanticV1Value`, and
`useSemanticV1Value` through the independently built `./semantic-v1` package
subpath. Permanent packaging checks keep the base dependency graph free of the
marker runtime and exercise packed React 18, React 19, and STAPLE consumers.

The Semantic-aware turnkey composition uses the same generic lifecycle:

```tsx
import { FormStudio } from "@staple-verse/form-studio"
import { semanticV1Extension } from "@staple-verse/form-studio/semantic-v1"

const extensions = [semanticV1Extension]

<FormStudio
  extensions={extensions}
  initialExtensionValues={{ [semanticV1Extension.id]: semantics }}
  onDiagnosticsChange={(diagnostics) => {
    // Debounced diagnostics from every registered extension.
  }}
  onSave={async (state) => {
    const semantics = semanticV1Extension.getValue(state)
    // Persist only after FormStudio's synchronous commit guard succeeds.
  }}
/>
```

The old `initialSemantics`, `state.semantics`, `setSemantics`, direct
`FormBuilder` semantic props, and `onSemanticValidationChange` APIs are removed
for the coordinated breaking prerelease; they are not maintained as aliases.

### Exports

- `FormStudio` — full generic studio; accepts `extensions` and `initialExtensionValues`
- `FormStudioUI` — provider-connected generic studio UI using `validateForCommit()`
- `FormBuilder` — visual schema builder only
- `FormPreview` — live RJSF preview
- `JsonSchemaForm` — canonical context-free JSON Schema renderer and validator
- `JsonEditor` — Monaco JSON editor
- `FormStudioProvider`, `useFormStudio` — shared state context
- `FormStudioState`, `FormStudioProviderProps` — shared integration types
- `defineFormStudioExtension`, `getFormStudioExtensionValue` — typed extension helpers
- `FormStudioExtension`, `FormStudioDiagnostic` — generic extension contracts
- `FormStudioDiagnostics` — grouped diagnostics for registered extensions
- `FormExtensionControlProps`, `FieldExtensionControlProps`, `ExtensionDocumentProps` — slot props
- `JsonSchemaFormProps`, `JsonSchemaFormEvent`, `JsonSchemaFormValidationError` — renderer API types
- All types from `./types`

## Development

```bash
npm install
npm run build      # bundle the ESM library and declarations into dist/
npm run typecheck  # type-check without emitting
npm test           # capability, registry/integration, and package-boundary checks
```

The build creates independent base and `semantic-v1` ESM entry points with shared internal
chunks. Runtime and peer dependencies remain external, so consuming applications provide and
bundle them normally. Both public entries include a `"use client"` directive for compatibility
with Next.js App Router.

Release verification also includes `npm run test:packed-consumers`,
`npm run test:staple:packed`, and `npm run test:clean-install`.

`dist/` is committed, so after making changes, run `npm run build` and commit the updated
output alongside your source changes. CI fails the build if `dist/` is out of date.

## License

MIT
