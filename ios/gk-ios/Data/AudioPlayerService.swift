import Foundation
import AVFoundation

/// Playback state machine (docs/screens/player.md "States": idle, loading, playing, paused,
/// error/unreachable).
enum AudioPlayerState: Equatable {
    case idle
    case loading
    case playing
    case paused
    /// Clean, never-crash failure state (player.md "Playback still degrades gracefully on any load
    /// failure ... clear 'audio unavailable' state"). The associated message is shown as-is by the
    /// UI, so keep it short and user-facing.
    case error(String)
}

/// Global, app-wide playback service (docs/screens/player.md "a global playback service, not
/// per-screen state"). Backed by `AVPlayer`; a single shared instance is injected into the view
/// tree via `.environmentObject` at the app root (`AppNavigation`) so playback — and the mini-player
/// — survive navigation instead of being torn down per screen. The song-detail play button and the
/// Now Playing (`PlayerView`) screen both read/drive this same instance.
///
/// Streaming only in this slice (player.md "Per-platform notes" — "Offline download of tracks is a
/// later enhancement").
final class AudioPlayerService: ObservableObject {
    static let shared = AudioPlayerService()

    // MARK: - Published state

    @Published private(set) var state: AudioPlayerState = .idle
    @Published private(set) var currentSong: Song?
    @Published private(set) var currentTrack: AudioTrack?
    @Published private(set) var currentTime: TimeInterval = 0
    @Published private(set) var duration: TimeInterval = 0

    /// Drives the full "Now Playing" presentation (player.md "song-detail play button → start this
    /// song's track + open/raise the player"; also the mini-player's tap-to-expand). A view anywhere
    /// in the tree can raise/lower the player by toggling this on the shared instance.
    @Published var isExpanded = false

    /// Hides the mini-player bar without touching playback (player.md **v14** "The reader gets a
    /// pill, not a bar" + song-detail.md v7).
    ///
    /// The bar is mounted on the root `TabView` via `.safeAreaInset(edge: .bottom)`, so a pushed
    /// screen cannot remove a *parent's* inset — it publishes the intent here instead and
    /// `AppNavigation` gates the inset on it (player.md "Per-platform notes — iOS": "song-detail
    /// suppresses it through a published flag on the player service (set on appear, cleared on
    /// disappear) rather than by trying to remove a parent's inset"). Suppression is a property of
    /// the *screen*, never of playback: `close()` deliberately leaves it alone, and leaving
    /// song-detail by any route restores the bar with playback untouched.
    @Published var isMiniPlayerSuppressed = false

    /// Shuffle over the song's takes (player.md v14 "Shuffle and repeat operate over the song's
    /// takes, the only queue mobile has"). See `playOrder`.
    @Published private(set) var shuffle = false

    /// `off` / `all` / `one` (player.md v14 repeat table). Applied at end-of-take by
    /// `TakeQueue.resolveTakeEndAction`.
    @Published private(set) var repeatMode: RepeatMode = .off

    /// Fixes the shuffled permutation for the session, so `playOrder` is stable across recomputes
    /// (a listener must not get a different "next" every time the view redraws). Re-rolled each
    /// time shuffle is turned on, so toggling it off and on again reshuffles.
    private var shuffleSeed: UInt64 = 0

    // MARK: - Derived

    var isPlaying: Bool { state == .playing }

    /// Whether a song has been loaded into the player — distinct from `idle`, which also covers the
    /// initial no-song-loaded state. True in the `.error` state too: a failed take still names its
    /// song (see `play(song:track:)`).
    ///
    /// No longer gates the mini-player: as of player.md **v15** the bar also has a *resting* state
    /// with nothing loaded, so visibility is decided by `resolveMiniPlayerSlot` instead.
    var hasActiveTrack: Bool { currentSong != nil }

    /// The current song's recordings, for the take/artist picker (player.md "Data bindings" —
    /// "support a list for the future"; "allow choosing take/artist if multiple").
    var availableTracks: [AudioTrack] { currentSong?.audioFiles ?? [] }

    /// The uids of the current song's takes in the order they play — listed order, or the
    /// deterministic shuffled permutation when `shuffle` is on (player.md v14). Derived rather than
    /// stored so it can never drift out of sync with the loaded song; it is at most ~9 elements, so
    /// recomputing it is free.
    var playOrder: [String] {
        TakeQueue.playOrder(
            takeUids: availableTracks.map { $0.uid },
            shuffle: shuffle,
            seed: shuffleSeed
        )
    }

    // MARK: - AVPlayer internals

