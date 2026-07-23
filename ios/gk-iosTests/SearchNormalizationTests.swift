//
//  SearchNormalizationTests.swift
//  gk-iosTests
//
//  `StringUtils.normalizeForSearch` (docs/screens/search.md "Matching rules" — diacritic-insensitive,
//  v/b + j/y transliteration folding) is the one function every tier-1 search result depends on, so
//  it's tested in isolation, plus the Damerau edit-distance helper the fuzzy tier layers on top of it.
//  Examples are real corpus titles/words (pipeline/converted), not invented strings.

import XCTest
@testable import gk_ios

final class SearchNormalizationTests: XCTestCase {

    // MARK: - Diacritic stripping

    func testDiacriticsAreStrippedAndCaseIsFolded() {
        // search.md's own worked example: ā→a, ṁ→m, ś→s, ṛ→r.
        XCTAssertEqual(StringUtils.normalizeForSearch("Śrīla"), "srila")
        XCTAssertEqual(StringUtils.normalizeForSearch("kṛṣṇa"), "krsna")
    }

    // MARK: - v/b and j/y transliteration folds (search.md: "Gauḍīya/Bengali romanization treats
    // each pair as one")

    func testVAndBFoldToTheSameForm() {
        // search.md's own example pair.
        XCTAssertEqual(StringUtils.normalizeForSearch("madhava"), StringUtils.normalizeForSearch("madhaba"))
        XCTAssertEqual(StringUtils.normalizeForSearch("viṁśottara"), StringUtils.normalizeForSearch("biṁśottara"))
    }

    func testJAndYFoldToTheSameForm() {
        // "vraja"/"braja" is the real corpus spelling (song B8's title uses "braja"); both the
        // common "vraja" spelling and the v/j-folded corpus form must normalize identically.
        XCTAssertEqual(StringUtils.normalizeForSearch("vraja"), StringUtils.normalizeForSearch("braja"))
    }

    func testFoldingIsCaseInsensitiveOnTheFoldedLetters() {
        XCTAssertEqual(StringUtils.normalizeForSearch("Vimostottra"), StringUtils.normalizeForSearch("bimostottra"))
    }

    // MARK: - Whitespace / punctuation collapse

    func testPunctuationAndWhitespaceCollapseToSingleSpacesTrimmed() {
        // Real manifest title (NK8): "Bola Hari Bola (3 Bāra)" -> parens/extra spacing collapsed,
        // digits kept (search still matches "3"), diacritic on "Bāra" stripped.
        XCTAssertEqual(StringUtils.normalizeForSearch("Bola Hari Bola (3 Bāra)"), "bola hari bola 3 bara")
    }

    func testEmptyAndWhitespaceOnlyQueriesNormalizeToEmpty() {
        XCTAssertEqual(StringUtils.normalizeForSearch(""), "")
        XCTAssertEqual(StringUtils.normalizeForSearch("   "), "")
        XCTAssertTrue(StringUtils.searchTokens("   ").isEmpty)
    }

    func testSearchTokensSplitsOnNormalizedWhitespace() {
        XCTAssertEqual(StringUtils.searchTokens("Śrī  Kṛṣṇa!!"), ["sri", "krsna"])
    }

    // MARK: - First-letter / section indexing (docs/screens/songs-list.md alphabetical index)

    func testFirstNormalizedLetterStripsDiacriticsForIndexing() {
        XCTAssertEqual(StringUtils.firstNormalizedLetter("Śrīla"), "S")
        XCTAssertEqual(StringUtils.firstNormalizedLetter("kṛṣṇa"), "K")
    }

    func testSectionLetterFallsBackToHashForNonAlphabeticalStarts() {
        XCTAssertEqual(StringUtils.sectionLetter(for: "'namo tomake bhajinu"), "#")
        XCTAssertEqual(StringUtils.sectionLetter(for: "Śrī Guru"), "S")
    }

    // MARK: - Damerau edit distance (the tier-1 fuzzy fallback)

    func testLevenshteinIsZeroForIdenticalStrings() {
        XCTAssertEqual(StringUtils.levenshtein("krsna", "krsna"), 0)
    }

    func testLevenshteinClassicExample() {
        XCTAssertEqual(StringUtils.levenshtein("kitten", "sitting"), 3)
    }

    func testLevenshteinCountsAnAdjacentTranspositionAsOneEdit() {
        // OSA/Damerau distance (not plain Levenshtein, which would score this 2) — search.md's
        // rationale is exactly this: common transliteration typos swap adjacent letters.
        XCTAssertEqual(StringUtils.levenshtein("ab", "ba"), 1)
    }

    // MARK: - Master-text flag resolution (docs/data/README.md — used ahead of display, not search,
    // but shares StringUtils and is exercised by the same real corpus text)

    func testMasterTextHyphenFlagResolvesToALiteralHyphen() {
        XCTAssertEqual(StringUtils.resolveMasterTextFlags("tāpita[FLAG_HYPHEN_ALPHA]parāṇa"), "tāpita-parāṇa")
    }

    func testUnknownFlagsAreStrippedDefensively() {
        XCTAssertEqual(StringUtils.resolveMasterTextFlags("word[FLAG_SOME_FUTURE_FLAG]word"), "wordword")
        XCTAssertEqual(StringUtils.resolveMasterTextFlags("plain text, no flags"), "plain text, no flags")
    }
}
