# Screen — Settings

**Spec version:** 5

**Figma frames:** `Settings`, `Settings-1`, `Settings-2`, `Settings-3`.

## Purpose

The reader's control panel for how songs are displayed and how the app looks. Settings are **device-
local, persisted, and offline** — no account. They drive the [song-detail](song-detail.md) rendering
(which script, which glosses) and the app-wide [theme](theme.md).

## Data bindings / settings model

A single persisted `Settings` object (local store per platform: `UserDefaults` iOS /
`DataStore`/prefs Android / `localStorage` web). Fields:

| Setting | Type | Values | Default | Effect |
|---------|------|--------|---------|--------|
| `displayScript` | scriptCode | `auto` + any script present in the corpus (`Beng`, `Deva`, `Latn`, `Telu`, `Knda`, `Taml`, `Mlym`, `Gujr`, `Orya`, `Cyrl`) | `auto` | Which `display_scripts` entry the verse's **source** line renders (the muted first line). `auto` — labelled **"Default (source language)"** — resolves per song from `language_of_origin` (`ben`/`asa` → `Beng`, `san`/`hin` → `Deva`, `ori` → `Orya`, `eng` → `Latn`, else `Beng`). |
| `transliterationScript` | scriptCode | as `displayScript`, **without** `auto` | `Latn` | Which script the verse's **reading** line renders. It is a transliteration, so it can be *any* script, not just Latin — see v4. |
| `romanStandard` | string | `IAST`, `ISO15919`, `BBT_Roman`, `GVP_Roman` | `IAST` | Applies to whichever of the two lines is `Latn`; the picker is revealed only then. |
| `showWordToWord` | boolean | on/off | on | Toggles the per-verse word-to-word glossary. |
| `wordToWordLanguage` | languageCode | `eng`, `hin`, … | `eng` | Which `word_to_words` language to show. |
| `showTranslation` | boolean | on/off | on | Toggles the per-verse full translation. |
| `translationLanguage` | languageCode | `eng`, `hin`, … | `eng` | Which `translations` language to show. |
| `listLanguage` | scriptCode | as `displayScript` | `Latn` | Which script titles appear in lists (the "Try Settings › List Language" hint song references this). |
| `theme` | enum | `gaura`, `shyam`, `system` | `system` | App palette — see [theme.md](theme.md). |

### Notes (cross-platform consistency)

- **`romanStandard` picker** is revealed **beside whichever script picker is set to `Latn`** ("English
  (Roman / Latin)") and hidden otherwise. It affects verse bodies, not titles (`title_main` ships
  IAST-only for Latn, so titles stay IAST regardless).
- **Shared option labels** (all platforms use these exact strings, so the three apps read the same):
  `auto` → **"Default (source language)"**; `Latn` → **"English (Roman / Latin)"**; otherwise the
  script's own name (`Bengali`, `Devanagari`, `Telugu`, `Kannada`, `Tamil`, `Malayalam`, `Gujarati`,
  `Odia`, `Cyrillic`). Roman standards read `IAST` / `ISO 15919` / `BBT Roman` / `GVP Roman`;
  languages read `English` / `Hindi` / `Bengali` / `Gujarati`.
- **A missing script is a visible state, not a silent fallback.** The line resolver returns *nothing*
  when the chosen script has no `display_scripts` entry for that verse, and the surface says so
  ("This script isn't available for this verse."). Only `ISO15919` is special: it has no
  `display_scripts` entry anywhere in the corpus and is rendered from `source_text_master` with the
  `[FLAG_*]` markers resolved.
- **The two lines dedupe.** When source and reading resolve to the same script *and* the same roman
  standard, the verse shows one line, not two.
- **`listLanguage`** changes the *visible* list-title script; the A–Z grouping/sort stays keyed to the
  stable Latin `primary_title` so the index doesn't reshuffle per language.
- **Theme (interim):** until the dedicated two-palette [theme](theme.md) slice, `gaura`/`shyam`/`system`
  map to light/dark/device (`gaura` = light, for Gaurāṅga the fair avatāra; `shyam` = dark, for
  Śyāma) with honest labels like "Gaura (Light)". The real Gaura/Shyam palettes replace this mapping,
  not the setting.

