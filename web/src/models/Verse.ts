// Conforms to docs/data/verse.md, spec v1.
import { LanguageCode, ScriptCode, TransliterationStandard } from './Common'
import { ITranslation } from './Translation'

/** The verse's lines rendered in one script. Line count matches sourceTextMaster. */
export interface IDisplayScript {
  scriptCode: ScriptCode
  /** Only present when scriptCode === 'Latn'; absent/null otherwise. */
  standard?: TransliterationStandard | null
  text: string[]
}

/** The ordered per-word glossary for one language rendered in one script. */
export interface IWordToWord {
  languageCode: LanguageCode
  /** Script the headwords are written in. */
  scriptCode: ScriptCode
  standard?: TransliterationStandard | null
  /** Ordered [headword, gloss] pairs, in reading order. Never sorted. */
  words: [string, string][]
}

/**
 * One ordered stanza of a Song. Holds the master ISO 15919 Latin text, every script
 * rendering of it, the word-to-word glossary, and full Translations.
 */
export interface IVerse {
  /** 1-based printed label. Display only - never used to reorder; order = array order. */
  verseNumber: number
  /** Master lines in ISO 15919 Latin, with inline [FLAG_*] markers. Not for display. */
  sourceTextMaster: string[]
  /** The master rendered into each supported script, flags resolved. */
  displayScripts: IDisplayScript[]
  /** Per-word glossary. Absent on ~80% of verses in the shipped corpus - omit, don't stub. */
  wordToWords?: IWordToWord[]
  /** Full-meaning renderings. Absent on ~78% of verses in the shipped corpus. */
  translations?: ITranslation[]
}
