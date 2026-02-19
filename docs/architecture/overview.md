# Architecture Overview

This document provides an overview of the Gaudiya Kirtan application architecture across all platforms.

## Core Principles

1. **Platform-Native Implementations**: Each platform uses native technologies and follows platform-specific best practices.
2. **Consistent Data Models**: All platforms share the same data model structure (Song, Verse, Collection, Author, Topic, Book).
3. **Parallel Component Structure**: Similar components and screens exist across all platforms with consistent naming.
4. **Cross-Platform Feature Parity**: Features are implemented on all 3 platforms simultaneously.

## Code Structure

### iOS (Swift/SwiftUI)
- **Entry Point**: `ios/gk-ios/gk_iosApp.swift` — includes deep link handler (`onOpenURL`)
- **Navigation**: `ios/gk-ios/Navigation/AppNavigation.swift` — TabView with Home, Library, Collections, Search
- **Models**: `ios/gk-ios/Models/` — Song, Verse, Collection, SampleData
- **Views**: `ios/gk-ios/Views/` — organized by screen (HomeView, LibraryView, SongView, CollectionsView, Settings)
- **ViewModels**: `ios/gk-ios/ViewModels/` — HomeViewModel, LibraryViewModel, CollectionsViewModel
- **Components**: `ios/gk-ios/Views/Components/` — SongCard, SongListItem, AuthorCard, BookCard, TopicCard, Tag
- **Deployment Target**: iOS 16.0

### Android (Kotlin/Jetpack Compose)
- **Entry Point**: `andorid/app/src/main/java/com/gaudiyakirtan/myapplication/MainActivity.kt`
- **Navigation**: `andorid/app/src/main/java/com/gaudiyakirtan/navigation/AppNavigation.kt` — NavHost with tabs + deep link support
- **Models**: `andorid/app/src/main/java/com/gaudiyakirtan/myapplication/models/` — Song, Verse, Collection
- **Screens**: `andorid/app/src/main/java/com/gaudiyakirtan/myapplication/ui/` — home, library, song, collections
- **Components**: `andorid/app/src/main/java/com/gaudiyakirtan/myapplication/ui/components/` — SongCard, SongListItem, Tag, VerseView
- **Manifest**: `andorid/app/src/main/AndroidManifest.xml` — includes app link intent-filters
- **Target SDK**: 35, Min SDK: 24

### Web (React/Next.js/TypeScript)
- **Entry Point**: `web/src/pages/index.tsx`
- **Pages**: `web/src/pages/` — songs/[id], authors, books, topics, resources
- **Components**: `web/src/components/` — SongScreen, VerseListItem, HomeScreen, Layout, Sidebar
- **Models**: `web/src/models/` — Song.ts, Author.ts, Book.ts, Topic.ts
- **Data**: `web/src/data/sampleData.ts`
- **Framework**: Next.js 15.2.4, React 19, TailwindCSS 4

## Song View — Cross-Platform Feature Map

The song detail view is the richest screen, implemented consistently across all platforms:

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Centered title (highlight color) | SongView.swift | SongScreen.kt | SongScreen.tsx |
| Centered author | SongView.swift | SongScreen.kt | SongScreen.tsx |
| Verse rendering (4 layers) | VerseView.swift | SongScreen.kt (VerseSection) | VerseListItem.tsx |
| Aa reader settings popover | Overlay dropdown | DropdownMenu | Dropdown div |
| Font size slider (10-22pt) | Slider + Binding | Slider composable | range input |
| Layer toggles (script/translit/synonyms/translation) | Toggle switches | Switch composable | Custom toggle divs |
| Bookmark toggle | bookmark/bookmark.fill SF Symbol | Bookmark/BookmarkBorder icon | SVG filled/outline |
| Share with deep link | UIActivityViewController | Intent.ACTION_SEND | navigator.share / clipboard |
| Queue/tracks sheet | .sheet modal | ModalBottomSheet | Dropdown |
| Verse numbers | Appended to transliteration | Appended to transliteration | — |
| Em-dash word-to-word separator | \u{2014} | \u2014 | \u2014 |
| Tab bar hidden on song view | .toolbar(.hidden, for: .tabBar) | isOnMainTab check | N/A (sidebar layout) |

## Deep Linking

Universal link format: `https://gaudiyakirtan.com/songs/{uid}`

| Platform | Mechanism | Config File |
|----------|-----------|-------------|
| iOS | Universal Links via `onOpenURL` | `web/public/.well-known/apple-app-site-association` |
| Android | App Links via intent-filter + navDeepLink | `web/public/.well-known/assetlinks.json` |
| Web | Next.js dynamic route `/songs/[id]` matches by both `id` and `uid` | — |

## Theming

Two themes supported across all platforms:

| Theme | Background | Primary Text | Highlight |
|-------|-----------|-------------|-----------|
| **Gaura** (Light) | #FFF4E8 | #1A1A1A | #B36B00 |
| **Shyam** (Dark) | #191919 | #E0E0E0 | #8CB4FF |

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Interface │     │  Business Logic  │     │    Data Layer    │
│  (Views/Pages)  │────▶│  (ViewModels)    │────▶│  (SampleData)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

Currently using in-memory sample data. Future: API + offline storage (Core Data / Room / IndexedDB).

## UI Design Reference

Figma mockups are cataloged in `Gaudiya Kirtan UI/UI_REFERENCE.md` with descriptions of all 68 design images organized by category (themes, navigation, screens, components, resources).
