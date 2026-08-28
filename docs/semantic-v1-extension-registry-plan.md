# Semantic V1 Extension Registry Plan

> **Status:** Approved architecture and phased implementation plan. Phases
> 0–6 are complete: the generic registry, Semantic V1 extension, generic
> turnkey API, STAPLE composition migration, split packaging, and release
> verification are implemented. The coordinated release is
> `v0.2.0-rc.1`.
>
> **Purpose:** This document is the source of truth for extracting Semantic V1
> from Form Studio's generic editor core while preserving Semantic V1 as a
> first-class authoring experience in STAPLE and MARKER.
>
> **Normative dependency:** Semantic V1 behavior remains defined by the exact
> pinned `marker-template-spec` release candidate. This plan changes Form
> Studio composition, packaging, and lifecycle ownership; it does not change
> the Semantic V1 contract.

## 1. Decision summary

Form Studio will introduce a small, provider-scoped extension registry based
only on the integration needs demonstrated by Semantic V1.

Semantic V1 will:

- remain in the `form-studio` repository;
- remain distributed in the same `@staple-verse/form-studio` npm package;
- move behind the opt-in `@staple-verse/form-studio/semantic-v1` export;
- implement the extension contract defined by the base package;
- remain visually first-class whenever an application registers it; and
- remain absent from the base browser module when the semantic subpath is not
  imported.

The base Form Studio package will continue to edit:

- a JSON Schema document;
- an RJSF `uiSchema` document; and
- preview `formData`.

It will not validate or edit a complete Core V1 package. In particular, it
will not own `conformsTo`, template identity, lifecycle state, contributors,
publisher, license, or publication metadata.

The initial registry will support only:

1. optional JSON-serializable extension state;
2. form-level authoring controls;
3. field-level authoring controls;
4. additional JSON documents;
5. live and commit-time validation; and
6. normalized diagnostics.

It will not be a general plugin platform.

## 2. Why a registry is justified now

Semantic V1 currently crosses all of these Form Studio concerns:

- provider state and setters;
- dirty-state and recovery-buffer fingerprints;
- full-editor save gating;
- form-level Visual Builder controls;
- field-level controls for editable and visually read-only fields;
- a third JSON Editor document;
- debounced diagnostics;
- synchronous commit validation; and
- public types and exports.

STAPLE does not use the turnkey `FormStudio` layout. It composes
`FormStudioProvider`, `FormBuilder`, `JsonEditor`, `FormPreview`, diagnostics,
and its own tabs and save controls. A family of parallel
`SemanticV1FormBuilder`, `SemanticV1JsonEditor`, and combined-provider
components would therefore reproduce an implicit registry across several
wrappers and hooks.

A narrow explicit registry gives all compositions one state and validation
path without forcing STAPLE to adopt Form Studio's turnkey layout.

## 3. Current-state findings

### 3.1 Form Studio

The current integration is direct rather than modular:

- `FormStudioState` contains `semantics` directly.
- `FormStudioProvider` imports Semantic V1 types and computes live semantic
  diagnostics.
- `FormStudioUI` performs synchronous semantic validation before its own save
  actions.
- `FormBuilder` accepts `semantics` and `onSemanticsChange`, independently
  computes semantic diagnostics, creates `SemanticAuthoringContext`, and
  renders the semantic root control.
- `CardModal` and `CompatibilityCard` directly render
  `SemanticBindingSection`.
- `JsonEditor` always knows how to render the Semantics document.
- `SemanticDiagnosticsSummary` is tied directly to the base provider.
- the main `src/index.ts` re-exports Semantic V1 runtime types and validation
  helpers; and
- `tsup.config.ts` builds one entry point.

This means the usual provider-plus-builder composition computes the same live
semantic validation twice: once for provider/global diagnostics and once for
field-level builder diagnostics.

### 3.2 STAPLE

STAPLE currently:

