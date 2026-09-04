/**
 * Shared trailing-debounce delay (milliseconds). One constant so the
 * autosave recovery-buffer write (`FormStudioUI`, §4.2) and deferred
 * registered extension revalidation (§8) settle on
 * the same schedule instead of drifting independently.
 */
export const DEBOUNCE_MS = 1500

export interface Debouncer {
  /** Runs `callback` after the delay, restarting the wait if called again first. */
  schedule: (callback: () => void) => void
  /** Discards a pending callback, if any, without running it. */
  cancel: () => void
}

/**
 * A trailing debounce: repeated `schedule` calls keep pushing the callback
 * out rather than compounding into multiple runs, and only the most
 * recently scheduled callback ever fires. This is the one debounce
 * primitive Form Studio uses everywhere it defers expensive or bursty work
 * (the autosave recovery buffer and Semantic V1 revalidation, see
 * `useDebouncedValue`), so a future debounced computation reuses it instead
 * of hand-rolling another `setTimeout`/`clearTimeout` pair.
 */
export function createDebouncer(delayMs: number): Debouncer {
  let handle: ReturnType<typeof setTimeout> | undefined

  return {
    schedule(callback: () => void) {
      if (handle !== undefined) clearTimeout(handle)
      handle = setTimeout(callback, delayMs)
    },
    cancel() {
      if (handle !== undefined) clearTimeout(handle)
      handle = undefined
    },
  }
}
