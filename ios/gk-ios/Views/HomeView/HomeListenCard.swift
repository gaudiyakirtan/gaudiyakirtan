import SwiftUI

/// The one focal surface on Home; it never owns a player, progress, or recording picker.
struct HomeListenCard: View {
    let fallbackSong: Song?
    @EnvironmentObject private var player: AudioPlayerService
    @EnvironmentObject private var settings: ReaderSettings
    @State private var showPendingSymbol = false
    @ScaledMetric(relativeTo: .subheadline) private var symbolSize: CGFloat = 20

    private var listening: HomeListeningState {
        HomeListeningState(fallbackSong: fallbackSong, currentSong: player.currentSong,
                           currentTrack: player.currentTrack, state: player.state)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: HomeSpacing.md) {
            HStack(spacing: HomeSpacing.sm) {
                Text("Featured song")
                    .font(.subheadline)
                    .foregroundStyle(Color.secondaryText)
                Circle()
                    .fill(Color.highlight)
                    .frame(width: 5, height: 5)
                    .opacity(listening.state == .playing ? 1 : 0)
                    .accessibilityHidden(true)
            }
            if let song = listening.song {
                recommendation(song)
            } else {
                Text("Find your next song")
                    .font(.title2)
                    .foregroundStyle(Color.primaryText)
                Text("Open the library to read a song or choose a recording.")
                    .font(.subheadline)
                    .foregroundStyle(Color.secondaryText)
                HomeBrowseLink(title: "Open Library", category: .songs)
            }
        }
        .fixedSize(horizontal: false, vertical: true)
        .padding(HomeSpacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background {
            RoundedRectangle(cornerRadius: HomeShape.medium, style: .continuous)
                .fill(Color.backgroundOffset)
                .overlay(alignment: .trailing) {
                    HomeRhythmField()
                        .frame(width: 144)
                }
                // Only the artwork is clipped; controls' focus rings and text ink remain free.
                .clipShape(RoundedRectangle(cornerRadius: HomeShape.medium, style: .continuous))
                .accessibilityHidden(true)
                .allowsHitTesting(false)
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("home.listen")
        .task(id: pendingIdentity) {
            showPendingSymbol = false
            guard listening.state == .loading else { return }
            do {
                try await Task.sleep(for: .milliseconds(150))
                try Task.checkCancellation()
                showPendingSymbol = true
            } catch {
                // Replacing the song/take, finishing loading or leaving Home cancels the delay.
            }
        }
    }

    private func recommendation(_ song: Song) -> some View {
        VStack(alignment: .leading, spacing: HomeSpacing.lg) {
            VStack(alignment: .leading, spacing: HomeSpacing.sm) {
                Text(song.title(inScript: settings.listLanguage))
                    .font(settings.listLanguage == "Latn"
                          ? .brandDisplay(size: 28, relativeTo: .title)
                          : .title2)
                    .foregroundStyle(Color.primaryText)
                    .padding(.horizontal, HomeSpacing.xs)
                    .padding(.vertical, HomeSpacing.xxs)
                    .accessibilityIdentifier("home.listen.song")
                VStack(alignment: .leading, spacing: HomeSpacing.xs) {
                    Text(song.author(inScript: settings.listLanguage))
                        .font(.subheadline)
                        .foregroundStyle(Color.secondaryText)
                    if let artist = listening.track?.artist, !artist.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                        Text("Recording by \(artist)")
                            .font(.caption)
                            .foregroundStyle(Color.tertiaryText)
                            .accessibilityIdentifier("home.listen.performer")
                    }
                }
            }
            ViewThatFits(in: .horizontal) {
                HStack(spacing: HomeSpacing.md) {
                    readAction(song)
                    if let track = listening.track { playbackAction(song, track: track) }
                }
                .fixedSize(horizontal: true, vertical: false)
                VStack(alignment: .leading, spacing: HomeSpacing.sm) {
                    readAction(song)
                    if let track = listening.track { playbackAction(song, track: track) }
                }
            }
        }
    }

