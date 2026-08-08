import SwiftUI

/// The "Now Playing" screen (docs/screens/player.md **v14** — Figma frames `Now Playing`/`Player`).
///
/// A **modal**, not a pushed destination (player.md v14: "It is a transient surface over whatever
/// you were reading, and it must return you there untouched: dismissing it never stops playback and
/// never pops the reader"). `AppNavigation` presents it as a `.sheet` bound to
/// `AudioPlayerService.isExpanded`, so it can be raised from the now-playing pill on song-detail or
/// by tapping the mini-player anywhere else.
///
/// Layout follows player.md v14's "large artwork, big transport" list, top to bottom: dismiss
/// affordance + context caption · square artwork · title + **reciter** · scrubber showing
/// **elapsed / remaining** · a five-control transport row (shuffle · previous · play · next ·
/// repeat) · an actions row (takes · share · queue).
///
/// Reads and drives the single shared `AudioPlayerService` — it never owns playback state
/// (player.md "a global playback service, not per-screen state"), and every decision about what
/// plays next lives in `TakeQueue`, not here.
struct PlayerView: View {
    @EnvironmentObject private var player: AudioPlayerService
    @EnvironmentObject private var settings: ReaderSettings

    /// Local scrub state so a manual drag isn't fought over by the periodic `currentTime` updates
    /// from `AudioPlayerService` — standard SwiftUI slider-over-a-ticking-value pattern. While
    /// dragging, both time labels read from `scrubValue`, so the elapsed label follows the thumb
    /// and the seek is committed on release (player.md v14 item 4).
    @State private var isScrubbing = false
    @State private var scrubValue: TimeInterval = 0

    /// The actions row's queue panel — the song's takes in the order they will actually play
    /// (shuffle-aware). Collapsed by default; the artwork owns the screen.
    @State private var showQueue = false

    /// Transient confirmation for the share action (see `copyShareLink`).
    @State private var didCopyLink = false

    var body: some View {
        ZStack {
            Color.background.edgesIgnoringSafeArea(.all)

            if let song = player.currentSong {
                content(song: song)
            } else {
                // Defensive fallback — the sheet should only be raised once a song is loaded, but
                // never shows a blank screen if it somehow is.
                EmptyStateView(systemImage: "music.note", title: "Nothing playing")
            }
        }
    }

    private func content(song: Song) -> some View {
        VStack(spacing: 0) {
            sheetHeader(song: song)

            ScrollView(showsIndicators: false) {
                VStack(spacing: 22) {
                    artwork
                    titleBlock(song: song)
                    transportSection
                    actionsRow

                    if showQueue {
                        queuePanel
                    }
                }
                .padding(.horizontal, 28)
                .padding(.top, 12)
                .padding(.bottom, 36)
            }
        }
    }

    // MARK: - 1. Dismiss affordance + context caption

