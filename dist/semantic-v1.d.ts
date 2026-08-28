import { k as DefinedFormStudioExtension, u as FormStudioExtensionState, a as FormStudioDiagnostic } from './types-C5lOkV8d.js';
import { SemanticV1Component, ConformanceDiagnostic } from '@staple-verse/marker-template-runtime';
export { ConformanceDiagnostic, SemanticBinding, SemanticIriBinding, SemanticLiteralBinding, SemanticNodeBinding, SemanticV1Component, SemanticValueMapping } from '@staple-verse/marker-template-runtime';
import React from 'react';

declare const semanticV1Extension: Readonly<DefinedFormStudioExtension<SemanticV1Component>>;

declare function getSemanticV1Value(state: FormStudioExtensionState): SemanticV1Component | undefined;
declare function useSemanticV1Value(): {
    value: SemanticV1Component | undefined;
    setValue: (value: SemanticV1Component | undefined) => void;
    diagnostics: FormStudioDiagnostic[];
};

/**
 * Compact, always-visible summary of every current semantic diagnostic
 * (§7). Bindings also show their own diagnostics in-context beside their
 * "Semantic binding" section (§5.2), but that requires opening the owning
 * field's Additional Settings — a field a user hasn't opened must not be
 * silently invalid, so every diagnostic is duplicated here regardless of
 * whether it also has a field-local presentation. This keeps "an invalid
 * component is never mistaken for a conformant save" true independent of
 * which field panels happen to be open.
 */
declare function SemanticDiagnosticsSummary(): React.ReactElement | null;

interface SemanticValidationInput {
    schema: object;
    semantics?: SemanticV1Component;
}
/**
 * The runtime's Semantic V1 validator resolves field pointers against
 * `form.schema`, so it expects the same `{ form: { schema }, semantics }`
 * document shape as the eventual MARKER package rather than the bare
 * component. This is the one place that assembles that shape from Form
 * Studio state; nothing else should hand-build it.
 */
declare function buildSemanticValidationDocument(state: SemanticValidationInput): {
    form: {
        schema: object;
    };
    semantics?: SemanticV1Component;
};
/**
 * Absent semantics is Core-only and never diagnosed — `validateSemanticV1`
 * already returns `[]` for that case, but being explicit here keeps that
 * Core-only guarantee visible at the Form Studio call site too.
 */
declare function computeSemanticDiagnostics(state: SemanticValidationInput): ConformanceDiagnostic[];

export { SemanticDiagnosticsSummary, type SemanticValidationInput, buildSemanticValidationDocument, computeSemanticDiagnostics, getSemanticV1Value, semanticV1Extension, useSemanticV1Value };
