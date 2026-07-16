import { ReactElement } from "react";
type Props = {
    label: ReactElement | string;
    value?: any;
    name?: string;
    checked?: boolean;
    required?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
    onChange: (selection: string) => void;
};
export default function FBRadioButton(props: Props): ReactElement;
export {};
//# sourceMappingURL=FBRadioButton.d.ts.map