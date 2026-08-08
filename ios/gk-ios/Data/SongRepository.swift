import Foundation

/// Offline-first data access for the canonical Gaudiya Kirtan corpus (docs/data/*.md).
///
/// Reads exclusively from the app bundle — no network calls, no on-device write path in slice 1.
/// Per manifest.md's "Platform notes", every list/browse/search screen should read the lightweight
/// `manifest`, never full `Song` objects; a full `Song` is decoded on demand only when the reader
/// opens the detail screen (`song(uid:)`), and is cached in memory afterwards.
///
/// ## Bundling note (why there's no `subdirectory:` in the resource lookups below)
/// The corpus is copied on disk into `gk-ios/Resources/songs/` purely for Xcode-navigator
/// organization. This project uses Xcode 16's file-system-synchronized group for the whole
/// `gk-ios/` folder (see `gk-ios.xcodeproj/project.pbxproj`), and empirically that mechanism
/// flattens loose resource files into the top level of the built app bundle rather than preserving
/// their on-disk subdirectory (verified by a throwaway build: a file at `Resources/songs/TEST1.json`
/// landed at the bundle root as `TEST1.json`, not `songs/TEST1.json`). So every song file and
/// `manifest.json` are looked up at the bundle root, with no `subdirectory:` argument.
final class SongRepository {
    static let shared = SongRepository()

    private let bundle: Bundle
    private var songCache: [String: Song] = [:]
    private var authorsCache: [Author]?

    /// The full catalog index, decoded once and kept in memory (docs/data/manifest.md).
    private(set) lazy var manifest: [ManifestEntry] = loadManifest()

    /// Shared tier-1 fuzzy searcher (docs/screens/search.md), built once over the Manifest + derived
    /// author names. Lazy so the one-time index build (and the `authors()` scan it triggers) is
    /// deferred until the reader first searches, then reused across every `SearchViewModel`.
    private(set) lazy var songSearcher: SongSearcher = FuzzySongSearcher(
        entries: manifest,
        authorName: { [unowned self] uid in self.authorDisplayName(forUid: uid) }
    )

    init(bundle: Bundle = .main) {
        self.bundle = bundle
    }

    // MARK: - Manifest / lists

    private func loadManifest() -> [ManifestEntry] {
        guard let url = bundle.url(forResource: "manifest", withExtension: "json") else {
            assertionFailure("manifest.json not found in the app bundle — was the corpus copied into gk-ios/Resources/songs/ and added to the target?")
            return []
        }
        do {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode([ManifestEntry].self, from: data)
        } catch {
            assertionFailure("Failed to decode manifest.json: \(error)")
            return []
        }
    }

    /// `manifest` keyed by uid, built once on first use. Backs `manifestEntry(uid:)` so a
    /// per-redraw lookup (the mini-player's resting state resolves the persisted
    /// `player.lastVisitedSongUid` on every body evaluation) is a dictionary hit rather than a
    /// linear scan of the whole catalog.
    ///
    /// Duplicate uids keep the first entry instead of trapping: manifest.md requires uids to be
    /// unique and `SongRepositoryTests` asserts it, but a malformed file must degrade, never crash
    /// (which `Dictionary(uniqueKeysWithValues:)` would).
    private lazy var manifestByUid: [String: ManifestEntry] =
        Dictionary(manifest.map { ($0.uid, $0) }, uniquingKeysWith: { first, _ in first })

    /// The lightweight catalog entry for `uid`, or `nil` if it isn't in the corpus.
    ///
    /// The cheap counterpart to `song(uid:)`: enough to render a title/author row without decoding
    /// verses (manifest.md "Purpose"). Used by the mini-player's resting state to rehydrate the
    /// persisted last-visited uid (player.md v15) — a uid that has since left the corpus resolves
    /// to `nil` and the slot goes absent.
    func manifestEntry(uid: String) -> ManifestEntry? {
        manifestByUid[uid]
    }

    // MARK: - Song detail

    /// Loads (and caches) the full `Song` for `uid`. Returns `nil` if the song isn't bundled or
    /// fails to decode — callers must handle the missing case gracefully (no crash, no placeholder
    /// song).
    func song(uid: String) -> Song? {
        if let cached = songCache[uid] { return cached }
        guard let data = songData(uid: uid) else { return nil }
        do {
            let song = try JSONDecoder().decode(Song.self, from: data)
            songCache[uid] = song
            return song
        } catch {
            assertionFailure("Failed to decode song \(uid).json: \(error)")
            return nil
        }
    }

