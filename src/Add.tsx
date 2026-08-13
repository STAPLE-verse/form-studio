import React, { useState, useEffect, useLayoutEffect, useRef, ReactElement } from "react"
import { createPortal } from "react-dom"
import FBRadioGroup from "./radio/FBRadioGroup"
import type { ModLabels } from "./types"
import { PlusIcon } from "@heroicons/react/24/outline"

export default function Add({
  addElem,
  hidden,
  tooltipDescription,
  labels,
}: {
  addElem: (choice: string) => void
  hidden?: boolean
  tooltipDescription?: string
  labels?: ModLabels
}): ReactElement {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [createChoice, setCreateChoice] = useState("card")
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setPopoverOpen(false)
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [popoverOpen])

  useLayoutEffect(() => {
    if (!popoverOpen || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const popoverWidth = 256 // w-64
    setPopoverPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX + rect.width / 2 - popoverWidth / 2,
    })
  }, [popoverOpen])

  if (hidden) return <></>

  return (
    <div ref={containerRef} className="relative flex flex-col items-center mt-4 w-full">
      <div
        className="group w-full py-2 flex justify-center cursor-pointer border-2 border-dashed border-base-content/40 bg-base-300 hover:border-primary hover:bg-primary/5 rounded-lg transition-all"
        onClick={() => setPopoverOpen(!popoverOpen)}
        title={tooltipDescription || "Add a new item or section"}
      >
        <PlusIcon className="h-6 w-6 text-base-content/70 group-hover:text-primary transition-colors" />
      </div>

      {popoverOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "absolute", top: popoverPos.top, left: popoverPos.left }}
            className="z-50 p-4 shadow-xl bg-base-100 rounded-box w-64 border border-base-300"
          >
            <div className="font-bold text-center mb-4 border-b pb-2">Create New</div>
            <FBRadioGroup
              className="choose-create text-sm"
              defaultValue={createChoice}
              horizontal={false}
              options={[
                {
                  value: "card",
                  label: labels?.addElementLabel ?? "Item",
                },
                {
                  value: "section",
                  label: labels?.addSectionLabel ?? "Section",
                },
              ]}
              onChange={(selection) => {
                setCreateChoice(selection)
              }}
            />
            <div className="flex justify-between mt-4">
              <button onClick={() => setPopoverOpen(false)} className="btn btn-sm btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  addElem(createChoice)
                  setPopoverOpen(false)
                }}
                className="btn btn-sm btn-primary"
              >
                Create
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
