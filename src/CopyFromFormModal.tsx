import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import FBCheckbox from "./checkbox/FBCheckbox"
import { fieldClass, fieldControlClass, fieldLabelClass, fieldStackClass } from "./fieldLayout"
import {
  listCopyableItems,
  type ItemSource,
  type ItemSourceForm,
  type ItemSourceFormContents,
} from "./itemSource"

interface CopyFromFormModalProps {
  isOpen: boolean
  onClose: () => void
  itemSource: ItemSource
  categoryHash: { [key: string]: string }
  onCopy: (contents: ItemSourceFormContents, names: string[]) => void
}

const selectClass = `select select-primary select-bordered select-md text-base ${fieldControlClass} border-2 focus:!outline-secondary focus:!outline-[3px] focus:!outline-offset-0 focus:![--input-color:var(--color-secondary)]`

export default function CopyFromFormModal({
  isOpen,
  onClose,
  itemSource,
  categoryHash,
  onCopy,
}: CopyFromFormModalProps) {
  const [forms, setForms] = useState<ItemSourceForm[] | null>(null)
  const [formsError, setFormsError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState("")
  const [contents, setContents] = useState<ItemSourceFormContents | null>(null)
  const [loadingForm, setLoadingForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [picked, setPicked] = useState<string[]>([])

  // load the list of forms each time the dialog opens
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setForms(null)
    setFormsError(null)
    setSelectedId("")
    setContents(null)
    setPicked([])
    itemSource
      .listForms()
      .then((result) => !cancelled && setForms(result))
      .catch(() => !cancelled && setFormsError("Your forms could not be loaded."))
    return () => {
      cancelled = true
    }
  }, [isOpen, itemSource])

  if (!isOpen || typeof document === "undefined") return null

  const chooseForm = (id: string) => {
    setSelectedId(id)
    setContents(null)
    setFormError(null)
    setPicked([])
    const form = forms?.find((candidate) => `${candidate.id}` === id)
    if (!form) return
    setLoadingForm(true)
    itemSource
      .getForm(form.id)
      .then((result) => setContents(result))
      .catch(() => setFormError("That form could not be loaded."))
      .finally(() => setLoadingForm(false))
  }

  const items = contents ? listCopyableItems(contents, categoryHash) : []
  const togglePicked = (name: string) =>
    setPicked((current) =>
      current.includes(name) ? current.filter((existing) => existing !== name) : [...current, name]
    )

  return createPortal(
    <dialog
      className="modal modal-open"
      data-test="copy-from-form-modal"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <div className="modal-box flex max-h-[calc(100vh-4rem)] w-11/12 max-w-3xl flex-col overflow-hidden">
        <div className="mb-4 shrink-0 border-b border-base-200 pb-2">
          <h3 className="text-xl font-bold">Copy from another form</h3>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto px-1.5 py-4 ${fieldStackClass}`}>
          <div className={fieldClass}>
            <div className={fieldLabelClass}>Form</div>
            {formsError && <p className="text-base text-error">{formsError}</p>}
            {!formsError && forms === null && <p className="text-base">Loading your forms...</p>}
            {forms !== null && forms.length === 0 && (
              <p className="text-base">You don't have any other forms to copy from yet.</p>
            )}
            {forms !== null && forms.length > 0 && (
              <select
                className={selectClass}
                value={selectedId}
                onChange={(event) => chooseForm(event.target.value)}
              >
                <option value="">Choose a form...</option>
                {forms.map((form) => (
                  <option key={form.id} value={`${form.id}`}>
                    {form.title}
                    {form.description ? ` (${form.description})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {loadingForm && <p className="text-base">Loading items...</p>}
          {formError && <p className="text-base text-error">{formError}</p>}
          {contents && items.length === 0 && (
            <p className="text-base">This form doesn't have any items yet.</p>
          )}
          {contents && items.length > 0 && (
            <div className={fieldClass}>
              <div className={fieldLabelClass}>Items to copy</div>
              {items.map((item) => (
                <div key={item.name}>
                  <FBCheckbox
                    id={`copy_item_${item.name}`}
                    isChecked={picked.includes(item.name)}
                    disabled={!!item.unavailableReason}
                    onChangeValue={() => togglePicked(item.name)}
                    label={`${item.title}${item.kind === "section" ? " (section)" : ""}${
                      item.choiceCount !== undefined ? ` - ${item.choiceCount} choices` : ""
                    }`}
                  />
                  {item.unavailableReason && (
                    <p className="text-base text-base-content/90 ml-10">{item.unavailableReason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-action shrink-0">
          <button onClick={onClose} className="btn text-base btn-secondary">
            Cancel
          </button>
          <button
            disabled={picked.length === 0 || !contents}
            onClick={() => {
              if (!contents) return
              onCopy(contents, picked)
              onClose()
            }}
            className="btn text-base btn-primary"
          >
            {picked.length > 1 ? `Copy ${picked.length} items` : "Copy item"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>,
    document.body
  )
}
