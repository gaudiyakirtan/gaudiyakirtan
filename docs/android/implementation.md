# Android Implementation

This document details the Android implementation of the Gaudiya Kirtan application.

## Modern Implementation With Jetpack Compose

The Android app now uses a modern, Kotlin-only implementation with Jetpack Compose:

- **Declarative UI with Jetpack Compose**: Building UI components using a modern, declarative approach
- **Material 3 Design System**: Using the latest Material Design guidelines
- **MVVM Architecture**: Clean separation of concerns with ViewModels
- **Navigation Component**: Type-safe navigation between screens
- **Consistent Cross-Platform Structure**: Matching the folder structure and patterns of iOS and web versions

## Project Structure

The Android application follows a modular structure that aligns with the iOS and web implementations:

```
android/
├── app/
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── gaudiyakirtan/
│           │           ├── data/
│           │           │   └── SampleData.kt         # Sample data provider (similar to web sampleData.ts)
│           │           ├── models/                   # Data models matching iOS and web
│           │           │   ├── Author.kt
│           │           │   ├── Book.kt
│           │           │   ├── Song.kt
│           │           │   ├── Topic.kt
│           │           │   └── Verse.kt
│           │           ├── navigation/               # Navigation system
│           │           │   └── AppNavigation.kt      # Central navigation component
│           │           ├── services/                 # API and storage services
│           │           ├── utils/                    # Utility functions
│           │           └── ui/                       # UI components
│           │               ├── components/           # Reusable UI components
│           │               │   ├── AuthorCard.kt
│           │               │   ├── BookCard.kt
│           │               │   ├── SongCard.kt
│           │               │   ├── TopicCard.kt
│           │               │   └── VerseView.kt
│           │               ├── home/                 # Home screen
│           │               │   ├── HomeScreen.kt
│           │               │   └── HomeViewModel.kt
│           │               ├── sections/             # Content sections
│           │               │   ├── AuthorsSection.kt
│           │               │   ├── BooksSection.kt
│           │               │   ├── SongsSection.kt
│           │               │   └── TopicsSection.kt
│           │               └── theme/                # Theming
│           │                   ├── Color.kt
│           │                   ├── Theme.kt
│           │                   └── Type.kt
│           └── res/
│               ├── drawable/                         # Icons and graphics
│               │   ├── ic_home.xml
│               │   ├── ic_library.xml
│               │   ├── ic_search.xml
│               │   └── ic_settings.xml
│               └── values/                           # Resource values
│                   └── colors.xml                    # Color resources
```

## Architecture

The Android application follows the MVVM (Model-View-ViewModel) architecture pattern:

- **Models**: Data classes representing application entities
- **Views**: Compose UI components that display data
- **ViewModels**: State holders for UI components that manage business logic

## Data Models

The data models are designed to be consistent across all platforms:

```kotlin
// Author.kt
data class Author(
    val name: String,
    val image: String? = null,
    val books: List<String> = emptyList()
)

// Song.kt
data class Song(
    val title: String,
    val author: String,
    val uid: String,
    val audio: Boolean = false,
    val tags: List<String> = emptyList()
)

// Plus additional models for Book, Topic, Verse, etc.
```

## Key Components

### Navigation

The application uses Jetpack Navigation Compose for navigation between screens, matching the iOS implementation with identical tabs and navigation structure:

```kotlin
// AppNavigation.kt - Navigation Tabs matching iOS implementation
sealed class Tab(
    val route: String, 
    val outlineIcon: Int, 
    val filledIcon: Int, 
    val label: String
) {
    object Home : Tab("home", R.drawable.ic_home, R.drawable.ic_home_filled, "Home")
    object Library : Tab("library", R.drawable.ic_library, R.drawable.ic_library_filled, "Library")
    object Collection : Tab("collection", R.drawable.ic_stack, R.drawable.ic_stack_filled, "Collection")
    object Search : Tab("search", R.drawable.ic_search, R.drawable.ic_search_filled, "Search")
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val items = listOf(Tab.Home, Tab.Library, Tab.Collection, Tab.Search)
    
    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.background) {
                // Navigation items with filled/outline icons matching iOS
                items.forEach { tab ->
                    val selected = currentDestination?.hierarchy?.any { 
                        it.route == tab.route 
                    } == true
                    
                    NavigationBarItem(
                        icon = { 
                            Icon(
                                painter = painterResource(
                                    id = if (selected) tab.filledIcon else tab.outlineIcon
                                ), 
                                contentDescription = tab.label
                            ) 
                        },
                        label = { Text(tab.label) },
                        selected = selected,
                        onClick = { /* Navigation logic */ }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Tab.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Tab.Home.route) { HomeScreen() }
            composable(Tab.Library.route) { /* Library screen */ }
            composable(Tab.Collection.route) { /* Collection screen */ }
            composable(Tab.Search.route) { /* Search screen */ }
        }
    }
}
```

