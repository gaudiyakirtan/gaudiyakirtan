import SwiftUI

/// Loads the full `Song` for `uid` from the repository and shows `SongView`, per the offline-first
/// list/detail split in docs/data/manifest.md ("a full Song is loaded only when the reader opens the
/// detail screen"). List/grid rows only carry a `ManifestEntry`, so this indirection is where the
/// full-song decode actually happens.
///
/// The decode is a synchronous bundle read (offline-first; no network), so there is no async
/// loading window to show a skeleton for — the song is present immediately or, if the file is
/// missing/corrupt, the graceful "couldn't load" branch renders instead.
struct SongDetailLoader: View {
    let uid: String

    var body: some View {
        if let song = SongRepository.shared.song(uid: uid) {
            SongView(song: song)
        } else {
            VStack {
                Spacer()
                Text("This song could not be loaded.")
                    .foregroundColor(Color.neutral)
                Spacer()
            }
            .frame(maxWidth: .infinity)
            .background(Color.background.edgesIgnoringSafeArea(.all))
        }
    }
}

/// The Song Detail reading screen (docs/screens/song-detail.md).
///
/// Single-column, scrollable full-screen reader: per song-detail.md v2 the mobile detail is a
/// "full-screen reader with the top toolbar and NO bottom tab bar" (the `Song-3`/`Song-4`/`song
/// view` frames show no tab bar; Android hides it too). The bottom nav is hidden via
/// `.toolbar(.hidden, for: .tabBar)` scoped to this pushed view, with no global
/// `UITabBar.appearance()` side-effect.
///
/// **The scoped modifier does not restore itself on iOS 26.** This comment used to claim it
/// auto-restores on pop; measured on iOS 26.5, one visit to this screen removed the tab bar for the
/// rest of the session (`tabBars.count` 1 → 0, nothing on screen and nothing in the accessibility
/// tree). The tab root in `AppNavigation` now owns the visibility (`tabBarVisibility(for:)`), bound
/// to the tab this screen records on appear — hidden while it is up, restored when it goes;
/// `gk-iosUITests/MiniPlayerBarUITests` pins both halves.
///
/// Header shows the title/author in the app-wide list language and a play affordance iff the song
/// has audio; a compact control bar quick-toggles the two verse scripts (display / transliteration),
/// the roman standard, word-to-word, translation and collapse ("may also be quick-toggled here") —
/// writing the same `ReaderSettings` the Settings screen writes, so the two never disagree. The body
/// renders every verse in order via `VerseView`, so a script switch re-renders all verses at once.
struct SongView: View {
    let song: Song
    @EnvironmentObject private var settings: ReaderSettings
    @EnvironmentObject private var audioPlayer: AudioPlayerService
    /// The one persisted reading record behind the mini-player's resting state (player.md **v15**
    /// "Persistence": "One record, written when song-detail opens a song, holding the uid only").
    @EnvironmentObject private var lastVisitedSong: LastVisitedSongStore
    @Environment(\.presentationMode) private var presentationMode
    /// Which tab this reader was pushed inside, so it suppresses only that tab's mini-player inset
    /// (see the `onAppear`/`onDisappear` pair below).
    @Environment(\.currentTabID) private var currentTabID

    /// Hidden-song display-only collapse (song-detail.md "Hidden song" state). Local to this screen
    /// (not a persisted preference).
    @State private var collapsed = false

