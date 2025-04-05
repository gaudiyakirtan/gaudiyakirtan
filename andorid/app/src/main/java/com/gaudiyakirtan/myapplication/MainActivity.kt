package com.gaudiyakirtan.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.automirrored.filled.LibraryBooks
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.automirrored.outlined.LibraryBooks
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Storage
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.ui.sections.SongsSection
import com.gaudiyakirtan.myapplication.ui.theme.MyApplicationTheme

import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.VerseView
import com.gaudiyakirtan.myapplication.ui.sections.*

class MainActivity : ComponentActivity() {
    var authors = listOf(
            Author(name = "Śrīla Locana Dāsa Ṭhākura", image = "locana_das"),
            Author(name = "Narottama Dāsa Ṭhākura", image = "narottama_das"),
            Author(name = "Bhaktivinoda Ṭhākura", image = "bhaktivinoda"),
            Author(name = "Govinda Dāsa", image = "govinda_das"),
            Author(name = "Vāsudeva Ghoṣa", image = "vasudeva_ghosh"),
            Author(name = "Śrīla Rūpa Gosvāmī", image = "rupa_goswami")
        )

    var topics= listOf(
            Topic(name = "Sri Guru"),
            Topic(name = "Vaisnavas"),
            Topic(name = "Sri Gadadhara"),
            Topic(name = "Sri Gaura"),
            Topic(name = "Sri Krishna"),
            Topic(name = "Bhajan")
        )

    var books = listOf(
        Book(
            title = "Gītāvalī",
            author = "Bhaktivinoda Ṭhākura",
            slug = "gitavali",
            uid = "BVT001",
            image = "https://swamitripurari.com/wp-content/uploads/2011/01/nama-dharma.jpg"
        ),
        Book(
            title = "Śaraṇāgati",
            author = "Bhaktivinoda Ṭhākura",
            slug = "saranagati",
            uid = "BVT002",
            image = "https://bhaktivinodainstitute.org/wp-content/uploads/2022/07/JAIVA-DHARMA-1024x600.jpg"
        ),
        Book(
            title = "Prārthanā",
            author = "Narottama Dāsa Ṭhākura",
            slug = "prarthana",
            uid = "NDT001",
            image = "https://i1.sndcdn.com/artworks-qmLFQ1cOC0F9szhF-kmywsQ-t500x500.jpg"
        ),
        Book(
            title = "Prema-bhakti-candrikā",
            author = "Narottama Dāsa Ṭhākura",
            slug = "prema-bhakti",
            uid = "NDT002",
            image = "https://i.pinimg.com/736x/a9/18/c0/a918c08bd24e65f760490898affbb6d1.jpg"
        )
    )

    var songs = listOf(
        Song(
            title = "Akrodha Paramānanda",
            author = "Śrīla Locana Dāsa Ṭhākura",
            uid = "N9",
            audio = true,
            tags = listOf("Nityananda", "Bhakti", "Mercy")
        ),
        Song(
            title = "Emona Durmati",
            author = "Bhaktivinoda Ṭhākura",
            uid = "N15",
            audio = true,
            tags = listOf("Devotional", "Worship", "Prayer")
        ),
        Song(
            title = "Gaurangera Duti Pada",
            author = "Narottama Dāsa Ṭhākura",
            uid = "N23",
            audio = true,
            tags = listOf("Gauranga", "Chanting", "Names")
        )
    )

    var verses = listOf(
        Verse(
            language = "bengali",
            original = listOf(
                "akrodha paramānanda nityānanda rāy",
                "abhimāna-śūnya nitāi nagare beḍāy"
            ),
            transliterations = listOf(
                Transliteration(
                    language = "en",
                    text = listOf(
                        "akrodha paramānanda nityānanda rāy",
                        "abhimāna-śūnya nitāi nagare beḍāy"
                    )
                )
            ),
            wordToWords = listOf(
                WordToWord(
                    language = "en",
                    words = listOf(
                        listOf("akrodha", "never angry"),
                        listOf("paramānanda", "most blissful"),
                        listOf("nityānanda", "Lord Nityananda"),
                        listOf("rāy", "Ray")
                    )
                )
            ),
            translations = listOf(
                Translation(
                    language = "en",
                    text = "Lord Nityananda, who is never angry and supremely blissful, wanders through the town free from all false pride."
                )
            )
        )
    )
    

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                GaudiyaKirtanApp(
                    songs = songs,
                    authors = authors,
                    topics = topics,
                    books = books,
                    verses = verses
                )
            }
        }
    }
}

