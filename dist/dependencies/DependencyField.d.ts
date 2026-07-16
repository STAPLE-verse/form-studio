import { ReactElement } from "react";
type DependencyParams = {
    [key: string]: any;
    name?: string;
    dependents?: Array<{
        children: Array<string>;
        value?: any;
    }>;
    type?: string;
    enum?: Array<string | number>;
    neighborNames?: Array<string>;
    schema?: any;
};
export default function DependencyField({ parameters, onChange, }: {
    parameters: DependencyParams;
    onChange: (newParams: DependencyParams) => void;
}): ReactElement;
export {};
//# sourceMappingURL=DependencyField.d.ts.map