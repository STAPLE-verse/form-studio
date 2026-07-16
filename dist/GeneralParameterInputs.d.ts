import { FC } from "react";
import type { Mods, FormInput, CardComponentPropsType } from "./types";
interface GeneralParameterInputsProps {
    category: string;
    parameters: CardComponentPropsType;
    onChange: (newParams: CardComponentPropsType) => void;
    mods?: Mods;
    allFormInputs: {
        [key: string]: FormInput;
    };
}
declare const GeneralParameterInputs: FC<GeneralParameterInputsProps>;
export default GeneralParameterInputs;
//# sourceMappingURL=GeneralParameterInputs.d.ts.map