- initializes `FormStudioProvider` with schema, UI schema, and semantics;
- reads and writes all three values through `useFormStudio`;
- passes semantic props manually to `FormBuilder`;
- relies on `JsonEditor` to include the semantic document;
- chooses where `SemanticDiagnosticsSummary` appears;
- duplicates the synchronous semantic save guard because STAPLE owns the save
  button; and
- persists `state.semantics` on create, manual save, and server-side autosave.

STAPLE's server-side autosave currently differs from Form Studio's documented
recovery-buffer autosave: it can persist parseable but non-conformant semantic
state without the synchronous guard used by the manual Save button. The new
lifecycle API must make the distinction between recovery snapshots and
committed persistence explicit.

### 3.3 Test baseline

At the time this plan was written:

- all 93 Form Studio capability tests pass;
- all 22 selected STAPLE Semantic V1 template/projection tests pass; and
- STAPLE's `FormPlayground` integration test fails because its Form Studio mock
  predates `setSemantics`, `semanticDiagnostics`, and the semantic component
  exports.

The failed STAPLE test is a baseline integration-test gap, not a failure
introduced by this plan. Phase 0 records and repairs it before structural
refactoring.

## 4. Target architecture

```text
@staple-verse/form-studio
|
|-- FormStudioProvider
|    |-- schema / uiSchema / formData
|    |-- registered extension values
|    |-- one debounced diagnostics pipeline
|    `-- synchronous validateForCommit()
|
|-- FormBuilder
|    |-- base JSON Schema authoring
|    |-- form-control extension outlet
|    `-- field-control extension outlets
|
|-- JsonEditor
|    |-- Data Schema document
|    |-- UI Schema document
|    `-- registered extension documents
|
|-- FormPreview
`-- FormStudioDiagnostics

@staple-verse/form-studio/semantic-v1
|
|-- Semantic V1 extension descriptor
|-- root-class controls
|-- field-binding controls
|-- Semantics JSON document
|-- runtime-backed validation and analysis
`-- typed value/accessor exports
```

The required dependency direction is:

```text
form-studio base  <-  semantic-v1 subpath  ->  marker-template-runtime
```

The base entry point must never import the semantic subpath or the MARKER
template runtime.

## 5. Registry lifecycle

### 5.1 Registration and activation are different

An extension is **registered** when the host makes its authoring capability
available. Semantic V1 can be registered while its current value is absent.
That is a Core-only form whose user may choose to add Semantic V1.

An extension value is **active** when the current document contains a value
for that extension. For Semantic V1, `undefined` means that no semantic
component exists. It must remain distinct from an invalid empty object.

Registration is an application/editor capability decision. Activation is
document state.

### 5.2 Provider ownership

`FormStudioProvider` owns registered extension values alongside its base
documents so that one snapshot contains everything an application must save
atomically.

An illustrative state shape is:

```ts
interface FormStudioState {
  schema: object
  uiSchema: object
  formData: object
  extensionValues: Record<string, unknown>
}
```

The final TypeScript spelling may use generics or branded extension keys, but
these invariants are required:

- extension values are accessed through typed helpers rather than repeated
  application casts;
- extension values participate in authored-state fingerprints;
- diagnostics are derived state and are never serialized in the snapshot;
- two registered extensions may not use the same ID;
- registry order is deterministic; and
- the registered extension list is stable for a provider's lifetime. Changing
  the list requires remounting the provider.

The Semantic V1 entry should expose a typed accessor such as:

```ts
const semantics = semanticV1Extension.getValue(state)
```

The extension descriptor itself must not contain mutable document state.

### 5.3 Minimal extension contract

The exact component prop types will be finalized during implementation, but
the contract must express only the following proven capabilities:

```ts
interface FormStudioExtension<TValue> {
  id: string
  label: string

  validate(input: {
    schema: object
    uiSchema: object
    value: TValue | undefined
  }): FormStudioDiagnostic[]

