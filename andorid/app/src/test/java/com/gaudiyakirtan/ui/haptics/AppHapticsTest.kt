package com.gaudiyakirtan.ui.haptics

import android.os.Build
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import com.gaudiyakirtan.myapplication.ui.haptics.AppHapticEvent
import com.gaudiyakirtan.myapplication.ui.haptics.IndexTick
import com.gaudiyakirtan.myapplication.ui.haptics.SearchPhase
import com.gaudiyakirtan.myapplication.ui.haptics.alphabeticalIndexTick
import com.gaudiyakirtan.myapplication.ui.haptics.appHapticType
import com.gaudiyakirtan.myapplication.ui.haptics.searchPhase
import com.gaudiyakirtan.myapplication.ui.haptics.searchWarns
import com.gaudiyakirtan.myapplication.ui.haptics.transportWraps
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The app-wide vocabulary's decision logic (docs/theme/haptics.md), and the API tiering that decides
 * whether the feedback happens at all.
 *
 * The tiering matters more than it looks: an unknown haptic constant is not approximated by the
 * platform, it is ignored. A regression here does not throw or log — the app just silently stops
 * having haptics on a whole band of devices.
 */
class AppHapticsTest {

    // ---- API tiering -------------------------------------------------------

    @Test
    fun `api 34 and up use the toggle and segment vocabulary`() {
        val sdk = Build.VERSION_CODES.UPSIDE_DOWN_CAKE
        assertEquals(HapticFeedbackType.SegmentTick, appHapticType(AppHapticEvent.SELECTION, sdk))
        assertEquals(HapticFeedbackType.ToggleOn, appHapticType(AppHapticEvent.TOGGLE_ON, sdk))
        assertEquals(HapticFeedbackType.ToggleOff, appHapticType(AppHapticEvent.TOGGLE_OFF, sdk))
        assertEquals(HapticFeedbackType.SegmentTick, appHapticType(AppHapticEvent.TICK, sdk))
        assertEquals(
            HapticFeedbackType.GestureThresholdActivate,
            appHapticType(AppHapticEvent.BOUNDARY, sdk)
        )
        assertEquals(HapticFeedbackType.Reject, appHapticType(AppHapticEvent.WARNING, sdk))
    }

    @Test
    fun `api 30 to 33 fall back to the confirm and reject vocabulary`() {
        val sdk = Build.VERSION_CODES.R
        assertEquals(HapticFeedbackType.TextHandleMove, appHapticType(AppHapticEvent.SELECTION, sdk))
        assertEquals(HapticFeedbackType.Confirm, appHapticType(AppHapticEvent.TOGGLE_ON, sdk))
        assertEquals(HapticFeedbackType.GestureEnd, appHapticType(AppHapticEvent.TOGGLE_OFF, sdk))
        assertEquals(HapticFeedbackType.Confirm, appHapticType(AppHapticEvent.BOUNDARY, sdk))
        assertEquals(HapticFeedbackType.Reject, appHapticType(AppHapticEvent.WARNING, sdk))
    }

    @Test
    fun `the minSdk floor still plays something for every event`() {
        // minSdk is 24. ContextClick (23) is the oldest constant that still reads as a discrete tick,
        // so nothing in the vocabulary may resolve to a constant this band cannot play.
        val sdk = Build.VERSION_CODES.N
        assertEquals(HapticFeedbackType.ContextClick, appHapticType(AppHapticEvent.SELECTION, sdk))
        assertEquals(HapticFeedbackType.ContextClick, appHapticType(AppHapticEvent.TOGGLE_ON, sdk))
        assertEquals(HapticFeedbackType.ContextClick, appHapticType(AppHapticEvent.TOGGLE_OFF, sdk))
        assertEquals(HapticFeedbackType.ContextClick, appHapticType(AppHapticEvent.TICK, sdk))
        assertEquals(HapticFeedbackType.ContextClick, appHapticType(AppHapticEvent.BOUNDARY, sdk))
        // A warning has to feel different from a tick, so it takes the heavier LongPress here.
        assertEquals(HapticFeedbackType.LongPress, appHapticType(AppHapticEvent.WARNING, sdk))
    }

