# iOS Implementation

This document details the iOS implementation of the Gaudiya Kirtan application.

## Project Structure

The iOS app follows SwiftUI architecture with MVVM pattern:

```
ios/gk-ios/
├── Assets.xcassets/       # Images and color assets
├── Models/                # Data models
├── ViewModels/            # View models
├── Views/                 # UI components
│   ├── Components/        # Reusable components
│   ├── HomeView/          # Main home screen
│   ├── Sections/          # Shared section views
│   └── Settings/          # Settings screens
├── Navigation/            # App navigation
└── Preview Content/       # SwiftUI previews
```

## Key Components

### Entry Point

- [gk_iosApp.swift](/ios/gk-ios/gk_iosApp.swift) - Application entry point using SwiftUI App protocol
- [AppNavigation.swift](/ios/gk-ios/Navigation/AppNavigation.swift) - Tab-based navigation

### Views

- [HomeView.swift](/ios/gk-ios/Views/HomeView/HomeView.swift) - Main home screen
- [SongCard.swift](/ios/gk-ios/Views/Components/SongCard.swift) - Reusable song card component
- [VerseView.swift](/ios/gk-ios/Views/Sections/VerseView.swift) - Verse display component

### Data Models

- [Song.swift](/ios/gk-ios/Models/Song.swift) - Song data model
- [Verse.swift](/ios/gk-ios/Models/Verse.swift) - Verse data model with transliterations and translations

### View Models

- [HomeViewModel.swift](/ios/gk-ios/ViewModels/HomeViewModel.swift) - View model for the home screen

## Theme

The iOS app defines a comprehensive color scheme in the Assets catalog:

- **Primary**: Text color (#1A1A1A in light mode, #E0E0E0 in dark mode)
- **Background**: Main background color (#FFF4E8 in light mode, #191919 in dark mode)
- **BackgroundOffset**: Secondary background color (#F6EDDF in light mode, #252525 in dark mode)
- **Highlight**: Accent color (#B36B00 in light mode, #8CB4FF in dark mode)
- **Neutral**: Secondary text color (#6E6E6E in light mode, #9B9B9B in dark mode)

These colors are available through SwiftUI's Color extension and are consistently used throughout the app.

## Navigation

The app uses a tab-based navigation with the following tabs:
- Home - Main song exploration screen
- Library - (Planned) Library view
- Collection - (Planned) User's collection
- Search - (Planned) Search functionality

## Code Pointers

### Song Model

```swift
// See: /ios/gk-ios/Models/Song.swift
struct Song: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let author: String
    let uid: String
    let audio: Bool
    let tags: [String]
}
```

### Song Card Component

```swift
// See: /ios/gk-ios/Views/Components/SongCard.swift
struct SongCard: View {
    let song: Song
    
    var body: some View {
        HStack {
            // Main content
            VStack(alignment: .leading, spacing: 4) {
                // Title and UID row
                HStack(alignment: .center) {
                    Text(song.title)
                        .font(.system(size: 14))
                        .foregroundColor(Color.primary)
                    
                    Text(song.uid)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(Color.neutral)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 2)
                        .background(Color.neutral.opacity(0.25))
                        .cornerRadius(11)
                }
                
                // Author and audio icon
                HStack(spacing: 6) {
                    Text(song.author)
                        .font(.system(size: 14))
                        .foregroundColor(Color.neutral)
                    
                    if song.audio {
                        Image(systemName: "music.note")
                            .font(.system(size: 12))
                            .foregroundColor(Color.neutral)
                    }
                }
            }
            
            // Tags
            HStack(spacing: 4) {
                ForEach(song.tags, id: \.self) { tag in
                    Text(tag)
                        .font(.system(size: 12))
                        .foregroundColor(Color.neutral)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.neutral.opacity(0.25))
                        .cornerRadius(10)
                }
            }
        }
        .frame(height: 56)
        .padding(.horizontal, 10)
        .background(Color.backgroundOffset)
        .cornerRadius(12)
    }
}
```

### Verse View Component

```swift
// See: /ios/gk-ios/Views/Sections/VerseView.swift
struct VerseView: View {
    let verse: Verse
    private let selectedLanguage = "en"  // Default language
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Original Text
            if !verse.original.isEmpty {
                VStack(spacing: 4) {
                    ForEach(verse.original, id: \.self) { line in
                        Text(line)
                            .font(.system(size: 14))
                            .foregroundColor(Color.neutral)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
            }
            
            // Transliterations, Word-to-Word, Translations
            // ...
        }
    }
}
```