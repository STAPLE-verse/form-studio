import { jsx as _jsx } from "react/jsx-runtime";
import { PlaceholderInput } from "../inputs/PlaceholderInput";
export const CardReferenceParameterInputs = ({ parameters, onChange }) => {
    return (_jsx("div", { children: _jsx(PlaceholderInput, { parameters: parameters, onChange: onChange }) }));
};
const RefChoice = ({ parameters, onChange }) => {
    const pathArr = (parameters.$ref || "").split("/");
    const currentValueLabel = pathArr.length === 3 &&
        pathArr[0] === "#" &&
        pathArr[1] === "definitions" &&
        pathArr[2] &&
        (parameters.definitionData || {})[pathArr[2]]
        ? parameters.definitionData[pathArr[2]].title || parameters.$ref
        : parameters.$ref;
    return (_jsx("div", { className: "card-select", children: _jsx("select", { className: "select select-bordered w-full text-primary border-primary border-2 bg-primary-content", value: parameters.$ref || "", onChange: (e) => onChange({ ...parameters, $ref: e.target.value }), children: Object.keys(parameters.definitionData || {}).map((key) => (_jsx("option", { value: `#/definitions/${key}`, children: parameters.definitionData[key].title || `#/definitions/${key}` }, key))) }) }));
};
const referenceInputs = {
    ref: {
        displayName: "Reference",
        matchIf: [
            {
                types: ["null"],
                $ref: true,
            },
        ],
        defaultDataSchema: {
            $ref: "",
            title: "",
            description: "",
        },
        defaultUiSchema: {},
        type: "string",
        cardBody: RefChoice,
        modalBody: CardReferenceParameterInputs,
    },
};
export default referenceInputs;
