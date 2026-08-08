//
//  CalendarRepositoryTests.swift
//  gk-iosTests
//
//  The lunar-calendar overlay (docs/data/calendar.md) and its ordering rule
//  (docs/screens/today.md v2), exercised against the *real* bundled `calendar.json` + `manifest.json`
//  — the same files the app ships. Hosted unit test target, so `.shared` (backed by `Bundle.main`)
//  resolves the app bundle; see `SongRepositoryTests` for why.
//
//  Mirrors Android's `CalendarRepositoryLogicTest` case for case, including the pinned Śrāvaṇa
//  ordering. This is the data behind Home's lead region, and it is the one region whose answer
//  changes by itself — so the invariants that matter are the ones that would silently produce a
//  *wrong month* rather than an obvious crash.
//
//  Facts asserted below (window dates, month names, uid sequences) were read directly out of the
//  bundled `calendar.json`, not guessed.

import XCTest
@testable import gk_ios

final class CalendarRepositoryTests: XCTestCase {

    private var repository: CalendarRepository { .shared }
    private var calendar: GaudiyaCalendar { repository.calendar }
    private var manifest: [ManifestEntry] { SongRepository.shared.manifest }

    // MARK: - Decode (docs/data/calendar.md)

    func testDecodesTheBundledOverlayWithSnakeCaseFields() {
        XCTAssertEqual(calendar.specVersion, 2, "calendar.md is at spec v2")
        XCTAssertFalse(calendar.windows.isEmpty, "windows should be present")
        XCTAssertFalse(calendar.months.isEmpty, "months should be present")
        XCTAssertFalse(calendar.daily.isEmpty, "daily ārati slots should be present")
        XCTAssertTrue(
            calendar.windows.allSatisfy { !$0.lunarMonth.isEmpty && !$0.gaudiyaMonth.isEmpty },
            "every window must name both its lunar and its Gaudiya month"
        )
        // calendar.md invariant: 12 lunar months plus one `Adhika` block.
        XCTAssertEqual(calendar.months.count, 13)
    }

    /// The half-open contract (`start <= date < end`, `end` == the next `start`) is what guarantees a
    /// date resolves to exactly one month. If windows ever overlapped or left a gap, the hero would
    /// pick the wrong month on boundary days — a bug no crash would reveal.
    func testWindowsAreContiguousAndHalfOpen() {
        let sorted = calendar.windows.sorted { $0.start < $1.start }
        XCTAssertFalse(sorted.isEmpty)
        for index in 0..<(sorted.count - 1) {
            XCTAssertEqual(
                sorted[index].end,
                sorted[index + 1].start,
                "window \(sorted[index].start) must end exactly where \(sorted[index + 1].start) begins"
            )
        }
        XCTAssertTrue(sorted.allSatisfy { $0.start < $0.end }, "every window must be non-empty")
    }

    func testADateInsideTheRangeResolvesToExactlyOneWindow() {
        let probe = calendar.windows[calendar.windows.count / 2].start
        let matches = calendar.windows.filter { probe >= $0.start && probe < $0.end }
        XCTAssertEqual(matches.count, 1, "a date must match exactly one window")
        XCTAssertNotNil(CalendarRepositoryLogic.lunarWindow(in: calendar, isoDate: probe))
    }

    /// Out of range is a real state: Home hides the region rather than showing a wrong month.
    func testADateOutsideThePrecomputedRangeResolvesToNil() {
        XCTAssertNil(CalendarRepositoryLogic.lunarWindow(in: calendar, isoDate: "1900-01-01"))
        XCTAssertNil(CalendarRepositoryLogic.songsForDate(in: calendar, isoDate: "1900-01-01"))
        XCTAssertNil(repository.today(isoDate: "2099-01-01"))
    }

    func testSongsForDateReturnsTheMonthBlockMatchingTheWindow() throws {
        let window = calendar.windows[calendar.windows.count / 2]
        let today = try XCTUnwrap(CalendarRepositoryLogic.songsForDate(in: calendar, isoDate: window.start))

        XCTAssertEqual(today.date, window.start)
        if !window.adhika {
            XCTAssertEqual(
                today.month.lunarMonth,
                window.lunarMonth,
                "a non-adhika window must resolve to its own lunar month block"
            )
        }
    }

    /// today.md's worked example: `2026-11-14` is inside the Kārtika window (2026-10-26 ..< 2026-11-24).
    func testAKnownDateResolvesToKartikaDamodara() throws {
        let today = try XCTUnwrap(repository.today(isoDate: "2026-11-14"))
        XCTAssertEqual(today.window.lunarMonth, "Kārtika")
        XCTAssertEqual(today.window.gaudiyaMonth, "Dāmodara")
        XCTAssertEqual(today.month.lunarMonth, "Kārtika")
        XCTAssertFalse(today.window.adhika)
    }

