package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.ScriptOptions
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Guards the script-picker half of the shared resolver contract in docs/screens/settings.md **v5**
 * ("Per-platform notes": `ScriptOptions.effectiveDisplayScript` / `nativeScriptFor` / `optionLabel` /
 * `renderKey`, mirroring web's `effectiveDisplayScript` / `nativeScriptFor` / `scriptOptionLabel` /
 * `scriptRenderKey`).
 *
 * The drift this catches: the three platforms silently disagreeing about what `auto` resolves to for
 * a given `language_of_origin`, about the exact option strings a reader sees, or about when the two
 * verse lines are "the same rendering" and must collapse into one.
 */
class ScriptOptionsTest {

    @Test
    fun `auto resolves to the song's own source-language script`() {
        // The spec's mapping, verbatim: ben/asa -> Beng, san/hin -> Deva, ori -> Orya, eng -> Latn.
        assertEquals("Beng", ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, "ben"))
        assertEquals("Beng", ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, "asa"))
        assertEquals("Deva", ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, "san"))
        assertEquals("Deva", ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, "hin"))
        assertEquals("Orya", ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, "ori"))
        assertEquals("Latn", ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, "eng"))
        // Anything unmapped falls to Bengali, the majority script of the shipped corpus.
        assertEquals("Beng", ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, "tam"))
        assertEquals("Beng", ScriptOptions.nativeScriptFor(""))
    }

    @Test
    fun `a concrete display script ignores the song's origin language`() {
        // Only `auto` is song-dependent; an explicit choice is global (settings.md "States").
        assertEquals("Deva", ScriptOptions.effectiveDisplayScript("Deva", "ben"))
        assertEquals("Latn", ScriptOptions.effectiveDisplayScript("Latn", "ben"))
    }

    @Test
    fun `option labels use the exact strings shared with iOS and web`() {
        assertEquals("Default (source language)", ScriptOptions.optionLabel(ScriptOptions.AUTO))
        assertEquals("English (Roman / Latin)", ScriptOptions.optionLabel("Latn"))
        assertEquals("Bengali", ScriptOptions.optionLabel("Beng"))
        assertEquals("Devanagari", ScriptOptions.optionLabel("Deva"))
        assertEquals("Telugu", ScriptOptions.optionLabel("Telu"))
        assertEquals("Kannada", ScriptOptions.optionLabel("Knda"))
        assertEquals("Tamil", ScriptOptions.optionLabel("Taml"))
        assertEquals("Malayalam", ScriptOptions.optionLabel("Mlym"))
        assertEquals("Gujarati", ScriptOptions.optionLabel("Gujr"))
        assertEquals("Odia", ScriptOptions.optionLabel("Orya"))
        assertEquals("Cyrillic", ScriptOptions.optionLabel("Cyrl"))
        // An unlisted script degrades to its raw code rather than blanking the picker.
        assertEquals("Xxxx", ScriptOptions.optionLabel("Xxxx"))
    }

    @Test
    fun `option lists match web's order and only the display picker offers auto`() {
        val base = listOf("Beng", "Latn", "Deva", "Telu", "Knda", "Taml", "Mlym", "Gujr", "Orya", "Cyrl")
        assertEquals(base, ScriptOptions.transliterationScriptOptions)
        assertEquals(listOf(ScriptOptions.AUTO) + base, ScriptOptions.displayScriptOptions)
        assertFalse(
            "the reading line is always a concrete script, so it must not offer auto",
            ScriptOptions.AUTO in ScriptOptions.transliterationScriptOptions
        )
    }

    @Test
    fun `renderKey folds the roman standard in for Latin only, so identical lines dedupe`() {
        // Same script AND same standard -> one key -> the verse shows one line, not two.
        assertEquals(
            ScriptOptions.renderKey("Latn", "IAST"),
            ScriptOptions.renderKey("Latn", "IAST")
        )
        // Same script, different standard -> genuinely different renderings, so two lines.
        assertNotEquals(
            ScriptOptions.renderKey("Latn", "IAST"),
            ScriptOptions.renderKey("Latn", "ISO15919")
        )
        // Non-Latin scripts have no standard, so the standard must not enter their key.
        assertEquals("Beng", ScriptOptions.renderKey("Beng", "IAST"))
        assertEquals(
            ScriptOptions.renderKey("Beng", "IAST"),
            ScriptOptions.renderKey("Beng", "GVP_Roman")
        )
        assertNotEquals(ScriptOptions.renderKey("Beng", "IAST"), ScriptOptions.renderKey("Deva", "IAST"))
    }

    @Test
    fun `auto on a Bengali song dedupes against a Bengali transliteration`() {
        // The reader picking Bengali for both lines must see one line -- the case the reader hits
        // first, since `auto` is the shipped default for the source line.
        val source = ScriptOptions.effectiveDisplayScript(ScriptOptions.AUTO, "ben")
        assertTrue(
            ScriptOptions.renderKey(source, "IAST") == ScriptOptions.renderKey("Beng", "IAST")
        )
        // ...but the shipped default pairing (auto + Latin) is two distinct lines.
        assertNotEquals(
            ScriptOptions.renderKey(source, "IAST"),
            ScriptOptions.renderKey(ScriptOptions.LATIN, "IAST")
        )
    }
}
