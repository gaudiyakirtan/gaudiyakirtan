import Foundation
import SwiftUI

class HomeViewModel: ObservableObject {
    @Published var songs: [Song] = []
    @Published var authors: [Author] = []
    @Published var topics: [Topic] = []
    @Published var books: [Book] = []
    @Published var verses: [Verse] = []
    @Published var collections: [Collection] = []
    @Published var searchText: String = ""
    @Published var showSettings: Bool = false
    
    init() {
        setupSampleData()
    }
    
    private func setupSampleData() {
        // Load sample data from the SampleData struct
        authors = SampleData.authors
        topics = SampleData.topics
        books = SampleData.books
        songs = SampleData.songs
        verses = SampleData.verses
        
        // Sample Collections
        collections = [
            Collection(name: "Favorites", type: .bookmark, songIds: ["N3", "S1", "E4"]),
            Collection(name: "Kartik Songs", type: .playlist, songIds: ["SQ2", "L5"]),
            Collection(name: "IPBYS", type: .playlist, songIds: ["E4", "N3"]),
            Collection(name: "Memorize", type: .bookmark, songIds: ["S1", "SQ2", "L5"])
        ]
    }
}
