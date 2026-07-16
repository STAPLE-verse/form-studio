import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Tooltip from "../Tooltip";
import CardSelector from "./CardSelector";
import ValueSelector from "./ValueSelector";
import { getRandomId } from "../utils";
import { fieldClass, fieldLabelClass, fieldStackClass } from "../fieldLayout";
// a possible dependency
export default function DependencyPossibility({ possibility, neighborNames, onChange, onDelete, parentEnums, parentType, parentName, parentSchema, }) {
    const [elementId] = useState(getRandomId());
    return (_jsxs("div", { className: `form-dependency-condition relative rounded-box border border-primary p-4 ${fieldStackClass}`, children: [_jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: `${fieldLabelClass} flex items-center gap-2`, children: ["Display the following:", _jsx(Tooltip, { id: `${elementId}_bulk`, type: "help", text: "Choose the other form items for the dependency" })] }), _jsx(CardSelector, { possibleChoices: neighborNames.filter((name) => name !== parentName) || [], chosenChoices: possibility.children, onChange: (chosenChoices) => onChange({ ...possibility, children: [...chosenChoices] }), placeholder: "Choose a dependent..." })] }), _jsxs("div", { className: fieldClass, children: [_jsxs("div", { className: fieldLabelClass, children: ["If \"", parentName, "\" has ", possibility.value ? "the value:" : "a value."] }), _jsx("div", { style: { display: possibility.value ? "block" : "none" }, children: _jsx(ValueSelector, { possibility: possibility, onChange: (newPossibility) => onChange(newPossibility), parentEnums: parentEnums, parentType: parentType, parentName: parentName, parentSchema: parentSchema }) })] }), _jsx("div", { className: "absolute top-2 right-2", children: _jsx("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer", "data-tip": "Delete this dependency", children: _jsx(XMarkIcon, { className: "h-6 w-6 stroke-warning hover:stroke-error transition-colors", strokeWidth: 2, onClick: () => onDelete() }) }) })] }));
}
