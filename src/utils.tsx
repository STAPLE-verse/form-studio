import { ReactNode } from "react"
import {
  SectionType,
  CardType,
  CardProps,
  ElementProps,
  FormInput,
  Mods,
  CardComponentType,
  DataOptions,
  DataType,
  FormElement,
  CardComponentPropsType,
  AddFormObjectParametersType,
  DefinitionData,
  InputSelectDataType,
  FieldCompatibility,
} from "./types"
import CompatibilityCard from "./CompatibilityCard"
import {
  getLocalDefinitionName,
  resolveLocalDefinitionReference,
  type LocalReferenceResolutionStatus,
} from "./localReferences"
import { buildChildFieldPointer } from "./fieldPointer"

// parse in either YAML or JSON
export function parse(text: string): any {
  if (!text) return {}
  return JSON.parse(text)
}

// stringify in either YAML or JSON
export function stringify(obj: any): string {
  if (!obj) return "{}"
  return JSON.stringify(obj)
}

export function defaultDataProps(
  category: string,
  allFormInputs: { [key: string]: FormInput }
): InputSelectDataType {
  return allFormInputs[category]!.defaultDataSchema as unknown as InputSelectDataType
}

export function defaultUiProps(
  category: string,
  allFormInputs: { [key: string]: FormInput }
): InputSelectDataType {
  return allFormInputs[category]!.defaultUiSchema as unknown as InputSelectDataType
}
export function categoryType(
  category: string,
  allFormInputs: { [key: string]: FormInput }
): DataType {
  return allFormInputs[category]!.type
}
export function getCardBody(category: string, allFormInputs: { [key: string]: FormInput }) {
  return (allFormInputs[category] && allFormInputs[category]!.cardBody) || (() => null)
}

export function categoryToNameMap(allFormInputs: { [key: string]: FormInput }): {
  [key: string]: string
} {
  const categoryNameMap: { [key: string]: any } = {}
  Object.keys(allFormInputs).forEach((inputName) => {
    categoryNameMap[inputName] = allFormInputs[inputName]!.displayName
  })
  return categoryNameMap
}

function updateElementNames(elementArray: Array<ElementProps>) {
  const elementNames = elementArray.map((elem) => elem.name)
  return elementArray.map((elem) => {
    const newElem = elem
    newElem.neighborNames = elementNames
    return newElem
  })
}

export function generateCategoryHash(allFormInputs: { [key: string]: FormInput }) {
  const categoryHash: { [key: string]: any } = {}
  Object.keys(allFormInputs).forEach((categoryName) => {
    const formInput = allFormInputs[categoryName]
    formInput!.matchIf.forEach((match) => {
      match.types.forEach((type) => {
        const hash = `type:${type === "null" ? "" : type};widget:${match.widget || ""};field:${
          match.field || ""
        };format:${match.format || ""};$ref:${match.$ref ? "true" : "false"};enum:${
          match.enum ? "true" : "false"
        }`
        if (categoryHash[hash]) {
          throw new Error(`Duplicate hash: ${hash}`)
        }
        categoryHash[hash] = categoryName
      })
    })
  })
  return categoryHash
}

// Determine whether a field is safe to edit visually before choosing a card category.
export function classifyCard(
  cardProps: CardProps,
  categoryHash: { [key: string]: string }
): FieldCompatibility {
  const { dataOptions, uiOptions } = cardProps
  const widget = uiOptions["ui:widget"]

  if (cardProps.referenceResolution && cardProps.referenceResolution !== "resolved") {
    const diagnostics: Record<
      Exclude<LocalReferenceResolutionStatus, "resolved">,
      Extract<FieldCompatibility, { kind: "readOnly" }>
    > = {
      cycle: {
        kind: "readOnly",
        code: "FS_REFERENCE_CYCLE_READ_ONLY",
        message: "Recursive local references are preserved but cannot be expanded visually.",
      },
      external: {
        kind: "readOnly",
        code: "FS_REFERENCE_EXTERNAL_READ_ONLY",
        message: "External references are preserved but cannot be edited visually.",
      },
      unresolved: {
        kind: "readOnly",
        code: "FS_REFERENCE_UNRESOLVED_READ_ONLY",
        message: "This reference does not resolve to an available local definition.",
      },
      unsupportedLocal: {
        kind: "readOnly",
        code: "FS_REFERENCE_UNSUPPORTED_LOCAL_READ_ONLY",
        message:
          "This local reference is preserved, but Form Studio only edits references under #/definitions.",
      },
    }
    return diagnostics[cardProps.referenceResolution]
  }

  if (dataOptions.oneOf !== undefined) {
    return {
      kind: "readOnly",
      code: "FS_ONE_OF_READ_ONLY",
      message: "Standalone oneOf fields are preserved but cannot be edited visually.",
    }
  }

  if (
    dataOptions.anyOf !== undefined ||
    dataOptions.allOf !== undefined ||
    dataOptions.not !== undefined
  ) {
    return {
      kind: "readOnly",
      code: "FS_COMPOSITION_READ_ONLY",
      message: "Composed field schemas are preserved but cannot be edited visually.",
    }
  }

  if (dataOptions.readOnly === true || widget === "hidden") {
    return {
      kind: "readOnly",
      code: "FS_HIDDEN_READ_ONLY",
      message: "Hidden or read-only fields cannot be edited in the visual builder.",
    }
  }

  if (dataOptions.format === "textarea") {
    return {
      kind: "migration",
      code: "FS_TEXTAREA_MIGRATION",
      message:
        'The legacy format "textarea" is not standard JSON Schema. To migrate it, remove "format" from this field and set ui:widget "textarea" at the same path in the UI schema.',
    }
  }

  const currentHash = `type:${cardProps.dataOptions.type || ""};widget:${
    widget || ""
  };field:${cardProps.uiOptions["ui:field"] || ""};format:${
    cardProps.dataOptions.format || ""
  };$ref:${cardProps.$ref !== undefined ? "true" : "false"};enum:${
    cardProps.dataOptions.enum ? "true" : "false"
  }`
  const category = categoryHash[currentHash]

  if (dataOptions.type === "array") {
    if (category && category !== "stringArray") {
      return { kind: "editable", category }
    }

    if (
      category === "stringArray" &&
      !Array.isArray(dataOptions.items) &&
      dataOptions.items?.type === "string" &&
      !["oneOf", "anyOf", "allOf", "not", "$ref"].some((keyword) =>
        Object.prototype.hasOwnProperty.call(dataOptions.items, keyword)
      )
    ) {
      return { kind: "editable", category }
    }

    if (dataOptions.items?.type === "object") {
      return {
        kind: "readOnly",
        code: "FS_OBJECT_ARRAY_READ_ONLY",
        message: "Arrays of objects are preserved but cannot be edited visually.",
      }
    }

    if (dataOptions.items?.type === "string") {
      return {
        kind: "readOnly",
        code: "FS_UNSUPPORTED_ARRAY_READ_ONLY",
        message: "This string item schema is composed or referenced and cannot be edited visually.",
      }
    }

    if (["number", "integer", "boolean"].includes(dataOptions.items?.type)) {
      return {
        kind: "readOnly",
        code: "FS_SCALAR_ARRAY_READ_ONLY",
        message: "Only arrays of strings can currently be edited visually; this field is read-only.",
      }
    }

    return {
      kind: "readOnly",
      code: "FS_UNSUPPORTED_ARRAY_READ_ONLY",
      message: "This array shape cannot be edited visually.",
    }
  }

  if (category) return { kind: "editable", category }
  if (cardProps.$ref !== undefined) return { kind: "editable", category: "ref" }

  return {
    kind: "readOnly",
    code: "FS_UNKNOWN_FIELD_READ_ONLY",
    message: "This field uses a schema or UI construct Form Studio does not recognize.",
  }
}

