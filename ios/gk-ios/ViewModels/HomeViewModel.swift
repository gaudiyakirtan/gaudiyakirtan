import Foundation
import SwiftUI

class HomeViewModel: ObservableObject {
    @Published var songs: [ManifestEntry] = []
    @Published var authors: [Author] = []
    @Published var topics: [Topic] = []
    @Published var books: [Book] = []
    @Published var featuredSong: Song?
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

    private func loadData() {
        songs = repository.manifest
        authors = repository.authors()
        topics = repository.songGroups(kind: .topic).map(Topic.init(songGroup:))
        books = repository.songGroups(kind: .book).map { Book(songGroup: $0) }
        collections = repository.songGroups(kind: .collection).map { Collection(songGroup: $0, type: .playlist) }
        featuredSong = repository.song(uid: featuredSongUid)
    }
}
