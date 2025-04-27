import Foundation

struct Book: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let author: String?
    let slug: String
    let uid: String
    let image: String?
    let songCount: Int?
    let year: String?
    
    init(title: String, author: String?, slug: String, uid: String, image: String?, songCount: Int? = nil, year: String? = nil) {
        self.title = title
        self.author = author
        self.slug = slug
        self.uid = uid
        self.image = image
        self.songCount = songCount
        self.year = year
    }
};
