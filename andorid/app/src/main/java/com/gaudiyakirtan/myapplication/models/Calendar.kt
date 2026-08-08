package com.gaudiyakirtan.myapplication.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The lunar-calendar overlay (docs/data/calendar.md, spec v2), decoded from the bundled
 * `calendar.json`.
 *
 * It is an **overlay, not a catalog entity**: it holds no titles or lyrics, only `song_uids` that
 * resolve through the Manifest — exactly how [SongGroup] references songs. Field names mirror
 * web's `models/Calendar.ts` so the same concept reads the same way on every platform.
 *
 * The lunar month is an astronomical quantity; the pipeline precomputes the windows so the three
 * platforms do a date-range lookup instead of three drifting floating-point ports.
 */
@Serializable
data class GaudiyaCalendar(
    @SerialName("spec_version") val specVersion: Int = 0,
    @SerialName("generated") val generated: String = "",
    @SerialName("window_start") val windowStart: String = "",
    @SerialName("window_end") val windowEnd: String = "",
    @SerialName("windows") val windows: List<LunarWindow> = emptyList(),
    @SerialName("months") val months: List<CalendarMonth> = emptyList(),
    @SerialName("daily") val daily: List<CalendarDailySlot> = emptyList(),
    @SerialName("festivals") val festivals: List<CalendarFestival> = emptyList()
)

/**
 * One pūrṇimānta lunar month as a **half-open** span: [start] inclusive, [end] exclusive, where
 * [end] equals the next window's [start]. That guarantees a date matches exactly one window.
 */
@Serializable
data class LunarWindow(
    @SerialName("start") val start: String,
    @SerialName("end") val end: String,
    @SerialName("new_moon") val newMoon: String = "",
    @SerialName("lunar_month") val lunarMonth: String,
    @SerialName("gaudiya_month") val gaudiyaMonth: String,
    /** True for Puruṣottama, the intercalary leap month (~every 2.7 years). */
    @SerialName("adhika") val adhika: Boolean = false
)

/** Songs and observances for one lunar month. [songs] may legitimately be empty (e.g. Pauṣa). */
@Serializable
data class CalendarMonth(
    @SerialName("lunar_month") val lunarMonth: String,
    @SerialName("gaudiya_month") val gaudiyaMonth: String,
    @SerialName("observances") val observances: List<String> = emptyList(),
    @SerialName("note") val note: String? = null,
    @SerialName("songs") val songs: List<CalendarSongRef> = emptyList()
)

/**
 * A song reference plus the evidence backing its placement, so the UI can rank by evidence
 * strength rather than treating a well-attested seasonal song and a thematic guess as equal.
 */
@Serializable
data class CalendarSongRef(
    @SerialName("uid") val uid: String,
    @SerialName("basis") val basis: String = "thematic"
)

/** A time-of-day ārati slot — applies every day, independent of the lunar month. */
@Serializable
data class CalendarDailySlot(
    @SerialName("slot") val slot: String,
    @SerialName("label") val label: String = "",
    @SerialName("songs") val songs: List<CalendarSongRef> = emptyList()
)

/** A dated observance from the Śrī Caitanya-pañjikā. */
@Serializable
data class CalendarFestival(
    @SerialName("id") val id: String,
    @SerialName("name") val name: String,
    @SerialName("months") val months: List<String> = emptyList(),
    @SerialName("dates") val dates: List<String> = emptyList(),
    @SerialName("songs") val songs: List<CalendarSongRef> = emptyList()
)

/** What to sing on a given date: the window it falls in and that month's songs/observances. */
data class CalendarToday(
    val date: String,
    val window: LunarWindow,
    val month: CalendarMonth
)

/**
 * Evidence-strength ranking (docs/screens/today.md "Ranking and provenance"): strongest first,
 * `observed` → `panjika` → `book` → `thematic`.
 *
 * An `observed` song is backed by dated recordings of it actually being sung that month; a
 * `thematic` one is a subject-matter match with no dated evidence. Ranking by this is required;
 * *displaying* the basis is not.
 */
fun basisRank(basis: String): Int = when (basis) {
    "observed" -> 0
    "panjika" -> 1
    "book" -> 2
    else -> 3
}
