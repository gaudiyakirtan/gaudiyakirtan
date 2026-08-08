package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.ScriptOptions
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.Verse
import com.gaudiyakirtan.myapplication.models.scriptLinesOrNull
import com.gaudiyakirtan.myapplication.utils.StringUtils
import java.io.File
import kotlinx.serialization.decodeFromString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Guards the line-resolver half of the shared contract in docs/screens/settings.md **v5**
 * (`Verse.scriptLinesOrNull` ≙ web `resolveScriptLines` ≙ iOS `VerseTextResolver.scriptLines`, and
 * `StringUtils.resolveMasterTextFlags` ≙ web `stripMasterFlags`).
 *
 * Two rules are load-bearing and easy to regress: **a missing script must return null**, never a
 * silent IAST substitute (the surface has to be able to say "This script isn't available for this
 * verse."), and **ISO15919 is rendered from `source_text_master`** -- the one romanization the corpus
 * ships no `display_scripts` entry for -- with its `[FLAG_*]` markers resolved.
 *
 * Runs against the real bundled corpus, and specifically against `N9`, the sample verse all three
 * platforms preview on the Settings screen.
 */
class VerseScriptLinesTest {

    private val sampleSong: Song =
        SongJson.instance.decodeFromString(File(TestAssets.dir, "songs/N9.json").readText())

    /** The Settings screen's own picker: first verse with a `Beng` script + `eng` gloss + `eng` translation. */
    private val sampleVerse: Verse = sampleSong.verses.first { verse ->
        verse.displayScripts.any { it.scriptCode == "Beng" } &&
            verse.wordToWords.any { it.languageCode == "eng" } &&
            verse.translations.any { it.languageCode == "eng" }
    }

    @Test
    fun `the N9 sample verse resolves to the expected IAST reading line`() {
        val lines = sampleVerse.scriptLinesOrNull("Latn", "IAST")
        assertEquals(
            listOf(
                "akrodha paramānanda nityānanda-rāya",
                "abhimāna-śūnya nitāi nagare beḓāya 1"
            ),
            lines
        )
    }

    @Test
    fun `auto resolves the N9 source line to its Bengali rendering`() {
        // N9 is language_of_origin = ben, so the shipped `auto` default must land on Beng.
        val script = ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, sampleSong.languageOfOrigin)
        assertEquals("Beng", script)

        val lines = sampleVerse.scriptLinesOrNull(script, "IAST")
        assertNotNull(lines)
        assertEquals(sampleVerse.sourceTextMaster.size, lines!!.size)
        // Compared against the verse's own Beng entry rather than a pasted literal, which would be
        // hostage to Unicode normalization; the point is that it is the Bengali text, not a fallback.
        assertEquals(sampleVerse.displayScripts.first { it.scriptCode == "Beng" }.text, lines)
        assertNotEquals(sampleVerse.scriptLinesOrNull("Latn", "IAST"), lines)
    }

    @Test
    fun `an absent script returns null instead of falling back to IAST`() {
        // Gurmukhi is a valid ISO 15924 code the corpus never ships -- the exact "visible state, not
        // a silent fallback" case. A regression here would render IAST under a "Gurmukhi" label.
        assertNull(sampleVerse.scriptLinesOrNull("Guru", "IAST"))
        assertNull(sampleVerse.scriptLinesOrNull("Xxxx", "IAST"))
    }

    @Test
    fun `ISO15919 renders from the master text with its flags resolved`() {
        val lines = sampleVerse.scriptLinesOrNull("Latn", "ISO15919")
        assertNotNull(lines)
        assertEquals(sampleVerse.sourceTextMaster.size, lines!!.size)

        // The raw master carries the marker; the resolved line carries a literal hyphen instead.
        assertTrue(sampleVerse.sourceTextMaster.any { it.contains("[FLAG_HYPHEN_ALPHA]") })
        assertTrue(lines.none { it.contains("[FLAG_") })
        assertEquals("akrodha paramānanda nityānanda-rāya", lines.first())
    }

    @Test
    fun `a Latin standard the corpus lacks falls back within Latin, not to another script`() {
        // BBT/GVP/IAST are the same script, only different conventions, so falling back among them
        // is correct -- unlike falling back across scripts, which the null case forbids.
        val bbt = sampleVerse.scriptLinesOrNull("Latn", "BBT_Roman")
        assertNotNull(bbt)
        assertEquals("abhimāna-śūnya nitāi nagare beḍāya 1", bbt!![1])

        val unknownStandard = sampleVerse.scriptLinesOrNull("Latn", "NoSuchStandard")
        assertEquals(sampleVerse.scriptLinesOrNull("Latn", "IAST"), unknownStandard)
    }

    @Test
    fun `resolveMasterTextFlags keeps the compound hyphen and drops every other flag`() {
        assertEquals(
            "nityānanda-rāya",
            StringUtils.resolveMasterTextFlags("nityānanda[FLAG_HYPHEN_ALPHA]rāya")
        )
        assertEquals("plain text", StringUtils.resolveMasterTextFlags("plain text"))
        assertEquals("ab", StringUtils.resolveMasterTextFlags("a[FLAG_SOMETHING_ELSE]b"))
        assertEquals(
            "a-bc",
            StringUtils.resolveMasterTextFlags("a[FLAG_HYPHEN_ALPHA]b[FLAG_UNKNOWN]c")
        )
    }
}
