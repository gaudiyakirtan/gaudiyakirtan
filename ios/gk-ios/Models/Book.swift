import Foundation

struct Book: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let author: String?
    let slug: String
    let uid: String
    let image: String?
};
