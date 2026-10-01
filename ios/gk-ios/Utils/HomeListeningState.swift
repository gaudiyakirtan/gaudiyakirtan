import Foundation

/// A projection of the shared player, never a second playback session. A loaded song/take wins
/// over Home's initial recording, including when another screen changes the take or reports error.
struct HomeListeningState {
    let song: Song?
    let track: AudioTrack?
    let state: AudioPlayerState
    let elapsed: TimeInterval
    let duration: TimeInterval

    init(fallbackSong: Song?, currentSong: Song?, currentTrack: AudioTrack?,
         state: AudioPlayerState, currentTime: TimeInterval, duration: TimeInterval) {
        let hasCurrent = currentSong != nil && currentTrack != nil
        song = hasCurrent ? currentSong : fallbackSong
        track = hasCurrent ? currentTrack : fallbackSong?.audioFiles.first
        self.state = hasCurrent ? state : .idle
        self.duration = hasCurrent && duration.isFinite ? max(0, duration) : 0
        let time = hasCurrent && currentTime.isFinite ? max(0, currentTime) : 0
        elapsed = self.duration > 0 ? min(time, self.duration) : time
    }

    var progress: Double { duration > 0 ? elapsed / duration : 0 }

    var status: String {
        switch state {
        case .idle: return "Ready to listen"
        case .loading: return "Loading audio"
        case .playing: return "Playing"
        case .paused: return "Paused"
        case .error: return "Audio unavailable"
        }
    }

    var actionName: String {
        switch state {
        case .playing: return "Pause"
        case .loading: return "Loading"
        case .error: return "Retry"
        case .idle, .paused: return "Play"
        }
    }

    static func formatTime(_ seconds: TimeInterval) -> String {
        guard seconds.isFinite, seconds > 0 else { return "0:00" }
        // Bound conversion even for malformed timing metadata.
        let whole = Int(min(seconds, 359_999))
        return "\(whole / 60):\(String(format: "%02d", whole % 60))"
    }
}
