import Foundation

/// The one persisted record behind the mini-player's resting state (docs/screens/player.md **v15**
/// — "Persistence": "One record, written when song-detail opens a song, holding the **uid only**").
///
/// **Only the uid is stored.** Title, author and `audio_available` are all rehydratable from the
/// bundled corpus via `SongRepository`, so denormalizing any of them into `UserDefaults` would just
/// create a copy that can go stale against a pipeline resync. A uid that no longer exists resolves
/// to `nil` at read time and the slot is simply absent — "a missing or unparsable record means the
/// slot is absent, never a crash".
///
/// Reading history is **device-local and never transmitted** (player.md v15), matching the posture
/// web's `utils/useRecents.ts` documents. Mobile deliberately keeps one uid rather than web's
/// 10-entry history: this surface only ever shows one song.
///
/// Shaped exactly like `ReaderSettings` — `@Published` with write-through `didSet`, a private
/// `Keys` enum, and an injectable `UserDefaults` so the persistence round-trip is unit-testable
/// against a throwaway suite instead of the shared store.
final class LastVisitedSongStore: ObservableObject {
    /// The uid of the last song opened on song-detail, or `nil` on a fresh install.
    ///
    /// `@Published`, so the mini-player picks up a newly opened song immediately — the bar must not
    /// wait for a relaunch to know where the reader has been (player.md v15).
    @Published var songUid: String? {
        didSet {
            if let songUid {
                defaults.set(songUid, forKey: Keys.songUid)
            } else {
                defaults.removeObject(forKey: Keys.songUid)
            }
        }
    }

    private let defaults: UserDefaults

    private enum Keys {
        /// player.md v15: "`UserDefaults`, key `player.lastVisitedSongUid`, alongside the existing
        /// `reader.*` keys". The `player.` prefix keeps it out of the reader's namespace — it is a
        /// player-surface record, not a reading preference.
        static let songUid = "player.lastVisitedSongUid"
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.songUid = defaults.string(forKey: Keys.songUid)
    }

    /// Records that song-detail opened `uid`. Called from `SongView.onAppear` — the single funnel
    /// every route into the reader passes through.
    ///
    /// Re-recording the same song is a no-op rather than a redundant write: SwiftUI can fire
    /// `onAppear` again for the same screen, and each assignment would otherwise publish a change
    /// and redraw the bar for nothing.
    ///
    /// It **never autoplays** (player.md v15) — this only moves the slot's *resting* content;
    /// starting a take is always an explicit tap.
    func record(uid: String) {
        guard songUid != uid else { return }
        songUid = uid
    }
}
