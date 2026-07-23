import SwiftUI

/// The "Now Playing" screen (docs/screens/player.md — Figma frames `Now Playing`/`Player`).
///
/// Presented as a sheet raised from the shared `AudioPlayerService` (`isExpanded`), so it can be
/// opened from the song-detail play button or by tapping the mini-player, and collapses back to the
/// mini-player without stopping playback. Reads/drives the single shared `AudioPlayerService`
/// instance injected at the app root — never owns its own playback state (player.md "a global
/// playback service, not per-screen state").
struct PlayerView: View {
    @EnvironmentObject private var player: AudioPlayerService
    @EnvironmentObject private var settings: ReaderSettings

    /// Local scrub state so a manual drag isn't fought over by the periodic `currentTime` updates
    /// from `AudioPlayerService` — standard SwiftUI slider-over-a-ticking-value pattern.
    @State private var isScrubbing = false
    @State private var scrubValue: TimeInterval = 0

    var body: some View {
        VStack(spacing: 0) {
            dismissHandle

            if let song = player.currentSong {
                ScrollView {
                    VStack(spacing: 24) {
                        artwork
                        titleBlock(song: song)

                        switch player.state {
                        case .error(let message):
                            EmptyStateView(
                                systemImage: "wifi.slash",
                                title: "Audio unavailable",
                                message: message
                            )
                        case .idle:
                            EmptyStateView(systemImage: "music.note", title: "Nothing playing")
                        case .loading, .playing, .paused:
                            controls
                        }

                        if player.availableTracks.count > 1 {
                            takePicker
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
            } else {
                // Defensive fallback — the sheet should only be raised once a song is loaded, but
                // never shows a blank screen if it somehow is.
                EmptyStateView(systemImage: "music.note", title: "Nothing playing")
                    .frame(maxHeight: .infinity)
            }
        }
        .background(Color.background.edgesIgnoringSafeArea(.all))
    }

    // MARK: - Dismiss handle

    /// Collapses back to the mini-player (playback keeps running) — distinct from
    /// `AudioPlayerService.close()`, which stops playback entirely.
    private var dismissHandle: some View {
        HStack {
            Spacer()
            Button(action: { player.isExpanded = false }) {
                Image(systemName: "chevron.down")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(Color.neutral)
                    .padding(12)
            }
        }
        .padding(.trailing, 8)
        .padding(.top, 8)
    }

    // MARK: - Artwork

    /// Songs carry no image field (song.md), but the current recording's performing artist may have
    /// a portrait on the bucket (docs/screens/player.md "artist portraits artists/<artist_code>.jpg").
    /// Best-effort: most codes 404, so this always falls back to the themed placeholder glyph below
    /// rather than a fake/stock image (browse.md's "never placeholder/fake rows" principle applied
    /// to imagery) — never crashes or blocks on the load.
    private var artwork: some View {
        Group {
            if let uid = player.currentTrack?.uid,
               let url = ImageConfig.artistPortraitURL(forTrackUid: uid) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 220, height: 220)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                } placeholder: {
                    artworkPlaceholder
                }
            } else {
                artworkPlaceholder
            }
        }
        .padding(.top, 8)
    }

    private var artworkPlaceholder: some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(Color.backgroundOffset)
            .frame(width: 220, height: 220)
            .overlay(
                Image(systemName: "music.note")
                    .font(.system(size: 64))
                    .foregroundColor(Color.neutral.opacity(0.5))
            )
    }

    // MARK: - Title / credit

    private func titleBlock(song: Song) -> some View {
        VStack(spacing: 6) {
            Text(song.title(inScript: settings.scriptCode))
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(Color("primaryText"))
                .multilineTextAlignment(.center)

            Text(song.author(inScript: settings.scriptCode))
                .font(.system(size: 15))
                .foregroundColor(Color.neutral)
                .multilineTextAlignment(.center)

            // Performing artist credit for this specific recording (player.md "Data bindings" —
            // "bind ... artist for the now-playing credit"), distinct from the song's author above.
            if let artist = player.currentTrack?.artist {
                Text(artist)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(Color.highlight)
                    .multilineTextAlignment(.center)
            }
        }
    }

    // MARK: - Transport controls

    private var controls: some View {
        VStack(spacing: 12) {
            scrubber

            HStack(spacing: 36) {
                Button(action: player.previousTrack) {
                    Image(systemName: "backward.end.fill")
                        .font(.system(size: 20))
                }
                .disabled(player.availableTracks.count <= 1)
                .opacity(player.availableTracks.count <= 1 ? 0.35 : 1)

                playPauseButton

                Button(action: player.nextTrack) {
                    Image(systemName: "forward.end.fill")
                        .font(.system(size: 20))
                }
                .disabled(player.availableTracks.count <= 1)
                .opacity(player.availableTracks.count <= 1 ? 0.35 : 1)
            }
            .foregroundColor(Color("primaryText"))
        }
    }

    private var playPauseButton: some View {
        Button(action: player.togglePlayPause) {
            ZStack {
                Circle()
                    .fill(Color.highlight)
                    .frame(width: 64, height: 64)

                if player.state == .loading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: Color("onHighlight")))
                } else {
                    Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 24))
                        .foregroundColor(Color("onHighlight"))
                }
            }
        }
        .disabled(player.state == .loading)
    }

    private var scrubber: some View {
        VStack(spacing: 4) {
            Slider(
                value: Binding(
                    get: { isScrubbing ? scrubValue : player.currentTime },
                    set: { scrubValue = $0 }
                ),
                in: 0...max(player.duration, 0.01),
                onEditingChanged: { editing in
                    isScrubbing = editing
                    if !editing { player.seek(to: scrubValue) }
                }
            )
            .tint(Color.highlight)
            .disabled(player.duration <= 0)

            HStack {
                Text(formatTime(isScrubbing ? scrubValue : player.currentTime))
                Spacer()
                Text(formatTime(player.duration))
            }
            .font(.system(size: 12))
            .foregroundColor(Color.neutral)
        }
    }

    // MARK: - Take / artist picker

    /// Lets the reader choose which recording plays when a song has more than one (player.md "Data
    /// bindings" — "allow choosing take/artist if multiple").
    private var takePicker: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Recordings")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(Color.neutral)

            VStack(spacing: 0) {
                ForEach(player.availableTracks, id: \.uid) { track in
                    Button(action: { player.selectTrack(track) }) {
                        HStack {
                            Text(track.artist ?? track.uid)
                                .font(.system(size: 14))
                                .foregroundColor(Color("primaryText"))
                            Spacer()
                            if track.uid == player.currentTrack?.uid {
                                Image(systemName: "checkmark")
                                    .foregroundColor(Color.highlight)
                            }
                        }
                        .padding(.vertical, 10)
                        .padding(.horizontal, 12)
                    }
                    .buttonStyle(PlainButtonStyle())

                    if track.uid != player.availableTracks.last?.uid {
                        Divider()
                    }
                }
            }
            .background(Color.backgroundOffset)
            .cornerRadius(12)
        }
        .padding(.top, 8)
    }

    // MARK: - Formatting

    private func formatTime(_ seconds: TimeInterval) -> String {
        guard seconds.isFinite, seconds >= 0 else { return "--:--" }
        let total = Int(seconds.rounded())
        return String(format: "%d:%02d", total / 60, total % 60)
    }
}
