"use client"

import React, { ReactElement, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { SemanticV1Component } from "@staple-verse/marker-template-runtime"
import Card from "./Card"
import Section from "./Section"
import Add from "./Add"
import MarkdownDescriptionInput from "./MarkdownDescriptionInput"
import SemanticRootClassInput from "./SemanticRootClassInput"
import { SemanticAuthoringProvider } from "./SemanticAuthoringContext"
import { useDebouncedSemanticDiagnostics } from "./useDebouncedSemanticDiagnostics"
import {
  parse,
  stringify,
  checkForUnsupportedFeatures,
  generateElementPropsFromSchemas,
  generateElementComponentsFromSchemas,
  addCardObj,
  addSectionObj,
  onDragEnd,
  generateCategoryHash,
  excludeKeys,
  DROPPABLE_TYPE,
} from "./utils"
import DEFAULT_FORM_INPUTS from "./defaults/defaultFormInputs"
import type { Mods, InitParameters, AddFormObjectParametersType } from "./types"
import { builderControlAppearanceClass } from "./controlAppearance"


export default function FormBuilder({
  schema,
  uiSchema,
  semantics,
  onMount,
  onChange,
  onSemanticsChange,
  mods,
  className,
}: {
  schema: string
  uiSchema: string
  /** Omit for a Core-only form; see FormStudioState.semantics. */
  semantics?: SemanticV1Component
  onMount?: (parameters: InitParameters) => any
  onChange: (schema: string, uiSchema: string) => any
  /**
   * Enables the form-level semantic root-class control (§5.1). Without it
   * the control is not rendered — there would be nowhere to persist a
   * change — so a host that does not pass this prop sees no behavior
   * change, preserving Core-only compatibility for existing consumers.
   */
  onSemanticsChange?: (newSemantics: SemanticV1Component | undefined) => void
  mods?: Mods
  className?: string
}): ReactElement {
  const schemaData = parse(schema)
  schemaData.type = "object"
  const uiSchemaData = parse(uiSchema)
  const allFormInputs = excludeKeys(
    Object.assign({}, DEFAULT_FORM_INPUTS, (mods && mods.customFormInputs) || {}),
    mods && mods.deactivatedFormInputs
  )
  const categoryHash = generateCategoryHash(allFormInputs)

  // Debounced (§8): re-walking every binding's field pointer against the
  // schema on each Visual Builder keystroke gets expensive for forms with
  // many bindings. See `useDebouncedSemanticDiagnostics` for the shared
  // debounce this and `FormStudioContext` both use.
  const semanticDiagnostics = useDebouncedSemanticDiagnostics(
    schemaData,
    semantics,
    Boolean(onSemanticsChange)
  )

  const compatibilityDiagnostics = generateElementPropsFromSchemas({
    schema: schemaData,
    uischema: uiSchemaData,
    definitionData: schemaData.definitions,
    definitionUi: uiSchemaData.definitions,
    categoryHash,
  }).flatMap((element) => {
    if (!element.compatibility || element.compatibility.kind === "editable") return []
    const pointer = `/properties/${element.name.replace(/~/g, "~0").replace(/\//g, "~1")}`
    return [`[${element.compatibility.code}] ${pointer}: ${element.compatibility.message}`]
  })

  const unsupportedFeatures = Array.from(
    new Set([
      ...checkForUnsupportedFeatures(schemaData, uiSchemaData, allFormInputs).filter(
        (msg) =>
          !msg.includes("Object Property: _stapleSchema") &&
          !msg.includes("Property Parameter: readOnly in _stapleSchema") &&
          !msg.includes("UI Widget: hidden for _stapleSchema") &&
          !msg.includes("UI schema property: _stapleSchema")
      ),
      ...compatibilityDiagnostics,
    ])
  )

  const [cardOpenState, setCardOpenState] = React.useState<Record<string, boolean>>({})

  const isFirstRender = React.useRef(true)

  const addProperties: AddFormObjectParametersType = {
    schema: schemaData,
    uischema: uiSchemaData,
    mods: mods,
    onChange: (newSchema: { [key: string]: any }, newUiSchema: { [key: string]: any }) =>
      onChange(stringify(newSchema), stringify(newUiSchema)),
    definitionData: schemaData.definitions,
    definitionUi: uiSchemaData.definitions,
    categoryHash,
  }

  const hideAddButton = schemaData.properties && Object.keys(schemaData.properties).length !== 0

  useEffect(() => {
    if (isFirstRender.current) {
      if (onMount)
        onMount({
          categoryHash,
        })
      isFirstRender.current = false
    }
  }, [onMount, categoryHash])

  return (
    <SemanticAuthoringProvider
      value={
        onSemanticsChange
          ? {
              rootSchema: schemaData,
              semantics,
              onSemanticsChange,
              diagnostics: semanticDiagnostics,
            }
          : undefined
      }
    >
    <div
      className={`formBuilder ${builderControlAppearanceClass} ${className || ""}`}
    >
      <div
        className="alert alert-warning mb-4 flex-col items-start"
        style={{
          display: unsupportedFeatures.length === 0 ? "none" : "flex",
        }}
      >
        <h5 className="font-bold">Compatibility diagnostics:</h5>
        <ul className="list-disc pl-5">
          {unsupportedFeatures.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
      {(!mods || mods.showFormHead !== false) && (
        <div
          className="formHead border border-base-300 rounded-xl bg-base-200 shadow-sm p-4"
          data-test="form-head"
        >
          <div>
            <h5 data-test="form-name-label" className="font-semibold mb-2">
              {mods && mods.labels && typeof mods.labels.formNameLabel === "string"
                ? mods.labels.formNameLabel
                : "Form Name"}
            </h5>
            <input
              value={schemaData.title || ""}
              placeholder="Title"
              type="text"
              onChange={(ev) => {
                onChange(
                  stringify({
                    ...schemaData,
                    title: ev.target.value,
                  }),
                  uiSchema
                )
              }}
              className="input input-primary input-bordered w-full form-title mb-4"
            />
          </div>
          <div>
            <h5 data-test="form-description-label" className="font-semibold mb-2">
              {mods && mods.labels && typeof mods.labels.formDescriptionLabel === "string"
                ? mods.labels.formDescriptionLabel
                : "Form Description"}
            </h5>
            <MarkdownDescriptionInput
              value={schemaData.description || ""}
              onChange={(val) =>
                onChange(
                  stringify({
                    ...schemaData,
                    description: val,
                  }),
                  uiSchema
                )
              }
            />
          </div>
          {onSemanticsChange && (
            <SemanticRootClassInput semantics={semantics} onSemanticsChange={onSemanticsChange} />
          )}
        </div>
      )}
      <div className="form-body formBody mt-6">
        <DragDropContext
          onDragEnd={(result) =>
            onDragEnd(result, {
              schema: schemaData,
              uischema: uiSchemaData,
              onChange: (newSchema, newUiSchema) =>
                onChange(stringify(newSchema), stringify(newUiSchema)),
              definitionData: schemaData.definitions,
              definitionUi: uiSchemaData.definitions,
              categoryHash,
            })
          }
        >
          <Droppable droppableId="droppable" type={DROPPABLE_TYPE}>
            {(providedDroppable) => (
              <div 
                ref={providedDroppable.innerRef} 
                {...providedDroppable.droppableProps}
                className="mb-4"
              >
                {generateElementComponentsFromSchemas({
                  schemaData,
                  uiSchemaData,
                  onChange: (newSchema, newUiSchema) =>
                    onChange(stringify(newSchema), stringify(newUiSchema)),
                  definitionData: schemaData.definitions,
                  definitionUi: uiSchemaData.definitions,
                  path: "root",
                  fieldPointer: "",
                  cardOpenState,
                  setCardOpenState,
                  allFormInputs,
                  mods,
                  categoryHash,
                  Card,
                  Section,
                }).map((element: any, index) => (
                  // @ts-ignore: suppress key error, can't change key assignment
                  <Draggable
                    key={element.key}
                    draggableId={element.key}
                    index={index}
                    isDragDisabled={element.props.compatibility !== undefined}
                  >
                    {(providedDraggable, snapshot) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        style={providedDraggable.draggableProps.style}
                        className={`pb-4 ${snapshot.isDragging && !snapshot.isDropAnimating ? "opacity-60" : ""}`}
                      >
                        {React.cloneElement(element, {
                          dragHandleProps: providedDraggable.dragHandleProps,
                        })}
                      </div>
                    )}
                  </Draggable>
                ))}
                {providedDroppable.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <div className="form-footer formFooter">
        {!hideAddButton && mods?.components?.add && mods.components.add(addProperties)}
        {!mods?.components?.add && (
          <Add
            tooltipDescription={((mods || {}).tooltipDescriptions || {}).add}
            labels={mods?.labels ?? {}}
            addElem={(choice: string) => {
              if (choice === "card") {
                addCardObj(addProperties)
              } else if (choice === "section") {
                addSectionObj(addProperties)
              }
            }}
            hidden={hideAddButton}
          />
        )}
      </div>
    </div>
    </SemanticAuthoringProvider>
  )
}