### Theming

The application uses Material Design 3 with a custom color scheme that matches iOS and web implementations:

```kotlin
// Color.kt
// Light theme colors (Gaur)
val GaurPrimary = Color(0xFF1A1A1A)
val GaurSecondary = Color(0xFF3A3A3A)
val GaurTertiary = Color(0xFF1A1A1A)
val GaurAccent = Color(0xFFB36B00)
val GaurHighlight = Color(0xFFB36B00)
val GaurBackground = Color(0xFFFFF4E8)
val GaurBackgroundOffset = Color(0xFFF6E5D1)
val GaurBorder = Color(0xFFE6D7C3)
val GaurNeutral = Color(0xFF6E6E6E)

// Dark theme colors (Shyam)
val ShyamPrimary = Color(0xFFE0E0E0)
val ShyamSecondary = Color(0xFFB8B8B8)
val ShyamTertiary = Color(0xFF9B9B9B)
val ShyamAccent = Color(0xFF8CB4FF)
val ShyamHighlight = Color(0xFF8CB4FF)
val ShyamBackground = Color(0xFF191919)
val ShyamBackgroundOffset = Color(0xFF202020)
val ShyamBorder = Color(0xFF333333)
val ShyamNeutral = Color(0xFF9B9B9B)
```

### Home Screen

The Home screen displays content sections to match iOS and web:

```kotlin
// HomeScreen.kt
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = viewModel()
) {
    val songs by viewModel.songs.collectAsState()
    val authors by viewModel.authors.collectAsState()
    val topics by viewModel.topics.collectAsState()
    val books by viewModel.books.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        SongsSection(songs = songs)
        AuthorsSection(authors = authors)
        TopicsSection(topics = topics)
        BooksSection(books = books)
    }
}
```

### Sample Components

**Song Card:**

```kotlin
@Composable
fun SongCard(
    song: Song,
    onClick: () -> Unit = {}
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surfaceVariant,
        shape = MaterialTheme.shapes.medium,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = song.title,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = song.author,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            
            Surface(
                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
                shape = MaterialTheme.shapes.small
            ) {
                Text(
                    text = song.uid,
                    style = MaterialTheme.typography.labelSmall,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}
```

## Data Flow

Data is provided through ViewModels that connect to the SampleData source (will eventually connect to repositories):

```kotlin 
class HomeViewModel : ViewModel() {
    private val _songs = MutableStateFlow<List<Song>>(emptyList())
    private val _authors = MutableStateFlow<List<Author>>(emptyList())
    private val _topics = MutableStateFlow<List<Topic>>(emptyList())
    private val _books = MutableStateFlow<List<Book>>(emptyList())
    
    val songs: StateFlow<List<Song>> = _songs
    val authors: StateFlow<List<Author>> = _authors
    val topics: StateFlow<List<Topic>> = _topics
    val books: StateFlow<List<Book>> = _books
    
    init {
        loadData()
    }
    
    private fun loadData() {
        _authors.value = SampleData.authors
        _topics.value = SampleData.topics
        _books.value = SampleData.books
        _songs.value = SampleData.songs
    }
}
```

## Cross-Platform Consistency

The Android implementation maintains consistency with iOS and web implementations through:

1. **Matching Data Models**: Using identical data structures
2. **Similar UI Structure**: Screen layouts follow the same organizational pattern
3. **Consistent Theming**: Using the same color scheme (Gaur for light theme, Shyam for dark theme)
4. **Parallel Component Architecture**: Components like cards and sections have matching counterparts

## Future Enhancements

- Implement offline data storage with Room Database
- Add synchronization with backend services
- Implement search functionality
- Add detailed song and author views
- Support for audio playback of songs