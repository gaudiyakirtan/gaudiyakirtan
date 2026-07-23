// Client-safe view model + helpers for song list rows. Kept SEPARATE from songListing.ts (which
// pulls in the fs-backed repositories, server-only): components render list titles by the reader's
// `listLanguage` at runtime, so the type + picker must not drag `fs` into the client bundle.
import { IScriptText, ScriptCode } from '../models/Common'
import { pickScriptText } from './textDisplay'

export interface ISongListing {
  uid: string
  /** Default primary title (used for SSR / when the list-language script is unavailable). */
  title: string
  /** All title renderings, so lists can re-pick client-side by the reader's `listLanguage`. */
  titles: IScriptText[]
  /** The composing author's uid, for the author-filtered list variant. */
  authorUid: string
  /** Author name in the fixed default script (Latn) — SSR / fallback. */
  authorName: string
  /** All author-name renderings, so lists re-pick by the reader's `listLanguage` (like titles do). */
  authorNames?: IScriptText[]
  languageOfOrigin: string
  audioAvailable: boolean
  firstLetter?: string
}

/** The list title in the reader's chosen `listLanguage` script, falling back to Latn/Beng/primary. */
export function pickListTitle(listing: ISongListing, listLanguage: ScriptCode): string {
  return pickScriptText(listing.titles, [listLanguage, 'Latn', 'Beng']) || listing.title
}

/** The author name in the reader's `listLanguage` script (so it matches the title's script), falling
 * back to the Latn default. */
export function pickListAuthor(listing: ISongListing, listLanguage: ScriptCode): string {
  return pickScriptText(listing.authorNames, [listLanguage, 'Latn', 'Beng']) || listing.authorName
}

/**
 * The A–Z index letter for a song. Prefers the manifest's normalized `first_letter` when it is a
 * plain ASCII letter (it already folds diacritics, e.g. `śrīgaura` → `S`); otherwise derives a
 * stable Latin letter from the `primary_title` by stripping combining marks. This keeps the index
 * on the fixed Latin `primary_title` so it never reshuffles when `listLanguage` changes
 * (docs/screens/songs-list.md). Non-alphabetic titles fall under `#`.
 */
export function sectionLetterFor(listing: ISongListing): string {
  const fl = listing.firstLetter
  if (fl && /^[A-Za-z]$/.test(fl)) return fl.toUpperCase()

  const folded = listing.title.normalize('NFD').replace(/[^A-Za-z]/g, '')
  return folded ? folded[0].toUpperCase() : '#'
}
