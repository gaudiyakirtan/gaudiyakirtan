import Foundation

/// Reads the bundled lunar-calendar overlay (`calendar.json`, docs/data/calendar.md).
///
/// Same shape as `SongRepository`: a process singleton over an injectable `Bundle`, decoding the
/// resource once into a `private(set) lazy var`, and degrading to a safe empty value (never a crash,
/// never a fabricated month) if the resource is missing or corrupt. Every derivation is delegated to
/// the pure `CalendarRepositoryLogic`, so the interesting behavior is unit-testable without a bundle.
///
/// ## Bundling note
/// `calendar.json` lives on disk at `gk-ios/Resources/songs/calendar.json` purely for Xcode-navigator
/// organization. The project uses a file-system-synchronized group for the whole `gk-ios/` folder,
/// which flattens loose resources into the top level of the built app bundle — so the lookup below
/// takes no `subdirectory:` argument, exactly like `SongRepository.loadManifest()`.
final class CalendarRepository {
    static let shared = CalendarRepository()

    private let bundle: Bundle

    /// The whole decoded overlay, decoded once and kept in memory.
    private(set) lazy var calendar: GaudiyaCalendar = loadCalendar()

    init(bundle: Bundle = .main) {
        self.bundle = bundle
    }

    private func loadCalendar() -> GaudiyaCalendar {
        guard let url = bundle.url(forResource: "calendar", withExtension: "json") else {
            assertionFailure("calendar.json not found in the app bundle — was it copied into gk-ios/Resources/songs/ and added to the target?")
            return .empty
        }
        do {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode(GaudiyaCalendar.self, from: data)
        } catch {
            assertionFailure("Failed to decode calendar.json: \(error)")
            return .empty
        }
    }

    // MARK: - Today

    /// What to sing on `date` — defaults to now, resolved in the device's **local** timezone.
    ///
    /// Returns `nil` outside the precomputed window range, which the home hero treats as "hide the
    /// region" rather than showing a wrong month.
    func today(on date: Date = Date()) -> CalendarToday? {
        today(isoDate: CalendarRepositoryLogic.isoDate(from: date))
    }

    /// `today(on:)` for an explicit ISO `YYYY-MM-DD`, so callers (and tests) can resolve a date
    /// without going through a `Date` and a timezone.
    func today(isoDate: String) -> CalendarToday? {
        CalendarRepositoryLogic.songsForDate(in: calendar, isoDate: isoDate)
    }

    /// The month's songs, in the shipped sequence with playable songs stably lifted to the front
    /// (docs/screens/today.md v2). Uncapped — capping is the caller's display decision.
    func monthSongs(for month: CalendarMonth, manifest: [ManifestEntry]) -> [ManifestEntry] {
        CalendarRepositoryLogic.monthSongs(for: month, manifest: manifest)
    }

    // MARK: - Daily slots

    /// The daily ārati slots — these apply every day, independent of the lunar month.
    ///
    /// Deliberately unused by the home hero (docs/screens/home.md §1 keeps the time-of-day slot off
    /// that region); kept here so a future surface has it. Note the `sunrise` slot ships zero songs.
    func dailySlots() -> [CalendarDailySlot] {
        calendar.daily
    }
}
