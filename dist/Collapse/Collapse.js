import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from "../classNames";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
const Collapse = (props) => {
    const classes = classNames(`border border-base-300 rounded-xl bg-base-100 shadow-sm p-4 ${props.className || ""}`, {
        "opacity-50 pointer-events-none": props.disableToggle,
    });
    return (_jsxs("div", { className: classes, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "toggle-collapse", children: props.isOpen ? (_jsx(ChevronDownIcon, { className: "h-6 w-6 cursor-pointer text-primary", onClick: (event) => {
                                if (!props.disableToggle) {
                                    props.toggleCollapse(event);
                                }
                            } })) : (_jsx(ChevronRightIcon, { className: "h-6 w-6 cursor-pointer text-primary", onClick: (event) => {
                                if (!props.disableToggle) {
                                    props.toggleCollapse(event);
                                }
                            } })) }), _jsx("div", { className: "w-full", children: props.title })] }), _jsx("div", { className: props.isOpen ? "block mt-4 pt-4 border-t border-base-200" : "hidden", children: _jsx("div", { children: props.children }) })] }));
};
export default Collapse;
