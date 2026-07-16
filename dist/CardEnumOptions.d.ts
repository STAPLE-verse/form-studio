import { ReactElement } from "react";
interface CardEnumOptionsProps {
    initialValues: Array<any>;
    names?: Array<string>;
    showNames: boolean;
    onChange: (newEnums: Array<any>, newEnumNames?: Array<string>) => void;
    type: string;
}
export default function CardEnumOptions({ initialValues, names, showNames, onChange, type, }: CardEnumOptionsProps): ReactElement;
export {};
//# sourceMappingURL=CardEnumOptions.d.ts.map