// check for unsupported feature in schema and uischema
const supportedPropertyParameters = new Set([
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
  "uniqueItems",
  "enumNames",
  "dependencies",
  "$id",
  "$schema",
  "meta",
  "additionalProperties",
])

const supportedUiParameters = new Set([
  "ui:order",
  "ui:widget",
  "ui:autofocus",
  "ui:autocomplete",
  "ui:options",
  "ui:field",
  "ui:placeholder",
  "ui:column",
  "items",
  "definitions",
])

// recursively called function to check an object for unsupported features
function checkObjectForUnsupportedFeatures(
  schema: { [key: string]: any },
  uischema: { [key: string]: any },
  supportedWidgets: Set<string>,
  supportedFields: Set<string>,
  supportedOptions: Set<string>,
  definitionData: DefinitionData,
  definitionUi: { [key: string]: any }
) {
  // add each unsupported feature to this array
  const unsupportedFeatures: Array<string> = []

  // check for unsupported whole object features
  if (schema && typeof schema === "object") {
    Object.keys(schema).forEach((property) => {
      if (!supportedPropertyParameters.has(property) && property !== "properties") {
        unsupportedFeatures.push(
          property === "allOf"
            ? "Conditional rules at /allOf are not visually editable."
            : `Unrecognized Object Property: ${property}`
        )
      }
    })
  }

  if (uischema && typeof uischema === "object") {
    Object.keys(uischema).forEach((uiProperty) => {
      let propDefined = false
      // search for the property in the schema properties and dependencies
      if (schema.properties && Object.keys(schema.properties).includes(uiProperty)) {
        propDefined = true
      }
      if (schema.dependencies) {
        Object.keys(schema.dependencies).forEach((dependencyKey) => {
          Object.keys(schema.dependencies[dependencyKey]).forEach((parameter) => {
            if (parameter === "oneOf") {
              schema.dependencies[dependencyKey].oneOf.forEach(
                (grouping: { [key: string]: any }) => {
                  if (grouping.properties) {
                    if (Object.keys(grouping.properties).includes(uiProperty)) {
                      propDefined = true
                    }
                  }
                }
              )
            } else if (parameter === "properties") {
              if (Object.keys(schema.dependencies[dependencyKey].properties).includes(uiProperty)) {
                propDefined = true
              }
            }
          })
        })
      }

      if (!propDefined && !supportedUiParameters.has(uiProperty)) {
        unsupportedFeatures.push(`Unrecognized UI schema property: ${uiProperty}`)
      }
    })
  }

  // check for unsupported property parameters
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([parameter, element]: [string, any]) => {
      const referenceResolution =
        element && typeof element === "object" && typeof element.$ref === "string"
          ? resolveLocalDefinitionReference({
              schema: element,
              uiSchema: uischema?.[parameter],
              definitions: definitionData,
              definitionUi,
            })
          : undefined
      const inspectedElement =
        referenceResolution?.status === "resolved" ? referenceResolution.schema : element

      if (element && typeof element === "object" && element.type && element.type !== "object") {
        // make sure that the type is valid
        if (!["array", "string", "integer", "number", "boolean"].includes(element.type)) {
          unsupportedFeatures.push(`Unrecognized type: ${element.type} in ${parameter}`)
        }
        // check the properties of each property if it is a basic object
        Object.keys(element).forEach((key) => {
          if (!supportedPropertyParameters.has(key)) {
            unsupportedFeatures.push(`Property Parameter: ${key} in ${parameter}`)
          }
        })
      } else {
        // check the properties of each property if it is a basic object
        Object.keys(element).forEach((key) => {
          if (!supportedPropertyParameters.has(key)) {
            unsupportedFeatures.push(`Property Parameter: ${key} in ${parameter}`)
          }
        })
      }

      // check for unsupported UI components
      if (
        uischema &&
        uischema[parameter] &&
        inspectedElement &&
        (!referenceResolution || referenceResolution.status === "resolved") &&
        (!inspectedElement.type || inspectedElement.type !== "object")
      ) {
        // check for unsupported ui properties
        Object.keys(uischema[parameter]).forEach((uiProp) => {
          if (!supportedUiParameters.has(uiProp)) {
            unsupportedFeatures.push(`UI Property: ${uiProp} for ${parameter}`)
          }

          // check for unsupported ui widgets
          if (uiProp === "ui:widget" && !supportedWidgets.has(uischema[parameter][uiProp])) {
            unsupportedFeatures.push(`UI Widget: ${uischema[parameter][uiProp]} for ${parameter}`)
          }

          // check for unsupported ui fields
          if (uiProp === "ui:field" && !supportedFields.has(uischema[parameter][uiProp])) {
            unsupportedFeatures.push(`UI Field: ${uischema[parameter][uiProp]} for ${parameter}`)
          }

          // check unsupported ui option
          if (uiProp === "ui:options") {
            Object.keys(uischema[parameter]["ui:options"]).forEach((uiOption) => {
              if (!supportedOptions.has(uiOption)) {
                unsupportedFeatures.push(`UI Property: ui:options.${uiOption} for ${parameter}`)
              }
            })
          }
        })
      }
    })
  }

  return unsupportedFeatures
}

