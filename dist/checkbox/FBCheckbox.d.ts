import { FC } from "react";
interface FBCheckboxProps {
    onChangeValue: (_arg0: {
        [key: string]: any;
    }) => void;
    isChecked: boolean;
    id?: string;
    label?: string;
    use?: string;
    value?: string;
    disabled?: boolean;
    dataTest?: string;
    labelClassName?: string;
}
declare const FBCheckbox: FC<FBCheckboxProps>;
export default FBCheckbox;
//# sourceMappingURL=FBCheckbox.d.ts.map