import Foundation
import SwiftUI

class HomeViewModel: ObservableObject {
    @Published var songs: [Song] = []
    @Published var authors: [Author] = []
    @Published var topics: [Topic] = []
    @Published var books: [Book] = []
    @Published var verses: [Verse] = []
    
    init() {
        setupSampleData()
    }
    
    private func setupSampleData() {
        // Sample Authors
        authors = [
            Author(name: "Śrīla Locana Dāsa Ṭhākura", image: "locana_das"),
            Author(name: "Narottama Dāsa Ṭhākura", image: "narottama_das"),
            Author(name: "Bhaktivinoda Ṭhākura", image: "bhaktivinoda"),
            Author(name: "Govinda Dāsa", image: "govinda_das"),
            Author(name: "Vāsudeva Ghoṣa", image: "vasudeva_ghosh"),
            Author(name: "Śrīla Rūpa Gosvāmī", image: "rupa_goswami")
        ]
        
        // Sample Topics
        topics = [
            Topic(name: "Sri Guru"),
            Topic(name: "Vaisnavas"),
            Topic(name: "Sri Gadadhara"),
            Topic(name: "Bhajan Bhajan Bhajan Bhajan Bhajan Bhajan ")
        ]
        
        // Sample Books
        books = [
            Book(title: "Gītāvalī", author: "Bhaktivinoda Ṭhākura", slug: "gitavali", uid: "BVT001", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bhaktivinoda_Thakur_1884.jpg/330px-Bhaktivinoda_Thakur_1884.jpg"),
            Book(title: "Śaraṇāgati", author: "Bhaktivinoda Ṭhākura", slug: "saranagati", uid: "BVT002", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Jayadharma_chant_1975.jpg/330px-Jayadharma_chant_1975.jpg"),
            Book(title: "Prārthanā", author: "Narottama Dāsa Ṭhākura", slug: "prarthana", uid: "NDT001", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Narottama_Das_Thakur.png/330px-Narottama_Das_Thakur.png"),
            Book(title: "Prema-bhakti-candrikā", author: "Narottama Dāsa Ṭhākura", slug: "prema-bhakti", uid: "NDT002", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Chaitanya_with_Four_Associates_-_Pancha_Tattva.jpg/330px-Chaitanya_with_Four_Associates_-_Pancha_Tattva.jpg")
        ]
        
        // Sample Songs
        songs = [
            Song(
                title: "Akrodha Paramānanda",
                author: "Śrīla Locana Dāsa Ṭhākura",
                uid: "LD1",
                audio: true,
                tags: ["Nityananda", "Bhakti", "Mercy"]
            ),
            Song(
                title: "Hari Hari Bifale",
                author: "Narottama Dāsa Ṭhākura",
                uid: "N1",
                audio: true,
                tags: ["Devotional", "Worship", "Prayer"]
            ),
            Song(
                title: "Gaurāṅga Bolite Habe",
                author: "Narottama Dāsa Ṭhākura",
                uid: "ND2",
                audio: true,
                tags: ["Gauranga", "Chanting", "Names"]
            ),
            Song(
                title: "Śrī Rūpa Mañjarī Pada",
                author: "Narottama Dāsa Ṭhākura",
                uid: "ND3",
                audio: false,
                tags: ["Rupa Manjari", "Service", "Radha"]
            )
        ]

        verses = [
            Verse(
                language: "bn",
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
                    ),
                    Transliteration(
                        id: UUID(),
                        language: "hi",
                        text: [
                            "अक्रोध परमानंद नित्यानंद-राय",
                            "अभिमान शून्य नीताई नगरे बेड़ाय"
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
                    ),
                    WordToWord(
                        id: UUID(),
                        language: "hi",
                        words: [
                            ["अक्रोध", "क्रोधरहित"],
                            ["परमानंद", "परम आनंद"],
                            ["नित्यानंद", "नित्यानंद प्रभु"],
                            ["राय", "श्रेष्ठ"],
                            ["अभिमान", "अहंकार"],
                            ["शून्य", "रहित"],
                            ["नीताई", "नीताई"],
                            ["नगरे", "नगर में"],
                            ["बेड़ाय", "घूमते हैं"]
                        ]
                    )
                ],
                translations: [
                    Translation(
                        id: UUID(),
                        language: "en",
                        text: "The noble Nityānanda Prabhu, the personification of supreme transcendental bliss, is never angry. Devoid of all false ego, He wanders throughout the town."
                    ),
                    Translation(
                        id: UUID(),
                        language: "hi",
                        text: "श्रेष्ठ नित्यानंद प्रभु, जो परम आनंद के साकार रूप हैं, कभी क्रोधित नहीं होते। सभी अहंकार से रहित, वे नगर भर में घूमते रहते हैं।"
                    )
                ]
            ),
            Verse(
                language: "bn",
                original: [
                    "অধম পতিত জীবের দ্বারে দ্বারে গিয়া",
                    "হরি-নাম মহা-মন্ত্র দিচ্ছেন বিলাইয়া"
                ],
                transliterations: [
                    Transliteration(
                        id: UUID(),
                        language: "en",
                        text: [
                            "adhama patita jīvera dvāre dvāre giẏā",
                            "hari-nāma mahā-mantra dicchena bilāẏā"
                        ]
                    ),
                    Transliteration(
                        id: UUID(),
                        language: "hi",
                        text: [
                            "अधम पतित जीवेर द्वारे द्वारे गिया",
                            "हरि-नाम महा-मंत्र दिच्छेन बिलाया"
                        ]
                    )
                ],
                wordToWords: [
                    WordToWord(
                        id: UUID(),
                        language: "en",
                        words: [
                            ["adhama", "fallen"],
                            ["patita", "degraded"],
                            ["jīvera", "of the souls"],
                            ["dvāre dvāre", "door to door"],
                            ["giẏā", "going"],
                            ["hari-nāma", "the holy name of Hari"],
                            ["mahā-mantra", "great mantra"],
                            ["dicchena", "distributing"],
                            ["bilāẏā", "freely"]
                        ]
                    ),
                    WordToWord(
                        id: UUID(),
                        language: "hi",
                        words: [
                            ["अधम", "पतित"],
                            ["पतित", "गिरे हुए"],
                            ["जीवेर", "जीवों के"],
                            ["द्वारे द्वारे", "द्वार-द्वार"],
                            ["गिया", "जाकर"],
                            ["हरि-नाम", "हरि का पवित्र नाम"],
                            ["महा-मंत्र", "महामंत्र"],
                            ["दिच्छेन", "बाँट रहे हैं"],
                            ["बिलाया", "मुफ्त में"]
                        ]
                    )
                ],
                translations: [
                    Translation(
                        id: UUID(),
                        language: "en",
                        text: "Going door to door, He freely distributes the great mantra, the holy name of Hari, to the fallen and degraded souls."
                    ),
                    Translation(
                        id: UUID(),
                        language: "hi",
                        text: "वे द्वार-द्वार जाकर पतित और गिरे हुए जीवों को हरि के पवित्र नाम का महामंत्र मुफ्त में बाँट रहे हैं।"
                    )
                ]
            ),
            Verse(
                language: "bn",
                original: [
                    "জারে দেখে তারে কহে দন্তে তৃণা ধরি",
                    "আমারে কিনিয়া লহ বল গৌর-হরি"
                ],
                transliterations: [
                    Transliteration(
                        id: UUID(),
                        language: "en",
                        text: [
                            "jāre dekhe tāre kahe dante tṛṇā dhori",
                            "āmāre kiniyā laha bala gaura-hari"
                        ]
                    ),
                    Transliteration(
                        id: UUID(),
                        language: "hi",
                        text: [
                            "जारे देखे तारे कहे दंते तृणा धोरी",
                            "आमारे किनिया लहो बोलो गौर-हरि"
                        ]
                    )
                ],
                wordToWords: [
                    WordToWord(
                        id: UUID(),
                        language: "en",
                        words: [
                            ["jāre", "whomever"],
                            ["dekhe", "he sees"],
                            ["tāre", "to them"],
                            ["kahe", "says"],
                            ["dante", "in his teeth"],
                            ["tṛṇā", "a straw"],
                            ["dhori", "holding"],
                            ["āmāre", "me"],
                            ["kiniyā", "purchasing"],
                            ["laha", "take"],
                            ["bala", "say"],
                            ["gaura-hari", "Gaura-Hari"]
                        ]
                    ),
                    WordToWord(
                        id: UUID(),
                        language: "hi",
                        words: [
                            ["जारे", "जिसे"],
                            ["देखे", "देखते हैं"],
                            ["तारे", "उससे"],
                            ["कहे", "कहते हैं"],
                            ["दंते", "दाँतों में"],
                            ["तृणा", "तिनका"],
                            ["धोरी", "पकड़कर"],
                            ["आमारे", "मुझे"],
                            ["किनिया", "खरीदकर"],
                            ["लहो", "लो"],
                            ["बोलो", "कहो"],
                            ["गौर-हरि", "गौर-हरि"]
                        ]
                    )
                ],
                translations: [
                    Translation(
                        id: UUID(),
                        language: "en",
                        text: "Whomever He sees, He says while holding a straw in His teeth, \"Please purchase me by chanting the name of Gaura-Hari.\""
                    ),
                    Translation(
                        id: UUID(),
                        language: "hi",
                        text: "जिसे भी वे देखते हैं, दाँतों में तिनका पकड़कर कहते हैं, \"कृपया गौर-हरि का नाम जपकर मुझे खरीद लीजिए।\""
                    )
                ]
            ),
            Verse(
                language: "bn",
                original: [
                    "এতো বলি নিত্যানন্দ ভূমে গড়ি যায়",
                    "সোনার পর্বত যেন ধূলাতে লোটায়"
                ],
                transliterations: [
                    Transliteration(
                        id: UUID(),
                        language: "en",
                        text: [
                            "eto boli nityānanda bhūme gaḓi yāya",
                            "sonāra parvata jeno dhūlāte loṭāya"
                        ]
                    ),
                    Transliteration(
                        id: UUID(),
                        language: "hi",
                        text: [
                            "एतो बोली नित्यानंद भूमे गड़ी जाय",
                            "सोनार परबत जेनो धूलाते लोटाय"
                        ]
                    )
                ],
                wordToWords: [
                    WordToWord(
                        id: UUID(),
                        language: "en",
                        words: [
                            ["eto", "thus"],
                            ["boli", "saying"],
                            ["nityānanda", "Nityānanda"],
                            ["bhūme", "on the ground"],
                            ["gaḓi", "rolling"],
                            ["yāya", "goes"],
                            ["sonāra", "golden"],
                            ["parvata", "mountain"],
                            ["jeno", "as if"],
                            ["dhūlāte", "in the dust"],
                            ["loṭāya", "rolling"]
                        ]
                    ),
                    WordToWord(
                        id: UUID(),
                        language: "hi",
                        words: [
                            ["एतो", "इतना"],
                            ["बोली", "कहकर"],
                            ["नित्यानंद", "नित्यानंद"],
                            ["भूमे", "भूमि पर"],
                            ["गड़ी", "लोटते"],
                            ["जाय", "जाते हैं"],
                            ["सोनार", "सोने का"],
                            ["परबत", "पर्वत"],
                            ["जेनो", "जैसे"],
                            ["धूलाते", "धूल में"],
                            ["लोटाय", "लोट रहा हो"]
                        ]
                    )
                ],
                translations: [
                    Translation(
                        id: UUID(),
                        language: "en",
                        text: "Saying this, Nityānanda falls to the ground, rolling as if a golden mountain were rolling in the dust."
                    ),
                    Translation(
                        id: UUID(),
                        language: "hi",
                        text: "यह कहकर, नित्यानंद भूमि पर गिर पड़ते हैं, ऐसे लोटते हुए जैसे कोई सोने का पर्वत धूल में लोट रहा हो।"
                    )
                ]
            ),
            Verse(
                language: "bn",
                original: [
                    "হেনো অবতারে যার রতি না জন্মিল",
                    "লোচন বলে সেই পাপী এলো আর গেল"
                ],
                transliterations: [
                    Transliteration(
                        id: UUID(),
                        language: "en",
                        text: [
                            "heno avatāre yāra rati nā janmila",
                            "locana bale sei pāpi elo āra gela"
                        ]
                    ),
                    Transliteration(
                        id: UUID(),
                        language: "hi",
                        text: [
                            "हेनो अवतारे जार रति ना जन्मिल",
                            "लोचन बले सेई पापी एलो आर गेल"
                        ]
                    )
                ],
                wordToWords: [
                    WordToWord(
                        id: UUID(),
                        language: "en",
                        words: [
                            ["heno", "such"],
                            ["avatāre", "incarnation"],
                            ["yāra", "whose"],
                            ["rati", "affection"],
                            ["nā", "not"],
                            ["janmila", "developed"],
                            ["locana", "Locana"],
                            ["bale", "says"],
                            ["sei", "that"],
                            ["pāpi", "sinner"],
                            ["elo", "came"],
                            ["āra", "and"],
                            ["gela", "went"]
                        ]
                    ),
                    WordToWord(
                        id: UUID(),
                        language: "hi",
                        words: [
                            ["हेनो", "ऐसे"],
                            ["अवतारे", "अवतार के लिए"],
                            ["जार", "जिसकी"],
                            ["रति", "प्रीति"],
                            ["ना", "नहीं"],
                            ["जन्मिल", "जन्मी"],
                            ["लोचन", "लोचन"],
                            ["बले", "कहते हैं"],
                            ["सेई", "वह"],
                            ["पापी", "पापी"],
                            ["एलो", "आया"],
                            ["आर", "और"],
                            ["गेल", "चला गया"]
                        ]
                    )
                ],
                translations: [
                    Translation(
                        id: UUID(),
                        language: "en",
                        text: "Locana Dasa says, \"That sinner who has not developed affection for such an incarnation has come and gone for nothing.\""
                    ),
                    Translation(
                        id: UUID(),
                        language: "hi",
                        text: "लोचन दास कहते हैं, \"वह पापी जिसने ऐसे अवतार के लिए प्रेम विकसित नहीं किया, व्यर्थ ही आया और चला गया।\""
                    )
                ]
            )
        ]
    }
}
