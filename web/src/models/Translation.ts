// Conforms to docs/data/translation.md, spec v1.
import { LanguageCode } from './Common'

/** 'generated' = produced by a translation agent; 'human' = hand-authored/verified. */
export type TranslationSource = 'human' | 'generated'

/**
 * The full-meaning rendering of a single Verse into one human language. A verse may carry
 * translations in several languages; (verse, languageCode) is unique.
 */
export interface ITranslation {
  languageCode: LanguageCode
  /** One or more display lines/paragraphs. Never empty - an absent translation is omitted. */
  text: string[]
  /** Defaults to 'human' when absent from the canonical JSON. */
  source?: TranslationSource
}
