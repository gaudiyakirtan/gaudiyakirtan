import SwiftUI

/// The immersive native Now Playing surface. Playback remains owned by the app-wide
/// `AudioPlayerService`; this view only presents and controls that shared state.
struct PlayerView: View {
    @EnvironmentObject private var player: AudioPlayerService
    @EnvironmentObject private var settings: ReaderSettings

    @State private var isScrubbing = false
    @State private var scrubValue: TimeInterval = 0

    var body: some View {
        Group {
            if let song = player.currentSong {
                GeometryReader { proxy in
                    let contentWidth = max(proxy.size.width - 24, 0)
                    ScrollView {
                        VStack(spacing: 20) {
                            listeningStage(song: song, width: contentWidth)
                            composerCard(song: song)

                            if player.availableTracks.count > 1 {
                                takePicker
                            }
                        }
                        // A vertical ScrollView does not impose a hard content width. Constrain the
                        // stack explicitly so a long recording credit cannot widen the entire
                        // player and push the stage/header beyond the phone viewport.
                        .frame(width: contentWidth)
                        .padding(.horizontal, 12)
                        .padding(.top, 12)
                        .padding(.bottom, 40)
                    }
                }
            } else {
                EmptyStateView(systemImage: "music.note", title: "Nothing playing")
                    .frame(maxHeight: .infinity)
            }
        }
        .background(Color.background.ignoresSafeArea())
    }

    // MARK: - Listening stage

    private func listeningStage(song: Song, width: CGFloat) -> some View {
        ZStack {
            stageArtwork
                .frame(width: width, height: 620)
                .clipped()

            LinearGradient(
                stops: [
                    .init(color: Color.background.opacity(0.04), location: 0),
                    .init(color: Color.background.opacity(0.12), location: 0.38),
                    .init(color: Color.background.opacity(0.9), location: 0.68),
                    .init(color: Color.background, location: 1),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(width: width, height: 620)

            VStack(spacing: 0) {
                stageHeader
                Spacer(minLength: 220)

                VStack(spacing: 7) {
                    Text(song.title(inScript: settings.scriptCode))
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(Color("primaryText"))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                        .minimumScaleFactor(0.82)

                    if let artist = player.currentTrack?.artist {
                        Text(artist)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(Color("primaryText").opacity(0.78))
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                    }
                }
                .padding(.horizontal, 14)

                playerStateContent
                    .padding(.top, 22)
            }
            .frame(width: max(width - 36, 0), height: 584)
        }
        // Fix the stage before clipping it. An asynchronously resolved portrait otherwise keeps
        // its fill-sized layout width and can make the clipped ZStack wider than the phone.
        .frame(width: width, height: 620)
        .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .stroke(Color.neutral.opacity(0.14), lineWidth: 1)
        }
    }

    private var stageHeader: some View {
        HStack {
            Text("NOW PLAYING")
                .font(.system(size: 11, weight: .bold))
                .tracking(1.4)
                .foregroundColor(Color("primaryText"))
                .padding(.horizontal, 12)
                .frame(height: 40)
                .background(Color.backgroundOffset.opacity(0.9), in: Capsule())

            Spacer()

            Button(action: { player.isExpanded = false }) {
                Image(systemName: "chevron.down")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color("primaryText"))
                    .frame(width: 44, height: 44)
                    .background(Color.backgroundOffset.opacity(0.9), in: Circle())
            }
            .accessibilityLabel("Collapse player")
        }
    }

