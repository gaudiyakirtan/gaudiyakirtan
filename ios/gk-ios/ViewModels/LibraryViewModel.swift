import Foundation
import SwiftUI

class LibraryViewModel: ObservableObject {
    @Published var selectedCategory: Category = .authors
    @Published var songs: [Song] = []
    @Published var authors: [Author] = []
    @Published var topics: [Topic] = []
    @Published var books: [Book] = []
    @Published var searchText: String = ""
    @Published var scrollTarget: String? = nil
    
    enum Category: String, CaseIterable, Identifiable {
        case songs = "Songs"
        case authors = "Authors"
        case topics = "Topics"
        case books = "Books"
        
        var id: String { self.rawValue }
    }
    
    init() {
        loadData()
    }
    
    private func loadData() {
        // Use the same sample data as HomeViewModel for now
        // In a real app, this would come from a repository or service
        let homeVM = HomeViewModel()
        self.songs = homeVM.songs
        self.authors = homeVM.authors
        self.topics = homeVM.topics
        self.books = homeVM.books
    }
    
    // Filtered data based on search text and selected category
    var filteredSongs: [Song] {
        if searchText.isEmpty {
            return songs
        } else {
            return songs.filter { song in
                song.title.localizedCaseInsensitiveContains(searchText) ||
                song.author.localizedCaseInsensitiveContains(searchText) ||
                song.tags.contains { $0.localizedCaseInsensitiveContains(searchText) }
            }
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