## Layout & regions

**All three platforms use the live-preview layout** (v5 — previously web-only). A settings screen made
of bare labelled pickers cannot answer the only question a reader has — *what will this do to the
page I'm reading?* — so the screen **is** a sample verse, rendered exactly as the reader would see it
on [song-detail](song-detail.md), with each control placed **next to the part of the verse it drives**.

Order, top to bottom:

1. **Language** — one card. A short blurb ("The default language the whole app is shown in — song
   titles, author names, and every browse & list screen"), the row **"Display language"** bound to
   `listLanguage`, and a **live example** underneath rendered from the sample song's own
   `title_main` / `author_display` in the chosen script (`e.g. "akrodha paramānanda" — Śrīla Locana
   dāsa Ṭhākura`). The example is what makes the setting legible; it must come from the full `Song`,
   not from a `ManifestEntry` (the shipped manifest carries only `Beng` + `Latn` titles).
2. **Reading** — one card holding **four preview rows**, in the reader's own vertical order:

   | Row | Live preview (rendered like song-detail) | Control beside it |
   |-----|------------------------------------------|-------------------|
   | **Display script** | the source line, muted (`neutral`) | script picker incl. `auto` (+ roman standard when `Latn`) |
   | **Transliteration** | the reading line, accented (`highlight`), medium weight | script picker excl. `auto` (+ roman standard when `Latn`) |
   | **Word-by-word** | the flowing `headword — gloss;` glossary, headwords accented | word-to-word language picker |
   | **Translation** | the translation lines, primary text | translation language picker |

   Each row shows its own empty state in italics when the sample lacks that content ("This script
   isn't available for this verse.", "No glossary in this language for this verse.", "No translation
   in this language for this verse."). On a **phone** the row stacks — preview above, a small
   uppercase caption + control below; on **desktop web** it is a two-column grid.
3. **Appearance** — theme as a **segmented control**, Gaura / Shyam / System in that order, plus
   Version and Corpus rows.
4. **About** — credits/links.

**Sample song.** All platforms preview the same verse so the screens are comparable: song **`N9`**,
first verse that carries a `Beng` display script *and* an `eng` gloss *and* an `eng` translation. If
the song or a qualifying verse can't be loaded, the Reading card degrades to "Sample verse
unavailable." rather than disappearing.

**Show/hide toggles are not on this screen.** Whether word-by-word and translation are *visible* is a
per-reading decision made on the song page (web `ReaderOptions`, iOS/Android the "Aa" menu). Settings
picks their **language** only — that is the setting that outlives one reading session.

`Settings-1/2/3` are the expanded pickers (e.g. the script chooser sheet, the theme chooser).

> **Figma vs. spec (resolved):** the `Settings-2/3` frames sketch `Theme` / `Language` / `Sanga` +
> collapsible About/Report/Request/Contact/Donate, and omit the Display group. The **Display group is
> functionally required** (song-detail binds to it), so it stays as the priority, rendered in the
> frames' row/pill grammar. Mapping of the frames' extra rows: **"Language"** = the content
> (word-to-word/translation) language settings above; **About/Report/Request/Contact/Donate** =
> About-section links/actions (stub or link out); **"Sanga"** (spiritual community/affiliation) is
> not a defined data setting — **deferred** until product-defined. Don't block Display on it.

## States

- A chosen `displayScript`/gloss/translation language that a *given* song lacks is still a valid
  global setting — the song-detail screen falls back per its own spec; Settings does not filter by
  song.
- All settings work fully offline.

## Interactions

- Each control writes the setting immediately and persists; open song-detail reflects it live.
- Script/theme pickers open a sheet (mobile) / dropdown (web) — the `Settings-1/2/3` frames.

## Per-platform notes

The **resolvers are the shared contract** — same names, same semantics, three languages, each with
its own unit tests (they are the load-bearing logic behind the preview *and* behind song-detail):

| Contract | Web | iOS | Android |
|----------|-----|-----|---------|
| resolve a script's lines, `nil` if absent | `resolveScriptLines` | `VerseTextResolver.scriptLines(...)` | `Verse.scriptLinesOrNull(...)` |
| resolve `auto` against a song | `effectiveDisplayScript` | `ScriptOptions.effectiveDisplayScript` | `ScriptOptions.effectiveDisplayScript` |
| native script for a language | `nativeScriptFor` | `ScriptOptions.nativeScript(for:)` | `ScriptOptions.nativeScriptFor` |
| picker label | `scriptOptionLabel` | `ScriptOptions.optionLabel` | `ScriptOptions.optionLabel` |
| dedupe key for the two lines | `scriptRenderKey` | `ScriptOptions.renderKey` | `ScriptOptions.renderKey` |
| strip `[FLAG_*]` from master text | `stripMasterFlags` | `StringUtils.resolveMasterTextFlags` | `StringUtils.resolveMasterTextFlags` |

- **iOS:** `SettingsView.swift` is the screen (a `NavigationStack` inside the Home sheet);
  `ReaderSettings` (`ObservableObject` over `UserDefaults`, `reader.*` keys) is the model, injected
  explicitly into the sheet because sheets don't reliably inherit environment objects. The preview
  reuses `VerseView`'s type ramp so it can't drift from the reader.
- **Android:** `SettingsScreen` (Compose) + `SettingsViewModel` over `SettingsRepository`
  (SharedPreferences — DataStore is not in the offline Gradle cache). The ViewModel loads the sample
  song from `SongRepository` into a `StateFlow<Song?>`.
- **Web:** `pages/settings.tsx` over `SettingsContext` (`localStorage['gk-settings']`); `ThemeContext`
  (`gk-theme`) owns the theme.

## Verification

- **Visual:** matches `Settings` + `Settings-1/2/3` frames per platform; the three platforms' Reading
  cards show the *same* sample verse in the same order, so they can be compared side by side.
- **Behavioral:** changing `displayScript` / `transliterationScript` re-renders both the preview and
  song-detail in that script; picking a script the verse lacks shows the unavailable state rather than
  silently falling back; `auto` follows the song's `language_of_origin`; the roman-standard picker
  appears only beside a `Latn` selection; identical source/reading collapse to one line; theme switch
  repaints the app; all settings persist across relaunch; everything works offline.
- **Unit:** the resolver table above is covered per platform — `auto` resolution, option labels,
  absent-script `nil`, `ISO15919`-from-master flag stripping, and the dedupe key.

## Change log

- **v4 (web)** — The verse **script controls are now two script pickers** (Display script = the source
  line; **Transliteration** = the reading line) since the reading line is a transliteration and can be
  **any** script, not just Latin. The Latin option reads **"English (Roman / Latin)"** and, when
  chosen, reveals a secondary **standard** dropdown (IAST / ISO 15919 / BBT / GVP). New setting
  `transliterationScript` (default Latin, so the default reading is unchanged; the two lines dedupe when
  identical). The **Word-by-word / Translation toggles were removed** from Settings (show/hide stays a
  per-reading toggle on the song page) — Settings just picks their language.
- **v3 (web)** — Reworked the live preview so each verse part renders **exactly like the song page**
  (native source line, romanized reading line, word-by-word, translation) with the setting that drives
  it placed **directly beside it** (Source verse ↔ Display script, Transliteration ↔ Roman standard,
  Word-by-word ↔ toggle+language, Translation ↔ toggle+language) — spatial mapping instead of a
  separate controls column. List language / theme / about sit below.
- **v2 (web desktop)** — Modernized the web Settings into a two-column desktop layout: grouped cards
  (Reading / Glosses & translation / Lists / Appearance / About), a segmented theme control, and a
  sticky **live preview** — a real, fully-populated verse (N9) rendered exactly as the reader would,
  with each region chip-labelled to the setting that drives it (Source verse → Display script,
  Transliteration → Roman standard, Word-by-word, Translation, and a List-language title demo). The
  preview re-renders as settings change, teaching the setting→output mapping. Settings keys unchanged.
- **v1** — Initial spec: display (script, roman standard, word-to-word, translation, list language),
  appearance (Gaura/Shyam/System theme), about; local persisted offline settings model driving
  song-detail + theme.
