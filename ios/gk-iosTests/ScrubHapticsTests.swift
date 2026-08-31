import XCTest
@testable import gk_ios

/// The rail's feel is the detent ladder. These lock the arithmetic that decides *whether* a sample
/// earned a tick, which is the part that can silently regress into either a dead rail or a rattle.
final class ScrubHapticsTests: XCTestCase {
    func testStayingInsideADetentIsSilent() {
        // Two samples a thousandth apart, comfortably inside one of the 32 minor detents.
        XCTAssertEqual(ScrubHapticLadder.tick(from: 0.501, to: 0.502), .none)
    }

    func testTheFirstSampleOfAGestureNeverReportsACrossing() {
        // The caller plays the "grab" itself; reporting a crossing here would double up.
        XCTAssertEqual(ScrubHapticLadder.tick(from: nil, to: 0.5), .none)
    }

    func testCrossingAMinorDetentTicks() {
        // 1/32 = 0.03125.
        XCTAssertEqual(ScrubHapticLadder.tick(from: 0.030, to: 0.035), .minor)
    }

    func testCrossingAMajorDetentOutranksTheMinorItAlsoCrosses() {
        // 1/8 = 0.125 is also a multiple of 1/32, so both ladders move; major must win.
        XCTAssertEqual(ScrubHapticLadder.tick(from: 0.120, to: 0.130), .major)
    }

    func testEveryMajorDetentIsAlsoAMinorDetent() {
        // This is the invariant that lets major simply out-rank minor: the visible tall marks sit
        // on top of short ones, so the ruler and the ladder cannot drift apart.
        XCTAssertEqual(ScrubDetents.minor % ScrubDetents.major, 0)
    }

    func testArrivingAtEitherEndReportsAnEdge() {
        XCTAssertEqual(ScrubHapticLadder.tick(from: 0.98, to: 1.0), .edge)
        XCTAssertEqual(ScrubHapticLadder.tick(from: 0.02, to: 0.0), .edge)
    }

    func testTheEdgeOnlyFiresOnArrival() {
        // Held against the end of the rail, further samples must stay silent rather than buzz.
        XCTAssertEqual(ScrubHapticLadder.tick(from: 1.0, to: 1.0), .none)
        XCTAssertEqual(ScrubHapticLadder.tick(from: 0.0, to: 0.0), .none)
    }

    func testOutOfRangeSamplesClampRatherThanRepeatTheEdge() {
        // A finger dragged past the rail keeps producing values beyond 0...1; they must not each
        // re-fire the boundary.
        XCTAssertEqual(ScrubHapticLadder.tick(from: 1.4, to: 1.9), .none)
        XCTAssertEqual(ScrubHapticLadder.tick(from: -0.4, to: -0.9), .none)
    }

    func testNonFiniteSamplesAreInert() {
        // A zero or unknown duration divides to NaN upstream; the rail must not emit on it.
        XCTAssertEqual(ScrubHapticLadder.tick(from: 0.5, to: .nan), .none)
        XCTAssertEqual(ScrubHapticLadder.tick(from: .infinity, to: 0.5), .none)
    }

    func testDetentIndexIsBoundedAcrossTheRail() {
        XCTAssertEqual(ScrubDetents.index(of: 0, count: 8), 0)
        XCTAssertEqual(ScrubDetents.index(of: 1, count: 8), 7)
        XCTAssertEqual(ScrubDetents.index(of: 2, count: 8), 7)
        XCTAssertEqual(ScrubDetents.index(of: -1, count: 8), 0)
        XCTAssertEqual(ScrubDetents.index(of: 0.5, count: 8), 4)
    }

    func testASweepAcrossTheRailTicksOncePerDetent() {
        // Walking the rail in small steps must produce exactly the ladder — no missed notches from
        // rounding, no doubled ones. 8 major crossings, and 32 minor detents minus those 8.
        var previous = 0.0
        var majors = 0
        var minors = 0
        var edges = 0
        for step in 1...2000 {
            let next = Double(step) / 2000
            switch ScrubHapticLadder.tick(from: previous, to: next) {
            case .major: majors += 1
            case .minor: minors += 1
            case .edge: edges += 1
            case .none: break
            }
            previous = next
        }
        XCTAssertEqual(majors, ScrubDetents.major - 1)
        XCTAssertEqual(minors, ScrubDetents.minor - ScrubDetents.major)
        XCTAssertEqual(edges, 1)
    }
}
