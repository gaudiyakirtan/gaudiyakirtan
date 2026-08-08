package com.gaudiyakirtan.services

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit tests for [TakeQueue][resolveTakeEndAction] -- the pure take-queue logic behind the v14
 * player's shuffle/repeat and previous/next (docs/screens/player.md v14, "Keep this decision in a
 * **pure, unit-tested function** with no `AVPlayer`/`MediaPlayer` in sight").
 *
 * The drift these guard against is the precedence table quietly changing shape: repeat-one must keep
 * winning over shuffle and over the rest of the order; `all` must wrap where `off` must stop; and an
 * order armed for a *different* song (a uid that isn't in it) must fall silent rather than jump to
 * an arbitrary take. Shuffle is asserted to be both **deterministic under a seed** -- otherwise none
 * of this is testable at all -- and a true **permutation**, so switching shuffle on can never lose or
 * duplicate a recording.
 */
class TakeQueueTest {

    private val order = listOf("a", "b", "c")

    // --- resolveTakeEndAction: the precedence table --------------------------------------------

    @Test
    fun `repeat one replays regardless of position in the order`() {
        for (uid in order) {
            assertEquals(
                TakeEndAction.Replay,
                resolveTakeEndAction(RepeatMode.ONE, shuffle = false, order = order, currentTrackUid = uid)
            )
        }
    }

    @Test
    fun `repeat one wins over shuffle and over repeat all's wrap`() {
        assertEquals(
            TakeEndAction.Replay,
            resolveTakeEndAction(RepeatMode.ONE, shuffle = true, order = order, currentTrackUid = "a")
        )
        // Even at the very end of the order, where `all` would wrap and `off` would stop.
        assertEquals(
            TakeEndAction.Replay,
            resolveTakeEndAction(RepeatMode.ONE, shuffle = true, order = order, currentTrackUid = "c")
        )
    }

    @Test
    fun `repeat one replays even when the uid is not in the order`() {
        // An explicit "play this again" needs no queue at all -- it is about the loaded take.
        assertEquals(
            TakeEndAction.Replay,
            resolveTakeEndAction(RepeatMode.ONE, shuffle = false, order = order, currentTrackUid = "zz")
        )
    }

    @Test
    fun `mid-order takes advance to the next uid under every repeat mode`() {
        assertEquals(
            TakeEndAction.PlayTake("c"),
            resolveTakeEndAction(RepeatMode.OFF, shuffle = false, order = order, currentTrackUid = "b")
        )
        assertEquals(
            TakeEndAction.PlayTake("c"),
            resolveTakeEndAction(RepeatMode.ALL, shuffle = false, order = order, currentTrackUid = "b")
        )
    }

    @Test
    fun `repeat all wraps past the last take`() {
        assertEquals(
            TakeEndAction.PlayTake("a"),
            resolveTakeEndAction(RepeatMode.ALL, shuffle = false, order = order, currentTrackUid = "c")
        )
    }

    @Test
    fun `repeat off stops after the last take`() {
        assertEquals(
            TakeEndAction.Stop,
            resolveTakeEndAction(RepeatMode.OFF, shuffle = false, order = order, currentTrackUid = "c")
        )
    }

    @Test
    fun `an unknown uid stops instead of guessing a take`() {
        assertEquals(
            TakeEndAction.Stop,
            resolveTakeEndAction(RepeatMode.OFF, shuffle = false, order = order, currentTrackUid = "zz")
        )
        assertEquals(
            TakeEndAction.Stop,
            resolveTakeEndAction(RepeatMode.ALL, shuffle = false, order = order, currentTrackUid = "zz")
        )
    }

    @Test
    fun `an empty order stops`() {
        assertEquals(
            TakeEndAction.Stop,
            resolveTakeEndAction(RepeatMode.ALL, shuffle = false, order = emptyList(), currentTrackUid = "a")
        )
    }

    @Test
    fun `a single-take song under repeat all replays rather than reloading itself`() {
        // Wrapping onto the same uid is a rewind, not a fresh load -- the ViewModel would otherwise
        // tear down and re-buffer the very take that is already open.
        assertEquals(
            TakeEndAction.Replay,
            resolveTakeEndAction(RepeatMode.ALL, shuffle = false, order = listOf("a"), currentTrackUid = "a")
        )
        assertEquals(
            TakeEndAction.Stop,
            resolveTakeEndAction(RepeatMode.OFF, shuffle = false, order = listOf("a"), currentTrackUid = "a")
        )
    }

    @Test
    fun `shuffle does not change the arithmetic because the order is already shuffled`() {
        // The permutation lives in `order`; the flag exists to document that at the call site.
        for (mode in RepeatMode.entries) {
            assertEquals(
                resolveTakeEndAction(mode, shuffle = false, order = order, currentTrackUid = "b"),
                resolveTakeEndAction(mode, shuffle = true, order = order, currentTrackUid = "b")
            )
        }
    }

    // --- playOrder ------------------------------------------------------------------------------

    @Test
    fun `playOrder with shuffle off is the listed order`() {
        assertEquals(order, playOrder(order, shuffle = false, seed = 42L))
        // The seed is irrelevant when shuffle is off.
        assertEquals(order, playOrder(order, shuffle = false, seed = 7L))
    }

    @Test
    fun `playOrder is deterministic for a given seed`() {
        val uids = listOf("bvsm-1", "bvsm-2", "casu-1", "gaur-1", "gaur-2", "krsn-1", "tama-1")
        val first = playOrder(uids, shuffle = true, seed = 1234L)
        repeat(5) {
            assertEquals(first, playOrder(uids, shuffle = true, seed = 1234L))
        }
    }

    @Test
    fun `playOrder is a permutation of the input, never losing or duplicating a take`() {
        val uids = listOf("bvsm-1", "bvsm-2", "casu-1", "gaur-1", "gaur-2", "krsn-1", "tama-1")
        for (seed in 0L until 25L) {
            val shuffled = playOrder(uids, shuffle = true, seed = seed)
            assertEquals("size must be preserved (seed=$seed)", uids.size, shuffled.size)
            assertEquals("must be a permutation (seed=$seed)", uids.sorted(), shuffled.sorted())
        }
    }

    @Test
    fun `different seeds eventually give different orders`() {
        // Not a strict guarantee for any single pair, but across a range of seeds a shuffle that
        // silently degenerated into the identity would be caught here.
        val uids = (1..8).map { "t$it" }
        val orders = (0L until 20L).map { playOrder(uids, shuffle = true, seed = it) }.toSet()
        assertTrue("seeded shuffle produced only ${orders.size} distinct orders", orders.size > 1)
        assertTrue("seeded shuffle never departed from listed order", orders.any { it != uids })
    }

    @Test
    fun `playOrder on empty or single-element input is a no-op`() {
        assertEquals(emptyList<String>(), playOrder(emptyList(), shuffle = true, seed = 3L))
        assertEquals(listOf("a"), playOrder(listOf("a"), shuffle = true, seed = 3L))
    }

    // --- neighbor -------------------------------------------------------------------------------

    @Test
    fun `neighbor steps forward and back in the middle of the order`() {
        assertEquals("c", neighbor(order, "b", delta = 1, wrap = false))
        assertEquals("a", neighbor(order, "b", delta = -1, wrap = false))
    }

    @Test
    fun `neighbor returns null at either end without wrap`() {
        assertNull(neighbor(order, "c", delta = 1, wrap = false))
        assertNull(neighbor(order, "a", delta = -1, wrap = false))
    }

    @Test
    fun `neighbor wraps at both ends when asked`() {
        assertEquals("a", neighbor(order, "c", delta = 1, wrap = true))
        assertEquals("c", neighbor(order, "a", delta = -1, wrap = true))
    }

    @Test
    fun `neighbor returns null for an unknown uid or an empty order`() {
        assertNull(neighbor(order, "zz", delta = 1, wrap = true))
        assertNull(neighbor(emptyList(), "a", delta = 1, wrap = true))
        assertNull(neighbor(emptyList(), "a", delta = -1, wrap = false))
    }

    @Test
    fun `neighbor on a single-take order wraps onto itself, or gives up`() {
        assertEquals("a", neighbor(listOf("a"), "a", delta = 1, wrap = true))
        assertEquals("a", neighbor(listOf("a"), "a", delta = -1, wrap = true))
        assertNull(neighbor(listOf("a"), "a", delta = 1, wrap = false))
    }
}