// parent function that checks for unsupported features in an entire document
export function checkForUnsupportedFeatures(
  schema: { [key: string]: any },
  uischema: { [key: string]: any },
  allFormInputs: { [key: string]: FormInput },
  definitionData: DefinitionData = schema.definitions || {},
  definitionUi: { [key: string]: any } = uischema.definitions || {}
): string[] {
  // add each unsupported feature to this array
  const unsupportedFeatures: string[] = []

  const widgets: string[] = []
  const fields: string[] = []
  const options: string[] = []
  Object.keys(allFormInputs).forEach((inputType) => {
    allFormInputs[inputType]!.matchIf.forEach((match) => {
      if (match.widget && !widgets.includes(match.widget)) {
        widgets.push(match.widget)
      }
      if (match.field && !fields.includes(match.field)) {
        fields.push(match.field)
      }
    })
    if (
      allFormInputs[inputType]!.possibleOptions &&
      Array.isArray(allFormInputs[inputType]!.possibleOptions)
    ) {
      options.push(...allFormInputs[inputType]!.possibleOptions!)
    }
  })
  const supportedWidgets = new Set(widgets)
  const supportedFields = new Set(fields)
  const supportedOptions = new Set(options)

  // check for unsupported whole form features
  if (schema && typeof schema === "object" && schema.type === "object") {
    unsupportedFeatures.push(
      ...checkObjectForUnsupportedFeatures(
        schema,
        uischema,
        supportedWidgets,
        supportedFields,
        supportedOptions,
        definitionData,
        definitionUi
      )
    )
  } else {
    unsupportedFeatures.push("jsonSchema form is not of type object")
  }

  return unsupportedFeatures
}

// make an element out of the corresponding properties and UI properties
function generateDependencyElement(
  name: string,
  dataProps: any,
  uiProperties: any,
  requiredNames: any,
  categoryHash: { [key: string]: string },
  definitionData?: DefinitionData,
  definitionUi?: { [key: string]: any },
  useDefinitionDetails = true // determines whether to use an element's definition details or not.
) {
  let uiProps = {
    ...uiProperties,
  }
  const newElement: FormElement = {}
  let elementDetails =
    dataProps && typeof dataProps === "object" ? { ...dataProps } : {}
  let referenceResolution: LocalReferenceResolutionStatus | undefined

  // populate newElement with reference if applicable
  if (elementDetails.$ref !== undefined && definitionData) {
    const resolution = resolveLocalDefinitionReference({
      schema: elementDetails,
      uiSchema: uiProps,
      definitions: definitionData,
      definitionUi,
    })
    referenceResolution = resolution.status
    if (resolution.status === "resolved") {
      if (useDefinitionDetails) elementDetails = resolution.schema
      uiProps = resolution.uiSchema
    }
  }

  newElement.name = name
  newElement.required = requiredNames.includes(name)
  newElement.$ref = typeof elementDetails.$ref === "string" ? elementDetails.$ref : undefined
  newElement.referenceResolution = referenceResolution

  if (elementDetails.type && elementDetails.type === "object") {
    // create a section
    newElement.schema = elementDetails
    newElement.uischema = uiProps || {}
    newElement.propType = "section"
  } else {
    // create a card
    newElement.dataOptions = elementDetails
    newElement.uiOptions = uiProps || {}

    // ensure that uiOptions does not have duplicate keys with dataOptions
    const reservedKeys = Object.keys(newElement.dataOptions!)
    Object.keys(newElement.uiOptions!).forEach((uiKey) => {
      if (reservedKeys.includes(uiKey)) {
        newElement.uiOptions![`ui:*${uiKey}`] = newElement.uiOptions![uiKey]
      }
    })

    newElement.compatibility = classifyCard(newElement as CardProps, categoryHash)
    if (newElement.compatibility.kind === "editable") {
      newElement.dataOptions!.category = newElement.compatibility.category
    }
    newElement.propType = "card"
  }
  return newElement
}

