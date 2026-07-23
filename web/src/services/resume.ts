// Pure "resume where you left off" serialization (docs/screens/player.md feature 3), kept
// separate from PlayerContext so building/validating the persisted snapshot is unit-testable
// without localStorage or a DOM <audio> element.
//
// The snapshot deliberately carries the song's own title/author/tracks, not just its uid: this is
// a fully static, backend-less app (docs/screens/player.md - "no runtime backend to fall back
// on"), so on a fresh page load there is nothing to re-fetch a uid's title/tracks *from* besides
// whichever song page happens to be open. Persisting the small IPlayableSong-shaped slice
// alongside the position means the mini-player can restore a full, correct "Resume ..." session
// from any page, not only when the reader happens to revisit that exact song's detail page.
import { IScriptText } from '../models/Common'
import { IAudioTrack } from '../models/Song'

/** Structurally identical to PlayerContext's `IPlayableSong` - defined independently here (rather
 * than imported) so this module has no dependency on PlayerContext.tsx and can't form a cycle. */
export interface IResumableSong {
  uid: string
  titleMain: IScriptText[]
  authorDisplay: IScriptText[]
  authorUid: string
  tracks: IAudioTrack[]
}

export interface IResumeRecord {
  song: IResumableSong
  trackUid: string
  /** Playback position in seconds at the moment this was saved. */
  position: number
  /** Epoch ms this snapshot was written. */
  savedAt: number
}

/** A resume snapshot older than this is not worth resurrecting - the reader has almost certainly
 * moved on, and a stale "Resume ..." chip reappearing weeks later would read as a bug. */
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

/** Builds the persisted snapshot from the in-memory playable song + playback position. */
export function buildResumeRecord(
  song: IResumableSong,
  trackUid: string,
  position: number,
  now: number
): IResumeRecord {
  return { song, trackUid, position: Math.max(0, position), savedAt: now }
}

/**
 * Parses + validates a raw localStorage value. Returns null for anything missing, malformed, too
 * old, or internally inconsistent (trackUid not among the saved tracks) - resume is a
 * convenience, never worth throwing over (same posture as SettingsContext/useRecents).
 */
export function parseResumeRecord(raw: string | null, now: number): IResumeRecord | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const { song, trackUid, position, savedAt } = parsed as Partial<IResumeRecord>
    if (!song || typeof song !== 'object' || typeof song.uid !== 'string') return null
    if (!Array.isArray(song.tracks) || song.tracks.length === 0) return null
    if (typeof trackUid !== 'string' || typeof position !== 'number' || typeof savedAt !== 'number') {
      return null
    }
    if (now - savedAt > MAX_AGE_MS) return null
    if (!song.tracks.some((t) => t && t.uid === trackUid)) return null

    return { song, trackUid, position: Math.max(0, position), savedAt }
  } catch {
    return null
  }
}

/** Throttle gate for the periodic position save - true once at least `intervalMs` has elapsed
 * since the last save ("every few seconds", not on every `timeupdate` tick - docs/screens/player.md). */
export function shouldPersist(lastSavedAt: number, now: number, intervalMs: number): boolean {
  return now - lastSavedAt >= intervalMs
}
