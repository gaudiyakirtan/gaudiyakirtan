import XCTest
@testable import gk_ios

/// The app-wide vocabulary's decision logic (docs/theme/haptics.md). Whether a haptic *fires* is
/// the part that can regress into either a dead app or a noisy one, so it lives in pure functions
/// and is locked here.
final class AppHapticsTests: XCTestCase {

    // MARK: - A–Z index

    func testMovingToANewLetterIsASelection() {
        XCTAssertEqual(
            AlphabeticalIndexHaptics.tick(from: "C", to: "D", firstAvailable: "A", lastAvailable: "Z"),
            .selection
        )
    }

    func testStayingOnTheSameLetterIsSilent() {
        // The drag reports continuously while the finger sits on one letter; only a change counts.
        XCTAssertEqual(
            AlphabeticalIndexHaptics.tick(from: "D", to: "D", firstAvailable: "A", lastAvailable: "Z"),
            .none
        )
    }

    func testReachingEitherEndOfTheAvailableLettersIsABoundary() {
        XCTAssertEqual(
            AlphabeticalIndexHaptics.tick(from: "B", to: "A", firstAvailable: "A", lastAvailable: "Z"),
            .boundary
        )
        XCTAssertEqual(
            AlphabeticalIndexHaptics.tick(from: "Y", to: "Z", firstAvailable: "A", lastAvailable: "Z"),
            .boundary
        )
    }

    func testTheBoundaryTracksAvailableLettersNotTheAlphabet() {
        // The index names every letter, but only some have songs. Feeling "the end" at Z when the
        // last real section is M would be a lie — the ends that matter are the available ones.
        XCTAssertEqual(
            AlphabeticalIndexHaptics.tick(from: "L", to: "M", firstAvailable: "C", lastAvailable: "M"),
            .boundary
        )
        XCTAssertEqual(
            AlphabeticalIndexHaptics.tick(from: "C", to: "D", firstAvailable: "C", lastAvailable: "M"),
            .selection
        )
    }

    func testNoDestinationIsSilent() {
        XCTAssertEqual(
            AlphabeticalIndexHaptics.tick(from: "C", to: nil, firstAvailable: "A", lastAvailable: "Z"),
            .none
        )
    }

    // MARK: - Transport

    func testSteppingWithinTheRecordingListDoesNotWrap() {
        XCTAssertFalse(TransportHaptics.wraps(index: 1, delta: 1, count: 4))
        XCTAssertFalse(TransportHaptics.wraps(index: 1, delta: -1, count: 4))
    }

    func testSteppingOffEitherEndWraps() {
        XCTAssertTrue(TransportHaptics.wraps(index: 3, delta: 1, count: 4))
        XCTAssertTrue(TransportHaptics.wraps(index: 0, delta: -1, count: 4))
    }

    func testASingleRecordingNeverWraps() {
        // The transport is dormant for a single take, so it must not claim a boundary.
        XCTAssertFalse(TransportHaptics.wraps(index: 0, delta: 1, count: 1))
        XCTAssertFalse(TransportHaptics.wraps(index: 0, delta: -1, count: 0))
    }

    // MARK: - Search

    func testABlankQueryIsIdleNotEmpty() {
        // Idle is not a result of anything the user searched for, so it must not read as "no matches".
        XCTAssertEqual(SearchHaptics.phase(queryIsBlank: true, resultCount: 0), .idle)
    }

    func testAQueryWithHitsIsResults() {
        XCTAssertEqual(SearchHaptics.phase(queryIsBlank: false, resultCount: 3), .results)
    }

    func testAQueryWithNoHitsIsEmpty() {
        XCTAssertEqual(SearchHaptics.phase(queryIsBlank: false, resultCount: 0), .empty)
    }

    func testTheWarningFiresOnTheTransitionIntoEmpty() {
        XCTAssertTrue(SearchHaptics.warns(from: .results, to: .empty))
        XCTAssertTrue(SearchHaptics.warns(from: .idle, to: .empty))
    }

    func testTheWarningDoesNotRepeatWhileTheQueryStaysEmpty() {
        // Typing further characters that also match nothing must stay silent, or every keystroke
        // past the first rattles.
        XCTAssertFalse(SearchHaptics.warns(from: .empty, to: .empty))
    }

    func testFindingResultsIsSilent() {
        // Results arriving is not a failure and gets no feedback of its own.
        XCTAssertFalse(SearchHaptics.warns(from: .empty, to: .results))
        XCTAssertFalse(SearchHaptics.warns(from: .idle, to: .results))
        XCTAssertFalse(SearchHaptics.warns(from: .empty, to: .idle))
    }

    func testClearingBackToIdleThenFailingAgainWarnsAgain() {
        // A fresh failed search is a fresh state change and should be felt.
        XCTAssertFalse(SearchHaptics.warns(from: .empty, to: .idle))
        XCTAssertTrue(SearchHaptics.warns(from: .idle, to: .empty))
    }
}