  slots?: {
    FormControls?: React.ComponentType<FormExtensionControlProps<TValue>>
    FieldControls?: React.ComponentType<FieldExtensionControlProps<TValue>>
    JsonDocument?: React.ComponentType<ExtensionDocumentProps<TValue>>
  }
}
```

Slot implementations are React components so they may use hooks legally. The
registry must not call hooks from ordinary descriptor functions.

The first contract must not include speculative lifecycle hooks, asynchronous
discovery, plugin dependencies, routes, menus, or extension-to-extension
communication.

## 6. Generic authoring outlets

### 6.1 Form-level controls

`FormBuilder` will expose one form-level extension outlet. Semantic V1 uses it
for the optional root class and component removal control.

`FormBuilder` remains prop-driven for its base `schema`, `uiSchema`, and
`onChange` API so it can still be used without `FormStudioProvider`. Its
extension outlets read an optional nearest registry context and render nothing
when no extension-enabled provider is present. A host using registered
extensions must pass the same provider-owned schema/UI state into the builder,
as Form Studio and STAPLE do today.

The outlet should not accidentally disappear when the base
`mods.showFormHead` setting hides title and description. Whether it shares the
same visual card or appears immediately after it is a styling decision; its
availability is controlled by registration, not by the base form-head option.

### 6.2 Field-level controls

The builder will render one generic field-extension outlet in both locations
where semantic authoring exists today:

- the Additional Settings modal for editable fields and sections; and
- the compatibility card for visually read-only or migration fields.

The base field context will expose at least:

```ts
interface FormStudioFieldContext {
  fieldPointer: string
  fieldSchema: object
  rootSchema: object
  compatibility?: FieldCompatibility
}
```

`fieldPointer` is a generic stable location for the instance-bearing schema
field being edited. Semantic V1 may use it directly as its Core field pointer.
The base types and comments should no longer describe it as a Semantic
V1-only property.

Pointer construction remains owned by the builder traversal. The extension
must not independently rediscover the visual field path. Runtime resolution,
local-reference analysis, node ownership, and semantic compatibility remain
owned by the Semantic V1 runtime and adapter.

### 6.3 JSON documents

`JsonEditor` will always own its base Data Schema and UI Schema documents. It
will append registered extension documents in registry order.

Semantic V1 supplies the Semantics document, including:

- absent-state presentation;
- a valid starter component;
- add/remove behavior;
- local parse-error presentation; and
- synchronization with the provider's parsed extension value.

The existing shared `useSyncedJsonDocument` behavior must remain common to all
JSON documents rather than being copied into the Semantic V1 subpath.

## 7. Diagnostics and validation

### 7.1 Normalized diagnostics

The base registry will use a semantic-independent diagnostic shape:

```ts
interface FormStudioDiagnostic {
  source: string
  sourceLabel: string
  code: string
  pointer?: string
  stage?: string
  message: string
  severity: "warning" | "error"
  blocksCommit: boolean
}
```

The Semantic V1 adapter maps runtime diagnostics without losing their stable
`stage`, `code`, `pointer`, or message.

### 7.2 One live validation pipeline

`FormStudioProvider` will run each registered extension validator once after
the shared debounce interval. Both the global diagnostic UI and field-level
extension controls read the same stored diagnostic result.

`FormBuilder` must no longer run its own independent Semantic V1 validation.

An extension whose value is absent may return immediately with no diagnostics.
Semantic authoring controls remain available because registration, not
validation, controls their visibility.

### 7.3 Commit validation

Debounced diagnostics are a responsive UI affordance and may briefly describe
the previous state. `FormStudioProvider` will therefore expose a synchronous
operation such as:

```ts
const result = validateForCommit()

