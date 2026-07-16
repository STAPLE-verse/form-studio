# @staple-verse/form-studio

Visual JSON Schema form builder and preview studio for React. Shared between [MARKER](https://github.com/STAPLE-verse/MARKER) and [STAPLE](https://github.com/STAPLE-verse/STAPLE).

The `FormBuilder` component is based on [Ginkgo Bioworks' react-json-schema-form-builder](https://github.com/ginkgobioworks/react-json-schema-form-builder), with small bug fixes and a restyled UI using Tailwind CSS and daisyUI instead of Material UI.

## Install from GitHub

Add the package to your app's `package.json`:

```json
{
  "dependencies": {
    "@staple-verse/form-studio": "github:STAPLE-verse/form-studio#v0.1.0"
  }
}
```

Then run `npm install`. The `prepare` script builds the package automatically when installed from git.

To track the latest commit on `main`:

```json
"@staple-verse/form-studio": "github:STAPLE-verse/form-studio"
```

## Peer dependencies

Your app must provide:

- `react` and `react-dom` (^18 or ^19)
- `@rjsf/core`, `@rjsf/utils`, `@rjsf/validator-ajv8` (^5 or ^6)

## Tailwind / daisyUI

Components use Tailwind utility classes and daisyUI tokens. Configure your app to scan the installed package:

**Tailwind v4** (MARKER):

```css
@import "tailwindcss";
@source "../node_modules/@staple-verse/form-studio/dist";
```

**Tailwind v3** (STAPLE):

```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@staple-verse/form-studio/dist/**/*.{js,jsx}",
  ],
}
```

## Usage

```tsx
import { FormStudio } from "@staple-verse/form-studio"

export default function Page() {
  return (
    <FormStudio
      initialSchema={{}}
      initialUiSchema={{}}
      onSave={async (state) => {
        // persist state.schema, state.uiSchema, state.formData
      }}
    />
  )
}
```

### Exports

- `FormStudio` — full studio with provider, tabs, and save UI
- `FormStudioUI` — studio UI without the provider (use with `FormStudioProvider`)
- `FormBuilder` — visual schema builder only
- `FormPreview` — live RJSF preview
- `JsonEditor` — Monaco JSON editor
- `FormStudioProvider`, `useFormStudio` — shared state context
- All types from `./types`

## Development

```bash
npm install
npm run build      # emit dist/
npm run typecheck  # type-check without emitting
```

## License

MIT