    private func songData(uid: String) -> Data? {
        guard let url = bundle.url(forResource: uid, withExtension: "json") else { return nil }
        return try? Data(contentsOf: url)
    }

    // MARK: - Authors (derived; docs/data/author.md v1 "Platform notes")
    //
    // "No standalone authors dataset ships... each platform derives the Author catalog at runtime
    // by scanning the songs (one representative per distinct author_uid)." About half of this
    // corpus's `author_uid` values are short codes with a real `author_display` (e.g. "ldt"); the
    // other half use the author's full native-script name *as* the `author_uid`, with an always-
    // empty `author_display` — for those, author.md says to fall back to the `author_uid` string
    // itself as the display name (which `Author.name`'s own fallback already does once such an
    // Author exists — the seeding step below is what makes sure one exists for every uid, not just
    // the ones with a populated `author_display`).
    //
    // Every distinct `author_uid` is seeded straight from the (already in-memory) Manifest — no file
    // I/O needed for that part. We then do at most one bundled-file read per distinct uid to
    // opportunistically pick up a real `author_display` where one exists, via a minimal `AuthorProbe`
    // decode rather than a full `Song` (skipping verses/translations/word-to-words, the bulk of each
    // file's payload). Result is cached after the first call.
    func authors() -> [Author] {
        if let cached = authorsCache { return cached }
        var displayByUid: [String: [ScriptText]] = [:]
        for entry in manifest {
            if displayByUid[entry.authorUid] == nil {
                displayByUid[entry.authorUid] = []
            }
        }
        for entry in manifest where displayByUid[entry.authorUid]?.isEmpty == true {
            guard let data = songData(uid: entry.uid),
                  let probe = try? JSONDecoder().decode(AuthorProbe.self, from: data),
                  !probe.authorDisplay.isEmpty else { continue }
            displayByUid[probe.authorUid] = probe.authorDisplay
        }
        let result = displayByUid
            .map { uid, names in Author(uid: uid, names: names) }
            .sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        authorsCache = result
        return result
    }

    /// Resolves an `author_uid` (e.g. from a `ManifestEntry`, which — per manifest.md — carries the
    /// uid only, not a display name) to the best human-readable name derived by `authors()`. Falls
    /// back to the raw uid, which for most of this corpus's authors *is* already a readable name
    /// (the pipeline used full author names as uids in many cases; only a handful, like "bt"/"ldt",
    /// are short codes).
    func authorDisplayName(forUid uid: String) -> String {
        authors().first(where: { $0.uid == uid })?.name ?? uid
    }

    // MARK: - Song groups (docs/data/collections.md)
    //
    // `song_groups.json` now ships alongside the 703 song files (generated from the Śrī Gauḍīya
    // Gīti-guccha Contents by pipeline/build_song_groups.py): 19 `book` + 74 `topic` groupings
    // over 184 distinct songs. No `collection`-kind entries ship yet (that kind stays an empty list
    // here — a user-curated concept, distinct from the songbook-derived books/topics), so
    // `CollectionsViewModel` correctly keeps showing its empty state. Decoding is best-effort: a
    // missing/malformed file degrades to `[]` per kind rather than crashing, exactly as before this
    // file existed.
    func songGroups(kind: SongGroupKind) -> [SongGroup] {
        guard let url = bundle.url(forResource: "song_groups", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let all = try? JSONDecoder().decode([SongGroup].self, from: data) else {
            return []
        }
        return all.filter { $0.kind == kind }
    }
}

/// Minimal decode target for `SongRepository.authors()` — only the two fields needed to derive an
/// author's display name, so scanning the corpus for authors doesn't pay the cost of decoding every
/// verse/translation/word-to-word in each file.
private struct AuthorProbe: Decodable {
    let authorUid: String
    let authorDisplay: [ScriptText]

    enum CodingKeys: String, CodingKey {
        case authorUid = "author_uid"
        case authorDisplay = "author_display"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        authorUid = try c.decode(String.self, forKey: .authorUid)
        authorDisplay = try c.decodeIfPresent([ScriptText].self, forKey: .authorDisplay) ?? []
    }
}
