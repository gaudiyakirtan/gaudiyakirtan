// Presentation helpers shared by pages/components for picking a display string out of a
// list<ScriptText> (titles, author names, group titles all use this shape - see
// docs/data/README.md's ScriptText value object).
import { IScriptText, LanguageCode, ScriptCode } from '../models/Common'
import { IDisplayScript, IVerse, IWordToWord } from '../models/Verse'
import { ITranslation } from '../models/Translation'
import { RomanStandard } from '../models/Settings'

const DEFAULT_PREFERRED_SCRIPTS: ScriptCode[] = ['Latn']

/**
 * Picks the best display string from a list of script renderings: first script in
 * `preferred` order, falling back to the first entry, falling back to an empty string.
 * Never throws on an empty/undefined list - callers render nothing rather than "undefined".
 */
export function pickScriptText(
  entries: IScriptText[] | undefined,
  preferred: ScriptCode[] = DEFAULT_PREFERRED_SCRIPTS
): string {
  if (!entries?.length) return ''
  for (const scriptCode of preferred) {
    const match = entries.find((entry) => entry.scriptCode === scriptCode)
    if (match) return match.text
  }
  return entries[0].text
}

/** Same as pickScriptText but returns undefined instead of '' when nothing is found. */
export function pickScriptTextOrUndefined(
  entries: IScriptText[] | undefined,
  preferred: ScriptCode[] = DEFAULT_PREFERRED_SCRIPTS
): string | undefined {
  const text = pickScriptText(entries, preferred)
  return text || undefined
}

/** Picks one script rendering of a verse (docs/data/verse.md's `displayScripts`) by preference
 * order. Returns undefined rather than a stub when the verse has no rendering at all. */
export function pickDisplayScript(
  entries: IDisplayScript[] | undefined,
  preferred: ScriptCode[]
): IDisplayScript | undefined {
  if (!entries?.length) return undefined
  for (const scriptCode of preferred) {
    const match = entries.find((entry) => entry.scriptCode === scriptCode)
    if (match) return match
  }
  return entries[0]
}

/** Finds the word-to-word glossary matched by language (and script when given, per
 * docs/screens/song-detail.md). Present on ~20% of verses - callers must treat undefined as
 * "omit this section", never as an empty placeholder. */
export function pickWordToWord(
  entries: IWordToWord[] | undefined,
  languageCode: LanguageCode,
  scriptCode?: ScriptCode
): IWordToWord | undefined {
  if (!entries?.length) return undefined
  if (scriptCode) {
    const exact = entries.find(
      (entry) => entry.languageCode === languageCode && entry.scriptCode === scriptCode
    )
    if (exact) return exact
  }
  return entries.find((entry) => entry.languageCode === languageCode)
}

/** Exact-match lookup of one display script - unlike pickDisplayScript it does NOT fall back to
 * the first entry, so the caller can omit the line when the chosen script is absent. */
export function findDisplayScript(
  entries: IDisplayScript[] | undefined,
  scriptCode: ScriptCode
): IDisplayScript | undefined {
  return entries?.find((entry) => entry.scriptCode === scriptCode)
}

const MASTER_FLAG_RE = /\[FLAG_[A-Z_]+\]/g

/** Removes the inline [FLAG_*] markers from a master-text line (docs/data/README.md). */
export function stripMasterFlags(line: string): string {
  return line.replace(MASTER_FLAG_RE, '')
}

/**
 * The romanized reading lines (highlighted, always shown) for a verse in the reader's chosen
 * roman scheme. The corpus ships IAST / BBT_Roman / GVP_Roman as Latn display_scripts; ISO15919
 * is the master text itself (source_text_master, flags stripped). Falls back to IAST, then any
 * Latn - never fails (every verse ships Latn), per docs/screens/song-detail.md.
 */
export function resolveRomanLines(
  verse: IVerse,
  romanStandard: RomanStandard
): string[] | undefined {
  if (romanStandard === 'ISO15919') {
    return verse.sourceTextMaster?.length
      ? verse.sourceTextMaster.map(stripMasterFlags)
      : undefined
  }

  const latns = verse.displayScripts.filter((ds) => ds.scriptCode === 'Latn')
  const match =
    latns.find((ds) => ds.standard === romanStandard) ??
    latns.find((ds) => ds.standard === 'IAST') ??
    latns[0]
  return match?.text
}

/**
 * The lines of a verse rendered in an arbitrary script (docs/screens/settings.md: the source and
 * transliteration lines can each be *any* script). For Latin it resolves the romanized reading in
 * the chosen roman scheme; for any other script it returns that script's `display_scripts` text.
 * Returns undefined when the script is absent for the verse.
 */
export function resolveScriptLines(
  verse: IVerse,
  scriptCode: ScriptCode,
  romanStandard: RomanStandard
): string[] | undefined {
  if (scriptCode === 'Latn') return resolveRomanLines(verse, romanStandard)
  return findDisplayScript(verse.displayScripts, scriptCode)?.text
}

/** A stable key for a (script, romanStandard) pairing, so the source and transliteration lines can be
 * de-duplicated when they resolve to the exact same rendering. */
export function scriptRenderKey(scriptCode: ScriptCode, romanStandard: RomanStandard): string {
  return scriptCode === 'Latn' ? `Latn:${romanStandard}` : scriptCode
}

/** Finds the full-meaning translation for one language. Present on ~22% of verses. */
export function pickTranslation(
  entries: ITranslation[] | undefined,
  languageCode: LanguageCode
): ITranslation | undefined {
  return entries?.find((entry) => entry.languageCode === languageCode)
}
