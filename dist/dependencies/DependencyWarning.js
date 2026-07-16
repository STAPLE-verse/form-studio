import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { getRandomId } from "../utils";
import Tooltip from "../Tooltip";
// warning message if not all possibilities specified
export default function DependencyWarning({ parameters, }) {
    const [elementId] = useState(getRandomId());
    if (parameters.enum &&
        parameters.dependents &&
        parameters.dependents.length &&
        parameters.dependents[0].value) {
        // get the set of defined enum values
        const definedVals = new Set([]);
        (parameters.dependents || []).forEach((possibility) => {
            if (possibility.value && possibility.value.enum)
                possibility.value.enum.forEach((val) => definedVals.add(val));
        });
        const undefinedVals = [];
        if (Array.isArray(parameters.enum))
            parameters.enum.forEach((val) => {
                if (!definedVals.has(val))
                    undefinedVals.push(val);
            });
        if (undefinedVals.length === 0)
            return null;
        return (_jsxs(React.Fragment, { children: [_jsxs("p", { children: ["Warning! The following values do not have associated dependency values:", " ", _jsx(Tooltip, { id: `${elementId}_valuewarning`, type: "help", text: "Each possible value for a value-based dependency must be defined to work properly" })] }), _jsx("ul", { children: undefinedVals.map((val, index) => (_jsx("li", { children: val }, index))) })] }));
    }
    return null;
}
