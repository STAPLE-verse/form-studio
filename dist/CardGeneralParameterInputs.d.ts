import { ReactElement } from "react";
import type { Mods, FormInput, CardComponentPropsType } from "./types";
export default function CardGeneralParameterInputs({ parameters, onChange, allFormInputs, mods, showObjectNameInput, }: {
    parameters: CardComponentPropsType;
    onChange: (newParams: CardComponentPropsType) => void;
    mods?: Mods;
    allFormInputs: {
        [key: string]: FormInput;
    };
    showObjectNameInput?: boolean;
}): ReactElement;
//# sourceMappingURL=CardGeneralParameterInputs.d.ts.map