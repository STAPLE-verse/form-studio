"use client";

// src/Tooltip.tsx
import { InformationCircleIcon, StarIcon } from "@heroicons/react/24/outline";
import { jsx } from "react/jsx-runtime";
var typeMap = {
  alert: StarIcon,
  help: InformationCircleIcon
};
function Tooltip({
  text,
  type,
  id
}) {
  const Icon = typeMap[type];
  return /* @__PURE__ */ jsx("span", { className: "tooltip tooltip-right tooltip-info z-50 before:max-w-xs", "data-tip": text, id, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 inline stroke-2 stroke-info" }) });
}

// src/fieldLayout.ts
var fieldStackClass = "flex flex-col gap-4";
var fieldClass = "flex w-full min-w-0 flex-col gap-2 pb-1";
var fieldLabelClass = "text-[18px] font-bold leading-6";
var fieldControlClass = "w-full";

export {
  Tooltip,
  fieldStackClass,
  fieldClass,
  fieldLabelClass,
  fieldControlClass
};
//# sourceMappingURL=chunk-XRLOQBER.js.map