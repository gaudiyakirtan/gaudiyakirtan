// Option lists + display labels for the Settings screen's Display group. Kept honest to the
// shipped corpus (docs/data): word-to-word ships eng/hin/ben/guj; translations ship eng only.
import { LanguageCode, ScriptCode } from '../models/Common'
import { RomanStandard } from '../models/Settings'

/** Scripts offered for `displayScript` / `listLanguage` (docs/screens/settings.md value set). */
export const DISPLAY_SCRIPT_OPTIONS: ScriptCode[] = [
  'Beng',
  'Latn',
  'Deva',
  'Telu',
  'Knda',
  'Taml',
  'Mlym',
  'Gujr',
  'Orya',
  'Cyrl',
]

/** The Display-script picker also offers "Default (source language)" (auto) at the top — each song
 * renders its source line in its own native script. */
export const DISPLAY_SCRIPT_OPTIONS_WITH_AUTO: ScriptCode[] = ['auto', ...DISPLAY_SCRIPT_OPTIONS]

export const ROMAN_STANDARD_OPTIONS: RomanStandard[] = ['IAST', 'ISO15919', 'BBT_Roman', 'GVP_Roman']

const ROMAN_STANDARD_NAMES: Record<RomanStandard, string> = {
  IAST: 'IAST',
  ISO15919: 'ISO 15919',
  BBT_Roman: 'BBT Roman',
  GVP_Roman: 'GVP Roman',
}

const LANGUAGE_NAMES: Record<string, string> = {
  eng: 'English',
  hin: 'Hindi',
  ben: 'Bengali',
  guj: 'Gujarati',
  san: 'Sanskrit',
}

/** Languages the corpus actually ships a word-to-word glossary in. */
export const WORD_TO_WORD_LANGUAGE_OPTIONS: LanguageCode[] = ['eng', 'hin', 'ben', 'guj']

/** Languages the corpus actually ships a full translation in (currently English only). */
export const TRANSLATION_LANGUAGE_OPTIONS: LanguageCode[] = ['eng']

export function romanStandardName(standard: RomanStandard): string {
  return ROMAN_STANDARD_NAMES[standard] ?? standard
}

export function languageName(code: LanguageCode): string {
  return LANGUAGE_NAMES[code] ?? code
}
