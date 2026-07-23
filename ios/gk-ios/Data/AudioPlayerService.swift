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

    // MARK: - Derived

    var isPlaying: Bool { state == .playing }

    /// Whether a track has been loaded (drives mini-player visibility) — distinct from `idle`, which
    /// also covers the initial no-song-loaded state.
    var hasActiveTrack: Bool { currentSong != nil }

    /// The current song's recordings, for the take/artist picker (player.md "Data bindings" —
    /// "support a list for the future"; "allow choosing take/artist if multiple").
    var availableTracks: [AudioTrack] { currentSong?.audioFiles ?? [] }

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

    private func handlePlaybackEnded() {
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

    /// Steps to the previous recording of the same song. Dormant (no-op) unless the song has more
    /// than one take — callers should also disable the affordance in that case.
    func previousTrack() { step(by: -1) }

    /// Steps to the next recording of the same song. Dormant (no-op) unless the song has more than
    /// one take.
    func nextTrack() { step(by: 1) }

    private func step(by delta: Int) {
        guard let song = currentSong, let current = currentTrack,
              song.audioFiles.count > 1,
              let index = song.audioFiles.firstIndex(where: { $0.uid == current.uid })
        else { return }
        let newIndex = (index + delta + song.audioFiles.count) % song.audioFiles.count
        selectTrack(song.audioFiles[newIndex])
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
