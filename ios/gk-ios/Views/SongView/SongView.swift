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
/// `.toolbar(.hidden, for: .tabBar)` scoped to this pushed view — it auto-restores on pop, with no
/// global `UITabBar.appearance()` side-effect.
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
    @Environment(\.presentationMode) private var presentationMode

    /// Hidden-song display-only collapse (song-detail.md "Hidden song" state). Local to this screen
    /// (not a persisted preference).
    @State private var collapsed = false

    var body: some View {
        ZStack(alignment: .top) {
            Color.background.edgesIgnoringSafeArea(.all)

            VStack(spacing: 0) {
                backButton

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
        // Full-screen reader: hide the bottom tab bar on this pushed detail screen only
        // (song-detail.md v2). Scoped modifier — restores automatically when this view is popped.
        .toolbar(.hidden, for: .tabBar)
    }

    // MARK: - Back

    private var backButton: some View {
        HStack {
            Button(action: { presentationMode.wrappedValue.dismiss() }) {
                HStack(spacing: 2) {
                    Image(systemName: "chevron.left")
                    Text("Back")
                }
                .foregroundColor(Color.highlight)
                .padding(.leading, 16)
                .padding(.top, 12)
            }
            Spacer()
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

            // Player affordance shown only when the song has audio (song-detail.md). Starts the
            // song's default recording and raises the Now Playing sheet (docs/screens/player.md).
            if song.audioAvailable {
                Button(action: playTapped) {
                    HStack(spacing: 8) {
                        Image(systemName: "play.fill")
                        Text("Play")
                    }
                    .font(.system(size: 15, weight: .semibold))
                    // On the `highlight` fill: `onHighlight`, not `background` (theme.md on-accent
                    // contrast rule — the two happen to be near-identical values today, but only one
                    // of them is the correct semantic token).
                    .foregroundColor(Color("onHighlight"))
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.highlight)
                    .clipShape(Capsule())
                }
                .padding(.top, 4)
            }
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
