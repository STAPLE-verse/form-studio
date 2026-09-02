import { useState } from "react"
import DependencyField from "./dependencies/DependencyField"
import type { CardModalType, CardComponentPropsType } from "./types"
import Tooltip from "./Tooltip"
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "./fieldLayout"
import FieldAuthoringControls from "./FieldAuthoringControls"
import { useOptionalFormStudio } from "./FormStudioContext"
import type { FieldExtensionValueOverride } from "./extensions/outlets"
import type { FormStudioExtension } from "./extensions/types"

interface StagedExtensionEntry {
  extension: FormStudioExtension<any>
  value: unknown
}

const CardModal: CardModalType = ({
  componentProps,
  onChange,
  isOpen,
  onClose,
  TypeSpecificParameters,
}) => {
  // assign state values for parameters that should only change on hitting "Save"
  const [componentPropsState, setComponentProps] = useState(componentProps)

  // Same "only changes on Save" contract as componentPropsState, but for
  // registered extensions (e.g. Semantic V1 bindings) edited through the
  // FieldControls slot below — see extensions/outlets.tsx's
  // FieldExtensionValueOverride. Keyed by extension id; presence of a key
  // means "staged", independent of whether the staged value is undefined.
  const [extensionDraft, setExtensionDraft] = useState<Record<string, StagedExtensionEntry>>({})

  const [prevComponentProps, setPrevComponentProps] = useState(componentProps)
  if (componentProps !== prevComponentProps) {
    setPrevComponentProps(componentProps)
    setComponentProps(componentProps)
    setExtensionDraft({})
  }

  const formStudio = useOptionalFormStudio()
  const extensionValueOverride: FieldExtensionValueOverride | undefined = formStudio
    ? {
        getValue: (extension) =>
          Object.prototype.hasOwnProperty.call(extensionDraft, extension.id)
            ? (extensionDraft[extension.id]!.value as any)
            : formStudio.getExtensionValue(extension),
        setValue: (extension, value) =>
          setExtensionDraft((prev) => ({ ...prev, [extension.id]: { extension, value } })),
      }
    : undefined

  if (!isOpen) return null

  return (
    <dialog
      className={`modal ${isOpen ? "modal-open" : ""}`}
      data-test="card-modal"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <div className="modal-box flex max-h-[calc(100vh-4rem)] w-11/12 max-w-3xl flex-col overflow-hidden">
        <div style={{ display: componentProps.hideKey ? "none" : "initial" }} className="mb-4 shrink-0 border-b border-base-200 pb-2">
          <h3 className="text-xl font-bold">Additional Settings</h3>
        </div>
        <div
          className={`min-h-0 flex-1 overflow-y-auto px-1.5 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${fieldStackClass}`}
        >
          <TypeSpecificParameters
            parameters={componentPropsState}
            onChange={(newState: CardComponentPropsType) => {
              setComponentProps({
                ...componentPropsState,
                ...newState,
              })
            }}
          />
          <div className={fieldClass}>
            <div className={`${fieldLabelClass} flex items-center gap-2`}>
              Column Size
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Tooltip
                  id="column_size_tooltip"
                  type="help"
                  text="Set the column size of the item"
                />
              </a>
            </div>
            <input
              value={componentPropsState["ui:column"] ? componentPropsState["ui:column"] : ""}
              placeholder="Column Size"
              key="ui:column"
              type="number"
              min={0}
              onChange={(ev) => {
                setComponentProps({
                  ...componentPropsState,
                  "ui:column": ev.target.value,
                })
              }}
              className={`input input-primary input-bordered input-sm ${fieldControlClass}`}
            />
          </div>
          <DependencyField
            parameters={componentPropsState}
            onChange={(newState) => {
              setComponentProps({
                ...componentPropsState,
                ...newState,
              })
            }}
          />
          {componentPropsState.fieldPointer !== undefined && (
            <FieldAuthoringControls
              fieldPointer={componentPropsState.fieldPointer}
              valueOverride={extensionValueOverride}
            />
          )}
        </div>
        <div className="modal-action shrink-0">
          <button
            onClick={() => {
              onClose()
              setComponentProps(componentProps)
              setExtensionDraft({})
            }}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose()
              Object.values(extensionDraft).forEach(({ extension, value }) => {
                formStudio?.setExtensionValue(extension, value)
              })
              setExtensionDraft({})
              onChange(componentPropsState)
            }}
            className="btn btn-primary"
          >
            Save
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => onClose()}>close</button>
      </form>
    </dialog>
  )
}

export default CardModal
