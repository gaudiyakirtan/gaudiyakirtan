import Foundation
import SwiftUI

class HomeViewModel: ObservableObject {
    @Published var songs: [ManifestEntry] = []
    @Published var authors: [Author] = []
    @Published var topics: [Topic] = []
    @Published var books: [Book] = []
    @Published var featuredSong: Song?
    @Published private(set) var listeningSong: Song?
    @Published var collections: [Collection] = []
    @Published var searchText: String = ""
    @Published var showSettings: Bool = false

    private let repository: SongRepository

    /// Uid of the song featured at the bottom of Home. Real data (pipeline/converted/N9.json:
    /// "akrodha paramānanda" by Locana Dāsa Ṭhākura) happens to match what this screen showed as
    /// static sample text, so wiring it to the repository keeps the same visible content.
    private let featuredSongUid = "N9"

    init(repository: SongRepository = .shared) {
        self.repository = repository
        loadData()
    }

    // Only the Home projections are bounded. Library and filtering retain the full catalog.
    var previewSongs: [ManifestEntry] { Array(filteredSongs.prefix(4)) }
    var previewBooks: [Book] { Array(filteredBooks.prefix(4)) }
    var previewAuthors: [Author] { Array(filteredAuthors.prefix(4)) }
    var previewTopics: [Topic] { Array(filteredTopics.prefix(6)) }

    func songCount(for author: Author) -> Int {
        songs.filter { $0.authorUid == author.uid }.count
    }

    /// Resolve actual tracks, not just the manifest's availability flag. Stop at the first
    /// recording in catalog order; no ranking or date-based recommendation is implied.
    static func firstRecording(in entries: [ManifestEntry], loadSong: (String) -> Song?) -> Song? {
        for entry in entries where entry.audioAvailable {
            if let song = loadSong(entry.uid), !song.audioFiles.isEmpty { return song }
        }
        return nil
    }

    var filteredSongs: [ManifestEntry] {
        guard !searchText.isEmpty else { return songs }
        return songs.filter {
            $0.displayTitle.localizedCaseInsensitiveContains(searchText) ||
            repository.authorDisplayName(forUid: $0.authorUid).localizedCaseInsensitiveContains(searchText)
        }
    }

    var filteredAuthors: [Author] {
        searchText.isEmpty ? authors : authors.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var filteredTopics: [Topic] {
        searchText.isEmpty ? topics : topics.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var filteredBooks: [Book] {
        guard !searchText.isEmpty else { return books }
        return books.filter {
            $0.title.localizedCaseInsensitiveContains(searchText) ||
            ($0.author?.localizedCaseInsensitiveContains(searchText) ?? false)
        }
    }

    private func loadData() {
        songs = repository.manifest
        authors = repository.authors()
        topics = repository.songGroups(kind: .topic).map(Topic.init(songGroup:))
        books = repository.songGroups(kind: .book).map {
            Book(songGroup: $0, image: ImageConfig.bookCoverURL(forTitle: $0.primaryTitle)?.absoluteString)
        }
        collections = repository.songGroups(kind: .collection).map { Collection(songGroup: $0, type: .playlist) }
        featuredSong = repository.song(uid: featuredSongUid)
        listeningSong = Self.firstRecording(in: songs, loadSong: repository.song(uid:))
    }
}
