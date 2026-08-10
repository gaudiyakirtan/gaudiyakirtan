import Foundation

// The lunar-calendar overlay (docs/data/calendar.md, spec v2), decoded from the bundled
// `calendar.json`.
//
// It is an **overlay, not a catalog entity**: it holds no titles or lyrics, only `song_uid`s that
// resolve through the Manifest — exactly the referencing style `SongGroup` uses. Field names mirror
// web's `models/Calendar.ts` and Android's `models/Calendar.kt`, so the same concept reads the same
// way on all three platforms.
//
// The lunar month is an astronomical quantity; `pipeline/build_calendar.py` precomputes the windows
// so each platform does a plain date-range lookup instead of three floating-point ports that drift
// apart at month boundaries.

/// The whole overlay, as bundled in `calendar.json`.
///
/// ## Why `GaudiyaCalendar` and not `Calendar`
/// `Calendar` is a Foundation type. A project type of that name would shadow `Foundation.Calendar`
/// module-wide — including in this feature's own date arithmetic, which needs the real one to read
/// today's y/m/d in the device timezone. Android renamed its root type for exactly the same reason
/// (`GaudiyaCalendar` in `models/Calendar.kt`), so the rename also keeps the two platforms parallel.
struct GaudiyaCalendar: Decodable {
    let specVersion: Int
    let generated: String
    /// Coverage bounds of `windows`.
    let windowStart: String
    let windowEnd: String
    /// Contiguous half-open month spans.
    let windows: [LunarWindow]
    /// 12 lunar months + one `Adhika` block.
    let months: [CalendarMonth]
    /// Time-of-day ārati slots — constant, independent of the lunar month.
    let daily: [CalendarDailySlot]
    /// Dated observances from the pañjikā (spec v2).
    let festivals: [CalendarFestival]

    /// The safe fallback for a missing or corrupt `calendar.json`: an overlay with no windows, so
    /// every lookup returns `nil` and the home region hides itself. Never a fabricated month.
    static let empty = GaudiyaCalendar()

    init(
        specVersion: Int = 0,
        generated: String = "",
        windowStart: String = "",
        windowEnd: String = "",
        windows: [LunarWindow] = [],
        months: [CalendarMonth] = [],
        daily: [CalendarDailySlot] = [],
        festivals: [CalendarFestival] = []
    ) {
        self.specVersion = specVersion
        self.generated = generated
        self.windowStart = windowStart
        self.windowEnd = windowEnd
        self.windows = windows
        self.months = months
        self.daily = daily
        self.festivals = festivals
    }

    enum CodingKeys: String, CodingKey {
        case specVersion = "spec_version"
        case generated
        case windowStart = "window_start"
        case windowEnd = "window_end"
        case windows
        case months
        case daily
        case festivals
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        specVersion = try c.decodeIfPresent(Int.self, forKey: .specVersion) ?? 0
        generated = try c.decodeIfPresent(String.self, forKey: .generated) ?? ""
        windowStart = try c.decodeIfPresent(String.self, forKey: .windowStart) ?? ""
        windowEnd = try c.decodeIfPresent(String.self, forKey: .windowEnd) ?? ""
        windows = try c.decodeIfPresent([LunarWindow].self, forKey: .windows) ?? []
        months = try c.decodeIfPresent([CalendarMonth].self, forKey: .months) ?? []
        daily = try c.decodeIfPresent([CalendarDailySlot].self, forKey: .daily) ?? []
        festivals = try c.decodeIfPresent([CalendarFestival].self, forKey: .festivals) ?? []
    }
}

/// One pūrṇimānta lunar month as a **half-open** span: `start` inclusive, `end` exclusive, where
/// `end` always equals the next window's `start`. That is what guarantees a date matches exactly one
/// window — so the lookup uses `..<` semantics (`start <= date < end`), never `...`.
///
/// Boundary days carry ±1 day uncertainty (docs/data/calendar.md "Accuracy limits"), which is why
/// nothing in the UI may render a countdown or a "day N of the month".
struct LunarWindow: Decodable, Equatable {
    /// ISO date, inclusive.
    let start: String
    /// ISO date, **exclusive**.
    let end: String
    /// New moon falling inside this window.
    let newMoon: String
    /// Kārtika, Śrāvaṇa, …
    let lunarMonth: String
    /// Viṣṇu-name: Dāmodara, Śrīdhara, … For an intercalary window this reads
    /// `"Puruṣottama (adhika)"` rather than the repeated ordinary name.
    let gaudiyaMonth: String
    /// True for Puruṣottama, the intercalary leap month (~every 2.7 years).
    let adhika: Bool

    enum CodingKeys: String, CodingKey {
        case start
        case end
        case newMoon = "new_moon"
        case lunarMonth = "lunar_month"
        case gaudiyaMonth = "gaudiya_month"
        case adhika
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        start = try c.decode(String.self, forKey: .start)
        end = try c.decode(String.self, forKey: .end)
        newMoon = try c.decodeIfPresent(String.self, forKey: .newMoon) ?? ""
        lunarMonth = try c.decode(String.self, forKey: .lunarMonth)
        gaudiyaMonth = try c.decode(String.self, forKey: .gaudiyaMonth)
        adhika = try c.decodeIfPresent(Bool.self, forKey: .adhika) ?? false
    }
}

