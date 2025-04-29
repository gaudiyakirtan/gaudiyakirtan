import Foundation

struct SampleData {
    // Sample authors
    static let authors: [Author] = [
        Author(name: "Bhaktivedanta Swami Prabhupada", image: "https://satsvarupadasagoswami.com/wp-content/uploads/2017/01/SrilaPrabhupada.jpg"),
        Author(name: "Bhaktivinoda Thakura", image: "https://premadharma.org/wp-content/uploads/2017/01/Srila-Bhakti-Vinod-Thakur-1.jpg"),
        Author(name: "Narottama Dasa Thakura", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo_tUvLJlX7XaV4k4vq67yfawaMIO2s6-Plg&s"),
        Author(name: "Locana Dasa Thakura", image: ""),
        Author(name: "Krishnadasa Kaviraja", image: "https://krsnakatha.com/img/guru-parampara/Krishnadasa-Kaviraja-Goswami.jpg")
    ]
    
    // Sample topics
    static let topics: [Topic] = [
        Topic(name: "Sri Guru"),
        Topic(name: "Vaisnavas"),
        Topic(name: "Sri Gadadhara"),
        Topic(name: "Radha-Krishna"),
        Topic(name: "Gaura-lila"),
        Topic(name: "Prayers"),
        Topic(name: "Arati"),
        Topic(name: "Mangalacarana")
    ]
    
    // Sample books
    static let books: [Book] = [
        Book(title: "Kalyana Kalpataru", 
             author: "Śrīla Bhaktivinoda Thakura", 
             slug: "kalyana-kalpataru", 
             uid: "BVT001", 
             image: "https://swamitripurari.com/wp-content/uploads/2011/01/nama-dharma.jpg", 
             songCount: 42, 
             year: "1881"),
        Book(title: "Jaiva Dharma",
             author: "Śrīla Bhaktivinoda Thakura",
             slug: "jaiva-dharma",
             uid: "BVT002",
             image: "https://bhaktivinodainstitute.org/wp-content/uploads/2022/07/JAIVA-DHARMA-1024x600.jpg",
             songCount: 0,
             year: "1896"),
        Book(title: "Sri Caitanya-caritamrta",
             author: "Krishnadasa Kaviraja Goswami",
             slug: "caitanya-caritamrta",
             uid: "KK001",
             image: "https://i1.sndcdn.com/artworks-qmLFQ1cOC0F9szhF-kmywsQ-t500x500.jpg",
             songCount: 0,
             year: "1580"),
        Book(title: "Bhagavad-gita As It Is",
             author: "A.C. Bhaktivedanta Swami Prabhupada",
             slug: "bhagavad-gita",
             uid: "ACBSP001",
             image: "https://i.pinimg.com/736x/a9/18/c0/a918c08bd24e65f760490898affbb6d1.jpg",
             songCount: 0,
             year: "1972")
    ]
    
    // Sample songs
    static let songs: [Song] = [
        Song(title: "Sri Guru Vandana", 
             author: "Narottama Dasa Thakura", 
             uid: "N3", 
             audio: true, 
             tags: ["prayer", "guru"]),
        Song(title: "Saranagati", 
             author: "Bhaktivinoda Thakura", 
             uid: "S1", 
             audio: false, 
             tags: ["surrender", "prayer"]),
        Song(title: "Sri Krishna Caitanya Prabhu", 
             author: "Locana Dasa Thakura", 
             uid: "E4", 
             audio: true, 
             tags: ["mahaprabhu", "prayer"]),
        Song(title: "Jaya Radha Madhava", 
             author: "Bhaktivedanta Swami Prabhupada", 
             uid: "SQ2", 
             audio: true, 
             tags: ["radha-krishna", "prayer"]),
        Song(title: "Akrodha Paramananda", 
             author: "Locana Dasa Thakura", 
             uid: "L5", 
             audio: false, 
             tags: ["Pañca-tattva", "Śrī Nityānanda Prabhu", "Bengali", "Caitanya Mangala"])
    ]
    
    // Sample verses
    static let verses: [Verse] = [
        Verse(
            language: "bengali",
            original: [
                "শ্রী-গুরু-চরণ-পদ্ম, কেবল-ভকতি-সদ্ম,",
                "বন্দো মুঞি সাবধান মতে"
            ],
            transliterations: [
                Transliteration(
                    id: UUID(),
                    language: "en",
                    text: [
                        "śrī-guru-caraṇa-padma, kevala-bhakati-sadma,",
                        "bando muñi sābadhāna mate"
                    ]
                )
            ],
            wordToWords: [
                WordToWord(
                    id: UUID(),
                    language: "en",
                    words: [
                        ["śrī-guru", "spiritual master"],
                        ["caraṇa", "lotus feet"],
                        ["padma", "lotus flower"],
                        ["kevala", "exclusively"],
                        ["bhakati", "devotional service"],
                        ["sadma", "abode"],
                        ["bando", "I offer obeisances"],
                        ["muñi", "I"],
                        ["sābadhāna", "careful"],
                        ["mate", "mind"]
                    ]
                )
            ],
            translations: [
                Translation(
                    id: UUID(),
                    language: "en", 
                    text: "The lotus feet of the spiritual master are the abode of pure devotional service. I bow down to those lotus feet with great care and attention."
                )
            ]
        ),
        Verse(
            language: "bengali",
            original: [
                "অক্রোধ পরমানন্দ নিত্যানন্দ-রায়",
                "অভিমান শূন্য নিতাই নগরে বেড়ায়"
            ],
            transliterations: [
                Transliteration(
                    id: UUID(),
                    language: "en",
                    text: [
                        "akrodha paramānanda nityānanda-rāya",
                        "abhimāna śūnya nitāi nagare beḓāya"
                    ]
                )
            ],
            wordToWords: [
                WordToWord(
                    id: UUID(),
                    language: "en",
                    words: [
                        ["akrodha", "free from anger"],
                        ["paramānanda", "supreme bliss"],
                        ["nityānanda", "Nityānanda Prabhu"],
                        ["rāya", "noble"],
                        ["abhimāna", "false ego"],
                        ["śūnya", "devoid"],
                        ["nitāi", "Nitāi"],
                        ["nagare", "throughout the town"],
                        ["beḓāya", "wanders"]
                    ]
                )
            ],
            translations: [
                Translation(
                    id: UUID(),
                    language: "en",
                    text: "The noble Nityānanda Prabhu, the personification of supreme transcendental bliss, is never angry. Devoid of all false ego, He wanders throughout the town."
                )
            ]
        )
    ]
}