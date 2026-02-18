# UI Design Reference

This document catalogs all Figma UI design mockups for the Gaudiya Kirtan app. Reference these images when implementing features to match the intended design.

## Section Headers / Labels

| File | Description |
|------|-------------|
| `Components.png` | Section label "Components" (Figma section header) |
| `Desktop.png` | Section label "Desktop" (Figma section header) |
| `Mobile.png` | Section label "Mobile" (Figma section header) |

## Themes & Colors

| File | Description |
|------|-------------|
| `Colors.png` | Color palette with 13 hex color swatches used across the app (#1E3264, #BA5D07, #8D67AB, #B02897, #148A08, #D84000, #503750, #006450, #E91429, #537AA1, #2D46B9, #E1118C, #777777) |
| `Guar Theme.png` | Light theme (Gaura) color definitions: Background #FFF4E8, Background Offset #F6E5D1, Neutral #6E6E6E, Primary #1A1A1A, Highlight #B36B00 |
| `Shyam Theme.png` | Dark theme (Shyam) color definitions: Background #191919, Background Offset #202020, Neutral #9B9B9B, Primary #E0E0E0, Highlight #8CB4FF |

## Navigation

| File | Description |
|------|-------------|
| `mobile-menu.png` | Mobile bottom tab bar with 4 tabs: Home, Library, Collection, Search (dark theme, unselected state) |
| `Navigation.png` | Web sidebar navigation (dark/Shyam theme) — Home, Library (Songs/Authors/Topics/Books), Collections (expandable playlists), Resources (Verse Meters/Diacritic Guide/Pronunciation) |
| `Navigation-1.png` | Web sidebar navigation (light/Gaura theme) — same structure as above |
| `Navigation-2.png` | Mobile app empty screen with bottom tab bar (dark theme, Library tab selected) |
| `Navigation-3.png` | Mobile app empty screen with bottom tab bar (light theme, Home tab selected, with search bar and filter icon) |
| `Navigation-4.png` | Mobile app Library tab with category pills: Songs, Authors, Topics, Books (light theme) |
| `Navigation-5.png` | Now Playing mini bar component — shows song title, artist, queue and play button (dark theme) |
| `Sidebar.png` | Isolated sidebar/drawer component (light theme) — shows full navigation hierarchy |
| `Header.png` | Web top header bar with breadcrumb (Songs /), search bar (Cmd+K), and theme toggle |
| `Frame 15.png` | Mobile Library tab category selector pills: Songs, Authors, Topics, Books with filter icon (dark theme) |

## Icons

| File | Description |
|------|-------------|
| `home-filled.png` | Filled home icon (dark, for active tab state) |
| `library-filled.png` | Filled library/bucket icon (dark, for active tab state) |
| `stack-filled.png` | Filled stacked layers icon (dark, for Collections tab active state) |
| `stack.png` | Outline stacked layers icon (for Collections tab inactive state) |
| `search-filled.png` | Filled magnifying glass icon (for Search tab active state) |
| `trailingIcon2_.png` | Small trailing icon (filter/settings indicator) |

## Home Screen

| File | Description |
|------|-------------|
| `Home.png` | Web home page (dark/Shyam theme) — full layout with logo, Authors grid, Topics cards, Books row, Popular songs list with tags |
| `Home-1.png` | Web home page (light/Gaura theme) — same layout: Authors, Books, Trending songs list |
| `Home-2.png` | Mobile home screen (dark theme) — search bar, song grid (2x2), Authors horizontal scroll, Topics cards, Books row |

## Library

| File | Description |
|------|-------------|
| `Library.png` | Mobile Library tab - Songs view (dark theme) — alphabetical song list with A-Z side index, category pills at top |
| `Library_Songs.png` | Web Library - Songs page (dark theme) — song table with Title and Tags columns, sidebar navigation, search active |
| `Library (Author).png` | Mobile Library - Authors list (dark theme) — avatar + name rows |
| `Library (Author)-1.png` | Mobile Library - Author detail (dark theme) — author name, books horizontal scroll, collapsible song sections by book/language |
| `Library (Author)-2.png` | Mobile Library - Authors tab empty state (light theme) — search bar only |

## Song Views

| File | Description |
|------|-------------|
| `Song.png` | Web song detail with audio player (dark/Shyam theme) — Bengali original, transliteration, word-by-word, translation, audio tracks list on right, bottom player bar |
| `Song-1.png` | Web song detail with audio player (light/Gaura theme) — same layout as above |
| `Song-2.png` | Web song detail without audio (light/Gaura theme) — full verse display with play button in bottom-right corner |
| `Song-3.png` | Mobile song detail (dark theme) — top audio bar with playback controls (Aa, queue, bookmark, share), Bengali + transliteration + word-by-word + translation |
| `Song-4.png` | Mobile song detail (light/Gaura theme) — same as Song-3 |
| `Song (hidden song).png` | Web song detail (dark theme) — song without audio player, full verse layout |
| `song view.png` | Standalone song content view (dark theme, no chrome) — centered verse layout with all layers (original, transliteration, word-by-word, translation) |
| `Song Component (app).png` | Mobile song card component — compact card showing title, uid badge, author, audio icon (dark theme) |
| `Song Component (web).png` | Web song list row component — title, uid badge, author, audio icon, plus tags (Sanskrit, Stavamrta Lahari, etc.) |
| `Songs.png` | Song card grid component — 4 compact song cards in a horizontal row (dark theme) |
| `Song List.png` | Web songs grouped by topic view (dark theme) — collapsible sections (Sri Guru > Sanskrit Stotras, Bengali), songs with tags |
| `Song List-1.png` | Mobile songs grouped by topic view (dark theme) — same hierarchy in mobile format |
| `Flat Song List.png` | Web flat song list table (dark theme) — simple Title + Tags columns, no grouping |

## Collections

| File | Description |
|------|-------------|
| `Collections.png` | Mobile Collections tab (dark theme) — Bookmarks/Playlists toggle, collection cards grid (Favorites, Kartik Songs, IPBYS, Memorize), Now Playing mini bar at bottom |
| `Collections-1.png` | Mobile Collections tab empty state (light theme) — search bar with + button, Now Playing mini bar |

## Search

| File | Description |
|------|-------------|
| `Search.png` | Mobile Search with results (dark theme) — search query "akrodha parama nanda", song result list |
| `Search-1.png` | Mobile Search with query (light theme) — search query shown, no results displayed |

## Settings

| File | Description |
|------|-------------|
| `Settings.png` | Web Settings page (dark/Shyam theme) — Theme (Shyam), Language (English), Sanga (ISKCON) dropdowns, plus collapsible About/Report/Request/Contact/Donate sections |
| `Settings-1.png` | Web Settings page (light/Gaura theme) — same layout |
| `Settings-2.png` | Mobile Settings (dark theme) — same fields as web |
| `Settings-3.png` | Mobile Settings (light theme) — same fields |
| `Frame 291.png` | Settings content area component (dark theme) — isolated settings form without sidebar |

## Audio Player

| File | Description |
|------|-------------|
| `Player.png` | Full-screen audio player (dark theme) — artist photo, song title with heart/add buttons, progress bar, play/pause/skip/15s controls, track list with multiple recordings by different artists |
| `Now Playing.png` | Now Playing mini bar component (dark theme) — song title, artist, music note icon, play button |
| `Track.png` | Track list item component — artist photo, song name, uid badge (dark theme) |
| `Frame 75.png` | Web bottom audio player bar — play controls, progress bar (2:23/4:45), volume, song info with artist photo |

## Topics

| File | Description |
|------|-------------|
| `Topics.png` | Web Topics page (dark theme) — topic cards row (Sri Guru, Vaisnavas), expandable book sections below with songs grouped by language |

## Authors

| File | Description |
|------|-------------|
| `Authors.png` | Author circular avatar components — 4 author portraits in circular frames |
| `Frame 299.png` | Author circular avatar components — 3 overlapping author portraits |

## Books

| File | Description |
|------|-------------|
| `Frame 301.png` | Web Books section (dark theme) — book cover cards row + expandable book > language > song hierarchy with tags |
| `Frame 375.png` | Single book cover card component — "Gitamala" by Bhaktivinoda Thakur (purple gradient) |

## Reusable Components

| File | Description |
|------|-------------|
| `Frame 376.png` | Author card component — rounded rectangle with avatar + name (dark theme) |
| `Frame 377.png` | Topic card component — rounded rectangle with topic name "Sri Guru" (dark blue) |
| `Group 15.png` | Topic cards row — "Sri Guru", "Vaisnavas", "Sri Guru" in different colors |
| `Group 16.png` | Book cover cards row — 4 "Gitamala" covers in different colors (purple, violet, orange, green) |

## Resources

| File | Description |
|------|-------------|
| `Resources.png` | Mobile Resources - Verse Meter Guide (dark theme) — tabs for Verse Meters/Diacritic Guide/Pronunciation, Bengali verse meter explanation with syllable diagrams |
| `Resources-1.png` | Mobile Resources - Verse Meter Guide (light theme) — same content |
| `Frame 289.png` | Web Resources - Verse Meter Guide (dark theme) — wider layout of syllable diagrams |
