import Foundation

/// Pure, `Bundle`/IO-free calendar derivation — the Swift counterpart of Android's
/// `CalendarRepositoryLogic` and web's `services/calendarRepository.ts`, kept parallel so the same
/// lookup reads the same way on all three platforms. `CalendarRepository` adds only the
/// bundle-reading and caching around this.
///
/// ISO dates (`YYYY-MM-DD`) compare correctly as strings, which is why the window lookup needs no
/// date parsing at all — only "what is today, locally?" does.
enum CalendarRepositoryLogic {

    // MARK: - Today's date

    /// ISO `YYYY-MM-DD` for `date`, in the device's **local** timezone.
    ///
    /// The local part is a spec requirement, not an incidental choice (docs/data/calendar.md
    /// "Platform notes"): formatting in UTC first shifts the date by a day for readers west of
    /// Greenwich in the evening, silently showing the wrong lunar month.
    ///
    /// An explicit Gregorian calendar rather than `Calendar.current`, whose *identifier* follows the
    /// reader's Settings — a device set to the Buddhist or Japanese calendar would otherwise yield a
    /// year that matches no window at all. Only the **timezone** should be taken from the device.
    static func isoDate(from date: Date = Date()) -> String {
        var gregorian = Foundation.Calendar(identifier: .gregorian)
        gregorian.timeZone = TimeZone.current
        let parts = gregorian.dateComponents([.year, .month, .day], from: date)
        let year = zeroPadded(parts.year ?? 0, width: 4)
        let month = zeroPadded(parts.month ?? 0, width: 2)
        let day = zeroPadded(parts.day ?? 0, width: 2)
        return year + "-" + month + "-" + day
    }

    private static func zeroPadded(_ value: Int, width: Int) -> String {
        let digits = String(value)
        if digits.count >= width { return digits }
        return String(repeating: "0", count: width - digits.count) + digits
    }

    // MARK: - Lookups

    /// The lunar window containing `isoDate`, or `nil` when the date falls outside the precomputed
    /// range. Windows are half-open (`start <= date < end`) and contiguous, so at most one matches.
    static func lunarWindow(in calendar: GaudiyaCalendar, isoDate: String) -> LunarWindow? {
        calendar.windows.first(where: { isoDate >= $0.start && isoDate < $0.end })
    }

    /// A month block by lunar name (`"Kārtika"`) or Gaudiya name (`"Dāmodara"`).
    static func month(in calendar: GaudiyaCalendar, named name: String) -> CalendarMonth? {
        calendar.months.first(where: { $0.lunarMonth == name || $0.gaudiyaMonth == name })
    }

    /// What to sing on `isoDate`: the window it falls in and that month's songs/observances.
    ///
    /// Returns `nil` only when the date is outside the precomputed range — per docs/screens/home.md
    /// the region then hides entirely rather than showing a wrong month.
    ///
    /// `month.songs` may be empty even on success (Pauṣa ships none); callers render an empty state
    /// and never fabricate rows.
    static func songsForDate(in calendar: GaudiyaCalendar, isoDate: String) -> CalendarToday? {
        guard let window = lunarWindow(in: calendar, isoDate: isoDate) else { return nil }

        // An adhika (leap) month is Puruṣottama and carries its own block, not the block of the
        // lunar month whose name it repeats. The window's `gaudiya_month` reads
        // "Puruṣottama (adhika)", so the block is found by its own plain name.
        let resolved: CalendarMonth?
        if window.adhika {
            resolved = month(in: calendar, named: "Puruṣottama")
                ?? month(in: calendar, named: window.lunarMonth)
        } else {
            resolved = month(in: calendar, named: window.lunarMonth)
        }
        guard let block = resolved else { return nil }

        return CalendarToday(date: isoDate, window: window, month: block)
    }

    /// The month's songs resolved against the Manifest and ordered for display
    /// (docs/screens/today.md **v2**, "Ranking and provenance").
    ///
    /// **The shipped `song_uids` order is the ranking.** `calendar.json` curates each month as a
    /// sequence, so it is preserved rather than re-sorted. The one permitted reordering is a stable
    /// partition putting songs with recordings first, so the lead region opens with what the reader
    /// can actually hear; relative order inside each run is untouched.
    ///
    /// Two order-preserving `filter` passes rather than `Array.partition(by:)` or a comparator keyed
    /// on `audioAvailable`: the standard library's `partition(by:)` is explicitly **not stable**, and
    /// `sort` is not a stable sort either — both would reshuffle same-audio songs and lose the
    /// curated sequence. `filter` is documented to preserve order, which is the whole requirement.
    ///
    /// Spec v1 sorted by `basis` strength here, and that is withdrawn. `basis` records *why* a song
    /// belongs to the month, not what order to sing it in, and sorting on it split songs curated
    /// together — in Śrāvaṇa it lifted a lone `panjika` song above two adjacent `book` ones, which is
    /// how the divergence from web was noticed. `calendarBasisRank` is kept for any surface that
    /// wants to weigh provenance, but it is deliberately not applied here.
    ///
    /// No display cap: capping is a UI concern (today.md v2 "Display cap"), applied after this
    /// partition, so the full ordered list stays available to every surface.
    ///
    /// Uids missing from the Manifest are dropped silently, exactly as the song-group resolution does.
    static func monthSongs(for month: CalendarMonth, manifest: [ManifestEntry]) -> [ManifestEntry] {
        let byUid = Dictionary(manifest.map { ($0.uid, $0) }, uniquingKeysWith: { first, _ in first })
        let resolved = month.songs.compactMap { byUid[$0.uid] }
        return resolved.filter { $0.audioAvailable } + resolved.filter { !$0.audioAvailable }
    }
}
