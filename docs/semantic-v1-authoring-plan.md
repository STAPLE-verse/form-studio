# Semantic V1 authoring in Form Studio

> **Status:** Implementation plan for the MARKER Template V1 release candidate
>
> **Normative dependency:** Semantic V1 is defined by the exact pinned
> `marker-template-spec` release candidate. This document defines Form Studio
> behavior and does not add requirements to the portable specification.

## 1. Goal

Form Studio must be able to create, inspect, edit, validate, and preserve the
optional Semantic V1 component that accompanies a Core V1 form.

Semantic authoring should extend the existing workflow rather than introduce a
separate metadata application:

- field bindings are edited contextually in the Visual Builder;
- the complete semantic component is available as a third document in the
  existing JSON Editor; and
- the existing Live Preview continues to render `form.schema` and
  `form.uiSchema` without treating semantic annotations as form questions.

The first release is integrated against an exact V1 release candidate and is
itself published as a prerelease. It is not evidence that final V1 is ready for
production.

## 2. Ownership boundary

Form Studio owns editing of these template components:

```text
form.schema
form.uiSchema
semantics?
```

It does not own or edit:

- `conformsTo`;
- template `familyId`, `versionId`, or lifecycle state;
- contributors, publisher, license, or publication metadata;
- application database persistence or authorization;
- assembly of the complete MARKER template package; or
- projection and export of collected metadata responses as JSON-LD.

MARKER or another host application assembles the complete package. The host
adds or removes the Semantic V1 profile URI according to whether a valid
semantic component is present.

Semantic bindings remain a sibling of `form`; they must never be inserted into
`form.schema.properties` or represented as hidden researcher-facing fields.

## 3. Current state

Form Studio currently stores and edits `schema`, `uiSchema`, and preview
`formData`. Save and autosave callbacks return those values. The JSON Editor has
Data Schema and UI Schema documents, and application compatibility diagnostics
come from Form Studio's rendering and authoring logic.

The integration must remain backward-compatible for Core-only consumers:

- `semantics` is optional;
- omitting `initialSemantics` starts with a Core-only form while keeping the
  semantic authoring controls available; and
- existing schema/UI-schema editing and rendering behavior remains unchanged.

Absence is distinct from an empty semantic object. Form Studio must not emit an
invalid `{ "bindings": [] }` merely because a user opened the semantic controls.
The first valid root class or field binding creates the component. Removing its
root class and all bindings returns `semantics` to `undefined`.

## 4. Public state and component API

### 4.1 Install the release-candidate runtime

