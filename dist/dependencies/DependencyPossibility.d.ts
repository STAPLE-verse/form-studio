import { ReactElement } from "react";
export default function DependencyPossibility({ possibility, neighborNames, onChange, onDelete, parentEnums, parentType, parentName, parentSchema, }: {
    possibility: {
        children: Array<string>;
        value?: any;
    };
    neighborNames: Array<string>;
    onChange: (newPossibility: {
        children: Array<string>;
        value?: any;
    }) => void;
    onDelete: () => void;
    parentEnums?: Array<string | number>;
    parentType?: string;
    parentName?: string;
    parentSchema?: any;
}): ReactElement;
//# sourceMappingURL=DependencyPossibility.d.ts.map