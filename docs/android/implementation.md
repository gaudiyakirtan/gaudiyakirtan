# Android Implementation

This document details the Android implementation of the Gaudiya Kirtan application.

## Dual Implementation Approach

The Android app provides two implementation approaches:

1. **Traditional Java Implementation**:
   - Uses XML layouts and RecyclerView
   - Follows Activity/Fragment pattern
   - Suitable for developers familiar with traditional Android development

2. **Modern Kotlin with Jetpack Compose**:
   - Uses declarative UI with Jetpack Compose
   - Implements Navigation component for routing
   - Follows modern Android development practices

Both implementations share common data models and provide the same functionality.

## Project Structure

```
android/app/src/main/
├── java/com/gaudiyakirtan/
│   ├── models/             # Data models (Java & Kotlin)
│   ├── adapters/           # RecyclerView adapters (Java)
│   ├── ui/                 # UI components and screens
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # Full screens
│   │   └── theme/          # Theme and styling
│   ├── utils/              # Helper utilities
│   └── MainActivity.java/kt # App entry point
└── res/
    ├── layout/             # XML layouts for Java implementation
    ├── values/             # Resources (strings, colors, etc.)
    └── drawable/           # Images and drawables
```

## Key Components

### Data Models

- [Song.java](/android/app/src/main/java/com/gaudiyakirtan/models/Song.java) - Basic song model and extended song model with verses
- [SongModel.kt](/android/app/src/main/java/com/gaudiyakirtan/models/SongModel.kt) - Kotlin version with extension functions for interoperability

### Java Implementation

- [SongListAdapter.java](/android/app/src/main/java/com/gaudiyakirtan/adapters/SongListAdapter.java) - Adapter for RecyclerView to display songs
- [item_song.xml](/android/app/src/main/res/layout/item_song.xml) - Layout for song items in list
- [item_verse.xml](/android/app/src/main/res/layout/item_verse.xml) - Layout for verse display

### Kotlin/Compose Implementation

- [SongCard.kt](/android/app/src/main/java/com/gaudiyakirtan/ui/components/SongCard.kt) - Composable for displaying song items
- [VerseView.kt](/android/app/src/main/java/com/gaudiyakirtan/ui/components/VerseView.kt) - Composable for displaying verses
- [HomeScreen.kt](/android/app/src/main/java/com/gaudiyakirtan/ui/screens/HomeScreen.kt) - Main screen showing songs list
- [SongDetailScreen.kt](/android/app/src/main/java/com/gaudiyakirtan/ui/screens/SongDetailScreen.kt) - Detail screen for viewing a song

## Theme

The Android app uses a consistent color scheme based on the iOS design:

- **Primary**: Text color (#1A1A1A in light mode, #E0E0E0 in dark mode)
- **Background**: Main background color (#FFF4E8 in light mode, #191919 in dark mode)
- **BackgroundOffset**: Secondary background color (#F6EDDF in light mode, #252525 in dark mode)
- **Highlight**: Accent color (#B36B00 in light mode, #8CB4FF in dark mode)
- **Neutral**: Secondary text color (#6E6E6E in light mode, #9B9B9B in dark mode)

These colors are defined in:
- XML: [colors.xml](/android/app/src/main/res/values/colors.xml)
- Compose: [Theme.kt](/android/app/src/main/java/com/gaudiyakirtan/ui/theme/Theme.kt)

## Offline Storage

The Android app uses Room Database for offline storage:

```kotlin
// TODO: Implement Room Database for offline storage
```

## Navigation

For Compose implementation, navigation is handled using the Navigation component:

```kotlin
// See: /android/app/src/main/java/com/gaudiyakirtan/MainActivity.kt
NavHost(navController = navController, startDestination = "home") {
    composable("home") {
        HomeScreen(
            songs = songs,
            onSongClick = { song ->
                navController.navigate("song/${song.id}")
            }
        )
    }
    
    composable("song/{songId}") { backStackEntry ->
        val songId = backStackEntry.arguments?.getString("songId")
        // Song detail screen implementation...
    }
}
```

## Code Pointers

### Java Song Model

```java
// See: /android/app/src/main/java/com/gaudiyakirtan/models/Song.java
public class Song {
    private String id;
    private String title;
    private String author;
    private String lyrics;
    private List<String> tags;
    private Date dateAdded;
    private Boolean audio;
    
    // Constructor and getters...
}
```

### Kotlin Song Model

```kotlin
// See: /android/app/src/main/java/com/gaudiyakirtan/models/SongModel.kt
data class SongModel(
    val id: String,
    val title: String,
    val author: String,
    val lyrics: String,
    val tags: List<String>,
    val dateAdded: Date,
    val audio: Boolean? = false
)
```

### Compose Song Card

```kotlin
// See: /android/app/src/main/java/com/gaudiyakirtan/ui/components/SongCard.kt
@Composable
fun SongCard(
    song: SongModel,
    onClick: () -> Unit = {},
    showTags: Boolean = true
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
        shape = MaterialTheme.shapes.medium,
        onClick = onClick
    ) {
        // Component implementation...
    }
}
```