    /// An `adhika` window must resolve to the **Puruṣottama** block, not to the block of the ordinary
    /// lunar month whose name it repeats. 2026-05-15 sits inside the 2026-05-01 ..< 2026-05-31
    /// intercalary window, whose `lunar_month` is the repeated "Jyeṣṭha".
    func testAnAdhikaDateResolvesToPurusottamaAndNotTheRepeatedMonth() throws {
        let today = try XCTUnwrap(repository.today(isoDate: "2026-05-15"))
        XCTAssertTrue(today.window.adhika, "2026-05-15 is inside an intercalary window")
        XCTAssertEqual(today.window.lunarMonth, "Jyeṣṭha", "the window repeats the ordinary month name")
        XCTAssertEqual(today.month.gaudiyaMonth, "Puruṣottama", "but the block resolved must be Puruṣottama")
        XCTAssertEqual(today.month.lunarMonth, "Adhika")
        XCTAssertNotEqual(
            today.month.lunarMonth,
            today.window.lunarMonth,
            "the adhika block must not be the repeated month's own block"
        )
    }

    // MARK: - Ordering (docs/screens/today.md v2, "Ranking and provenance")

    /// The shipped sequence is the ranking, and the only reordering is a *stable* playable-first
    /// partition.
    ///
    /// The stability half is the part worth testing. v1 sorted by `basis` here, which silently
    /// fragmented months curated as a sequence — Śrāvaṇa ships `B25(book), B26(book), VT3(panjika),
    /// GN1(thematic)` and the sort lifted VT3 above the two adjacent book songs, putting the platform
    /// out of step with web. A regression back to any comparator would fail this.
    func testMonthSongsPutPlayableFirstWhilePreservingTheShippedSequence() throws {
        let month = try XCTUnwrap(calendar.months.first(where: { $0.songs.count > 3 }))
        let ordered = CalendarRepositoryLogic.monthSongs(for: month, manifest: manifest)

        if let firstNonPlayable = ordered.firstIndex(where: { !$0.audioAvailable }) {
            XCTAssertFalse(
                ordered[firstNonPlayable...].contains(where: { $0.audioAvailable }),
                "no playable song may appear after a non-playable one"
            )
        }

        // Each run, read on its own, must still be in shipped order.
        let manifestUids = Set(manifest.map(\.uid))
        let shipped = month.songs.map(\.uid).filter { manifestUids.contains($0) }
        let playable = ordered.filter { $0.audioAvailable }.map(\.uid)
        let rest = ordered.filter { !$0.audioAvailable }.map(\.uid)

        XCTAssertEqual(
            shipped.filter { playable.contains($0) },
            playable,
            "the playable run must keep the month's shipped order"
        )
        XCTAssertEqual(
            shipped.filter { rest.contains($0) },
            rest,
            "the non-playable run must keep the month's shipped order"
        )
    }

    /// The concrete case that exposed the cross-platform divergence, pinned so it cannot drift back.
    /// A basis sort would yield `B25, VT3, B26, GN1`.
    func testSravanaResolvesInItsShippedOrderWithThePlayableSongLifted() throws {
        let sravana = try XCTUnwrap(calendar.months.first(where: { $0.lunarMonth.hasPrefix("Śrāvaṇa") }))
        let ordered = CalendarRepositoryLogic.monthSongs(for: sravana, manifest: manifest).map(\.uid)

        XCTAssertEqual(ordered, ["B25", "B26", "VT3", "GN1"])
    }

    /// Kārtika is the month where the partition actually does something: its 15 shipped songs
    /// interleave audio and non-audio, so a non-stable reordering would visibly reshuffle rows
    /// instead of coinciding with the input the way Śrāvaṇa's nearly does.
    ///
    /// Shipped sequence is `K1, K23, X1, X2, D6, D7, D8, D9, D19, D4, D5, S30, A14, A16, A17`; the
    /// four with recordings are `K1, D19, S30, A14`. Pinned as a literal so any regression — a basis
    /// sort, an unstable partition, a cap leaking into the data layer — fails here.
    func testKartikaLiftsItsPlayableSongsWithoutReshufflingEitherRun() throws {
        let kartika = try XCTUnwrap(calendar.months.first(where: { $0.lunarMonth == "Kārtika" }))
        let ordered = CalendarRepositoryLogic.monthSongs(for: kartika, manifest: manifest).map(\.uid)

        XCTAssertEqual(
            ordered,
            [
                "K1", "D19", "S30", "A14",
                "K23", "X1", "X2", "D6", "D7", "D8", "D9", "D4", "D5", "A16", "A17"
            ]
        )
        XCTAssertEqual(
            Set(ordered),
            Set(kartika.songs.map(\.uid)),
            "the partition must not add or drop rows"
        )
    }