// generate an array of element objects from a schema and uischema
export function generateElementPropsFromSchemas(parameters: {
  schema: { [key: string]: any }
  uischema: { [key: string]: any }
  definitionData?: DefinitionData
  definitionUi?: { [key: string]: any }
  categoryHash: { [key: string]: string }
}): ElementProps[] {
  const { schema, uischema, definitionData, definitionUi, categoryHash } = parameters

  if (!schema.properties) return []

  const elementDict: { [key: string]: any } = {}
  const requiredNames = schema.required ? schema.required : []

  // read regular elements from properties
  Object.entries(schema.properties).forEach(([parameter, element]) => {
    const newElement: FormElement = {}
    let elementDetails: FormElement =
      element && typeof element === "object" ? { ...element } : {}
    let elementUiOptions = {
      ...(uischema[parameter] || {}),
    }
    let referenceResolution: LocalReferenceResolutionStatus | undefined

    // populate newElement with reference if applicable
    if (elementDetails?.$ref !== undefined && definitionData) {
      const resolution = resolveLocalDefinitionReference({
        schema: elementDetails,
        uiSchema: elementUiOptions,
        definitions: definitionData,
        definitionUi,
      })
      referenceResolution = resolution.status
      if (resolution.status === "resolved") {
        elementDetails = resolution.schema
        elementUiOptions = resolution.uiSchema
      }
    }
    newElement.name = parameter
    newElement.required = requiredNames.includes(parameter)
    newElement.$ref = elementDetails.$ref
    newElement.referenceResolution = referenceResolution
    newElement.dataOptions = elementDetails

    if (elementDetails.type && elementDetails.type === "object") {
      // create a section
      newElement.schema = elementDetails
      newElement.uischema = elementUiOptions
      newElement.propType = "section"
    } else {
      // create a card
      newElement.uiOptions = elementUiOptions

      // ensure that uiOptions does not have duplicate keys with dataOptions
      const reservedKeys = Object.keys(newElement.dataOptions)
      Object.keys(newElement.uiOptions!).forEach((uiKey) => {
        if (reservedKeys.includes(uiKey)) {
          newElement.uiOptions![`ui:*${uiKey}`] = newElement.uiOptions![uiKey]
        }
      })

      newElement.compatibility = classifyCard(newElement as CardProps, categoryHash)
      if (newElement.compatibility.kind === "editable") {
        newElement.dataOptions.category = newElement.compatibility.category
      }
      newElement.propType = "card"
    }
    elementDict[newElement.name!] = newElement
  })
  // read dependent elements from dependencies
  if (schema.dependencies) {
    const useDefinitionDetails = false
    Object.keys(schema.dependencies).forEach((parent) => {
      const group = schema.dependencies[parent]
      if (group.oneOf) {
        let possibilityIndex = 0
        group.oneOf.forEach((possibility: { [key: string]: any }) => {
          if (!(elementDict[parent] || {}).dependents) {
            elementDict[parent] = elementDict[parent] || {}
            elementDict[parent].dependents = []
          }
          elementDict[parent].dependents.push({
            children: [],
            value: possibility.properties[parent],
          })
          const requiredValues = possibility.required || []
          Object.entries(possibility.properties).forEach(([parameter, element]) => {
            // create a new element if not present in main properties
            if (
              !elementDict[parameter] ||
              (parameter !== parent &&
                Object.keys(elementDict[parameter]).length === 1 &&
                elementDict[parameter].dependents)
            ) {
              const newElement = generateDependencyElement(
                parameter,
                element,
                uischema[parameter],
                requiredNames,
                categoryHash,
                definitionData,
                definitionUi,
                useDefinitionDetails
              )
              if (elementDict[parameter] && elementDict[parameter].dependents) {
                newElement.dependents = elementDict[parameter].dependents
              }
              newElement.required = requiredValues.includes(newElement.name)
              elementDict[newElement.name!] = newElement
            }
            // simplified check and assignment block
            const newElement = elementDict[parameter]
            if (newElement && parameter !== parent) {
              newElement.dependent = true
              newElement.parent = parent
              elementDict[parent].dependents[possibilityIndex].children.push(parameter)
            }
          })
          possibilityIndex += 1
        })
      } else if (group.properties) {
        const requiredValues = group.required || []
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
          )
          newElement.required = requiredValues.includes(newElement.name)
          newElement.dependent = true
          newElement.parent = parent
          elementDict[newElement.name!] = newElement
          if (elementDict[parent]) {
            if (elementDict[parent].dependents) {
              elementDict[parent].dependents[0].children.push(parameter)
            } else {
              elementDict[parent].dependents = [{ children: [parameter] }]
            }
          } else {
            elementDict[parent] = {}
            elementDict[parent].dependents = [{ children: [parameter] }]
          }
        })
      } else {
        console.error("unsupported dependency type encountered")
      }
    })
  }

  // now reorder in accordance with ui:order if defined
  const cardPropList: FormElement[] = []
  if (uischema["ui:order"]) {
    // in case there are any options not in ui:order
    const remainder: FormElement[] = []
    Object.keys(elementDict).forEach((name) => {
      if (!uischema["ui:order"].includes(name)) remainder.push(elementDict[name])
    })

    // map ui order elements into the right order
    uischema["ui:order"].forEach((name: string) => {
      // if contains the wildcard *, insert remainder cards there
      if (name === "*") {
        remainder.forEach((remCard) => {
          cardPropList.push(remCard)
        })
      } else if (elementDict[name]) {
        cardPropList.push(elementDict[name])
      }
    })
  } else {
    Object.keys(elementDict).forEach((name) => {
      cardPropList.push(elementDict[name])
    })
  }

  updateElementNames(cardPropList as ElementProps[])

  return cardPropList as ElementProps[]
}

// determine the number of element objects from schema and uischema
export function countElementsFromSchema(schemaData: any): number {
  if (!schemaData.properties) return 0
  const elementDict: { [key: string]: any } = {}
  let elementCount = 0

  // read regular elements from properties
  Object.entries(schemaData.properties).forEach(([parameter]) => {
    elementDict[parameter] = {}
    elementCount += 1
  })
  // read dependent elements from dependencies
  if (schemaData.dependencies) {
    Object.keys(schemaData.dependencies).forEach((parent) => {
      const group = schemaData.dependencies[parent]
      if (group.oneOf) {
        let possibilityIndex = 0
        group.oneOf.forEach((possibility: { [key: string]: any }) => {
          if (!(elementDict[parent] || {}).dependents) {
            elementDict[parent] = elementDict[parent] || {}
            elementDict[parent].dependents = []
          }
          elementDict[parent].dependents.push({
            children: [],
            value: possibility.properties[parent],
          })
          Object.entries(possibility.properties).forEach(([parameter]) => {
            // create a new element if not present in main properties
            if (!Object.keys(elementDict).includes(parameter)) {
              elementDict[parameter] = {}
              elementCount += 1
            }
            if (parameter !== parent) {
              const newElement = elementDict[parameter]
              newElement.dependent = true
              newElement.parent = parent
              elementDict[parent].dependents[possibilityIndex].children.push(parameter)
            }
          })
          possibilityIndex += 1
        })
      } else if (group.properties) {
        Object.entries(group.properties).forEach(([parameter]) => {
          elementDict[parameter] = elementDict[parameter] || {}
          elementCount += 1
          if (elementDict[parent]) {
            if (elementDict[parent].dependents) {
              elementDict[parent].dependents[0].children.push(parameter)
            } else {
              elementDict[parent].dependents = [{ children: [parameter] }]
            }
          } else {
            elementDict[parent] = {}
            elementDict[parent].dependents = [{ children: [parameter] }]
          }
        })
      } else {
        console.error("unsupported dependency type encountered")
      }
    })
  }

  return elementCount
}

// convert an element into a schema equivalent
const nullableNumberParameters = new Set([
  "multipleOf",
  "minimum",
  "exclusiveMinimum",
  "maximum",
  "exclusiveMaximum",
])

function generateSchemaElementFromElement(element: ElementProps) {
  if (element.$ref !== undefined) {
    const title =
      element.schema !== undefined && element.schema.title !== undefined
        ? element.schema.title
        : element.dataOptions.title
    const description =
      element.schema !== undefined && element.schema.description !== undefined
        ? element.schema.description
        : element.dataOptions.description

    let returnElement: FormElement = {
      $ref: element.$ref,
      title: title,
      description: description,
    }

    const length = element?.schema?.required?.length
    if (length !== undefined && length > 0) {
      returnElement = { ...returnElement, required: element.schema.required }
    }
    return returnElement
  } else if (element.propType === "card") {
    if (element.dataOptions.category === "section") {
      return {
        type: "object",
      }
    } else {
      const prop: { [key: string]: any } = {}

      Object.keys(element.dataOptions).forEach((key) => {
        if (
          ![
            "category",
            "hideKey",
            "path",
            "definitionData",
            "definitionUi",
            "allFormInputs",
          ].includes(key) &&
          element.dataOptions[key] !== "" &&
          !(nullableNumberParameters.has(key) && element.dataOptions[key] === null)
        )
          prop[key] = element.dataOptions[key]
      })
      return prop
    }
  } else if (element.propType === "section") {
    return element.schema
  } else {
    throw new Error("Element that is neither card, section, nor ref")
  }
}