The `marker-template-spec` repository is public and tagged
[`v1.0.0-rc.1`](https://github.com/STAPLE-verse/marker-template-spec/releases/tag/v1.0.0-rc.1).
The specification itself is not an npm package. Form Studio installs only its
optional TypeScript implementation,
`@staple-verse/marker-template-runtime`, from the immutable tarball attached to
that GitHub release.

The installation mechanism below is illustrated against `rc.1`, but Form
Studio's actual pin must be the first candidate whose runtime exports the
analysis API required by §5.3 — `rc.2` per §10, not `rc.1`. Repeat the same
mechanism (release URL, `npm install`, committed lockfile, `npm ci`
verification) against the `rc.2` tag and tarball once it exists; do not pin
`rc.1` as an interim step and upgrade later.

Pin the release asset directly in Form Studio's `package.json`:

```json
{
  "dependencies": {
    "@staple-verse/marker-template-runtime": "https://github.com/STAPLE-verse/marker-template-spec/releases/download/v1.0.0-rc.1/staple-verse-marker-template-runtime-1.0.0-rc.1.tgz"
  }
}
```

Run `npm install` and commit both `package.json` and `package-lock.json`. The
runtime reports package version `1.0.0-rc.1`; the lockfile records the resolved
asset and integrity hash. CI and clean consumer installations therefore use the
same bytes without requiring npm-registry publication or GitHub credentials.

STAPLE already uses this exact installation pattern in commit
[`ee68689a`](https://github.com/STAPLE-verse/STAPLE/commit/ee68689af8fbc118b7dadaa05908ba3fce66d0bc).
Form Studio should mirror it:

1. add the release URL under `dependencies`, not only `devDependencies`;
2. run `npm install` so npm resolves the tarball and its runtime dependencies;
3. commit the resulting lockfile; and
4. verify the installation from a clean checkout with `npm ci`, followed by
   Form Studio's typecheck, tests, and build.

For `rc.1` (illustrative only — the actual pin is `rc.2`, with matching
version/URL/integrity values for that tag), npm should create a lockfile
entry equivalent to:

```json
{
  "node_modules/@staple-verse/marker-template-runtime": {
    "version": "1.0.0-rc.1",
    "resolved": "https://github.com/STAPLE-verse/marker-template-spec/releases/download/v1.0.0-rc.1/staple-verse-marker-template-runtime-1.0.0-rc.1.tgz",
    "integrity": "sha512-GJpA9n+Bf4OYd1/I/f/7PVrhaWabN6lv41IvzZ02ateQGEftyYb+dFyXMWEr0EHdWym9kEZh3GxG+Cf+aNo/YA==",
    "dependencies": {
      "ajv": "^8.17.1",
      "ajv-formats": "^3.0.1"
    },
    "engines": {
      "node": ">=20"
    }
  }
}
```

The surrounding lockfile may deduplicate the transitive dependencies
differently from STAPLE because the applications have different dependency
graphs. The runtime version, resolved URL, and integrity value must nevertheless
match. An integrity mismatch is a release-artifact problem and must not be
accepted by regenerating the lockfile against replaced bytes.

Do not install the repository through a sibling `file:` path, workspace link,
untracked `node_modules` symlink, moving branch, or untagged commit. Local
development may temporarily use those mechanisms while changing the runtime,
but they must be replaced by the release asset before committing a Form Studio
integration release.

The release asset is immutable. A runtime or contract change produces a new
candidate such as `1.0.0-rc.2` with a new tag and tarball; the existing `rc.1`
asset must not be replaced in place.

**`rc.1` is confirmed insufficient for this integration and must not be treated
as a placeholder dependency.** `rc.1`'s TypeScript implementation only exports
`validateSemanticV1` (whole-document, pass/fail-oriented). The per-binding
field-pointer resolution and effective-type inference that §5.3 requires
already exist internally (`analyzeSemanticV1Bindings` in the runtime's
`semantic.ts`) but are not exported from its public entry point. This is not a
hypothetical fallback path: cutting `rc.2` with `analyzeSemanticV1Bindings` (and
its result type) exported is a required, named prerequisite, not step 1's
conditional clause. See §5.3 and §10 for the concrete API shape and sequencing.

Form Studio imports runtime APIs normally after installation:

```ts
import {
  validateSemanticV1,
  analyzeSemanticV1Bindings,
  type ConformanceDiagnostic,
  type SemanticV1Component,
  type SemanticBindingAnalysis,
} from "@staple-verse/marker-template-runtime"
```

### 4.2 Extend the Form Studio API

Use the Semantic V1 and diagnostic types exported by the pinned TypeScript
runtime rather than maintaining Form Studio-specific copies.

The public state becomes conceptually:

```ts
interface FormStudioState {
  schema: object
  uiSchema: object
  semantics?: SemanticV1Component
  formData: object
}
```

Add:

- `initialSemantics?: SemanticV1Component | string` to `FormStudio` and
  `FormStudioProvider`;
- `setSemantics` to the context;
- `semantics` to `updateState`, save, save-new-version, and autosave values;
- semantic changes to dirty-state comparison and panel error-boundary reset
  keys; and
- an optional validation-status callback if a host needs to reflect semantic
  validity outside Form Studio.

All public types and generated declarations must be updated together. A host
that does not supply semantics must continue to compile and behave as before.

This is a moderately invasive change to `FormStudioContext` and `FormStudio`,
not a purely additive one. Today, dirty-state, panel-reset keys, and the
autosave debounce are all derived from `JSON.stringify`-based comparison of
only `schema` and `uiSchema`; each of those comparison sites needs a third
term rather than a parallel, easily-forgotten copy. The JSON Editor's
local-text/master-state sync logic (§6) is similarly duplicated per document
today; adding semantics as a third document should reuse one sync helper
instead of adding a third hand-copied instance of it.

## 5. Visual Builder integration

Do not add a dedicated Semantics tab. Bindings describe form fields, so their
controls belong beside those fields.

### 5.1 Form-level semantic settings

Extend the form-level settings with:

- controls that are available for both Core-only and Semantic V1 forms;
- the optional root class IRI.

Setting a valid root class creates Semantic V1 when it is absent. A separate
**Remove semantic component** action may remove a non-empty component, but it is
destructive and requires explicit confirmation. Opening the settings without
adding a root class or binding must not create an invalid component.

### 5.2 Field-level semantic settings

Each instance-bearing field receives a **Semantic binding** section in its
additional settings. It supports:

- adding the first binding to a Core-only form and removing an existing field
  binding;
- the field pointer, displayed as the stable address of the selected field;
- one absolute predicate IRI;
- value kind: `literal`, `iri`, or `node`; and
- the properties applicable to the selected value kind.

Kind-specific controls are:

| Value kind | Controls |
| --- | --- |
| `literal` | Optional datatype IRI or fixed language tag, never both |
| `iri` | Direct IRI behavior or exact local value-to-IRI mappings |
| `node` | Optional class IRI and explicit parent-node relationship when nested |

Nested bindings expose eligible `node` bindings as parent choices. The UI may
recommend the nearest valid parent but must persist an explicit
`parentNodePointer`; it must not rely on an inferred relationship that is absent
from the saved component.

"Nearest eligible parent" is itself a runtime-shaped query, not free-form UI
logic. The runtime's node-ownership check computes nearest-containing-node
only as an internal side effect of whole-component validation; it does not
expose "the nearest eligible node binding for pointer X" as an incremental,
per-keystroke query. Form Studio needs that as a standalone function (built
from the same `analyzeSemanticV1Bindings` primitives named in §5.3), not a
second, UI-local reimplementation of ancestor-pointer containment.

Bindings must also be editable for Core fields whose schema structure Form
Studio preserves as read-only. Inability to visually change an object array,
composition, or referenced schema does not by itself prevent attaching a valid
semantic binding to its instance-bearing field.

### 5.3 Field discovery

The field selector and binding controls must use Core field pointers rooted at
`form.schema`, including RFC 6901 escaping. They must support deterministic
traversal through Core-conformant local `$ref` values while continuing to show
the instance-bearing pointer rather than a pointer into `definitions`.

Do not create a second, subtly different field-resolution algorithm in Form
Studio. This is a concrete, present risk, not a stylistic preference: Form
Studio's existing `localReferences.ts` already implements local-`$ref`
resolution for the Visual Builder's read-only-field UX, and that algorithm
does not expand `allOf`/`anyOf`/`oneOf`/`dependencies` the way the runtime's
resolver does. Reusing that existing helper for semantic field pointers would
silently diverge from the runtime's definition of "resolved."

Prefer a documented analysis/field-resolution API from the shared runtime.
`rc.1` does not expose the required analysis (see §4.1); add the non-normative
`analyzeSemanticV1Bindings` export (and its result type) to the runtime and
consume it directly, rather than building the selector or the field-pointer
resolver against internal Form Studio logic.

**Found during step 7:** the same risk exists on the *construction* side, not
just resolution. The runtime's own pointer-escaping primitive
(`escapePointerToken`/`childPointer`) is unexported and independently
duplicated three times inside the runtime itself; Form Studio ended up adding
a fourth copy to build field pointers while walking the Visual Builder's
rendering tree. See §13 for the concrete evidence and the requested runtime
export.

## 6. JSON Editor integration

Extend the existing JSON Editor with a third **Semantics** document beside Data
Schema and UI Schema. The document edits only the Semantic V1 component, not a
complete template package.

The editor must:

- distinguish an absent component from an existing component and offer a clear
  way to begin authoring when it is absent;
- preserve the user's raw text while it is temporarily invalid JSON;
- show JSON parsing errors explicitly;
- run Semantic V1 validation after successful parsing;
- show stable diagnostic codes and pointers; and
- prevent invalid raw text from being mistaken for a successfully saved state.

The Visual Builder and JSON Editor share one parsed semantic state. Valid edits
in either representation update the other without losing bindings or changing
array order.

The existing JSON Editor implements local-text/master-state synchronization
(raw text vs. parsed state, external-change detection, silent-parse-failure
handling) separately for the Data Schema and UI Schema documents. Adding
Semantics as a third document should factor that sync logic into one reusable
helper rather than adding a third copy of it.

## 7. Validation and diagnostics

Form Studio consumes the exact pinned
`@staple-verse/marker-template-runtime` candidate. It must not copy the
normative schema or reimplement Semantic V1 validation locally.

Live validation runs when either `schema` or `semantics` changes and covers:

- component JSON Schema;
- absolute IRIs;
- field-pointer resolution through local `$ref`;
- value-kind compatibility with the effective Core field type;
- datatype and language compatibility;
- exact value-mapping coverage and uniqueness; and
- `parentNodePointer` existence, containment, nearest-parent, and cycle rules.

Diagnostics retain the runtime's `stage`, `code`, `pointer`, and message.
Field-specific diagnostics should appear beside the affected binding; a compact
form-level summary handles component or relationship errors that cannot be
shown on one field. The form-level summary must keep showing every diagnostic
regardless of field-level presentation, since a field the user has not opened
must not read as conformant merely because its issue is also shown elsewhere.

**Found during step 7:** matching a diagnostic to its originating binding
currently relies on an unexported convention — the runtime emits binding-level
diagnostics with a `/semantics/bindings/<index>...` pointer prefix, but does
not publish that shape as a documented contract or helper. Form Studio infers
it by string-prefix matching. See §13.

Form Studio validates the editable components. Complete Core package validation
remains the host application's responsibility because Form Studio does not own
the package metadata. The runtime should therefore expose or document a clean
component-oriented Semantic V1 validation API; Form Studio must not manufacture
fake template metadata solely to call a package validator.

Invalid intermediate input may remain in the editor while the user corrects it,
but Form Studio must not report it as synchronized or allow a conformant
save/export. The host may separately maintain a clearly identified recovery
buffer.

## 8. Interaction with schema editing

Semantic field pointers are version-local. Renaming, moving, deleting, or
restructuring a form field can invalidate existing bindings.

After every schema change, Form Studio must:

1. retain all existing bindings;
2. revalidate them against the new schema;
3. display dangling or incompatible binding diagnostics immediately; and
4. require the user to repair or explicitly remove them before a conformant
   save.

Form Studio must not silently delete bindings or guess replacements from field
titles, descriptions, positions, or similar names. A future rename workflow may
offer an explicit, user-confirmed pointer update, but automatic semantic
migration is not part of the first integration.

The runtime's field-pointer resolution re-walks the schema from scratch per
binding, with no caching, and expands schema variants (`allOf`/`anyOf`/`oneOf`)
recursively. Revalidating "after every schema change" for every binding is
fine for the handful of bindings a typical form has, but Form Studio should
debounce this revalidation the same way it already debounces autosave (§4.2)
rather than running it synchronously on every Visual Builder keystroke,
especially for forms with many bindings.

## 9. Testing

Tests must pin the exact specification/runtime candidate and cover:

### State and API

- Core-only initialization with no semantic component;
- adding the first root class or field binding to a Core-only form;
- initialization from an object and JSON string;
- save, save-new-version, autosave, and dirty-state propagation;
- explicitly removing the last semantic assertion and the complete component;
  and
- rebuilt public declarations and committed `dist` output.

### Authoring and preservation

- root class editing;
- literal, IRI, and node bindings;
- datatype and language exclusivity;
- exact local value mappings;
- nested nodes and explicit `parentNodePointer`;
- local `$ref` traversal and RFC 6901 escaping;
- semantic editing on visually read-only Core fields;
- lossless Visual Builder/JSON Editor round trips; and
- preservation of binding order and unsupported-but-valid content.

### Diagnostics and schema interaction

- invalid component shape and malformed IRIs;
- dangling and duplicate field pointers;
- incompatible value kinds and mappings;
- missing, invalid, and cyclic parent relationships;
- field deletion, rename, or movement preserving the invalidated binding; and
- unrelated schema edits leaving valid semantics unchanged.

Application compatibility fixtures remain separate from Core and Semantic
conformance. Local development may use a sibling specification checkout, but
released CI must consume immutable fixtures or release artifacts associated
with the exact candidate rather than a mutable branch.

## 10. Implementation order

1. Cut `v1.0.0-rc.2` of `marker-template-spec`, exporting
   `analyzeSemanticV1Bindings` (and its result type) and a standalone
   nearest-eligible-parent query from the TypeScript runtime's public entry
   point. `rc.1` does not expose the field-pointer/effective-type analysis
   Form Studio needs (§4.1, §5.3); this is a required prerequisite, not a
   conditional fallback.
2. Install and pin the `rc.2` runtime release asset following the process in
   §4.1.
3. Extend public state, provider props, callbacks, and types with optional
   semantics while preserving Core-only behavior, factoring dirty-state and
   panel-reset-key comparisons so a third document does not mean a third
   hand-copied comparison (§4.2).
4. Add semantic parsing, runtime validation, and diagnostic presentation.
5. Add the Semantics document to the JSON Editor, reusing one local-text/
   master-state sync helper across all three documents (§6).
6. Add form-level enable/root controls to the Visual Builder.
7. Add field-level binding controls, including local-reference traversal and
   node ownership, built on the runtime's exported analysis and
   nearest-parent query rather than Form Studio-local resolution (§5.2, §5.3).
8. Add debounced schema-change invalidation behavior and complete fixture
   coverage.
9. Rebuild committed distribution files, test a clean consumer installation,
   and publish an exact Form Studio prerelease.

Do not update MARKER and STAPLE against a mutable Form Studio branch while this
work is in progress. They should adopt the resulting pinned prerelease after its
own tests pass.

## 11. Acceptance criteria

The integration is complete when:

- a Core-only form behaves exactly as before;
- a valid Semantic V1 component can be created and edited from the Visual
  Builder and JSON Editor;
- every saved binding uses a valid explicit Core field pointer;
- shared runtime diagnostics are visible and invalid semantics cannot be
  mistaken for a conformant save;
- schema changes never silently discard or guess semantic bindings;
- valid semantics survive all supported round trips without loss;
- Form Studio does not edit package metadata or embed semantics in the form
  schema; and
- the package is released as an exact prerelease consumable from a clean
  install.

## 12. Deferred work

The first integration does not include:

- ontology lookup, autocomplete, or remote vocabulary verification;
- automatic semantic remapping after field renames;
- arbitrary JSON-LD contexts or RDF graph editing;
- SHACL, OWL reasoning, or ontology alignment;
- projection previews for collected metadata instances;
- package publication metadata editing; or
- complete MARKER package import/export inside Form Studio.

These features require separate evidence and must not delay the lean Semantic
V1 authoring integration.

## 13. Known duplication found during field-level binding work (step 7)

Implementing the field-level binding controls (§5.2/§5.3) surfaced two places
where Form Studio ended up re-implementing something the runtime already
defines internally, rather than the runtime exposing it as a reusable
primitive. Both are functioning correctly today — this is not a defect in the
current release — but both are the same class of drift risk §5.3 already
warns about for field-pointer *resolution*, just discovered on the
construction and diagnostics side instead. Both are candidates for a later
`marker-template-spec` runtime revision that Form Studio then adopts, the same
way `rc.2`'s `analyzeSemanticV1Bindings` export was adopted (§4.1, §10) —
neither blocks step 7 or step 8.

- **Pointer-token escaping.** Form Studio builds each field's RFC 6901 pointer
  (`/properties/<name>/...`) incrementally while walking the Visual Builder's
  own rendering tree (`src/fieldPointer.ts`). The escaping rule it
  needs (`~` → `~0`, `/` → `~1`) is exactly `escapePointerToken`/
  `childPointer` from the runtime's TypeScript source — implemented
  identically three separate times (`core.ts`, `projector.ts`, `semantic.ts`)
  and exported from none of them. Form Studio's copy is therefore a *fourth*
  independent implementation of the same primitive, not a second one. The
  runtime should export one canonical escaping/pointer-append helper (letting
  it deduplicate its own three internal copies in the process), and Form
  Studio should consume that helper instead of maintaining a local copy.
- **Binding-diagnostic association.** Field-level diagnostic presentation
  (§7) matches a `ConformanceDiagnostic` to its originating binding by
  checking whether `pointer` starts with `/semantics/bindings/<index>` — a
  convention confirmed in the runtime's `semantic.ts` but never published as
  a documented contract or helper. A future change to the runtime's
  pointer-emission shape would silently stop matching in Form Studio's
  per-field UI. Nothing would become invisible (the always-on form-level
  summary in §7 shows every diagnostic independent of field-level matching),
  but the per-field presentation would regress with no compile-time or
  test-time signal from the runtime side. The runtime should expose either a
  documented pointer-shape guarantee or a small helper (e.g. a
  binding-diagnostics-by-index filter) instead of leaving this as an inferred
  convention.

A related, lower-priority observation from the same work: Form Studio's exact
local value-mapping editor (§5.2, `iri`-kind bindings) coerces typed-in mapping
values to `string`/`number`/`boolean` with a generic heuristic, even though the
same component already has the runtime-resolved expected type available via
`analyzeSemanticV1Bindings`'s `valueSchemas`. This is not a `marker-template-spec`
gap — the runtime already exposes the type it needs — just an opportunity for
Form Studio to use already-available data more precisely in a later pass.
