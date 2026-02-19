import Foundation

struct SampleData {
    private static let seedData: SeedData? = {
        guard let url = Bundle.main.url(forResource: "songs", withExtension: "json"),
              let data = try? Data(contentsOf: url) else {
            return nil
        }
        return try? JSONDecoder().decode(SeedData.self, from: data)
    }()

    static let authors: [Author] = {
        guard let seed = seedData else { return [] }
        return seed.authors?.map { Author(name: $0.name, image: $0.image ?? "") } ?? []
    }()

    static let topics: [Topic] = {
        guard let seed = seedData else { return [] }
        return seed.topics?.map { Topic(name: $0.topic) } ?? []
    }()

    static let books: [Book] = {
        guard let seed = seedData else { return [] }
        return seed.books?.map {
            Book(title: $0.title, author: $0.author, slug: $0.slug, uid: $0.uid, image: $0.image)
        } ?? []
    }()

    static let songs: [Song] = {
        guard let seed = seedData else { return [] }
        return seed.songs.map {
            Song(title: $0.title, author: $0.author ?? "Unknown", uid: $0.uid, audio: $0.audio ?? false, tags: $0.tags ?? [])
        }
    }()

    static let verses: [Verse] = {
        guard let seed = seedData else { return [] }
        return seed.songs.flatMap { song in
            (song.verses ?? []).map { $0.toVerse() }
        }
    }()

    /// Get verses for a specific song uid
    static func versesForSong(uid: String) -> [Verse] {
        guard let seed = seedData,
              let song = seed.songs.first(where: { $0.uid == uid }) else {
            return verses
        }
        return (song.verses ?? []).map { $0.toVerse() }
    }
}
