import SwiftUI

/// Compact persistent playback chrome. The row body expands Now Playing while the trailing control
/// only changes playback, and the thin bottom rail is intentionally non-interactive.
struct MiniPlayerView: View {
    @EnvironmentObject private var player: AudioPlayerService
    @EnvironmentObject private var settings: ReaderSettings

    var body: some View {
        if let song = player.currentSong {
            HStack(spacing: 8) {
                Button(action: { player.isExpanded = true }) {
                    HStack(spacing: 11) {
                        miniArtwork

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

                        Spacer(minLength: 4)
                    }
                    .contentShape(Rectangle())
                }
                .buttonStyle(PlainButtonStyle())
                .accessibilityLabel("Open Now Playing for \(song.title(inScript: settings.scriptCode))")

                trailingControl
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .frame(height: 56)
            .background(Color.backgroundOffset)
            .overlay(Divider(), alignment: .top)
            .overlay(miniProgress, alignment: .bottom)
        }
    }

    @ViewBuilder
    private var miniArtwork: some View {
        if let uid = player.currentTrack?.uid,
           let url = ImageConfig.artistPortraitURL(forTrackUid: uid) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                case .empty, .failure:
                    miniArtworkFallback
                @unknown default:
                    miniArtworkFallback
                }
            }
            .frame(width: 40, height: 40)
            .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
        } else {
            miniArtworkFallback
                .frame(width: 40, height: 40)
                .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
        }
    }

    private var miniArtworkFallback: some View {
        ZStack {
            Color.highlight.opacity(0.14)
            Image("mridanga")
                .resizable()
                .scaledToFit()
                .padding(6)
        }
    }

    private var miniProgress: some View {
        GeometryReader { proxy in
            let progress = CGFloat(
                player.duration > 0
                    ? min(max(player.currentTime / player.duration, 0), 1)
                    : 0
            )
            ZStack(alignment: .leading) {
                Color.neutral.opacity(0.18)
                Color.highlight
                    .frame(width: proxy.size.width * progress)
            }
        }
        .frame(height: 2)
        .accessibilityHidden(true)
    }

    private var subtitle: String {
        if case .error = player.state { return "Audio unavailable" }
        if let artist = player.currentTrack?.artist { return artist }
        return player.currentSong?.author(inScript: settings.scriptCode) ?? ""
    }

    @ViewBuilder
    private var trailingControl: some View {
        switch player.state {
        case .loading:
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: Color.neutral))
                .frame(width: 40, height: 40)
                .accessibilityLabel("Loading audio")
        case .error:
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 18))
                .foregroundColor(Color.neutral)
                .frame(width: 40, height: 40)
                .accessibilityLabel("Audio unavailable")
        case .idle, .playing, .paused:
            Button(action: player.togglePlayPause) {
                Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(Color("onHighlight"))
                    .frame(width: 40, height: 40)
                    .background(Color.highlight, in: Circle())
            }
            .buttonStyle(PlainButtonStyle())
            .accessibilityLabel(player.isPlaying ? "Pause" : "Play")
        }
    }
}
