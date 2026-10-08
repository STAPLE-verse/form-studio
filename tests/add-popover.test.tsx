// @vitest-environment jsdom

import React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import Add from "../src/Add"

function mockLayout(rect: { top: number; bottom: number }, popoverHeight: number) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    ...rect,
    left: 100,
    right: 500,
    width: 400,
    height: rect.bottom - rect.top,
    x: 100,
    y: rect.top,
    toJSON: () => ({}),
  })
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(popoverHeight)
}

function openPopover() {
  render(<Add addElem={() => undefined} />)
  fireEvent.click(screen.getByTitle("Add a new item or section"))
  return screen.getByText("Create New").parentElement as HTMLElement
}

describe("Add popover placement", () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  test("opens above the plus icon when there is room", () => {
    mockLayout({ top: 500, bottom: 540 }, 200)
    expect(openPopover().style.top).toBe("292px") // 500 - 200 - 8
  })

  test("falls back to below the plus icon near the top of the page", () => {
    mockLayout({ top: 100, bottom: 140 }, 200)
    expect(openPopover().style.top).toBe("148px") // 140 + 8
  })
})
