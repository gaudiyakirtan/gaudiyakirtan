// Shared conventions used across every entity in docs/data/README.md.
//
// Canonical on-disk JSON (pipeline output) is snake_case, e.g. `script_code`,
// `language_of_origin`. Web decodes those into camelCase TS interfaces at the data-access
// boundary (see src/services/decode.ts) - the mapping is a platform detail, not a schema change.

/** ISO 639-3 language code, three lowercase letters, e.g. 'ben', 'san', 'hin', 'eng'. */
export type LanguageCode = string

/** ISO 15924 script code, four letters initial-cap, e.g. 'Latn', 'Beng', 'Deva'. */
export type ScriptCode = string

/** Transliteration standard. Only meaningful when scriptCode === 'Latn'. */
export type TransliterationStandard = 'ISO15919' | 'IAST'

/** A uid string referencing another entity (Song, Author, SongGroup, ...). */
export type Uid = string

/**
 * A single piece of text in one script (used for titles, author names, group titles - one
 * line per entry). Corresponds to the `ScriptText` value object in docs/data/song.md.
 */
export interface IScriptText {
  scriptCode: ScriptCode
  /** Present only when scriptCode === 'Latn'. */
  standard?: TransliterationStandard
  text: string
}

/** Reserved sentinel uid for unknown/unattributed authorship (docs/data/author.md). */
export const UNKNOWN_AUTHOR_UID = '?'
