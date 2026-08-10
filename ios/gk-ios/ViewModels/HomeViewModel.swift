import Foundation
import SwiftUI
import UIKit

class HomeViewModel: ObservableObject {
    @Published var songs: [ManifestEntry] = []
    @Published var authors: [Author] = []
    @Published var topics: [Topic] = []
    @Published var books: [Book] = []
    @Published var featuredSong: Song?
    @Published var collections: [Collection] = []
    @Published var searchText: String = ""
    @Published var showSettings: Bool = false

    /// The lunar month for today and its songs (docs/screens/home.md §1 "Welcome + this month",
    /// which embeds docs/screens/today.md v2).
    ///
    /// `nil` when today falls outside the calendar's precomputed window range — the spec says hide
    /// the region rather than show a wrong month, so `HomeView` renders nothing for a `nil`.
    @Published var thisMonth: CalendarToday?

    /// This month's songs, already ordered by the repository: the month's shipped sequence, with
    /// songs that have recordings stably lifted to the front. Capping is the view's decision.
    @Published var thisMonthSongs: [ManifestEntry] = []

    private let repository: SongRepository
    private let calendarRepository: CalendarRepository

    /// Token for the significant-time-change observer, removed on deinit.
    private var timeChangeObserver: NSObjectProtocol?

    /// Uid of the song featured at the bottom of Home. Real data (pipeline/converted/N9.json:
    /// "akrodha paramānanda" by Locana Dāsa Ṭhākura) happens to match what this screen showed as
    /// static sample text, so wiring it to the repository keeps the same visible content.
    private let featuredSongUid = "N9"

    init(
        repository: SongRepository = .shared,
        calendarRepository: CalendarRepository = .shared
    ) {
        self.repository = repository
        self.calendarRepository = calendarRepository
        loadData()
        loadThisMonth()
        observeSignificantTimeChange()
    }

    deinit {
        if let observer = timeChangeObserver {
            NotificationCenter.default.removeObserver(observer)
        }
    }

    private func loadData() {
        songs = repository.manifest
        authors = repository.authors()
        topics = repository.songGroups(kind: .topic).map(Topic.init(songGroup:))
        books = repository.songGroups(kind: .book).map { Book(songGroup: $0) }
        collections = repository.songGroups(kind: .collection).map { Collection(songGroup: $0, type: .playlist) }
        featuredSong = repository.song(uid: featuredSongUid)
    }

    /// Resolves today's lunar month against the overlay. The month overlay resolves against the same
    /// Manifest the lists already hold, so it costs no extra catalog read.
    private func loadThisMonth() {
        let today = calendarRepository.today()
        thisMonth = today
        if let today = today {
            thisMonthSongs = calendarRepository.monthSongs(
                for: today.month,
                manifest: repository.manifest
            )
        } else {
            thisMonthSongs = []
        }
    }

    /// Recomputes the month when the system reports a significant time change — midnight, a timezone
    /// change, or a manual clock change (docs/screens/today.md "Per-platform notes", iOS). Without
    /// this, a session left open across midnight keeps showing yesterday's month, which at a month
    /// boundary means showing the *wrong month*.
    private func observeSignificantTimeChange() {
        timeChangeObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.significantTimeChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.loadThisMonth()
        }
    }
}
