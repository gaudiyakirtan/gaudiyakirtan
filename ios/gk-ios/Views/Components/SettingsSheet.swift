import SwiftUI

/// The Settings screen (docs/screens/settings.md): the reader's device-local, persisted, offline
/// control panel for how songs display and how the app looks. Every control writes straight through
/// to the shared `ReaderSettings` (the same object Song Detail reads), so changes take effect live
/// and survive relaunch via `UserDefaults`.
///
/// Grouped as **Display** (script, roman standard, word-to-word + language, translation + language,
/// list language), **Appearance** (theme), and **About**, matching the `Settings` Figma frames.
struct SettingsSheet: View {
    @Binding var isPresented: Bool
    /// Shared reading preferences. Passed explicitly rather than via the environment so it survives
    /// the sheet presentation boundary (sheets don't reliably inherit environment objects).
    @ObservedObject var settings: ReaderSettings

    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Display")) {
                    Picker("Script", selection: $settings.scriptCode) {
                        ForEach(ReaderSettings.availableScripts) { option in
                            Text(option.label).tag(option.code)
                        }
                    }

                    // Roman standard only takes effect when the display script is Latin
                    // (settings.md: "When displayScript = Latn, which roman scheme"), so surface it
                    // only then — like the language pickers below, which appear only when relevant.
                    if settings.scriptCode == "Latn" {
                        Picker("Roman standard", selection: $settings.romanStandard) {
                            ForEach(ReaderSettings.availableRomanStandards) { option in
                                Text(option.label).tag(option.code)
                            }
                        }
                    }

                    Toggle("Word-by-word", isOn: $settings.showWordToWord)
                        .toggleStyle(SwitchToggleStyle(tint: Color.highlight))
                    if settings.showWordToWord {
                        Picker("Word-by-word language", selection: $settings.wordToWordLanguage) {
                            ForEach(ReaderSettings.availableGlossLanguages) { option in
                                Text(option.label).tag(option.code)
                            }
                        }
                    }

                    Toggle("Translation", isOn: $settings.showTranslation)
                        .toggleStyle(SwitchToggleStyle(tint: Color.highlight))
                    if settings.showTranslation {
                        Picker("Translation language", selection: $settings.translationLanguage) {
                            ForEach(ReaderSettings.availableTranslationLanguages) { option in
                                Text(option.label).tag(option.code)
                            }
                        }
                    }

                    Picker("List language", selection: $settings.listLanguage) {
                        ForEach(ReaderSettings.availableListLanguages) { option in
                            Text(option.label).tag(option.code)
                        }
                    }
                }

                Section(header: Text("Appearance")) {
                    Picker("Theme", selection: $settings.theme) {
                        ForEach(AppTheme.allCases) { theme in
                            Text(theme.label).tag(theme)
                        }
                    }
                }

                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.neutral)
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        isPresented = false
                    }
                }
            }
        }
        // Pickers (Script/Roman standard/languages/Theme) and the Done button must not fall back to
        // the platform-default blue tint inside this sheet (a `.sheet` doesn't inherit `.tint` from
        // its presenter) — theme.md "interactive controls tinted to accent/highlight". The Toggles
        // above already set their own `SwitchToggleStyle(tint:)` explicitly, so this doesn't change them.
        .tint(Color.highlight)
    }
}

#Preview {
    SettingsSheet(isPresented: .constant(true), settings: ReaderSettings())
}
