export { semanticV1Extension } from "./extension"
export { getSemanticV1Value, useSemanticV1Value } from "./accessors"
export { default as SemanticDiagnosticsSummary } from "./SemanticDiagnosticsSummary"
export {
  buildSemanticValidationDocument,
  computeSemanticDiagnostics,
  type SemanticValidationInput,
} from "./semanticValidation"
export type {
  ConformanceDiagnostic,
  SemanticV1Component,
  SemanticBinding,
  SemanticIriBinding,
  SemanticLiteralBinding,
  SemanticNodeBinding,
  SemanticValueMapping,
} from "@staple-verse/marker-template-runtime"
