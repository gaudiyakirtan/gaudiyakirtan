package com.gaudiyakirtan.myapplication.models

import com.gaudiyakirtan.myapplication.utils.StringUtils

/**
 * UI-facing display helpers layered on top of the spec-conformant models.
 *
 * The data classes in this package (`Song`, `Verse`, `Author`, `ManifestEntry`, ...) intentionally
 * mirror the docs/data spec files literally -- multi-script `ScriptText` lists, not a single display string.
 * These extensions pick one reasonable string/flag for the existing Compose UI (which predates the
 * spec and expects flat fields like `song.title`) without adding UI-only fields to the canonical
 * models themselves.
 */

/**
 * Picks one display string out of a multi-script list: the romanized ([preferredScriptCode],
 * "Latn" by default) rendering if present, else the first available script. Never sorts/filters
 * beyond that -- callers that need a specific script should query [List] directly.
 *
 * (Titles/author names no longer carry raw `[FLAG_*]` markers -- the pipeline resolves them at the
 * source, so no display-time flag stripping is needed here.)
 */
fun List<ScriptText>.preferredText(preferredScriptCode: String = "Latn"): String {
    if (isEmpty()) return ""
    return firstOrNull { it.scriptCode == preferredScriptCode }?.text ?: first().text
}

/**
 * Same as [preferredText] but tries several scripts in order -- the Settings screen's Display-language
 * example needs "the chosen list script, else Roman, else Bengali" (docs/screens/settings.md v5,
 * mirroring web's `pickScriptText(entries, preferred)`).
 */
fun List<ScriptText>.preferredText(preferredScriptCodes: List<String>): String {
    if (isEmpty()) return ""
    for (code in preferredScriptCodes) {
        firstOrNull { it.scriptCode == code }?.let { return it.text }
    }
    return first().text
}

/** Display title for a [Song] (prefers the romanized [Song.titleMain] entry). */
val Song.title: String get() = titleMain.preferredText()

/** Display author name for a [Song] (prefers the romanized [Song.authorDisplay] entry). */
val Song.author: String get() = authorDisplay.preferredText()

/** Alias kept for existing UI call sites; mirrors [Song.audioAvailable]. */
val Song.audio: Boolean get() = audioAvailable

/** Display title for a [ManifestEntry] (the manifest's [ManifestEntry.primaryTitle] is already the
 * one script chosen for list display, per docs/data/manifest.md). */
val ManifestEntry.title: String get() = primaryTitle.text

/**
 * List title in the reader's chosen list language/script (docs/screens/settings.md `listLanguage`).
 * Picks the [ManifestEntry.titles] entry whose `scriptCode` matches, falling back to
 * [ManifestEntry.primaryTitle]. NOTE: the shipped manifest only carries `Beng` and `Latn` title
 * scripts per entry, so scripts outside those two resolve to the primary (IAST) title.
 */
fun ManifestEntry.titleForListLanguage(scriptCode: String): String =
    titles.firstOrNull { it.scriptCode == scriptCode }?.text ?: primaryTitle.text

/** Display name for an [Author] (prefers the romanized [Author.names] entry). */
val Author.name: String get() = names.preferredText()

/** Display title for a [SongGroup] (Book/Topic/Collection; prefers the romanized entry). */
val SongGroup.title: String get() = titles.preferredText()

/** Member-song count for a [SongGroup], for the count badge on its Book/Topic card. */
val SongGroup.songCount: Int get() = songUids.size

/**
 * The verse's native-script rendering, for the "original text" display block.
 *
 * Per docs/data/verse.md, [Verse.sourceTextMaster] is the internal ISO 15919 romanization *source*
 * and still carries unresolved `[FLAG_*]` markers -- the spec explicitly requires flags be resolved
 * "in every display_scripts entry and in display," i.e. the master is not meant to be shown as-is.
 * This picks the [preferredScriptCode] (Bengali by default, the majority script in the shipped
 * corpus) out of [Verse.displayScripts], falling back to the first available script, falling back
 * only to the flagged master text if a verse ships no display_scripts at all.
 */
