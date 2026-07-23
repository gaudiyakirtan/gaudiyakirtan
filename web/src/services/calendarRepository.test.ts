// Unit tests for the calendar overlay (docs/data/calendar.md) against the REAL bundled
// src/data/calendar.json (199 windows 2020-01-01..2036-01-01, 13 month blocks, 5 daily slots,
// 36 dated festivals).
import { describe, expect, it } from 'vitest'
import {
  getCalendar,
  getCalendarMonth,
  getDailySlots,
  getLunarWindow,
  getSongsForDate,
  getUpcomingFestivals,
} from './calendarRepository'
import { getManifest } from './manifestRepository'

describe('getLunarWindow', () => {
  it('resolves a date inside the precomputed range', () => {
    const w = getLunarWindow('2026-11-14')
    expect(w).not.toBeNull()
    expect(w!.lunarMonth).toBe('Kārtika')
    expect(w!.gaudiyaMonth).toBe('Dāmodara')
  })

  it('returns null outside the precomputed range', () => {
    expect(getLunarWindow('1999-01-01')).toBeNull()
    expect(getLunarWindow('2099-01-01')).toBeNull()
  })

  it('windows are half-open and contiguous - a date matches exactly one', () => {
    const { windows } = getCalendar()
    for (const [i, w] of windows.entries()) {
      expect(w.start < w.end).toBe(true)
      if (i + 1 < windows.length) expect(w.end).toBe(windows[i + 1].start)
    }
  })

  it('every boundary day resolves to exactly one window', () => {
    const { windows } = getCalendar()
    for (const w of windows.slice(0, 50)) {
      const matches = windows.filter((x) => w.start >= x.start && w.start < x.end)
      expect(matches).toHaveLength(1)
    }
  })
})

describe('lunar-month accuracy (validated against observed Kārtika windows)', () => {
  // The @madhudas livestream titles independently mark Kārtika's first and final days.
  it.each([
    ['2025-10-20', 'Kārtika'],
    ['2024-10-25', 'Kārtika'],
    ['2026-07-22', 'Āṣāḍha'],
  ])('%s falls in %s', (date, month) => {
    expect(getLunarWindow(date)!.lunarMonth).toBe(month)
  })

  it('flags adhika-māsa (Puruṣottama) roughly every 2.7 years', () => {
    const adhika = getCalendar().windows.filter((w) => w.adhika)
    expect(adhika.length).toBeGreaterThanOrEqual(5)
    // 2026's leap month is the one the pañjikā and the streams both record.
    expect(adhika.some((w) => w.start.startsWith('2026-05'))).toBe(true)
  })
})

describe('getCalendarMonth', () => {
  it('is addressable by either lunar or Gaudiya name', () => {
    expect(getCalendarMonth('Kārtika')!.gaudiyaMonth).toBe('Dāmodara')
    expect(getCalendarMonth('Dāmodara')!.lunarMonth).toBe('Kārtika')
  })

  it('ships 13 blocks - 12 lunar months plus Adhika', () => {
    expect(getCalendar().months).toHaveLength(13)
  })

  it('returns null for an unknown name', () => {
    expect(getCalendarMonth('Nonexistent')).toBeNull()
  })
})

describe('getSongsForDate', () => {
  it('returns the month, its songs and the daily slots', () => {
    const r = getSongsForDate('2026-11-14')
    expect(r).not.toBeNull()
    expect(r!.month.lunarMonth).toBe('Kārtika')
    expect(r!.month.songs.length).toBeGreaterThan(0)
    expect(r!.daily.length).toBeGreaterThan(0)
  })

  it('Kārtika includes Dāmodarāṣṭakam, the strongest observed seasonal signal', () => {
    const uids = getSongsForDate('2026-11-14')!.month.songs.map((s) => s.uid)
    expect(uids).toContain('K1')
    expect(
      getSongsForDate('2026-11-14')!.month.songs.find((s) => s.uid === 'K1')!.basis,
    ).toBe('observed')
  })

  it('an adhika month resolves to the Puruṣottama block, not the repeated month', () => {
    const adhika = getCalendar().windows.find((w) => w.adhika)!
    const r = getSongsForDate(adhika.start)
    expect(r!.month.gaudiyaMonth).toBe('Puruṣottama')
  })

  it('returns null outside the precomputed range', () => {
    expect(getSongsForDate('1999-01-01')).toBeNull()
  })

  it('defaults to today and either resolves or returns null - never throws', () => {
    expect(() => getSongsForDate()).not.toThrow()
  })
})

describe('getUpcomingFestivals (spec v2)', () => {
  it('returns dated festivals on/after the reference date, soonest first', () => {
    const up = getUpcomingFestivals(3, '2026-07-22')
    expect(up.length).toBeGreaterThan(0)
    for (const entry of up) expect(entry.date >= '2026-07-22').toBe(true)
    const dates = up.map((u) => u.date)
    expect([...dates].sort()).toEqual(dates)
  })

  it('computes daysAway from the reference date', () => {
    const [first] = getUpcomingFestivals(1, '2026-07-22')
    expect(first.daysAway).toBeGreaterThanOrEqual(0)
  })

  it('honours the limit', () => {
    expect(getUpcomingFestivals(2, '2026-07-22')).toHaveLength(2)
  })

  it('returns [] once the pañjikā has no future dates - callers must handle an empty list', () => {
    expect(getUpcomingFestivals(3, '2099-01-01')).toEqual([])
  })

  it('every festival is dated and its song uids resolve', () => {
    const known = new Set(getManifest().map((e) => e.uid))
    for (const f of getCalendar().festivals) {
      expect(f.dates.length).toBeGreaterThan(0)
      for (const s of f.songs) expect(known.has(s.uid)).toBe(true)
    }
  })
})

describe('docs/data/calendar.md invariants', () => {
  it('every window`s lunar_month has a matching month block', () => {
    const names = new Set(getCalendar().months.map((m) => m.lunarMonth))
    for (const w of getCalendar().windows) expect(names.has(w.lunarMonth)).toBe(true)
  })

  it('every referenced song uid resolves to a real song in the Manifest', () => {
    const known = new Set(getManifest().map((e) => e.uid))
    const refs = [
      ...getCalendar().months.flatMap((m) => m.songs),
      ...getDailySlots().flatMap((d) => d.songs),
    ]
    expect(refs.length).toBeGreaterThan(0)
    for (const ref of refs) expect(known.has(ref.uid)).toBe(true)
  })

  it('every song ref carries a known basis', () => {
    const legend = new Set(Object.keys(getCalendar().basisLegend))
    for (const m of getCalendar().months) {
      for (const s of m.songs) expect(legend.has(s.basis)).toBe(true)
    }
  })

  it('a month block may ship zero songs (Pauṣa) - callers must handle an empty state', () => {
    const pausa = getCalendarMonth('Pauṣa')
    expect(pausa).not.toBeNull()
    expect(Array.isArray(pausa!.songs)).toBe(true)
  })
})
