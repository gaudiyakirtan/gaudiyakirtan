package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.*

/**
 * Sample data provider for the Gaudiya Kirtan application
 * Contains test data for the application that matches format across all platforms
 */
object SampleData {
    
    val authors = listOf(
        Author(name = "Śrīla Locana Dāsa Ṭhākura", image = "locana_das"),
        Author(name = "Narottama Dāsa Ṭhākura", image = "narottama_das"),
        Author(name = "Bhaktivinoda Ṭhākura", image = "bhaktivinoda"),
        Author(name = "Govinda Dāsa", image = "govinda_das"),
        Author(name = "Vāsudeva Ghoṣa", image = "vasudeva_ghosh"),
        Author(name = "Śrīla Rūpa Gosvāmī", image = "rupa_goswami")
    )

    val topics = listOf(
        Topic(name = "Sri Guru"),
        Topic(name = "Vaisnavas"),
        Topic(name = "Sri Gadadhara"),
        Topic(name = "Sri Gaura"),
        Topic(name = "Sri Krishna"),
        Topic(name = "Bhajan")
    )

    val books = listOf(
        Book(
            title = "Gītāvalī",
            author = "Bhaktivinoda Ṭhākura",
            slug = "gitavali",
            uid = "BVT001",
            image = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bhaktivinoda_Thakur_1884.jpg/330px-Bhaktivinoda_Thakur_1884.jpg"
        ),
        Book(
            title = "Śaraṇāgati",
            author = "Bhaktivinoda Ṭhākura",
            slug = "saranagati",
            uid = "BVT002",
            image = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Jayadharma_chant_1975.jpg/330px-Jayadharma_chant_1975.jpg"
        ),
        Book(
            title = "Prārthanā",
            author = "Narottama Dāsa Ṭhākura",
            slug = "prarthana",
            uid = "NDT001",
            image = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Narottama_Das_Thakur.png/330px-Narottama_Das_Thakur.png"
        ),
        Book(
            title = "Prema-bhakti-candrikā",
            author = "Narottama Dāsa Ṭhākura",
            slug = "prema-bhakti",
            uid = "NDT002",
            image = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Chaitanya_with_Four_Associates_-_Pancha_Tattva.jpg/330px-Chaitanya_with_Four_Associates_-_Pancha_Tattva.jpg"
        )
    )

    val songs = listOf(
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

    val verses = listOf(
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