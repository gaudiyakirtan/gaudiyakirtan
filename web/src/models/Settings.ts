// The device-local, persisted reader settings (docs/screens/settings.md). Drives song-detail
// rendering (which script, roman scheme, glosses, translation) and list-title script. Persisted to
// localStorage on web. `theme` is intentionally NOT here - it lives in the existing ThemeContext
// (utils/ThemeContext.tsx) per the slice-2b brief; these are the seven Display-group settings.
import { LanguageCode, ScriptCode } from './Common'

/** Roman transliteration scheme used for the highlighted reading line when rendering Latin. */
export type RomanStandard = 'IAST' | 'ISO15919' | 'BBT_Roman' | 'GVP_Roman'

export interface ISettings {
  /** Script of the **source verse** line (line 1, muted reference). */
  displayScript: ScriptCode
  /** Script of the **transliteration** line (line 2, the highlighted reading). It is just a
   *  transliteration, so it can be any script — not only Roman/Latin. */
  transliterationScript: ScriptCode
  /** Roman scheme used for whichever line is Latin (`English (Roman / Latin)`). */
  romanStandard: RomanStandard
  /** Show the source line (line 1, native script). */
  showSource: boolean
  /** Show the transliteration line (line 2, the reading line). */
  showTransliteration: boolean
  showWordToWord: boolean
  wordToWordLanguage: LanguageCode
  showTranslation: boolean
  translationLanguage: LanguageCode
  /** Which script titles render in on list/browse screens. */
  listLanguage: ScriptCode
}

/** Defaults per docs/screens/settings.md's settings table. The reading line is English (Roman)/IAST
 * by default (matches the mock), and the source line is Latin too (so by default only the single
 * romanized reading shows — the two lines dedupe when identical). `listLanguage` is likewise Latn. */
export const DEFAULT_SETTINGS: ISettings = {
  displayScript: 'auto',
  transliterationScript: 'Latn',
  romanStandard: 'IAST',
  showSource: true,
  showTransliteration: true,
  showWordToWord: true,
  wordToWordLanguage: 'eng',
  showTranslation: true,
  translationLanguage: 'eng',
  listLanguage: 'Latn',
}
