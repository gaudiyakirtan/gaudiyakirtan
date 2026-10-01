import SwiftUI

struct HomeListenCard: View {
    let fallbackSong: Song?
    @EnvironmentObject private var player: AudioPlayerService
    @EnvironmentObject private var settings: ReaderSettings
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var listening: HomeListeningState {
        HomeListeningState(fallbackSong: fallbackSong, currentSong: player.currentSong,
                           currentTrack: player.currentTrack, state: player.state,
                           currentTime: player.currentTime, duration: player.duration)
    }

    var body: some View {
        HomeModule(title: "Listen now", identifier: "home.listen") {
            HomeCard(surface: HomePalette.focus, border: HomePalette.focus) {
                if let song = listening.song, let track = listening.track {
                    recording(song, track: track)
                } else {
                    VStack(alignment: .leading, spacing: 20) {
                        Text("Find your next song")
                            .font(.title2)
                            .foregroundStyle(HomePalette.focusText)
                        Text("Open the library to read a song or choose a recording.")
                            .foregroundStyle(HomePalette.focusMuted)
                        HomeBrowseLink(title: "Open Library", category: .songs,
                                       foreground: HomePalette.focusText)
                    }
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(minHeight: 200, alignment: .leading)
                }
            }
        }
    }

    private func recording(_ song: Song, track: AudioTrack) -> some View {
        let title = song.title(inScript: settings.listLanguage)
        let mainLayout = dynamicTypeSize >= .xxxLarge
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 18))
            : AnyLayout(HStackLayout(alignment: .center, spacing: 18))
        return VStack(alignment: .leading, spacing: 24) {
            mainLayout {
                portrait(track)
                VStack(alignment: .leading, spacing: 6) {
                    NavigationLink(destination: SongDetailLoader(uid: song.uid)) {
                        Text(title)
                            .font(.headline.weight(.medium))
                            .foregroundStyle(HomePalette.focusText)
                            .fixedSize(horizontal: false, vertical: true)
                            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                    }
                    .buttonStyle(HomeControlStyle(surface: .clear, bordered: false))
                    .accessibilityIdentifier("home.listen.song")
                    Text(track.artist ?? song.author(inScript: settings.listLanguage))
                        .font(.subheadline)
                        .foregroundStyle(HomePalette.focusMuted)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityIdentifier("home.listen.performer")
                }
            }

            HStack(spacing: 14) {
                NavigationLink(destination: SongDetailLoader(uid: song.uid)) {
                    Image(systemName: "arrow.up.right")
                        .foregroundStyle(HomePalette.focusText)
                        .frame(width: 44, height: 44)
                }
                .buttonStyle(HomeControlStyle(cornerRadius: 22, surface: HomePalette.focusSoft,
                                              stateLayer: HomePalette.focusText, bordered: false))
                .accessibilityLabel("Open \(title)")
                .accessibilityIdentifier("home.listen.open")

                Button { activate(song, track: track) } label: {
                    Image(systemName: controlSymbol)
                        .font(.title3)
                        .foregroundStyle(HomePalette.focus)
                        .frame(width: 56, height: 56)
                        .contentTransition(.opacity)
                        .animation(HomeMotion.animation(.icon, reduceMotion: reduceMotion), value: controlSymbol)
                }
                .buttonStyle(HomeControlStyle(cornerRadius: 28, surface: HomePalette.focusText,
                                              stateLayer: HomePalette.focus, bordered: false))
                .disabled(listening.state == .loading)
                .accessibilityLabel("\(listening.actionName) \(title)")
                .accessibilityValue(listening.status)
                .accessibilityIdentifier("home.listen.toggle")

                Spacer(minLength: 0)
                Text(song.audioFiles.count == 1 ? "1 take" : "\(song.audioFiles.count) takes")
                    .font(.caption)
                    .foregroundStyle(HomePalette.focusMuted)
                    .multilineTextAlignment(.trailing)
                    .fixedSize(horizontal: false, vertical: true)
            }

            VStack(spacing: 8) {
                ProgressView(value: listening.progress)
                    .tint(HomePalette.focusText)
                    .accessibilityLabel("Playback progress")
                    .accessibilityValue(listening.duration > 0
                        ? "\(HomeListeningState.formatTime(listening.elapsed)) of \(HomeListeningState.formatTime(listening.duration))"
                        : listening.status)
                    .accessibilityIdentifier("home.listen.progress")
                HStack(alignment: .firstTextBaseline, spacing: 12) {
                    Text(HomeListeningState.formatTime(listening.elapsed))
                        .monospacedDigit()
                    Spacer(minLength: 0)
                    Text(listening.duration > 0 && listening.state != .loading && !hasError
                         ? "−\(HomeListeningState.formatTime(listening.duration - listening.elapsed))"
                         : listening.status)
                        .multilineTextAlignment(.trailing)
                }
                .font(.caption)
                .foregroundStyle(HomePalette.focusMuted)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityHidden(true)
            }
        }
        .frame(minHeight: 230, alignment: .topLeading)
    }

    private var hasError: Bool {
        if case .error = listening.state { return true }
        return false
    }

    private var controlSymbol: String {
        switch listening.state {
        case .playing: return "pause.fill"
        case .loading: return "hourglass"
        case .error: return "arrow.clockwise"
        case .idle, .paused: return "play.fill"
        }
    }

    private func activate(_ song: Song, track: AudioTrack) {
        switch listening.state {
        case .playing, .paused: player.togglePlayPause()
        case .idle, .error: player.play(song: song, track: track)
        case .loading: break
        }
    }

    private func portrait(_ track: AudioTrack) -> some View {
        AsyncImage(url: ImageConfig.artistPortraitURL(forTrackUid: track.uid)) { phase in
            if let image = phase.image {
                image.resizable().scaledToFill()
            } else {
                // Real recording identity is in the adjacent text, even offline or without a photo.
                ZStack {
                    HomePalette.focusSoft
                    Image(systemName: "music.note").font(.title).foregroundStyle(HomePalette.focusMuted)
                }
            }
        }
        .frame(width: 76, height: 76)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .accessibilityHidden(true)
    }
}
