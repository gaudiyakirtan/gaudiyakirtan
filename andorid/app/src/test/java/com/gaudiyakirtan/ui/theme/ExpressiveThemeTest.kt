package com.gaudiyakirtan.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.myapplication.ui.theme.neutral
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * Theme conformance for docs/screens/theme.md **v2** (Material 3 Expressive).
 *
 * These run on the JVM under Robolectric because no emulator is available in this environment (and
 * usually not in CI either). Before them the entire expressive migration had zero executable
 * coverage: the Switch regression below compiled cleanly and passed every existing test.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExpressiveThemeTest {

    @get:Rule
    val composeRule = createComposeRule()

    /** Renders inside the app theme and hands back whatever [read] reads out. */
    private fun <T : Any> readFromTheme(darkTheme: Boolean, read: @Composable () -> T): T {
        var captured: T? = null
        composeRule.setContent {
            GaudiyaKirtanTheme(darkTheme = darkTheme) { captured = read() }
        }
        composeRule.waitForIdle()
        return requireNotNull(captured) { "theme content never composed" }
    }

    // docs/theme/colors.md -- the authoritative palette values.
    private val gauraAccent = Color(0xFFB36B00)
    private val gauraBackground = Color(0xFFFFF4E8)
    private val gauraBackgroundOffset = Color(0xFFF6E5D1)
    private val gauraOnHighlight = Color(0xFFFFFFFF)
    private val gauraNeutral = Color(0xFF6E6E6E)
    private val gauraBorder = Color(0xFFE6D7C3)
    private val shyamAccent = Color(0xFF8CB4FF)

    /** The M3 *baseline* container color. If this ever shows up, a slot was left unmapped. */
    private val materialBaselineSurfaceContainerHighest = Color(0xFFE6E0E9)

    @Test
    fun `accent occupies the Material primary slot so components are correct by default`() {
        val scheme = readFromTheme(darkTheme = false) { MaterialTheme.colorScheme }

        assertEquals("primary must be the accent, not the text color", gauraAccent, scheme.primary)
        assertEquals(gauraOnHighlight, scheme.onPrimary)
    }

    @Test
    fun `Shyam maps the same roles to its own palette`() {
        val scheme = readFromTheme(darkTheme = true) { MaterialTheme.colorScheme }

        assertEquals(shyamAccent, scheme.primary)
        assertEquals(Color(0xFF1A1A1A), scheme.onPrimary)
        assertEquals(Color(0xFF191919), scheme.background)
    }

    /**
     * Regression test for the bug that shipped in 77aabdc and was fixed in 79f9853.
     *
     * Removing the per-component `colors()` overrides assumed the remaining Material defaults were
     * correct -- but they are only correct for slots the theme actually fills. An unchecked Switch
     * track reads `surfaceContainerHighest`; with that slot unset it fell back to the M3 baseline
     * palette and painted #E6E0E9 (a lilac gray) onto the Gaura cream. CLAUDE.md forbids stock
     * Material palettes, so this is a conformance failure, not a matter of taste.
     */
    @Test
    fun `the container ramp is filled from the palette, never the Material baseline`() {
        val scheme = readFromTheme(darkTheme = false) { MaterialTheme.colorScheme }

        assertNotEquals(
            "surfaceContainerHighest fell back to the M3 baseline -- an unchecked Switch would render lilac",
            materialBaselineSurfaceContainerHighest,
            scheme.surfaceContainerHighest
        )

        val palette = setOf(gauraBackground, gauraBackgroundOffset)
        listOf(
            "surfaceContainerLowest" to scheme.surfaceContainerLowest,
            "surfaceContainerLow" to scheme.surfaceContainerLow,
            "surfaceContainer" to scheme.surfaceContainer,
            "surfaceContainerHigh" to scheme.surfaceContainerHigh,
            "surfaceContainerHighest" to scheme.surfaceContainerHighest,
            "surfaceDim" to scheme.surfaceDim,
            "surfaceBright" to scheme.surfaceBright
        ).forEach { (name, value) ->
            assertTrue("$name = $value is not a Gaura palette value", value in palette)
        }
    }

    /**
     * `outline` is Material's higher-contrast boundary role and is what an unchecked Switch thumb
     * renders in. Mapping it to `border` (#E6D7C3) left the thumb effectively invisible on a
     * #F6E5D1 track, so it takes `neutral`; `outlineVariant` keeps `border` for subtle dividers.
     */
    @Test
    fun `outline carries neutral and outlineVariant carries border`() {
        val scheme = readFromTheme(darkTheme = false) { MaterialTheme.colorScheme }

        assertEquals(gauraNeutral, scheme.outline)
        assertEquals(gauraBorder, scheme.outlineVariant)
        assertNotEquals(
            "an unchecked switch thumb must not match its own track",
            scheme.outline,
            scheme.surfaceContainerHighest
        )
    }

    // `neutral` has no Material slot and rides a CompositionLocal; it must follow the palette.
    // Split per palette because ComposeTestRule.setContent may only be called once per test.

    @Test
    fun `the neutral extension follows the Gaura palette`() {
        assertEquals(gauraNeutral, readFromTheme(darkTheme = false) { MaterialTheme.colorScheme.neutral })
    }

    @Test
    fun `the neutral extension follows the Shyam palette`() {
        assertEquals(Color(0xFF9B9B9B), readFromTheme(darkTheme = true) { MaterialTheme.colorScheme.neutral })
    }

    /**
     * The expressive shape scale must be a monotonic ladder -- that is what lets a selected or
     * active container "step up" a level without inventing a radius.
     */
    @Test
    fun `the shape scale is monotonically increasing`() {
        val shapes: Shapes = readFromTheme(darkTheme = false) { MaterialTheme.shapes }
        val density = Density(1f)
        val size = androidx.compose.ui.geometry.Size(1000f, 1000f)

        val ladder = listOf(
            "extraSmall" to shapes.extraSmall,
            "small" to shapes.small,
            "medium" to shapes.medium,
            "large" to shapes.large,
            "largeIncreased" to shapes.largeIncreased,
            "extraLarge" to shapes.extraLarge,
            "extraLargeIncreased" to shapes.extraLargeIncreased
        ).map { (name, shape) -> name to shape.topStart.toPx(size, density) }

        ladder.zipWithNext { (lowerName, lower), (upperName, upper) ->
            assertTrue("$upperName ($upper) must exceed $lowerName ($lower)", upper > lower)
        }
        assertEquals("extraSmall should be the documented 4.dp", 4f, ladder.first().second, 0.01f)
    }
}