if (result.blocked) {
  // Show the current diagnostics and do not persist or export.
}
```

This operation validates the current schema, UI schema, and all registered
extension values without waiting for the debounce timer. The turnkey
`FormStudioUI`, STAPLE's save controls, and later MARKER integration must all
use this same operation rather than importing extension-specific validators.

### 7.4 FormStudioDiagnostics

`FormStudioDiagnostics` will be a generic renderer for current registered
extension diagnostics. Semantic V1 is initially its only diagnostic source,
but neither the renderer nor the provider may import or identify Semantic V1.

The component will:

- group diagnostics by `source` in registry order;
- use the extension's user-facing label;
- preserve code, pointer, stage, message, and severity;
- state clearly when errors block a committed save; and
- render nothing when there are no diagnostics.

Semantic field controls may select and repeat the diagnostics relevant to one
binding. The global `FormStudioDiagnostics` view must still show every
diagnostic, including issues whose field modal is closed.

Existing compatibility diagnostics and Monaco parse errors remain in their
current local surfaces during this refactor. Unifying them under
`FormStudioDiagnostics` is deferred and must not enlarge the first registry
contract.

## 8. Save, recovery, and persistence semantics

The architecture distinguishes two operations:

1. **Recovery snapshot:** preserves parseable work in progress and may contain
   extension diagnostics. It must not be described as a conformant save or
   export.
2. **Committed persistence/export:** requires a fresh synchronous
   `validateForCommit()` result with no blocking diagnostics.

Form Studio's current recovery-buffer callback may continue accepting invalid
work, provided its documentation remains explicit. Renaming that callback is
not required by this refactor.

STAPLE's server-side autosave writes to `FormVersion`; it is therefore a
committed persistence path unless STAPLE deliberately introduces a separate
invalid recovery buffer. During STAPLE migration it must use
`validateForCommit()` or be explicitly redesigned and labelled as recovery
storage.

JSON syntax errors that have not been applied to parsed master state retain
the existing local-text behavior. They do not replace the last parsed value.
This plan does not broaden the refactor into redesigning all JSON Editor
commit semantics.

## 9. Semantic V1 adapter responsibilities

The `@staple-verse/form-studio/semantic-v1` entry owns:

- `SemanticV1Component` and binding types exposed to consumers;
- the exact pinned `marker-template-runtime` dependency;
- construction of the runtime validation document from `schema` and
  semantics;
- runtime validation and diagnostic normalization;
- runtime authoring analysis and nearest-node-parent queries;
- semantic root controls;
- field binding controls;
- semantic component add/remove rules;
- the Semantics JSON document;
- semantic diagnostic-to-binding association; and
- typed state accessors.

The adapter does not own:

- Core V1 package validation;
- `conformsTo` management;
- template metadata;
- application persistence or authorization;
- JSON-LD projection of collected responses;
- publication/export workflows; or
- ontology lookup and remote vocabulary verification.

## 10. Package and build layout

The target source shape is:

```text
src/
|-- index.ts
|-- extensions/
|   |-- types.ts
|   |-- registry.tsx
|   |-- outlets.tsx
|   `-- diagnostics.tsx
|-- FormStudioContext.tsx
|-- FormStudio.tsx
|-- FormBuilder.tsx
|-- JsonEditor.tsx
|-- ...base editor files...
`-- semantic-v1/
    |-- index.ts
    |-- extension.tsx
    |-- semanticValidation.ts
    |-- SemanticRootClassInput.tsx
    |-- SemanticBindingSection.tsx
    |-- SemanticDocument.tsx
    `-- semantic-specific helpers
```

The package exports will be equivalent to:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./semantic-v1": {
      "types": "./dist/semantic-v1.d.ts",
      "import": "./dist/semantic-v1.js"
    }
  }
}
```

The build must have independent base and Semantic V1 entry points. Shared
chunks are acceptable if importing the base entry alone does not create a
static dependency on the semantic entry or `marker-template-runtime`.

The main entry must not re-export Semantic V1 components, runtime types, or
semantic validation helpers. The runtime may remain an npm dependency of the
single package, so it will be installed in `node_modules`, but it must only
enter an application browser graph through the Semantic V1 subpath.

`sideEffects: false` remains required. A packaging test must prove that the
base output contains no import or reference to
`@staple-verse/marker-template-runtime`.

## 11. Intended consumer APIs

The exact property names may be refined while implementing the typed registry,
but the consumption model is fixed.

### 11.1 Generic Form Studio

```tsx
import {
  FormStudioProvider,
  FormBuilder,
  JsonEditor,
  FormPreview,
  useFormStudio,
} from "@staple-verse/form-studio"

