# Implementation Mapping

This document provides a mapping between equivalent components across all platform implementations. Use this as a reference to maintain consistency when implementing new features.

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