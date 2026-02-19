import Foundation

struct Topic: Identifiable, Hashable {
    let id = UUID()
    let name: String

    init(name: String) {
        self.name = name
    }
    
    var demoSongCount: Int {
        // Generate a pseudo-random count based on the topic name length
        return (name.count * 3) % 20 + 1
    }
}