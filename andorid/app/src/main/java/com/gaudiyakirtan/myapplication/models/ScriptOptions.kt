package com.gaudiyakirtan.myapplication.models

/**
 * The script-picker contract shared by all three platforms (docs/screens/settings.md v5,
 * "Per-platform notes"): the option lists, the `auto` ("Default (source language)") resolution, the
 * shared option labels, and the dedupe key for the verse's two script lines.
 *
 * Deliberately a pure Kotlin `object` with **no Android imports** so it is directly unit-testable on
 * the JVM -- it is load-bearing for both the Settings preview and the song-detail reader, and the
 * spec requires the three implementations (`resolveScriptLines`/`scriptOptionLabel`/`scriptRenderKey`
 * on web, `ScriptOptions` on iOS) to agree exactly.
 */
object ScriptOptions {

    /** Sentinel for the Display-script picker meaning "each song's own source-language script". */
    const val AUTO = "auto"

    /** The Roman/Latin script code; the only one that carries a further `standard` choice. */
    const val LATIN = "Latn"

    /**
     * Scripts offered for `transliterationScript` (and for `listLanguage`), in the order the pickers
     * list them -- identical to web's `DISPLAY_SCRIPT_OPTIONS` so the three apps read the same.
     */
    val transliterationScriptOptions: List<String> = listOf(
        "Beng", LATIN, "Deva", "Telu", "Knda", "Taml", "Mlym", "Gujr", "Orya", "Cyrl"
    )

    /** Scripts offered for `displayScript`: the same list with `auto` offered first. */
    val displayScriptOptions: List<String> = listOf(AUTO) + transliterationScriptOptions

    private val SCRIPT_NAMES: Map<String, String> = mapOf(
        "Beng" to "Bengali",
        "Deva" to "Devanagari",
        "Telu" to "Telugu",
        "Knda" to "Kannada",
        "Taml" to "Tamil",
        "Mlym" to "Malayalam",
        "Gujr" to "Gujarati",
        "Guru" to "Gurmukhi",
        "Orya" to "Odia",
        "Cyrl" to "Cyrillic",
        LATIN to "Roman (IAST)"
    )

    /**
     * The script a reader would treat as a song's "native" rendering, derived from its
     * `language_of_origin` (docs/screens/settings.md `displayScript` = `auto`). Unknown languages
     * resolve to Bengali, the majority script of the shipped corpus.
     */
    fun nativeScriptFor(languageOfOrigin: String): String = when (languageOfOrigin) {
        "ben", "asa" -> "Beng" // Bengali / Assamese (both written in the Bengali-Assamese script)
        "san", "hin" -> "Deva" // Sanskrit / Hindi
        "ori" -> "Orya"
        "eng" -> LATIN
        else -> "Beng"
    }

    /** Resolves a possibly-`auto` display script against one song's origin language; other codes
     * pass through unchanged, since only `auto` is song-dependent. */
    fun effectiveDisplayScript(script: String, languageOfOrigin: String): String =
        if (script == AUTO) nativeScriptFor(languageOfOrigin) else script

    /** The script's own name, or the raw code if the corpus ever ships an unlisted script. */
    fun scriptName(scriptCode: String): String = SCRIPT_NAMES[scriptCode] ?: scriptCode

    /**
     * Picker label. `auto` reads as "Default (source language)"; Latin is a *romanization* with a
     * further standard, so it reads "English (Roman / Latin)" rather than naming one standard.
     * These exact strings are shared with iOS and web (docs/screens/settings.md v5).
     */
    fun optionLabel(scriptCode: String): String = when (scriptCode) {
        AUTO -> "Default (source language)"
        LATIN -> "English (Roman / Latin)"
        else -> scriptName(scriptCode)
    }

    /**
     * A stable key for a (script, romanStandard) pairing, so the source and reading lines can be
     * de-duplicated when they resolve to the exact same rendering (spec: "The two lines dedupe").
     * Only Latin varies by standard, so only Latin folds the standard into the key.
     */
    fun renderKey(scriptCode: String, romanStandard: String): String =
        if (scriptCode == LATIN) "$LATIN:$romanStandard" else scriptCode
}
