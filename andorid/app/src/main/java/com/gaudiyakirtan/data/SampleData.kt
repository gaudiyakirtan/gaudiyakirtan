package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.*
import java.util.UUID

/**
 * Sample data provider for the Gaudiya Kirtan application
 * Contains test data for the application that matches format across all platforms
 */
object SampleData {
    
    // Sample authors from web implementation
    val authors = listOf(
        Author(name = "Bhaktivedanta Swami Prabhupada", 
               image = "https://satsvarupadasagoswami.com/wp-content/uploads/2017/01/SrilaPrabhupada.jpg"),
        Author(name = "Bhaktivinoda Thakura", 
               image = "https://premadharma.org/wp-content/uploads/2017/01/Srila-Bhakti-Vinod-Thakur-1.jpg"),
        Author(name = "Narottama Dasa Thakura", 
               image = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo_tUvLJlX7XaV4k4vq67yfawaMIO2s6-Plg&s"),
        Author(name = "Locana Dasa Thakura", 
               image = ""),
        Author(name = "Krishnadasa Kaviraja", 
               image = "https://krsnakatha.com/img/guru-parampara/Krishnadasa-Kaviraja-Goswami.jpg")
    )

    // Sample topics from web implementation
    val topics = listOf(
        Topic(name = "Sri Guru"),
        Topic(name = "Vaisnavas"),
        Topic(name = "Sri Gadadhara"),
        Topic(name = "Radha-Krishna"),
        Topic(name = "Gaura-lila"),
        Topic(name = "Prayers"),
        Topic(name = "Arati"),
        Topic(name = "Mangalacarana")
    )
    
    // Collections (Unique to Android implementation)
    val collections = listOf(
        Collection(
            name = "Favorites",
            type = CollectionType.BOOKMARK,
            songIds = listOf("N3", "S1", "E4")
        ),
        Collection(
            name = "Kartik Songs",
            type = CollectionType.PLAYLIST,
            songIds = listOf("SQ2", "L5")
        ),
        Collection(
            name = "IPBYS",
            type = CollectionType.PLAYLIST,
            songIds = listOf("E4", "N3")
        ),
        Collection(
            name = "Memorize",
            type = CollectionType.BOOKMARK,
            songIds = listOf("S1", "SQ2", "L5")
        )
    )

    // Sample books from web implementation
    val books = listOf(
        Book(
            title = "Kalyana Kalpataru",
            author = "Śrīla Bhaktivinoda Thakura",
            slug = "kalyana-kalpataru",
            uid = "BVT001",
            image = "https://swamitripurari.com/wp-content/uploads/2011/01/nama-dharma.jpg",
            songCount = 42,
            year = "1881"
        ),
        Book(
            title = "Jaiva Dharma",
            author = "Śrīla Bhaktivinoda Thakura",
            slug = "jaiva-dharma",
            uid = "BVT002",
            image = "https://bhaktivinodainstitute.org/wp-content/uploads/2022/07/JAIVA-DHARMA-1024x600.jpg",
            songCount = 0,
            year = "1896"
        ),
        Book(
            title = "Sri Caitanya-caritamrta",
            author = "Krishnadasa Kaviraja Goswami",
            slug = "caitanya-caritamrta",
            uid = "KK001",
            image = "https://i1.sndcdn.com/artworks-qmLFQ1cOC0F9szhF-kmywsQ-t500x500.jpg",
            songCount = 0,
            year = "1580"
        ),
        Book(
            title = "Bhagavad-gita As It Is",
            author = "A.C. Bhaktivedanta Swami Prabhupada",
            slug = "bhagavad-gita",
            uid = "ACBSP001",
            image = "https://i.pinimg.com/736x/a9/18/c0/a918c08bd24e65f760490898affbb6d1.jpg",
            songCount = 0,
            year = "1972"
        )
    )

    // Sample songs from web implementation
    val songs = listOf(
        Song(
            title = "Sri Guru Vandana",
            author = "Narottama Dasa Thakura",
            uid = "N3",
            audio = true,
            tags = listOf("prayer", "guru")
        ),
        Song(
            title = "Saranagati",
            author = "Bhaktivinoda Thakura",
            uid = "S1",
            audio = false,
            tags = listOf("surrender", "prayer")
        ),
        Song(
            title = "Sri Krishna Caitanya Prabhu",
            author = "Locana Dasa Thakura",
            uid = "E4",
            audio = true,
            tags = listOf("mahaprabhu", "prayer")
        ),
        Song(
            title = "Jaya Radha Madhava",
            author = "Bhaktivedanta Swami Prabhupada",
            uid = "SQ2",
            audio = true,
            tags = listOf("radha-krishna", "prayer")
        ),
        Song(
            title = "Akrodha Paramananda",
            author = "Locana Dasa Thakura",
            uid = "L5",
            audio = false,
            tags = listOf("Pañca-tattva", "Śrī Nityānanda Prabhu", "Bengali", "Caitanya Mangala")
        )
    )

    // Sample verses from web implementation
    val verses = listOf(
        Verse(
            language = "bengali",
            original = listOf(
                "শ্রী-গুরু-চরণ-পদ্ম, কেবল-ভকতি-সদ্ম,",
                "বন্দো মুঞি সাবধান মতে"
            ),
            transliterations = listOf(
                Transliteration(
                    language = "en",
                    text = listOf(
                        "śrī-guru-caraṇa-padma, kevala-bhakati-sadma,",
                        "bando muñi sābadhāna mate"
                    )
                )
            ),
            wordToWords = listOf(
                WordToWord(
                    language = "en",
                    words = listOf(
                        listOf("śrī-guru", "spiritual master"),
                        listOf("caraṇa", "lotus feet"),
                        listOf("padma", "lotus flower"),
                        listOf("kevala", "exclusively"),
                        listOf("bhakati", "devotional service"),
                        listOf("sadma", "abode"),
                        listOf("bando", "I offer obeisances"),
                        listOf("muñi", "I"),
                        listOf("sābadhāna", "careful"),
                        listOf("mate", "mind")
                    )
                )
            ),
            translations = listOf(
                Translation(
                    language = "en",
                    text = "The lotus feet of the spiritual master are the abode of pure devotional service. I bow down to those lotus feet with great care and attention."
                )
            )
        ),
        Verse(
            language = "bengali",
            original = listOf(
                "অক্রোধ পরমানন্দ নিত্যানন্দ-রায়",
                "অভিমান শূন্য নিতাই নগরে বেড়ায়"
            ),
            transliterations = listOf(
                Transliteration(
                    language = "en",
                    text = listOf(
                        "akrodha paramānanda nityānanda-rāya",
                        "abhimāna śūnya nitāi nagare beḓāya"
                    )
                )
            ),
            wordToWords = listOf(
                WordToWord(
                    language = "en",
                    words = listOf(
                        listOf("akrodha", "free from anger"),
                        listOf("paramānanda", "supreme bliss"),
                        listOf("nityānanda", "Nityānanda Prabhu"),
                        listOf("rāya", "noble"),
                        listOf("abhimāna", "false ego"),
                        listOf("śūnya", "devoid"),
                        listOf("nitāi", "Nitāi"),
                        listOf("nagare", "throughout the town"),
                        listOf("beḓāya", "wanders")
                    )
                )
            ),
            translations = listOf(
                Translation(
                    language = "en",
                    text = "The noble Nityānanda Prabhu, the personification of supreme transcendental bliss, is never angry. Devoid of all false ego, He wanders throughout the town."
                )
            )
        )
    )
}