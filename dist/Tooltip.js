import { jsx as _jsx } from "react/jsx-runtime";
import { InformationCircleIcon, StarIcon } from "@heroicons/react/24/outline";
const typeMap = {
    alert: StarIcon,
    help: InformationCircleIcon,
};
export default function Tooltip({ text, type, id, }) {
    const Icon = typeMap[type];
    return (_jsx("span", { className: "tooltip tooltip-right tooltip-info z-50 before:max-w-xs", "data-tip": text, id: id, children: _jsx(Icon, { className: "h-4 w-4 inline stroke-2 stroke-info" }) }));
}
