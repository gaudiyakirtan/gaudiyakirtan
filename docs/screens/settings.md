# Screen — Settings

**Spec version:** 1

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
| `displayScript` | scriptCode | any script present in the corpus (`Beng`, `Deva`, `Latn`, `Telu`, `Knda`, `Taml`, `Mlym`, `Gujr`, `Orya`, `Cyrl`) | `Latn` | Which `display_scripts` entry each verse's reading line renders. **Default `Latn`** (romanized/IAST) — the lingua franca for a global kirtan audience, matching the Figma song mock's romanized header; the native-script line still shows as the muted reference (per song-detail v3). |
| `romanStandard` | string | `IAST`, `ISO15919`, `BBT_Roman`, `GVP_Roman` | `IAST` | When `displayScript = Latn`, which roman scheme. |
| `showWordToWord` | boolean | on/off | on | Toggles the per-verse word-to-word glossary. |
| `wordToWordLanguage` | languageCode | `eng`, `hin`, … | `eng` | Which `word_to_words` language to show. |
| `showTranslation` | boolean | on/off | on | Toggles the per-verse full translation. |
| `translationLanguage` | languageCode | `eng`, `hin`, … | `eng` | Which `translations` language to show. |
| `listLanguage` | scriptCode | as `displayScript` | `Latn` | Which script titles appear in lists (the "Try Settings › List Language" hint song references this). |
| `theme` | enum | `gaura`, `shyam`, `system` | `system` | App palette — see [theme.md](theme.md). |

### Notes (cross-platform consistency)

- **`romanStandard` picker** is shown **only when `displayScript = Latn`** (like the conditional
  language pickers); it's inert otherwise. It affects verse bodies, not titles (`title_main` ships
  IAST-only for Latn, so titles stay IAST regardless).
- **`listLanguage`** changes the *visible* list-title script; the A–Z grouping/sort stays keyed to the
  stable Latin `primary_title` so the index doesn't reshuffle per language.
- **Theme (interim):** until the dedicated two-palette [theme](theme.md) slice, `gaura`/`shyam`/`system`
  map to light/dark/device (`gaura` = light, for Gaurāṅga the fair avatāra; `shyam` = dark, for
  Śyāma) with honest labels like "Gaura (Light)". The real Gaura/Shyam palettes replace this mapping,
  not the setting.

## Layout & regions

Grouped list (per Figma `Settings` frames): **Display** (script, roman standard, word-to-word +
language, translation + language, list language), **Appearance** (theme selector — Gaura / Shyam /
System), **About** (version, credits, links). `Settings-1/2/3` are the expanded pickers (e.g. the
script chooser sheet, the theme chooser).

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

- **iOS:** `SettingsView.swift` / `SettingsSheet.swift`, an `@AppStorage`/`ObservableObject` settings
  model injected into the environment.
- **Android:** `SettingsScreen` (Compose) + a settings `ViewModel` over DataStore. **Android has no
  Settings screen yet — this creates it.**
- **Web:** a settings context (`ThemeContext` already exists for theme) persisted to `localStorage`;
  a `/settings` route or panel.

## Verification

- **Visual:** matches `Settings` + `Settings-1/2/3` frames per platform.
- **Behavioral:** changing `displayScript` re-renders song-detail in that script; toggling
  word-to-word/translation shows/hides them; theme switch repaints app; all settings persist across
  relaunch; everything works offline.

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
