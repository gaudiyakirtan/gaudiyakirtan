import SwiftUI

/// The compact playback bar (docs/screens/player.md — Figma frames `Track`/`trailingIcon2_`: "a
/// compact bar (title + play/pause) that can sit above the tab bar ... tappable to expand to Now
/// Playing"). Mounted once at the app root (`AppNavigation`) above the tab bar via
/// `.safeAreaInset(edge: .bottom)`, so it persists across every tab and screen — the same global
/// `AudioPlayerService` instance that plays a track keeps it visible regardless of navigation
/// (player.md "Continues while navigating (mini-player) — a global playback service").
struct MiniPlayerView: View {
    @EnvironmentObject private var player: AudioPlayerService
    @EnvironmentObject private var settings: ReaderSettings

    var body: some View {
        if let song = player.currentSong {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.neutral.opacity(0.2))
                        .frame(width: 36, height: 36)
                    Image(systemName: "music.note")
                        .font(.system(size: 14))
                        .foregroundColor(Color.neutral)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(song.title(inScript: settings.scriptCode))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color("primaryText"))
                        .lineLimit(1)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(Color.neutral)
                        .lineLimit(1)
                }

                Spacer(minLength: 8)

                trailingControl
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .frame(height: 56)
            .background(Color.backgroundOffset)
            .overlay(Divider(), alignment: .top)
            .contentShape(Rectangle())
            .onTapGesture { player.isExpanded = true }
        }
    }

    /// Artist credit for the loaded recording, falling back to the song's author, with a clear
    /// unavailable message on load failure (player.md "clear 'audio unavailable' state").
    private var subtitle: String {
        if case .error = player.state { return "Audio unavailable" }
        if let artist = player.currentTrack?.artist { return artist }
        return player.currentSong?.author(inScript: settings.scriptCode) ?? ""
    }

    /// Play/pause (`trailingIcon2_`), or a spinner while loading. A separate real `Button` (rather
    /// than folding into the row's own tap gesture) so tapping it toggles playback without also
    /// expanding to Now Playing.
    @ViewBuilder
    private var trailingControl: some View {
        switch player.state {
        case .loading:
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: Color.neutral))
                .frame(width: 28, height: 28)
        case .error:
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 18))
                .foregroundColor(Color.neutral)
                .frame(width: 28, height: 28)
        case .idle, .playing, .paused:
            Button(action: player.togglePlayPause) {
                Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: 16))
                    .foregroundColor(Color.highlight)
                    .frame(width: 28, height: 28)
            }
            .buttonStyle(PlainButtonStyle())
        }
    }
}
