package com.gaudiyakirtan.ui.home

import com.gaudiyakirtan.data.CalendarRepositoryLogic
import com.gaudiyakirtan.data.SongJson
import com.gaudiyakirtan.data.SongRepositoryLogic
import com.gaudiyakirtan.data.TestAssets
import com.gaudiyakirtan.myapplication.models.*
import java.io.File

/** Frozen dates, real bundled data: captures do not change with the build machine's clock. */
object HomeFixtures {
    val manifest: List<ManifestEntry> = read("manifest.json")
    val calendar: GaudiyaCalendar = read("calendar.json")
    val groups: List<SongGroup> = read("song_groups.json")
    val featured: Song = read("songs/N9.json")
    val authors = SongRepositoryLogic.buildAuthors(manifest) { uid -> read<Song>("songs/$uid.json") }
    val authorNames = authors.associate { it.uid to it.name }
    val topics = groups.filter { it.kind == SongGroupKind.TOPIC }
    val books = groups.filter { it.kind == SongGroupKind.BOOK }
    val populated: CalendarToday = calendar.windows.first { it.lunarMonth == "Śrāvaṇa" && !it.adhika }
        .let { CalendarRepositoryLogic.songsForDate(calendar, it.start)!! }
    val intercalary: CalendarToday = calendar.windows.first { it.adhika }
        .let { CalendarRepositoryLogic.songsForDate(calendar, it.start)!! }
    val empty: CalendarToday = calendar.windows.first { window ->
        calendar.months.any { it.lunarMonth == window.lunarMonth && it.songs.isEmpty() } && !window.adhika
    }.let { CalendarRepositoryLogic.songsForDate(calendar, it.start)!! }
    val largest: CalendarToday = calendar.months.maxBy { it.songs.size }.let { month ->
        calendar.windows.first { it.lunarMonth == month.lunarMonth && !it.adhika }
    }.let { CalendarRepositoryLogic.songsForDate(calendar, it.start)!! }

    fun monthSongs(today: CalendarToday) = CalendarRepositoryLogic.monthSongs(today.month, manifest)

    private inline fun <reified T> read(path: String): T =
        SongJson.instance.decodeFromString(File(TestAssets.dir, path).readText())
}
