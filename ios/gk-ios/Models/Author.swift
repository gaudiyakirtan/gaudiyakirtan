import Foundation

struct Author: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let image: String
}