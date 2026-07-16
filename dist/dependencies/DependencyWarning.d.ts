import { ReactElement } from "react";
interface DependencyWarningProps {
    parameters: {
        [key: string]: any;
        name?: string;
        dependents?: Array<{
            children: Array<string>;
            value?: any;
        }>;
        type?: string;
        enum?: Array<string | number>;
        neighborNames?: Array<string>;
        schema?: string;
    };
}
export default function DependencyWarning({ parameters, }: DependencyWarningProps): ReactElement | null;
export {};
//# sourceMappingURL=DependencyWarning.d.ts.map