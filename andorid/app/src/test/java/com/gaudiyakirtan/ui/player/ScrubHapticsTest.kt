package com.gaudiyakirtan.ui.player

import android.os.Build
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import com.gaudiyakirtan.myapplication.ui.player.ScrubDetents
import com.gaudiyakirtan.myapplication.ui.player.ScrubTick
import com.gaudiyakirtan.myapplication.ui.player.scrubGrabHapticType
import com.gaudiyakirtan.myapplication.ui.player.scrubHapticType
import com.gaudiyakirtan.myapplication.ui.player.scrubTick
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * The rail's feel is the detent ladder. These lock the arithmetic that decides *whether* a sample
 * earned a tick — the part that can silently regress into either a dead rail or a rattle — and the
 * API-level mapping that keeps the rail alive below API 34.
 *
 * The ladder is deliberately identical to iOS's `ScrubHapticLadder`; if one side is retuned and the
 * other is not, the two apps stop feeling like one product.
 */
class ScrubHapticsTest {
    @Test
    fun `staying inside a detent is silent`() {
        assertEquals(ScrubTick.NONE, scrubTick(0.501f, 0.502f))
    }

    @Test
    fun `the first sample of a gesture never reports a crossing`() {
        assertEquals(ScrubTick.NONE, scrubTick(null, 0.5f))
    }

    @Test
    fun `crossing a minor detent ticks`() {
        assertEquals(ScrubTick.MINOR, scrubTick(0.030f, 0.035f))
    }

    @Test
    fun `crossing a major detent outranks the minor it also crosses`() {
        assertEquals(ScrubTick.MAJOR, scrubTick(0.120f, 0.130f))
    }

    @Test
    fun `every major detent is also a minor detent`() {
        assertEquals(0, ScrubDetents.MINOR % ScrubDetents.MAJOR)
    }

    @Test
    fun `arriving at either end reports an edge`() {
        assertEquals(ScrubTick.EDGE, scrubTick(0.98f, 1f))
        assertEquals(ScrubTick.EDGE, scrubTick(0.02f, 0f))
    }

    @Test
    fun `the edge only fires on arrival`() {
        assertEquals(ScrubTick.NONE, scrubTick(1f, 1f))
        assertEquals(ScrubTick.NONE, scrubTick(0f, 0f))
    }

    @Test
    fun `out of range samples clamp rather than repeat the edge`() {
        assertEquals(ScrubTick.NONE, scrubTick(1.4f, 1.9f))
        assertEquals(ScrubTick.NONE, scrubTick(-0.4f, -0.9f))
    }

    @Test
    fun `non finite samples are inert`() {
        assertEquals(ScrubTick.NONE, scrubTick(0.5f, Float.NaN))
        assertEquals(ScrubTick.NONE, scrubTick(Float.POSITIVE_INFINITY, 0.5f))
    }

    @Test
    fun `detent index is bounded across the rail`() {
        assertEquals(0, ScrubDetents.index(0f, 8))
        assertEquals(7, ScrubDetents.index(1f, 8))
        assertEquals(7, ScrubDetents.index(2f, 8))
        assertEquals(0, ScrubDetents.index(-1f, 8))
        assertEquals(4, ScrubDetents.index(0.5f, 8))
    }

    @Test
    fun `a sweep across the rail ticks once per detent`() {
        var previous = 0f
        var majors = 0
        var minors = 0
        var edges = 0
        for (step in 1..2000) {
            val next = step.toFloat() / 2000
            when (scrubTick(previous, next)) {
                ScrubTick.MAJOR -> majors++
                ScrubTick.MINOR -> minors++
                ScrubTick.EDGE -> edges++
                ScrubTick.NONE -> Unit
            }
            previous = next
        }
        assertEquals(ScrubDetents.MAJOR - 1, majors)
        assertEquals(ScrubDetents.MINOR - ScrubDetents.MAJOR, minors)
        assertEquals(1, edges)
    }

    @Test
    fun `a silent tick maps to no constant`() {
        assertNull(scrubHapticType(ScrubTick.NONE, Build.VERSION_CODES.UPSIDE_DOWN_CAKE))
    }

    @Test
    fun `api 34 and up use the segment vocabulary`() {
        val sdk = Build.VERSION_CODES.UPSIDE_DOWN_CAKE
        assertEquals(HapticFeedbackType.SegmentFrequentTick, scrubHapticType(ScrubTick.MINOR, sdk))
        assertEquals(HapticFeedbackType.SegmentTick, scrubHapticType(ScrubTick.MAJOR, sdk))
        assertEquals(HapticFeedbackType.GestureThresholdActivate, scrubGrabHapticType(sdk))
    }

    @Test
    fun `below api 34 the rail still ticks with constants the platform honours`() {
        // The segment constants are ignored outright before API 34, so the rail must not depend on
        // them; this is what keeps it from going silent on most in-market devices.
        val sdk = Build.VERSION_CODES.TIRAMISU
        assertEquals(HapticFeedbackType.TextHandleMove, scrubHapticType(ScrubTick.MINOR, sdk))
        assertEquals(HapticFeedbackType.TextHandleMove, scrubHapticType(ScrubTick.MAJOR, sdk))
        assertEquals(HapticFeedbackType.ContextClick, scrubGrabHapticType(sdk))
    }
}
