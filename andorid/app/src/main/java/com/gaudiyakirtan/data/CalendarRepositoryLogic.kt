package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.CalendarMonth
import com.gaudiyakirtan.myapplication.models.CalendarToday
import com.gaudiyakirtan.myapplication.models.GaudiyaCalendar
import com.gaudiyakirtan.myapplication.models.LunarWindow
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.basisRank

/**
 * Pure, `Context`/IO-free calendar derivation — the Kotlin counterpart of web's
 * `services/calendarRepository.ts`, kept parallel so the same lookup reads the same way on both
 * platforms. [CalendarRepository] adds only the asset-reading and caching around this.
 *
 * ISO dates (`YYYY-MM-DD`) compare correctly as strings, which is why the window lookup needs no
 * date parsing at all.
 */
object CalendarRepositoryLogic {

    /**
     * The lunar window containing [isoDate], or `null` when the date falls outside the precomputed
     * range. Windows are half-open (`start <= date < end`) and contiguous, so at most one matches.
     */
    fun lunarWindow(calendar: GaudiyaCalendar, isoDate: String): LunarWindow? =
        calendar.windows.firstOrNull { isoDate >= it.start && isoDate < it.end }

    /** A month block by lunar name ("Kārtika") or Gaudiya name ("Dāmodara"). */
    fun month(calendar: GaudiyaCalendar, name: String): CalendarMonth? =
        calendar.months.firstOrNull { it.lunarMonth == name || it.gaudiyaMonth == name }

    /**
     * What to sing on [isoDate]: the window it falls in and that month's songs/observances.
     *
     * Returns `null` only when the date is outside the precomputed range — per
     * docs/screens/home.md the region then hides entirely rather than showing a wrong month.
     *
     * `month.songs` may be empty even on success (Pauṣa ships none); callers render an empty state
     * and never fabricate rows.
     */
    fun songsForDate(calendar: GaudiyaCalendar, isoDate: String): CalendarToday? {
        val window = lunarWindow(calendar, isoDate) ?: return null
        // An adhika (leap) month is Puruṣottama and carries its own block, not the block of the
        // lunar month whose name it repeats.
        val block = if (window.adhika) {
            month(calendar, "Puruṣottama") ?: month(calendar, window.lunarMonth)
        } else {
            month(calendar, window.lunarMonth)
        } ?: return null

        return CalendarToday(date = isoDate, window = window, month = block)
    }

    /**
     * The month's songs resolved against the manifest and ordered for display.
     *
     * Two orderings compose, both from the specs:
     * 1. **Evidence strength** (docs/screens/today.md): `observed` → `panjika` → `book` →
     *    `thematic`, so a song with dated recordings outranks a subject-matter guess.
     * 2. **Playable first** (docs/screens/home.md): a *stable* partition putting songs with
     *    recordings ahead of the rest, so the lead region opens with what the reader can actually
     *    hear. Stable means basis ranking still governs within each run.
     *
     * Uids missing from the manifest are dropped silently, exactly as `songsInGroup` does.
     */
    fun monthSongs(month: CalendarMonth, manifest: List<ManifestEntry>): List<ManifestEntry> {
        val byUid = manifest.associateBy { it.uid }
        val ranked = month.songs
            .sortedBy { basisRank(it.basis) }
            .mapNotNull { byUid[it.uid] }
        val (playable, rest) = ranked.partition { it.audioAvailable }
        return playable + rest
    }
}
