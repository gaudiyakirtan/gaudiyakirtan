import Foundation
import SwiftUI

class LibraryViewModel: ObservableObject {
    @Published var selectedCategory: Category = .authors
    @Published var songs: [ManifestEntry] = []
    @Published var authors: [Author] = []
    @Published var topics: [Topic] = []
    @Published var books: [Book] = []
    @Published var searchText: String = ""
    @Published var scrollTarget: String? = nil

    private let repository: SongRepository

    enum Category: String, CaseIterable, Identifiable {
        case songs = "Songs"
        case authors = "Authors"
        case topics = "Topics"
        case books = "Books"

        var id: String { self.rawValue }
    }

    init(repository: SongRepository = .shared) {
        self.repository = repository
        loadData()
    }

    private func loadData() {
        songs = repository.manifest
        authors = repository.authors()
        topics = repository.songGroups(kind: .topic).map(Topic.init(songGroup:))
        // Book covers are a best-effort match against the three known bucket slugs
        // (docs/data/collections.md "gaura, nitai, radha"); `nil` falls back to BookCard's themed
        // accent color, so an unmatched/unavailable cover never blocks rendering.
        books = repository.songGroups(kind: .book).map { group in
            Book(songGroup: group, image: ImageConfig.bookCoverURL(forTitle: group.primaryTitle)?.absoluteString)
        }
    }

    // Filtered data based on search text and selected category. Sorted by the stable Latin
    // `primary_title` (docs/screens/songs-list.md: "Grouping/sort key is the stable Latin
    // primary_title") so sections read alphabetically and never reshuffle when `listLanguage` changes.
    var filteredSongs: [ManifestEntry] {
        let base: [ManifestEntry]
        if searchText.isEmpty {
            base = songs
        } else {
            base = songs.filter { entry in
                entry.displayTitle.localizedCaseInsensitiveContains(searchText) ||
                repository.authorDisplayName(forUid: entry.authorUid).localizedCaseInsensitiveContains(searchText)
            }
        }
        return base.sorted {
            $0.displayTitle.localizedCaseInsensitiveCompare($1.displayTitle) == .orderedAscending
        }
    }

    var filteredAuthors: [Author] {
        if searchText.isEmpty {
            return authors
        } else {
            return authors.filter { author in
                author.name.localizedCaseInsensitiveContains(searchText)
            }
        }
    }

    var filteredTopics: [Topic] {
        if searchText.isEmpty {
            return topics
        } else {
            return topics.filter { topic in
                topic.name.localizedCaseInsensitiveContains(searchText)
            }
        }
    }

    var filteredBooks: [Book] {
        if searchText.isEmpty {
            return books
        } else {
            return books.filter { book in
                book.title.localizedCaseInsensitiveContains(searchText) ||
                (book.author?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
    }

    // Search placeholder text based on selected category
    var searchPlaceholder: String {
        switch selectedCategory {
        case .songs:
            return "Search Songs"
        case .authors:
            return "Search Authors"
        case .topics:
            return "Search Topics"
        case .books:
            return "Search Books"
        }
    }
}
