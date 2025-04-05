import Foundation

struct Verse: Identifiable, Hashable {
    let id = UUID()
    let language: String?
    let original: [String]
    let transliterations: [Transliteration?]
    let wordToWords: [WordToWord?]
    let translations: [Translation?]
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
        hasher.combine(language)
        hasher.combine(original)
        hasher.combine(transliterations)
        hasher.combine(wordToWords)
        hasher.combine(translations)
    }
    
    static func == (lhs: Verse, rhs: Verse) -> Bool {
        lhs.id == rhs.id &&
        lhs.language == rhs.language &&
        lhs.original == rhs.original &&
        lhs.transliterations == rhs.transliterations &&
        lhs.wordToWords == rhs.wordToWords &&
        lhs.translations == rhs.translations
    }
}

struct Transliteration: Identifiable, Hashable {
    let id: UUID
    let language: String
    let text: [String]
}

struct WordToWord: Identifiable, Hashable {
    let id: UUID
    let language: String
    let words: [[String]]
}

struct Translation: Identifiable, Hashable {
    let id: UUID
    let language: String
    let text: String
}