fun Verse.nativeScriptLines(preferredScriptCode: String = "Beng"): List<String> {
    val script = displayScripts.firstOrNull { it.scriptCode == preferredScriptCode }
        ?: displayScripts.firstOrNull()
    return script?.text ?: sourceTextMaster
}

/**
 * The verse's romanized rendering, for the "transliteration" display block. Prefers
 * [preferredStandard] ("IAST" by default) among the `Latn`-script entries in
 * [Verse.displayScripts], falling back to any `Latn` entry, falling back only to the flagged
 * master text if none exist.
 */
fun Verse.romanizedLines(preferredStandard: String = "IAST"): List<String> {
    val latinScripts = displayScripts.filter { it.scriptCode == "Latn" }
    val script = latinScripts.firstOrNull { it.standard == preferredStandard } ?: latinScripts.firstOrNull()
    return script?.text ?: sourceTextMaster
}

/**
 * The verse's lines in an arbitrary chosen script, honoring the song-detail spec's fallback rule
 * (docs/screens/song-detail.md): "if the chosen script is unavailable, fall back to IAST".
 *
 * @param scriptCode the reader's chosen script (e.g. "Beng", "Deva", "Latn").
 * @param standard when [scriptCode] == "Latn", disambiguates the romanization ("IAST", "BBT_Roman",
 *   "GVP_Roman"); ignored for non-Latin scripts (which have `standard == null`).
 * Falls back to the Latn/IAST rendering, then to the raw (flagged) master text only if a verse ships
 * no display_scripts at all. In the shipped corpus every verse carries all scripts, so the fallback
 * is defensive rather than routinely exercised.
 */
fun Verse.linesForScript(scriptCode: String, standard: String? = null): List<String> {
    val exact = displayScripts.firstOrNull {
        it.scriptCode == scriptCode && (scriptCode != "Latn" || it.standard == standard)
    }
    if (exact != null) return exact.text
    val iast = displayScripts.firstOrNull { it.scriptCode == "Latn" && it.standard == "IAST" }
    return iast?.text ?: sourceTextMaster
}

/**
 * The verse's lines in an arbitrary chosen script, or **null when that script is genuinely absent**
 * (docs/screens/settings.md v5: "A missing script is a visible state, not a silent fallback" -- the
 * surface says so rather than quietly showing IAST instead). This is the Android half of the shared
 * resolver contract (web `resolveScriptLines`, iOS `VerseTextResolver.scriptLines`), and both the
 * song-detail reader and the Settings live preview go through it so the preview cannot lie.
 *
 * @param scriptCode the reader's chosen script; must already be resolved through
 *   [ScriptOptions.effectiveDisplayScript] (this function does not know the song's origin language).
 * @param romanStandard used only when [scriptCode] is `Latn`. `ISO15919` ships no `display_scripts`
 *   entry anywhere in the corpus and is rendered from [Verse.sourceTextMaster] with its `[FLAG_*]`
 *   markers resolved; the other standards fall back within Latin (requested → IAST → any Latin),
 *   since they are the same script, only a different romanization convention.
 */
fun Verse.scriptLinesOrNull(scriptCode: String, romanStandard: String): List<String>? {
    if (scriptCode != ScriptOptions.LATIN) {
        return displayScripts.firstOrNull { it.scriptCode == scriptCode }?.text
    }
    if (romanStandard == "ISO15919") {
        return sourceTextMaster.takeIf { it.isNotEmpty() }?.map(StringUtils::resolveMasterTextFlags)
    }
    val latin = displayScripts.filter { it.scriptCode == ScriptOptions.LATIN }
    val match = latin.firstOrNull { it.standard == romanStandard }
        ?: latin.firstOrNull { it.standard == "IAST" }
        ?: latin.firstOrNull()
    return match?.text
}

/** The word-to-word glossary for the given gloss language, or null if this verse has none. */
fun Verse.wordToWordFor(languageCode: String): WordToWord? =
    wordToWords.firstOrNull { it.languageCode == languageCode }

/** The full translation for the given language, or null if this verse has none. */
fun Verse.translationFor(languageCode: String): Translation? =
    translations.firstOrNull { it.languageCode == languageCode }
