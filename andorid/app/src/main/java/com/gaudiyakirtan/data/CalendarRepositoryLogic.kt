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
     * The month's songs resolved against the manifest and ordered for display
     * (docs/screens/today.md **v2**, "Ranking and provenance").
     *
     * **The shipped `song_uids` order is the ranking.** `calendar.json` curates each month as a
     * sequence, so it is preserved rather than re-sorted. The one permitted reordering is a stable
     * partition putting songs with recordings first, so the lead region opens with what the reader
     * can actually hear; relative order inside each run is untouched.
     *
     * A partition rather than a comparator keyed on `audioAvailable`: a sort on a boolean is not
     * guaranteed stable across runtimes, and an unstable one would reshuffle same-audio songs and
     * lose the curated sequence.
     *
     * Spec v1 sorted by `basis` strength here, and that is withdrawn. `basis` records *why* a song
     * belongs to the month, not what order to sing it in, and sorting on it split songs curated
     * together — in Śrāvaṇa it lifted a lone `panjika` song above two adjacent `book` ones, which
     * is how the divergence from web was noticed. [basisRank] is kept for any surface that wants to
     * weigh provenance, but it is deliberately not applied here.
     *
     * No display cap: capping is a UI concern (today.md v2), so the full ordered list stays
     * available to every surface.
     *
     * Uids missing from the manifest are dropped silently, exactly as `songsInGroup` does.
     */
    fun monthSongs(month: CalendarMonth, manifest: List<ManifestEntry>): List<ManifestEntry> {
        val byUid = manifest.associateBy { it.uid }
        val resolved = month.songs.mapNotNull { byUid[it.uid] }
        val (playable, rest) = resolved.partition { it.audioAvailable }
        return playable + rest
    }
}