    private var player: AVPlayer?
    private var timeObserverToken: Any?
    private var statusObservation: NSKeyValueObservation?
    private var endObserver: NSObjectProtocol?
    private var failureObserver: NSObjectProtocol?

    private init() {}

    // MARK: - Playback control

    /// Starts playing `song`'s `track` (defaults to `audio_files[0]` per player.md "Data bindings").
    /// Re-invoking with the song/track that's already loaded resumes rather than reloading it, so
    /// repeated taps on the same play affordance are cheap and don't restart the stream.
    func play(song: Song, track: AudioTrack? = nil) {
        guard let track = track ?? song.audioFiles.first else {
            // Nothing to play (a song whose `audio_available` disagrees with an empty
            // `audio_files`). The song is still *loaded* as far as the UI is concerned — the reader
            // tapped play on it, so the mini-player and the song-detail pill must name it beside
            // "Audio unavailable" rather than silently keep showing whatever was there before
            // (player.md v15: a loaded song holds the mini-player slot in every state, `.error`
            // included, and `resolveMiniPlayerSlot` keys off `currentSong`). Setting it here also
            // keeps `hasActiveTrack` honest.
            teardownPlayer()
            currentSong = song
            currentTrack = nil
            currentTime = 0
            duration = 0
            state = .error("Audio unavailable")
            return
        }
        let sameTrackAlreadyLoaded = currentSong?.uid == song.uid && currentTrack?.uid == track.uid
        if sameTrackAlreadyLoaded, player != nil, state == .playing || state == .paused {
            resume()
            return
        }
        load(song: song, track: track)
    }

    private func load(song: Song, track: AudioTrack) {
        teardownPlayer()
        currentSong = song
        currentTrack = track
        currentTime = 0
        duration = 0

        guard let url = AudioConfig.playableURL(for: track) else {
            state = .error("Audio unavailable")
            return
        }

        state = .loading
        let item = AVPlayerItem(url: url)
        let newPlayer = AVPlayer(playerItem: item)
        player = newPlayer

        // AVPlayerItem KVO doesn't guarantee delivery on the main thread — hop explicitly before
        // touching @Published state (SwiftUI requires main-thread mutation).
        statusObservation = item.observe(\.status, options: [.new]) { [weak self] observedItem, _ in
            DispatchQueue.main.async {
                self?.handleStatusChange(observedItem.status)
            }
        }

        failureObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemFailedToPlayToEndTime, object: item, queue: .main
        ) { [weak self] _ in
            self?.state = .error("Audio unavailable")
        }

        endObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime, object: item, queue: .main
        ) { [weak self] _ in
            self?.handlePlaybackEnded()
        }

        let interval = CMTime(seconds: 0.25, preferredTimescale: 600)
        timeObserverToken = newPlayer.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            guard let self, self.state == .playing || self.state == .paused else { return }
            self.currentTime = time.seconds
        }

        newPlayer.play()
    }

    private func handleStatusChange(_ status: AVPlayerItem.Status) {
        switch status {
        case .readyToPlay:
            if let seconds = player?.currentItem?.duration.seconds, seconds.isFinite {
                duration = seconds
            }
            state = .playing
        case .failed:
            state = .error("Audio unavailable")
        case .unknown:
            break
        @unknown default:
            break
        }
    }

    /// End of take — the decision itself lives in the pure `TakeQueue.resolveTakeEndAction`
    /// (player.md v14: "Keep this decision in a pure, unit-tested function with no
    /// `AVPlayer`/`MediaPlayer` in sight"). This method only *performs* the returned action.
    private func handlePlaybackEnded() {
        let action = TakeQueue.resolveTakeEndAction(
            repeatMode: repeatMode,
            shuffle: shuffle,
            order: playOrder,
            currentTrackUid: currentTrack?.uid ?? ""
        )
        switch action {
        case .replay:
            replayCurrentTake()
        case .play(let trackUid):
            // A one-take song under `repeat all` wraps onto itself — that's a replay, not a
            // reload: `play(song:track:)` would take its already-loaded fast path and `resume()` a
            // player parked at the end, which plays nothing.
            guard trackUid != currentTrack?.uid else {
                replayCurrentTake()
                return
            }
            guard let song = currentSong,
                  let track = song.audioFiles.first(where: { $0.uid == trackUid })
            else {
                stopAtEndOfTake()
                return
            }
            load(song: song, track: track)
        case .stop:
            stopAtEndOfTake()
        }
    }

    /// Rewinds the loaded take and keeps playing (repeat-one, and the wrap-onto-self case).
    private func replayCurrentTake() {
        player?.seek(to: .zero)
        currentTime = 0
        resume()
    }

    /// Rewinds to the start and parks in `paused` — the pre-v14 behavior, now only the `.stop`
    /// branch, so the take stays loaded and re-playable.
    private func stopAtEndOfTake() {
        player?.seek(to: .zero)
        currentTime = 0
        state = .paused
    }

    /// Toggles play/pause on the currently loaded track. No-op while `loading` or `error` — those
    /// states hide/disable the play/pause affordance in the UI.
    func togglePlayPause() {
        guard let player else { return }
        switch state {
        case .playing:
            player.pause()
            state = .paused
        case .paused:
            resume()
        case .idle, .loading, .error:
            break
        }
    }

    private func resume() {
        player?.play()
        state = .playing
    }

    /// Seeks to an absolute position, clamped to `[0, duration]`. Used by the scrubber.
    func seek(to seconds: TimeInterval) {
        guard let player, duration > 0 else { return }
        let clamped = max(0, min(seconds, duration))
        player.seek(to: CMTime(seconds: clamped, preferredTimescale: 600))
        currentTime = clamped
    }

    // MARK: - Take/artist selection (player.md "Data bindings" — "allow choosing take/artist if
    // multiple"; skip controls step between takes rather than a generic seek, per player.md "skip
    // controls (dormant until multi-recording)").

    /// Switches to a specific recording of the currently loaded song (the take/artist picker).
    func selectTrack(_ track: AudioTrack) {
        guard let song = currentSong else { return }
        play(song: song, track: track)
    }

    /// Past this many seconds into a take, "previous" restarts it instead of stepping back
    /// (player.md v14 — "previous restarts the current take when more than ~3 s in, matching the
    /// universal convention").
    private static let restartThreshold: TimeInterval = 3

    /// Restarts the current take when more than ~3 s in; otherwise steps to the previous recording
    /// in the current play order. Unlike `nextTrack()` this is meaningful on single-take songs, so
    /// the UI keeps it enabled.
    func previousTrack() {
        if duration > 0, currentTime > Self.restartThreshold {
            seek(to: 0)
            return
        }
        step(by: -1)
    }

    /// Steps to the next recording of the same song, in the current play order (shuffled when
    /// `shuffle` is on). Wraps. Dormant (no-op) unless the song has more than one take.
    func nextTrack() { step(by: 1) }

    /// Manual transport always wraps — reaching the last take and pressing "next" returns to the
    /// first, independently of `repeatMode`, which only governs what happens *unattended* at the
    /// end of a take.
    private func step(by delta: Int) {
        guard let song = currentSong, let current = currentTrack, song.audioFiles.count > 1 else {
            return
        }
        guard let uid = TakeQueue.neighbor(
            order: playOrder,
            currentTrackUid: current.uid,
            delta: delta,
            wrap: true
        ), let track = song.audioFiles.first(where: { $0.uid == uid }) else { return }
        selectTrack(track)
    }

    // MARK: - Shuffle & repeat (player.md v14)

    /// Flips shuffle, re-rolling the permutation each time it is switched on. Turning it off
    /// restores the listed order from wherever playback currently is, since `playOrder` is derived.
    func toggleShuffle() {
        shuffle.toggle()
        if shuffle { shuffleSeed = UInt64.random(in: UInt64.min...UInt64.max) }
    }

    /// Cycles `off → all → one → off` (player.md v14 repeat table).
    func cycleRepeatMode() {
        switch repeatMode {
        case .off: repeatMode = .all
        case .all: repeatMode = .one
        case .one: repeatMode = .off
        }
    }

    /// Fully dismisses the player — stops playback and clears the mini-player. Distinct from
    /// collapsing the Now Playing sheet (`isExpanded = false`), which leaves playback running.
    func close() {
        teardownPlayer()
        currentSong = nil
        currentTrack = nil
        currentTime = 0
        duration = 0
        state = .idle
        isExpanded = false
    }

    private func teardownPlayer() {
        if let timeObserverToken, let player {
            player.removeTimeObserver(timeObserverToken)
        }
        timeObserverToken = nil
        statusObservation?.invalidate()
        statusObservation = nil
        if let failureObserver { NotificationCenter.default.removeObserver(failureObserver) }
        if let endObserver { NotificationCenter.default.removeObserver(endObserver) }
        failureObserver = nil
        endObserver = nil
        player?.pause()
        player = nil
    }
}