    /// The grab handle, a dismiss chevron, and the uppercase "playing from" caption over the song
    /// title in small type (player.md v14 item 1).
    ///
    /// The handle is drawn here rather than asked for with `.presentationDragIndicator(.visible)`,
    /// which is iOS 16+ while this target ships iOS 15.6 — a hand-drawn capsule needs no
    /// availability fork and matches the themed tokens. Collapsing keeps playback running; that is
    /// deliberately *not* `AudioPlayerService.close()`.
    private func sheetHeader(song: Song) -> some View {
        VStack(spacing: 10) {
            Capsule()
                .fill(Color.neutral.opacity(0.4))
                .frame(width: 36, height: 5)

            ZStack {
                VStack(spacing: 2) {
                    // The queue mobile has is the song's own takes, so the source is always the
                    // song itself (player.md v14: "or the book/topic when a collection queue
                    // exists" — mobile has no collection queue yet).
                    Text("PLAYING FROM SONG")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(Color.neutral)
                    Text(song.title(inScript: settings.listLanguage))
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(Color("primaryText"))
                        .lineLimit(1)
                }
                .padding(.horizontal, 48)

                HStack {
                    Button(action: { player.isExpanded = false }) {
                        Image(systemName: "chevron.down")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(Color.neutral)
                            .frame(width: 34, height: 34)
                    }
                    .buttonStyle(PlainButtonStyle())
                    Spacer()
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 10)
    }

    // MARK: - 2. Artwork

    /// A large rounded square, as wide as the sheet minus the content margin (player.md v14 item 2)
    /// — sized by `aspectRatio(1, contentMode: .fit)` rather than a fixed point size, so it scales
    /// with the device instead of stranding a small tile in the middle of a big screen.
    ///
    /// Songs carry no image field (song.md), but the current recording's performing artist may have
    /// a portrait on the bucket (`artists/<artist_code>.jpg`). **Most codes 404, and that is the
    /// normal case, not an error** — the placeholder is the themed surface fill plus a note glyph,
    /// deliberate-looking rather than a broken-image slot, and never a fake/stock photo (browse.md's
    /// "never placeholder/fake rows" applied to imagery).
    private var artwork: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.backgroundOffset)

            if let uid = player.currentTrack?.uid,
               let url = ImageConfig.artistPortraitURL(forTrackUid: uid) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    artworkGlyph
                }
            } else {
                artworkGlyph
            }
        }
        .aspectRatio(1, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }

    private var artworkGlyph: some View {
        Image(systemName: "music.note")
            .font(.system(size: 64))
            .foregroundColor(Color.neutral.opacity(0.5))
    }

    // MARK: - 3. Title / credit

    private func titleBlock(song: Song) -> some View {
        VStack(spacing: 6) {
            Text(song.title(inScript: settings.listLanguage))
                .font(.system(size: 26, weight: .bold))
                .foregroundColor(Color("primaryText"))
                .multilineTextAlignment(.center)

            Text(reciterCredit(song: song))
                .font(.system(size: 16))
                .foregroundColor(Color.neutral)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }

    /// The credit under the title is the **reciter** — the artist of the loaded take — not the
    /// composer (player.md v14 item 3 + tracks.md "reciter vs author"). The composer is the
    /// fallback, for the many takes that carry no artist.
    private func reciterCredit(song: Song) -> String {
        if let artist = player.currentTrack?.artist, !artist.isEmpty { return artist }
        return song.author(inScript: settings.listLanguage)
    }

    // MARK: - 4 & 5. Scrubber + transport

    /// The error state keeps the whole layout (header, artwork, title, actions) and replaces only
    /// the scrubber/transport with the "audio unavailable" message, "so a failed take doesn't
    /// collapse the screen" (player.md v14 "States").
    @ViewBuilder
    private var transportSection: some View {
        if case .error(let message) = player.state {
            errorNotice(message)
        } else {
            VStack(spacing: 18) {
                scrubber
                transportRow
            }
        }
    }

    private func errorNotice(_ message: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: "wifi.slash")
                .font(.system(size: 28))
                .foregroundColor(Color.neutral.opacity(0.6))
            Text(message)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(Color("primaryText"))
            Text("This recording couldn't be loaded. Try another take, or check your connection.")
                .font(.system(size: 13))
                .foregroundColor(Color.neutral)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
    }

    private var scrubber: some View {
        VStack(spacing: 6) {
            Slider(
                value: Binding(
                    get: { displayTime },
                    set: { scrubValue = $0 }
                ),
                in: 0...max(player.duration, 0.01),
                onEditingChanged: { editing in
                    // Seed the drag from the live position, so the thumb doesn't jump to a stale
                    // value before the first `set` arrives.
                    if editing { scrubValue = player.currentTime }
                    isScrubbing = editing
                    if !editing { player.seek(to: scrubValue) }
                }
            )
            .tint(Color.highlight)
            .disabled(player.duration <= 0)

            HStack {
                Text(formatTime(displayTime))
                Spacer()
                // Remaining, not total (player.md v14 item 4: "it answers the question a listener
                // actually has").
                Text(remainingLabel)
            }
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(Color.neutral)
        }
    }

    /// Five controls on one line (player.md v14 item 5). Shuffle and repeat render **muted but not
    /// disabled** on single-take songs, and previous/next stay in place, so the row never reflows
    /// between songs.
    private var transportRow: some View {
        HStack(spacing: 0) {
            shuffleButton
            Spacer(minLength: 0)
            // Previous is meaningful even on a single-take song: past ~3 s it restarts the take.
            transportButton("backward.end.fill", action: player.previousTrack)
            Spacer(minLength: 0)
            playPauseButton
            Spacer(minLength: 0)
            transportButton("forward.end.fill", action: player.nextTrack)
                .opacity(hasMultipleTakes ? 1 : 0.4)
            Spacer(minLength: 0)
            repeatButton
        }
    }

    private func transportButton(_ systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 24))
                .foregroundColor(Color("primaryText"))
                .frame(width: 48, height: 48)
        }
        .buttonStyle(PlainButtonStyle())
    }

    private var shuffleButton: some View {
        Button(action: player.toggleShuffle) {
            Image(systemName: "shuffle")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(player.shuffle ? Color.highlight : Color.neutral)
                .frame(width: 44, height: 44)
        }
        .buttonStyle(PlainButtonStyle())
        .opacity(hasMultipleTakes ? 1 : 0.4)
    }

    /// Repeat's glyph carries its three states: `repeat` for off/all (tinted only when on) and
    /// `repeat.1` for one (player.md v14 repeat table).
    private var repeatButton: some View {
        Button(action: player.cycleRepeatMode) {
            Image(systemName: player.repeatMode == .one ? "repeat.1" : "repeat")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(player.repeatMode == .off ? Color.neutral : Color.highlight)
                .frame(width: 44, height: 44)
        }
        .buttonStyle(PlainButtonStyle())
        .opacity(hasMultipleTakes || player.repeatMode != .off ? 1 : 0.4)
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
                        .font(.system(size: 28))
                        .foregroundColor(Color("onHighlight"))
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(player.state == .loading)
    }

    // MARK: - 6. Actions row

    private var actionsRow: some View {
        HStack(spacing: 0) {
            takePicker
            Spacer(minLength: 0)
            shareButton
            Spacer(minLength: 0)
            queueButton
        }
        .padding(.top, 2)
    }

    /// The take/recordings picker, labelled with the take count (player.md v14 item 6; "Data
    /// bindings" — "expose a take/artist selector when > 1"). It stays present, showing `1`, on
    /// single-take songs so the row doesn't reflow.
    private var takePicker: some View {
        Menu {
            ForEach(player.availableTracks, id: \.uid) { track in
                Button {
                    player.selectTrack(track)
                } label: {
                    if track.uid == player.currentTrack?.uid {
                        Label(takeLabel(track), systemImage: "checkmark")
                    } else {
                        Text(takeLabel(track))
                    }
                }
            }
        } label: {
            actionLabel(systemImage: "list.bullet", text: "\(player.availableTracks.count)")
        }
        .disabled(player.availableTracks.isEmpty)
    }

    /// Share copies the take's public stream URL to the pasteboard. Deliberately *not* `ShareLink`,
    /// which is iOS 16+ while this target ships iOS 15.6; a deep link into the app (web's
    /// `/songs/<uid>?play=<take>`) waits until iOS has a URL scheme to hand out.
    private var shareButton: some View {
        Button(action: copyShareLink) {
            actionLabel(
                systemImage: didCopyLink ? "checkmark" : "square.and.arrow.up",
                text: didCopyLink ? "Copied" : nil
            )
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(player.currentTrack == nil)
    }

    private var queueButton: some View {
        Button {
            withAnimation { showQueue.toggle() }
        } label: {
            actionLabel(systemImage: "music.note.list", text: nil)
        }
        .buttonStyle(PlainButtonStyle())
    }

    private func actionLabel(systemImage: String, text: String?) -> some View {
        HStack(spacing: 6) {
            Image(systemName: systemImage).font(.system(size: 15))
            if let text {
                Text(text).font(.system(size: 13, weight: .semibold))
            }
        }
        .foregroundColor(Color.neutral)
        .padding(.horizontal, 16)
        .padding(.vertical, 9)
        .background(Color.backgroundOffset)
        .clipShape(Capsule())
    }

    /// The queue is the song's takes **in the order they will actually play** — i.e. the shuffled
    /// permutation while shuffle is on (`AudioPlayerService.playOrder`, resolved by `TakeQueue`),
    /// which is exactly what distinguishes it from the take picker's listed order.
    private var queuePanel: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(player.shuffle ? "Up next (shuffled)" : "Up next")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(Color.neutral)

            VStack(spacing: 0) {
                ForEach(orderedTakes, id: \.uid) { track in
                    Button {
                        player.selectTrack(track)
                    } label: {
                        HStack {
                            Text(takeLabel(track))
                                .font(.system(size: 14))
                                .foregroundColor(Color("primaryText"))
                            Spacer()
                            if track.uid == player.currentTrack?.uid {
                                Image(systemName: "speaker.wave.2.fill")
                                    .font(.system(size: 12))
                                    .foregroundColor(Color.highlight)
                            }
                        }
                        .padding(.vertical, 10)
                        .padding(.horizontal, 12)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(PlainButtonStyle())

                    if track.uid != orderedTakes.last?.uid {
                        Divider()
                    }
                }
            }
            .background(Color.backgroundOffset)
            .cornerRadius(12)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Derived

    private var hasMultipleTakes: Bool { player.availableTracks.count > 1 }

    /// The position both time labels and the slider read from: the thumb while dragging, the live
    /// clock otherwise.
    private var displayTime: TimeInterval {
        isScrubbing ? scrubValue : player.currentTime
    }

    private var remainingLabel: String {
        guard player.duration > 0 else { return "--:--" }
        return "-" + formatTime(max(0, player.duration - displayTime))
    }

    /// The song's takes ordered by the player's resolved play order, dropping any uid that no
    /// longer resolves to a take (defensive — the two are derived from the same array).
    private var orderedTakes: [AudioTrack] {
        player.playOrder.compactMap { uid in
            player.availableTracks.first(where: { $0.uid == uid })
        }
    }

    private func takeLabel(_ track: AudioTrack) -> String {
        track.artist ?? track.uid
    }

    // MARK: - Actions

    private func copyShareLink() {
        guard let track = player.currentTrack,
              let url = AudioConfig.playableURL(for: track) else { return }
        UIPasteboard.general.string = url.absoluteString
        didCopyLink = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.didCopyLink = false
        }
    }

    // MARK: - Formatting

    private func formatTime(_ seconds: TimeInterval) -> String {
        guard seconds.isFinite, seconds >= 0 else { return "--:--" }
        let total = Int(seconds.rounded())
        return String(format: "%d:%02d", total / 60, total % 60)
    }
}
