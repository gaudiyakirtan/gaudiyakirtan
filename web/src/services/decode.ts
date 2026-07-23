// Decode boundary: canonical on-disk JSON (snake_case, exactly what pipeline emits per
// docs/data/README.md) -> camelCase TS models (docs/data/*.md). This is the ONLY place that
// should know about snake_case field names - everything above this layer uses the camelCase
// interfaces in src/models/.
//
// One field in the shipped corpus still deviates from the documented shape (see docs/data/song.md
// spec v2's change log): `notes[]` ships as [{ language_code, text }] instead of the documented
// list<string>. We flatten each entry's `text` into a plain string here rather than editing docs/
// or crashing the build. `audio_files[]` ({ uid, filename, artist? }) now matches spec v2 exactly
// - no mapping needed.

import { IScriptText, TransliterationStandard } from '../models/Common'
import { IAudioTrack, ISong } from '../models/Song'
import { IDisplayScript, IVerse, IWordToWord } from '../models/Verse'
import { ITranslation, TranslationSource } from '../models/Translation'
import { IManifestEntry } from '../models/Manifest'
import { ISongGroup, SongGroupKind } from '../models/Collections'
import { CalendarBasis, ICalendar, ICalendarSongRef } from '../models/Calendar'

/* eslint-disable @typescript-eslint/no-explicit-any */
type RawRecord = Record<string, any>

/**
 * Next.js's getStaticProps requires JSON-serializable props: a literal `undefined` value on an
 * object key throws at build time (unlike `JSON.stringify`, which just drops it), so every
 * "absent = omit the key" optional field built with `?? undefined` below must be stripped
 * before a decoded Song/ManifestEntry crosses the getStaticProps boundary. `null` is left
 * untouched - it's a real, spec-meaningful value (e.g. DisplayScript.standard).
 */
function deepStripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => deepStripUndefined(entry)) as unknown as T
  }
  if (value !== null && typeof value === 'object') {
    const result: RawRecord = {}
    for (const [key, v] of Object.entries(value as RawRecord)) {
      if (v === undefined) continue
      result[key] = deepStripUndefined(v)
    }
    return result as T
  }
  return value
}

function decodeScriptText(raw: RawRecord): IScriptText {
  return {
    scriptCode: raw.script_code,
    standard: raw.standard ?? undefined,
    text: raw.text,
  }
}

function decodeScriptTextList(raw: RawRecord[] | undefined | null): IScriptText[] {
  return (raw ?? []).map(decodeScriptText)
}

function decodeDisplayScript(raw: RawRecord): IDisplayScript {
  return {
    scriptCode: raw.script_code,
    standard: (raw.standard ?? null) as TransliterationStandard | null,
    text: raw.text ?? [],
  }
}

function decodeWordToWord(raw: RawRecord): IWordToWord {
  return {
    languageCode: raw.language_code,
    scriptCode: raw.script_code,
    standard: (raw.standard ?? null) as TransliterationStandard | null,
    words: (raw.words ?? []).map((pair: [string, string]) => [pair[0], pair[1]]),
  }
}

function decodeTranslation(raw: RawRecord): ITranslation {
  return {
    languageCode: raw.language_code,
    text: raw.text ?? [],
    source: (raw.source as TranslationSource | undefined) ?? undefined,
  }
}

function decodeVerse(raw: RawRecord): IVerse {
  return {
    verseNumber: raw.verse_number,
    sourceTextMaster: raw.source_text_master ?? [],
    displayScripts: (raw.display_scripts ?? []).map(decodeDisplayScript),
    wordToWords: raw.word_to_words?.length ? raw.word_to_words.map(decodeWordToWord) : undefined,
    translations: raw.translations?.length ? raw.translations.map(decodeTranslation) : undefined,
  }
}

/** Flattens the corpus's `{ language_code, text }` note entries into plain display strings. */
function decodeNotes(raw: RawRecord[] | undefined | null): string[] | undefined {
  if (!raw?.length) return undefined
  return raw.map((n) => (typeof n === 'string' ? n : n.text)).filter(Boolean)
}

