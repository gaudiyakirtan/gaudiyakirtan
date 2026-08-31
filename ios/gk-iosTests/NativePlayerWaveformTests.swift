import XCTest
@testable import gk_ios

final class NativePlayerWaveformTests: XCTestCase {
    func testProfileIsStableForTheSameRecording() {
        XCTAssertEqual(
            NativePlayerWaveform.heights(seed: "brsm-1", count: 64),
            NativePlayerWaveform.heights(seed: "brsm-1", count: 64)
        )
    }

    func testProfileChangesWithTheRecording() {
        XCTAssertNotEqual(
            NativePlayerWaveform.heights(seed: "brsm-1", count: 64),
            NativePlayerWaveform.heights(seed: "bvnm-1", count: 64)
        )
    }

    func testProfileHasRequestedCountAndBoundedHeights() {
        let heights = NativePlayerWaveform.heights(seed: "brsm-1", count: 19)

        XCTAssertEqual(heights.count, 19)
        XCTAssertTrue(heights.allSatisfy { (0.24...1).contains($0) })
        XCTAssertEqual(NativePlayerWaveform.heights(seed: "brsm-1", count: 0), [])
    }
}
