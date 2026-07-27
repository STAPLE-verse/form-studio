"use client";
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/FormStudioContext.tsx
import { createContext, useContext, useState as useState14 } from "react";
import { jsx as jsx27 } from "react/jsx-runtime";
function FormStudioProvider({
  initialSchema = {},
  initialUiSchema = {},
  initialFormData = {},
  children
}) {
  const parseJSON = (data) => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }
    return data || {};
  };
  const [state, setState] = useState14({
    schema: parseJSON(initialSchema),
    uiSchema: parseJSON(initialUiSchema),
    formData: initialFormData
  });
  const setSchema = (newSchema) => {
    setState((prev) => ({ ...prev, schema: newSchema }));
  };
  const setUiSchema = (newUiSchema) => {
    setState((prev) => ({ ...prev, uiSchema: newUiSchema }));
  };
  const setFormData = (newFormData) => {
    setState((prev) => ({ ...prev, formData: newFormData }));
  };
  const updateState = (newState) => {
    setState((prev) => ({ ...prev, ...newState }));
  };
  return /* @__PURE__ */ jsx27(
    FormStudioContext.Provider,
    {
      value: {
        state,
        setSchema,
        setUiSchema,
        setFormData,
        updateState
      },
      children
    }
  );
}
function useFormStudio() {
  const context = useContext(FormStudioContext);
  if (!context) {
    throw new Error("useFormStudio must be used within a FormStudioProvider");
  }
  return context;
}
var FormStudioContext;
var init_FormStudioContext = __esm({
  "src/FormStudioContext.tsx"() {
    "use strict";
    "use client";
    FormStudioContext = createContext(void 0);
  }
});

// src/JsonEditor.tsx
var JsonEditor_exports = {};
__export(JsonEditor_exports, {
  default: () => JsonEditor
});
import { useState as useState15 } from "react";
import Editor from "@monaco-editor/react";
import { jsx as jsx30, jsxs as jsxs23 } from "react/jsx-runtime";
function JsonEditor() {
  const { state, setSchema, setUiSchema } = useFormStudio();
  const [localSchema, setLocalSchema] = useState15(() => JSON.stringify(state.schema, null, 2));
  const [localUiSchema, setLocalUiSchema] = useState15(() => JSON.stringify(state.uiSchema, null, 2));
  const [prevSchema, setPrevSchema] = useState15(state.schema);
  const [prevUiSchema, setPrevUiSchema] = useState15(state.uiSchema);
  if (state.schema !== prevSchema) {
    setPrevSchema(state.schema);
    try {
      const parsedLocal = JSON.parse(localSchema);
      if (JSON.stringify(parsedLocal) !== JSON.stringify(state.schema)) {
        setLocalSchema(JSON.stringify(state.schema, null, 2));
      }
    } catch (e) {
      if (JSON.stringify(state.schema) !== "{}") {
        setLocalSchema(JSON.stringify(state.schema, null, 2));
      }
    }
  }
  if (state.uiSchema !== prevUiSchema) {
    setPrevUiSchema(state.uiSchema);
    try {
      const parsedLocal = JSON.parse(localUiSchema);
      if (JSON.stringify(parsedLocal) !== JSON.stringify(state.uiSchema)) {
        setLocalUiSchema(JSON.stringify(state.uiSchema, null, 2));
      }
    } catch (e) {
      if (JSON.stringify(state.uiSchema) !== "{}") {
        setLocalUiSchema(JSON.stringify(state.uiSchema, null, 2));
      }
    }
  }
  const handleSchemaChange = (value) => {
    const val = value || "";
    setLocalSchema(val);
    try {
      const parsed = JSON.parse(val);
      setSchema(parsed);
    } catch {
    }
  };
  const handleUiSchemaChange = (value) => {
    const val = value || "";
    setLocalUiSchema(val);
    try {
      const parsed = JSON.parse(val);
      setUiSchema(parsed);
    } catch {
    }
  };
  return /* @__PURE__ */ jsx30("div", { className: "flex flex-col h-full", children: /* @__PURE__ */ jsxs23("div", { className: "flex flex-col lg:flex-row gap-6 w-full h-full overflow-y-auto pb-8 pt-4", children: [
    /* @__PURE__ */ jsxs23("div", { className: "flex-1 min-w-0 flex flex-col h-[500px] lg:h-full", children: [
      /* @__PURE__ */ jsx30("h4", { className: "text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-2", children: "Data Schema" }),
      /* @__PURE__ */ jsx30("div", { className: "bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden py-2 relative", children: /* @__PURE__ */ jsx30(
        Editor,
        {
          height: "100%",
          language: "json",
          theme: "vs-dark",
          value: localSchema,
          onChange: handleSchemaChange,
          options: {
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            formatOnPaste: true,
            scrollBeyondLastLine: false
          }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "flex-1 min-w-0 flex flex-col h-[500px] lg:h-full", children: [
      /* @__PURE__ */ jsx30("h4", { className: "text-sm font-semibold text-base-content/70 uppercase tracking-wider mb-2", children: "UI Schema" }),
      /* @__PURE__ */ jsx30("div", { className: "bg-base-200 rounded-lg border border-base-300 flex-1 overflow-hidden py-2 relative", children: /* @__PURE__ */ jsx30(
        Editor,
        {
          height: "100%",
          language: "json",
          theme: "vs-dark",
          value: localUiSchema,
          onChange: handleUiSchemaChange,
          options: {
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            formatOnPaste: true,
            scrollBeyondLastLine: false
          }
        }
      ) })
    ] })
  ] }) });
}
var init_JsonEditor = __esm({
  "src/JsonEditor.tsx"() {
    "use strict";
    "use client";
    init_FormStudioContext();
  }
});

// src/FormBuilder.tsx
import React18, { useEffect as useEffect2 } from "react";
import { DragDropContext as DragDropContext2, Droppable as Droppable2, Draggable as Draggable2 } from "@hello-pangea/dnd";

// src/Card.tsx
import React11 from "react";

// src/classNames.ts
function classNames(...values) {
  return values.flatMap((value) => {
    if (typeof value === "string") return value;
    if (!value) return [];
    return Object.entries(value).filter(([, enabled]) => Boolean(enabled)).map(([className]) => className);
  }).join(" ");
}

// src/checkbox/FBCheckbox.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var FBCheckbox = ({
  onChangeValue,
  value = "",
  isChecked = false,
  label = "",
  use = "action",
  disabled = false,
  id = "",
  dataTest = "",
  labelClassName = ""
}) => {
  const classes = classNames("fb-checkbox", {
    "edit-checkbox": !disabled && use === "edit",
    "action-checkbox": !disabled && use === "action",
    "disabled-checked-checkbox": disabled && isChecked,
    "disabled-unchecked-checkbox": disabled && !isChecked
  });
  const potentialCheckboxId = id !== "" ? id : label;
  const checkboxId = potentialCheckboxId !== "" ? potentialCheckboxId : void 0;
  return /* @__PURE__ */ jsx("div", { "data-test": "checkbox", className: "form-control", children: /* @__PURE__ */ jsxs("label", { htmlFor: checkboxId, className: `label cursor-pointer justify-start gap-3 ${labelClassName || ""}`, children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        id: checkboxId,
        "data-test": dataTest || void 0,
        onChange: (event) => {
          if (!disabled) {
            onChangeValue(event);
          }
        },
        value,
        disabled,
        checked: isChecked,
        className: classNames("checkbox checkbox-primary", {
          "checkbox-disabled": disabled
        })
      }
    ),
    label && /* @__PURE__ */ jsx("span", { className: "label-text text-base", children: label })
  ] }) });
};
var FBCheckbox_default = FBCheckbox;

// src/Collapse/Collapse.tsx
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var Collapse = (props) => {
  const classes = classNames(`border border-base-300 rounded-xl bg-base-100 shadow-sm p-4 ${props.className || ""}`, {
    "opacity-50 pointer-events-none": props.disableToggle
  });
  return /* @__PURE__ */ jsxs2("div", { className: classes, children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx2("span", { className: "toggle-collapse", children: props.isOpen ? /* @__PURE__ */ jsx2(
        ChevronDownIcon,
        {
          className: "h-6 w-6 cursor-pointer text-primary",
          onClick: (event) => {
            if (!props.disableToggle) {
              props.toggleCollapse(event);
            }
          }
        }
      ) : /* @__PURE__ */ jsx2(
        ChevronRightIcon,
        {
          className: "h-6 w-6 cursor-pointer text-primary",
          onClick: (event) => {
            if (!props.disableToggle) {
              props.toggleCollapse(event);
            }
          }
        }
      ) }),
      /* @__PURE__ */ jsx2("div", { className: "w-full", children: props.title })
    ] }),
    /* @__PURE__ */ jsx2("div", { className: props.isOpen ? "block mt-4 pt-4 border-t border-base-200" : "hidden", children: /* @__PURE__ */ jsx2("div", { children: props.children }) })
  ] });
};
var Collapse_default = Collapse;

// src/CardModal.tsx
import { useState as useState7 } from "react";

// src/dependencies/DependencyField.tsx
import React8, { useState as useState6 } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

// src/radio/FBRadioGroup.tsx
import React2 from "react";

// src/radio/FBRadioButton.tsx
import React from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function FBRadioButton(props) {
  const { label, value, checked, name, onChange, required, disabled, autoFocus } = props;
  const id = React.useId();
  const classes = classNames("form-control w-full", { disabled });
  return /* @__PURE__ */ jsx3("div", { className: classes, children: /* @__PURE__ */ jsxs3("label", { htmlFor: id, className: "label cursor-pointer justify-start gap-3", children: [
    /* @__PURE__ */ jsx3(
      "input",
      {
        id,
        type: "radio",
        name,
        value,
        checked,
        required,
        disabled,
        autoFocus,
        onChange: () => onChange(value),
        className: "radio radio-primary radio-sm"
      }
    ),
    /* @__PURE__ */ jsx3("span", { className: "label-text text-base", children: label })
  ] }) }, value);
}

// src/radio/FBRadioGroup.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
import { createElement } from "react";
function FBRadioGroup(props) {
  const { options, defaultValue, onChange, horizontal, id, autoFocus, disabled } = props;
  const name = React2.useId();
  const classes = classNames("fb-radio-group", {
    horizontal
  });
  let elementId = {};
  if (id) {
    elementId = { id };
  }
  return /* @__PURE__ */ jsx4("div", { ...elementId, className: `${classes} radio-group`, children: options.map((option, index) => /* @__PURE__ */ createElement(
    FBRadioButton,
    {
      value: option.value,
      label: option.label,
      ...elementId,
      name,
      key: option.value,
      checked: option.value === defaultValue,
      autoFocus: autoFocus && index === 1,
      onChange,
      disabled
    }
  )) });
}

// src/Tooltip.tsx
import { InformationCircleIcon, StarIcon } from "@heroicons/react/24/outline";
import { jsx as jsx5 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx5("span", { className: "tooltip tooltip-right tooltip-info z-50 before:max-w-xs", "data-tip": text, id, children: /* @__PURE__ */ jsx5(Icon, { className: "h-4 w-4 inline stroke-2 stroke-info" }) });
}

// src/dependencies/DependencyWarning.tsx
import React3, { useState as useState2 } from "react";

