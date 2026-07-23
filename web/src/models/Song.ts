// Conforms to docs/data/song.md, spec v2.
import { IScriptText, LanguageCode, Uid } from './Common'
import { IVerse } from './Verse'

/**
 * A recording reference (docs/data/song.md's AudioTrack value object). The playable URL is
 * `AUDIO_BASE_URL + filename` (see src/config.ts + docs/screens/player.md).
 */
export interface IAudioTrack {
  /** Stable track id, e.g. 'tama-2'. */
  uid: string
  /** Audio filename, e.g. 'A10-tama-2.mp3'. */
  filename: string
  /** Performing artist/singer, when known. */
  artist?: string
}

/**
 * The aggregate root: one complete kirtan/bhajan. Everything a screen needs to render a song
 * is reachable from here. Songs are read-only content shipped with the app (offline-first).
 */
export interface ISong {
  /** Stable identifier, e.g. 'N9'. Never changes. */
  uid: Uid
  languageOfOrigin: LanguageCode
  /** The title in one or more scripts. Non-empty (native + Latn/IAST). */
  titleMain: IScriptText[]
  /** References an Author, or the sentinel '?' for unknown authorship. */
  authorUid: Uid
  /** Denormalized author name(s) for display without a join. */
  authorDisplay: IScriptText[]
  /** Topic groupings this song belongs to (ISongGroup uids of kind 'topic'). */
  topics?: Uid[]
  /** Free-form labels (festival, mood, deity, etc.). */
  tags?: string[]
  /** Ordered stanzas. Non-empty. Render order = array order - never sort by verseNumber. */
  verses: IVerse[]
  /** Annotations / glossary lines shown with the song. */
  notes?: string[]
  /** Whether any recording exists. Drives player visibility. Equals audioFiles.length > 0. */
  audioAvailable: boolean
  audioFiles?: IAudioTrack[]
}
