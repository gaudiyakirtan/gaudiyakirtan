// Script metadata for the Song-detail reading screen: human-readable names for the ISO 15924
// script codes the corpus ships (docs/data/README.md), and the mapping from a song's
// language_of_origin (ISO 639-3) to the script a reader would consider its "native" rendering.
//
// In the shipped corpus every verse carries all ten scripts, and Latn is always present, so the
// script switcher can offer a uniform list and the Latn/IAST reading is always available as the
// documented fallback (docs/screens/song-detail.md).
import { LanguageCode, ScriptCode } from '../models/Common'
import { ISong } from '../models/Song'

/** Display label for a script code, shown in the script switcher. */
export const SCRIPT_NAMES: Record<string, string> = {
  Latn: 'Roman (IAST)',
  Beng: 'Bengali',
  Deva: 'Devanagari',
  Telu: 'Telugu',
  Knda: 'Kannada',
  Taml: 'Tamil',
  Mlym: 'Malayalam',
  Gujr: 'Gujarati',
  Guru: 'Gurmukhi',
  Orya: 'Odia',
  Cyrl: 'Cyrillic',
}

/** The canonical reading script - always rendered as the highlighted line and used as fallback. */
export const READING_SCRIPT: ScriptCode = 'Latn'

/**
 * The script a reader would treat as a song's "native" rendering, derived from its
 * language_of_origin. Used as the default chosen (muted, reference) script above the Latn reading.
 */
export function nativeScriptFor(languageOfOrigin: LanguageCode): ScriptCode {
  switch (languageOfOrigin) {
    case 'ben': // Bengali
    case 'asa': // Assamese (rendered in the Bengali/Assamese script)
      return 'Beng'
    case 'san': // Sanskrit
    case 'hin': // Hindi
      return 'Deva'
    case 'ori': // Odia
      return 'Orya'
    case 'eng':
      return 'Latn'
    default:
      return 'Beng'
  }
}

export function scriptName(scriptCode: ScriptCode): string {
  return SCRIPT_NAMES[scriptCode] ?? scriptCode
}

/** Sentinel for the Display-script picker meaning "use each song's own source-language script"
 * (resolved per song via `nativeScriptFor(language_of_origin)`), not a fixed script. */
export const AUTO_SCRIPT: ScriptCode = 'auto'

/** Resolve a possibly-`auto` display script to a concrete script for a given song's origin
 * language. Non-auto values pass through unchanged. */
export function effectiveDisplayScript(script: ScriptCode, languageOfOrigin: LanguageCode): ScriptCode {
  return script === AUTO_SCRIPT ? nativeScriptFor(languageOfOrigin) : script
}

/** Option label for a script picker. `auto` reads as "Default (source language)"; Latin is a
 * romanization (with a further standard), so "English (Roman / Latin)" rather than "Roman (IAST)". */
export function scriptOptionLabel(scriptCode: ScriptCode): string {
  if (scriptCode === AUTO_SCRIPT) return 'Default (source language)'
  return scriptCode === 'Latn' ? 'English (Roman / Latin)' : scriptName(scriptCode)
}

/**
 * The distinct scripts a song can be displayed in, taken from the union of its verses'
 * display_scripts. Ordered native-first, then Roman, then the remaining scripts by their
 * SCRIPT_NAMES order - this is the option list for the script switcher.
 */
export function availableScriptsForSong(song: ISong): ScriptCode[] {
  const present = new Set<ScriptCode>()
  for (const verse of song.verses) {
    for (const ds of verse.displayScripts) present.add(ds.scriptCode)
  }

  const native = nativeScriptFor(song.languageOfOrigin)
  const rest = Object.keys(SCRIPT_NAMES).filter(
    (code) => present.has(code) && code !== native && code !== READING_SCRIPT
  )

  // Roman/IAST (the default reading script) first, then the song's native script, then the rest.
  const ordered: ScriptCode[] = []
  if (present.has(READING_SCRIPT)) ordered.push(READING_SCRIPT)
  if (present.has(native) && native !== READING_SCRIPT) ordered.push(native)
  ordered.push(...rest)
  return ordered
}
