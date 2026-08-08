package com.gaudiyakirtan.data

import android.content.Context
import com.gaudiyakirtan.myapplication.models.CalendarToday
import com.gaudiyakirtan.myapplication.models.GaudiyaCalendar
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import java.time.LocalDate
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

/**
 * Reads the bundled lunar-calendar overlay (`assets/calendar.json`, docs/data/calendar.md).
 *
 * Same shape as [SongRepository]: a process singleton that reads the asset once, caches it in
 * memory, and delegates every derivation to the pure [CalendarRepositoryLogic] so the interesting
 * behavior is unit-testable without a `Context`.
 */
class CalendarRepository private constructor(context: Context) {

    private val appContext = context.applicationContext
    private val json = SongJson.instance

    private val calendarMutex = Mutex()
    private var calendarCache: GaudiyaCalendar? = null

    /** The whole decoded overlay. Cached after the first read. */
    suspend fun getCalendar(): GaudiyaCalendar = withContext(Dispatchers.IO) {
        calendarCache?.let { return@withContext it }
        calendarMutex.withLock {
            calendarCache?.let { return@withLock it }
            val text = appContext.assets.open(CALENDAR_ASSET_PATH)
                .bufferedReader(Charsets.UTF_8)
                .use { it.readText() }
            json.decodeFromString<GaudiyaCalendar>(text).also { calendarCache = it }
        }
    }

    /**
     * What to sing on [date] — defaults to today **in the device's local timezone**.
     *
     * The local-timezone part is a spec requirement, not an incidental choice: docs/screens/home.md
     * notes that resolving the date in UTC shifts the lunar month for readers west of Greenwich in
     * the evening.
     *
     * Returns `null` outside the precomputed window range, which the home hero treats as "hide the
     * region" rather than showing a wrong month.
     */
    suspend fun getToday(date: LocalDate = LocalDate.now()): CalendarToday? =
        CalendarRepositoryLogic.songsForDate(getCalendar(), date.toString())

    /** The current month's songs, ranked by evidence and with playable songs first. */
    suspend fun getMonthSongs(
        manifest: List<ManifestEntry>,
        date: LocalDate = LocalDate.now()
    ): List<ManifestEntry> {
        val today = getToday(date) ?: return emptyList()
        return CalendarRepositoryLogic.monthSongs(today.month, manifest)
    }

    companion object {
        private const val CALENDAR_ASSET_PATH = "calendar.json"

        @Volatile private var instance: CalendarRepository? = null

        fun getInstance(context: Context): CalendarRepository =
            instance ?: synchronized(this) {
                instance ?: CalendarRepository(context).also { instance = it }
            }
    }
}