    private func readAction(_ song: Song) -> some View {
        NavigationLink(destination: SongDetailLoader(uid: song.uid)) {
            Label("Read & sing", systemImage: "book")
                .font(.headline.weight(.bold))
                .foregroundStyle(Color.background)
                .padding(.horizontal, HomeSpacing.md)
                .padding(.vertical, HomeSpacing.sm)
                .frame(minWidth: 44, minHeight: 44)
        }
        .buttonStyle(HomeControlStyle(surface: .primaryText, stateLayer: .background,
                                      bordered: false, standalone: true))
        .accessibilityLabel("Read & sing \(song.title(inScript: settings.listLanguage))")
        .accessibilityIdentifier("home.listen.open")
    }

    private func playbackAction(_ song: Song, track: AudioTrack) -> some View {
        Button { activate(song, track: track) } label: {
            HStack(spacing: HomeSpacing.sm) {
                HomeStateSymbol(name: listening.state == .loading && !showPendingSymbol
                                ? "play.fill" : listening.controlSymbol)
                    .frame(width: symbolSize, height: symbolSize)
                    .accessibilityHidden(true)
                // Every state reserves the same text geometry. At large sizes the entire group
                // reflows; loading/error never displace the primary reading action.
                ZStack(alignment: .leading) {
                    ForEach(["Play recording", "Loading audio", "Pause", "Resume", "Retry"], id: \.self) { label in
                        Text(label).hidden().accessibilityHidden(true)
                    }
                    Text(listening.actionName)
                }
            }
            .font(.subheadline.weight(.medium))
            .foregroundStyle(Color.primaryText)
            .padding(.horizontal, HomeSpacing.md)
            .padding(.vertical, HomeSpacing.sm)
            .frame(minWidth: 44, minHeight: 44)
        }
        .buttonStyle(HomeControlStyle(surface: .clear, outlined: true, standalone: true,
                                      selected: listening.matchesFeaturedSong))
        .disabled(listening.state == .loading)
        .accessibilityLabel("\(listening.actionName) \(song.title(inScript: settings.listLanguage))")
        .accessibilityValue(listening.status)
        .accessibilityAddTraits(listening.matchesFeaturedSong ? .isSelected : [])
        .accessibilityIdentifier("home.listen.toggle")
    }

    private var pendingIdentity: PendingIdentity {
        PendingIdentity(songUID: listening.song?.uid, trackUID: listening.track?.uid,
                        isLoading: listening.state == .loading)
    }

    private struct PendingIdentity: Equatable {
        let songUID: String?
        let trackUID: String?
        let isLoading: Bool
    }

    private func activate(_ song: Song, track: AudioTrack) {
        // This projection is read at activation, not retained from the preceding render.
        switch listening.state {
        case .playing, .paused: player.togglePlayPause()
        case .idle, .error: player.play(song: song, track: track)
        case .loading: break
        }
    }
}

/// A static field of equal vertical beats crossed by one arc. No audio/calendar/time input.
private struct HomeRhythmField: View {
    var body: some View {
        Canvas { context, size in
            let scale = min(size.width / 360, size.height / 240)
            context.translateBy(x: (size.width - 360 * scale) / 2,
                                y: (size.height - 240 * scale) / 2)
            context.scaleBy(x: scale, y: scale)
            var firstArc = Path()
            firstArc.move(to: CGPoint(x: 24, y: 76))
            firstArc.addCurve(to: CGPoint(x: 338, y: 90),
                              control1: CGPoint(x: 116, y: 12), control2: CGPoint(x: 240, y: 16))
            context.stroke(firstArc, with: .color(Color.highlight.opacity(0.18)),
                           style: StrokeStyle(lineWidth: 28, lineCap: .round))
            var secondArc = Path()
            secondArc.move(to: CGPoint(x: 12, y: 112))
            secondArc.addCurve(to: CGPoint(x: 356, y: 140),
                               control1: CGPoint(x: 124, y: 48), control2: CGPoint(x: 252, y: 64))
            context.stroke(secondArc, with: .color(Color.primaryText.opacity(0.08)),
                           style: StrokeStyle(lineWidth: 18, lineCap: .round))
            for x in [48, 76, 112, 168, 196, 252] {
                let beat = CGRect(x: CGFloat(x), y: 180, width: 8, height: 24)
                context.fill(Path(roundedRect: beat, cornerRadius: 4),
                             with: .color(Color.highlight.opacity(0.55)))
            }
        }
        .accessibilityHidden(true)
        .allowsHitTesting(false)
    }
}