/** Decodes one AudioTrack: `{ uid, filename, artist? }` per docs/data/song.md spec v2. */
function decodeAudioTrack(raw: RawRecord): IAudioTrack {
  return {
    uid: raw.uid,
    filename: raw.filename,
    artist: raw.artist ?? undefined,
  }
}

export function decodeSong(raw: RawRecord): ISong {
  return deepStripUndefined<ISong>({
    uid: raw.uid,
    languageOfOrigin: raw.language_of_origin,
    titleMain: decodeScriptTextList(raw.title_main),
    authorUid: raw.author_uid,
    authorDisplay: decodeScriptTextList(raw.author_display),
    topics: raw.topics?.length ? raw.topics : undefined,
    tags: raw.tags?.length ? raw.tags : undefined,
    verses: (raw.verses ?? []).map(decodeVerse),
    notes: decodeNotes(raw.notes),
    audioAvailable: Boolean(raw.audio_available),
    audioFiles: raw.audio_files?.length ? raw.audio_files.map(decodeAudioTrack) : undefined,
  })
}

export function decodeManifestEntry(raw: RawRecord): IManifestEntry {
  return deepStripUndefined<IManifestEntry>({
    uid: raw.uid,
    primaryTitle: decodeScriptText(raw.primary_title),
    titles: raw.titles?.length ? decodeScriptTextList(raw.titles) : undefined,
    authorUid: raw.author_uid,
    languageOfOrigin: raw.language_of_origin,
    audioAvailable: Boolean(raw.audio_available),
    firstLetter: raw.first_letter ?? undefined,
    md5: raw.md5,
  })
}

/** Decodes one SongGroup (Book/Topic/Collection, docs/data/collections.md spec v1) from the
 * canonical `song_groups.json` shape (`{ uid, kind, titles, song_uids, ordered, color? }`). */
export function decodeSongGroup(raw: RawRecord): ISongGroup {
  return deepStripUndefined<ISongGroup>({
    uid: raw.uid,
    kind: raw.kind as SongGroupKind,
    titles: decodeScriptTextList(raw.titles),
    songUids: raw.song_uids ?? [],
    ordered: Boolean(raw.ordered),
    color: raw.color ?? undefined,
  })
}

function decodeCalendarSongRef(raw: RawRecord): ICalendarSongRef {
  return { uid: raw.uid, basis: raw.basis as CalendarBasis }
}

/** Decodes the whole calendar overlay (docs/data/calendar.md spec v1) from `calendar.json`.
 * Unlike the other decoders this takes the entire document, not one record: `windows` and
 * `months` are only meaningful together (a window's `lunar_month` is the join key into
 * `months`). */
export function decodeCalendar(raw: RawRecord): ICalendar {
  return deepStripUndefined<ICalendar>({
    specVersion: raw.spec_version,
    generated: raw.generated,
    windowStart: raw.window_start,
    windowEnd: raw.window_end,
    windows: (raw.windows ?? []).map((w: RawRecord) => ({
      start: w.start,
      end: w.end,
      newMoon: w.new_moon,
      lunarMonth: w.lunar_month,
      gaudiyaMonth: w.gaudiya_month,
      adhika: Boolean(w.adhika),
    })),
    months: (raw.months ?? []).map((m: RawRecord) => ({
      lunarMonth: m.lunar_month,
      gaudiyaMonth: m.gaudiya_month,
      observances: m.observances ?? [],
      note: m.note ?? undefined,
      songs: (m.songs ?? []).map(decodeCalendarSongRef),
    })),
    daily: (raw.daily ?? []).map((d: RawRecord) => ({
      slot: d.slot,
      label: d.label,
      songs: (d.songs ?? []).map(decodeCalendarSongRef),
    })),
    festivals: (raw.festivals ?? []).map((f: RawRecord) => ({
      id: f.id,
      name: f.name,
      months: f.months ?? [],
      dates: f.dates ?? [],
      songs: (f.songs ?? []).map(decodeCalendarSongRef),
    })),
    basisLegend: raw.basis_legend ?? {},
  })
}
