import SwiftUI

struct VerseView: View {
    let verse: Verse
    var verseNumber: Int = 0
    var fontSize: CGFloat = 14
    var showOriginal: Bool = true
    var showTransliteration: Bool = true
    var showWordToWord: Bool = true
    var showTranslation: Bool = true
    private let selectedLanguage = "en"

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
            Group {
                if showOriginal && !verse.original.isEmpty {
                    VStack(spacing: 4) {
                        ForEach(verse.original, id: \.self) { line in
                            Text(line)
                                .font(.system(size: fontSize))
                                .foregroundColor(Color.neutral)
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                }

                let validTransliterations = verse.transliterations.compactMap { $0 }
                if showTransliteration, let selectedTransliteration = validTransliterations.first(where: { $0.language == selectedLanguage }) {
                    VStack(spacing: 4) {
                        ForEach(Array(selectedTransliteration.text.enumerated()), id: \.offset) { index, line in
                            if index == selectedTransliteration.text.count - 1 && verseNumber > 0 {
                                Text("\(line) (\(verseNumber))")
                                    .font(.system(size: fontSize))
                                    .foregroundColor(Color.highlight)
                                    .frame(maxWidth: .infinity, alignment: .center)
                            } else {
                                Text(line)
                                    .font(.system(size: fontSize))
                                    .foregroundColor(Color.highlight)
                                    .frame(maxWidth: .infinity, alignment: .center)
                            }
                        }
                    }
                }
            }

            let validWordToWords = verse.wordToWords.compactMap { $0 }
            if showWordToWord, let selectedWordToWord = validWordToWords.first(where: { $0.language == selectedLanguage }) {
                combinedWTWText(selectedWordToWord)
                    .font(.system(size: fontSize))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            let validTranslations = verse.translations.compactMap { $0 }
            if showTranslation, let selectedTranslation = validTranslations.first(where: { $0.language == selectedLanguage }) {
                Text(selectedTranslation.text)
                    .font(.system(size: fontSize + 1, weight: .bold))
                    .foregroundColor(Color("primaryText"))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}
