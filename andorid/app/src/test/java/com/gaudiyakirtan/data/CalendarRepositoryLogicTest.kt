package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.GaudiyaCalendar
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import java.io.File
import kotlinx.serialization.decodeFromString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The lunar-calendar overlay (docs/data/calendar.md) against the *real* bundled `calendar.json`.
 *
 * This is the data behind Home's lead region, and it is the one region whose answer changes by
 * itself — so the invariants that matter are the ones that would silently produce a *wrong month*
 * rather than an obvious crash.
 */
class CalendarRepositoryLogicTest {

    private val calendar: GaudiyaCalendar = SongJson.instance.decodeFromString(
        File(TestAssets.dir, "calendar.json").readText()
    )

    private val manifest: List<ManifestEntry> = SongJson.instance.decodeFromString(
        File(TestAssets.dir, "manifest.json").readText()
    )

    @Test
    fun `decodes the bundled overlay with snake_case fields`() {
        assertTrue("windows should be present", calendar.windows.isNotEmpty())
        assertTrue("months should be present", calendar.months.isNotEmpty())
        assertTrue(calendar.windows.all { it.lunarMonth.isNotBlank() && it.gaudiyaMonth.isNotBlank() })
    }

    /**
     * The half-open contract (`start <= date < end`, `end` == next `start`) is what guarantees a
     * date resolves to exactly one month. If windows ever overlapped or left a gap, the hero would
     * pick the wrong month on boundary days — a bug no crash would reveal.
     */
    @Test
    fun `windows are contiguous and half-open`() {
        val sorted = calendar.windows.sortedBy { it.start }
        sorted.zipWithNext { a, b ->
            assertEquals("window ${a.start} must end exactly where ${b.start} begins", b.start, a.end)
        }
        assertTrue("every window must be non-empty", sorted.all { it.start < it.end })
    }

    @Test
    fun `a date inside the range resolves to exactly one window`() {
        val probe = calendar.windows[calendar.windows.size / 2].start
        val matches = calendar.windows.count { probe >= it.start && probe < it.end }
        assertEquals("a date must match exactly one window", 1, matches)
        assertNotNull(CalendarRepositoryLogic.lunarWindow(calendar, probe))
    }

    /** Out of range is a real state: home hides the region rather than showing a wrong month. */
    @Test
    fun `a date outside the precomputed range resolves to null`() {
        assertNull(CalendarRepositoryLogic.lunarWindow(calendar, "1900-01-01"))
        assertNull(CalendarRepositoryLogic.songsForDate(calendar, "1900-01-01"))
    }

    @Test
    fun `songsForDate returns the month block matching the window`() {
        val window = calendar.windows[calendar.windows.size / 2]
        val today = CalendarRepositoryLogic.songsForDate(calendar, window.start)

        assertNotNull(today)
        today!!
        assertEquals(window.start, today.date)
        if (!window.adhika) {
            assertEquals(
                "a non-adhika window must resolve to its own lunar month block",
                window.lunarMonth,
                today.month.lunarMonth
            )
        }
    }

    /**
     * Ordering is the two spec rules composed: evidence strength first (today.md), then a *stable*
     * playable-first partition (home.md). Stable matters — it is what keeps basis ranking governing
     * inside each run instead of being scrambled by the partition.
     */
    @Test
    fun `month songs put playable first without breaking basis ranking`() {
        val month = calendar.months.first { m ->
            m.songs.any { it.basis != m.songs.first().basis } && m.songs.size > 3
        }
        val ordered = CalendarRepositoryLogic.monthSongs(month, manifest)

        val firstNonPlayable = ordered.indexOfFirst { !it.audioAvailable }
        if (firstNonPlayable >= 0) {
            assertTrue(
                "no playable song may appear after a non-playable one",
                ordered.drop(firstNonPlayable).none { it.audioAvailable }
            )
        }

        // Within the playable run, basis rank must be non-decreasing.
        val rankByUid = month.songs.associate { it.uid to com.gaudiyakirtan.myapplication.models.basisRank(it.basis) }
        val playableRanks = ordered.filter { it.audioAvailable }.mapNotNull { rankByUid[it.uid] }
        assertEquals(
            "basis ranking must still govern inside the playable run",
            playableRanks.sorted(),
            playableRanks
        )
    }

    /** Uids with no manifest row are dropped, exactly as `songsInGroup` does. */
    @Test
    fun `month songs resolve only against the shipped manifest`() {
        val uids = manifest.map { it.uid }.toSet()
        calendar.months.forEach { month ->
            val resolved = CalendarRepositoryLogic.monthSongs(month, manifest)
            assertTrue(
                "${month.lunarMonth} resolved a song outside the manifest",
                resolved.all { it.uid in uids }
            )
            assertTrue(
                "${month.lunarMonth} resolved more songs than it references",
                resolved.size <= month.songs.size
            )
        }
    }

    /** An empty month is legitimate (Pauṣa); it must resolve, not throw. */
    @Test
    fun `a month with no songs resolves to an empty list`() {
        val empty = calendar.months.firstOrNull { it.songs.isEmpty() }
        if (empty != null) {
            assertTrue(CalendarRepositoryLogic.monthSongs(empty, manifest).isEmpty())
        }
    }
}
