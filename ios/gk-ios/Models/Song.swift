import Foundation

struct Song: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let author: String
    let uid: String
    let audio: Bool
    let tags: [String]
}