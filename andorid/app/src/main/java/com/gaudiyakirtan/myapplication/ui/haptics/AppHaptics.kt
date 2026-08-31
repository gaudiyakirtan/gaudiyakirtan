package com.gaudiyakirtan.myapplication.ui.haptics

import android.os.Build
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.hapticfeedback.HapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback

/**
 * The app-wide haptic vocabulary (docs/theme/haptics.md).
 *
 * The rule these exist to enforce: **a haptic marks a state change the user caused.** If nothing
 * changed, or the user did not cause it, the call site should not be reaching for one of these.
 * Content arriving — a list loading, audio buffering, artwork resolving — is never the user's doing,
 * and feedback there reads as a malfunction.
 *
 * The cases are deliberately semantic rather than named after platform constants, so iOS and Android
 * call sites read the same and the two apps stay in step. The continuous seek-rail ladder is the one
 * specialised exception and lives in `ScrubHaptics`.
 */
enum class AppHapticEvent {
    /** A discrete choice was committed — an index letter, a recording in the take picker. */
    SELECTION,

    /** Something started: playback began. */
    TOGGLE_ON,

    /** Something stopped: playback paused. */
    TOGGLE_OFF,

    /** One crisp step — advancing to the next or previous recording. */
    TICK,

    /** A limit was reached or wrapped past: the ends of the index or of the recording list. */
    BOUNDARY,

    /** The action ran and produced nothing — the one genuinely informational haptic in the set. */
    WARNING
}

/**
 * Maps a semantic event onto the best constant the running platform actually honours.
 *
 * This tiering is the whole point of the function. Android's haptic constants landed in waves, and a
 * constant the platform does not know is not approximated — it is ignored, and the feedback silently
 * does not happen:
 *
 * - API 34 added the toggle/segment/gesture-threshold vocabulary, the only set genuinely tuned for
 *   notched drags and toggles.
 * - API 30 added `Confirm`, `Reject`, and `GestureEnd`.
 * - API 27 added `TextHandleMove`.
 * - `ContextClick` (API 23) is the floor: it is the oldest constant that still reads as a discrete
 *   tick rather than a heavy buzz, and it is available on every device this app supports (minSdk 24).
 *
 * Picking per tier rather than with one 34-or-nothing branch is what keeps the mid-band devices —
 * still a large share of the install base — from getting a silent app.
 */
fun appHapticType(event: AppHapticEvent, sdkInt: Int = Build.VERSION.SDK_INT): HapticFeedbackType =
    when (event) {
        AppHapticEvent.SELECTION -> when {
            sdkInt >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> HapticFeedbackType.SegmentTick
            sdkInt >= Build.VERSION_CODES.O_MR1 -> HapticFeedbackType.TextHandleMove
            else -> HapticFeedbackType.ContextClick
        }
        AppHapticEvent.TOGGLE_ON -> when {
            sdkInt >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> HapticFeedbackType.ToggleOn
            sdkInt >= Build.VERSION_CODES.R -> HapticFeedbackType.Confirm
            else -> HapticFeedbackType.ContextClick
        }
        AppHapticEvent.TOGGLE_OFF -> when {
            sdkInt >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> HapticFeedbackType.ToggleOff
            sdkInt >= Build.VERSION_CODES.R -> HapticFeedbackType.GestureEnd
            else -> HapticFeedbackType.ContextClick
        }
        AppHapticEvent.TICK -> when {
            sdkInt >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> HapticFeedbackType.SegmentTick
            sdkInt >= Build.VERSION_CODES.O_MR1 -> HapticFeedbackType.TextHandleMove
            else -> HapticFeedbackType.ContextClick
        }
        AppHapticEvent.BOUNDARY -> when {
            sdkInt >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> HapticFeedbackType.GestureThresholdActivate
            sdkInt >= Build.VERSION_CODES.R -> HapticFeedbackType.Confirm
            else -> HapticFeedbackType.ContextClick
        }
        // A warning has to be *felt* as different from a tick, so below API 30 this deliberately
        // takes the heavier LongPress rather than the ContextClick floor the others use.
        AppHapticEvent.WARNING -> when {
            sdkInt >= Build.VERSION_CODES.R -> HapticFeedbackType.Reject
            else -> HapticFeedbackType.LongPress
        }
    }

/**
 * Plays the app's haptic vocabulary.
 *
 * Nothing here consults an app-level setting: `performHapticFeedback` already honours the device's
 * touch-feedback preference, so an in-app toggle would be a second, worse switch.
 */
class AppHapticPlayer(private val haptics: HapticFeedback) {
    fun play(event: AppHapticEvent) {
        haptics.performHapticFeedback(appHapticType(event))
    }
}

@Composable
fun rememberAppHaptics(): AppHapticPlayer {
    val haptics = LocalHapticFeedback.current
    return remember(haptics) { AppHapticPlayer(haptics) }
}

/** The phase a search screen is showing. */
enum class SearchPhase {
    /** No query yet — the idle prompt. Not a result of anything the user searched for. */
    IDLE,

    /** A query with hits. */
    RESULTS,

    /** A query that ran and matched nothing. */
    EMPTY
}

/**
 * Search here is incremental — there is no submit — so the meaningful event is not "a query was
 * entered" but "the query stopped matching anything". Firing on every keystroke that yields zero
 * results would rattle; firing on the *transition into* empty tells you the search ran and found
 * nothing, which is otherwise indistinguishable from it not having run.
 */
fun searchPhase(queryIsBlank: Boolean, resultCount: Int): SearchPhase = when {
    queryIsBlank -> SearchPhase.IDLE
    resultCount == 0 -> SearchPhase.EMPTY
    else -> SearchPhase.RESULTS
}

fun searchWarns(previous: SearchPhase?, next: SearchPhase): Boolean =
    next == SearchPhase.EMPTY && previous != SearchPhase.EMPTY

/**
 * Whether stepping [delta] places from [index] runs off an end of a [count]-length list.
 *
 * The transport wraps, so without this there is nothing to distinguish "advanced to the next
 * recording" from "looped back to the first" except reading the title.
 */
fun transportWraps(index: Int, delta: Int, count: Int): Boolean {
    if (count <= 1) return false
    val next = index + delta
    return next < 0 || next >= count
}

/** What a move through the A–Z index earned. */
enum class IndexTick { NONE, SELECTION, BOUNDARY }

/**
 * Pure arithmetic for the A–Z index's feel.
 *
 * Landing on the first or last *available* section is a boundary: without it there is no way to tell
 * by feel that you have run out of list, because the index keeps reporting letters while the finger
 * travels past the end of the real content.
 */
fun alphabeticalIndexTick(
    previous: String?,
    next: String?,
    firstAvailable: String?,
    lastAvailable: String?
): IndexTick {
    if (next == null || next == previous) return IndexTick.NONE
    if (next == firstAvailable || next == lastAvailable) return IndexTick.BOUNDARY
    return IndexTick.SELECTION
}
