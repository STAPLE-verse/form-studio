import { ReactElement } from "react";
import type { Mods, InitParameters } from "./types";
export default function FormBuilder({ schema, uiSchema, onMount, onChange, mods, className, }: {
    schema: string;
    uiSchema: string;
    onMount?: (parameters: InitParameters) => any;
    onChange: (schema: string, uiSchema: string) => any;
    mods?: Mods;
    className?: string;
}): ReactElement;
//# sourceMappingURL=FormBuilder.d.ts.map