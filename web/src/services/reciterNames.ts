// Reciter (performer) name renderings by artist code, so a performer's name can follow the reader's
// listLanguage the way song titles and authors do. Reciters carry no script variants in the corpus
// (audio_files[].artist is one romanized string); the multi-script table is emitted separately by
// pipeline/build_reciter_scripts.py (docs/screens/tracks.md, docs/screens/search.md v8).
import RAW from '../data/reciter_names.json'
import { IScriptText, ScriptCode } from '../models/Common'
import { pickScriptText } from './textDisplay'

interface IRawRow {
  script_code: string
  text: string
}

// Emitted in the corpus's snake_case (`script_code`); mapped once to the app's IScriptText shape.
const TABLE: Record<string, IScriptText[]> = Object.fromEntries(
  Object.entries(RAW as Record<string, IRawRow[]>).map(([code, rows]) => [
    code,
    rows.map((r) => ({ scriptCode: r.script_code as ScriptCode, text: r.text })),
  ])
)

/** The artist code is the part of a recording's uid before the take number (`tama-1` -> `tama`). */
export function reciterCode(trackUid: string): string {
  return trackUid.includes('-') ? trackUid.split('-')[0] : trackUid
}

/** All script renderings for a reciter code, or undefined if the code is unknown. */
export function reciterNames(code: string): IScriptText[] | undefined {
  return TABLE[code]
}

/** A reciter's name in the reader's listLanguage, or `fallback` (the romanized string) if unknown. */
export function pickReciterName(trackUid: string, listLanguage: ScriptCode, fallback: string): string {
  const rows = TABLE[reciterCode(trackUid)]
  return (rows && pickScriptText(rows, [listLanguage, 'Latn', 'Beng'])) || fallback
}
