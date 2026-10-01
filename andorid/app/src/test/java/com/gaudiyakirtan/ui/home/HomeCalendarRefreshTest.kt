package com.gaudiyakirtan.ui.home

import com.gaudiyakirtan.data.CalendarRepositoryLogic
import com.gaudiyakirtan.myapplication.ui.home.millisUntilNextLocalDay
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import org.junit.Assert.*
import org.junit.Test

class HomeCalendarRefreshTest {
    @Test fun `local midnight scheduling respects daylight savings`() {
        val zone = ZoneId.of("America/Los_Angeles")
        assertEquals(23 * 60 * 60 * 1000L, millisUntilNextLocalDay(ZonedDateTime.of(2026, 3, 8, 0, 0, 0, 0, zone)))
        assertEquals(25 * 60 * 60 * 1000L, millisUntilNextLocalDay(ZonedDateTime.of(2026, 11, 1, 0, 0, 0, 0, zone)))
        assertEquals(1L, millisUntilNextLocalDay(ZonedDateTime.of(2026, 10, 1, 23, 59, 59, 999_000_000, zone)))
    }

    @Test fun `timezone change can resolve a different half open month at the same instant`() {
        val calendar = HomeFixtures.calendar
        val boundary = calendar.windows.first { it.lunarMonth == "Kārtika" }.start
        val instant = Instant.parse("${boundary}T01:00:00Z")
        val east = instant.atZone(ZoneId.of("Asia/Kolkata")).toLocalDate()
        val west = instant.atZone(ZoneId.of("America/Los_Angeles")).toLocalDate()
        assertNotEquals(east, west)
        assertNotEquals(CalendarRepositoryLogic.songsForDate(calendar, east.toString())!!.window,
            CalendarRepositoryLogic.songsForDate(calendar, west.toString())!!.window)
    }
}