/// Songs and observances for one lunar month.
///
/// `songs` **may legitimately be empty** — Pauṣa ships no festival songs in this corpus. Callers
/// render an empty state; they never fabricate rows.
struct CalendarMonth: Decodable {
    /// Join key for `LunarWindow.lunarMonth`. The intercalary block's value is `"Adhika"`.
    let lunarMonth: String
    /// Viṣṇu-name of the month. The intercalary block's value is `"Puruṣottama"`.
    let gaudiyaMonth: String
    /// Festivals falling somewhere in this month — not on any particular day.
    let observances: [String]
    /// Editorial note.
    let note: String?
    let songs: [CalendarSongRef]

    enum CodingKeys: String, CodingKey {
        case lunarMonth = "lunar_month"
        case gaudiyaMonth = "gaudiya_month"
        case observances
        case note
        case songs
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        lunarMonth = try c.decode(String.self, forKey: .lunarMonth)
        gaudiyaMonth = try c.decode(String.self, forKey: .gaudiyaMonth)
        observances = try c.decodeIfPresent([String].self, forKey: .observances) ?? []
        note = try c.decodeIfPresent(String.self, forKey: .note)
        songs = try c.decodeIfPresent([CalendarSongRef].self, forKey: .songs) ?? []
    }
}

/// A song reference plus the evidence backing its placement.
///
/// `basis` is kept as a `String` rather than an enum on purpose: a future pipeline value must
/// degrade to "unknown provenance", never fail the whole overlay's decode.
struct CalendarSongRef: Decodable {
    let uid: String
    /// `observed` · `panjika` · `book` · `thematic` — see `calendarBasisRank`.
    let basis: String

    enum CodingKeys: String, CodingKey {
        case uid
        case basis
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        uid = try c.decode(String.self, forKey: .uid)
        basis = try c.decodeIfPresent(String.self, forKey: .basis) ?? "thematic"
    }
}

/// A time-of-day ārati slot — applies every day, independent of the lunar month.
///
/// Decoded and kept in the data layer for a future surface; docs/screens/home.md §1 explicitly
/// keeps it **off** the home hero.
struct CalendarDailySlot: Decodable {
    let slot: String
    let label: String
    let songs: [CalendarSongRef]

    enum CodingKeys: String, CodingKey {
        case slot
        case label
        case songs
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        slot = try c.decode(String.self, forKey: .slot)
        label = try c.decodeIfPresent(String.self, forKey: .label) ?? ""
        songs = try c.decodeIfPresent([CalendarSongRef].self, forKey: .songs) ?? []
    }
}

/// A dated observance from the Śrī Caitanya-pañjikā (calendar.md spec v2).
///
/// Unlike `LunarWindow`, which resolves a *month*, these are actual observance days. Nothing on the
/// "this month" region uses them — they exist for a future "upcoming festivals" surface.
struct CalendarFestival: Decodable {
    let id: String
    let name: String
    /// Gregorian months it can fall in (lunar dates drift, so this may span two).
    let months: [String]
    /// Observance dates, ascending.
    let dates: [String]
    /// May be empty — many observances have no matching song in the corpus.
    let songs: [CalendarSongRef]

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case months
        case dates
        case songs
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        months = try c.decodeIfPresent([String].self, forKey: .months) ?? []
        dates = try c.decodeIfPresent([String].self, forKey: .dates) ?? []
        songs = try c.decodeIfPresent([CalendarSongRef].self, forKey: .songs) ?? []
    }
}

/// What a date resolves to: the window it falls in and that month's songs/observances.
///
/// Derived, not decoded — the counterpart of web's `ICalendarToday` and Android's `CalendarToday`.
struct CalendarToday {
    /// The ISO date this was resolved for, in the device's local timezone.
    let date: String
    let window: LunarWindow
    let month: CalendarMonth
}

/// Evidence-strength ranking, strongest first: `observed` → `panjika` → `book` → `thematic`.
///
/// An `observed` song is backed by dated recordings of it actually being sung that month; a
/// `thematic` one is a subject-matter match with no dated evidence. The distinction is real and
/// worth keeping as provenance metadata.
///
/// ⚠️ **It is deliberately not a sort key.** docs/screens/today.md **v2** withdrew v1's basis sort:
/// `basis` records *why* a song is attached to the month, not what order to sing it in. Ordering
/// lives in `CalendarRepositoryLogic.monthSongs(for:manifest:)` and preserves the shipped sequence.
/// This function is retained for any future surface that wants to weigh or filter by provenance.
func calendarBasisRank(_ basis: String) -> Int {
    switch basis {
    case "observed": return 0
    case "panjika": return 1
    case "book": return 2
    default: return 3
    }
}