// src/utils.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
function parse(text) {
  if (!text) return {};
  return JSON.parse(text);
}
function stringify(obj) {
  if (!obj) return "{}";
  return JSON.stringify(obj);
}
function defaultDataProps(category, allFormInputs) {
  return allFormInputs[category].defaultDataSchema;
}
function defaultUiProps(category, allFormInputs) {
  return allFormInputs[category].defaultUiSchema;
}
function categoryType(category, allFormInputs) {
  return allFormInputs[category].type;
}
function getCardBody(category, allFormInputs) {
  return allFormInputs[category] && allFormInputs[category].cardBody || (() => null);
}
function categoryToNameMap(allFormInputs) {
  const categoryNameMap = {};
  Object.keys(allFormInputs).forEach((inputName) => {
    categoryNameMap[inputName] = allFormInputs[inputName].displayName;
  });
  return categoryNameMap;
}
function updateElementNames(elementArray) {
  const elementNames = elementArray.map((elem) => elem.name);
  return elementArray.map((elem) => {
    const newElem = elem;
    newElem.neighborNames = elementNames;
    return newElem;
  });
}
function generateCategoryHash(allFormInputs) {
  const categoryHash = {};
  Object.keys(allFormInputs).forEach((categoryName) => {
    const formInput = allFormInputs[categoryName];
    formInput.matchIf.forEach((match) => {
      match.types.forEach((type) => {
        const hash = `type:${type === "null" ? "" : type};widget:${match.widget || ""};field:${match.field || ""};format:${match.format || ""};$ref:${match.$ref ? "true" : "false"};enum:${match.enum ? "true" : "false"}`;
        if (categoryHash[hash]) {
          throw new Error(`Duplicate hash: ${hash}`);
        }
        categoryHash[hash] = categoryName;
      });
    });
  });
  return categoryHash;
}
function getCardCategory(cardProps, categoryHash) {
  const currentHash = `type:${cardProps.dataOptions.type || ""};widget:${cardProps.uiOptions["ui:widget"] || ""};field:${cardProps.uiOptions["ui:field"] || ""};format:${cardProps.dataOptions.format || ""};$ref:${cardProps.$ref !== void 0 ? "true" : "false"};enum:${cardProps.dataOptions.enum ? "true" : "false"}`;
  const category = categoryHash[currentHash];
  if (!category) {
    if (cardProps.$ref) return "ref";
    console.error(`No match for card': ${currentHash} among set`);
    return "shortAnswer";
  }
  return category;
}
var supportedPropertyParameters = /* @__PURE__ */ new Set([
  "title",
  "description",
  "enum",
  "minLength",
  "maxLength",
  "multipleOf",
  "minimum",
  "maximum",
  "format",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "type",
  "default",
  "pattern",
  "required",
  "properties",
  "items",
  "definitions",
  "$ref",
  "minItems",
  "maxItems",
  "enumNames",
  "dependencies",
  "$id",
  "$schema",
  "meta",
  "additionalProperties",
  "ontologyId"
]);
var supportedUiParameters = /* @__PURE__ */ new Set([
  "ui:order",
  "ui:widget",
  "ui:autofocus",
  "ui:autocomplete",
  "ui:options",
  "ui:field",
  "ui:placeholder",
  "ui:column",
  "items",
  "definitions"
]);
function checkObjectForUnsupportedFeatures(schema, uischema, supportedWidgets, supportedFields, supportedOptions) {
  const unsupportedFeatures = [];
  if (schema && typeof schema === "object") {
    Object.keys(schema).forEach((property) => {
      if (!supportedPropertyParameters.has(property) && property !== "properties") {
        unsupportedFeatures.push(`Unrecognized Object Property: ${property}`);
      }
    });
  }
  if (uischema && typeof uischema === "object") {
    Object.keys(uischema).forEach((uiProperty) => {
      let propDefined = false;
      if (schema.properties && Object.keys(schema.properties).includes(uiProperty)) {
        propDefined = true;
      }
      if (schema.dependencies) {
        Object.keys(schema.dependencies).forEach((dependencyKey) => {
          Object.keys(schema.dependencies[dependencyKey]).forEach((parameter) => {
            if (parameter === "oneOf") {
              schema.dependencies[dependencyKey].oneOf.forEach(
                (grouping) => {
                  if (grouping.properties) {
                    if (Object.keys(grouping.properties).includes(uiProperty)) {
                      propDefined = true;
                    }
                  }
                }
              );
            } else if (parameter === "properties") {
              if (Object.keys(schema.dependencies[dependencyKey].properties).includes(uiProperty)) {
                propDefined = true;
              }
            }
          });
        });
      }
      if (!propDefined && !supportedUiParameters.has(uiProperty)) {
        unsupportedFeatures.push(`Unrecognized UI schema property: ${uiProperty}`);
      }
    });
  }
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([parameter, element]) => {
      if (element && typeof element === "object" && element.type && element.type !== "object") {
        if (!["array", "string", "integer", "number", "boolean"].includes(element.type)) {
          unsupportedFeatures.push(`Unrecognized type: ${element.type} in ${parameter}`);
        }
        Object.keys(element).forEach((key) => {
          if (!supportedPropertyParameters.has(key)) {
            unsupportedFeatures.push(`Property Parameter: ${key} in ${parameter}`);
          }
        });
      } else {
        Object.keys(element).forEach((key) => {
          if (!supportedPropertyParameters.has(key)) {
            unsupportedFeatures.push(`Property Parameter: ${key} in ${parameter}`);
          }
        });
      }
      if (uischema && uischema[parameter] && element && (!element.type || element.type !== "object")) {
        Object.keys(uischema[parameter]).forEach((uiProp) => {
          if (!supportedUiParameters.has(uiProp)) {
            unsupportedFeatures.push(`UI Property: ${uiProp} for ${parameter}`);
          }
          if (uiProp === "ui:widget" && !supportedWidgets.has(uischema[parameter][uiProp])) {
            unsupportedFeatures.push(`UI Widget: ${uischema[parameter][uiProp]} for ${parameter}`);
          }
          if (uiProp === "ui:field" && !supportedFields.has(uischema[parameter][uiProp])) {
            unsupportedFeatures.push(`UI Field: ${uischema[parameter][uiProp]} for ${parameter}`);
          }
          if (uiProp === "ui:options") {
            Object.keys(uischema[parameter]["ui:options"]).forEach((uiOption) => {
              if (!supportedOptions.has(uiOption)) {
                unsupportedFeatures.push(`UI Property: ui:options.${uiOption} for ${parameter}`);
              }
            });
          }
        });
      }
    });
  }
  return unsupportedFeatures;
}
function checkForUnsupportedFeatures(schema, uischema, allFormInputs) {
  const unsupportedFeatures = [];
  const widgets = [];
  const fields = [];
  const options = [];
  Object.keys(allFormInputs).forEach((inputType) => {
    allFormInputs[inputType].matchIf.forEach((match) => {
      if (match.widget && !widgets.includes(match.widget)) {
        widgets.push(match.widget);
      }
      if (match.field && !fields.includes(match.field)) {
        fields.push(match.field);
      }
    });
    if (allFormInputs[inputType].possibleOptions && Array.isArray(allFormInputs[inputType].possibleOptions)) {
      options.push(...allFormInputs[inputType].possibleOptions);
    }
  });
  const supportedWidgets = new Set(widgets);
  const supportedFields = new Set(fields);
  const supportedOptions = new Set(options);
  if (schema && typeof schema === "object" && schema.type === "object") {
    unsupportedFeatures.push(
      ...checkObjectForUnsupportedFeatures(
        schema,
        uischema,
        supportedWidgets,
        supportedFields,
        supportedOptions
      )
    );
  } else {
    unsupportedFeatures.push("jsonSchema form is not of type object");
  }
  return unsupportedFeatures;
}
function generateDependencyElement(name, dataProps, uiProperties, requiredNames, categoryHash, definitionData, definitionUi, useDefinitionDetails = true) {
  let uiProps = {
    ...uiProperties
  };
  const newElement = {};
  let elementDetails = dataProps && typeof dataProps === "object" ? dataProps : {};
  if (elementDetails.$ref !== void 0 && definitionData) {
    const pathArr = typeof elementDetails.$ref === "string" ? elementDetails.$ref.split("/") : [];
    if (pathArr[0] === "#" && pathArr[1] === "definitions" && definitionData[pathArr[2]] && useDefinitionDetails === true) {
      elementDetails = {
        ...elementDetails,
        ...definitionData[pathArr[2]]
      };
    }
    const definedUiProps = (definitionUi || {})[pathArr[2]];
    uiProps = {
      ...definedUiProps || {},
      ...uiProps
    };
  }
  newElement.name = name;
  newElement.required = requiredNames.includes(name);
  newElement.$ref = typeof elementDetails.$ref === "string" ? elementDetails.$ref : void 0;
  if (elementDetails.type && elementDetails.type === "object") {
    newElement.schema = elementDetails;
    newElement.uischema = uiProps || {};
    newElement.propType = "section";
  } else {
    newElement.dataOptions = elementDetails;
    newElement.uiOptions = uiProps || {};
    const reservedKeys = Object.keys(newElement.dataOptions);
    Object.keys(newElement.uiOptions).forEach((uiKey) => {
      if (reservedKeys.includes(uiKey)) {
        newElement.uiOptions[`ui:*${uiKey}`] = newElement.uiOptions[uiKey];
      }
    });
    newElement.dataOptions.category = getCardCategory(newElement, categoryHash);
    newElement.propType = "card";
  }
  return newElement;
}
function generateElementPropsFromSchemas(parameters) {
  const { schema, uischema, definitionData, definitionUi, categoryHash } = parameters;
  if (!schema.properties) return [];
  const elementDict = {};
  const requiredNames = schema.required ? schema.required : [];
  Object.entries(schema.properties).forEach(([parameter, element]) => {
    const newElement = {};
    let elementDetails = element && typeof element === "object" ? element : {};
    if (elementDetails?.$ref !== void 0 && definitionData) {
      if (elementDetails.$ref && !elementDetails.$ref.startsWith("#/definitions")) {
        throw new Error(`Invalid definition, not at '#/definitions': ${elementDetails.$ref}`);
      }
      const pathArr = elementDetails.$ref !== void 0 ? elementDetails.$ref.split("/") : [];
      if (pathArr[0] === "#" && pathArr[1] === "definitions" && definitionData[pathArr[2]]) {
        elementDetails = {
          ...definitionData[pathArr[2]],
          ...elementDetails
        };
      }
      const definedUiProps = (definitionUi || {})[pathArr[2]];
      uischema[parameter] = {
        ...definedUiProps || {},
        ...uischema[parameter]
      };
    }
    newElement.name = parameter;
    newElement.required = requiredNames.includes(parameter);
    newElement.$ref = elementDetails.$ref;
    newElement.dataOptions = elementDetails;
    if (elementDetails.type && elementDetails.type === "object") {
      newElement.schema = elementDetails;
      newElement.uischema = uischema[parameter] || {};
      newElement.propType = "section";
    } else {
      newElement.uiOptions = uischema[parameter] || {};
      const reservedKeys = Object.keys(newElement.dataOptions);
      Object.keys(newElement.uiOptions).forEach((uiKey) => {
        if (reservedKeys.includes(uiKey)) {
          newElement.uiOptions[`ui:*${uiKey}`] = newElement.uiOptions[uiKey];
        }
      });
      newElement.dataOptions.category = getCardCategory(newElement, categoryHash);
      newElement.propType = "card";
    }
    elementDict[newElement.name] = newElement;
  });
  if (schema.dependencies) {
    const useDefinitionDetails = false;
    Object.keys(schema.dependencies).forEach((parent) => {
      const group = schema.dependencies[parent];
      if (group.oneOf) {
        let possibilityIndex = 0;
        group.oneOf.forEach((possibility) => {
          if (!(elementDict[parent] || {}).dependents) {
            elementDict[parent] = elementDict[parent] || {};
            elementDict[parent].dependents = [];
          }
          elementDict[parent].dependents.push({
            children: [],
            value: possibility.properties[parent]
          });
          const requiredValues = possibility.required || [];
          Object.entries(possibility.properties).forEach(([parameter, element]) => {
            if (!elementDict[parameter] || parameter !== parent && Object.keys(elementDict[parameter]).length === 1 && elementDict[parameter].dependents) {
              const newElement2 = generateDependencyElement(
                parameter,
                element,
                uischema[parameter],
                requiredNames,
                categoryHash,
                definitionData,
                definitionUi,
                useDefinitionDetails
              );
              if (elementDict[parameter] && elementDict[parameter].dependents) {
                newElement2.dependents = elementDict[parameter].dependents;
              }
              newElement2.required = requiredValues.includes(newElement2.name);
              elementDict[newElement2.name] = newElement2;
            }
            const newElement = elementDict[parameter];
            if (newElement && parameter !== parent) {
              newElement.dependent = true;
              newElement.parent = parent;
              elementDict[parent].dependents[possibilityIndex].children.push(parameter);
            }
          });
          possibilityIndex += 1;
        });
      } else if (group.properties) {
        const requiredValues = group.required || [];
        Object.entries(group.properties).forEach(([parameter, element]) => {
          const newElement = generateDependencyElement(
            parameter,
            element,
            uischema[parameter],
            requiredNames,
            categoryHash,
            definitionData,
            definitionUi,
            useDefinitionDetails
          );
          newElement.required = requiredValues.includes(newElement.name);
          newElement.dependent = true;
          newElement.parent = parent;
          elementDict[newElement.name] = newElement;
          if (elementDict[parent]) {
            if (elementDict[parent].dependents) {
              elementDict[parent].dependents[0].children.push(parameter);
            } else {
              elementDict[parent].dependents = [{ children: [parameter] }];
            }
          } else {
            elementDict[parent] = {};
            elementDict[parent].dependents = [{ children: [parameter] }];
          }
        });
      } else {
        console.error("unsupported dependency type encountered");
      }
    });
  }
  const cardPropList = [];
  if (uischema["ui:order"]) {
    const remainder = [];
    Object.keys(elementDict).forEach((name) => {
      if (!uischema["ui:order"].includes(name)) remainder.push(elementDict[name]);
    });
    uischema["ui:order"].forEach((name) => {
      if (name === "*") {
        remainder.forEach((remCard) => {
          cardPropList.push(remCard);
        });
      } else if (elementDict[name]) {
        cardPropList.push(elementDict[name]);
      }
    });
  } else {
    Object.keys(elementDict).forEach((name) => {
      cardPropList.push(elementDict[name]);
    });
  }
  updateElementNames(cardPropList);
  return cardPropList;
}
var nullableNumberParameters = /* @__PURE__ */ new Set([
  "multipleOf",
  "minimum",
  "exclusiveMinimum",
  "maximum",
  "exclusiveMaximum"
]);
function generateSchemaElementFromElement(element) {
  if (element.$ref !== void 0) {
    const title = element.schema !== void 0 && element.schema.title !== void 0 ? element.schema.title : element.dataOptions.title;
    const description = element.schema !== void 0 && element.schema.description !== void 0 ? element.schema.description : element.dataOptions.description;
    let returnElement = {
      $ref: element.$ref,
      title,
      description
    };
    const length = element?.schema?.required?.length;
    if (length !== void 0 && length > 0) {
      returnElement = { ...returnElement, required: element.schema.required };
    }
    return returnElement;
  } else if (element.propType === "card") {
    if (element.dataOptions.category === "section") {
      return {
        type: "object"
      };
    } else {
      const prop = {};
      Object.keys(element.dataOptions).forEach((key) => {
        if (![
          "category",
          "hideKey",
          "path",
          "definitionData",
          "definitionUi",
          "allFormInputs"
        ].includes(key) && element.dataOptions[key] !== "" && !(nullableNumberParameters.has(key) && element.dataOptions[key] === null))
          prop[key] = element.dataOptions[key];
      });
      return prop;
    }
  } else if (element.propType === "section") {
    return element.schema;
  } else {
    throw new Error("Element that is neither card, section, nor ref");
  }
}
function generateSchemaFromElementProps(elementArr) {
  if (!elementArr) return {};
  const newSchema = {};
  const props = {};
  const dependencies = {};
  const elementDict = {};
  const dependentElements = /* @__PURE__ */ new Set();
  for (let index = 0; index < elementArr.length; index += 1) {
    const element = elementArr[index];
    if (element?.name) {
      elementDict[element.name] = { ...element };
    }
    if (element.dependents)
      element.dependents.forEach((possibility) => {
        possibility.children.forEach((dependentElement) => {
          dependentElements.add(dependentElement);
        });
      });
  }
  Object.keys(elementDict).forEach((elementName) => {
    const element = elementDict[elementName];
    if (element.dependents && element.dependents[0]) {
      if (element.dependents[0].value) {
        dependencies[elementName] = {
          oneOf: element.dependents.map((possibility) => {
            const childrenComponents = {};
            const requiredValues = [];
            possibility?.children?.forEach((child) => {
              const childElement = elementDict[child];
              if (childElement) {
                childrenComponents[child] = generateSchemaElementFromElement(childElement);
                if (childElement.required) requiredValues.push(child);
              }
            });
            return {
              properties: {
                [elementName]: possibility.value,
                ...childrenComponents
              },
              required: requiredValues
            };
          })
        };
      } else {
        const childrenComponents = {};
        const requiredValues = [];
        element.dependents[0].children.forEach((child) => {
          childrenComponents[child] = generateSchemaElementFromElement(elementDict[child]);
          if (elementDict[child].required) requiredValues.push(child);
        });
        dependencies[elementName] = {
          properties: childrenComponents,
          required: requiredValues
        };
      }
    }
    if (!dependentElements.has(elementName)) {
      props[element.name] = generateSchemaElementFromElement(element);
    }
  });
  newSchema.properties = props;
  newSchema.dependencies = dependencies;
  newSchema.required = elementArr.filter(({ required, dependent }) => required && !dependent).map(({ name }) => name);
  return newSchema;
}
function generateUiSchemaFromElementProps(elementArr, definitionUi) {
  if (!elementArr) return {};
  const uiSchema = {};
  const uiOrder = [];
  const definitions = definitionUi;
  elementArr.forEach((element) => {
    uiOrder.push(element.name);
    if (element.$ref !== void 0) {
      const pathArr = typeof element.$ref === "string" ? element.$ref.split("/") : [];
      if (definitions && definitions[pathArr[2]]) {
        uiSchema[element.name] = definitions[pathArr[2]];
      }
    }
    if (element.propType === "card" && element.uiOptions) {
      Object.keys(element.uiOptions).forEach((uiOption) => {
        if (!uiSchema[element.name]) uiSchema[element.name] = {};
        if (uiOption.startsWith("ui:*")) {
          uiSchema[element.name][uiOption.substring(4)] = element.uiOptions[uiOption];
        } else {
          uiSchema[element.name][uiOption] = element.uiOptions[uiOption];
        }
      });
    } else if (element.propType === "section" && Object.keys(element.uischema).length > 0) {
      uiSchema[element.name] = element.uischema;
    }
  });
  uiSchema["ui:order"] = uiOrder;
  return uiSchema;
}
function getCardParameterInputComponentForType(category, allFormInputs) {
  return allFormInputs[category] && allFormInputs[category].modalBody || (() => null);
}
function updateSchemas(elementArr, parameters) {
  const { schema, uischema, onChange, definitionUi } = parameters;
  const newSchema = Object.assign({ ...schema }, generateSchemaFromElementProps(elementArr));
  const newUiSchema = generateUiSchemaFromElementProps(elementArr, definitionUi);
  if (uischema.definitions) {
    newUiSchema.definitions = uischema.definitions;
  }
  newSchema.type = "object";
  onChange(newSchema, newUiSchema);
}
var DEFAULT_INPUT_NAME = "newInput";
function getIdFromElementsBlock(elements) {
  const names = elements.map((element) => element.name);
  const defaultNameLength = DEFAULT_INPUT_NAME.length;
  return names.length > 0 ? Math.max(
    ...names.map((name) => {
      if (name.startsWith(DEFAULT_INPUT_NAME)) {
        const index = name.substring(defaultNameLength, name.length);
        const value = Number.parseInt(index);
        if (!isNaN(value)) {
          return value;
        }
      }
      return 0;
    })
  ) + 1 : 1;
}
function addCardObj(parameters) {
  const { schema, uischema, mods, onChange, definitionData, definitionUi, index, categoryHash } = parameters;
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash
  });
  const i = getIdFromElementsBlock(newElementObjArr);
  const dataOptions = getNewElementDefaultDataOptions(i, mods);
  const newElement = {
    name: `${DEFAULT_INPUT_NAME}${i}`,
    required: false,
    dataOptions,
    uiOptions: mods && mods.newElementDefaultUiSchema || {},
    propType: "card",
    schema: {},
    uischema: {},
    neighborNames: []
  };
  if (index !== void 0 && index !== null) {
    newElementObjArr.splice(index + 1, 0, newElement);
  } else {
    newElementObjArr.push(newElement);
  }
  const returnObj = newElementObjArr;
  updateSchemas(returnObj, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    onChange
  });
}
function addSectionObj(parameters) {
  const { schema, uischema, onChange, definitionData, definitionUi, index, categoryHash } = parameters;
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash
  });
  const i = getIdFromElementsBlock(newElementObjArr);
  const newElement = {
    name: `${DEFAULT_INPUT_NAME}${i}`,
    required: false,
    dataOptions: {
      title: `New Input ${i}`,
      type: "object",
      default: ""
    },
    uiOptions: {},
    propType: "section",
    schema: { title: `New Input ${i}`, type: "object" },
    uischema: {},
    neighborNames: []
  };
  if (index !== void 0 && index !== null) {
    newElementObjArr.splice(index + 1, 0, newElement);
  } else {
    newElementObjArr.push(newElement);
  }
  const returnObj = newElementObjArr;
  updateSchemas(returnObj, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    onChange
  });
}
function generateElementComponentsFromSchemas(parameters) {
  const {
    schemaData,
    uiSchemaData,
    onChange,
    definitionData,
    definitionUi,
    hideKey,
    path,
    cardOpenState,
    setCardOpenState,
    allFormInputs,
    mods,
    categoryHash,
    Card: Card2,
    Section: Section2
  } = parameters;
  const schema = parse(stringify(schemaData));
  const uischema = parse(stringify(uiSchemaData));
  if (!schema.properties) return [];
  const elementPropArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash
  });
  const elementList = elementPropArr.map((elementProp, index) => {
    const elementKey = `${path}_${elementProp.name}`;
    const addProperties = {
      schema,
      uischema,
      mods,
      onChange,
      definitionData: definitionData || {},
      definitionUi: definitionUi || {},
      index,
      categoryHash
    };
    const expanded = cardOpenState[elementKey] || false;
    if (elementProp.propType === "card") {
      const TypeSpecificParameters = getCardParameterInputComponentForType(
        elementProp.dataOptions.category || "string",
        allFormInputs
      );
      return /* @__PURE__ */ jsx6(
        Card2,
        {
          componentProps: Object.assign(
            {
              name: elementPropArr[index].name,
              required: elementPropArr[index].required,
              hideKey,
              path: `${path}_${elementPropArr[index].name}`,
              definitionData,
              definitionUi,
              neighborNames: elementPropArr[index].neighborNames,
              dependents: elementPropArr[index].dependents,
              dependent: elementPropArr[index].dependent,
              parent: elementPropArr[index].parent
            },
            elementPropArr[index].uiOptions,
            elementPropArr[index].dataOptions
          ),
          TypeSpecificParameters,
          onChange: (newCardObj) => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            const newDataProps = {};
            const newUiProps = {};
            Object.keys(newCardObj).forEach((propName) => {
              if (propName.startsWith("ui:")) {
                if (propName.startsWith("ui:*")) {
                  newUiProps[propName.substring(4)] = newCardObj[propName];
                } else {
                  newUiProps[propName] = newCardObj[propName];
                }
              } else if (![
                "name",
                "required",
                "neighborNames",
                "dependents",
                "dependent",
                "parent"
              ].includes(propName)) {
                newDataProps[propName] = newCardObj[propName];
              }
            });
            if (newElementObjArr[index].propType === "card") {
              const oldElement = newElementObjArr[index];
              newElementObjArr[index] = {
                ...oldElement,
                dataOptions: newDataProps,
                uiOptions: newUiProps,
                required: newCardObj.required,
                dependents: newCardObj.dependents,
                dependent: newCardObj.dependent,
                parent: newCardObj.parent,
                // Ensure name is always a string fallback
                name: newCardObj.name ?? "UnnamedInput",
                $ref: newCardObj.$ref,
                propType: "card",
                neighborNames: oldElement.neighborNames ?? [],
                schema: oldElement.schema ?? {},
                uischema: oldElement.uischema ?? {}
              };
            } else {
              throw new Error("Card editing non card element");
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          onDelete: () => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            newElementObjArr.splice(index, 1);
            const nextCardOpenState = { ...cardOpenState };
            delete nextCardOpenState[elementKey];
            setCardOpenState(nextCardOpenState);
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          onMoveUp: () => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            if (index === 0) return;
            const tempBlock = newElementObjArr[index - 1];
            if (newElementObjArr[index]) {
              newElementObjArr[index - 1] = newElementObjArr[index];
            }
            if (tempBlock) {
              newElementObjArr[index] = tempBlock;
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          onMoveDown: () => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            if (index === elementPropArr.length - 1) return;
            const tempBlock = newElementObjArr[index + 1];
            if (newElementObjArr[index]) {
              newElementObjArr[index + 1] = newElementObjArr[index];
            }
            if (tempBlock) {
              newElementObjArr[index] = tempBlock;
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          addElem: (choice) => {
            if (choice === "card") {
              addCardObj(addProperties);
            } else if (choice === "section") {
              addSectionObj(addProperties);
            }
          },
          cardOpen: expanded,
          setCardOpen: (newState) => setCardOpenState({
            ...cardOpenState,
            [elementKey]: newState
          }),
          allFormInputs,
          mods,
          addProperties
        },
        elementKey
      );
    } else if (elementProp.propType === "section") {
      const addProperties2 = {
        schema,
        uischema,
        mods,
        onChange,
        definitionData: definitionData || {},
        definitionUi: definitionUi || {},
        index,
        categoryHash
      };
      return /* @__PURE__ */ jsx6(
        Section2,
        {
          schema: elementProp.schema,
          uischema: elementProp.uischema,
          onChange: (newSchema, newUiSchema, newRef) => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            const oldSection = newElementObjArr[index];
            newElementObjArr[index] = {
              ...oldSection,
              name: oldSection.name ?? "UnnamedSection",
              required: oldSection.required ?? false,
              dataOptions: oldSection.dataOptions ?? {},
              uiOptions: oldSection.uiOptions ?? {},
              schema: newSchema,
              uischema: newUiSchema,
              propType: "section",
              neighborNames: oldSection.neighborNames ?? []
            };
            if (newRef) newElementObjArr[index].$ref = newRef;
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          onNameChange: (newName) => {
            const oldSection = elementProp;
            if (elementPropArr.map((elem) => elem.name).includes(newName)) return;
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            newElementObjArr[index] = {
              ...oldSection,
              name: newName
            };
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          onRequireToggle: () => {
            const oldSection = elementProp;
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            newElementObjArr[index] = {
              ...oldSection,
              required: !oldSection.required
            };
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          onDependentsChange: (newDependents) => {
            const oldSection = elementProp;
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            newElementObjArr[index] = {
              ...oldSection,
              dependents: newDependents
            };
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              onChange,
              definitionData,
              definitionUi
            });
          },
          onDelete: () => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            newElementObjArr.splice(index, 1);
            const nextCardOpenState = { ...cardOpenState };
            delete nextCardOpenState[elementKey];
            setCardOpenState(nextCardOpenState);
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          onMoveUp: () => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            if (index === 0) return;
            const tempBlock = newElementObjArr[index - 1];
            if (newElementObjArr[index]) {
              newElementObjArr[index - 1] = newElementObjArr[index];
            }
            if (tempBlock) {
              newElementObjArr[index] = tempBlock;
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          onMoveDown: () => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash
            });
            if (index === elementPropArr.length - 1) return;
            const tempBlock = newElementObjArr[index + 1];
            if (newElementObjArr[index]) {
              newElementObjArr[index + 1] = newElementObjArr[index];
            }
            if (tempBlock) {
              newElementObjArr[index] = tempBlock;
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              onChange
            });
          },
          name: elementProp.name,
          required: elementProp.required,
          path: `${path}_${elementProp.name}`,
          definitionData: definitionData || {},
          definitionUi: definitionUi || {},
          hideKey,
          reference: elementProp.$ref,
          neighborNames: elementProp.neighborNames,
          dependents: elementProp.dependents,
          dependent: elementProp.dependent,
          parent: elementProp.parent,
          parentProperties: addProperties2,
          cardOpen: expanded,
          setCardOpen: (newState) => setCardOpenState({
            ...cardOpenState,
            [elementKey]: newState
          }),
          allFormInputs,
          categoryHash,
          mods
        },
        elementKey
      );
    } else {
      return /* @__PURE__ */ jsx6("div", { children: /* @__PURE__ */ jsx6("h2", { children: " Error parsing element " }) }, elementKey);
    }
  });
  return elementList;
}
function onDragEnd(result, details) {
  const { schema, uischema, onChange, definitionData, definitionUi, categoryHash } = details;
  if (!result.destination) return;
  const src = result.source.index;
  const dest = result.destination.index;
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash
  });
  if (newElementObjArr[src] && newElementObjArr[dest]) {
    const tempBlock = newElementObjArr[src];
    newElementObjArr[src] = newElementObjArr[dest];
    newElementObjArr[dest] = tempBlock;
  }
  updateSchemas(newElementObjArr, {
    schema,
    uischema,
    definitionData: definitionData || {},
    definitionUi: definitionUi || {},
    onChange
  });
}
function subtractArray(array1, array2) {
  if (array2 === void 0 || array2 === null) return array1;
  const keys = array2.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: true
    }),
    {}
  );
  return array1.filter((v) => !keys[v]);
}
function excludeKeys(obj, keys) {
  if (!keys) return { ...obj };
  const keysHash = keys.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: true
    }),
    {}
  );
  return Object.keys(obj).reduce(
    (acc, curr) => keysHash[curr] ? acc : { ...acc, [curr]: obj[curr] },
    {}
  );
}
function getNewElementDefaultDataOptions(i, mods) {
  if (mods && mods.newElementDefaultDataOptions !== void 0) {
    const title = `${mods.newElementDefaultDataOptions.title} ${i}`;
    return { ...mods.newElementDefaultDataOptions, ...{ title } };
  } else {
    return {
      title: `New Input ${i}`,
      type: "string",
      default: ""
    };
  }
}
function getRandomId() {
  const chars = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
  ];
  const numberOfChars = chars.length;
  const randomIdLength = 50;
  return Array.from({ length: randomIdLength }).map(() => chars[Math.floor(Math.random() * numberOfChars)]).join("");
}
var DROPPABLE_TYPE = "rjsfb";

