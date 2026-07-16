import { jsx as _jsx } from "react/jsx-runtime";
import { getCardBody } from "./utils";
// specify the inputs required for any type of object
const GeneralParameterInputs = ({ category, parameters, onChange, mods, allFormInputs, }) => {
    const CardBody = getCardBody(category, allFormInputs);
    return (_jsx("div", { className: "flex flex-col gap-2 pb-2 [&>h5]:text-[18px] [&>h5]:font-bold [&>h5]:leading-6 [&>input]:mt-0 [&>select]:mt-0 [&>textarea]:mt-0", children: _jsx(CardBody, { parameters: parameters, onChange: onChange, mods: mods || {} }) }));
};
export default GeneralParameterInputs;
