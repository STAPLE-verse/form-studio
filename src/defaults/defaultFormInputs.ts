import shortAnswerInputs from "./shortAnswerInputs"
import longAnswerInputs from "./longAnswerInputs"
import numberInputs from "./numberInputs"
import stringArrayInputs from "./stringArrayInputs"
import defaultInputs from "./defaultInputs"
import referenceInputs from "./referenceInputs"
import { FormInput } from "../types"

const DEFAULT_FORM_INPUTS: { [key: string]: FormInput } = {
  ...defaultInputs,
  ...referenceInputs,
  ...shortAnswerInputs,
  ...longAnswerInputs,
  ...numberInputs,
  // Deliberately separate from the disabled recursive generic array editor.
  ...stringArrayInputs,
}

export default DEFAULT_FORM_INPUTS