// src/dependencies/DependencyWarning.tsx
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
function DependencyWarning({
  parameters
}) {
  const [elementId] = useState2(getRandomId());
  if (parameters.enum && parameters.dependents && parameters.dependents.length && parameters.dependents[0].value) {
    const definedVals = /* @__PURE__ */ new Set([]);
    (parameters.dependents || []).forEach((possibility) => {
      if (possibility.value && possibility.value.enum)
        possibility.value.enum.forEach((val) => definedVals.add(val));
    });
    const undefinedVals = [];
    if (Array.isArray(parameters.enum))
      parameters.enum.forEach((val) => {
        if (!definedVals.has(val)) undefinedVals.push(val);
      });
    if (undefinedVals.length === 0) return null;
    return /* @__PURE__ */ jsxs4(React3.Fragment, { children: [
      /* @__PURE__ */ jsxs4("p", { children: [
        "Warning! The following values do not have associated dependency values:",
        " ",
        /* @__PURE__ */ jsx7(
          Tooltip,
          {
            id: `${elementId}_valuewarning`,
            type: "help",
            text: "Each possible value for a value-based dependency must be defined to work properly"
          }
        )
      ] }),
      /* @__PURE__ */ jsx7("ul", { children: undefinedVals.map((val, index) => /* @__PURE__ */ jsx7("li", { children: val }, index)) })
    ] });
  }
  return null;
}

// src/dependencies/DependencyPossibility.tsx
import { useState as useState5 } from "react";
import { XMarkIcon as XMarkIcon4 } from "@heroicons/react/24/outline";

// src/dependencies/CardSelector.tsx
import React4, { useState as useState3 } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// src/fieldLayout.ts
var fieldStackClass = "flex flex-col gap-4";
var fieldClass = "flex w-full min-w-0 flex-col gap-2 pb-1";
var fieldLabelClass = "text-[18px] font-bold leading-6";
var fieldControlClass = "w-full";

// src/dependencies/CardSelector.tsx
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
function CardSelector({
  possibleChoices,
  chosenChoices,
  onChange,
  placeholder
}) {
  const [elementId] = useState3(getRandomId());
  return /* @__PURE__ */ jsxs5(React4.Fragment, { children: [
    /* @__PURE__ */ jsx8("ul", { className: "flex flex-col gap-1", children: chosenChoices.map((chosenChoice, index) => /* @__PURE__ */ jsxs5("li", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx8("span", { className: "min-w-0 break-words", children: chosenChoice }),
      /* @__PURE__ */ jsx8(
        XMarkIcon,
        {
          className: "h-5 w-5 shrink-0 cursor-pointer stroke-warning hover:stroke-error transition-colors",
          onClick: () => onChange([...chosenChoices.slice(0, index), ...chosenChoices.slice(index + 1)])
        }
      )
    ] }, `${elementId}_neighbor_${index}`)) }),
    /* @__PURE__ */ jsxs5(
      "select",
      {
        value: "",
        onChange: (e) => {
          if (e.target.value) {
            onChange([...chosenChoices, e.target.value]);
          }
        },
        className: `select select-primary select-bordered select-sm ${fieldControlClass}`,
        children: [
          /* @__PURE__ */ jsx8("option", { value: "", disabled: true, children: placeholder }),
          possibleChoices.filter((choice) => !chosenChoices.includes(choice)).map((choice) => /* @__PURE__ */ jsx8("option", { value: choice, children: choice }, choice))
        ]
      }
    )
  ] });
}

// src/dependencies/ValueSelector.tsx
import { useState as useState4 } from "react";

// src/CardEnumOptions.tsx
import React5 from "react";
import { XMarkIcon as XMarkIcon2, PlusIcon } from "@heroicons/react/24/outline";
import { jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
function CardEnumOptions({
  initialValues,
  names,
  showNames,
  onChange,
  type
}) {
  const possibleValues = initialValues.map((value, index) => {
    let name = `${value}`;
    if (names && index < names.length) name = names[index] ?? "";
    return (
      //@ts-ignore
      /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx9(
          "input",
          {
            value: value === void 0 || value === null ? "" : value,
            placeholder: "Stored Value",
            type: type === "string" ? "text" : "number",
            onChange: (ev) => {
              let newVal;
              switch (type) {
                case "string":
                  newVal = ev.target.value;
                  break;
                case "number":
                case "integer":
                  newVal = parseFloat(ev.target.value);
                  if (Number.isInteger(newVal)) newVal = parseInt(ev.target.value, 10);
                  if (Number.isNaN(newVal)) newVal = type === "string" ? "" : 0;
                  break;
                default:
                  throw new Error(`Enum called with unknown type ${type}`);
              }
              onChange(
                [...initialValues.slice(0, index), newVal, ...initialValues.slice(index + 1)],
                names
              );
            },
            className: "input input-primary input-bordered input-sm w-full"
          },
          `val-${index}`
        ),
        /* @__PURE__ */ jsx9(
          "input",
          {
            value: name || "",
            placeholder: "Label",
            type: "text",
            onChange: (ev) => {
              if (names)
                onChange(initialValues, [
                  ...names.slice(0, index),
                  ev.target.value,
                  ...names.slice(index + 1)
                ]);
            },
            className: "input input-primary input-bordered input-sm w-full",
            style: { display: showNames ? "initial" : "none" }
          },
          `name-${index}`
        ),
        /* @__PURE__ */ jsx9(
          "span",
          {
            className: "cursor-pointer",
            onClick: () => {
              onChange(
                [...initialValues.slice(0, index), ...initialValues.slice(index + 1)],
                names ? [...names.slice(0, index), ...names.slice(index + 1)] : void 0
              );
            },
            children: /* @__PURE__ */ jsx9(XMarkIcon2, { className: "h-5 w-5 stroke-warning hover:stroke-error transition-colors" })
          }
        )
      ] }, index)
    );
  });
  return /* @__PURE__ */ jsxs6(React5.Fragment, { children: [
    possibleValues,
    /* @__PURE__ */ jsx9(
      "span",
      {
        className: "tooltip tooltip-right tooltip-info z-50 before:max-w-xs mt-2 inline-flex cursor-pointer",
        "data-tip": "Add new possible option",
        onClick: () => {
          onChange(
            [...initialValues, type === "string" ? "" : 0],
            names ? [...names, ""] : void 0
          );
        },
        children: /* @__PURE__ */ jsx9(
          PlusIcon,
          {
            className: "h-6 w-6 stroke-secondary transition-colors hover:stroke-primary",
            strokeWidth: 4
          }
        )
      }
    )
  ] });
}

// src/dependencies/ValueSelector.tsx
import { XMarkIcon as XMarkIcon3, PlusIcon as PlusIcon2 } from "@heroicons/react/24/outline";
import { jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
function ValueSelector({
  possibility,
  onChange,
  parentEnums,
  parentType,
  parentName,
  parentSchema
}) {
  const [elementId] = useState4(getRandomId());
  if (possibility.value) {
    if (parentEnums) {
      const enumType = typeof parentEnums[0] === "number" ? "number" : "string";
      if (enumType === "string")
        return /* @__PURE__ */ jsx10(
          CardSelector,
          {
            possibleChoices: parentEnums.map((val) => `${val}`),
            chosenChoices: possibility.value.enum,
            onChange: (chosenChoices) => onChange({ ...possibility, value: { enum: chosenChoices } }),
            placeholder: "Allowed value"
          }
        );
      if (enumType === "number")
        return /* @__PURE__ */ jsx10(
          CardSelector,
          {
            possibleChoices: parentEnums.map((val) => `${val}`),
            chosenChoices: possibility.value.enum,
            onChange: (chosenChoices) => onChange({
              ...possibility,
              value: {
                enum: chosenChoices.map((val) => Number.parseFloat(val))
              }
            }),
            placeholder: "Allowed value"
          }
        );
    }
    if (parentType === "boolean") {
      return /* @__PURE__ */ jsx10(
        FBCheckbox_default,
        {
          onChangeValue: () => {
            if (possibility.value.enum && possibility.value.enum[0]) {
              onChange({
                ...possibility,
                value: { enum: [false] }
              });
            } else {
              onChange({
                ...possibility,
                value: { enum: [true] }
              });
            }
          },
          isChecked: possibility.value.enum && possibility.value.enum[0],
          label: parentName
        }
      );
    }
    if (parentType === "object") {
      const enumArr = possibility.value.enum;
      const getInput = (val, index, key) => {
        switch (typeof val) {
          case "string":
            return /* @__PURE__ */ jsx10(
              "input",
              {
                value: val || "",
                placeholder: "String value",
                type: "text",
                onChange: (ev) => {
                  const newVal = ev.target.value;
                  const oldCombo = possibility.value.enum[index];
                  onChange({
                    ...possibility,
                    value: {
                      enum: [
                        ...enumArr.slice(0, index),
                        { ...oldCombo, [key]: newVal },
                        ...enumArr.slice(index + 1)
                      ]
                    }
                  });
                },
                className: "input input-bordered input-sm w-full"
              }
            );
            break;
          case "number":
            return /* @__PURE__ */ jsx10(
              "input",
              {
                value: val || "",
                placeholder: "Number value",
                type: "number",
                onChange: (ev) => {
                  const newVal = Number.parseFloat(ev.target.value);
                  const oldCombo = possibility.value.enum[index];
                  onChange({
                    ...possibility,
                    value: {
                      enum: [
                        ...enumArr.slice(0, index),
                        { ...oldCombo, [key]: newVal },
                        ...enumArr.slice(index + 1)
                      ]
                    }
                  });
                },
                className: "input input-bordered input-sm w-full"
              }
            );
            break;
          case "object":
            return /* @__PURE__ */ jsx10(
              "textarea",
              {
                value: JSON.stringify(val) || "",
                placeholder: "Object in JSON",
                onChange: (ev) => {
                  let newVal = val;
                  try {
                    newVal = JSON.parse(ev.target.value);
                  } catch {
                    console.error("invalid JSON object input");
                  }
                  const oldCombo = possibility.value.enum[index];
                  onChange({
                    ...possibility,
                    value: {
                      enum: [
                        ...enumArr.slice(0, index),
                        { ...oldCombo, [key]: newVal },
                        ...enumArr.slice(index + 1)
                      ]
                    }
                  });
                },
                className: "textarea textarea-bordered w-full"
              }
            );
            break;
        }
      };
      return /* @__PURE__ */ jsxs7("div", { children: [
        enumArr.map((combination, index) => /* @__PURE__ */ jsxs7("li", { children: [
          Object.keys(combination).map((key) => {
            const val = combination[key] ?? "";
            return /* @__PURE__ */ jsxs7("div", { children: [
              /* @__PURE__ */ jsxs7("h5", { children: [
                key,
                ":"
              ] }),
              getInput(val, index, key)
            ] }, key);
          }),
          /* @__PURE__ */ jsx10(
            XMarkIcon3,
            {
              className: "h-5 w-5 stroke-warning hover:stroke-error cursor-pointer mt-2",
              onClick: () => onChange({
                ...possibility,
                value: {
                  enum: [...enumArr.slice(0, index), ...enumArr.slice(index + 1)]
                }
              })
            }
          )
        ] }, `${elementId}_possibleValue${index}`)),
        /* @__PURE__ */ jsx10("div", { className: "flex justify-start", children: /* @__PURE__ */ jsx10(
          PlusIcon2,
          {
            className: "h-6 w-6 stroke-2 stroke-secondary hover:stroke-primary transition-colors cursor-pointer mt-4",
            onClick: () => {
              const newCase = {};
              const propArr = parentSchema ? parentSchema.properties : {};
              Object.keys(propArr).forEach((key) => {
                if (propArr[key].type === "number" || propArr[key].type === "integer") {
                  newCase[key] = 0;
                } else if (propArr[key].type === "array" || propArr[key].enum) {
                  newCase[key] = [];
                } else if (propArr[key].type === "object" || propArr[key].properties) {
                  newCase[key] = {};
                } else {
                  newCase[key] = "";
                }
              });
              onChange({
                ...possibility,
                value: { enum: [...enumArr, newCase] }
              });
            }
          }
        ) })
      ] });
    }
    return /* @__PURE__ */ jsx10(
      CardEnumOptions,
      {
        initialValues: possibility.value.enum,
        onChange: (newEnum) => onChange({ ...possibility, value: { enum: newEnum } }),
        type: parentType || "string",
        showNames: false
      }
    );
  } else {
    return /* @__PURE__ */ jsx10("h5", { children: " Appear if defined " });
  }
}

// src/dependencies/DependencyPossibility.tsx
import { jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
function DependencyPossibility({
  possibility,
  neighborNames,
  onChange,
  onDelete,
  parentEnums,
  parentType,
  parentName,
  parentSchema
}) {
  const [elementId] = useState5(getRandomId());
  return /* @__PURE__ */ jsxs8("div", { className: `form-dependency-condition relative rounded-box border border-primary p-4 ${fieldStackClass}`, children: [
    /* @__PURE__ */ jsxs8("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsxs8("div", { className: `${fieldLabelClass} flex items-center gap-2`, children: [
        "Display the following:",
        /* @__PURE__ */ jsx11(
          Tooltip,
          {
            id: `${elementId}_bulk`,
            type: "help",
            text: "Choose the other form items for the dependency"
          }
        )
      ] }),
      /* @__PURE__ */ jsx11(
        CardSelector,
        {
          possibleChoices: neighborNames.filter((name) => name !== parentName) || [],
          chosenChoices: possibility.children,
          onChange: (chosenChoices) => onChange({ ...possibility, children: [...chosenChoices] }),
          placeholder: "Choose a dependent..."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsxs8("div", { className: fieldLabelClass, children: [
        'If "',
        parentName,
        '" has ',
        possibility.value ? "the value:" : "a value."
      ] }),
      /* @__PURE__ */ jsx11("div", { style: { display: possibility.value ? "block" : "none" }, children: /* @__PURE__ */ jsx11(
        ValueSelector,
        {
          possibility,
          onChange: (newPossibility) => onChange(newPossibility),
          parentEnums,
          parentType,
          parentName,
          parentSchema
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsx11("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer", "data-tip": "Delete this dependency", children: /* @__PURE__ */ jsx11(XMarkIcon4, { className: "h-6 w-6 stroke-warning hover:stroke-error transition-colors", strokeWidth: 2, onClick: () => onDelete() }) }) })
  ] });
}

// src/dependencies/DependencyField.tsx
import { jsx as jsx12, jsxs as jsxs9 } from "react/jsx-runtime";
function checkIfValueBasedDependency(dependents) {
  let valueBased = true;
  if (dependents && Array.isArray(dependents) && dependents.length > 0) {
    dependents.forEach((possibility) => {
      if (!possibility.value || !possibility.value.enum) {
        valueBased = false;
      }
    });
  } else {
    valueBased = false;
  }
  return valueBased;
}
function DependencyField({
  parameters,
  onChange
}) {
  const [elementId] = useState6(getRandomId());
  const valueBased = checkIfValueBasedDependency(parameters.dependents || []);
  return /* @__PURE__ */ jsxs9("div", { className: `form-dependency dependencyField ${fieldClass}`, children: [
    /* @__PURE__ */ jsxs9("div", { className: `${fieldLabelClass} flex items-center gap-2`, children: [
      "Dependencies",
      /* @__PURE__ */ jsx12(
        Tooltip,
        {
          id: `${elementId}_dependent`,
          type: "help",
          text: "Control whether other form elements show based on this one"
        }
      )
    ] }),
    !!parameters.dependents && parameters.dependents.length > 0 && /* @__PURE__ */ jsx12(React8.Fragment, { children: /* @__PURE__ */ jsx12(
      FBRadioGroup,
      {
        defaultValue: valueBased ? "value" : "definition",
        horizontal: false,
        options: [
          {
            value: "definition",
            label: "Any value"
          },
          {
            value: "value",
            label: /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2", children: [
              "Specific value",
              /* @__PURE__ */ jsx12(
                Tooltip,
                {
                  id: `${elementId}_valuebased`,
                  type: "help",
                  text: "Specify whether these elements should show based on this element's value"
                }
              )
            ] })
          }
        ],
        onChange: (selection) => {
          if (parameters.dependents) {
            const newDependents = [...parameters.dependents];
            if (selection === "definition") {
              parameters.dependents.forEach((possibility, index) => {
                newDependents[index] = {
                  ...possibility,
                  value: void 0
                };
              });
            } else {
              parameters.dependents.forEach((possibility, index) => {
                newDependents[index] = {
                  ...possibility,
                  value: { enum: [] }
                };
              });
            }
            onChange({
              ...parameters,
              dependents: newDependents
            });
          }
        }
      }
    ) }),
    /* @__PURE__ */ jsx12(DependencyWarning, { parameters }),
    /* @__PURE__ */ jsxs9("div", { className: "form-dependency-conditions flex flex-col gap-4", children: [
      parameters.dependents ? parameters.dependents.map((possibility, index) => /* @__PURE__ */ jsx12(
        DependencyPossibility,
        {
          possibility,
          neighborNames: parameters.neighborNames || [],
          parentEnums: parameters.enum,
          parentType: parameters.type,
          parentName: parameters.name,
          parentSchema: parameters.schema,
          onChange: (newPossibility) => {
            const newDependents = parameters.dependents ? [...parameters.dependents] : [];
            newDependents[index] = newPossibility;
            onChange({
              ...parameters,
              dependents: newDependents
            });
          },
          onDelete: () => {
            const newDependents = parameters.dependents ? [...parameters.dependents] : [];
            onChange({
              ...parameters,
              dependents: [
                ...newDependents.slice(0, index),
                ...newDependents.slice(index + 1)
              ]
            });
          }
        },
        `${elementId}_possibility${index}`
      )) : "",
      /* @__PURE__ */ jsx12(
        "span",
        {
          className: "tooltip tooltip-right tooltip-info z-50 before:max-w-xs inline-flex self-start cursor-pointer",
          "data-tip": "Add another dependency relation linking this element and other form elements",
          id: `${elementId}_adddependency`,
          children: /* @__PURE__ */ jsx12(
            PlusCircleIcon,
            {
              className: "h-8 w-8 stroke-secondary stroke-2 fill-base-100 hover:stroke-primary transition-colors mt-2",
              onClick: () => {
                const newDependents = parameters.dependents ? [...parameters.dependents] : [];
                newDependents.push({
                  children: [],
                  value: valueBased ? { enum: [] } : void 0
                });
                onChange({
                  ...parameters,
                  dependents: newDependents
                });
              }
            }
          )
        }
      )
    ] })
  ] });
}

