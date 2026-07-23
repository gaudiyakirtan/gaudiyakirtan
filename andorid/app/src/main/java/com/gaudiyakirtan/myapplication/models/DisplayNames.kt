package com.gaudiyakirtan.myapplication.models

/**
 * Human-readable labels and selectable option lists for the settings/display codes used across the
 * Settings screen and the song-detail quick-toggles. Single source of truth so the two surfaces
 * always show the same names.
 *
 * The option lists are grounded in the real shipped corpus (pipeline output): every verse
 * carries all 10 scripts below; word-to-word exists in eng/hin/ben/guj; translations exist in eng
 * only. When the corpus gains more gloss/translation languages, extend [languageOptions] +
 * [wordToWordLanguageCodes] / [translationLanguageCodes].
 */
object DisplayNames {

    data class Option(val code: String, val label: String)

    /** Display scripts present in the corpus, in the order the pickers list them. "Latn" == Roman. */
    val scriptOptions: List<Option> = listOf(
        Option("Beng", "Bengali"),
        Option("Deva", "Devanagari"),
        Option("Latn", "Roman"),
        Option("Telu", "Telugu"),
        Option("Knda", "Kannada"),
        Option("Taml", "Tamil"),
        Option("Mlym", "Malayalam"),
        Option("Gujr", "Gujarati"),
        Option("Orya", "Odia"),
        Option("Cyrl", "Cyrillic")
    )

    /** Native (non-Roman) scripts -- used by the song-detail "Aa" quick-picker's primary-script list. */
    val nativeScriptOptions: List<Option> = scriptOptions.filter { it.code != "Latn" }

    /** Roman transliteration schemes (relevant when displayScript == Latn). */
    val romanStandardOptions: List<Option> = listOf(
        Option("IAST", "IAST"),
        Option("ISO15919", "ISO 15919"),
        Option("BBT_Roman", "BBT Roman"),
        Option("GVP_Roman", "GVP Roman")
    )

    val languageOptions: List<Option> = listOf(
        Option("eng", "English"),
        Option("hin", "Hindi"),
        Option("ben", "Bengali"),
        Option("guj", "Gujarati"),
        Option("san", "Sanskrit")
    )

    /** Word-to-word gloss languages that exist anywhere in the corpus. */
    val wordToWordLanguageCodes: List<String> = listOf("eng", "hin", "ben", "guj")

    /** Full-translation languages that exist anywhere in the corpus. */
    val translationLanguageCodes: List<String> = listOf("eng")

    val wordToWordLanguageOptions: List<Option>
        get() = languageOptions.filter { it.code in wordToWordLanguageCodes }

    val translationLanguageOptions: List<Option>
        get() = languageOptions.filter { it.code in translationLanguageCodes }

    fun scriptLabel(code: String): String = scriptOptions.firstOrNull { it.code == code }?.label ?: code
    fun romanStandardLabel(code: String): String = romanStandardOptions.firstOrNull { it.code == code }?.label ?: code
    fun languageLabel(code: String): String = languageOptions.firstOrNull { it.code == code }?.label ?: code
}