    /// Uids with no Manifest row are dropped, exactly as the song-group resolution does.
    func testMonthSongsResolveOnlyAgainstTheShippedManifest() {
        let uids = Set(manifest.map(\.uid))
        for month in calendar.months {
            let resolved = CalendarRepositoryLogic.monthSongs(for: month, manifest: manifest)
            XCTAssertTrue(
                resolved.allSatisfy { uids.contains($0.uid) },
                "\(month.lunarMonth) resolved a song outside the manifest"
            )
            XCTAssertLessThanOrEqual(
                resolved.count,
                month.songs.count,
                "\(month.lunarMonth) resolved more songs than it references"
            )
        }
    }

    /// An empty month is legitimate (Pauṣa ships no festival songs); it must resolve, not throw.
    func testAMonthWithNoSongsResolvesToAnEmptyList() throws {
        let empty = try XCTUnwrap(
            calendar.months.first(where: { $0.songs.isEmpty }),
            "the corpus is expected to ship at least one song-less month (Pauṣa)"
        )
        XCTAssertTrue(CalendarRepositoryLogic.monthSongs(for: empty, manifest: manifest).isEmpty)
    }

    // MARK: - Local-date resolution (docs/data/calendar.md "Platform notes")

    /// Resolving in UTC would shift the date by a day for readers west of Greenwich in the evening,
    /// silently returning the wrong lunar month. This pins the formatting to the *device's* zone —
    /// `TimeZone.current`, whatever the test host is set to — rather than to UTC.
    func testIsoDateIsFormattedInTheDeviceTimezoneNotUtc() {
        var deviceCalendar = Foundation.Calendar(identifier: .gregorian)
        deviceCalendar.timeZone = TimeZone.current
        let now = Date()
        let parts = deviceCalendar.dateComponents([.year, .month, .day], from: now)

        let iso = CalendarRepositoryLogic.isoDate(from: now)
        let components = iso.split(separator: "-").map(String.init)

        XCTAssertEqual(components.count, 3, "expected YYYY-MM-DD, got \(iso)")
        XCTAssertEqual(components.first?.count, 4, "the year must be zero-padded to 4 digits")
        XCTAssertEqual(Int(components[0]), parts.year)
        XCTAssertEqual(Int(components[1]), parts.month)
        XCTAssertEqual(Int(components[2]), parts.day)
    }

    func testIsoDateZeroPadsSingleDigitMonthsAndDays() {
        var local = Foundation.Calendar(identifier: .gregorian)
        local.timeZone = TimeZone.current
        var components = DateComponents()
        components.year = 2026
        components.month = 3
        components.day = 7
        // Midday, so a DST transition at local midnight can't roll the fixture into a neighboring day.
        components.hour = 12
        guard let date = local.date(from: components) else {
            return XCTFail("could not build a fixture date")
        }
        XCTAssertEqual(CalendarRepositoryLogic.isoDate(from: date), "2026-03-07")
    }

    // MARK: - Month artwork (docs/screens/home.md §1 "Artwork")

    /// The slug must match web's `monthImageUrlFor()` and Android's `ImageConfig.monthSlug` exactly,
    /// so one dropped-in file serves all three platforms.
    func testMonthSlugMatchesTheOtherPlatforms() {
        XCTAssertEqual(ImageConfig.monthSlug(forGaudiyaMonth: "Śrīdhara"), "sridhara")
        XCTAssertEqual(ImageConfig.monthSlug(forGaudiyaMonth: "Vāmana"), "vamana")
        XCTAssertEqual(ImageConfig.monthSlug(forGaudiyaMonth: "Dāmodara"), "damodara")
        XCTAssertEqual(ImageConfig.monthSlug(forGaudiyaMonth: "Puruṣottama"), "purusottama")
        // Not "bisnu": the slug must not go through the search normalizer's v→b / j→y folds.
        XCTAssertEqual(ImageConfig.monthSlug(forGaudiyaMonth: "Viṣṇu"), "visnu")
        XCTAssertEqual(ImageConfig.monthSlug(forGaudiyaMonth: "Puruṣottama (adhika)"), "purusottamaadhika")
    }

    /// Only Vāmana ships a file today; every other month falling back to the gradient is the normal
    /// path, not a failure.
    func testOnlyVamanaShipsBannerArtwork() {
        XCTAssertNotNil(ImageConfig.monthArtworkURL(forGaudiyaMonth: "Vāmana"))
        XCTAssertNil(ImageConfig.monthArtworkURL(forGaudiyaMonth: "Śrīdhara"))
    }
}