    var body: some View {
        ZStack(alignment: .top) {
            Color.background.edgesIgnoringSafeArea(.all)

            VStack(spacing: 0) {
                topBar

                ScrollView {
                    VStack(alignment: .center, spacing: 24) {
                        header
                        controlBar
                        Divider().padding(.horizontal)
                        verseList
                        Spacer(minLength: 40)
                    }
                    .padding(.top, 16)
                }
            }
        }
        .navigationBarHidden(true)
        // Full-screen reader: no bottom tab bar on this screen (song-detail.md v2). This states it
        // locally, but it is not what hides and restores the bar — on iOS 26 it never restores it on
        // pop. The tab root does both, keyed off the tab recorded in `onAppear` below.
        .toolbar(.hidden, for: .tabBar)
        // The mini-player bar is suppressed here (song-detail.md v7 / player.md v14 — "the
        // reader's bottom edge belongs to the verses, and the pill in the toolbar already carries
        // the playback state"). The bar is a safe-area inset on this tab's `NavigationView`, a parent,
        // so this screen can only ask for it — by naming the tab it is on, which `AppNavigation`
        // compares against each tab; the same record hides that tab's tab bar (see the modifier
        // above). Switching tabs therefore un-suppresses without anyone clearing a flag,
        // which is the whole point: SwiftUI does not reliably fire `onAppear`/`onDisappear` for a
        // pushed view across tab switches, so anything ordering-dependent here is a bug waiting to
        // happen. Playback itself is never touched.
        .onAppear {
            audioPlayer.miniPlayerSuppressedByTab = currentTabID
            // This screen is the single funnel every route into the reader passes through, so it is
            // where "the reader opened a song" is recorded (player.md v15). The uid only — title,
            // author and audio flag are rehydrated from the bundled corpus, so nothing can go stale
            // against a pipeline resync. Recording never starts playback.
            lastVisitedSong.record(uid: song.uid)
        }
        .onDisappear {
            // Only release what this screen still owns — a screen that has already been superseded
            // must not clear a newer reader's suppression.
            if audioPlayer.miniPlayerSuppressedByTab == currentTabID {
                audioPlayer.miniPlayerSuppressedByTab = nil
            }
        }
    }

    // MARK: - Top toolbar (song-detail.md v7: back · now-playing pill)
    //
    // v7's toolbar is "back · the now-playing pill · a display-settings control (the 'Aa' menu)".
    // Only the first two are here: iOS has never had the collapsed "Aa" menu, keeping its script and
    // gloss controls in the `controlBar` pill row below instead. That divergence predates v7 and
    // consolidating the reader's controls is its own slice — tracked in implementation-mapping.md.

    private var topBar: some View {
        HStack(alignment: .center, spacing: 8) {
            backButton
            Spacer(minLength: 8)
            nowPlayingPill
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
    }

    private var backButton: some View {
        Button(action: { presentationMode.wrappedValue.dismiss() }) {
            HStack(spacing: 2) {
                Image(systemName: "chevron.left")
                Text("Back")
            }
            .foregroundColor(Color.highlight)
        }
    }

    // MARK: - Now-playing pill (player.md v14 "The reader gets a pill, not a bar")

    /// The reading screen's single audio affordance, replacing both the mini-player bar (suppressed
    /// above) and the header's old "Play" capsule.
    ///
    /// It is bound to the **player**, not to the page: whatever is loaded is what it shows, even if
    /// that is a different song than the one being read. With nothing loaded it doubles as *this*
    /// song's play button, "so the toolbar never grows a second button"; with nothing loaded and no
    /// audio on this song it renders nothing at all.
    @ViewBuilder
    private var nowPlayingPill: some View {
        if let playing = audioPlayer.currentSong {
            HStack(spacing: 8) {
                pillGlyph
                VStack(alignment: .leading, spacing: 1) {
                    Text(playing.title(inScript: settings.listLanguage))
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Color("primaryText"))
                        .lineLimit(1)
                    Text(pillSubtitle)
                        .font(.system(size: 11))
                        .foregroundColor(Color.neutral)
                        .lineLimit(1)
                }
                .frame(maxWidth: 130, alignment: .leading)

                pillControl
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.backgroundOffset)
            .clipShape(Capsule())
            // Two distinct hit targets (player.md v14): the body opens Now Playing, while
            // `pillControl` is a real `Button` with `PlainButtonStyle` so its own tap toggles
            // playback without also expanding — the same split `MiniPlayerView` uses.
            .contentShape(Capsule())
            .onTapGesture { audioPlayer.isExpanded = true }
        } else if song.audioAvailable {
            Button(action: playTapped) {
                HStack(spacing: 6) {
                    Image(systemName: "play.fill").font(.system(size: 12))
                    Text("Play").font(.system(size: 13, weight: .semibold))
                }
                .foregroundColor(Color.highlight)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(Color.backgroundOffset)
                .clipShape(Capsule())
            }
            .buttonStyle(PlainButtonStyle())
        }
    }

