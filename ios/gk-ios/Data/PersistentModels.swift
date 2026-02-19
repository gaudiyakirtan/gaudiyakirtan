import SwiftUI
import SwiftData

/// SwiftData model for persistent song storage
@Model
final class PersistentSong {
    @Attribute(.unique) var uid: String
    var title: String
    var author: String
    var audio: Bool
    var tags: [String]
    var topics: [String]
    var versesData: Data? // Store verses as JSON data

    init(uid: String, title: String, author: String, audio: Bool = false, tags: [String] = [], topics: [String] = []) {
        self.uid = uid
        self.title = title
        self.author = author
        self.audio = audio
        self.tags = tags
        self.topics = topics
    }

    /// Convert to the app's Song model
    func toSong() -> Song {
        Song(title: title, author: author, uid: uid, audio: audio, tags: tags)
    }

    /// Decode stored verses
    func toVerses() -> [Verse] {
        guard let data = versesData else { return [] }
        do {
            let decoded = try JSONDecoder().decode([CodableVerse].self, from: data)
            return decoded.map { $0.toVerse() }
        } catch {
            print("Failed to decode verses: \(error)")
            return []
        }
    }
}

/// Codable verse for JSON serialization
struct CodableVerse: Codable {
    let index: Int
    let language: String?
    let original: [String]
    let transliterations: [CodableTransliteration]
    let wordToWords: [CodableWordToWord]
    let translations: [CodableTranslation]

    func toVerse() -> Verse {
        Verse(
            language: language,
            original: original,
            transliterations: transliterations.map { Transliteration(id: UUID(), language: $0.language, text: $0.text) },
            wordToWords: wordToWords.map { WordToWord(id: UUID(), language: $0.language, words: $0.words) },
            translations: translations.map { Translation(id: UUID(), language: $0.language, text: $0.text) }
        )
    }
}

struct CodableTransliteration: Codable {
    let language: String
    let text: [String]
}

struct CodableWordToWord: Codable {
    let language: String
    let words: [[String]]
}

struct CodableTranslation: Codable {
    let language: String
    let text: String
}

/// Codable song for JSON import
struct CodableSong: Codable {
    let uid: String
    let title: String
    let author: String?
    let audio: Bool?
    let tags: [String]?
    let topics: [String]?
    let verses: [CodableVerse]?
}

@Model
final class PersistentAuthor {
    @Attribute(.unique) var uid: String
    var name: String
    var slug: String
    var image: String?
    var songUids: [String]
    var bookUids: [String]

    init(uid: String, name: String, slug: String, image: String? = nil, songUids: [String] = [], bookUids: [String] = []) {
        self.uid = uid
        self.name = name
        self.slug = slug
        self.image = image
        self.songUids = songUids
        self.bookUids = bookUids
    }

    func toAuthor() -> Author {
        Author(name: name, image: image ?? "")
    }
}

@Model
final class PersistentTopic {
    @Attribute(.unique) var uid: String
    var topic: String
    var slug: String
    var songUids: [String]

    init(uid: String, topic: String, slug: String, songUids: [String] = []) {
        self.uid = uid
        self.topic = topic
        self.slug = slug
        self.songUids = songUids
    }

    func toTopic() -> Topic {
        Topic(name: topic)
    }
}

@Model
final class PersistentBook {
    @Attribute(.unique) var uid: String
    var title: String
    var author: String?
    var slug: String
    var image: String?

    init(uid: String, title: String, author: String? = nil, slug: String, image: String? = nil) {
        self.uid = uid
        self.title = title
        self.author = author
        self.slug = slug
        self.image = image
    }

    func toBook() -> Book {
        Book(title: title, author: author, slug: slug, uid: uid, image: image)
    }
}
