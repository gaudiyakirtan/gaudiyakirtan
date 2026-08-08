import SwiftUI

/// The Settings screen (docs/screens/settings.md **v5**): the reader's device-local, persisted,
/// offline control panel for how songs display and how the app looks. Every control writes straight
/// through to the shared `ReaderSettings` (the same object Song Detail reads), so changes take effect
/// live and survive relaunch via `UserDefaults`.
///
/// The screen **is a sample verse.** A settings screen made of bare labelled pickers cannot answer
/// the only question a reader has — *what will this do to the page I'm reading?* — so each control
/// sits directly beneath the part of the verse it drives, rendered exactly as
/// [song-detail](docs/screens/song-detail.md) renders it. On a phone the row stacks: preview above, a
/// small uppercase caption + control below.
///
/// Presented as a sheet from Home's gear button. `ReaderSettings` is passed in explicitly rather than
/// read from the environment, because a `.sheet` doesn't reliably inherit environment objects.
struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss

    /// Shared reading preferences — the same instance Song Detail and the mini-player observe.
    @ObservedObject var settings: ReaderSettings

    /// The shared preview sample (N9). Loaded once on appear; a synchronous bundle read, so there is
    /// no loading window to show.
    @State private var sample: SettingsSample? = nil

    // MARK: - Body

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    languageCard
                    readingCard
                    appearanceCard
                    aboutCard
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
            }
            .background(Color.background.edgesIgnoringSafeArea(.all))
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .onAppear {
                if sample == nil { sample = SettingsSample.load() }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        // Pickers and the Done button must not fall back to the platform-default blue inside this
        // sheet (a `.sheet` doesn't inherit `.tint` from its presenter) — theme.md "interactive
        // controls tinted to accent/highlight".
        .tint(Color.highlight)
    }

    // MARK: - 1. Language

    private var languageCard: some View {
        SettingsCard(caption: "Language") {
            Text("""
                 The default language the whole app is shown in — song titles, author names, and every \
                 browse & list screen. (The per-verse reading scripts are set under “Reading” below.)
                 """)
                .font(.system(size: 13))
                .foregroundColor(Color.neutral)
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .firstTextBaseline, spacing: 12) {
                    Text("Display language")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(Color("primaryText"))
                    Spacer(minLength: 8)
                    Picker("Display language", selection: $settings.listLanguage) {
                        ForEach(ReaderSettings.availableListLanguages) { option in
                            Text(option.label).tag(option.code)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }

                // The live example is what makes the setting legible. It comes from the full `Song`
                // (settings.md v5) — the shipped manifest carries only Beng + Latn titles.
                if let sample {
                    Text("e.g. “\(sample.song.title(inScript: settings.listLanguage))” — \(sample.song.author(inScript: settings.listLanguage))")
                        .font(.system(size: 12))
                        .foregroundColor(Color.neutral)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    // MARK: - 2. Reading

    private var readingCard: some View {
        SettingsCard(caption: "Reading") {
            if let sample {
                readingRows(sample)
            } else {
                Text("Sample verse unavailable.")
                    .font(.system(size: 14))
                    .foregroundColor(Color.neutral)
                    .padding(.vertical, 12)
            }
        }
    }

    @ViewBuilder
    private func readingRows(_ sample: SettingsSample) -> some View {
        // Row 1 — source line ↔ Display script
        SettingsPreviewRow(caption: "Display script") {
            sourcePreview(sample)
        } control: {
            ScriptControl(
                script: $settings.displayScript,
                romanStandard: $settings.romanStandard,
                options: ReaderSettings.availableDisplayScripts,
                // `auto` can itself land on Latin (an English-origin song), so the standard picker
                // keys off the *resolved* script, not the raw setting.
                showsRomanStandard: effectiveDisplayScript(for: sample) == "Latn",
                title: "Display script"
            )
        }

        Divider()

        // Row 2 — reading line ↔ Transliteration
        SettingsPreviewRow(caption: "Transliteration") {
            transliterationPreview(sample)
        } control: {
            ScriptControl(
                script: $settings.transliterationScript,
                romanStandard: $settings.romanStandard,
                options: ReaderSettings.availableTransliterationScripts,
                showsRomanStandard: settings.transliterationScript == "Latn",
                title: "Transliteration"
            )
        }

        Divider()

        // Row 3 — glossary ↔ word-to-word language. (Whether it is *visible* while reading stays a
        // per-reading toggle on the song page; Settings picks the language only — settings.md v5.)
        SettingsPreviewRow(caption: "Word-by-word") {
            wordToWordPreview(sample)
        } control: {
            Picker("Word-by-word", selection: $settings.wordToWordLanguage) {
                ForEach(ReaderSettings.availableGlossLanguages) { option in
                    Text(option.label).tag(option.code)
                }
            }
            .pickerStyle(MenuPickerStyle())
        }

        Divider()

        // Row 4 — translation ↔ translation language
        SettingsPreviewRow(caption: "Translation") {
            translationPreview(sample)
        } control: {
            Picker("Translation", selection: $settings.translationLanguage) {
                ForEach(ReaderSettings.availableTranslationLanguages) { option in
                    Text(option.label).tag(option.code)
                }
            }
            .pickerStyle(MenuPickerStyle())
        }
    }

    // MARK: - Reading previews (rendered exactly as `VerseView` renders them)

    /// The muted source line, in the resolved `displayScript`.
    @ViewBuilder
    private func sourcePreview(_ sample: SettingsSample) -> some View {
        if let lines = VerseTextResolver.scriptLines(
            sample.verse,
            script: effectiveDisplayScript(for: sample),
            romanStandard: settings.romanStandard
        ), !lines.isEmpty {
            versePreviewLines(lines, color: Color.neutral)
        } else {
            emptyState("This script isn’t available for this verse.")
        }
    }

    /// The accented reading line, in `transliterationScript`.
    @ViewBuilder
    private func transliterationPreview(_ sample: SettingsSample) -> some View {
        if let lines = VerseTextResolver.scriptLines(
            sample.verse,
            script: settings.transliterationScript,
            romanStandard: settings.romanStandard
        ), !lines.isEmpty {
            versePreviewLines(lines, color: Color.highlight, weight: .medium)
        } else {
            emptyState("This script isn’t available for this verse.")
        }
    }

    @ViewBuilder
    private func wordToWordPreview(_ sample: SettingsSample) -> some View {
        if let wtw = sample.verse.wordToWord(language: settings.wordToWordLanguage),
           !wtw.words.isEmpty {
            VerseView.wordToWordText(wtw)
                .font(.system(size: 14))
                .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            emptyState("No glossary in this language for this verse.")
        }
    }

    @ViewBuilder
    private func translationPreview(_ sample: SettingsSample) -> some View {
        if let translation = sample.verse.translation(language: settings.translationLanguage),
           !translation.text.isEmpty {
            Text(translation.joinedText)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(Color("primaryText"))
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            emptyState("No translation in this language for this verse.")
        }
    }

    /// The verse lines exactly as `VerseView` draws them — centered, 15pt, muted-regular for the
    /// source line and accented-medium for the reading line. The two must stay in lockstep: a
    /// preview that renders differently from the reader is worse than no preview.
    private func versePreviewLines(
        _ lines: [String],
        color: Color,
        weight: Font.Weight = .regular
    ) -> some View {
        VStack(spacing: 4) {
            ForEach(lines, id: \.self) { line in
                Text(line)
                    .font(.system(size: 15, weight: weight))
                    .foregroundColor(color)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
    }

    /// A missing script/gloss/translation is a **visible state, not a silent fallback**
    /// (settings.md v5) — the exact strings are shared by all three platforms.
    private func emptyState(_ message: String) -> some View {
        Text(message)
            .font(.system(size: 13))
            .italic()
            .foregroundColor(Color.neutral)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
    }

    /// `auto` ("Default (source language)") resolved against the sample song's own
    /// `language_of_origin`, so the preview shows what the setting will actually produce.
    private func effectiveDisplayScript(for sample: SettingsSample) -> String {
        settings.effectiveDisplayScript(for: sample.song)
    }

    // MARK: - 3. Appearance

    private var appearanceCard: some View {
        SettingsCard(caption: "Appearance") {
            VStack(alignment: .leading, spacing: 6) {
                Picker("Theme", selection: $settings.theme) {
                    ForEach(AppTheme.allCases) { theme in
                        Text(theme.shortLabel).tag(theme)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())

                Text("Gaura (light) / Shyam (dark) / System follows the device.")
                    .font(.system(size: 12))
                    .foregroundColor(Color.neutral)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Divider()

            infoRow(label: "Version", value: Self.appVersion)
            // Corpus size is deliberately not printed: hand-written song counts go stale
            // (CLAUDE.md), and what the reader actually needs to know is that it works offline.
            infoRow(label: "Corpus", value: "Bundled, works offline")
        }
    }

    // MARK: - 4. About

    private var aboutCard: some View {
        SettingsCard(caption: "About") {
            Text("""
                 Gaudiya Kirtan — a repository of Gauḍīya Vaiṣṇava songs with their transliterations, \
                 word-by-word glossaries and translations. Every song ships with the app and reads \
                 fully offline; only audio streams.
                 """)
                .font(.system(size: 13))
                .foregroundColor(Color.neutral)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func infoRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 15))
                .foregroundColor(Color("primaryText"))
            Spacer(minLength: 8)
            Text(value)
                .font(.system(size: 14))
                .foregroundColor(Color.neutral)
        }
    }

    /// The shipped marketing version (`CFBundleShortVersionString`), so this row can't go stale.
    private static var appVersion: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "—"
    }
}

// MARK: - Sample

/// The verse every platform previews, so the three Settings screens can be compared side by side
/// (settings.md v5 "Sample song": song **N9**, first verse carrying a `Beng` display script *and* an
/// `eng` gloss *and* an `eng` translation).
struct SettingsSample {
    let song: Song
    let verse: Verse

    /// Loads the sample from the bundled corpus, or `nil` when the song or a qualifying verse can't
    /// be found — in which case the Reading card degrades to "Sample verse unavailable." rather than
    /// disappearing.
    static func load(repository: SongRepository = .shared) -> SettingsSample? {
        guard let song = repository.song(uid: "N9") else { return nil }
        guard let verse = song.verses.first(where: { verse in
            verse.displayScripts.contains(where: { $0.scriptCode == "Beng" })
                && verse.wordToWords.contains(where: { $0.languageCode == "eng" })
                && verse.translations.contains(where: { $0.languageCode == "eng" })
        }) else { return nil }
        return SettingsSample(song: song, verse: verse)
    }
}

// MARK: - Building blocks

/// A rounded card in the app's existing surface grammar: `backgroundOffset` fill, `border` stroke,
/// with a small uppercase caption naming the group.
private struct SettingsCard<Content: View>: View {
    let caption: String
    let content: Content

    init(caption: String, @ViewBuilder content: () -> Content) {
        self.caption = caption
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(caption.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(Color.neutral)
            content
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16).fill(Color("backgroundOffset")))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color("border"), lineWidth: 1))
    }
}

/// One Reading row: the live verse part on top, its caption + control below (settings.md v5 — "on a
/// phone the row stacks"). The spatial pairing *is* the explanation, which is why the preview leads.
private struct SettingsPreviewRow<Preview: View, Control: View>: View {
    let caption: String
    let preview: Preview
    let control: Control

    init(
        caption: String,
        @ViewBuilder preview: () -> Preview,
        @ViewBuilder control: () -> Control
    ) {
        self.caption = caption
        self.preview = preview()
        self.control = control()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            preview
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 12) {
                Text(caption.uppercased())
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(Color.neutral)
                Spacer(minLength: 8)
                control
            }
        }
        .padding(.vertical, 10)
    }
}

/// A script picker that reveals a second **roman standard** picker beside it only when the selection
/// is "English (Roman / Latin)" (settings.md v5: the standard applies to whichever line is `Latn`).
private struct ScriptControl: View {
    @Binding var script: String
    @Binding var romanStandard: String
    let options: [ScriptOption]
    let showsRomanStandard: Bool
    let title: String

    var body: some View {
        HStack(spacing: 8) {
            Picker(title, selection: $script) {
                ForEach(options) { option in
                    Text(option.label).tag(option.code)
                }
            }
            .pickerStyle(MenuPickerStyle())

            if showsRomanStandard {
                Picker("Roman standard", selection: $romanStandard) {
                    ForEach(ReaderSettings.availableRomanStandards) { option in
                        Text(option.label).tag(option.code)
                    }
                }
                .pickerStyle(MenuPickerStyle())
            }
        }
    }
}

#Preview {
    SettingsView(settings: ReaderSettings())
}
