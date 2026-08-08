import Foundation

/// Pure state resolution for the mini-player slot above the tab bar (docs/screens/player.md **v15**
/// — "The mini-player is never empty").
///
/// **Why this is a separate, `Foundation`-only file.** The whole point of v15 is a *precedence*
/// rule ("whatever is loaded in the player wins; the last-visited song only fills the slot when the
/// player is empty"), and precedence is the one part of the bar that can be verified without a
/// device or a running `AVPlayer`. Kept beside `TakeQueue` for the same reason and in the same
/// shape: no SwiftUI, no AVFoundation, every branch reachable from
/// `gk-iosTests/MiniPlayerSlotTests.swift`.
///
/// Names are kept identical across platforms (`MiniPlayerSlot`, `resolveMiniPlayerSlot`) so the
/// same concept reads the same way on Android (CLAUDE.md "Parallel structure & naming").

/// What the mini-player slot is showing right now (player.md v15 state table).
///
/// The three cases are exhaustive and mutually exclusive, so `MiniPlayerView` can `switch` over
/// them and cannot accidentally render two bars — or, as before v15, none.
enum MiniPlayerSlot: Equatable {
    /// **The track state.** A take is loaded — playing, paused, loading *or* errored — so the bar
    /// shows the loaded song, its reciter, and a play/pause transport.
    case playing(song: Song)

    /// **The resting state.** Nothing is loaded, but this song was the last one the reader opened.
    /// The bar keeps its size and position and shows the song's **author** (no take is chosen, so
    /// there is no reciter to name — see docs/screens/tracks.md "reciter vs author").
    ///
    /// - Parameter canPlay: `audio_available` for that song. `true` gives the single play
    ///   affordance that starts its first take; `false` keeps the slot but replaces that affordance
    ///   with an open-song chevron ("the reader was there, it is still the way back to it").
    case resting(song: ManifestEntry, canPlay: Bool)

    /// Nothing to show at all — a fresh install where no song has ever been opened. The only state
    /// in which the slot takes no vertical space.
    case absent
}

/// Resolves which state the mini-player slot is in, given the player and the persisted
/// last-visited song (player.md v15).
///
/// Precedence, in order:
///
/// 1. **A loaded song always wins.** It is what the reader is listening to; the resting state must
///    never displace it.
/// 2. Otherwise the **last visited song**, rehydrated from the bundled corpus — the resting state
///    "only fills the gap".
/// 3. Otherwise **absent**.
///
/// - Parameters:
///   - currentSong: `AudioPlayerService.currentSong` — non-`nil` from the moment a song is loaded,
///     **including** a play attempt that failed. `play(song:track:)` assigns it before its
///     "nothing to play" guard fires precisely so that invariant holds; without it an errored song
///     with no takes would fall through to the resting state and swap the bar's song out from
///     under the reader.
///   - state: the player's state machine. It deliberately does **not** change the outcome: a
///     loaded song holds the slot in *every* state, `.error` included, and the `currentSong`
///     invariant above is what guarantees `.error` is reachable here with a song in hand. (Android
///     spells the same rule as `nowPlaying != null || playbackState == ERROR`; that disjunction is
///     not expressible here, since `.playing` carries a non-optional `Song` — so iOS enforces it at
///     the source instead of patching it up in the resolver.) `state` is kept in the signature so
///     the call site states its intent and so the signature matches Android's — the same reason
///     `TakeQueue.resolveTakeEndAction` keeps its `shuffle` parameter.
///   - lastVisited: the `ManifestEntry` for the persisted `player.lastVisitedSongUid`, or `nil`
///     when nothing is persisted *or* the persisted uid is no longer in the corpus. Resolving it
///     to `nil` rather than trusting the stored uid is what makes a stale record degrade to an
///     absent slot instead of a crash (player.md v15 "Storage failures are swallowed").
func resolveMiniPlayerSlot(
    currentSong: Song?,
    state: AudioPlayerState,
    lastVisited: ManifestEntry?
) -> MiniPlayerSlot {
    if let currentSong {
        return .playing(song: currentSong)
    }
    if let lastVisited {
        return .resting(song: lastVisited, canPlay: lastVisited.audioAvailable)
    }
    return .absent
}