    private var pillGlyph: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 6)
                .fill(Color.neutral.opacity(0.2))
                .frame(width: 24, height: 24)
            Image(systemName: "music.note")
                .font(.system(size: 11))
                .foregroundColor(Color.neutral)
        }
    }

    /// The reciter of the loaded take, falling back to the composer (tracks.md "reciter vs
    /// author"), and to the graceful failure message when the take couldn't load.
    private var pillSubtitle: String {
        if case .error = audioPlayer.state { return "Audio unavailable" }
        if let artist = audioPlayer.currentTrack?.artist { return artist }
        return audioPlayer.currentSong?.author(inScript: settings.listLanguage) ?? ""
    }

    @ViewBuilder
    private var pillControl: some View {
        switch audioPlayer.state {
        case .loading:
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: Color.neutral))
                .frame(width: 22, height: 22)
        case .error:
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 15))
                .foregroundColor(Color.neutral)
                .frame(width: 22, height: 22)
        case .idle, .playing, .paused:
            Button(action: audioPlayer.togglePlayPause) {
                Image(systemName: audioPlayer.isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: 14))
                    .foregroundColor(Color.highlight)
                    .frame(width: 22, height: 22)
            }
            .buttonStyle(PlainButtonStyle())
        }
    }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 8) {
            // Header title/author follow the app-wide `listLanguage` (settings.md v5 — "the default
            // language the whole app is shown in — song titles, author names, and every browse & list
            // screen"), not the per-verse reading scripts. Matches web's SongScreen.
            Text(song.title(inScript: settings.listLanguage))
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(Color.highlight)
                .multilineTextAlignment(.center)

            // Author-tap → the author-filtered Song List (songs-list.md "Library (Author)"); this is
            // the destination song-detail.md deferred until the list screen existed.
            NavigationLink(destination: AuthorSongsView(authorUid: song.authorUid)) {
                Text(song.author(inScript: settings.listLanguage))
                    .font(.system(size: 18))
                    .foregroundColor(Color("primaryText"))
                    .multilineTextAlignment(.center)
            }
            .buttonStyle(PlainButtonStyle())

            // Tags (song.md `tags` — free-form labels; empty for the current corpus, so this row
            // renders only if a future dataset adds them).
            if !song.tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(song.tags, id: \.self) { tag in
                            Text(tag)
                                .font(.system(size: 13))
                                .foregroundColor(Color.neutral)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(Color.neutral.opacity(0.25))
                                .cornerRadius(10)
                        }
                    }
                    .padding(.horizontal)
                }
            }

            // The header's "Play" capsule is gone as of song-detail.md v7 — the toolbar's
            // now-playing pill is this screen's one audio affordance (player.md v14: "one control,
            // two states, so the toolbar never grows a second button").
        }
        .padding(.horizontal)
    }

    // MARK: - Quick-toggle control bar

    private var controlBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                // Source-line script (settings.md v5 `displayScript`, incl. "Default (source
                // language)"). The quick menu and Settings write the same `ReaderSettings`, so they
                // never disagree.
                Menu {
                    ForEach(ReaderSettings.availableDisplayScripts) { option in
                        Button {
                            settings.displayScript = option.code
                        } label: {
                            if settings.displayScript == option.code {
                                Label(option.label, systemImage: "checkmark")
                            } else {
                                Text(option.label)
                            }
                        }
                    }
                } label: {
                    controlPill(text: settings.displayScriptLabel, systemImage: "textformat", active: false)
                }

                // Reading-line script (settings.md v5 `transliterationScript`) — any script, since
                // it's a transliteration.
                Menu {
                    ForEach(ReaderSettings.availableTransliterationScripts) { option in
                        Button {
                            settings.transliterationScript = option.code
                        } label: {
                            if settings.transliterationScript == option.code {
                                Label(option.label, systemImage: "checkmark")
                            } else {
                                Text(option.label)
                            }
                        }
                    }
                } label: {
                    controlPill(text: settings.transliterationScriptLabel, systemImage: "globe", active: false)
                }

                // Roman standard — only meaningful while one of the two lines is actually Latin
                // (settings.md v5: the picker is revealed beside a `Latn` selection, hidden otherwise).
                if showsRomanStandard {
                    Menu {
                        ForEach(ReaderSettings.availableRomanStandards) { option in
                            Button {
                                settings.romanStandard = option.code
                            } label: {
                                if settings.romanStandard == option.code {
                                    Label(option.label, systemImage: "checkmark")
                                } else {
                                    Text(option.label)
                                }
                            }
                        }
                    } label: {
                        controlPill(
                            text: ScriptOptions.romanStandardName(settings.romanStandard),
                            systemImage: nil,
                            active: false
                        )
                    }
                }

                // Word-to-word toggle
                Button {
                    settings.showWordToWord.toggle()
                } label: {
                    controlPill(text: "Word-by-word", systemImage: nil, active: settings.showWordToWord)
                }

                // Translation toggle
                Button {
                    settings.showTranslation.toggle()
                } label: {
                    controlPill(text: "Translation", systemImage: nil, active: settings.showTranslation)
                }

                // Hidden-song collapse toggle
                Button {
                    withAnimation { collapsed.toggle() }
                } label: {
                    controlPill(
                        text: collapsed ? "Expand" : "Collapse",
                        systemImage: collapsed ? "chevron.down" : "chevron.up",
                        active: collapsed
                    )
                }
            }
            .padding(.horizontal)
        }
    }

    /// True when either verse line resolves to Latin for *this* song — including a `displayScript` of
    /// `auto` on an English-origin song. Only then does `romanStandard` change anything.
    private var showsRomanStandard: Bool {
        settings.effectiveDisplayScript(for: song) == "Latn" || settings.transliterationScript == "Latn"
    }

    private func controlPill(text: String, systemImage: String?, active: Bool) -> some View {
        HStack(spacing: 4) {
            if let systemImage { Image(systemName: systemImage).font(.system(size: 12)) }
            Text(text).font(.system(size: 13, weight: .medium))
        }
        // Active pill text sits on the `highlight` fill — `onHighlight`, not `background`.
        .foregroundColor(active ? Color("onHighlight") : Color.neutral)
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(active ? Color.highlight : Color.backgroundOffset)
        .clipShape(Capsule())
    }

    // MARK: - Verses

    private var verseList: some View {
        // `auto` resolves against *this* song's language_of_origin, so the source line follows the
        // song rather than a global script (settings.md v5).
        let options = settings.verseOptions(languageOfOrigin: song.languageOfOrigin, collapsed: collapsed)
        return VStack(alignment: .leading, spacing: 28) {
            ForEach(song.verses) { verse in
                VerseView(verse: verse, options: options)
                    .padding(.horizontal)
            }
        }
    }

    // MARK: - Actions

    private func playTapped() {
        // Starts this song's default (first) recording and raises the Now Playing sheet
        // (docs/screens/player.md "song-detail play button → start this song's track + open/raise
        // the player — replaces the stub").
        audioPlayer.play(song: song)
        audioPlayer.isExpanded = true
    }
}
