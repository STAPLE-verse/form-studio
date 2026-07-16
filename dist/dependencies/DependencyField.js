import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import FBRadioGroup from "../radio/FBRadioGroup";
import Tooltip from "../Tooltip";
import DependencyWarning from "./DependencyWarning";
import DependencyPossibility from "./DependencyPossibility";
import { getRandomId } from "../utils";
import { fieldClass, fieldLabelClass } from "../fieldLayout";
// checks whether an array corresponds to oneOf dependencies
function checkIfValueBasedDependency(dependents) {
    let valueBased = true;
    if (dependents && Array.isArray(dependents) && dependents.length > 0) {
        dependents.forEach((possibility) => {
            if (!possibility.value || !possibility.value.enum) {
                valueBased = false;
            }
        });
    }
    else {
        valueBased = false;
    }
    return valueBased;
}
export default function DependencyField({ parameters, onChange, }) {
    const [elementId] = useState(getRandomId());
    const valueBased = checkIfValueBasedDependency(parameters.dependents || []);
    return (_jsxs("div", { className: `form-dependency dependencyField ${fieldClass}`, children: [_jsxs("div", { className: `${fieldLabelClass} flex items-center gap-2`, children: ["Dependencies", _jsx(Tooltip, { id: `${elementId}_dependent`, type: "help", text: "Control whether other form elements show based on this one" })] }), !!parameters.dependents && parameters.dependents.length > 0 && (_jsx(React.Fragment, { children: _jsx(FBRadioGroup, { defaultValue: valueBased ? "value" : "definition", horizontal: false, options: [
                        {
                            value: "definition",
                            label: "Any value",
                        },
                        {
                            value: "value",
                            label: (_jsxs("div", { className: "flex items-center gap-2", children: ["Specific value", _jsx(Tooltip, { id: `${elementId}_valuebased`, type: "help", text: "Specify whether these elements should show based on this element's value" })] })),
                        },
                    ], onChange: (selection) => {
                        if (parameters.dependents) {
                            const newDependents = [...parameters.dependents];
                            if (selection === "definition") {
                                parameters.dependents.forEach((possibility, index) => {
                                    newDependents[index] = {
                                        ...possibility,
                                        value: undefined,
                                    };
                                });
                            }
                            else {
                                parameters.dependents.forEach((possibility, index) => {
                                    newDependents[index] = {
                                        ...possibility,
                                        value: { enum: [] },
                                    };
                                });
                            }
                            onChange({
                                ...parameters,
                                dependents: newDependents,
                            });
                        }
                    } }) })), _jsx(DependencyWarning, { parameters: parameters }), _jsxs("div", { className: "form-dependency-conditions flex flex-col gap-4", children: [parameters.dependents
                        ? parameters.dependents.map((possibility, index) => (_jsx(DependencyPossibility, { possibility: possibility, neighborNames: parameters.neighborNames || [], parentEnums: parameters.enum, parentType: parameters.type, parentName: parameters.name, parentSchema: parameters.schema, onChange: (newPossibility) => {
                                const newDependents = parameters.dependents ? [...parameters.dependents] : [];
                                newDependents[index] = newPossibility;
                                onChange({
                                    ...parameters,
                                    dependents: newDependents,
                                });
                            }, onDelete: () => {
                                const newDependents = parameters.dependents ? [...parameters.dependents] : [];
                                onChange({
                                    ...parameters,
                                    dependents: [
                                        ...newDependents.slice(0, index),
                                        ...newDependents.slice(index + 1),
                                    ],
                                });
                            } }, `${elementId}_possibility${index}`)))
                        : "", _jsx("span", { className: "tooltip tooltip-right tooltip-info z-50 before:max-w-xs inline-flex self-start cursor-pointer", "data-tip": "Add another dependency relation linking this element and other form elements", id: `${elementId}_adddependency`, children: _jsx(PlusCircleIcon, { className: "h-8 w-8 stroke-secondary stroke-2 fill-base-100 hover:stroke-primary transition-colors mt-2", onClick: () => {
                                const newDependents = parameters.dependents ? [...parameters.dependents] : [];
                                newDependents.push({
                                    children: [],
                                    value: valueBased ? { enum: [] } : undefined,
                                });
                                onChange({
                                    ...parameters,
                                    dependents: newDependents,
                                });
                            } }) })] })] }));
}
