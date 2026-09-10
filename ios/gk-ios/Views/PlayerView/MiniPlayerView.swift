import SwiftUI

/// The compact playback bar (docs/screens/player.md — Figma frames `Track`/`trailingIcon2_`: "a
/// compact bar (title + play/pause) that can sit above the tab bar ... tappable to expand to Now
/// Playing"). Mounted once at the app root (`AppNavigation`) above the tab bar via
/// `.safeAreaInset(edge: .bottom)`, so it persists across every tab and screen — the same global
/// `AudioPlayerService` instance that plays a track keeps it visible regardless of navigation
/// (player.md "Continues while navigating (mini-player) — a global playback service").
///
/// **player.md v15 — "The mini-player is never empty".** The bar used to exist only while a take
/// was loaded, so it appeared and vanished under the reader. It now has two states of identical
/// height, chosen by the pure `resolveMiniPlayerSlot`:
///
/// - **playing** — the pre-v15 bar: title, the take's **reciter**, play/pause.
/// - **resting** — the last song the reader opened: title, its **author** (no take is chosen, so
///   there is no reciter to name — tracks.md "reciter vs author"), and a single **play**
///   affordance, no transport. Tapping starts that song's first take; it does *not* open Now
///   Playing, "an empty player has nothing to show". A song with no audio keeps the slot and shows
///   an open-song chevron instead.
///
/// Nothing here ever autoplays: the resting state is content, not a playback request.
struct MiniPlayerView: View {
    /// Asks the app root to open a song's detail screen — the resting state's open-song chevron
    /// for songs with `audio_available = false` (player.md v15).
    ///
    /// A closure rather than a `NavigationLink` because this bar is a `safeAreaInset` on the root
    /// `TabView`, outside every `NavigationView`, so it has no stack to push onto; and the
    /// presentation must be owned by `AppNavigation` rather than by this view, since the reader it
    /// opens immediately suppresses the bar (v14) and would otherwise tear down its own presenter.
    /// Defaulted so `MiniPlayerView()` still compiles in previews.
    var onOpenSong: (String) -> Void = { _ in }

    @EnvironmentObject private var player: AudioPlayerService
    @EnvironmentObject private var settings: ReaderSettings
    @EnvironmentObject private var lastVisited: LastVisitedSongStore

    var body: some View {
        switch slot {
        case .playing(let song):
            // Titles follow the app-wide list language (settings.md v5 `listLanguage`), like every
            // other list surface — never hardcoded Latin.
            bar(
                title: song.title(inScript: settings.listLanguage),
                subtitle: playingSubtitle(for: song)
            ) {
                playingControl
            }
            // Whole-row tap expands to Now Playing; `playingControl` is a real `Button`, so its own
            // tap toggles playback without also expanding.
            .onTapGesture { player.isExpanded = true }

        case .resting(let entry, let canPlay):
            bar(
                title: entry.title(inScript: settings.listLanguage),
                subtitle: SongRepository.shared.authorDisplayName(forUid: entry.authorUid)
            ) {
                restingControl(entry: entry, canPlay: canPlay)
            }
            // Here the row and the control do the *same* thing — player.md v15: "Tapping it starts
            // the song's first take". There is no second action to keep distinct.
            .onTapGesture { activate(entry, canPlay: canPlay) }

        case .absent:
            EmptyView()
        }
    }

    /// Which of the v15 states the slot is in. The precedence itself lives in the pure, unit-tested
    /// `resolveMiniPlayerSlot` (Utils/MiniPlayerSlot.swift) — this only supplies the inputs.
    ///
    /// The persisted uid is rehydrated through the Manifest rather than a full `Song` decode: the
    /// bar needs a title, an author uid and `audio_available`, all of which a `ManifestEntry`
    /// already carries (manifest.md "Purpose"). A uid no longer in the corpus resolves to `nil`,
    /// which the resolver turns into `.absent`.
    private var slot: MiniPlayerSlot {
        resolveMiniPlayerSlot(
            currentSong: player.currentSong,
            state: player.state,
            lastVisited: lastVisited.songUid.flatMap { SongRepository.shared.manifestEntry(uid: $0) }
        )
    }

    // MARK: - Shared chrome
    //
    // Both states are literally the same bar — 56 pt, same glyph, same two lines, same background
    // and divider — so that "nothing about the app changes size when playback starts or stops"
    // (player.md v15). Only the credit line and the trailing affordance differ.

    private func bar<Trailing: View>(
        title: String,
        subtitle: String,
        @ViewBuilder trailing: () -> Trailing
    ) -> some View {
        HStack(spacing: 12) {
            artworkPlaceholder

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(Color("primaryText"))
                    .lineLimit(1)
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundColor(Color.neutral)
                    .lineLimit(1)
            }

            Spacer(minLength: 8)

            trailing()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .frame(height: 56)
        .background(Color.backgroundOffset)
        .overlay(Divider(), alignment: .top)
        .contentShape(Rectangle())
    }

    /// Surface fill + note glyph. Artist portraits mostly 404, so the placeholder "is the normal
    /// case, not an error" (player.md v14 item 2); at 36 pt the real artwork is a later refinement.
    private var artworkPlaceholder: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.neutral.opacity(0.2))
                .frame(width: 36, height: 36)
            Image(systemName: "music.note")
                .font(.system(size: 14))
                .foregroundColor(Color.neutral)
        }
    }

    // MARK: - Playing state

    /// Artist credit for the loaded recording, falling back to the song's author (tracks.md
    /// "reciter vs author"), with a clear unavailable message on load failure (player.md "clear
    /// 'audio unavailable' state").
    private func playingSubtitle(for song: Song) -> String {
        if case .error = player.state { return "Audio unavailable" }
        if let artist = player.currentTrack?.artist { return artist }
        return song.author(inScript: settings.listLanguage)
    }

    /// Play/pause (`trailingIcon2_`), or a spinner while loading. A separate real `Button` (rather
    /// than folding into the row's own tap gesture) so tapping it toggles playback without also
    /// expanding to Now Playing.
    @ViewBuilder
    private var playingControl: some View {
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

    // MARK: - Resting state (player.md v15 "It is not a track")

    /// A single **play** affordance — no transport pair, "because the only thing you can do to a
    /// song that isn't loaded is start it" — replaced by an open-song chevron when the song has no
    /// audio.
    private func restingControl(entry: ManifestEntry, canPlay: Bool) -> some View {
        Button(action: { activate(entry, canPlay: canPlay) }) {
            Image(systemName: canPlay ? "play.fill" : "chevron.right")
                .font(.system(size: 16))
                .foregroundColor(Color.highlight)
                .frame(width: 28, height: 28)
        }
        .buttonStyle(PlainButtonStyle())
        .accessibilityLabel(canPlay ? "Play" : "Open song")
    }

    /// Starts the last visited song's **first** take, promoting the slot into the playing state —
    /// deliberately without raising Now Playing (player.md v15).
    ///
    /// Songs without audio open their detail screen instead. So does a song whose `audio_available`
    /// flag disagrees with an empty `audio_files` list: there is nothing to start, and leaving the
    /// player parked in `.error` with no song loaded would strand the slot.
    private func activate(_ entry: ManifestEntry, canPlay: Bool) {
        guard canPlay,
              let song = SongRepository.shared.song(uid: entry.uid),
              !song.audioFiles.isEmpty
        else {
            onOpenSong(entry.uid)
            return
        }
        player.play(song: song)
    }
}
