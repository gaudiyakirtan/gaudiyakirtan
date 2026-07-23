// Client-safe view model + helpers for the Tracks list. Kept SEPARATE from trackListing.ts (which
// pulls in the fs-backed song repository, server-only): rows re-pick their title/author by the
// reader's `listLanguage` at runtime, so the type + pickers must not drag `fs` into the client
// bundle (same split, and same reason, as songListingView.ts vs songListing.ts).
import { IScriptText, ScriptCode } from '../models/Common'
import { IAudioTrack } from '../models/Song'
import { pickScriptText } from './textDisplay'

/**
 * One song trimmed to what the Tracks screen and the player actually need.
 *
 * Deliberately NOT the full ISong: /tracks ships 244 of these to render 753 rows, and the player
 * never reads verses/notes/translations. Author *renderings* are also not inlined here — 244 songs
 * share only 43 authors, so inlining cost 206 kB of duplicated script arrays. They live in a shared
 * [AuthorNames] table instead (41 kB) and are rejoined by `toPlayable` / `pickTrackAuthor`.
 */
export interface ITrackSong {
  uid: string
  titleMain: IScriptText[]
  authorUid: string
  /** Latin author name — SSR render + fallback when the shared table has no entry. */
  authorName: string
  /** Every recording of this song (docs/data/song.md `audio_files`). Always non-empty here. */
  tracks: IAudioTrack[]
  /** Latin title, pre-picked — SSR render + the stable sort/index key. */
  title: string
}

/** `authorUid` → all script renderings of that author's name. Shipped once per page, not per song. */
export type AuthorNames = Record<string, IScriptText[]>

/** A single recording row: one take, plus the song it belongs to. */
export interface ITrackRow {
  song: ITrackSong
  track: IAudioTrack
}

/**
 * Stable identity for a row. A take's `uid` is only unique *within* its song (several songs each
 * have a take called e.g. `tama-1`), so the song uid must be part of the key.
 */
export const trackRowKey = (row: ITrackRow): string => `${row.song.uid}:${row.track.uid}`

/** Expands songs into one row per recording — 753 rows from 244 songs in the shipped corpus. */
export function flattenTracks(songs: ITrackSong[]): ITrackRow[] {
  return songs.flatMap((song) => song.tracks.map((track) => ({ song, track })))
}

/**
 * Rebuilds the player's slice (structurally an `IPlayableSong`) by rejoining the shared author
 * table — the mini-player renders the author credit, so it needs the full renderings the row list
 * omits.
 */
export function toPlayable(song: ITrackSong, authors: AuthorNames) {
  return {
    uid: song.uid,
    titleMain: song.titleMain,
    authorDisplay: authors[song.authorUid] ?? [],
    authorUid: song.authorUid,
    tracks: song.tracks,
  }
}

/** The row's song title in the reader's `listLanguage`, falling back to Latn/Beng/primary. */
export function pickTrackTitle(song: ITrackSong, listLanguage: ScriptCode): string {
  return pickScriptText(song.titleMain, [listLanguage, 'Latn', 'Beng']) || song.title
}

/** The composing author's name in the reader's `listLanguage` (so it matches the title's script). */
export function pickTrackAuthor(
  song: ITrackSong,
  authors: AuthorNames,
  listLanguage: ScriptCode
): string {
  return pickScriptText(authors[song.authorUid], [listLanguage, 'Latn', 'Beng']) || song.authorName
}

/**
 * The A–Z index letter for a row, derived from the fixed Latin `title` (diacritics folded, e.g.
 * `śrīgaura` → `S`) so the index never reshuffles when `listLanguage` changes. Mirrors
 * songListingView.sectionLetterFor; non-alphabetic titles fall under `#`.
 */
export function sectionLetterForTrack(row: ITrackRow): string {
  const folded = row.song.title.normalize('NFD').replace(/[^A-Za-z]/g, '')
  return folded ? folded[0].toUpperCase() : '#'
}

/** Distinct performing artists across the given rows, sorted by recording count (desc). */
export function artistsOf(rows: ITrackRow[]): { artist: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const { track } of rows) {
    if (!track.artist) continue
    counts.set(track.artist, (counts.get(track.artist) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count || a.artist.localeCompare(b.artist))
}
