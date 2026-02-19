import Foundation

struct Author: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let image: String

    init(name: String, image: String) {
        self.name = name
        self.image = image
    }
}