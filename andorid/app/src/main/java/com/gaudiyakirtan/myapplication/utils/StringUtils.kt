package com.gaudiyakirtan.myapplication.utils

import java.text.Normalizer

/**
 * Utility class for string operations
 */
object StringUtils {
    
    /**
     * Removes diacritical marks from a string
     * For example, "Śrīla" becomes "Srila"
     */
    fun removeDiacritics(text: String): String {
        val normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
        return normalized.replace("\\p{M}".toRegex(), "")
    }
    
    /**
     * Returns the first letter of a string after removing diacritical marks
     * Useful for alphabetical sorting and indexing
     */
    fun firstNormalizedLetter(text: String): String {
        if (text.isEmpty()) return ""
        val firstChar = text.first()
        val normalized = removeDiacritics(firstChar.toString())
        return normalized.uppercase()
    }
    
    /**
     * Gets the section letter for alphabetical grouping
     * For text starting with a non-letter character, returns "#"
     */
    fun sectionLetter(text: String): String {
        val normalizedFirstLetter = firstNormalizedLetter(text)
        if (normalizedFirstLetter.isEmpty() || !normalizedFirstLetter.first().isLetter()) {
            return "#"
        }
        return normalizedFirstLetter
    }

    /**
     * Alphabetical sort key for a title: diacritics stripped, lowercased, and with leading
     * non-letter characters dropped so it aligns with the manifest's `first_letter` (which is the
     * first *letter*, skipping leading punctuation/quotes). Sorting by this key keeps every
     * `first_letter` section contiguous and stable regardless of the display list-language.
     */
    fun sortKey(text: String): String =
        removeDiacritics(text).lowercase().dropWhile { !it.isLetter() }

    /** Matches any residual `[FLAG_*]` marker, for the defensive strip in [resolveMasterTextFlags]. */
    private val MASTER_FLAG_REGEX = Regex("""\[FLAG_[A-Z_]+]""")

    /**
     * Resolves inline master-text flags (docs/data/README.md "Master-text flags") for safe display.
     * The pipeline only flag-resolves the text it generates into `Verse.displayScripts`, so anything
     * rendered straight from `source_text_master` -- notably the `ISO15919` reading, which has no
     * `display_scripts` entry anywhere in the corpus (docs/screens/settings.md v5) -- must be run
     * through this first.
     *
     * Only `[FLAG_HYPHEN_ALPHA]` (an alphabet-only hyphen joining a compound, not a spoken pause)
     * actually occurs in the current corpus, so it resolves to a literal hyphen; any other `[FLAG_*]`
     * token is stripped as a defensive fallback. Mirrors iOS `StringUtils.resolveMasterTextFlags`
     * and web `stripMasterFlags`.
     */
    fun resolveMasterTextFlags(line: String): String {
        val resolved = line.replace("[FLAG_HYPHEN_ALPHA]", "-")
        return if (resolved.contains("[FLAG_")) resolved.replace(MASTER_FLAG_REGEX, "") else resolved
    }
}