    @Test
    fun `every event resolves on every supported api level`() {
        // A cheap guard against a future tier being added with a gap in it.
        for (sdk in Build.VERSION_CODES.N..Build.VERSION_CODES.UPSIDE_DOWN_CAKE + 1) {
            for (event in AppHapticEvent.entries) {
                appHapticType(event, sdk)
            }
        }
    }

    // ---- A–Z index ---------------------------------------------------------

    @Test
    fun `moving to a new letter is a selection`() {
        assertEquals(IndexTick.SELECTION, alphabeticalIndexTick("C", "D", "A", "Z"))
    }

    @Test
    fun `staying on the same letter is silent`() {
        assertEquals(IndexTick.NONE, alphabeticalIndexTick("D", "D", "A", "Z"))
    }

    @Test
    fun `reaching either end of the available letters is a boundary`() {
        assertEquals(IndexTick.BOUNDARY, alphabeticalIndexTick("B", "A", "A", "Z"))
        assertEquals(IndexTick.BOUNDARY, alphabeticalIndexTick("Y", "Z", "A", "Z"))
    }

    @Test
    fun `the boundary tracks available letters not the alphabet`() {
        // The index names every letter, but only some have songs. Feeling "the end" at Z when the
        // last real section is M would be a lie — the ends that matter are the available ones.
        assertEquals(IndexTick.BOUNDARY, alphabeticalIndexTick("L", "M", "C", "M"))
        assertEquals(IndexTick.SELECTION, alphabeticalIndexTick("C", "D", "C", "M"))
    }

    @Test
    fun `no destination is silent`() {
        assertEquals(IndexTick.NONE, alphabeticalIndexTick("C", null, "A", "Z"))
    }

    // ---- Transport ---------------------------------------------------------

    @Test
    fun `stepping within the recording list does not wrap`() {
        assertFalse(transportWraps(1, 1, 4))
        assertFalse(transportWraps(1, -1, 4))
    }

    @Test
    fun `stepping off either end wraps`() {
        assertTrue(transportWraps(3, 1, 4))
        assertTrue(transportWraps(0, -1, 4))
    }

    @Test
    fun `a single recording never wraps`() {
        // The transport is dormant for a single take, so it must not claim a boundary.
        assertFalse(transportWraps(0, 1, 1))
        assertFalse(transportWraps(0, -1, 0))
    }

    // ---- Search ------------------------------------------------------------

    @Test
    fun `a blank query is idle not empty`() {
        // Idle is not a result of anything the user searched for, so it must not read as "no matches".
        assertEquals(SearchPhase.IDLE, searchPhase(true, 0))
    }

    @Test
    fun `a query with hits is results and without is empty`() {
        assertEquals(SearchPhase.RESULTS, searchPhase(false, 3))
        assertEquals(SearchPhase.EMPTY, searchPhase(false, 0))
    }

    @Test
    fun `the warning fires on the transition into empty`() {
        assertTrue(searchWarns(SearchPhase.RESULTS, SearchPhase.EMPTY))
        assertTrue(searchWarns(SearchPhase.IDLE, SearchPhase.EMPTY))
    }

    @Test
    fun `the warning does not repeat while the query stays empty`() {
        // Typing further characters that also match nothing must stay silent, or every keystroke
        // past the first rattles.
        assertFalse(searchWarns(SearchPhase.EMPTY, SearchPhase.EMPTY))
    }

    @Test
    fun `finding results is silent`() {
        assertFalse(searchWarns(SearchPhase.EMPTY, SearchPhase.RESULTS))
        assertFalse(searchWarns(SearchPhase.IDLE, SearchPhase.RESULTS))
        assertFalse(searchWarns(SearchPhase.EMPTY, SearchPhase.IDLE))
    }
}