    @ViewBuilder
    private var stageArtwork: some View {
        if let uid = player.currentTrack?.uid,
           let url = ImageConfig.artistPortraitURL(forTrackUid: uid) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                case .empty, .failure:
                    artworkFallback
                @unknown default:
                    artworkFallback
                }
            }
        } else {
            artworkFallback
        }
    }

    private var artworkFallback: some View {
        LinearGradient(
            colors: [Color.backgroundOffset, Color.highlight.opacity(0.34), Color.background],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay {
            Image("mridanga")
                .resizable()
                .scaledToFit()
                .frame(width: 180)
                .opacity(0.8)
        }
    }

    @ViewBuilder
    private var playerStateContent: some View {
        switch player.state {
        case .error(let message):
            Label(message, systemImage: "wifi.slash")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(Color("primaryText"))
                .padding(.vertical, 18)
        case .idle:
            Label("Nothing playing", systemImage: "music.note")
                .foregroundColor(Color("primaryText"))
                .padding(.vertical, 18)
        case .loading, .playing, .paused:
            controls
        }
    }

    // MARK: - Playback

    private var controls: some View {
        VStack(spacing: 16) {
            WaveformScrubber(
                seed: player.currentTrack?.uid ?? "gaudiya-kirtan",
                value: isScrubbing ? scrubValue : player.currentTime,
                duration: player.duration,
                onPreview: { value in
                    isScrubbing = true
                    scrubValue = value
                },
                onCommit: { value in
                    scrubValue = value
                    player.seek(to: value)
                    isScrubbing = false
                }
            )

            HStack {
                Text(playerTimeString(isScrubbing ? scrubValue : player.currentTime))
                Spacer()
                Text("−\(playerTimeString(max(player.duration - (isScrubbing ? scrubValue : player.currentTime), 0)))")
            }
            .font(.system(size: 12, weight: .medium, design: .monospaced))
            .foregroundColor(Color("primaryText").opacity(0.68))

            HStack(spacing: 46) {
                takeStepButton(
                    systemImage: "backward.end.fill",
                    label: "Previous recording",
                    action: player.previousTrack
                )

                playPauseButton

                takeStepButton(
                    systemImage: "forward.end.fill",
                    label: "Next recording",
                    action: player.nextTrack
                )
            }
        }
    }

    private func takeStepButton(
        systemImage: String,
        label: String,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 21, weight: .semibold))
                .foregroundColor(Color("primaryText"))
                .frame(width: 44, height: 44)
        }
        .disabled(player.availableTracks.count <= 1)
        .opacity(player.availableTracks.count <= 1 ? 0 : 1)
        .accessibilityHidden(player.availableTracks.count <= 1)
        .accessibilityLabel(label)
    }

    private var playPauseButton: some View {
        Button(action: player.togglePlayPause) {
            ZStack {
                Circle()
                    .fill(Color.highlight)
                    .frame(width: 72, height: 72)

                if player.state == .loading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: Color("onHighlight")))
                } else {
                    Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 27, weight: .bold))
                        .foregroundColor(Color("onHighlight"))
                        .offset(x: player.isPlaying ? 0 : 2)
                }
            }
        }
        .disabled(player.state == .loading)
        .accessibilityLabel(player.isPlaying ? "Pause" : "Play")
    }

    // MARK: - Supporting information

    private func composerCard(song: Song) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "text.quote")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(Color.highlight)
                .frame(width: 40, height: 40)
                .background(Color.highlight.opacity(0.12), in: Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text("COMPOSED BY")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1.1)
                    .foregroundColor(Color.neutral)
                Text(song.author(inScript: settings.scriptCode))
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(Color("primaryText"))
                    .lineLimit(2)
            }

            Spacer()
        }
        .padding(14)
        .background(Color.backgroundOffset, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private var takePicker: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Recordings")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(Color("primaryText"))
                Spacer()
                Text("\(player.availableTracks.count)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(Color.neutral)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 5)
                    .background(Color.backgroundOffset, in: Capsule())
            }

            VStack(spacing: 0) {
                ForEach(player.availableTracks, id: \.uid) { track in
                    Button(action: { player.selectTrack(track) }) {
                        HStack(spacing: 12) {
                            Image(systemName: track.uid == player.currentTrack?.uid ? "waveform" : "music.note")
                                .foregroundColor(track.uid == player.currentTrack?.uid ? Color.highlight : Color.neutral)
                                .frame(width: 24)

                            Text(track.artist ?? track.uid)
                                .font(.system(size: 15, weight: track.uid == player.currentTrack?.uid ? .semibold : .regular))
                                .foregroundColor(Color("primaryText"))
                                .lineLimit(2)

                            Spacer()

                            if track.uid == player.currentTrack?.uid {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(Color.highlight)
                            }
                        }
                        .padding(.vertical, 12)
                        .padding(.horizontal, 14)
                    }
                    .buttonStyle(PlainButtonStyle())

                    if track.uid != player.availableTracks.last?.uid {
                        Divider().padding(.leading, 50)
                    }
                }
            }
            .background(Color.backgroundOffset, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
    }
}

/// Deterministic decorative geometry for the waveform-inspired seek rail. It deliberately does not
/// claim to represent measured amplitude: no waveform samples ship with the corpus.
struct NativePlayerWaveform {
    static func heights(seed: String, count: Int = 64) -> [CGFloat] {
        guard count > 0 else { return [] }
        var hash: UInt32 = 2_166_136_261
        for byte in seed.utf8 {
            hash ^= UInt32(byte)
            hash = hash &* 16_777_619
        }
        var state = hash == 0 ? 0x6D2B79F5 : hash
        return (0..<count).map { index in
            state ^= state << 13
            state ^= state >> 17
            state ^= state << 5
            let random = CGFloat(state % 1_000) / 1_000
            let pulse = CGFloat((index % 11) + 2) / 13
            return 0.24 + (0.76 * ((random * 0.72) + (pulse * 0.28)))
        }
    }
}

