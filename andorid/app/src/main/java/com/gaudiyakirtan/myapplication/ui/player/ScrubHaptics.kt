package com.gaudiyakirtan.myapplication.ui.player

import android.os.Build
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.hapticfeedback.HapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import kotlin.math.min

/** The kind of haptic a scrub sample earned by crossing the seek rail's detent ladder. */
enum class ScrubTick {
    /** The sample stayed inside the detent it started in. */
    NONE,

    /** The sample crossed a minor detent — the fine notches the ruler draws short marks for. */
    MINOR,

    /** The sample crossed a major detent — the tall ruler marks at each eighth of the recording. */
    MAJOR,

    /** The sample arrived at 0:00 or the end of the recording from inside the rail. */
    EDGE
}

/**
 * The ladder the waveform rail's ticks are spaced on. These counts are shared with the ruler
 * geometry so the mark you see under your finger is the mark you feel, and they match the iOS
 * `ScrubDetents` exactly so the two platforms feel like one product.
 *
 * Every major detent is also a minor detent (`MINOR` is a whole multiple of `MAJOR`), which is what
 * lets a major crossing simply out-rank a minor one.
 */
object ScrubDetents {
    const val MINOR = 32
    const val MAJOR = 8

    /**
     * The shortest gap between two emitted ticks. A fast flick can cross a dozen detents in one
     * frame; without this the actuator gets a burst that reads as a rattle rather than notches.
     */
    const val MINIMUM_TICK_INTERVAL_NANOS = 18_000_000L

    fun index(progress: Float, count: Int): Int {
        if (count <= 0) return 0
        val clamped = progress.coerceIn(0f, 1f)
        return min((clamped * count).toInt(), count - 1)
    }
}

/**
 * Pure detent arithmetic for the seek rail, free of Compose and of `Build` so it is unit-testable.
 *
 * `previous` is `null` for the first sample of a gesture; the caller owns that "grab" feel, so the
 * first sample never also reports a crossing.
 */
fun scrubTick(previous: Float?, next: Float): ScrubTick {
    if (previous == null || !previous.isFinite() || !next.isFinite()) return ScrubTick.NONE
    val old = previous.coerceIn(0f, 1f)
    val now = next.coerceIn(0f, 1f)

    if ((now >= 1f && old < 1f) || (now <= 0f && old > 0f)) return ScrubTick.EDGE
    if (ScrubDetents.index(old, ScrubDetents.MAJOR) != ScrubDetents.index(now, ScrubDetents.MAJOR)) {
        return ScrubTick.MAJOR
    }
    if (ScrubDetents.index(old, ScrubDetents.MINOR) != ScrubDetents.index(now, ScrubDetents.MINOR)) {
        return ScrubTick.MINOR
    }
    return ScrubTick.NONE
}

/**
 * Maps a tick onto the best constant the running platform actually honours.
 *
 * Android's haptic constants landed in waves and an unknown one is ignored rather than approximated,
 * so this tiers down instead of branching once on API 34: the segment vocabulary that actually reads
 * as a notched rail is 34+, `TextHandleMove` is 27+, and `ContextClick` (23) is the floor that every
 * device this app supports can play. Without the lowest tier the rail would be silent on API 24–26.
 *
 * The tiers match `AppHaptics.appHapticType`, so the rail and the rest of the app degrade alike.
 */
fun scrubHapticType(tick: ScrubTick, sdkInt: Int = Build.VERSION.SDK_INT): HapticFeedbackType? =
    when (tick) {
        ScrubTick.NONE -> null
        ScrubTick.MINOR -> when {
            sdkInt >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> HapticFeedbackType.SegmentFrequentTick
            sdkInt >= Build.VERSION_CODES.O_MR1 -> HapticFeedbackType.TextHandleMove
            else -> HapticFeedbackType.ContextClick
        }
        ScrubTick.MAJOR -> when {
            sdkInt >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> HapticFeedbackType.SegmentTick
            sdkInt >= Build.VERSION_CODES.O_MR1 -> HapticFeedbackType.TextHandleMove
            else -> HapticFeedbackType.ContextClick
        }
        // GestureEnd is API 30, so there is no separate 34 tier to add here.
        ScrubTick.EDGE -> when {
            sdkInt >= Build.VERSION_CODES.R -> HapticFeedbackType.GestureEnd
            else -> HapticFeedbackType.ContextClick
        }
    }

/** The "grab" played when a finger first lands on the rail. */
fun scrubGrabHapticType(sdkInt: Int = Build.VERSION.SDK_INT): HapticFeedbackType =
    if (sdkInt >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        HapticFeedbackType.GestureThresholdActivate
    } else {
        HapticFeedbackType.ContextClick
    }

/** The release played when the seek commits. */
fun scrubReleaseHapticType(sdkInt: Int = Build.VERSION.SDK_INT): HapticFeedbackType = when {
    sdkInt >= Build.VERSION_CODES.R -> HapticFeedbackType.GestureEnd
    else -> HapticFeedbackType.KeyboardTap
}

/**
 * Drives the vibrator for a seek-rail scrub. The system already gates this on the device's touch-
 * feedback setting, so there is no app-level switch to consult here.
 */
class ScrubHapticEngine(
    private val haptics: HapticFeedback,
    private val nanoTime: () -> Long = System::nanoTime
) {
    private var previousProgress: Float? = null
    private var lastTickAt = 0L

    /** Feeds one sample of an in-flight scrub and plays whatever it earned. */
    fun scrub(progress: Float) {
        if (!progress.isFinite()) return
        val clamped = progress.coerceIn(0f, 1f)

        if (previousProgress == null) {
            haptics.performHapticFeedback(scrubGrabHapticType())
            previousProgress = clamped
            lastTickAt = nanoTime()
            return
        }

        val tick = scrubTick(previousProgress, clamped)
        previousProgress = clamped
        val type = scrubHapticType(tick) ?: return

        val now = nanoTime()
        if (now - lastTickAt < ScrubDetents.MINIMUM_TICK_INTERVAL_NANOS) return
        lastTickAt = now
        haptics.performHapticFeedback(type)
    }

    /** Ends the gesture with the release feel and clears the ladder for the next scrub. */
    fun end() {
        if (previousProgress != null) {
            haptics.performHapticFeedback(scrubReleaseHapticType())
        }
        previousProgress = null
    }
}

@Composable
fun rememberScrubHapticEngine(): ScrubHapticEngine {
    val haptics = LocalHapticFeedback.current
    return remember(haptics) { ScrubHapticEngine(haptics) }
}