<FormStudioProvider initialSchema={schema} initialUiSchema={uiSchema}>
  <ApplicationEditor />
</FormStudioProvider>

function ApplicationEditor() {
  const { state, setSchema, setUiSchema } = useFormStudio()

  return (
    <>
      <FormBuilder
        schema={JSON.stringify(state.schema)}
        uiSchema={JSON.stringify(state.uiSchema)}
        onChange={(nextSchema, nextUiSchema) => {
          setSchema(JSON.parse(nextSchema))
          setUiSchema(JSON.parse(nextUiSchema))
        }}
      />
      <JsonEditor />
      <FormPreview />
    </>
  )
}
```

No Semantic V1 implementation or UI is imported.

### 11.2 Semantic-aware custom composition

```tsx
import {
  FormStudioProvider,
  FormBuilder,
  JsonEditor,
  FormPreview,
  FormStudioDiagnostics,
} from "@staple-verse/form-studio"
import {
  semanticV1Extension,
} from "@staple-verse/form-studio/semantic-v1"

const extensions = [semanticV1Extension]

<FormStudioProvider
  extensions={extensions}
  initialSchema={schema}
  initialUiSchema={uiSchema}
  initialExtensionValues={{
    [semanticV1Extension.id]: semantics,
  }}
>
  <ApplicationOwnedTabs>
    <ProviderConnectedFormBuilder />
    <JsonEditor />
    <FormPreview />
  </ApplicationOwnedTabs>

  <FormStudioDiagnostics />
  <ApplicationOwnedSaveControls />
