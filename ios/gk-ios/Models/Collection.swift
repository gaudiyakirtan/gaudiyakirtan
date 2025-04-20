import Foundation

enum CollectionType: String, CaseIterable, Identifiable {
    case bookmark = "Bookmark"
    case playlist = "Playlist"
    
    var id: String { self.rawValue }
}

struct Collection: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let type: CollectionType
    let songIds: [String]
    
    init(name: String, type: CollectionType, songIds: [String] = []) {
        self.name = name
        self.type = type
        self.songIds = songIds
    }
}