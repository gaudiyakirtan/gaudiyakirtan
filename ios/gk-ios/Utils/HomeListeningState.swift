import Foundation

/// A projection of the shared player for one recommendation, never a second playback session.
/// Player identity may select a take/state, but may never replace the featured song.
struct HomeListeningState {
    let song: Song?
    let track: AudioTrack?
    let state: AudioPlayerState
    let matchesFeaturedSong: Bool

    init(fallbackSong: Song?, currentSong: Song?, currentTrack: AudioTrack?, state: AudioPlayerState) {
        matchesFeaturedSong = fallbackSong != nil && currentSong?.uid == fallbackSong?.uid && currentTrack != nil
        song = fallbackSong
        track = matchesFeaturedSong ? currentTrack : fallbackSong?.audioFiles.first
        self.state = matchesFeaturedSong ? state : .idle
    }

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
        case .paused: return "Resume"
        case .loading: return "Loading audio"
        case .error: return "Retry"
        case .idle: return "Play recording"
        }
    }

    var controlSymbol: String {
        switch state {
        case .playing: return "pause.fill"
        case .loading: return "hourglass"
        case .error: return "arrow.clockwise"
        case .idle, .paused: return "play.fill"
        }
    }
}
