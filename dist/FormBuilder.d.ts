import { ReactElement } from "react";
import type { Mods, InitParameters } from "./types";
export default function FormBuilder({ schema, uischema, onMount, onChange, mods, className, }: {
    schema: string;
    uischema: string;
    onMount?: (parameters: InitParameters) => any;
    onChange: (schema: string, uischema: string) => any;
    mods?: Mods;
    className?: string;
}): ReactElement;
//# sourceMappingURL=FormBuilder.d.ts.map