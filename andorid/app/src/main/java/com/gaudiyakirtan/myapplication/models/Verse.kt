package com.gaudiyakirtan.myapplication.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The verse's master text rendered into one script, per docs/data/verse.md > DisplayScript.
 * `text` line count must match the owning [Verse.sourceTextMaster] line count (invariant enforced
 * by the pipeline, not re-validated at decode time).
 */
@Serializable
data class DisplayScript(
    @SerialName("script_code") val scriptCode: String,
    @SerialName("standard") val standard: String? = null,
    @SerialName("text") val text: List<String> = emptyList()
)

/**
 * The ordered per-word glossary for one language rendered in one script, per
 * docs/data/verse.md > WordToWord. `words` is a list of `[headword, gloss]` pairs; reading order
 * is meaningful and must never be re-sorted.
 */
@Serializable
data class WordToWord(
    @SerialName("language_code") val languageCode: String,
    @SerialName("script_code") val scriptCode: String,
    @SerialName("standard") val standard: String? = null,
    @SerialName("words") val words: List<List<String>> = emptyList()
)

/**
 * One ordered stanza of a [Song]. See docs/data/verse.md (spec v1).
 *
 * Only ~22% of verses in the shipped corpus carry [wordToWords] / [translations] -- both default
 * to an empty list so absence never crashes decode or requires null-checking at every call site.
 */
@Serializable
data class Verse(
    @SerialName("verse_number") val verseNumber: Int,
    @SerialName("source_text_master") val sourceTextMaster: List<String>,
    @SerialName("display_scripts") val displayScripts: List<DisplayScript> = emptyList(),
    @SerialName("word_to_words") val wordToWords: List<WordToWord> = emptyList(),
    @SerialName("translations") val translations: List<Translation> = emptyList()
)
