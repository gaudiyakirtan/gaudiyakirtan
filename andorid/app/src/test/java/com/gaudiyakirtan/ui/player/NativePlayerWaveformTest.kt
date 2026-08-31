package com.gaudiyakirtan.ui.player

import com.gaudiyakirtan.myapplication.ui.player.nativePlayerWaveformHeights
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class NativePlayerWaveformTest {
    @Test
    fun `profile is stable for the same recording`() {
        assertEquals(
            nativePlayerWaveformHeights("brsm-1", 64),
            nativePlayerWaveformHeights("brsm-1", 64)
        )
    }

    @Test
    fun `profile changes with recording uid`() {
        assertNotEquals(
            nativePlayerWaveformHeights("brsm-1", 64),
            nativePlayerWaveformHeights("bvnm-1", 64)
        )
    }

    @Test
    fun `profile count and values are bounded`() {
        val heights = nativePlayerWaveformHeights("brsm-1", 19)

        assertEquals(19, heights.size)
        assertTrue(heights.all { it in 0.24f..1f })
        assertEquals(emptyList<Float>(), nativePlayerWaveformHeights("brsm-1", 0))
    }
}
