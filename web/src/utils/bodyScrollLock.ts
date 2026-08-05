/**
 * Reference-counted background-scroll lock (docs/screens/search.md v9).
 *
 * Two rules drive the shape of this helper:
 *
 * 1. **Restore what was found, not a guess.** It saves the target's *inline* `overflow-y` (usually
 *    `''`) and writes that exact value back, so releasing the lock removes the inline declaration
 *    and hands the property back to the stylesheet. It also never touches `overflow` shorthand:
 *    `globals.css` sets `overflow-x: clip` on `body` deliberately (the shorthand would erase it,
 *    and with it every `position: sticky` in the app).
 * 2. **Count, don't toggle.** Two overlays open at once — or React re-running an effect — must not
 *    let the first release unlock the page, and the saved value must be captured only by the
 *    outermost lock.
 *
 * The target is described structurally rather than as an `HTMLElement`, which keeps the module
 * DOM-free and therefore testable in the repo's node test environment; `document.body` satisfies it.
 */
export interface IScrollLockTarget {
  style: { overflowY: string }
}

interface IScrollLockRecord {
  count: number
  previousOverflowY: string
}

const locks = new WeakMap<IScrollLockTarget, IScrollLockRecord>()

/**
 * Locks scrolling on `target` and returns the matching release. The release is idempotent — calling
 * it twice (a React cleanup that also ran on unmount) releases one lock, not two.
 */
export function lockScroll(target: IScrollLockTarget): () => void {
  const existing = locks.get(target)
  if (existing) {
    existing.count += 1
  } else {
    locks.set(target, { count: 1, previousOverflowY: target.style.overflowY })
  }
  target.style.overflowY = 'hidden'

  let released = false
  return () => {
    if (released) return
    released = true
    const record = locks.get(target)
    if (!record) return
    record.count -= 1
    if (record.count > 0) return
    locks.delete(target)
    target.style.overflowY = record.previousOverflowY
  }
}

/** Whether anything currently holds a lock on `target` (used by tests and assertions). */
export function isScrollLocked(target: IScrollLockTarget): boolean {
  return locks.has(target)
}
