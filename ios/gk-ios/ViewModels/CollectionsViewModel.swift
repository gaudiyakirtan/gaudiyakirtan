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
    
    init() {
        loadData()
    }
    
    private func loadData() {
        // Use the same sample data as HomeViewModel
        let homeVM = HomeViewModel()
        self.collections = homeVM.collections
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