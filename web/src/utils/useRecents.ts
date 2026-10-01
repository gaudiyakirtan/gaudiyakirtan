// Device-local reading history. Song-detail visits write it; choosing recordings never does.
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gk.recents'
const MAX_ENTRIES = 10
export interface IRecentEntry {
  uid: string
  lastOpenedAt: number
}

/** Accept the previously shipped `at` field without discarding anyone's history. */
export function parseRecents(raw: string | null): IRecentEntry[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(parsed)) return []
    const entries: IRecentEntry[] = []
    for (const value of parsed) {
      if (!value || typeof value !== 'object' || typeof value.uid !== 'string' || !value.uid) continue
      const lastOpenedAt = value.lastOpenedAt ?? value.at
      if (typeof lastOpenedAt !== 'number' || !Number.isFinite(lastOpenedAt)) continue
      entries.push({ uid: value.uid, lastOpenedAt })
    }
    const seen = new Set<string>()
    return entries.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt).filter(({ uid }) => {
      if (seen.has(uid)) return false
      seen.add(uid)
      return true
    }).slice(0, MAX_ENTRIES)
  } catch { return [] }
}

function read(): IRecentEntry[] {
  try { return parseRecents(window.localStorage.getItem(STORAGE_KEY)) } catch { return [] }
}
function write(entries: IRecentEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
    window.dispatchEvent(new Event('gk-recents-change'))
  } catch { /* best-effort local storage */ }
}
export function recordSongVisit(uid: string) {
  if (uid) write([{ uid, lastOpenedAt: Date.now() }, ...read().filter((entry) => entry.uid !== uid)])
}
export function useRecents() {
  const [recents, setRecents] = useState<IRecentEntry[]>([])
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const update = () => { setRecents(read()); setHydrated(true) }
    update()
    window.addEventListener('storage', update)
    window.addEventListener('gk-recents-change', update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener('gk-recents-change', update)
    }
  }, [])
  return { recents, hydrated }
}
export function clearRecents() { write([]) }
