package com.gaudiyakirtan.myapplication.ui.home

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import com.gaudiyakirtan.myapplication.models.*

class HomeViewModel : ViewModel() {
    private val _songs = MutableStateFlow<List<Song>>(emptyList())
    private val _authors = MutableStateFlow<List<Author>>(emptyList())
    private val _topics = MutableStateFlow<List<Topic>>(emptyList())
    private val _books = MutableStateFlow<List<Book>>(emptyList())
    private val _verses = MutableStateFlow<List<Verse>>(emptyList())

    val songs: StateFlow<List<Song>> = _songs
    val authors: StateFlow<List<Author>> = _authors
    val topics: StateFlow<List<Topic>> = _topics
    val books: StateFlow<List<Book>> = _books
    val verses: StateFlow<List<Verse>> = _verses

    init {
        setupSampleData()
    }

    private fun setupSampleData() {
        _authors.value = listOf(
            Author(name = "Śrīla Locana Dāsa Ṭhākura", image = "locana_das"),
            Author(name = "Narottama Dāsa Ṭhākura", image = "narottama_das"),
            Author(name = "Bhaktivinoda Ṭhākura", image = "bhaktivinoda"),
            Author(name = "Govinda Dāsa", image = "govinda_das"),
            Author(name = "Vāsudeva Ghoṣa", image = "vasudeva_ghosh"),
            Author(name = "Śrīla Rūpa Gosvāmī", image = "rupa_goswami")
        )

        _topics.value = listOf(
            Topic(name = "Sri Guru"),
            Topic(name = "Vaisnavas"),
            Topic(name = "Sri Gadadhara"),
            Topic(name = "Sri Gaura"),
            Topic(name = "Sri Krishna"),
            Topic(name = "Bhajan")
        )

        _books.value = listOf(
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

        _songs.value = listOf(
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

        _verses.value = listOf(
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
    }
}