enum class BottomNavItem(
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    HOME("Home", Icons.Filled.Home, Icons.Outlined.Home),
    LIBRARY("Library", Icons.AutoMirrored.Filled.LibraryBooks, Icons.AutoMirrored.Outlined.LibraryBooks),
    COLLECTION("Collection", Icons.Filled.Storage, Icons.Outlined.Storage),
    SEARCH("Search", Icons.Filled.Search, Icons.Outlined.Search)
}

@Composable
fun GaudiyaKirtanApp(
    songs: List<Song>,
    authors: List<Author>,
    topics: List<Topic>,
    books: List<Book>,
    verses: List<Verse>
) {
    var selectedTab by remember { mutableStateOf(BottomNavItem.HOME) }
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                BottomNavItem.values().forEach { item ->
                    NavigationBarItem(
                        selected = selectedTab == item,
                        onClick = { selectedTab = item },
                        icon = { 
                            Icon(
                                imageVector = if (selectedTab == item) item.selectedIcon else item.unselectedIcon,
                                contentDescription = item.title
                            ) 
                        },
                        label = { Text(text = item.title) }
                    )
                }
            }
        }
    ) { paddingValues ->
        when (selectedTab) {
            BottomNavItem.HOME -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .verticalScroll(rememberScrollState())
                ) {
                    // Home screen content with spacing
                    Text(
                        text = "Topics",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(16.dp, 16.dp, 16.dp, 8.dp)
                    )
                    TopicsSection(topics = topics)
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(
                        text = "Authors",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(16.dp, 16.dp, 16.dp, 8.dp)
                    )
                    AuthorsSection(authors = authors)
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(
                        text = "Books",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(16.dp, 16.dp, 16.dp, 8.dp)
                    )
                    BooksSection(books = books)
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(
                        text = "Songs",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(16.dp, 16.dp, 16.dp, 8.dp)
                    )
                    SongsSection(songs = songs)
                    
                    Spacer(modifier = Modifier.height(80.dp)) // Extra space at bottom
                }
            }
            BottomNavItem.LIBRARY -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    Text(
                        text = "Library Screen",
                        style = MaterialTheme.typography.headlineMedium,
                        modifier = Modifier.padding(16.dp)
                    )
                    // Library screen content will go here
                }
            }
            BottomNavItem.COLLECTION -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    Text(
                        text = "Collection Screen",
                        style = MaterialTheme.typography.headlineMedium,
                        modifier = Modifier.padding(16.dp)
                    )
                    // Collection screen content will go here
                }
            }
            BottomNavItem.SEARCH -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    Text(
                        text = "Search Screen",
                        style = MaterialTheme.typography.headlineMedium,
                        modifier = Modifier.padding(16.dp)
                    )
                    // Search screen content will go here
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun GaudiyaKirtanAppPreview() {
    val songs = listOf(
        Song(
            title = "Akrodha Paramānanda",
            author = "Śrīla Locana Dāsa Ṭhākura",
            uid = "N9",
            audio = true,
            tags = listOf("Nityananda", "Bhakti", "Mercy")
        )
    )
    
    val authors = listOf(
        Author(name = "Śrīla Locana Dāsa Ṭhākura", image = "locana_das")
    )
    
    val topics = listOf(
        Topic(name = "Sri Guru")
    )
    
    val books = listOf(
        Book(
            title = "Gītāvalī",
            author = "Bhaktivinoda Ṭhākura",
            slug = "gitavali",
            uid = "BVT001",
            image = ""
        )
    )
    
    val verses = listOf(
        Verse(
            language = "bengali",
            original = listOf("akrodha paramānanda"),
            transliterations = listOf(),
            wordToWords = listOf(),
            translations = listOf()
        )
    )
    
    MyApplicationTheme {
        GaudiyaKirtanApp(
            songs = songs,
            authors = authors,
            topics = topics,
            books = books,
            verses = verses
        )
    }
}