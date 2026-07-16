import { ReactElement } from "react";
type FBRadioGroupPropsType = {
    options: Array<{
        label: string | ReactElement;
        value: string | number;
    }>;
    onChange: (selection: string) => void;
    defaultValue?: any;
    horizontal?: boolean;
    id?: string | number;
    required?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
};
export default function FBRadioGroup(props: FBRadioGroupPropsType): ReactElement;
export {};
//# sourceMappingURL=FBRadioGroup.d.ts.map