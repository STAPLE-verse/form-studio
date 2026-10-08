import React from "react"

// Reserved key in a cardOpenState record: the open state of every card/section
// that has no entry of its own. Per-card entries always win over it.
const DEFAULT_OPEN_KEY = "\u0000default"

export interface CollapseAllSignal {
  // Bumped on every collapse/expand-all press so repeated presses still fire
  version: number
  open: boolean
}

export const CollapseAllContext = React.createContext<CollapseAllSignal>({
  version: 0,
  open: false,
})

export function isCardOpen(cardOpenState: Record<string, boolean>, key: string): boolean {
  return cardOpenState[key] ?? cardOpenState[DEFAULT_OPEN_KEY] ?? false
}

// Resets every card/section tracked in this state record to the signal's state.
// A nested Section keeps its own record, so each one calls this too.
// The component that owns the signal passes it directly, since it sits above
// its own provider.
export function useCollapseAllSync(
  setCardOpenState: (state: Record<string, boolean>) => void,
  ownSignal?: CollapseAllSignal
): void {
  const contextSignal = React.useContext(CollapseAllContext)
  const { version, open } = ownSignal ?? contextSignal
  const seenVersion = React.useRef(version)

  React.useEffect(() => {
    if (version === seenVersion.current) return
    seenVersion.current = version
    setCardOpenState({ [DEFAULT_OPEN_KEY]: open })
  }, [version, open, setCardOpenState])
}
