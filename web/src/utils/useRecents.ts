// Recently-opened songs, for the home screen's "Continue" region (docs/screens/home.md §2).
//
// Stored LOCALLY on the device and never transmitted: this is reading history, and the App Store
// privacy posture for this app is "no data collected". Keep it that way.
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gk.recents'
const MAX_ENTRIES = 10

export interface IRecentEntry {
  uid: string
  /** Epoch ms. */
  at: number
}

function read(): IRecentEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (e): e is IRecentEntry =>
          !!e && typeof e === 'object' && typeof (e as IRecentEntry).uid === 'string',
      )
      .slice(0, MAX_ENTRIES)
  } catch {
    // Corrupt or unavailable storage (private mode, quota, hand-edited value) is not worth
    // surfacing - Continue is an enhancement, so degrade to "no history" rather than throwing.
    return []
  }
}

function write(entries: IRecentEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    /* storage full or blocked - ignore */
  }
}

/** Append a song to the local history, most-recent first, de-duplicated. Safe to call on every
 * song-detail mount. */
export function recordSongVisit(uid: string): void {
  if (!uid) return
  const next = [{ uid, at: Date.now() }, ...read().filter((e) => e.uid !== uid)]
  write(next)
}

/**
 * The reader's recently-opened songs.
 *
 * Returns `[]` on the server and on the first client render, then fills in after mount — home is
 * statically generated, so reading localStorage during render would cause a hydration mismatch.
 * Callers should hide the region while `hydrated` is false rather than flashing an empty state.
 */
export function useRecents(): { recents: IRecentEntry[]; hydrated: boolean } {
  const [recents, setRecents] = useState<IRecentEntry[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setRecents(read())
    setHydrated(true)
  }, [])

  return { recents, hydrated }
}

/** Clears the local history (exposed for a future Settings control). */
export function clearRecents(): void {
  write([])
}
