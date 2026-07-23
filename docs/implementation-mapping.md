# Implementation Mapping

This document provides a mapping between equivalent components across all platform implementations. Use this as a reference to maintain consistency when implementing new features.

---

## Live Conformance Matrix

The authoritative status board for the doc-driven build (see [`WORKFLOW.md`](WORKFLOW.md)). For each
spec × platform: the spec version implemented and the verifier status. **The verifier updates this;
the orchestrator reviews it.**

Legend: `—` not started · `⏳ stale` (spec ahead of code) · `🔨 in progress` · `❌ failing` ·
`✅ vN green` (verifier-passed at spec version N).

### Data specs (`docs/data/`)

| Spec | Ver | Web | iOS | Android |
|------|-----|-----|-----|---------|
| [song](data/song.md) | v2 | ✅ | ✅* | ✅ |
| [verse](data/verse.md) | v2 | ✅ | ✅* | ✅ |
| [translation](data/translation.md) | v1 | ✅ | ✅* | ✅ |
| [author](data/author.md) | v1 | ✅ | ✅* | ✅ |
| [collections](data/collections.md) | v1 | ✅ | ✅* | ✅ |
| [manifest](data/manifest.md) | v1 | ✅ | ✅* | ✅ |
| [calendar](data/calendar.md) | v2 | ✅ | — | — |
| [pipeline](data/pipeline.md) | v1 | n/a | n/a | n/a |

