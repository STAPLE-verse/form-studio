import { useEffect, useRef, useState } from "react"
import { createDebouncer } from "./debounce"

/**
 * Returns `value`, but only reflects a newer value once it has stopped
 * changing for `delayMs` — a trailing debounce with no leading edge. The
 * initial value is returned immediately on first render (there is nothing
 * yet to wait out, and this must also hold with no client-side effects at
 * all, e.g. server-side rendering); every later change resets the wait
 * rather than compounding it, and the previously debounced value is kept
 * visible the whole time a newer one is settling.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  const debouncerRef = useRef<ReturnType<typeof createDebouncer> | undefined>(undefined)
  if (!debouncerRef.current) {
    debouncerRef.current = createDebouncer(delayMs)
  }

  useEffect(() => {
    debouncerRef.current!.schedule(() => setDebounced(value))
    return () => debouncerRef.current!.cancel()
  }, [value, delayMs])

  return debounced
}
