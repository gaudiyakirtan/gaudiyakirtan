import Foundation

struct StringUtils {
    
    /// Normalizes text by removing diacritical marks
    /// For example, "Śrīla" becomes "Srila"
    static func removeDiacritics(_ text: String) -> String {
        return text.folding(options: .diacriticInsensitive, locale: .current)
    }
    
    /// Returns the first letter of a string after removing diacritical marks
    /// Useful for alphabetical sorting and indexing
    static func firstNormalizedLetter(_ text: String) -> String {
        guard let firstChar = text.first else { return "" }
        let normalized = String(firstChar).folding(options: .diacriticInsensitive, locale: .current)
        return normalized.isEmpty ? "" : String(normalized.first!).uppercased()
    }
    
    /// Gets the section letter for alphabetical grouping
    /// For text starting with a non-letter character, returns "#"
    static func sectionLetter(for text: String) -> String {
        let normalizedFirstLetter = firstNormalizedLetter(text)
        if normalizedFirstLetter.isEmpty || !normalizedFirstLetter.first!.isLetter {
            return "#"  // Use "#" for non-alphabetical starts
        }
        return normalizedFirstLetter
    }
}