private struct WaveformScrubber: View {
    let seed: String
    let value: TimeInterval
    let duration: TimeInterval
    let onPreview: (TimeInterval) -> Void
    let onCommit: (TimeInterval) -> Void

    private let barCount = 64
    private let spacing: CGFloat = 2
    /// Height reserved under the bars for the detent ruler, so the rail's overall height is unchanged.
    private let rulerHeight: CGFloat = 14

    @StateObject private var haptics = ScrubHapticEngine()

    private var progress: CGFloat {
        guard duration.isFinite, duration > 0, value.isFinite else { return 0 }
        return CGFloat(min(max(value / duration, 0), 1))
    }

    var body: some View {
        GeometryReader { proxy in
            let heights = NativePlayerWaveform.heights(seed: seed, count: barCount)
            Canvas { context, size in
                let barsHeight = max(8, size.height - rulerHeight)
                let barWidth = max(1.5, (size.width - spacing * CGFloat(barCount - 1)) / CGFloat(barCount))
                for index in 0..<barCount {
                    let height = max(8, barsHeight * heights[index])
                    let x = CGFloat(index) * (barWidth + spacing)
                    let rect = CGRect(x: x, y: (barsHeight - height) / 2, width: barWidth, height: height)
                    let played = (x + barWidth / 2) <= size.width * progress
                    context.fill(
                        Path(roundedRect: rect, cornerRadius: barWidth / 2),
                        with: .color(played ? Color.highlight : Color.neutral.opacity(0.34))
                    )
                }

                // The detent ruler. These marks are the ladder the Taptic Engine ticks on, so what
                // sits under the finger is exactly what it feels.
                let markWidth: CGFloat = 1
                for index in 0...ScrubDetents.minor {
                    let fraction = CGFloat(index) / CGFloat(ScrubDetents.minor)
                    let isMajor = index % (ScrubDetents.minor / ScrubDetents.major) == 0
                    let markHeight: CGFloat = isMajor ? 9 : 4
                    let x = min(fraction * size.width, size.width - markWidth)
                    let rect = CGRect(x: x, y: size.height - markHeight, width: markWidth, height: markHeight)
                    let played = fraction <= progress
                    let tint = played ? Color.highlight : Color.neutral
                    context.fill(
                        Path(rect),
                        with: .color(tint.opacity(isMajor ? (played ? 0.75 : 0.42) : (played ? 0.45 : 0.24)))
                    )
                }
            }
            .accessibilityHidden(true)
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { gesture in
                        guard duration.isFinite, duration > 0 else { return }
                        let seconds = time(at: gesture.location.x, width: proxy.size.width)
                        haptics.scrub(to: seconds / duration)
                        onPreview(seconds)
                    }
                    .onEnded { gesture in
                        guard duration.isFinite, duration > 0 else {
                            haptics.end()
                            return
                        }
                        let seconds = time(at: gesture.location.x, width: proxy.size.width)
                        haptics.end()
                        onCommit(seconds)
                    }
            )
        }
        .frame(height: 72)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Playback position")
        .accessibilityValue("\(playerTimeString(value)) of \(playerTimeString(duration))")
        .accessibilityAdjustableAction { direction in
            guard duration.isFinite, duration > 0 else { return }
            let step = max(5, duration / 20)
            switch direction {
            case .increment:
                let target = min(value + step, duration)
                haptics.adjust(to: target / duration)
                onCommit(target)
            case .decrement:
                let target = max(value - step, 0)
                haptics.adjust(to: target / duration)
                onCommit(target)
            @unknown default: break
            }
        }
    }

    private func time(at x: CGFloat, width: CGFloat) -> TimeInterval {
        guard width > 0, duration.isFinite, duration > 0 else { return 0 }
        let fraction = min(max(x / width, 0), 1)
        return TimeInterval(fraction) * duration
    }
}

private func playerTimeString(_ seconds: TimeInterval) -> String {
    guard seconds.isFinite, seconds >= 0 else { return "--:--" }
    let total = Int(seconds.rounded())
    return String(format: "%d:%02d", total / 60, total % 60)
}