// generate a new schema from a complete array of card objects
export function generateSchemaFromElementProps(elementArr: ElementProps[]): {
  [key: string]: any
  definitions?: { [key: string]: any }
} {
  if (!elementArr) return {}
  const newSchema: { [key: string]: any } = {}

  const props: { [key: string]: any } = {}
  const dependencies: { [key: string]: any } = {}
  const elementDict: { [key: string]: ElementProps } = {}
  const dependentElements = new Set()
  for (let index = 0; index < elementArr.length; index += 1) {
    const element = elementArr[index]
    if (element?.name) {
      elementDict[element.name] = { ...element }
    }
    if (element!.dependents)
      element!.dependents.forEach((possibility) => {
        possibility.children.forEach((dependentElement) => {
          dependentElements.add(dependentElement)
        })
      })
  }
  Object.keys(elementDict).forEach((elementName) => {
    const element = elementDict[elementName]
    if (element!.dependents && element!.dependents[0]) {
      if (element!.dependents[0].value) {
        // handle value based case
        dependencies[elementName] = {
          oneOf: element!.dependents.map((possibility: FormElement) => {
            const childrenComponents: { [key: string]: any } = {}
            const requiredValues: string[] = []
            possibility?.children?.forEach((child) => {
              const childElement = elementDict[child]
              if (childElement) {
                childrenComponents[child] = generateSchemaElementFromElement(childElement)
                if (childElement.required) requiredValues.push(child)
              }
            })
            return {
              properties: {
                [elementName]: possibility.value,
                ...childrenComponents,
              },
              required: requiredValues,
            }
          }),
        }
      } else {
        // handle definition based case
        const childrenComponents: { [key: string]: any } = {}
        const requiredValues: string[] = []
        element!.dependents[0].children.forEach((child) => {
          childrenComponents[child] = generateSchemaElementFromElement(elementDict[child]!)
          if (elementDict[child]!.required) requiredValues.push(child)
        })
        dependencies[elementName] = {
          properties: childrenComponents,
          required: requiredValues,
        }
      }
    }
    if (!dependentElements.has(elementName)) {
      props[element!.name] = generateSchemaElementFromElement(element!)
    }
  })

  newSchema.properties = props
  newSchema.dependencies = dependencies
  newSchema.required = elementArr
    .filter(({ required, dependent }) => required && !dependent)
    .map(({ name }) => name)

  return newSchema
}

export function generateUiSchemaFromElementProps(
  elementArr: Array<ElementProps>,
  definitionUi: any
): { [key: string]: any; definitions?: { [key: string]: any } } {
  if (!elementArr) return {}

  const uiSchema: { [key: string]: any } = {}
  const uiOrder: { [key: string]: any } = []
  const definitions = definitionUi

  elementArr.forEach((element) => {
    uiOrder.push(element.name)
    if (element.$ref !== undefined) {
      // look for the reference
      const definitionName = getLocalDefinitionName(element.$ref)
      if (definitionName !== undefined && definitions && definitions[definitionName]) {
        uiSchema[element.name] = definitions[definitionName]
      }
    }
    if (element.propType === "card" && element.uiOptions) {
      Object.keys(element.uiOptions).forEach((uiOption) => {
        if (!uiSchema[element.name]) uiSchema[element.name] = {}
        if (uiOption.startsWith("ui:*")) {
          uiSchema[element.name][uiOption.substring(4)] = element.uiOptions[uiOption]
        } else {
          uiSchema[element.name][uiOption] = element.uiOptions[uiOption]
        }
      })
    } else if (element.propType === "section" && Object.keys(element.uischema).length > 0) {
      uiSchema[element.name] = element.uischema
    }
  })

  uiSchema["ui:order"] = uiOrder

  return uiSchema
}

export function getCardParameterInputComponentForType(
  category: string,
  allFormInputs: { [key: string]: FormInput }
): CardComponentType {
  return (allFormInputs[category] && allFormInputs[category]!.modalBody) || (() => null)
}

function isJsonObject(value: any): value is { [key: string]: any } {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function cloneJsonValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneJsonValue(item)) as T
  }
  if (isJsonObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneJsonValue(child)])
    ) as T
  }
  return value
}

function jsonValuesEqual(left: any, right: any): boolean {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonValuesEqual(value, right[index]))
    )
  }
  if (!isJsonObject(left) || !isJsonObject(right)) return false

  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) => Object.prototype.hasOwnProperty.call(right, key) && jsonValuesEqual(left[key], right[key])
    )
  )
}

function mergeUiOrder(
  originalOrder: any,
  baselineOrder: string[],
  nextOrder: string[]
): string[] {
  if (!Array.isArray(originalOrder)) return cloneJsonValue(nextOrder)

  const visuallyOwnedNames = new Set([...baselineOrder, ...nextOrder])
  const explicitVisualNames = new Set(
    originalOrder.filter(
      (name): name is string => typeof name === "string" && visuallyOwnedNames.has(name)
    )
  )
  const wildcardNames = baselineOrder.filter((name) => !explicitVisualNames.has(name))
  const expandedOriginalOrder = originalOrder.flatMap((name) =>
    name === "*" ? wildcardNames : [name]
  )

  const mergedOrder: string[] = []
  let nextVisualIndex = 0
  expandedOriginalOrder.forEach((name) => {
    if (typeof name === "string" && visuallyOwnedNames.has(name)) {
      if (nextVisualIndex < nextOrder.length) {
        mergedOrder.push(nextOrder[nextVisualIndex]!)
        nextVisualIndex += 1
      }
    } else {
      mergedOrder.push(name)
    }
  })
  mergedOrder.push(...nextOrder.slice(nextVisualIndex))
  return mergedOrder
}

