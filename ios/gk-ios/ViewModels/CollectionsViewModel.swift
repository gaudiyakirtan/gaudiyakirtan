import Foundation
import SwiftUI

class CollectionsViewModel: ObservableObject {
    @Published var selectedCategory: Category = .bookmarks
    @Published var collections: [Collection] = []
    @Published var searchText: String = ""

    enum Category: String, CaseIterable, Identifiable {
        case bookmarks = "Bookmarks"
        case playlists = "Playlists"

        var id: String { self.rawValue }
    }

    init(repository: SongRepository = .shared) {
        loadData(repository: repository)
    }

    private func loadData(repository: SongRepository) {
        // No collection data ships in the current corpus (see SongRepository.songGroups); this
        // resolves to an empty list until a pipeline slice emits `kind == .collection` groupings.
        collections = repository.songGroups(kind: .collection).map { Collection(songGroup: $0, type: .playlist) }
    }

    // Filtered collections based on selected category and search text
    var filteredCollections: [Collection] {
        let categoryFiltered = collections.filter { collection in
            switch selectedCategory {
            case .bookmarks:
                return collection.type == .bookmark
            case .playlists:
                return collection.type == .playlist
            }
        }

        if searchText.isEmpty {
            return categoryFiltered
        } else {
            return categoryFiltered.filter { collection in
                collection.name.localizedCaseInsensitiveContains(searchText)
            }
        }
    }

    // Search placeholder text based on selected category
    var searchPlaceholder: String {
        "Search \(selectedCategory.rawValue)"
    }
}
