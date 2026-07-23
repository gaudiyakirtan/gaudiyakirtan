package com.gaudiyakirtan.myapplication.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A piece of text rendered in one script, per docs/data/song.md > ScriptText.
 *
 * `standard` is only meaningful when [scriptCode] == "Latn" (ISO15919 / IAST / and, in the real
 * shipped corpus, the pipeline's own "BBT_Roman" / "GVP_Roman" romanization variants). The spec's
 * script-code list (Beng, Deva, Telu, Knda, Taml, Mlym, Gujr, Guru, Orya, Latn) is not exhaustive in
 * practice either -- the canonical corpus also emits "Cyrl" (Cyrillic). Both [scriptCode] and
 * [standard] are therefore modeled as open strings rather than closed Kotlin enums, so decoding
 * never breaks on a script/standard the spec hasn't enumerated yet.
 */
@Serializable
data class ScriptText(
    @SerialName("script_code") val scriptCode: String,
    @SerialName("standard") val standard: String? = null,
    @SerialName("text") val text: String
)

/**
 * A recording of a song, per docs/data/song.md v2 > AudioTrack (matches the shipped corpus exactly,
 * verified against all 703 songs post-resync from the authoritative S3 bucket listing): `{ uid,
 * filename, artist? }`. [filename] resolves to a playable URL via `AudioConfig.AUDIO_BASE_URL +
 * filename` (see docs/screens/player.md). [artist] is the performing artist/singer for this take
 * (e.g. "Tamal Krsna das"), shown in the now-playing credit; absent only for a handful of takes
 * whose artist code has no known display-name mapping.
 */
@Serializable
data class AudioTrack(
    @SerialName("uid") val uid: String,
    @SerialName("filename") val filename: String,
    @SerialName("artist") val artist: String? = null
)

/**
 * A single annotation/glossary line shipped alongside a song.
 *
 * docs/data/song.md declares `notes` as `list<string>`, but the shipped pipeline output emits a
 * list of `{ language_code, text }` objects (e.g. andorid/app/src/main/assets/songs/MS24.json).
 * Modeled here to match the REAL corpus so decoding doesn't crash; see slice-1 report ambiguities.
 */
@Serializable
data class Note(
    @SerialName("language_code") val languageCode: String? = null,
    @SerialName("text") val text: String
)

/**
 * The aggregate root of the data model -- one complete kirtan/bhajan.
 * See docs/data/song.md (spec v1). Field names mirror the literal canonical-JSON keys via
 * [SerialName]; Kotlin property names are idiomatic camelCase.
 */
@Serializable
data class Song(
    @SerialName("uid") val uid: String,
    @SerialName("language_of_origin") val languageOfOrigin: String,
    @SerialName("title_main") val titleMain: List<ScriptText>,
    @SerialName("author_uid") val authorUid: String,
    @SerialName("author_display") val authorDisplay: List<ScriptText>,
    @SerialName("topics") val topics: List<String> = emptyList(),
    @SerialName("tags") val tags: List<String> = emptyList(),
    @SerialName("verses") val verses: List<Verse>,
    @SerialName("notes") val notes: List<Note> = emptyList(),
    @SerialName("audio_available") val audioAvailable: Boolean,
    @SerialName("audio_files") val audioFiles: List<AudioTrack> = emptyList()
)