// Apply only changes made by the visual model. Anything it did not model remains opaque.
function applyVisualChanges(
  original: any,
  baselineGenerated: any,
  nextGenerated: any,
  key?: string
): any {
  if (jsonValuesEqual(baselineGenerated, nextGenerated)) {
    return cloneJsonValue(original)
  }

  if (
    key === "ui:order" &&
    Array.isArray(baselineGenerated) &&
    Array.isArray(nextGenerated)
  ) {
    return mergeUiOrder(original, baselineGenerated, nextGenerated)
  }

  if (
    Array.isArray(original) &&
    Array.isArray(baselineGenerated) &&
    Array.isArray(nextGenerated) &&
    baselineGenerated.length === nextGenerated.length
  ) {
    return nextGenerated.map((nextValue, index) =>
      applyVisualChanges(original[index], baselineGenerated[index], nextValue)
    )
  }

  if (isJsonObject(baselineGenerated) && isJsonObject(nextGenerated)) {
    const merged = isJsonObject(original) ? cloneJsonValue(original) : {}
    const generatedKeys = new Set([
      ...Object.keys(baselineGenerated),
      ...Object.keys(nextGenerated),
    ])

    generatedKeys.forEach((generatedKey) => {
      const existedBefore = Object.prototype.hasOwnProperty.call(baselineGenerated, generatedKey)
      const existsNext = Object.prototype.hasOwnProperty.call(nextGenerated, generatedKey)
      if (!existsNext) {
        if (existedBefore) delete merged[generatedKey]
        return
      }
      if (!existedBefore) {
        merged[generatedKey] = cloneJsonValue(nextGenerated[generatedKey])
        return
      }
      if (jsonValuesEqual(baselineGenerated[generatedKey], nextGenerated[generatedKey])) {
        return
      }
      merged[generatedKey] = applyVisualChanges(
        isJsonObject(original) ? original[generatedKey] : undefined,
        baselineGenerated[generatedKey],
        nextGenerated[generatedKey],
        generatedKey
      )
    })
    return merged
  }

  return cloneJsonValue(nextGenerated)
}

// takes in an array of Card Objects and updates both schemas
export function updateSchemas(
  elementArr: ElementProps[],
  parameters: {
    schema: { [key: string]: any; definitions?: { [key: string]: any } }
    uischema: { [key: string]: any; definitions?: { [key: string]: any } }
    onChange: (schema: { [key: string]: any }, uischema: { [key: string]: any }) => any
    definitionData?: { [key: string]: any }
    definitionUi?: { [key: string]: any }
    categoryHash: { [key: string]: string }
  }
) {
  const {
    schema,
    uischema,
    onChange,
    definitionData,
    definitionUi,
    categoryHash,
  } = parameters
  const baselineSchema = cloneJsonValue(schema)
  const baselineUiSchema = cloneJsonValue(uischema)
  const baselineElements = generateElementPropsFromSchemas({
    schema: baselineSchema,
    uischema: baselineUiSchema,
    definitionData: definitionData || baselineSchema.definitions,
    definitionUi: definitionUi || baselineUiSchema.definitions,
    categoryHash,
  })

  const baselineGeneratedSchema = generateSchemaFromElementProps(baselineElements)
  const nextGeneratedSchema = generateSchemaFromElementProps(elementArr)
  const newSchema = applyVisualChanges(schema, baselineGeneratedSchema, nextGeneratedSchema)

  const baselineGeneratedUiSchema = generateUiSchemaFromElementProps(
    baselineElements,
    definitionUi
  )
  const nextGeneratedUiSchema = generateUiSchemaFromElementProps(elementArr, definitionUi)
  const newUiSchema = applyVisualChanges(
    uischema,
    baselineGeneratedUiSchema,
    nextGeneratedUiSchema
  )

  // mandate that the type is an object if not already done
  newSchema.type = "object"
  onChange(newSchema, newUiSchema)
}

export const DEFAULT_INPUT_NAME = "newInput"

// ensure that each added block has a unique name
function getIdFromElementsBlock(elements: Array<ElementProps>) {
  const names = elements.map((element) => element.name)
  const defaultNameLength = DEFAULT_INPUT_NAME.length

  return names.length > 0
    ? Math.max(
        ...names.map((name) => {
          if (name.startsWith(DEFAULT_INPUT_NAME)) {
            const index = name.substring(defaultNameLength, name.length)
            const value = Number.parseInt(index)

            if (!isNaN(value)) {
              return value
            }
          }

          return 0
        })
      ) + 1
    : 1
}

// given an initial schema, update with a new card appended
export function addCardObj(parameters: AddFormObjectParametersType) {
  const { schema, uischema, mods, onChange, definitionData, definitionUi, index, categoryHash } =
    parameters
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  })

  const i = getIdFromElementsBlock(newElementObjArr)
  const dataOptions = getNewElementDefaultDataOptions(i, mods)

  const newElement: ElementProps = {
    name: `${DEFAULT_INPUT_NAME}${i}`,
    required: false,
    dataOptions: dataOptions,
    uiOptions: (mods && mods.newElementDefaultUiSchema) || {},
    propType: "card",
    schema: {},
    uischema: {},
    neighborNames: [],
  }

  if (index !== undefined && index !== null) {
    newElementObjArr.splice(index + 1, 0, newElement)
  } else {
    newElementObjArr.push(newElement)
  }
  // 🧪 Log the new card object schema before updating
  const returnObj = newElementObjArr
  //console.log("🧪 new card object schema", JSON.stringify(returnObj, null, 2))
  updateSchemas(returnObj, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
    onChange,
  })
}

// given an initial schema, update with a new section appended
export function addSectionObj(parameters: AddFormObjectParametersType) {
  const { schema, uischema, onChange, definitionData, definitionUi, index, categoryHash } =
    parameters
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  })

  const i = getIdFromElementsBlock(newElementObjArr)

  const newElement: ElementProps = {
    name: `${DEFAULT_INPUT_NAME}${i}`,
    required: false,
    dataOptions: {
      title: `New Input ${i}`,
      type: "object",
      default: "",
    },
    uiOptions: {},
    propType: "section",
    schema: { title: `New Input ${i}`, type: "object" },
    uischema: {},
    neighborNames: [],
  }

  if (index !== undefined && index !== null) {
    newElementObjArr.splice(index + 1, 0, newElement)
  } else {
    newElementObjArr.push(newElement)
  }
  // 🧪 Log the new section object schema before updating
  const returnObj = newElementObjArr
  //console.log("🧪 new section object schema", JSON.stringify(returnObj, null, 2))
  updateSchemas(returnObj, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
    onChange,
  })
}