> **✅\* iOS**: data layer typechecks clean (`swiftc -typecheck`, 0 errors, verified independently)
> + 703-song decode harness passes. Full `xcodebuild` app build is **blocked in this sandbox only**
> (`actool` asset-catalog codegen can't spawn — fails identically on baseline); the simulator
> build+run must be confirmed on a normal macOS/Xcode machine.

Pipeline is platform-agnostic data prep; its status is tracked in `ROADMAP.md` Track A1.

### Data layer & features

| Capability | Web | iOS | Android |
|------------|-----|-----|---------|
| Real corpus loaded (no sampleData) | ✅ | ✅* | ✅ |
| Offline store (static bundle / Core Data / Room) | ✅ static | ✅ bundle | ✅ assets |
| Repository over Manifest | ✅ | ✅* | ✅ |
| Calendar overlay (lunar month → songs) | ✅ | — | — |
| Home renders the calendar (month + songs) | ✅ | — | — |
| Recently played (device-local history) | ✅ | — | — |
| Search (fuzzy) | — | — | — |

> **Data layer: all 3 platforms done.** Web ✅ `pnpm build` 713 pages. Android ✅ `assembleDebug`
> + tests, APK packs 703 songs. iOS ✅* typecheck clean + decode harness (full build sandbox-blocked;
> confirm on a real Xcode machine).

### Screen specs (`docs/screens/`)

| Screen | Web | iOS | Android |
|--------|-----|-----|---------|
| song-detail (v3) | ✅ | ✅* | ✅ |
| songs-list / library | ✅ | ✅* | ✅ |
| authors | ✅ | ✅* | ✅ |
| search | ✅ | ✅ | ✅ |
| settings | ✅ | ✅* | ✅ |
| theme (Gaura/Shyam) | ✅ | ✅* | ✅ |
| home (v3 — re-purposed) | ✅ | — | — |
| today (v1) — embedded as home §1 | ✅ | — | — |
| navigation (v1) | ✅ | ✅*ᶠ | ✅ᶠ |
| about / contact (v1) | ✅ | — | — |
| components (v1) | ✅ | — | — |
| collections / books / topics | ✅ | ✅* | ✅ |
| artist/book images | ✅ | ✅* | ✅ |
| unit tests | ✅ 43 | ✅* | ✅ 14 |
| resources | 🔨 | — | — |
| player / now-playing | ✅ | ✅* | ✅ |

Legend: `✅` verified · `✅*` iOS typecheck+harness (full `xcodebuild` sandbox-blocked; confirm on a real
Xcode machine) · `ᵖ` theme-polish pass in progress · `🔨` browse conformance+polish in progress (fresh
agents running) · `∅` empty-state by design — corpus ships no group data · `🚧` blocked on the audio-host
URL · `🔜` queued (spec ready; dispatch after the browse pass) · `—` not applicable / not on that platform.

**Web v2–v4 overhaul (build+screenshot/CDP verified):** top bar removed; search is a **centered
command-palette modal** (`SearchModal.tsx`, ⌘K / sidebar / mobile header, client index
`/search-listings.json`); a modern **collapsible** sidebar (`Sidebar.tsx` — icon-rail toggle, persisted;
theme toggle labelled **Gaura/Shyam** and previews the other theme's colour on hover). The three player
surfaces unified into one bottom-right **mini-player** (`PlayerWidget.tsx` v4, see
[player.md](screens/player.md)): smaller FAB, **hidden on non-song pages unless playing**, artwork,
**2-line/marquee title**, author, **scrubber**, and **loop / download / share** controls; reciters +
volume removed; **share** copies a `?play=<track>` deep link that cues+plays on arrival (autoplay-block →
paused). Icons standardized on **Lucide** (cross-platform — `icons/SidebarIcons.tsx` now wraps it).
**book/topic detail routes** (`books/[id]`, `topics/[id]`); desktop **Settings** with a live annotated
sample verse ([settings.md](screens/settings.md) v2); author names romanized everywhere; a build-time
**`.md` export** ([markdown-export.md](screens/markdown-export.md)). iOS/Android keep the v1 layouts.

---

## Song Component

### Data Models

| Concept | iOS (Swift) | Android (Java/Kotlin) | Web (TypeScript) |
|---------|-------------|----------------|------------------|
| Simple Song Model | [`Song.swift`](/ios/gk-ios/Models/Song.swift) | [`Song.java`](/android/app/src/main/java/com/gaudiyakirtan/models/Song.java) & [`SongModel.kt`](/android/app/src/main/java/com/gaudiyakirtan/models/SongModel.kt) | [`Song.ts`](/web/src/models/Song.ts) - `ISong` |
| Extended Song Model | [`Verse.swift`](/ios/gk-ios/Models/Verse.swift) | [`ExtendedSong`](/android/app/src/main/java/com/gaudiyakirtan/models/Song.java) & [`ExtendedSongModel`](/android/app/src/main/java/com/gaudiyakirtan/models/SongModel.kt) | [`IExtendedSong`](/web/src/models/Song.ts) |
| Verse Model | [`Transliteration`, `WordToWord`, `Translation`](/ios/gk-ios/Models/Verse.swift) | [`Verse`](/android/app/src/main/java/com/gaudiyakirtan/models/Song.java) & [`VerseModel`](/android/app/src/main/java/com/gaudiyakirtan/models/SongModel.kt) | [`IVerse`](/web/src/models/Song.ts) |

### UI Components

| Concept | iOS (Swift) | Android (Java/Kotlin) | Web (TypeScript) |
|---------|-------------|----------------|------------------|
| Song List Item | [`SongCard.swift`](/ios/gk-ios/Views/Components/SongCard.swift) | Java: [`item_song.xml`](/android/app/src/main/res/layout/item_song.xml)<br>Compose: [`SongCard.kt`](/android/app/src/main/java/com/gaudiyakirtan/ui/components/SongCard.kt) | [`SongListItem.tsx`](/web/src/components/SongListItem.tsx) |
| Verse Display | [`VerseView.swift`](/ios/gk-ios/Views/Sections/VerseView.swift) | Java: [`item_verse.xml`](/android/app/src/main/res/layout/item_verse.xml)<br>Compose: [`VerseView.kt`](/android/app/src/main/java/com/gaudiyakirtan/ui/components/VerseView.kt) | [`VerseListItem.tsx`](/web/src/components/VerseListItem.tsx) |

### Screens/Pages

| Concept | iOS (Swift) | Android (Java/Kotlin) | Web (TypeScript) |
|---------|-------------|----------------|------------------|
| Home Screen | [`HomeView.swift`](/ios/gk-ios/Views/HomeView/HomeView.swift) | Java: [`MainActivity`](/android/app/src/main/java/com/gaudiyakirtan/MainActivity.java)<br>Compose: [`HomeScreen.kt`](/android/app/src/main/java/com/gaudiyakirtan/ui/screens/HomeScreen.kt) | [`index.tsx`](/web/src/pages/index.tsx) |
| Song Detail Screen | Part of [`HomeView.swift`](/ios/gk-ios/Views/HomeView/HomeView.swift) | Java: [`SongDetailActivity`](/android/app/src/main/java/com/gaudiyakirtan/SongDetailActivity.java)<br>Compose: [`SongDetailScreen.kt`](/android/app/src/main/java/com/gaudiyakirtan/ui/screens/SongDetailScreen.kt) | [`[id].tsx`](/web/src/pages/songs/[id].tsx) |

## View Models / State Management

| Concept | iOS (Swift) | Android (Java/Kotlin) | Web (TypeScript) |
|---------|-------------|----------------|------------------|
| Home Data | [`HomeViewModel.swift`](/ios/gk-ios/ViewModels/HomeViewModel.swift) | Compose: State in [`MainActivity.kt`](/android/app/src/main/java/com/gaudiyakirtan/MainActivity.kt) | Props in [`index.tsx`](/web/src/pages/index.tsx) |

## Navigation

| Concept | iOS (Swift) | Android (Java/Kotlin) | Web (TypeScript) |
|---------|-------------|----------------|------------------|
| Main Navigation | [`AppNavigation.swift`](/ios/gk-ios/Navigation/AppNavigation.swift) (TabView) | Compose: NavHost in [`MainActivity.kt`](/android/app/src/main/java/com/gaudiyakirtan/MainActivity.kt) | Next.js Router in [`_app.tsx`](/web/src/pages/_app.tsx) |

## Implementation Notes

### iOS (Swift)
- Uses SwiftUI framework with MVVM architecture
- Implements custom design system with color assets
- Uses TabView for main navigation
- Currently most functionality is in HomeView
- Uses ObservableObject for view models

### Android (Java/Kotlin)
- **Two implementations:**
  1. Traditional Java implementation with XML layouts and RecyclerView
  2. Modern Kotlin implementation with Jetpack Compose UI
- Java implementation follows Activity/Adapter pattern
- Compose implementation uses declarative UI with Navigation components
- Both share common data models, with converters between Java and Kotlin types

### Web (TypeScript/React)
- Uses Next.js framework with React
- Uses TailwindCSS for styling
- Implements static generation with dynamic paths for song detail pages
- Uses CSS variables for consistent theming

## Theme

All platforms use a consistent color scheme derived from the iOS implementation:

| Name | Light Mode | Dark Mode | Purpose |
|------|------------|-----------|---------|
| Primary | #1A1A1A | #E0E0E0 | Primary text and important content |
| Background | #FFF4E8 | #191919 | Main background color |
| BackgroundOffset | #F6EDDF | #252525 | Secondary background for cards and UI elements |
| Highlight | #B36B00 | #8CB4FF | Accent color for important elements and links |
| Neutral | #6E6E6E | #9B9B9B | Secondary text and less important content |

See [Colors Documentation](/docs/theme/colors.md) for implementation details across platforms.

## Cross-Platform Conventions

To maintain consistency across platforms:

1. **Naming Conventions**: All implementations use similar naming patterns (Song, Verse, etc.)
2. **Data Structure**: The data models mirror each other across platforms
3. **UI Structure**: Similar component hierarchy is maintained in all platforms
4. **Color Scheme**: All platforms use the same colors based on iOS design
5. **Offline Support**: All implementations are designed to work offline (to be implemented)

## Implementation Roadmap

Future implementations should focus on:

1. Adding local storage for offline support:
   - iOS: Core Data
   - Android: Room Database
   - Web: IndexedDB
2. Implementing a common API client for all platforms
3. Adding audio playback functionality
4. Implementing search and filtering features
5. Completing the detail view for individual songs