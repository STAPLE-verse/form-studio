import shortAnswerInputs from "./shortAnswerInputs";
import longAnswerInputs from "./longAnswerInputs";
import numberInputs from "./numberInputs";
import defaultInputs from "./defaultInputs";
import referenceInputs from "./referenceInputs";
const DEFAULT_FORM_INPUTS = {
    ...defaultInputs,
    ...referenceInputs,
    ...shortAnswerInputs,
    ...longAnswerInputs,
    ...numberInputs,
    //...arrayInputs,
};
export default DEFAULT_FORM_INPUTS;
