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
    
    val collections = listOf(
        Collection(
            name = "Favorites",
            type = CollectionType.BOOKMARK,
            songIds = listOf("LD1", "BVT1", "ND2")
        ),
        Collection(
            name = "Kartik Songs",
            type = CollectionType.PLAYLIST,
            songIds = listOf("N25", "ND3", "BVT14", "RG12")
        ),
        Collection(
            name = "IPBYS",
            type = CollectionType.PLAYLIST,
            songIds = listOf("RG01", "N1")
        ),
        Collection(
            name = "Memorize",
            type = CollectionType.BOOKMARK,
            songIds = listOf("BVT9", "ND2", "LD1")
        )
    )

    val books = listOf(
        Book(
            title = "Gītāvalī",
            author = "Bhaktivinoda Ṭhākura",
            slug = "gitavali",
            uid = "BVT001",
            image = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bhaktivinoda_Thakur_1884.jpg/330px-Bhaktivinoda_Thakur_1884.jpg",
            songCount = 28,
            year = "1893"
        ),
        Book(
            title = "Śaraṇāgati",
            author = "Bhaktivinoda Ṭhākura",
            slug = "saranagati",
            uid = "BVT002",
            image = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Jayadharma_chant_1975.jpg/330px-Jayadharma_chant_1975.jpg",
            songCount = 15,
            year = "1880"
        ),
        Book(
            title = "Prārthanā",
            author = "Narottama Dāsa Ṭhākura",
            slug = "prarthana",
            uid = "NDT001",
            image = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Narottama_Das_Thakur.png/330px-Narottama_Das_Thakur.png",
            songCount = 42,
            year = "1570"
        ),
        Book(
            title = "Prema-bhakti-candrikā",
            author = "Narottama Dāsa Ṭhākura",
            slug = "prema-bhakti",
            uid = "NDT002",
            image = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Chaitanya_with_Four_Associates_-_Pancha_Tattva.jpg/330px-Chaitanya_with_Four_Associates_-_Pancha_Tattva.jpg",
            songCount = 33,
            year = "1568"
        )
    )

    val songs = listOf(
        Song(
            title = "Akrodha Paramānanda",
            author = "Śrīla Locana Dāsa Ṭhākura",
            uid = "LD1",
            audio = true,
            tags = listOf("Nityananda", "Bhakti", "Mercy")
        ),
        Song(
            title = "Bhaja Govinda",
            author = "Śrīla Rūpa Gosvāmī",
            uid = "RG01",
            audio = true,
            tags = listOf("Krishna", "Govinda", "Bhajan")
        ),
        Song(
            title = "Cintāmaṇi",
            author = "Narottama Dāsa Ṭhākura",
            uid = "N25",
            audio = false,
            tags = listOf("Vrindavan", "Spiritual", "Devotion")
        ),
        Song(
            title = "Emona Durmati",
            author = "Bhaktivinoda Ṭhākura",
            uid = "BVT1",
            audio = true,
            tags = listOf("Devotional", "Worship", "Prayer")
        ),
        Song(
            title = "Gaurāṅga Bolite Habe",
            author = "Narottama Dāsa Ṭhākura",
            uid = "ND2",
            audio = true,
            tags = listOf("Gauranga", "Chanting", "Names")
        ),
        Song(
            title = "Hari Hari Bifale",
            author = "Narottama Dāsa Ṭhākura",
            uid = "N1",
            audio = true,
            tags = listOf("Devotional", "Spiritual", "Regret")
        ),
        Song(
            title = "Jaya Rādhā-Mādhava",
            author = "Bhaktivinoda Ṭhākura",
            uid = "BVT9",
            audio = true,
            tags = listOf("Radha", "Krishna", "Divine Couple")
        ),
        Song(
            title = "Manaḥ-śikṣā",
            author = "Śrīla Rūpa Gosvāmī",
            uid = "RG12",
            audio = false,
            tags = listOf("Instruction", "Mind", "Discipline")
        ),
        Song(
            title = "Śrī Rūpa Mañjarī Pada",
            author = "Narottama Dāsa Ṭhākura",
            uid = "ND3",
            audio = false,
            tags = listOf("Rupa Manjari", "Service", "Radha")
        ),
        Song(
            title = "Yasomati-nandana",
            author = "Bhaktivinoda Ṭhākura",
            uid = "BVT14",
            audio = true,
            tags = listOf("Krishna", "Yasoda", "Vrindavan")
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