// generate an array of Card and Section components from a schema
export function generateElementComponentsFromSchemas(parameters: {
  schemaData: { [key: string]: any }
  uiSchemaData: { [key: string]: any }
  onChange: (schema: { [key: string]: any }, uischema: { [key: string]: any }) => any
  definitionData?: { [key: string]: any }
  definitionUi?: { [key: string]: any }
  hideKey?: boolean
  path: string
  /** RFC 6901 pointer rooted at the form schema; `""` identifies the schema root. */
  fieldPointer?: string
  cardOpenState: Record<string, boolean>
  setCardOpenState: (newState: Record<string, boolean>) => void
  allFormInputs: { [key: string]: FormInput }
  mods?: Mods
  categoryHash: { [key: string]: string }
  Card: CardType
  Section: SectionType
}): ReactNode[] {
  const {
    schemaData,
    uiSchemaData,
    onChange,
    definitionData,
    definitionUi,
    hideKey,
    path,
    fieldPointer = "",
    cardOpenState,
    setCardOpenState,
    allFormInputs,
    mods,
    categoryHash,
    Card,
    Section,
  } = parameters

  const schema = parse(stringify(schemaData))
  const uischema = parse(stringify(uiSchemaData))

  if (!schema.properties) return []
  const elementPropArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  })

  const elementList = elementPropArr.map((elementProp, index) => {
    const elementKey = `${path}_${elementProp.name}`
    const addProperties = {
      schema,
      uischema,
      mods,
      onChange,
      definitionData: definitionData || {},
      definitionUi: definitionUi || {},
      index,
      categoryHash,
    }

    const expanded = cardOpenState[elementKey] || false
    const childFieldPointer = buildChildFieldPointer(fieldPointer, elementProp.name)
    if (elementProp.propType === "card") {
      const compatibility = elementProp.compatibility
      if (compatibility && compatibility.kind !== "editable") {
        return (
          <CompatibilityCard
            key={elementKey}
            name={elementProp.name}
            title={elementProp.dataOptions.title}
            compatibility={compatibility}
            fieldPointer={childFieldPointer}
          />
        )
      }

      // choose the appropriate type specific parameters
      const TypeSpecificParameters = getCardParameterInputComponentForType(
        compatibility?.category || elementProp.dataOptions.category,
        allFormInputs
      )

      // add a fully defined card component to the list of components
      return (
        <Card
          componentProps={
            Object.assign(
              {
                name: elementPropArr[index]!.name,
                required: elementPropArr[index]!.required,
                hideKey,
                path: `${path}_${elementPropArr[index]!.name}`,
                fieldPointer: childFieldPointer,
                definitionData,
                definitionUi,
                neighborNames: elementPropArr[index]!.neighborNames,
                dependents: elementPropArr[index]!.dependents,
                dependent: elementPropArr[index]!.dependent,
                parent: elementPropArr[index]!.parent,
              },
              elementPropArr[index]!.uiOptions,
              elementPropArr[index]!.dataOptions
            ) as CardComponentPropsType
          }
          // @ts-ignore: suppress key error, can't change key assignment
          key={elementKey}
          TypeSpecificParameters={TypeSpecificParameters}
          onChange={(newCardObj: { [key: string]: any }) => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })

            // extract uiOptions and other properties
            const newDataProps: { [key: string]: any } = {}
            const newUiProps: { [key: string]: any } = {}
            Object.keys(newCardObj).forEach((propName) => {
              if (propName.startsWith("ui:")) {
                if (propName.startsWith("ui:*")) {
                  newUiProps[propName.substring(4)] = newCardObj[propName]
                } else {
                  newUiProps[propName] = newCardObj[propName]
                }
              } else if (
                ![
                  "name",
                  "required",
                  "neighborNames",
                  "dependents",
                  "dependent",
                  "parent",
                ].includes(propName)
              ) {
                newDataProps[propName] = newCardObj[propName]
              }
            })

            if (newElementObjArr[index]!.propType === "card") {
              const oldElement = newElementObjArr[index]
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
                neighborNames: oldElement!.neighborNames ?? [],
                schema: oldElement!.schema ?? {},
                uischema: oldElement!.uischema ?? {},
              }
            } else {
              throw new Error("Card editing non card element")
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          onDelete={() => {
            // splice out this index from the card array
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            newElementObjArr.splice(index, 1)
            const nextCardOpenState = { ...cardOpenState }
            delete nextCardOpenState[elementKey]
            setCardOpenState(nextCardOpenState)
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          onMoveUp={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            if (index === 0) return

            const tempBlock = newElementObjArr[index - 1]
            if (newElementObjArr[index]) {
              //@ts-ignore
              newElementObjArr[index - 1] = newElementObjArr[index]
            }
            if (tempBlock) {
              newElementObjArr[index] = tempBlock
            }

            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          onMoveDown={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            if (index === elementPropArr.length - 1) return

            const tempBlock = newElementObjArr[index + 1]
            if (newElementObjArr[index]) {
              //@ts-ignore
              newElementObjArr[index + 1] = newElementObjArr[index]
            }
            if (tempBlock) {
              newElementObjArr[index] = tempBlock
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          addElem={(choice: string) => {
            if (choice === "card") {
              addCardObj(addProperties)
            } else if (choice === "section") {
              addSectionObj(addProperties)
            }
          }}
          cardOpen={expanded}
          setCardOpen={(newState: boolean) =>
            setCardOpenState({
              ...cardOpenState,
              [elementKey]: newState,
            })
          }
          allFormInputs={allFormInputs}
          mods={mods}
          addProperties={addProperties}
        />
      )
    } else if (elementProp.propType === "section") {
      // create a section with the appropriate schemas here
      const addProperties = {
        schema,
        uischema,
        mods,
        onChange,
        definitionData: definitionData || {},
        definitionUi: definitionUi || {},
        index,
        categoryHash,
      }
      return (
        <Section
          schema={elementProp.schema}
          uischema={elementProp.uischema}
          onChange={(
            newSchema: { [key: string]: any },
            newUiSchema: { [key: string]: any },
            newRef?: string
          ) => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })

            const oldSection = newElementObjArr[index]

            newElementObjArr[index] = {
              ...oldSection,
              name: oldSection!.name ?? "UnnamedSection",
              required: oldSection!.required ?? false,
              dataOptions: oldSection!.dataOptions ?? {},
              uiOptions: oldSection!.uiOptions ?? {},
              schema: newSchema,
              uischema: newUiSchema,
              propType: "section",
              neighborNames: oldSection!.neighborNames ?? [],
            }

            if (newRef) newElementObjArr[index]!.$ref = newRef

            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          onNameChange={(newName: string) => {
            const oldSection = elementProp

            // check if newName overlaps with an existing name
            if (elementPropArr.map((elem) => elem.name).includes(newName)) return

            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            newElementObjArr[index] = {
              ...oldSection,
              name: newName,
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          onRequireToggle={() => {
            const oldSection = elementProp

            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            newElementObjArr[index] = {
              ...oldSection,
              required: !oldSection.required,
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          onDependentsChange={(
            newDependents: Array<{
              children: Array<string>
              value?: any
            }>
          ) => {
            const oldSection = elementProp

            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            newElementObjArr[index] = {
              ...oldSection,
              dependents: newDependents,
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              onChange,
              definitionData,
              definitionUi,
              categoryHash,
            })
          }}
          onDelete={() => {
            // splice out this index from the card array
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            newElementObjArr.splice(index, 1)
            const nextCardOpenState = { ...cardOpenState }
            delete nextCardOpenState[elementKey]
            setCardOpenState(nextCardOpenState)
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          onMoveUp={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            if (index === 0) return

            const tempBlock = newElementObjArr[index - 1]
            if (newElementObjArr[index]) {
              //@ts-ignore
              newElementObjArr[index - 1] = newElementObjArr[index]
            }
            if (tempBlock) {
              newElementObjArr[index] = tempBlock
            }

            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          onMoveDown={() => {
            const newElementObjArr = generateElementPropsFromSchemas({
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
            })
            if (index === elementPropArr.length - 1) return

            const tempBlock = newElementObjArr[index + 1]
            if (newElementObjArr[index]) {
              //@ts-ignore
              newElementObjArr[index + 1] = newElementObjArr[index]
            }
            if (tempBlock) {
              newElementObjArr[index] = tempBlock
            }
            updateSchemas(newElementObjArr, {
              schema,
              uischema,
              definitionData,
              definitionUi,
              categoryHash,
              onChange,
            })
          }}
          name={elementProp.name}
          // @ts-ignore: suppress key error, can't change key assignment
          key={elementKey}
          required={elementProp.required}
          path={`${path}_${elementProp.name}`}
          fieldPointer={childFieldPointer}
          definitionData={definitionData || {}}
          definitionUi={definitionUi || {}}
          hideKey={hideKey}
          reference={elementProp.$ref}
          neighborNames={elementProp.neighborNames}
          dependents={elementProp.dependents!}
          dependent={elementProp.dependent}
          parent={elementProp.parent}
          parentProperties={addProperties}
          cardOpen={expanded}
          setCardOpen={(newState: boolean) =>
            setCardOpenState({
              ...cardOpenState,
              [elementKey]: newState,
            })
          }
          allFormInputs={allFormInputs}
          categoryHash={categoryHash}
          mods={mods}
        />
      )
    } else {
      return (
        <div key={elementKey}>
          <h2> Error parsing element </h2>
        </div>
      )
    }
  })

  return elementList
}

// function called when drag and drop ends
export function onDragEnd(
  result: any,
  details: {
    schema: { [key: string]: any }
    uischema: { [key: string]: any }
    onChange: (schema: { [key: string]: any }, uischema: { [key: string]: any }) => any
    definitionData?: { [key: string]: any }
    definitionUi?: { [key: string]: any }
    categoryHash: { [key: string]: string }
  }
) {
  const { schema, uischema, onChange, definitionData, definitionUi, categoryHash } = details

  if (!result.destination) return

  const src = result.source.index
  const dest = result.destination.index
  const newElementObjArr = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  })

  // Only swap if both src and dest are defined
  if (newElementObjArr[src] && newElementObjArr[dest]) {
    const tempBlock = newElementObjArr[src]
    //@ts-ignore
    newElementObjArr[src] = newElementObjArr[dest]
    //@ts-ignore
    newElementObjArr[dest] = tempBlock
  }

  updateSchemas(newElementObjArr, {
    schema,
    uischema,
    definitionData: definitionData || {},
    definitionUi: definitionUi || {},
    categoryHash,
    onChange,
  })
}

// helper function to recursively update sections
function propagateElementChange(
  elementArr: ElementProps[],
  definitionData: { [key: string]: any },
  definitionUi: { [key: string]: any },
  categoryHash: { [key: string]: string }
) {
  const updatedElementArr: ElementProps[] = []
  elementArr.forEach((element) => {
    // update section and it's children
    if (element.propType === "section") {
      const childrenElements = generateElementPropsFromSchemas({
        schema: element.schema,
        uischema: element.uischema,
        definitionData,
        definitionUi,
        categoryHash,
      })
      const updatedChildren = propagateElementChange(
        childrenElements,
        definitionData,
        definitionUi,
        categoryHash
      )
      const newUiSchema = Object.assign(
        { ...element.uischema },
        generateSchemaFromElementProps(updatedChildren)
      )
      const newSchema = Object.assign(
        { ...element.schema },
        generateSchemaFromElementProps(updatedChildren)
      )
      const newElement = {
        ...element,
        schema: newSchema,
        uischema: newUiSchema,
      }
      updatedElementArr.push(newElement)
    } else {
      updatedElementArr.push(element)
    }
  })
  return updatedElementArr
}

// propogate changes in a schema and ui schema with updated definitions but outdated body componenents
export function propagateDefinitionChanges(
  schema: { [key: string]: any },
  uischema: { [key: string]: any },
  onChange: (schema: { [key: string]: any }, uischema: { [key: string]: any }) => void,
  categoryHash: { [key: string]: string }
) {
  const definitionData = schema.definitions
  const definitionUi = uischema.definitions
  const bodyElements = generateElementPropsFromSchemas({
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
  })
  const updatedBodyElements = propagateElementChange(
    bodyElements,
    definitionData,
    definitionUi,
    categoryHash
  )

  updateSchemas(updatedBodyElements, {
    schema,
    uischema,
    definitionData,
    definitionUi,
    categoryHash,
    onChange,
  })
}

// Member-wise subtraction of array2 from array1
export function subtractArray(array1: string[], array2?: string[]): string[] {
  if (array2 === undefined || array2 === null) return array1

  // Create a map for performant array filtering on large arrays
  const keys: { [key: string]: any } = array2.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: true,
    }),
    {}
  )

  return array1.filter((v: string) => !keys[v])
}

export function excludeKeys(obj: { [key: string]: any }, keys?: string[] | null) {
  if (!keys) return { ...obj }

  // Create a map for performant object filtering
  const keysHash: { [key: string]: any } = keys.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: true,
    }),
    {}
  )

  // Create a map for performant array filtering
  return Object.keys(obj).reduce(
    (acc, curr) => (keysHash[curr] ? acc : { ...acc, [curr]: obj[curr] }),
    {}
  )
}

export function getNewElementDefaultDataOptions(i: number, mods?: Mods): DataOptions {
  if (mods && mods.newElementDefaultDataOptions !== undefined) {
    const title = `${mods.newElementDefaultDataOptions.title} ${i}`
    return { ...mods.newElementDefaultDataOptions, ...{ title: title } }
  } else {
    return {
      title: `New Input ${i}`,
      type: "string",
      default: "",
    }
  }
}

export function getRandomId(): string {
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
    "z",
  ]
  const numberOfChars = chars.length
  const randomIdLength = 50

  return Array.from({ length: randomIdLength })
    .map(() => chars[Math.floor(Math.random() * numberOfChars)])
    .join("")
}

export const DROPPABLE_TYPE = "rjsfb"
