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
}