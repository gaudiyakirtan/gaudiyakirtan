package com.gaudiyakirtan.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
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
                Column(
                    modifier = Modifier
                ) {
                    SongsSection(songs = songs)
                    AuthorsSection(authors = authors)
                    TopicsSection(topics = topics)
                    BooksSection(books = books)
                    Column() {
                        Text(
                            text = "Akrodha Paramānanda",
                            style = MaterialTheme.typography.headlineMedium,
                            color = MaterialTheme.colorScheme.primary
                        )

                        Text(
                            text = "Śrīla Locana Dāsa Ṭhākura",
                            style = MaterialTheme.typography.titleMedium
                        )

                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            shape = MaterialTheme.shapes.small
                        ) {
                            Text(
                                text = "N9",
                                style = MaterialTheme.typography.labelSmall,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 2.dp)
                            )
                        }

                        verses.forEach { verse ->
                            VerseView(verse = verse)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    MyApplicationTheme {
        Greeting("Android")
    }
}