// src/CardModal.tsx
import { jsx as jsx13, jsxs as jsxs10 } from "react/jsx-runtime";
var CardModal = ({
  componentProps,
  onChange,
  isOpen,
  onClose,
  TypeSpecificParameters
}) => {
  const [componentPropsState, setComponentProps] = useState7(componentProps);
  const [prevComponentProps, setPrevComponentProps] = useState7(componentProps);
  if (componentProps !== prevComponentProps) {
    setPrevComponentProps(componentProps);
    setComponentProps(componentProps);
  }
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs10(
    "dialog",
    {
      className: `modal ${isOpen ? "modal-open" : ""}`,
      "data-test": "card-modal",
      onClick: (event) => event.stopPropagation(),
      onKeyDown: (event) => event.stopPropagation(),
      onMouseDown: (event) => event.stopPropagation(),
      onTouchStart: (event) => event.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs10("div", { className: "modal-box flex max-h-[calc(100vh-4rem)] w-11/12 max-w-3xl flex-col overflow-hidden", children: [
          /* @__PURE__ */ jsx13("div", { style: { display: componentProps.hideKey ? "none" : "initial" }, className: "mb-4 shrink-0 border-b border-base-200 pb-2", children: /* @__PURE__ */ jsx13("h3", { className: "text-xl font-bold", children: "Additional Settings" }) }),
          /* @__PURE__ */ jsxs10(
            "div",
            {
              className: `min-h-0 flex-1 overflow-y-auto px-1.5 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${fieldStackClass}`,
              children: [
                /* @__PURE__ */ jsx13(
                  TypeSpecificParameters,
                  {
                    parameters: componentPropsState,
                    onChange: (newState) => {
                      setComponentProps({
                        ...componentPropsState,
                        ...newState
                      });
                    }
                  }
                ),
                /* @__PURE__ */ jsxs10("div", { className: fieldClass, children: [
                  /* @__PURE__ */ jsxs10("div", { className: `${fieldLabelClass} flex items-center gap-2`, children: [
                    "Column Size",
                    /* @__PURE__ */ jsx13(
                      "a",
                      {
                        href: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        children: /* @__PURE__ */ jsx13(
                          Tooltip,
                          {
                            id: "column_size_tooltip",
                            type: "help",
                            text: "Set the column size of the item"
                          }
                        )
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx13(
                    "input",
                    {
                      value: componentPropsState["ui:column"] ? componentPropsState["ui:column"] : "",
                      placeholder: "Column Size",
                      type: "number",
                      min: 0,
                      onChange: (ev) => {
                        setComponentProps({
                          ...componentPropsState,
                          "ui:column": ev.target.value
                        });
                      },
                      className: `input input-primary input-bordered input-sm ${fieldControlClass}`
                    },
                    "ui:column"
                  )
                ] }),
                /* @__PURE__ */ jsx13(
                  DependencyField,
                  {
                    parameters: componentPropsState,
                    onChange: (newState) => {
                      setComponentProps({
                        ...componentPropsState,
                        ...newState
                      });
                    }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs10("div", { className: "modal-action shrink-0", children: [
            /* @__PURE__ */ jsx13(
              "button",
              {
                onClick: () => {
                  onClose();
                  setComponentProps(componentProps);
                },
                className: "btn btn-ghost",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx13(
              "button",
              {
                onClick: () => {
                  onClose();
                  onChange(componentPropsState);
                },
                className: "btn btn-primary",
                children: "Save"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx13("form", { method: "dialog", className: "modal-backdrop", children: /* @__PURE__ */ jsx13("button", { onClick: () => onClose(), children: "close" }) })
      ]
    }
  );
};
var CardModal_default = CardModal;

// src/CardGeneralParameterInputs.tsx
import React9 from "react";

// src/GeneralParameterInputs.tsx
import { jsx as jsx14 } from "react/jsx-runtime";
var GeneralParameterInputs = ({
  category,
  parameters,
  onChange,
  mods,
  allFormInputs
}) => {
  const CardBody = getCardBody(category, allFormInputs);
  return /* @__PURE__ */ jsx14("div", { className: "flex flex-col gap-2 pb-2 [&>h5]:text-[18px] [&>h5]:font-bold [&>h5]:leading-6 [&>input]:mt-0 [&>select]:mt-0 [&>textarea]:mt-0", children: /* @__PURE__ */ jsx14(CardBody, { parameters, onChange, mods: mods || {} }) });
};
var GeneralParameterInputs_default = GeneralParameterInputs;

// src/MarkdownDescriptionInput.tsx
import { useState as useState8 } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { jsx as jsx15, jsxs as jsxs11 } from "react/jsx-runtime";
function MarkdownDescriptionInput({
  value,
  onChange
}) {
  const [mode, setMode] = useState8("edit");
  return /* @__PURE__ */ jsxs11("div", { className: "form-description-wrapper", children: [
    /* @__PURE__ */ jsxs11("div", { className: "form-desc-toolbar flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsxs11("div", { className: "join", children: [
        /* @__PURE__ */ jsx15(
          "button",
          {
            type: "button",
            className: `btn btn-sm join-item ${mode === "edit" ? "btn-primary" : "btn-ghost"}`,
            onClick: () => setMode("edit"),
            children: "Edit"
          }
        ),
        /* @__PURE__ */ jsx15(
          "button",
          {
            type: "button",
            className: `btn btn-sm join-item ${mode === "preview" ? "btn-primary" : "btn-ghost"}`,
            onClick: () => setMode("preview"),
            children: "Preview"
          }
        )
      ] }),
      /* @__PURE__ */ jsx15("span", { className: "text-sm opacity-60 italic", children: "Supports Markdown" })
    ] }),
    mode === "edit" ? /* @__PURE__ */ jsx15(
      "textarea",
      {
        value,
        placeholder: "Description",
        rows: 4,
        className: "textarea textarea-primary textarea-bordered w-full form-description",
        onChange: (ev) => onChange(ev.target.value)
      }
    ) : /* @__PURE__ */ jsx15("div", { className: "markdown-display prose prose-sm max-w-none prose-p:m-0 dark:prose-invert textarea textarea-primary textarea-bordered w-full h-auto min-h-[6rem]", children: value ? /* @__PURE__ */ jsx15(ReactMarkdown, { remarkPlugins: [remarkGfm, remarkBreaks], children: value }) : /* @__PURE__ */ jsx15("span", { className: "text-base-content/40 italic", children: "Nothing to preview yet\u2026" }) })
  ] });
}

// src/CardGeneralParameterInputs.tsx
import { jsx as jsx16, jsxs as jsxs12 } from "react/jsx-runtime";
var entryRowClass = `card-entry-row ${fieldStackClass}`;
var entryClass = `card-entry ${fieldClass}`;
var entryLabelClass = fieldLabelClass;
var entryControlClass = fieldControlClass;
function CardGeneralParameterInputs({
  parameters,
  onChange,
  allFormInputs,
  mods,
  showObjectNameInput = true
}) {
  const [keyState, setKeyState] = React9.useState(parameters.name);
  const [keyError, setKeyError] = React9.useState(null);
  const [titleState, setTitleState] = React9.useState(parameters.title);
  const [elementId] = React9.useState(getRandomId());
  const categoryMap = categoryToNameMap(allFormInputs);
  const fetchLabel = (labelName, defaultLabel) => {
    return mods && mods.labels && typeof mods.labels[labelName] === "string" ? mods.labels[labelName] : defaultLabel;
  };
  const objectNameLabel = fetchLabel("objectNameLabel", "Variable Name");
  const displayNameLabel = fetchLabel("displayNameLabel", "Display Name");
  const descriptionLabel = fetchLabel("descriptionLabel", "Description");
  const inputTypeLabel = fetchLabel("inputTypeLabel", "Item Type");
  const availableInputTypes = () => {
    const definitionsInSchema = parameters.definitionData && Object.keys(parameters.definitionData).length !== 0;
    let inputKeys = Object.keys(categoryMap).filter((key) => key !== "ref" || definitionsInSchema);
    if (mods) inputKeys = subtractArray(inputKeys, mods.deactivatedFormInputs);
    const groupOrder = [
      "dateTime",
      "date",
      "time",
      "checkbox",
      "checkboxes",
      "radio",
      "dropdown",
      "shortAnswer",
      "password",
      "longAnswer",
      "integer",
      "number",
      //"array",
      "ref"
    ];
    return groupOrder.filter((key) => inputKeys.includes(key)).map((key) => ({ value: key, label: categoryMap[key] }));
  };
  return /* @__PURE__ */ jsxs12(React9.Fragment, { children: [
    /* @__PURE__ */ jsxs12("div", { className: entryRowClass, children: [
      showObjectNameInput && /* @__PURE__ */ jsxs12("div", { className: entryClass, children: [
        /* @__PURE__ */ jsxs12("h5", { className: entryLabelClass, children: [
          `${objectNameLabel} `,
          /* @__PURE__ */ jsx16(
            Tooltip,
            {
              text: mods && mods.tooltipDescriptions && typeof mods.tooltipDescriptions.cardObjectName === "string" ? mods.tooltipDescriptions.cardObjectName : "The name of the item when you download the data",
              id: `${elementId}_nameinfo`,
              type: "help"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs12("div", { className: "form-control w-full", children: [
          /* @__PURE__ */ jsx16(
            "input",
            {
              value: keyState || "",
              placeholder: "Key",
              type: "text",
              onChange: (ev) => setKeyState(ev.target.value),
              onBlur: (ev) => {
                const { value } = ev.target;
                if (value === parameters.name || !(parameters.neighborNames && parameters.neighborNames.includes(value))) {
                  setKeyError(null);
                  onChange({
                    ...parameters,
                    name: value
                  });
                } else {
                  setKeyState(parameters.name);
                  setKeyError(`"${value}" is already in use.`);
                  onChange({ ...parameters });
                }
              },
              className: `input input-primary input-bordered ${entryControlClass} card-text ${keyError !== null ? "input-error" : ""}`
            }
          ),
          keyError && /* @__PURE__ */ jsx16("div", { className: "label px-0 pb-0 pt-1", children: /* @__PURE__ */ jsx16("span", { className: "label-text-alt text-error", children: keyError }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs12("div", { className: entryClass, children: [
        /* @__PURE__ */ jsxs12("h5", { className: entryLabelClass, children: [
          `${displayNameLabel} `,
          /* @__PURE__ */ jsx16(
            Tooltip,
            {
              text: mods && mods.tooltipDescriptions && typeof mods.tooltipDescriptions.cardDisplayName === "string" ? mods.tooltipDescriptions.cardDisplayName : "The item name shown on the form",
              id: `${elementId}-titleinfo`,
              type: "help"
            }
          )
        ] }),
        /* @__PURE__ */ jsx16(
          "input",
          {
            value: titleState || "",
            placeholder: "Title",
            type: "text",
            onChange: (ev) => setTitleState(ev.target.value),
            onBlur: (ev) => {
              onChange({ ...parameters, title: ev.target.value });
            },
            className: `input input-primary input-bordered ${entryControlClass} card-text`
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs12("div", { className: `${entryRowClass} mt-4`, children: [
      /* @__PURE__ */ jsxs12("div", { className: entryClass, children: [
        /* @__PURE__ */ jsxs12("h5", { className: entryLabelClass, children: [
          `${descriptionLabel} `,
          /* @__PURE__ */ jsx16(
            Tooltip,
            {
              text: mods && mods.tooltipDescriptions && typeof mods.tooltipDescriptions.cardDescription === "string" ? mods.tooltipDescriptions.cardDescription : "This will appear as help text on the form",
              id: `${elementId}-descriptioninfo`,
              type: "help"
            }
          )
        ] }),
        /* @__PURE__ */ jsx16(
          MarkdownDescriptionInput,
          {
            value: parameters.description || "",
            onChange: (val) => onChange({ ...parameters, description: val })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12(
        "div",
        {
          className: classNames(entryClass, {
            "wide-card-entry": !showObjectNameInput
          }),
          children: [
            /* @__PURE__ */ jsxs12("h5", { className: entryLabelClass, children: [
              `${inputTypeLabel} `,
              /* @__PURE__ */ jsx16(
                Tooltip,
                {
                  text: mods && mods.tooltipDescriptions && typeof mods.tooltipDescriptions.cardInputType === "string" ? mods.tooltipDescriptions.cardInputType : "The type of item displayed on the form",
                  id: `${elementId}-inputinfo`,
                  type: "help"
                }
              )
            ] }),
            /* @__PURE__ */ jsx16(
              "select",
              {
                className: `select select-primary select-bordered ${entryControlClass}`,
                value: parameters.category,
                onChange: (e) => {
                  const newCategory = e.target.value;
                  const newProps = {
                    ...defaultUiProps(newCategory, allFormInputs),
                    ...defaultDataProps(newCategory, allFormInputs),
                    name: parameters.name,
                    required: parameters.required
                  };
                  if (newProps.$ref !== void 0 && !newProps.$ref) {
                    const firstDefinition = Object.keys(parameters.definitionData)[0];
                    newProps.$ref = `#/definitions/${firstDefinition || "empty"}`;
                  }
                  onChange({
                    ...newProps,
                    title: newProps.title || parameters.title,
                    description: parameters.description,
                    default: newProps.default || "",
                    type: newProps.type || categoryType(newCategory, allFormInputs),
                    category: newProps.category || newCategory
                  });
                },
                children: availableInputTypes().map((option) => /* @__PURE__ */ jsx16("option", { value: option.value, children: option.label }, option.value))
              }
            )
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx16("div", { className: "card-category-options mt-4 pb-1", children: /* @__PURE__ */ jsx16(
      GeneralParameterInputs_default,
      {
        category: parameters.category,
        parameters,
        onChange,
        mods,
        allFormInputs
      }
    ) }),
    /* @__PURE__ */ jsx16("div", { className: `${entryRowClass} mt-4`, children: /* @__PURE__ */ jsxs12("div", { className: entryClass, children: [
      /* @__PURE__ */ jsxs12("h5", { className: entryLabelClass, children: [
        "Ontology ID (Optional)",
        ` `,
        /* @__PURE__ */ jsx16(
          Tooltip,
          {
            text: "Bind this field to a standard ontology code (e.g., SNOMED:75367002). This drastically improves the reusability and semantic findability of your template!",
            id: `${elementId}-ontologyinfo`,
            type: "help"
          }
        )
      ] }),
      /* @__PURE__ */ jsx16(
        "input",
        {
          value: parameters.ontologyId || "",
          placeholder: "e.g. NCIT:C25150",
          type: "text",
          onChange: (ev) => onChange({ ...parameters, ontologyId: ev.target.value }),
          className: `input input-primary input-bordered ${entryControlClass} card-text`
        }
      )
    ] }) })
  ] });
}

// src/Add.tsx
import { useState as useState9, useEffect, useRef } from "react";
import { PlusIcon as PlusIcon3 } from "@heroicons/react/24/outline";
import { Fragment, jsx as jsx17, jsxs as jsxs13 } from "react/jsx-runtime";
function Add({
  addElem,
  hidden,
  tooltipDescription,
  labels
}) {
  const [popoverOpen, setPopoverOpen] = useState9(false);
  const [createChoice, setCreateChoice] = useState9("card");
  const containerRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverOpen]);
  if (hidden) return /* @__PURE__ */ jsx17(Fragment, {});
  return /* @__PURE__ */ jsxs13("div", { ref: containerRef, className: "relative flex flex-col items-center mt-4 w-full", children: [
    /* @__PURE__ */ jsx17(
      "div",
      {
        className: "group w-full py-2 flex justify-center cursor-pointer border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5 rounded-lg transition-all",
        onClick: () => setPopoverOpen(!popoverOpen),
        title: tooltipDescription || "Add a new item or section",
        children: /* @__PURE__ */ jsx17(PlusIcon3, { className: "h-6 w-6 text-base-content/50 group-hover:text-primary transition-colors" })
      }
    ),
    popoverOpen && /* @__PURE__ */ jsxs13("div", { className: "absolute top-12 z-50 p-4 shadow-xl bg-base-100 rounded-box w-64 border border-base-300", children: [
      /* @__PURE__ */ jsx17("div", { className: "font-bold text-center mb-4 border-b pb-2", children: "Create New" }),
      /* @__PURE__ */ jsx17(
        FBRadioGroup,
        {
          className: "choose-create text-sm",
          defaultValue: createChoice,
          horizontal: false,
          options: [
            {
              value: "card",
              label: labels?.addElementLabel ?? "Item"
            },
            {
              value: "section",
              label: labels?.addSectionLabel ?? "Section"
            }
          ],
          onChange: (selection) => {
            setCreateChoice(selection);
          }
        }
      ),
      /* @__PURE__ */ jsxs13("div", { className: "flex justify-between mt-4", children: [
        /* @__PURE__ */ jsx17("button", { onClick: () => setPopoverOpen(false), className: "btn btn-sm btn-outline btn-secondary", children: "Cancel" }),
        /* @__PURE__ */ jsx17(
          "button",
          {
            onClick: () => {
              addElem(createChoice);
              setPopoverOpen(false);
            },
            className: "btn btn-sm btn-primary",
            children: "Create"
          }
        )
      ] })
    ] })
  ] });
}

// src/Card.tsx
import { ArrowsPointingOutIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { jsx as jsx18, jsxs as jsxs14 } from "react/jsx-runtime";
function Card({
  componentProps,
  onChange,
  onDelete,
  TypeSpecificParameters,
  addElem,
  cardOpen,
  setCardOpen,
  allFormInputs,
  mods,
  showObjectNameInput = true,
  addProperties,
  dragHandleProps
}) {
  const [modalOpen, setModalOpen] = React11.useState(false);
  const [elementId] = React11.useState(getRandomId());
  return /* @__PURE__ */ jsxs14(React11.Fragment, { children: [
    /* @__PURE__ */ jsxs14(
      Collapse_default,
      {
        isOpen: cardOpen,
        toggleCollapse: () => setCardOpen(!cardOpen),
        title: /* @__PURE__ */ jsxs14("div", { className: "flex justify-between items-center w-full", children: [
          /* @__PURE__ */ jsxs14("span", { onClick: () => setCardOpen(!cardOpen), className: "text-lg font-bold cursor-pointer select-none", children: [
            componentProps.title || componentProps.name,
            " ",
            componentProps.parent ? /* @__PURE__ */ jsx18(
              Tooltip,
              {
                text: `Depends on ${componentProps.parent}`,
                id: `${elementId}_parentinfo`,
                type: "alert"
              }
            ) : "",
            componentProps.$ref !== void 0 ? /* @__PURE__ */ jsx18(
              Tooltip,
              {
                text: `Is an instance of pre-configured component ${componentProps.$ref}`,
                id: `${elementId}_refinfo`,
                type: "alert"
              }
            ) : ""
          ] }),
          /* @__PURE__ */ jsx18(
            "span",
            {
              ...dragHandleProps ?? {},
              className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-grab active:cursor-grabbing p-1",
              "data-tip": "Drag to move form item",
              id: `${elementId}_moveformcard`,
              children: /* @__PURE__ */ jsx18(
                ArrowsPointingOutIcon,
                {
                  className: "w-6 h-6 stroke-2 text-base-content/50 hover:text-base-content transition-colors",
                  onClick: () => {
                  }
                }
              )
            }
          )
        ] }),
        className: `card-container ${componentProps.dependent ? "card-dependent" : ""} ${componentProps.$ref === void 0 ? "" : "card-reference"}`,
        children: [
          /* @__PURE__ */ jsx18("div", { className: "cardEntries", children: /* @__PURE__ */ jsx18(
            CardGeneralParameterInputs,
            {
              parameters: componentProps,
              onChange,
              allFormInputs,
              mods,
              showObjectNameInput
            }
          ) }),
          /* @__PURE__ */ jsxs14("div", { className: "flex items-center justify-end gap-4 w-full mt-6 pt-4 border-t border-base-200", children: [
            /* @__PURE__ */ jsx18(
              FBCheckbox_default,
              {
                onChangeValue: () => onChange({
                  ...componentProps,
                  required: !componentProps.required
                }),
                isChecked: !!componentProps.required,
                label: "Required",
                id: `${elementId}_required`
              }
            ),
            /* @__PURE__ */ jsx18("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer p-1", "data-tip": "Additional configurations for this item", id: `${elementId}_editinfo`, children: /* @__PURE__ */ jsx18(PencilIcon, { className: "w-5 h-5 text-secondary hover:text-primary transition-colors", onClick: () => setModalOpen(true) }) }),
            /* @__PURE__ */ jsx18("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer p-1", "data-tip": "Delete item", id: `${elementId}_trashinfo`, children: /* @__PURE__ */ jsx18(TrashIcon, { className: "w-5 h-5 text-warning hover:text-error transition-colors", onClick: () => onDelete && onDelete() }) })
          ] }),
          /* @__PURE__ */ jsx18(
            CardModal_default,
            {
              componentProps,
              isOpen: modalOpen,
              onClose: () => setModalOpen(false),
              onChange: (newComponentProps) => {
                onChange(newComponentProps);
              },
              TypeSpecificParameters
            }
          )
        ]
      }
    ),
    mods?.components?.add && mods?.components?.add(addProperties),
    !mods?.components?.add && addElem && /* @__PURE__ */ jsx18(
      Add,
      {
        tooltipDescription: ((mods || {}).tooltipDescriptions || {}).add,
        addElem: (choice) => addElem(choice)
      }
    )
  ] });
}

// src/Section.tsx
import React13 from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// src/defaults/defaultInputs.tsx
import React12 from "react";
import { jsx as jsx19, jsxs as jsxs15 } from "react/jsx-runtime";
var CardDefaultParameterInputs = () => /* @__PURE__ */ jsx19("div", {});
var getInputCardBodyComponent = ({ type }) => function InputCardBodyComponent({
  parameters,
  onChange
}) {
  return /* @__PURE__ */ jsxs15(React12.Fragment, { children: [
    /* @__PURE__ */ jsx19("h5", { children: "Default Value" }),
    /* @__PURE__ */ jsx19(
      "input",
      {
        value: parameters.default || "",
        placeholder: "Default",
        type,
        onChange: (ev) => onChange({ ...parameters, default: ev.target.value }),
        className: "input input-primary input-bordered w-full"
      }
    )
  ] });
};
var Checkbox = ({ parameters, onChange }) => {
  return /* @__PURE__ */ jsx19("div", { className: "card-boolean", children: /* @__PURE__ */ jsx19(
    FBCheckbox_default,
    {
      onChangeValue: () => {
        onChange({
          ...parameters,
          default: parameters.default ? parameters.default !== true : true
        });
      },
      isChecked: parameters.default ? parameters.default === true : false,
      label: "Default Unchecked or Checked"
    }
  ) });
};
function MultipleChoice({
  parameters,
  onChange
}) {
  const enumArray = Array.isArray(parameters.enum) ? parameters.enum : [];
  const containsUnparsableString = enumArray.some((val) => {
    return isNaN(val);
  });
  const containsString = containsUnparsableString || enumArray.some((val) => typeof val === "string");
  const [isNumber, setIsNumber] = React12.useState(!!enumArray.length && !containsString);
  const [elementId] = React12.useState(getRandomId());
  return /* @__PURE__ */ jsxs15("div", { className: "card-enum", children: [
    /* @__PURE__ */ jsx19("h5", { children: "Possible Values" }),
    /* @__PURE__ */ jsx19(
      FBCheckbox_default,
      {
        onChangeValue: () => {
          if (Array.isArray(parameters.enumNames)) {
            onChange({
              ...parameters,
              enumNames: null
            });
          } else {
            onChange({
              ...parameters,
              enumNames: enumArray.map((val) => `${val}`)
            });
          }
        },
        isChecked: Array.isArray(parameters.enumNames),
        label: "Display different text label than the stored value",
        id: `${elementId}_different`
      }
    ),
    /* @__PURE__ */ jsx19("div", { className: containsUnparsableString || !enumArray.length ? "hidden" : "", children: /* @__PURE__ */ jsx19(
      FBCheckbox_default,
      {
        onChangeValue: () => {
          if (containsString || !isNumber) {
            try {
              const newEnum = enumArray.map((val) => {
                let newNum = 0;
                if (val) newNum = parseFloat(val) || 0;
                if (Number.isNaN(newNum)) throw new Error(`Could not convert ${val}`);
                return newNum;
              });
              setIsNumber(true);
              onChange({
                ...parameters,
                enum: newEnum
              });
            } catch (error) {
              console.error(error);
            }
          } else {
            const newEnum = enumArray.map((val) => `${val || 0}`);
            setIsNumber(false);
            onChange({
              ...parameters,
              enum: newEnum
            });
          }
        },
        isChecked: isNumber,
        disabled: containsUnparsableString,
        label: "Force number",
        id: `${elementId}_forceNumber`
      }
    ) }),
    /* @__PURE__ */ jsx19(
      CardEnumOptions,
      {
        initialValues: enumArray,
        names: Array.isArray(parameters.enumNames) ? parameters.enumNames.map((val) => `${val}`) : void 0,
        showNames: Array.isArray(parameters.enumNames),
        onChange: (newEnum, newEnumNames) => onChange({
          ...parameters,
          enum: newEnum,
          enumNames: newEnumNames
        }),
        type: isNumber ? "number" : "string"
      }
    )
  ] });
}
function MultipleChoiceArray({
  parameters,
  onChange
}) {
  const items = parameters.items || {};
  const enumArray = Array.isArray(items.enum) ? items.enum : [];
  const [elementId] = React12.useState(getRandomId());
  return /* @__PURE__ */ jsxs15("div", { className: "card-enum", children: [
    /* @__PURE__ */ jsx19("h5", { children: "Options" }),
    /* @__PURE__ */ jsx19(
      FBCheckbox_default,
      {
        onChangeValue: () => {
          const hasNames = Array.isArray(items.enumNames);
          onChange({
            ...parameters,
            items: {
              ...items,
              enumNames: hasNames ? null : enumArray.map((val) => `${val}`)
            }
          });
        },
        isChecked: Array.isArray(items.enumNames),
        label: "Display different text label than the stored value",
        id: `${elementId}_different`
      }
    ),
    /* @__PURE__ */ jsx19(
      CardEnumOptions,
      {
        initialValues: enumArray,
        names: Array.isArray(items.enumNames) ? items.enumNames.map((val) => `${val}`) : void 0,
        showNames: Array.isArray(items.enumNames),
        onChange: (newEnum, newEnumNames) => onChange({
          ...parameters,
          items: { ...items, enum: newEnum, enumNames: newEnumNames }
        }),
        type: "string"
      }
    )
  ] });
}
var defaultInputs = {
  dateTime: {
    displayName: "Date-Time",
    matchIf: [
      {
        types: ["string"],
        format: "date-time"
      }
    ],
    defaultDataSchema: {
      format: "date-time"
    },
    defaultUiSchema: {},
    type: "string",
    cardBody: getInputCardBodyComponent({ type: "datetime-local" }),
    modalBody: CardDefaultParameterInputs
  },
  date: {
    displayName: "Date",
    matchIf: [
      {
        types: ["string"],
        format: "date"
      }
    ],
    defaultDataSchema: {
      format: "date"
    },
    defaultUiSchema: {},
    type: "string",
    cardBody: getInputCardBodyComponent({ type: "date" }),
    modalBody: CardDefaultParameterInputs
  },
  time: {
    displayName: "Time",
    matchIf: [
      {
        types: ["string"],
        format: "time"
      }
    ],
    defaultDataSchema: {
      format: "time"
    },
    defaultUiSchema: {},
    type: "string",
    cardBody: getInputCardBodyComponent({ type: "time" }),
    modalBody: CardDefaultParameterInputs
  },
  checkbox: {
    displayName: "Yes / No",
    matchIf: [
      {
        types: ["boolean"]
      }
    ],
    defaultDataSchema: {},
    defaultUiSchema: {},
    type: "boolean",
    cardBody: Checkbox,
    modalBody: CardDefaultParameterInputs
  },
  checkboxes: {
    displayName: "Checkboxes (Multi-select)",
    matchIf: [
      {
        types: ["array"],
        widget: "checkboxes"
      }
    ],
    defaultDataSchema: {
      items: { type: "string", enum: [] },
      uniqueItems: true
    },
    defaultUiSchema: {
      "ui:widget": "checkboxes"
    },
    type: "array",
    cardBody: MultipleChoiceArray,
    modalBody: CardDefaultParameterInputs
  },
  radio: {
    displayName: "Radio (Single-select)",
    matchIf: [
      {
        types: ["string", "number", "integer", "array", "boolean", "null"],
        widget: "radio",
        enum: true
      }
    ],
    defaultDataSchema: { enum: [] },
    defaultUiSchema: {
      "ui:widget": "radio"
    },
    type: "string",
    cardBody: MultipleChoice,
    modalBody: CardDefaultParameterInputs
  },
  dropdown: {
    displayName: "Dropdown",
    matchIf: [
      {
        types: ["string", "number", "integer", "array", "boolean", "null"],
        enum: true
      }
    ],
    defaultDataSchema: { enum: [] },
    defaultUiSchema: {},
    type: "string",
    cardBody: MultipleChoice,
    modalBody: CardDefaultParameterInputs
  }
};
var defaultInputs_default = defaultInputs;

// src/Section.tsx
import { ArrowsPointingOutIcon as ArrowsPointingOutIcon2, PencilIcon as PencilIcon2, TrashIcon as TrashIcon2 } from "@heroicons/react/24/outline";
import { jsx as jsx20, jsxs as jsxs16 } from "react/jsx-runtime";
var sectionHeadClass = `section-head ${fieldStackClass}`;
var sectionEntryClass = `section-entry ${fieldClass}`;
var sectionLabelClass = fieldLabelClass;
var sectionControlClass = fieldControlClass;
function Section({
  name,
  required,
  schema,
  uischema,
  onChange,
  onNameChange,
  onRequireToggle,
  onDependentsChange,
  onDelete,
  path,
  definitionData,
  definitionUi,
  hideKey,
  reference,
  dependents,
  dependent,
  parent,
  parentProperties,
  neighborNames,
  cardOpen,
  setCardOpen,
  allFormInputs,
  mods,
  categoryHash,
  dragHandleProps
}) {
  const unsupportedFeatures = checkForUnsupportedFeatures(
    schema || {},
    uischema || {},
    allFormInputs
  );
  const schemaData = schema || {};
  const [cardOpenState, setCardOpenState] = React13.useState({});
  const [keyName, setKeyName] = React13.useState(name);
  const [keyError, setKeyError] = React13.useState(null);
  const [modalOpen, setModalOpen] = React13.useState(false);
  const [elementId] = React13.useState(getRandomId());
  const addProperties = {
    schema,
    uischema,
    mods,
    onChange,
    definitionData,
    definitionUi,
    categoryHash
  };
  const hideAddButton = schemaData.properties && Object.keys(schemaData.properties).length !== 0;
  return /* @__PURE__ */ jsxs16(React13.Fragment, { children: [
    /* @__PURE__ */ jsxs16(
      Collapse_default,
      {
        isOpen: cardOpen,
        toggleCollapse: () => setCardOpen(!cardOpen),
        title: /* @__PURE__ */ jsxs16("div", { className: "flex justify-between items-center w-full", children: [
          /* @__PURE__ */ jsxs16("span", { onClick: () => setCardOpen(!cardOpen), className: "text-xl font-bold cursor-pointer select-none", children: [
            schemaData.title || keyName,
            " ",
            parent ? /* @__PURE__ */ jsx20(
              Tooltip,
              {
                text: `Depends on ${parent}`,
                id: `${elementId}_parentinfo`,
                type: "alert"
              }
            ) : ""
          ] }),
          /* @__PURE__ */ jsx20(
            "span",
            {
              ...dragHandleProps ?? {},
              className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-grab active:cursor-grabbing p-1",
              "data-tip": "Drag to move section",
              id: `${elementId}_moveinfosection`,
              children: /* @__PURE__ */ jsx20(
                ArrowsPointingOutIcon2,
                {
                  className: "w-6 h-6 stroke-2 text-base-content/50 hover:text-base-content transition-colors",
                  onClick: () => {
                  }
                }
              )
            }
          )
        ] }),
        className: `section-container sectionContainer ${dependent ? "section-dependent" : ""} ${reference ? "section-reference" : ""}`,
        children: [
          /* @__PURE__ */ jsxs16("div", { className: `section-entries ${reference ? "section-reference" : ""}`, children: [
            /* @__PURE__ */ jsxs16("div", { className: sectionHeadClass, children: [
              reference ? /* @__PURE__ */ jsxs16("div", { className: `${sectionEntryClass} section-reference`, children: [
                /* @__PURE__ */ jsx20("h5", { className: sectionLabelClass, children: "Reference Section" }),
                /* @__PURE__ */ jsx20(
                  "select",
                  {
                    className: `select select-bordered ${sectionControlClass} text-primary border-primary border-2 bg-primary-content`,
                    value: reference,
                    onChange: (e) => {
                      onChange(schema, uischema, e.target.value);
                    },
                    children: Object.keys(definitionData).map((key) => /* @__PURE__ */ jsx20("option", { value: `#/definitions/${key}`, children: `#/definitions/${key}` }, `#/definitions/${key}`))
                  }
                )
              ] }) : "",
              /* @__PURE__ */ jsxs16("div", { className: sectionEntryClass, "data-test": "section-object-name", children: [
                /* @__PURE__ */ jsxs16("h5", { className: sectionLabelClass, children: [
                  "Section Variable Name",
                  " ",
                  /* @__PURE__ */ jsx20(
                    Tooltip,
                    {
                      text: mods && mods.tooltipDescriptions && mods.tooltipDescriptions && typeof mods.tooltipDescriptions.cardSectionObjectName === "string" ? mods.tooltipDescriptions.cardSectionObjectName : "The name in the downloaded data for this section.",
                      id: `${elementId}_nameinfo`,
                      type: "help"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs16("div", { className: "form-control w-full", children: [
                  /* @__PURE__ */ jsx20(
                    "input",
                    {
                      value: keyName || "",
                      placeholder: "Key",
                      type: "text",
                      onChange: (ev) => setKeyName(ev.target.value),
                      onBlur: (ev) => {
                        const { value } = ev.target;
                        if (value === name || !(neighborNames && neighborNames.includes(value))) {
                          setKeyError(null);
                          onNameChange(value);
                        } else {
                          setKeyName(name);
                          setKeyError(`"${value}" is already in use.`);
                          onNameChange(name);
                        }
                      },
                      className: `input input-primary input-bordered ${sectionControlClass} card-text ${keyError !== null ? "input-error" : ""}`,
                      readOnly: hideKey
                    }
                  ),
                  keyError && /* @__PURE__ */ jsx20("div", { className: "label px-0 pb-0 pt-1", children: /* @__PURE__ */ jsx20("span", { className: "label-text-alt text-error", children: keyError }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs16("div", { className: sectionEntryClass, "data-test": "section-display-name", children: [
                /* @__PURE__ */ jsxs16("h5", { className: sectionLabelClass, children: [
                  "Section Display Name",
                  " ",
                  /* @__PURE__ */ jsx20(
                    Tooltip,
                    {
                      text: mods && mods.tooltipDescriptions && mods.tooltipDescriptions && typeof mods.tooltipDescriptions.cardSectionDisplayName === "string" ? mods.tooltipDescriptions.cardSectionDisplayName : "The name of the section that will be shown to contributors completing the form.",
                      id: `${elementId}_titleinfo`,
                      type: "help"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx20(
                  "input",
                  {
                    value: schemaData.title || "",
                    placeholder: "Title",
                    type: "text",
                    onChange: (ev) => onChange(
                      {
                        ...schema,
                        title: ev.target.value
                      },
                      uischema
                    ),
                    className: `input input-primary input-bordered ${sectionControlClass} card-text`
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs16("div", { className: sectionEntryClass, "data-test": "section-description", children: [
                /* @__PURE__ */ jsxs16("h5", { className: sectionLabelClass, children: [
                  "Section Description",
                  " ",
                  /* @__PURE__ */ jsx20(
                    Tooltip,
                    {
                      text: mods && mods.tooltipDescriptions && mods.tooltipDescriptions && typeof mods.tooltipDescriptions.cardSectionDescription === "string" ? mods.tooltipDescriptions.cardSectionDescription : "A description of the section which will be visible on the form.",
                      id: `${elementId}_descriptioninfo`,
                      type: "help"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx20(
                  MarkdownDescriptionInput,
                  {
                    value: schemaData.description || "",
                    onChange: (val) => onChange({ ...schema, description: val }, uischema)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs16(
                "div",
                {
                  className: "alert alert-warning mb-4 mt-4 flex-col items-start",
                  style: {
                    display: unsupportedFeatures.length === 0 ? "none" : "flex"
                  },
                  children: [
                    /* @__PURE__ */ jsx20("h5", { className: "font-bold", children: "Unsupported Features:" }),
                    /* @__PURE__ */ jsx20("ul", { className: "list-disc pl-5", children: unsupportedFeatures.map((message) => /* @__PURE__ */ jsx20("li", { children: message }, `${elementId}_${message}`)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx20("div", { className: "section-body", children: /* @__PURE__ */ jsx20(
              DragDropContext,
              {
                onDragEnd: (result) => onDragEnd(result, {
                  schema,
                  uischema,
                  onChange,
                  definitionData,
                  definitionUi,
                  categoryHash
                }),
                children: /* @__PURE__ */ jsx20(Droppable, { droppableId: "droppable", type: DROPPABLE_TYPE, children: (providedDroppable) => /* @__PURE__ */ jsxs16(
                  "div",
                  {
                    ref: providedDroppable.innerRef,
                    ...providedDroppable.droppableProps,
                    className: "mt-4",
                    children: [
                      generateElementComponentsFromSchemas({
                        schemaData: schema,
                        uiSchemaData: uischema,
                        onChange,
                        path,
                        definitionData,
                        definitionUi,
                        cardOpenState,
                        setCardOpenState,
                        allFormInputs,
                        mods,
                        categoryHash,
                        Card,
                        Section
                      }).map((element, index) => (
                        // @ts-ignore: suppress key error, can't change key assignment
                        /* @__PURE__ */ jsx20(Draggable, { draggableId: element.key, index, children: (providedDraggable, snapshot) => /* @__PURE__ */ jsx20(
                          "div",
                          {
                            ref: providedDraggable.innerRef,
                            ...providedDraggable.draggableProps,
                            style: providedDraggable.draggableProps.style,
                            className: `pb-4 ${snapshot.isDragging && !snapshot.isDropAnimating ? "opacity-60" : ""}`,
                            children: React13.cloneElement(element, {
                              dragHandleProps: providedDraggable.dragHandleProps
                            })
                          }
                        ) }, element.key)
                      )),
                      providedDroppable.placeholder
                    ]
                  }
                ) })
              }
            ) }),
            /* @__PURE__ */ jsxs16("div", { className: "section-footer", children: [
              !hideAddButton && mods?.components?.add && mods.components.add(addProperties),
              !mods?.components?.add && /* @__PURE__ */ jsx20(
                Add,
                {
                  tooltipDescription: ((mods || {}).tooltipDescriptions || {}).add,
                  addElem: (choice) => {
                    if (choice === "card") {
                      addCardObj(addProperties);
                    } else if (choice === "section") {
                      addSectionObj(addProperties);
                    }
                  },
                  hidden: hideAddButton
                }
              )
            ] }),
            /* @__PURE__ */ jsx20("div", { className: "section-interactions", children: /* @__PURE__ */ jsxs16("div", { className: "flex items-center justify-end gap-4 w-full mt-6 pt-4 border-t border-base-200", children: [
              /* @__PURE__ */ jsx20(
                FBCheckbox_default,
                {
                  onChangeValue: () => onRequireToggle(),
                  isChecked: required,
                  label: "Required",
                  id: `${elementId}_required`
                }
              ),
              /* @__PURE__ */ jsx20("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer p-1", "data-tip": "Additional configurations for this section", id: `${elementId}_editinfo`, children: /* @__PURE__ */ jsx20(
                PencilIcon2,
                {
                  className: "w-5 h-5 text-secondary hover:text-primary transition-colors",
                  onClick: () => setModalOpen(true)
                }
              ) }),
              /* @__PURE__ */ jsx20("span", { className: "tooltip tooltip-left tooltip-info z-50 before:max-w-xs cursor-pointer p-1", "data-tip": "Delete section", id: `${elementId}_trashinfo`, children: /* @__PURE__ */ jsx20(
                TrashIcon2,
                {
                  className: "w-5 h-5 text-warning hover:text-error transition-colors",
                  onClick: () => onDelete ? onDelete() : {}
                }
              ) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx20(
            CardModal_default,
            {
              componentProps: {
                dependents,
                neighborNames,
                name: keyName,
                schema,
                type: "object",
                "ui:column": uischema["ui:column"] ?? "",
                "ui:options": uischema["ui:options"] ?? ""
              },
              isOpen: modalOpen,
              onClose: () => setModalOpen(false),
              onChange: (newComponentProps) => {
                onDependentsChange(newComponentProps.dependents);
                onChange(schema, {
                  ...uischema,
                  "ui:column": newComponentProps["ui:column"]
                });
              },
              TypeSpecificParameters: CardDefaultParameterInputs
            }
          )
        ]
      }
    ),
    mods?.components?.add && mods.components.add(parentProperties),
    !mods?.components?.add && /* @__PURE__ */ jsx20(
      Add,
      {
        tooltipDescription: ((mods || {}).tooltipDescriptions || {}).add,
        addElem: (choice) => {
          if (choice === "card") {
            addCardObj(parentProperties);
          } else if (choice === "section") {
            addSectionObj(parentProperties);
          }
          setCardOpen(false);
        }
      }
    )
  ] });
}

// src/defaults/shortAnswerInputs.tsx
import React15, { useState as useState11 } from "react";

// src/inputs/PlaceholderInput.tsx
import { useState as useState10 } from "react";
import { jsx as jsx21, jsxs as jsxs17 } from "react/jsx-runtime";
var PlaceholderInput = ({ parameters, onChange }) => {
  const [elementId] = useState10(getRandomId());
  return /* @__PURE__ */ jsxs17("div", { className: fieldClass, children: [
    /* @__PURE__ */ jsxs17("div", { className: fieldLabelClass, children: [
      "Placeholder",
      " ",
      /* @__PURE__ */ jsx21(
        "a",
        {
          href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder",
          target: "_blank",
          rel: "noopener noreferrer",
          children: /* @__PURE__ */ jsx21(
            Tooltip,
            {
              id: `${elementId}_placeholder`,
              type: "help",
              text: "Hint to the user as to what kind of information is expected in the field"
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsx21(
      "input",
      {
        value: parameters["ui:placeholder"] ? parameters["ui:placeholder"] : "",
        placeholder: "Placeholder",
        type: "text",
        onChange: (ev) => {
          onChange({
            ...parameters,
            "ui:placeholder": ev.target.value
          });
        },
        className: `input input-primary input-bordered input-sm ${fieldControlClass}`
      },
      "placeholder"
    )
  ] });
};

// src/defaults/shortAnswerInputs.tsx
import { jsx as jsx22, jsxs as jsxs18 } from "react/jsx-runtime";
var formatDictionary = {
  "": "None",
  email: "Email",
  hostname: "Hostname",
  uri: "URI",
  regex: "Regular Expression"
};
var formatTypeDictionary = {
  email: "email",
  url: "uri"
};
var autoDictionary = {
  "": "None",
  email: "Email",
  username: "User Name",
  password: "Password",
  "street-address": "Street Address",
  country: "Country"
};
var CardShortAnswerParameterInputs = ({ parameters, onChange }) => {
  const [elementId] = useState11(getRandomId());
  return /* @__PURE__ */ jsxs18("div", { className: fieldStackClass, children: [
    /* @__PURE__ */ jsxs18("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx22("div", { className: fieldLabelClass, children: "Minimum Length" }),
      /* @__PURE__ */ jsx22(
        "input",
        {
          value: parameters.minLength ? parameters.minLength : "",
          placeholder: "Minimum Length",
          type: "number",
          onChange: (ev) => {
            onChange({
              ...parameters,
              minLength: parseInt(ev.target.value, 10)
            });
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "minLength"
      )
    ] }),
    /* @__PURE__ */ jsxs18("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx22("div", { className: fieldLabelClass, children: "Maximum Length" }),
      /* @__PURE__ */ jsx22(
        "input",
        {
          value: parameters.maxLength ? parameters.maxLength : "",
          placeholder: "Maximum Length",
          type: "number",
          onChange: (ev) => {
            onChange({
              ...parameters,
              maxLength: parseInt(ev.target.value, 10)
            });
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "maxLength"
      )
    ] }),
    /* @__PURE__ */ jsxs18("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsxs18("div", { className: fieldLabelClass, children: [
        "Regular Expression Pattern",
        " ",
        /* @__PURE__ */ jsx22(
          "a",
          {
            href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions",
            target: "_blank",
            rel: "noopener noreferrer",
            children: /* @__PURE__ */ jsx22(
              Tooltip,
              {
                id: `${elementId}_regex`,
                type: "help",
                text: "Regular expression pattern that this must satisfy"
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsx22(
        "input",
        {
          value: parameters.pattern ? parameters.pattern : "",
          placeholder: "Regular Expression Pattern",
          type: "text",
          onChange: (ev) => {
            onChange({
              ...parameters,
              pattern: ev.target.value
            });
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "pattern"
      )
    ] }),
    /* @__PURE__ */ jsxs18("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsxs18("div", { className: fieldLabelClass, children: [
        "Format",
        " ",
        /* @__PURE__ */ jsx22(
          Tooltip,
          {
            id: `${elementId}_format`,
            type: "help",
            text: "Require string input to match a certain common format"
          }
        )
      ] }),
      /* @__PURE__ */ jsx22(
        "select",
        {
          className: `select select-primary select-bordered select-sm ${fieldControlClass}`,
          value: parameters.format || "",
          onChange: (e) => onChange({
            ...parameters,
            format: e.target.value
          }),
          children: Object.keys(formatDictionary).map((key) => /* @__PURE__ */ jsx22("option", { value: key, children: formatDictionary[key] }, key))
        }
      )
    ] }),
    /* @__PURE__ */ jsxs18("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsxs18("div", { className: fieldLabelClass, children: [
        "Auto Complete Category",
        " ",
        /* @__PURE__ */ jsx22(
          "a",
          {
            href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete",
            target: "_blank",
            rel: "noopener noreferrer",
            children: /* @__PURE__ */ jsx22(
              Tooltip,
              {
                id: `${elementId}_autocomplete`,
                type: "help",
                text: "Suggest entries based on the user's browser history"
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsx22(
        "select",
        {
          className: `select select-primary select-bordered select-sm ${fieldControlClass}`,
          value: parameters["ui:autocomplete"] || "",
          onChange: (e) => onChange({
            ...parameters,
            "ui:autocomplete": e.target.value
          }),
          children: Object.keys(autoDictionary).map((key) => /* @__PURE__ */ jsx22("option", { value: key, children: autoDictionary[key] }, key))
        }
      )
    ] }),
    /* @__PURE__ */ jsx22(PlaceholderInput, { parameters, onChange }),
    /* @__PURE__ */ jsx22("div", { className: `${fieldClass} card-modal-boolean`, children: /* @__PURE__ */ jsx22(
      FBCheckbox_default,
      {
        onChangeValue: () => {
          onChange({
            ...parameters,
            "ui:autofocus": parameters["ui:autofocus"] ? parameters["ui:autofocus"] !== true : true
          });
        },
        isChecked: parameters["ui:autofocus"] ? parameters["ui:autofocus"] === true : false,
        label: "Auto Focus"
      }
    ) })
  ] });
};
var ShortAnswerField = ({ parameters, onChange }) => {
  return /* @__PURE__ */ jsxs18(React15.Fragment, { children: [
    /* @__PURE__ */ jsx22("h5", { children: "Default Value" }),
    /* @__PURE__ */ jsx22(
      "input",
      {
        value: parameters.default ?? "",
        placeholder: "Default",
        type: formatTypeDictionary[parameters.format] || "text",
        onChange: (ev) => onChange({ ...parameters, default: ev.target.value }),
        className: "input input-primary input-bordered w-full"
      }
    )
  ] });
};
var Password = ({ parameters, onChange }) => {
  return /* @__PURE__ */ jsxs18(React15.Fragment, { children: [
    /* @__PURE__ */ jsx22("h5", { children: "Default Password" }),
    /* @__PURE__ */ jsx22(
      "input",
      {
        value: parameters.default ?? "",
        placeholder: "Default",
        type: "password",
        onChange: (ev) => onChange({ ...parameters, default: ev.target.value }),
        className: "input input-primary input-bordered w-full"
      }
    )
  ] });
};
var shortAnswerInput = {
  shortAnswer: {
    displayName: "Short Answer",
    matchIf: [
      {
        types: ["string"]
      },
      ...["email", "hostname", "uri", "regex"].map((format) => ({
        types: ["string"],
        format
      }))
    ],
    defaultDataSchema: {},
    defaultUiSchema: {},
    type: "string",
    cardBody: ShortAnswerField,
    modalBody: CardShortAnswerParameterInputs
  },
  password: {
    displayName: "Password",
    matchIf: [
      {
        types: ["string"],
        widget: "password"
      }
    ],
    defaultDataSchema: {},
    defaultUiSchema: {
      "ui:widget": "password"
    },
    type: "string",
    cardBody: Password,
    modalBody: CardShortAnswerParameterInputs
  }
};
var shortAnswerInputs_default = shortAnswerInput;

// src/defaults/longAnswerInputs.tsx
import React16, { useState as useState12 } from "react";
import { jsx as jsx23, jsxs as jsxs19 } from "react/jsx-runtime";
var CardLongAnswerParameterInputs = ({ parameters, onChange }) => {
  const [elementId] = useState12(getRandomId());
  return /* @__PURE__ */ jsxs19("div", { className: fieldStackClass, children: [
    /* @__PURE__ */ jsxs19("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx23("div", { className: fieldLabelClass, children: "Minimum Length" }),
      /* @__PURE__ */ jsx23(
        "input",
        {
          value: parameters.minLength ? parameters.minLength : "",
          placeholder: "Minimum Length",
          type: "number",
          onChange: (ev) => {
            onChange({
              ...parameters,
              minLength: parseInt(ev.target.value, 10)
            });
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "minLength"
      )
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx23("div", { className: fieldLabelClass, children: "Maximum Length" }),
      /* @__PURE__ */ jsx23(
        "input",
        {
          value: parameters.maxLength ? parameters.maxLength : "",
          placeholder: "Maximum Length",
          type: "number",
          onChange: (ev) => {
            onChange({
              ...parameters,
              maxLength: parseInt(ev.target.value, 10)
            });
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "maxLength"
      )
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsxs19("div", { className: fieldLabelClass, children: [
        "Regular Expression Pattern",
        " ",
        /* @__PURE__ */ jsx23("a", { href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions", children: /* @__PURE__ */ jsx23(
          Tooltip,
          {
            id: `${elementId}_regex`,
            type: "help",
            text: "Regular expression pattern that this must satisfy"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx23(
        "input",
        {
          value: parameters.pattern ? parameters.pattern : "",
          placeholder: "Regular Expression Pattern",
          type: "text",
          onChange: (ev) => {
            onChange({
              ...parameters,
              pattern: ev.target.value
            });
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "pattern"
      )
    ] }),
    /* @__PURE__ */ jsx23(PlaceholderInput, { parameters, onChange }),
    /* @__PURE__ */ jsx23("div", { className: `${fieldClass} card-modal-boolean`, children: /* @__PURE__ */ jsx23(
      FBCheckbox_default,
      {
        onChangeValue: () => {
          onChange({
            ...parameters,
            "ui:autofocus": parameters["ui:autofocus"] ? parameters["ui:autofocus"] !== true : true
          });
        },
        isChecked: parameters["ui:autofocus"] ? parameters["ui:autofocus"] === true : false,
        label: "Auto Focus"
      }
    ) })
  ] });
};
var LongAnswer = ({ parameters, onChange }) => {
  return /* @__PURE__ */ jsxs19(React16.Fragment, { children: [
    /* @__PURE__ */ jsx23("h5", { children: "Default Value" }),
    /* @__PURE__ */ jsx23(
      "textarea",
      {
        value: parameters.default ?? "",
        placeholder: "Default",
        onChange: (ev) => onChange({ ...parameters, default: ev.target.value }),
        className: "textarea textarea-primary textarea-bordered w-full"
      }
    )
  ] });
};
var longAnswerInput = {
  longAnswer: {
    displayName: "Long Answer",
    matchIf: [
      {
        types: ["string"],
        widget: "textarea"
      }
    ],
    defaultDataSchema: {},
    defaultUiSchema: {
      "ui:widget": "textarea"
    },
    type: "string",
    cardBody: LongAnswer,
    modalBody: CardLongAnswerParameterInputs
  }
};
var longAnswerInputs_default = longAnswerInput;

// src/defaults/numberInputs.tsx
import React17, { useState as useState13 } from "react";
import { jsx as jsx24, jsxs as jsxs20 } from "react/jsx-runtime";
var hasNumberValue = (value) => typeof value === "number";
var updateNumberParameter = (parameters, key, value, inactiveKey) => {
  const nextParameters = { ...parameters };
  if (inactiveKey) delete nextParameters[inactiveKey];
  if (value === null) {
    delete nextParameters[key];
  } else {
    nextParameters[key] = value;
  }
  return nextParameters;
};
var CardNumberParameterInputs = ({ parameters, onChange }) => {
  const [elementId] = useState13(getRandomId());
  return /* @__PURE__ */ jsxs20("div", { className: fieldStackClass, children: [
    /* @__PURE__ */ jsxs20("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsxs20("div", { className: fieldLabelClass, children: [
        "Multiple of",
        " ",
        /* @__PURE__ */ jsx24(
          Tooltip,
          {
            id: `${elementId}_multiple`,
            type: "help",
            text: "Require number to be a multiple of this number"
          }
        )
      ] }),
      /* @__PURE__ */ jsx24(
        "input",
        {
          value: parameters.multipleOf ? parameters.multipleOf : "",
          placeholder: "ex: 2",
          type: "number",
          onChange: (ev) => {
            let newVal = parseFloat(ev.target.value);
            if (Number.isNaN(newVal)) newVal = null;
            onChange(updateNumberParameter(parameters, "multipleOf", newVal));
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "multipleOf"
      )
    ] }),
    /* @__PURE__ */ jsxs20("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx24("div", { className: fieldLabelClass, children: "Minimum" }),
      /* @__PURE__ */ jsx24(
        "input",
        {
          value: parameters.minimum ?? parameters.exclusiveMinimum ?? "",
          placeholder: "ex: 3",
          type: "number",
          onChange: (ev) => {
            let newVal = parseFloat(ev.target.value);
            if (Number.isNaN(newVal)) newVal = null;
            if (hasNumberValue(parameters.exclusiveMinimum)) {
              onChange(
                updateNumberParameter(parameters, "exclusiveMinimum", newVal, "minimum")
              );
            } else {
              onChange(
                updateNumberParameter(parameters, "minimum", newVal, "exclusiveMinimum")
              );
            }
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "minimum"
      )
    ] }),
    /* @__PURE__ */ jsx24("div", { className: `${fieldClass} card-modal-boolean`, children: /* @__PURE__ */ jsx24(
      FBCheckbox_default,
      {
        onChangeValue: () => {
          const newMin = parameters.minimum ?? parameters.exclusiveMinimum;
          if (!hasNumberValue(newMin)) return;
          if (hasNumberValue(parameters.exclusiveMinimum)) {
            onChange(
              updateNumberParameter(parameters, "minimum", newMin, "exclusiveMinimum")
            );
          } else {
            onChange(
              updateNumberParameter(parameters, "exclusiveMinimum", newMin, "minimum")
            );
          }
        },
        isChecked: hasNumberValue(parameters.exclusiveMinimum),
        disabled: !hasNumberValue(parameters.minimum) && !hasNumberValue(parameters.exclusiveMinimum),
        label: "Exclusive Minimum"
      },
      "exclusiveMinimum"
    ) }),
    /* @__PURE__ */ jsxs20("div", { className: fieldClass, children: [
      /* @__PURE__ */ jsx24("div", { className: fieldLabelClass, children: "Maximum" }),
      /* @__PURE__ */ jsx24(
        "input",
        {
          value: parameters.maximum ?? parameters.exclusiveMaximum ?? "",
          placeholder: "ex: 8",
          type: "number",
          onChange: (ev) => {
            let newVal = parseFloat(ev.target.value);
            if (Number.isNaN(newVal)) newVal = null;
            if (hasNumberValue(parameters.exclusiveMaximum)) {
              onChange(
                updateNumberParameter(parameters, "exclusiveMaximum", newVal, "maximum")
              );
            } else {
              onChange(
                updateNumberParameter(parameters, "maximum", newVal, "exclusiveMaximum")
              );
            }
          },
          className: `input input-primary input-bordered input-sm ${fieldControlClass}`
        },
        "maximum"
      )
    ] }),
    /* @__PURE__ */ jsx24("div", { className: `${fieldClass} card-modal-boolean`, children: /* @__PURE__ */ jsx24(
      FBCheckbox_default,
      {
        onChangeValue: () => {
          const newMax = parameters.maximum ?? parameters.exclusiveMaximum;
          if (!hasNumberValue(newMax)) return;
          if (hasNumberValue(parameters.exclusiveMaximum)) {
            onChange(
              updateNumberParameter(parameters, "maximum", newMax, "exclusiveMaximum")
            );
          } else {
            onChange(
              updateNumberParameter(parameters, "exclusiveMaximum", newMax, "maximum")
            );
          }
        },
        isChecked: hasNumberValue(parameters.exclusiveMaximum),
        disabled: !hasNumberValue(parameters.maximum) && !hasNumberValue(parameters.exclusiveMaximum),
        label: "Exclusive Maximum"
      },
      "exclusiveMaximum"
    ) })
  ] });
};
var NumberField = ({ parameters, onChange }) => {
  return /* @__PURE__ */ jsxs20(React17.Fragment, { children: [
    /* @__PURE__ */ jsx24("h5", { children: "Default Number" }),
    /* @__PURE__ */ jsx24(
      "input",
      {
        value: parameters.default ?? "",
        placeholder: "Default",
        type: "number",
        onChange: (ev) => onChange({
          ...parameters,
          default: parseFloat(ev.target.value)
        }),
        className: "input input-primary input-bordered w-full"
      }
    )
  ] });
};
var numberInputs = {
  integer: {
    displayName: "Integer",
    matchIf: [
      {
        types: ["integer"]
      },
      {
        types: ["integer"],
        widget: "number"
      }
    ],
    defaultDataSchema: {},
    defaultUiSchema: {},
    type: "integer",
    cardBody: NumberField,
    modalBody: CardNumberParameterInputs
  },
  number: {
    displayName: "Number",
    matchIf: [
      {
        types: ["number"]
      }
    ],
    defaultDataSchema: {},
    defaultUiSchema: {},
    type: "number",
    cardBody: NumberField,
    modalBody: CardNumberParameterInputs
  }
};
var numberInputs_default = numberInputs;

// src/defaults/referenceInputs.tsx
import { jsx as jsx25 } from "react/jsx-runtime";
var CardReferenceParameterInputs = ({ parameters, onChange }) => {
  return /* @__PURE__ */ jsx25("div", { children: /* @__PURE__ */ jsx25(PlaceholderInput, { parameters, onChange }) });
};
var RefChoice = ({ parameters, onChange }) => {
  const pathArr = (parameters.$ref || "").split("/");
  const currentValueLabel = pathArr.length === 3 && pathArr[0] === "#" && pathArr[1] === "definitions" && pathArr[2] && (parameters.definitionData || {})[pathArr[2]] ? parameters.definitionData[pathArr[2]].title || parameters.$ref : parameters.$ref;
  return /* @__PURE__ */ jsx25("div", { className: "card-select", children: /* @__PURE__ */ jsx25(
    "select",
    {
      className: "select select-bordered w-full text-primary border-primary border-2 bg-primary-content",
      value: parameters.$ref || "",
      onChange: (e) => onChange({ ...parameters, $ref: e.target.value }),
      children: Object.keys(parameters.definitionData || {}).map((key) => /* @__PURE__ */ jsx25("option", { value: `#/definitions/${key}`, children: parameters.definitionData[key].title || `#/definitions/${key}` }, key))
    }
  ) });
};
var referenceInputs = {
  ref: {
    displayName: "Reference",
    matchIf: [
      {
        types: ["null"],
        $ref: true
      }
    ],
    defaultDataSchema: {
      $ref: "",
      title: "",
      description: ""
    },
    defaultUiSchema: {},
    type: "string",
    cardBody: RefChoice,
    modalBody: CardReferenceParameterInputs
  }
};
var referenceInputs_default = referenceInputs;

// src/defaults/defaultFormInputs.ts
var DEFAULT_FORM_INPUTS = {
  ...defaultInputs_default,
  ...referenceInputs_default,
  ...shortAnswerInputs_default,
  ...longAnswerInputs_default,
  ...numberInputs_default
  //...arrayInputs,
};
var defaultFormInputs_default = DEFAULT_FORM_INPUTS;

// src/FormBuilder.tsx
import { jsx as jsx26, jsxs as jsxs21 } from "react/jsx-runtime";
function FormBuilder({
  schema,
  uiSchema,
  onMount,
  onChange,
  mods,
  className
}) {
  const schemaData = parse(schema);
  schemaData.type = "object";
  const uiSchemaData = parse(uiSchema);
  const allFormInputs = excludeKeys(
    Object.assign({}, defaultFormInputs_default, mods && mods.customFormInputs || {}),
    mods && mods.deactivatedFormInputs
  );
  const unsupportedFeatures = checkForUnsupportedFeatures(
    schemaData,
    uiSchemaData,
    allFormInputs
  ).filter(
    (msg) => !msg.includes("Object Property: _stapleSchema") && !msg.includes("Property Parameter: readOnly in _stapleSchema") && !msg.includes("UI Widget: hidden for _stapleSchema") && !msg.includes("UI schema property: _stapleSchema") && !msg.includes("allOf")
  );
  const [cardOpenState, setCardOpenState] = React18.useState({});
  const categoryHash = generateCategoryHash(allFormInputs);
  const isFirstRender = React18.useRef(true);
  const addProperties = {
    schema: schemaData,
    uischema: uiSchemaData,
    mods,
    onChange: (newSchema, newUiSchema) => onChange(stringify(newSchema), stringify(newUiSchema)),
    definitionData: schemaData.definitions,
    definitionUi: uiSchemaData.definitions,
    categoryHash
  };
  const hideAddButton = schemaData.properties && Object.keys(schemaData.properties).length !== 0;
  useEffect2(() => {
    if (isFirstRender.current) {
      if (onMount)
        onMount({
          categoryHash
        });
      isFirstRender.current = false;
    }
  }, [onMount, categoryHash]);
  return /* @__PURE__ */ jsxs21("div", { className: `formBuilder ${className || ""}`, children: [
    /* @__PURE__ */ jsxs21(
      "div",
      {
        className: "alert alert-warning mb-4 flex-col items-start",
        style: {
          display: unsupportedFeatures.length === 0 ? "none" : "flex"
        },
        children: [
          /* @__PURE__ */ jsx26("h5", { className: "font-bold", children: "Unsupported Features:" }),
          /* @__PURE__ */ jsx26("ul", { className: "list-disc pl-5", children: unsupportedFeatures.map((message, index) => /* @__PURE__ */ jsx26("li", { children: message }, index)) })
        ]
      }
    ),
    (!mods || mods.showFormHead !== false) && /* @__PURE__ */ jsxs21("div", { className: "formHead", "data-test": "form-head", children: [
      /* @__PURE__ */ jsxs21("div", { children: [
        /* @__PURE__ */ jsx26("h5", { "data-test": "form-name-label", className: "font-semibold mb-2", children: mods && mods.labels && typeof mods.labels.formNameLabel === "string" ? mods.labels.formNameLabel : "Form Name" }),
        /* @__PURE__ */ jsx26(
          "input",
          {
            value: schemaData.title || "",
            placeholder: "Title",
            type: "text",
            onChange: (ev) => {
              onChange(
                stringify({
                  ...schemaData,
                  title: ev.target.value
                }),
                uiSchema
              );
            },
            className: "input input-primary input-bordered w-full form-title mb-4"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs21("div", { children: [
        /* @__PURE__ */ jsx26("h5", { "data-test": "form-description-label", className: "font-semibold mb-2", children: mods && mods.labels && typeof mods.labels.formDescriptionLabel === "string" ? mods.labels.formDescriptionLabel : "Form Description" }),
        /* @__PURE__ */ jsx26(
          MarkdownDescriptionInput,
          {
            value: schemaData.description || "",
            onChange: (val) => onChange(
              stringify({
                ...schemaData,
                description: val
              }),
              uiSchema
            )
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx26("div", { className: "form-body formBody mt-6", children: /* @__PURE__ */ jsx26(
      DragDropContext2,
      {
        onDragEnd: (result) => onDragEnd(result, {
          schema: schemaData,
          uischema: uiSchemaData,
          onChange: (newSchema, newUiSchema) => onChange(stringify(newSchema), stringify(newUiSchema)),
          definitionData: schemaData.definitions,
          definitionUi: uiSchemaData.definitions,
          categoryHash
        }),
        children: /* @__PURE__ */ jsx26(Droppable2, { droppableId: "droppable", type: DROPPABLE_TYPE, children: (providedDroppable) => /* @__PURE__ */ jsxs21(
          "div",
          {
            ref: providedDroppable.innerRef,
            ...providedDroppable.droppableProps,
            className: "mb-4",
            children: [
              generateElementComponentsFromSchemas({
                schemaData,
                uiSchemaData,
                onChange: (newSchema, newUiSchema) => onChange(stringify(newSchema), stringify(newUiSchema)),
                definitionData: schemaData.definitions,
                definitionUi: uiSchemaData.definitions,
                path: "root",
                cardOpenState,
                setCardOpenState,
                allFormInputs,
                mods,
                categoryHash,
                Card,
                Section
              }).map((element, index) => (
                // @ts-ignore: suppress key error, can't change key assignment
                /* @__PURE__ */ jsx26(Draggable2, { draggableId: element.key, index, children: (providedDraggable, snapshot) => /* @__PURE__ */ jsx26(
                  "div",
                  {
                    ref: providedDraggable.innerRef,
                    ...providedDraggable.draggableProps,
                    style: providedDraggable.draggableProps.style,
                    className: `pb-4 ${snapshot.isDragging && !snapshot.isDropAnimating ? "opacity-60" : ""}`,
                    children: React18.cloneElement(element, {
                      dragHandleProps: providedDraggable.dragHandleProps
                    })
                  }
                ) }, element.key)
              )),
              providedDroppable.placeholder
            ]
          }
        ) })
      }
    ) }),
    /* @__PURE__ */ jsxs21("div", { className: "form-footer formFooter", children: [
      !hideAddButton && mods?.components?.add && mods.components.add(addProperties),
      !mods?.components?.add && /* @__PURE__ */ jsx26(
        Add,
        {
          tooltipDescription: ((mods || {}).tooltipDescriptions || {}).add,
          labels: mods?.labels ?? {},
          addElem: (choice) => {
            if (choice === "card") {
              addCardObj(addProperties);
            } else if (choice === "section") {
              addSectionObj(addProperties);
            }
          },
          hidden: hideAddButton
        }
      )
    ] })
  ] });
}

// src/FormStudio.tsx
init_FormStudioContext();
import { lazy, Suspense, useState as useState16, useEffect as useEffect3, useRef as useRef2 } from "react";

// src/FormPreview.tsx
import React20 from "react";
import { withTheme } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

// src/DaisyTheme.tsx
import {
  getTemplate,
  getUiOptions,
  getSubmitButtonOptions,
  schemaRequiresTrueValue,
  descriptionId,
  ariaDescribedByIds,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
  enumOptionsDeselectValue,
  enumOptionsValueForIndex,
  optionId
} from "@rjsf/utils";
import ReactMarkdown2 from "react-markdown";
import remarkGfm2 from "remark-gfm";
import remarkBreaks2 from "remark-breaks";
import { jsx as jsx28, jsxs as jsxs22 } from "react/jsx-runtime";
var REQUIRED_FIELD_SYMBOL = " *";
function Label(props) {
  const { label, required, id } = props;
  if (!label) {
    return null;
  }
  return /* @__PURE__ */ jsxs22("label", { className: "text-lg font-bold", htmlFor: id, children: [
    label,
    required && /* @__PURE__ */ jsx28("span", { className: "font-red italic", children: REQUIRED_FIELD_SYMBOL })
  ] });
}
function MyTitleField(props) {
  const { id, title, required } = props;
  return /* @__PURE__ */ jsxs22("legend", { id, className: "text-xl font-bold", children: [
    title,
    required && /* @__PURE__ */ jsx28("span", { className: "required", children: REQUIRED_FIELD_SYMBOL })
  ] });
}
function MyDescriptionField(props) {
  const { id, description } = props;
  if (!description) {
    return null;
  }
  if (typeof description === "string") {
    return /* @__PURE__ */ jsx28(
      "div",
      {
        id,
        className: "markdown-display prose max-w-none dark:prose-invert text-md italic mb-2",
        children: /* @__PURE__ */ jsx28(ReactMarkdown2, { remarkPlugins: [remarkGfm2, remarkBreaks2], children: description })
      }
    );
  } else {
    return /* @__PURE__ */ jsx28("div", { id, className: "text-md italic", children: description });
  }
}
function MyFieldTemplate(props) {
  const {
    id,
    label,
    children,
    errors,
    help,
    description,
    hidden,
    required,
    displayLabel,
    registry,
    uiSchema
  } = props;
  const uiOptions = getUiOptions(uiSchema);
  const WrapIfAdditionalTemplate = getTemplate(
    "WrapIfAdditionalTemplate",
    registry,
    uiOptions
  );
  if (hidden) {
    return /* @__PURE__ */ jsx28("div", { className: "hidden", children });
  }
  return /* @__PURE__ */ jsxs22(WrapIfAdditionalTemplate, { ...props, children: [
    displayLabel && /* @__PURE__ */ jsx28(Label, { label, required, id }),
    displayLabel && description ? description : null,
    children,
    errors,
    help
  ] });
}
function MySubmitButton({ uiSchema }) {
  const {
    submitText,
    norender,
    props: submitButtonProps = {}
  } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return /* @__PURE__ */ jsx28("div", { children: /* @__PURE__ */ jsx28(
    "button",
    {
      type: "submit",
      ...submitButtonProps,
      className: `btn btn-primary ${submitButtonProps.className || ""}`,
      children: submitText
    }
  ) });
}
var MyTextWidget = (props) => {
  return /* @__PURE__ */ jsx28("div", { className: "flex", children: /* @__PURE__ */ jsx28(
    "input",
    {
      type: "text",
      style: { fontSize: "1rem" },
      className: "input input-primary input-bordered w-full mt-2",
      value: props.value || "",
      required: props.required,
      onChange: (event) => props.onChange(event.target.value)
    }
  ) });
};
var MyEmailWidget = (props) => {
  return /* @__PURE__ */ jsx28("div", { className: "flex", children: /* @__PURE__ */ jsx28(
    "input",
    {
      type: "email",
      style: { fontSize: "1rem" },
      className: "input input-primary input-bordered w-full mt-2",
      value: props.value || "",
      required: props.required,
      onChange: (event) => props.onChange(event.target.value)
    }
  ) });
};
var MyCheckboxWidget = (props) => {
  const {
    id,
    value,
    disabled,
    readonly,
    label,
    hideLabel,
    onChange,
    onBlur,
    onFocus,
    options,
    schema,
    uiSchema,
    registry
  } = props;
  const DescriptionFieldTemplate = getTemplate("DescriptionFieldTemplate", registry, options);
  const description = options.description ?? schema.description;
  const required = schemaRequiresTrueValue(schema);
  return /* @__PURE__ */ jsxs22("div", { className: "field-checkbox", children: [
    !hideLabel && label && /* @__PURE__ */ jsxs22("label", { className: "text-lg font-bold block mb-1", htmlFor: id, children: [
      label,
      required && /* @__PURE__ */ jsx28("span", { className: "italic", children: REQUIRED_FIELD_SYMBOL })
    ] }),
    !hideLabel && !!description && /* @__PURE__ */ jsx28(
      DescriptionFieldTemplate,
      {
        id: descriptionId(id),
        description,
        schema,
        uiSchema,
        registry
      }
    ),
    /* @__PURE__ */ jsx28("label", { className: "flex items-center gap-2 mt-1 cursor-pointer", children: /* @__PURE__ */ jsx28(
      "input",
      {
        type: "checkbox",
        id,
        name: id,
        checked: typeof value === "undefined" ? false : value,
        required,
        disabled: disabled || readonly,
        "aria-describedby": ariaDescribedByIds(id),
        onChange: (e) => onChange(e.target.checked),
        onBlur: (e) => onBlur(id, e.target.checked),
        onFocus: (e) => onFocus(id, e.target.checked)
      }
    ) })
  ] });
};
var MyCheckboxesWidget = (props) => {
  const {
    id,
    disabled,
    options,
    value,
    readonly,
    onChange,
    onBlur,
    onFocus,
    autofocus = false
  } = props;
  const { enumOptions, enumDisabled, emptyValue } = options;
  const checkboxesValues = Array.isArray(value) ? value : [value];
  return /* @__PURE__ */ jsx28("div", { className: "checkboxes-group", id, children: Array.isArray(enumOptions) && enumOptions.map((option, index) => {
    const checked = enumOptionsIsSelected(option.value, checkboxesValues);
    const itemDisabled = Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1;
    const disabledCls = disabled || itemDisabled || readonly ? "disabled" : "";
    return /* @__PURE__ */ jsxs22("label", { className: `checkboxes-option ${disabledCls}`, children: [
      /* @__PURE__ */ jsx28(
        "input",
        {
          type: "checkbox",
          id: optionId(id, index),
          name: id,
          checked,
          value: String(index),
          disabled: disabled || itemDisabled || readonly,
          autoFocus: autofocus && index === 0,
          onChange: (event) => {
            if (event.target.checked) {
              onChange(enumOptionsSelectValue(index, checkboxesValues, enumOptions));
            } else {
              onChange(enumOptionsDeselectValue(index, checkboxesValues, enumOptions));
            }
          },
          onBlur: ({ target: { value: v } }) => onBlur(id, enumOptionsValueForIndex(v, enumOptions, emptyValue)),
          onFocus: ({ target: { value: v } }) => onFocus(id, enumOptionsValueForIndex(v, enumOptions, emptyValue)),
          "aria-describedby": ariaDescribedByIds(id)
        }
      ),
      /* @__PURE__ */ jsx28("span", { children: option.label })
    ] }, index);
  }) });
};
var myTemplates = {
  TitleFieldTemplate: MyTitleField,
  DescriptionFieldTemplate: MyDescriptionField,
  FieldTemplate: MyFieldTemplate,
  ButtonTemplates: {
    SubmitButton: MySubmitButton
    // AddButton: DefaultTemplate,
    // CopyButton: DefaultTemplate,
    // MoveDownButton: DefaultTemplate,
    // MoveUpButton: DefaultTemplate,
    // RemoveButton: DefaultTemplate,
  }
  // ArrayFieldTemplate: DefaultTemplate,
  // ArrayFieldDescriptionTemplate: DefaultTemplate,
  // ArrayFieldItemTemplate: DefaultTemplate,
  // ArrayFieldTitleTemplate: DefaultTemplate,
  // ObjectFieldTemplate: DefaultTemplate,
  // ErrorListTemplate: DefaultTemplate,
  // BaseInputTemplate: DefaultTemplate,
  // UnsupportedFieldTemplate: DefaultTemplate,
  // FieldErrorTemplate: DefaultTemplate,
  // FieldHelpTemplate: DefaultTemplate,
  // WrapIfAdditionalTemplate: DefaultTemplate,
};
var myWidgets = {
  TextWidget: MyTextWidget,
  EmailWidget: MyEmailWidget,
  CheckboxWidget: MyCheckboxWidget,
  CheckboxesWidget: MyCheckboxesWidget
};
var DaisyTheme = {
  widgets: myWidgets,
  templates: myTemplates
};
var DaisyTheme_default = DaisyTheme;

// src/FormPreview.tsx
init_FormStudioContext();
import { jsx as jsx29 } from "react/jsx-runtime";
var ThemedForm = withTheme(DaisyTheme_default);
var hideSubmitButton = (uiSchema) => {
  return {
    ...uiSchema,
    "ui:submitButtonOptions": {
      norender: true
    }
  };
};
function FormPreview() {
  const { state, setFormData } = useFormStudio();
  const uiSchema = React20.useMemo(() => hideSubmitButton(state.uiSchema), [state.uiSchema]);
  if (!state.schema || Object.keys(state.schema).length === 0) {
    return /* @__PURE__ */ jsx29("div", { className: "flex items-center justify-center h-full bg-base-200 rounded-box border border-base-300 p-8", children: /* @__PURE__ */ jsx29("p", { className: "text-base-content/60 italic", children: "No form defined to preview." }) });
  }
  const handleChange = ({ formData }) => {
    setFormData(formData);
  };
  return /* @__PURE__ */ jsx29("div", { className: "h-full overflow-y-auto pt-2 pb-8", children: /* @__PURE__ */ jsx29(
    ThemedForm,
    {
      schema: state.schema,
      uiSchema,
      formData: state.formData,
      onChange: handleChange,
      validator
    }
  ) });
}

// src/FormStudio.tsx
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { jsx as jsx31, jsxs as jsxs24 } from "react/jsx-runtime";
var JsonEditor2 = lazy(() => Promise.resolve().then(() => (init_JsonEditor(), JsonEditor_exports)));
function JsonEditorFallback() {
  return /* @__PURE__ */ jsx31("div", { className: "flex items-center justify-center h-full w-full bg-base-200 rounded-lg border border-base-300", children: /* @__PURE__ */ jsx31("span", { className: "loading loading-spinner text-primary loading-lg" }) });
}
function FormStudioUI({
  onAutoSave,
  onSave,
  onSaveNewVersion,
  onCancel,
  mods,
  saveStatus
}) {
  const { state, setSchema, setUiSchema } = useFormStudio();
  const [activeTab, setActiveTab] = useState16("builder");
  const [hasVisitedJson, setHasVisitedJson] = useState16(false);
  if (activeTab === "json" && !hasVisitedJson) {
    setHasVisitedJson(true);
  }
  const isInitialMount = useRef2(true);
  const lastBufferedStateRef = useRef2("");
  useEffect3(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastBufferedStateRef.current = JSON.stringify({ schema: state.schema, uiSchema: state.uiSchema });
      return;
    }
    if (!onAutoSave) return;
    const currentStateStr = JSON.stringify({ schema: state.schema, uiSchema: state.uiSchema });
    if (currentStateStr === lastBufferedStateRef.current) {
      return;
    }
    const handler = setTimeout(async () => {
      try {
        await onAutoSave(state);
        lastBufferedStateRef.current = currentStateStr;
      } catch (e) {
        console.error("Recovery buffer write failed", e);
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [state.schema, state.uiSchema, onAutoSave, state]);
  return /* @__PURE__ */ jsxs24("div", { className: "flex flex-col w-full h-full animate-in fade-in duration-300 bg-base-100 border border-base-200 rounded-xl shadow-sm overflow-hidden", children: [
    /* @__PURE__ */ jsxs24("div", { className: "flex flex-col md:flex-row justify-between items-end border-b border-base-200 px-4 pt-4 bg-base-200 gap-4", children: [
      /* @__PURE__ */ jsxs24("div", { className: "tabs tabs-bordered w-full md:w-auto", children: [
        /* @__PURE__ */ jsx31(
          "button",
          {
            className: `tab tab-lg transition-all font-semibold ${activeTab === "builder" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`,
            onClick: () => setActiveTab("builder"),
            children: "Visual Builder"
          }
        ),
        /* @__PURE__ */ jsx31(
          "button",
          {
            className: `tab tab-lg transition-all font-semibold ${activeTab === "json" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`,
            onClick: () => setActiveTab("json"),
            children: "JSON Editor"
          }
        ),
        /* @__PURE__ */ jsx31(
          "button",
          {
            className: `tab tab-lg transition-all font-semibold ${activeTab === "preview" ? "tab-active text-primary" : "text-base-content/60 hover:text-base-content/80"}`,
            onClick: () => setActiveTab("preview"),
            children: "Live Preview"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs24("div", { className: "flex items-center gap-3 pb-3", children: [
        saveStatus !== void 0 && /* @__PURE__ */ jsxs24(
          "div",
          {
            className: "flex items-center mr-1 bg-base-100 px-3 py-1.5 rounded-full border border-base-300 shadow-sm min-w-[160px] justify-center transition-all",
            title: saveStatus === "unsaved" ? "Backed up in browser \xB7 not yet saved to your collection" : void 0,
            children: [
              saveStatus === "synced" && /* @__PURE__ */ jsxs24("span", { className: "text-xs font-medium text-base-content/60 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx31(CheckCircleIcon, { className: "w-4 h-4 text-success/80" }),
                "All changes saved"
              ] }),
              saveStatus === "saving" && /* @__PURE__ */ jsxs24("span", { className: "text-xs font-medium text-base-content/70 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx31("span", { className: "loading loading-spinner loading-xs text-primary" }),
                "Saving\u2026"
              ] }),
              saveStatus === "unsaved" && /* @__PURE__ */ jsxs24("span", { className: "text-xs font-medium text-warning flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx31(ExclamationCircleIcon, { className: "w-4 h-4" }),
                "Unsaved changes"
              ] })
            ]
          }
        ),
        onCancel && /* @__PURE__ */ jsx31("button", { className: "btn btn-secondary btn-outline transition-all ml-2", onClick: onCancel, children: "Cancel" }),
        onSave && /* @__PURE__ */ jsx31("div", { className: "tooltip tooltip-bottom", "data-tip": "Overwrites the current version of this schema.", children: /* @__PURE__ */ jsx31("button", { className: "btn btn-ghost border border-base-300 hover:border-base-content/30 shadow-sm transition-all", onClick: () => onSave(state), children: "Save Changes" }) }),
        onSaveNewVersion && /* @__PURE__ */ jsx31("div", { className: "tooltip tooltip-bottom tooltip-primary", "data-tip": "Preserves current history and saves edits as a brand new version.", children: /* @__PURE__ */ jsx31("button", { className: "btn btn-primary shadow-sm hover:shadow-md transition-all", onClick: () => onSaveNewVersion(state), children: "Save as New Version" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs24("div", { className: "flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden p-6", children: [
      /* @__PURE__ */ jsx31("div", { className: activeTab === "builder" ? "block" : "hidden", children: /* @__PURE__ */ jsx31(
        FormBuilder,
        {
          schema: typeof state.schema === "string" ? state.schema : JSON.stringify(state.schema),
          uiSchema: typeof state.uiSchema === "string" ? state.uiSchema : JSON.stringify(state.uiSchema),
          onChange: (newSchemaStr, newUiSchemaStr) => {
            try {
              setSchema(JSON.parse(newSchemaStr));
              setUiSchema(JSON.parse(newUiSchemaStr));
            } catch (e) {
              console.error("Failed to parse schema from FormBuilder", e);
            }
          },
          mods
        }
      ) }),
      /* @__PURE__ */ jsx31("div", { className: activeTab === "json" ? "block h-full" : "hidden", children: hasVisitedJson && /* @__PURE__ */ jsx31(Suspense, { fallback: /* @__PURE__ */ jsx31(JsonEditorFallback, {}), children: /* @__PURE__ */ jsx31(JsonEditor2, {}) }) }),
      /* @__PURE__ */ jsx31("div", { className: activeTab === "preview" ? "block" : "hidden", children: /* @__PURE__ */ jsx31(FormPreview, {}) })
    ] })
  ] });
}
function FormStudio(props) {
  return /* @__PURE__ */ jsx31(FormStudioProvider, { initialSchema: props.initialSchema, initialUiSchema: props.initialUiSchema, children: /* @__PURE__ */ jsx31(
    FormStudioUI,
    {
      onAutoSave: props.onAutoSave,
      onSave: props.onSave,
      onSaveNewVersion: props.onSaveNewVersion,
      onCancel: props.onCancel,
      mods: props.mods,
      saveStatus: props.saveStatus
    }
  ) });
}

// src/index.ts
init_JsonEditor();
init_FormStudioContext();
export {
  FormBuilder,
  FormPreview,
  FormStudio,
  FormStudioProvider,
  FormStudioUI,
  JsonEditor,
  useFormStudio
};
//# sourceMappingURL=index.js.map