</FormStudioProvider>
```

Registration is invisible to end users. The visible labels remain Semantic
V1-specific and first-class. `ProviderConnectedFormBuilder` in the example is
application composition equivalent to the explicit schema/UI wiring shown in
§11.1; it is not a required new Form Studio component.

## 12. Phased implementation

Each phase must leave Form Studio buildable and testable. Cross-repository
consumer migration may be coordinated in adjacent commits, but released
dependencies must never point at an incompatible intermediate API.

### Phase 0 — Baseline and regression coverage

**Implementation status (2026-08-28): Complete.**

1. Record the current base and semantic public API and bundle outputs.
2. Repair STAPLE's stale `FormPlayground` test mock so the current semantic
   integration has a passing baseline.
3. Add integration coverage for:
   - provider semantic initialization and removal;
   - schema changes invalidating but not rewriting bindings;
   - JSON semantic document synchronization;
   - global and field-local diagnostics using the same current result;
   - synchronous save blocking; and
   - recovery-buffer behavior with invalid semantic state.
4. Keep the existing capability fixtures passing unchanged.

**Exit criteria:** the current behavior is covered end to end, including the
custom STAPLE composition, before files or APIs move.

### Phase 1 — Generic registry state and typed access

**Implementation status (2026-08-28): Complete.**

1. Add the minimal `FormStudioExtension` and `FormStudioDiagnostic` contracts.
2. Add `extensions` and `initialExtensionValues` to `FormStudioProvider`.
3. Store extension values in the authoritative provider state.
4. Add typed get/set helpers based on the extension descriptor.
5. Include extension values in the authored-state fingerprint and recovery
   snapshots.
6. Reject duplicate extension IDs and document stable registry lifetime.
7. Add tests proving that an empty registry preserves existing base behavior.
8. Keep the Phase 0 pre-registry baseline immutable. Once intentional public
   API changes make its exact checker fail, remove that checker from the
   default `npm test` chain rather than rewriting the recorded baseline.

**Exit criteria:** extension state can round-trip through the provider without
introducing any UI contribution or semantic migration yet.

### Phase 2 — Generic UI outlets and diagnostics

**Implementation status (2026-08-28): Complete.** Generic outlets are active.
Semantic V1 now consumes them through its Phase 3 descriptor.

1. Add the form-control outlet to `FormBuilder`.
2. Replace hard-coded field insertion points with a field-control outlet in
   both `CardModal` and `CompatibilityCard`.
3. Generalize field-pointer types and comments without changing pointer
   behavior.
4. Refactor `JsonEditor` to render registered JSON document components after
   its two base documents.
5. Add the provider-level debounced extension validation pipeline.
6. Add synchronous `validateForCommit()`.
7. Add the generic `FormStudioDiagnostics` renderer.
8. Add ordering, error-boundary, and no-extension tests for every outlet.

**Exit criteria:** a small test extension can contribute state, controls, a
JSON document, diagnostics, and commit blocking without any Semantic V1 code
in the registry implementation.

### Phase 3 — Implement Semantic V1 as the first extension

**Implementation status (2026-08-28): Complete.** Semantic V1 state, controls,
JSON document, runtime validation, and typed accessors now live behind the
static `semanticV1Extension` descriptor. The turnkey editor retains its
semantic-facing compatibility API until its removal in Phase 4, but uses the
registered value internally; there is no second semantic state or FormBuilder
validation pass.

1. Move semantic-specific files under `src/semantic-v1/`.
2. Implement the static `semanticV1Extension` descriptor.
3. Move Semantic V1 state from the base state property into its registered
   extension value.
4. Move runtime validation into the adapter and normalize its diagnostics.
5. Make form and field controls consume provider-managed extension state and
   the single provider diagnostic result.
6. Remove the independent validation pass from `FormBuilder`.
7. Convert the Semantics column into the registered JSON document component.
8. Preserve all current absence, starter, add/remove, local-reference,
   read-only-field, binding-kind, mapping, and node-parent behavior.
9. Expose typed semantic value accessors from the semantic subpath.

**Exit criteria:** the current Semantic V1 UX and fixtures pass through the
generic registry, and live runtime validation occurs once per settled state.

### Phase 4 — Migrate the turnkey FormStudio API

**Implementation status (2026-08-28): Complete.** `FormStudio` now accepts
generic `extensions` and `initialExtensionValues`; `FormStudioUI` renders
generic diagnostics, reports them through `onDiagnosticsChange`, and gates
committed saves with `validateForCommit()`. The base entry has no Semantic V1
or marker-runtime import.

This phase takes the coordinated breaking-prerelease path. No compatibility
aliases or second semantic state are retained:

| Removed API | Registry replacement |
| --- | --- |
| `initialSemantics` on `FormStudio` or `FormStudioProvider` | Register `semanticV1Extension` and pass `{ [semanticV1Extension.id]: semantics }` through `initialExtensionValues` |
| `state.semantics` | `semanticV1Extension.getValue(state)` or `getSemanticV1Value(state)` |
| context `setSemantics` | `setExtensionValue(semanticV1Extension, value)` or `useSemanticV1Value().setValue` |
| `semantics` and `onSemanticsChange` on `FormBuilder` | Provider-managed extension state consumed by the generic outlets |
| `onSemanticValidationChange` | `onDiagnosticsChange`, or `extensionDiagnostics` from `useFormStudio()` |
| Semantic helpers and runtime types from the base entry | Semantic V1 subpath exports |

The historical Phase 0 baseline remains unchanged. Consumer migration is
coordinated in Phase 5, and the independently resolvable npm subpath is added
and verified in Phase 6.

1. Make `FormStudio` and `FormStudioUI` consume generic registry diagnostics
   and `validateForCommit()`.
2. Replace `onSemanticValidationChange` with a semantic-independent diagnostic
   callback or provider access.
3. Remove semantic-specific save logic from the base UI.
4. Decide and document the prerelease migration path for direct
   `initialSemantics`, `state.semantics`, `semantics`, and
   `onSemanticsChange` APIs.
5. Prefer a coordinated breaking prerelease over a permanent compatibility
   bridge that would force the base entry to import Semantic V1.
6. Update base and Semantic V1 usage documentation.

**Exit criteria:** the turnkey editor and custom compositions share the same
registry lifecycle, and the base entry has no Semantic V1 import.

### Phase 5 — Migrate STAPLE's custom composition

**Implementation status (2026-08-28): Complete.** STAPLE registers the static
Semantic V1 descriptor once, initializes it through `initialExtensionValues`,
uses the generic outlets and diagnostics renderer, validates manual and
server-side autosaves through `validateForCommit()`, and reads persistence
values through `getSemanticV1Value()`.

The independently built `./semantic-v1` entry and package export were pulled
forward as the minimum prerequisite for compiling this consumer migration.
Phase 6 still owns clean-install verification, dependency-graph assertions,
React 18/19 fixtures, artifact reproducibility, and release/pinning work.

1. Import `semanticV1Extension` from the semantic subpath.
2. Register it once at the provider boundary with a stable extension array.
3. Initialize its value from `FormVersion.semantics`.
4. Stop passing semantic props directly to `FormBuilder`.
5. Continue using the ordinary `JsonEditor`; its registry supplies the third
   document.
6. Replace `SemanticDiagnosticsSummary` with `FormStudioDiagnostics` at
   STAPLE's current preferred location.
7. Replace direct `computeSemanticDiagnostics` calls with
   `validateForCommit()`.
8. Read semantics for persistence through the typed Semantic V1 accessor.
9. Apply the commit-validation rule consistently to manual and server-side
   autosaves.
10. Update the `FormPlayground` integration test and semantic persistence
    tests.

**Exit criteria:** STAPLE retains its Information, Visual Builder, JSON
Builder, and Preview tabs and its own save controls while no longer importing
semantic validation details from Form Studio's base entry.

### Phase 6 — Split build, packaging verification, and release

**Implementation status (2026-08-28): Complete.** Independent base and
Semantic V1 entries, subpath exports and declarations, permanent artifact
boundary assertions, React 18/19 packed consumers, clean-install testing,
byte-for-byte reproducible `dist/`, and STAPLE tarball suites all pass. Form
Studio is released as `v0.2.0-rc.1`, and STAPLE is pinned to that exact GitHub
tag.

1. Add independent base and Semantic V1 build entries.
2. Add the `./semantic-v1` package export and declarations.
3. Remove all semantic re-exports from the main entry.
4. Verify the base artifact contains no marker-template runtime import.
5. Verify a semantic-aware consumer resolves the runtime from the semantic
   entry and receives correct declarations.
6. Replace the exact pre-registry baseline checker with permanent target-state
   packaging assertions.
7. Run Form Studio build, typecheck, complete tests, and a clean npm install.
8. Run STAPLE's Form Playground, capability, and semantic suites against the
   packaged artifact rather than a mutable sibling checkout.
9. Rebuild and commit `dist/`.
10. Publish an exact Form Studio prerelease and pin STAPLE to it.

**Exit criteria:** generic consumers can import the base entry without a
semantic browser dependency, while STAPLE reproducibly consumes the exact
Semantic V1-enabled prerelease.

## 13. Test matrix

### Base registry

- no registered extensions preserves current schema/UI/preview behavior;
- duplicate IDs fail clearly;
- registration order controls outlet and diagnostic order;
- extension state participates in snapshots and fingerprints;
- diagnostics are derived rather than serialized;
- live validation is debounced once per extension;
- `validateForCommit()` always uses current state; and
- an extension render failure is contained by the existing panel/error
  boundary strategy.

### Semantic V1 extension

- a registered extension with no value remains Core-only;
- first root or binding action creates a valid component shape;
- removing the final assertion returns the value to `undefined`;
- root, literal, IRI, mapping, node, and parent controls retain current
  behavior;
- editable and read-only fields both expose bindings;
- schema changes preserve and revalidate bindings;
- local references use instance-bearing field pointers;
- JSON and visual edits share one parsed value;
- field and global diagnostics come from the same validation result;
- invalid semantics block committed saves synchronously; and
- absent semantics performs no runtime validation work.

### Packaging

- the base artifact has no import/reference to
  `@staple-verse/marker-template-runtime`;
- the semantic subpath exports the extension and Semantic V1 types;
- both entry points work in React 18 and React 19 consumer fixtures;
- Next.js client-boundary output remains valid; and
- committed `dist/` matches a clean build.

### STAPLE

- existing custom tab layout is unchanged;
- existing semantics load, edit, save, version, and reload without loss;
- Core-only forms remain Core-only until the user adds semantics;
- manual save and persisted autosave use current commit diagnostics;
- legacy `_stapleSchema` projection behavior remains unchanged; and
- Semantic V1 projection tests remain independent of authoring composition.

### Test retention and baseline transition

Phase 0 tests are regression assets, not disposable scaffolding. Their
lifecycle is:

- keep the existing capability fixtures unchanged throughout the refactor;
- migrate the Semantic V1 integration tests to registry registration,
  extension values, typed accessors, and the semantic subpath as those APIs
  replace `state.semantics` and direct semantic props;
- keep STAPLE's `FormPlayground` and persistence tests, updating their mocks
  and assertions in Phase 5 to use extension values and
  `validateForCommit()`;
- preserve the Phase 0 pre-registry JSON baseline unchanged through the
  migration as a record of the old public API and bundle composition;
- stop running the exact legacy-baseline comparison in the default test suite
  once intentional public API changes begin, because those expected changes
  must not be "fixed" by overwriting the historical baseline; and
- in Phase 6, replace the legacy checker with permanent packaging tests that
  prove the base entry excludes Semantic V1 and the marker-template runtime,
  the `./semantic-v1` entry and declarations resolve correctly, and both
  entries have the intended dependency graph.

After Phase 6, the historical baseline JSON may be archived or removed because
Git history preserves it. Behavioral, capability, STAPLE integration, and
target-state packaging tests remain part of the permanent suite.

## 14. Compatibility and release policy

Form Studio is still at a prerelease integration stage. The preferred policy
is a coordinated, documented breaking prerelease across Form Studio and
STAPLE rather than maintaining a permanent semantic compatibility layer in the
base entry.

Temporary source-level adapters are permitted during implementation only when
they do not create a released base-to-semantic dependency. They must have an
explicit removal phase and must not survive as an undocumented second state or
validation path.

MARKER integration begins only after the split Form Studio prerelease is
packaged, pinned, and exercised by STAPLE. MARKER should consume the registry
API directly rather than first integrating the current hard-coded semantic
surface and migrating immediately afterward.

## 15. Explicit non-goals

This work does not include:

- Core V1 package validation or package assembly;
- a general plugin marketplace or discovery protocol;
- runtime installation or removal of extensions by end users;
- asynchronous or remote extension loading;
- extension-to-extension dependency management;
- migration of Form Studio compatibility diagnostics into the registry;
- migration of Monaco syntax errors into the registry;
- automatic semantic pointer remapping after schema edits;
- ontology search, lookup, or verification;
- Semantic V1 projection previews;
- a separate Semantic V1 npm package; or
- changes to the normative Core V1 or Semantic V1 contracts.

## 16. Completion criteria

The refactor is complete when:

- Form Studio's main entry is free of Semantic V1 and marker-template runtime
  imports;
- Semantic V1 is available from the opt-in subpath of the same npm package;
- registering Semantic V1 restores the complete current authoring UX;
- Form Studio maintains one authoritative extension state and one live
  validation result;
- all committed save paths use synchronous generic commit validation;
- STAPLE retains its custom component composition without semantic-specific
  prop threading or validation calls;
- generic Form Studio behavior and bundle composition remain independent of
  Semantic V1; and
- Form Studio and STAPLE pass their complete relevant suites against exact,
  reproducible package versions.
