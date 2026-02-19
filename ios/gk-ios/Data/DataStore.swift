import SwiftUI
import SwiftData

/// Manages the SwiftData container and data seeding
@Observable
class DataStore {
    static let shared = DataStore()

    var songs: [Song] = []
    var verses: [String: [Verse]] = [:] // keyed by song uid
    var authors: [Author] = []
    var topics: [Topic] = []
    var books: [Book] = []
    var isLoaded = false

    private init() {}

    /// Load data from SwiftData container
    func loadData(context: ModelContext) {
        guard !isLoaded else { return }

        // Check if data exists
        let songDescriptor = FetchDescriptor<PersistentSong>()
        let existingSongs = (try? context.fetch(songDescriptor)) ?? []

        if existingSongs.isEmpty {
            // First launch - seed from bundled JSON
            seedFromJSON(context: context)
        }

        // Load all data
        let allSongs = (try? context.fetch(FetchDescriptor<PersistentSong>())) ?? []
        songs = allSongs.map { $0.toSong() }
        for ps in allSongs {
            verses[ps.uid] = ps.toVerses()
        }

        let allAuthors = (try? context.fetch(FetchDescriptor<PersistentAuthor>())) ?? []
        authors = allAuthors.map { $0.toAuthor() }

        let allTopics = (try? context.fetch(FetchDescriptor<PersistentTopic>())) ?? []
        topics = allTopics.map { $0.toTopic() }

        let allBooks = (try? context.fetch(FetchDescriptor<PersistentBook>())) ?? []
        books = allBooks.map { $0.toBook() }

        isLoaded = true
    }

    /// Seed SwiftData from bundled songs.json
    private func seedFromJSON(context: ModelContext) {
        guard let url = Bundle.main.url(forResource: "songs", withExtension: "json"),
              let data = try? Data(contentsOf: url) else {
            print("No bundled songs.json found, using SampleData fallback")
            seedFromSampleData(context: context)
            return
        }

        do {
            let decoder = JSONDecoder()
            let seedData = try decoder.decode(SeedData.self, from: data)

            for song in seedData.songs {
                let ps = PersistentSong(
                    uid: song.uid,
                    title: song.title,
                    author: song.author ?? "Unknown",
                    audio: song.audio ?? false,
                    tags: song.tags ?? [],
                    topics: song.topics ?? []
                )
                if let verses = song.verses {
                    ps.versesData = try? JSONEncoder().encode(verses)
                }
                context.insert(ps)
            }

            for author in seedData.authors ?? [] {
                context.insert(PersistentAuthor(
                    uid: author.uid,
                    name: author.name,
                    slug: author.slug,
                    image: author.image,
                    songUids: author.songs ?? [],
                    bookUids: author.books ?? []
                ))
            }

            for topic in seedData.topics ?? [] {
                context.insert(PersistentTopic(
                    uid: topic.uid,
                    topic: topic.topic,
                    slug: topic.slug,
                    songUids: topic.songs ?? []
                ))
            }

            for book in seedData.books ?? [] {
                context.insert(PersistentBook(
                    uid: book.uid,
                    title: book.title,
                    author: book.author,
                    slug: book.slug,
                    image: book.image
                ))
            }

            try? context.save()
            print("Seeded \(seedData.songs.count) songs from JSON")
        } catch {
            print("Failed to parse songs.json: \(error)")
            seedFromSampleData(context: context)
        }
    }

    /// Fallback: seed from SampleData
    private func seedFromSampleData(context: ModelContext) {
        for song in SampleData.songs {
            let ps = PersistentSong(
                uid: song.uid,
                title: song.title,
                author: song.author,
                audio: song.audio,
                tags: song.tags
            )
            // Encode sample verses
            let codableVerses = SampleData.verses.enumerated().map { (i, v) in
                CodableVerse(
                    index: i + 1,
                    language: v.language,
                    original: v.original,
                    transliterations: v.transliterations.compactMap { $0 }.map {
                        CodableTransliteration(language: $0.language, text: $0.text)
                    },
                    wordToWords: v.wordToWords.compactMap { $0 }.map {
                        CodableWordToWord(language: $0.language, words: $0.words)
                    },
                    translations: v.translations.compactMap { $0 }.map {
                        CodableTranslation(language: $0.language, text: $0.text)
                    }
                )
            }
            ps.versesData = try? JSONEncoder().encode(codableVerses)
            context.insert(ps)
        }

        for author in SampleData.authors {
            context.insert(PersistentAuthor(
                uid: author.name.lowercased().replacingOccurrences(of: " ", with: "-"),
                name: author.name,
                slug: author.name.lowercased().replacingOccurrences(of: " ", with: "-"),
                image: author.image
            ))
        }

        for topic in SampleData.topics {
            context.insert(PersistentTopic(
                uid: topic.name.lowercased().replacingOccurrences(of: " ", with: "-"),
                topic: topic.name,
                slug: topic.name.lowercased().replacingOccurrences(of: " ", with: "-")
            ))
        }

        for book in SampleData.books {
            context.insert(PersistentBook(
                uid: book.uid,
                title: book.title,
                author: book.author,
                slug: book.slug,
                image: book.image
            ))
        }

        try? context.save()
        print("Seeded from SampleData fallback")
    }

    /// Get verses for a specific song
    func versesForSong(uid: String) -> [Verse] {
        return verses[uid] ?? SampleData.verses
    }
}

// MARK: - Seed data JSON structures
struct SeedData: Codable {
    let songs: [CodableSong]
    let authors: [SeedAuthor]?
    let topics: [SeedTopic]?
    let books: [SeedBook]?
}

struct SeedAuthor: Codable {
    let uid: String
    let name: String
    let slug: String
    let image: String?
    let songs: [String]?
    let books: [String]?
}

struct SeedTopic: Codable {
    let uid: String
    let topic: String
    let slug: String
    let songs: [String]?
}

struct SeedBook: Codable {
    let uid: String
    let title: String
    let author: String?
    let slug: String
    let image: String?
}
