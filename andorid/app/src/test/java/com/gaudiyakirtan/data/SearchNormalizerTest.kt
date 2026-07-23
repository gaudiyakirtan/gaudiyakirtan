package com.gaudiyakirtan.data

import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Unit tests for [SearchNormalizer] (docs/screens/search.md tier-1 fuzzy match): diacritic
 * stripping, punctuation/whitespace cleanup, and the v/b + j/y transliteration folds that let either
 * romanization spelling match the same song.
 */
class SearchNormalizerTest {

    @Test
    fun `strips diacritics and lowercases`() {
        assertEquals("srila", SearchNormalizer.normalize("Śrīla"))
        assertEquals("radha", SearchNormalizer.normalize("Rādhā"))
    }

    @Test
    fun `folds v to b so both spellings normalize the same`() {
        assertEquals(SearchNormalizer.normalize("madhava"), SearchNormalizer.normalize("madhaba"))
        assertEquals("madhaba", SearchNormalizer.normalize("Mādhava"))
    }

    @Test
    fun `folds j to y so both spellings normalize the same`() {
        assertEquals(SearchNormalizer.normalize("jamuna"), SearchNormalizer.normalize("yamuna"))
        assertEquals("yamuna", SearchNormalizer.normalize("yamunā"))
    }

    @Test
    fun `drops punctuation and collapses whitespace`() {
        assertEquals("sri guru", SearchNormalizer.normalize("  Śrī,   Guru!! "))
    }

    @Test
    fun `tokenize splits normalized text on whitespace`() {
        val normalized = SearchNormalizer.normalize("Sri Radha Krsna")
        assertEquals(listOf("sri", "radha", "krsna"), SearchNormalizer.tokenize(normalized))
    }

    @Test
    fun `empty and blank input normalizes to empty`() {
        assertEquals("", SearchNormalizer.normalize(""))
        assertEquals("", SearchNormalizer.normalize("   "))
    }
}
