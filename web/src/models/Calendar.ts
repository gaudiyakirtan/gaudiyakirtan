// Conforms to docs/data/calendar.md, spec v1.
// The lunar-calendar overlay: maps a civil date to its Gaudiya lunar month, and that month
// to songs. Holds no titles - `songUids` resolve through the Manifest, exactly as SongGroup
// does (docs/data/collections.md).
import { Uid } from './Common'

/**
 * Why a song is attached to a month. Lets UI rank or filter by evidence strength rather
 * than treating a well-attested seasonal song and a thematic guess as equivalent.
 */
export type CalendarBasis = 'observed' | 'panjika' | 'book' | 'thematic'

/** A song reference plus the evidence backing its placement. */
export interface ICalendarSongRef {
  uid: Uid
  basis: CalendarBasis
}

/**
 * One pūrṇimānta lunar month as a HALF-OPEN date span: `start` inclusive, `end` exclusive,
 * where `end` is always the next window's `start`. Guarantees a date matches exactly one
 * window. Boundary days carry ±1 day uncertainty - see docs/data/calendar.md.
 */
export interface ILunarWindow {
  /** ISO date, inclusive. */
  start: string
  /** ISO date, exclusive. */
  end: string
  /** New moon falling inside this window. */
  newMoon: string
  /** Kārtika, Śrāvaṇa, … */
  lunarMonth: string
  /** Viṣṇu-name: Dāmodara, Śrīdhara, … */
  gaudiyaMonth: string
  /** True for Puruṣottama, the intercalary leap month (~every 2.7 years). */
  adhika: boolean
}

/** Songs and observances for one lunar month. `songs` may legitimately be empty. */
export interface ICalendarMonth {
  lunarMonth: string
  gaudiyaMonth: string
  /** Festivals falling in this month. */
  observances: string[]
  note?: string
  songs: ICalendarSongRef[]
}

/** A time-of-day ārati slot - applies every day, independent of the lunar month. */
export interface ICalendarDailySlot {
  slot: string
  label: string
  songs: ICalendarSongRef[]
}

/**
 * A dated observance (spec v2). Unlike ILunarWindow, which resolves a *month*, these are the
 * actual observance days from the Śrī Caitanya-pañjikā.
 */
export interface ICalendarFestival {
  id: string
  name: string
  /** Gregorian months it can fall in (lunar dates drift, so this may span two). */
  months: string[]
  /** Observance dates, ascending. Always non-empty. */
  dates: string[]
  /** May be empty — many observances have no matching song in the corpus. */
  songs: ICalendarSongRef[]
}

/** A festival paired with its next occurrence on/after a given date. */
export interface IUpcomingFestival {
  festival: ICalendarFestival
  /** ISO date of the next occurrence. */
  date: string
  /** Whole days from the reference date; 0 = today. */
  daysAway: number
}

/** The whole overlay, as bundled in calendar.json. */
export interface ICalendar {
  specVersion: number
  generated: string
  windowStart: string
  windowEnd: string
  windows: ILunarWindow[]
  months: ICalendarMonth[]
  daily: ICalendarDailySlot[]
  festivals: ICalendarFestival[]
  basisLegend: Record<string, string>
}

/** What a date resolves to: which month it falls in, and what to sing. */
export interface ICalendarToday {
  date: string
  window: ILunarWindow
  month: ICalendarMonth
  daily: ICalendarDailySlot[]
}
