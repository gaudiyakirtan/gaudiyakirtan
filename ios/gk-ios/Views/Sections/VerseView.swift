import SwiftUI

struct VerseView: View {
    let verse: Verse
    var verseNumber: Int = 0
    private let selectedLanguage = "en"  // Default language

    private func combinedWTWText(_ wtw: WordToWord) -> Text {
        wtw.words.reduce(Text("")) { partial, pair in
            partial +
            Text(pair[0])
                .foregroundColor(Color.highlight) +
            Text(" \u{2014} \(pair[1]); ")
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Original Text and Transliterations remain centered
            Group {
                if !verse.original.isEmpty {
                    VStack(spacing: 4) {
                        ForEach(verse.original, id: \.self) { line in
                            Text(line)
                                .font(.system(size: 14))
                                .foregroundColor(Color.neutral)
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                }

                // Transliterations
                let validTransliterations = verse.transliterations.compactMap { $0 }
                if let selectedTransliteration = validTransliterations.first(where: { $0.language == selectedLanguage }) {
                    VStack(spacing: 4) {
                        ForEach(Array(selectedTransliteration.text.enumerated()), id: \.offset) { index, line in
                            if index == selectedTransliteration.text.count - 1 && verseNumber > 0 {
                                Text("\(line) (\(verseNumber))")
                                    .font(.system(size: 14))
                                    .foregroundColor(Color.highlight)
                                    .frame(maxWidth: .infinity, alignment: .center)
                            } else {
                                Text(line)
                                    .font(.system(size: 14))
                                    .foregroundColor(Color.highlight)
                                    .frame(maxWidth: .infinity, alignment: .center)
                            }
                        }
                    }
                }
            }

            // Word to Word - Flowing text style
            let validWordToWords = verse.wordToWords.compactMap { $0 }
            if let selectedWordToWord = validWordToWords.first(where: { $0.language == selectedLanguage }) {
                combinedWTWText(selectedWordToWord)
                    .font(.system(size: 14))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Translations - Left aligned and bold
            let validTranslations = verse.translations.compactMap { $0 }
            if let selectedTranslation = validTranslations.first(where: { $0.language == selectedLanguage }) {
                Text(selectedTranslation.text)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color("primaryText"))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}
