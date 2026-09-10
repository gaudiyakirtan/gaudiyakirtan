import UIKit
import XCTest

/// Regression tests for the layout defects that made the v15 resting mini-player unshippable —
/// measured on iOS 18.5 and 26.5, and all invisible to a unit test, because all are about where
/// UIKit actually puts the tab bar.
///
/// They are written against the *accessibility tree*, not against pixels: "does a tab bar with
/// four reachable items exist, and does the bar overlap it" is a hard question with a hard answer,
/// and it stays true across devices and OS versions in a way a screenshot comparison would not.
///
/// Corpus coupling is kept to one uid on purpose — seven of the unit tests in this project had to
/// be repaired for pinning corpus values (see PR #52). The overlap test preseeds `A10` and accepts
/// either resting affordance, so it needs only that `A10` exists; the reader test matches the first
/// song card by its label's shape and names no song at all.
final class MiniPlayerBarUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
        // Orientation is device state and outlives a test session: the launch tests in this target
        // run once per UI configuration and leave the simulator in landscape. Pin it so these
        // geometry tests measure what they say they measure.
        XCUIDevice.shared.orientation = .portrait
    }

    /// Launches with the last-visited record preseeded, so the resting bar is on screen from the
    /// first frame without the reader ever being opened.
    private func launchResting(onSong uid: String) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-player.lastVisitedSongUid", uid]
        app.launch()
        return app
    }

    private func tabBar(of app: XCUIApplication) -> XCUIElement {
        app.tabBars.firstMatch
    }

    /// The bottom-tab-bar tests are phone tests. iPadOS 18+ draws the tab bar as a floating bar
    /// at the top, which XCUI does not expose as a `TabBar`, and nothing sits under the bar there.
    private func skipUnlessPhone() throws {
        try XCTSkipIf(
            UIDevice.current.userInterfaceIdiom == .pad,
            "phone layout only: iPad's tab bar is a floating top bar, not a bottom TabBar"
        )
    }

    /// Waits until `condition` holds. Layout settles over a few frames after a rotation, so a
    /// geometry check reads frames only once they have stopped moving toward the answer.
    private func waitUntil(_ timeout: TimeInterval, _ condition: @escaping () -> Bool) -> Bool {
        let settled = XCTNSPredicateExpectation(
            predicate: NSPredicate { _, _ in condition() },
            object: nil
        )
        return XCTWaiter().wait(for: [settled], timeout: timeout) == .completed
    }

    /// Waits for `element` to leave the accessibility tree — a hidden tab bar is removed from it,
    /// not merely made non-hittable.
    private func waitForAbsence(of element: XCUIElement, timeout: TimeInterval) -> Bool {
        let gone = XCTNSPredicateExpectation(
            predicate: NSPredicate(format: "exists == false"),
            object: element
        )
        return XCTWaiter().wait(for: [gone], timeout: timeout) == .completed
    }

    /// **The bar covered the tab bar.**
    ///
    /// A `safeAreaInset(edge: .bottom)` on the `TabView` is laid out against the *window's* bottom
    /// safe area, not above the tab bar, so the bar landed directly on top of it — iOS 26.5: tab
    /// bar 791–874, bar 784–840; iOS 18.5: tab bar from 769, the control at 783. `AppNavigation`
    /// now mounts the bar on each tab's own stack, whose safe area includes the tab bar; this pins
    /// that the two no longer intersect. Non-intersection rather than "ends above", so it holds
    /// wherever the platform puts the tab bar.
    ///
    /// Uses the preseeded route rather than navigating, so it is testing the inset's geometry and
    /// nothing else — in both orientations.
    func testRestingBarDoesNotCoverTheTabBar() throws {
        try skipUnlessPhone()
        let app = launchResting(onSong: "A10")
        // Either resting affordance will do — play, or the open-song chevron for a song without
        // audio — so a corpus change to A10's audio cannot fail a geometry test.
        let control = app.buttons
            .matching(NSPredicate(format: "label IN %@", ["Play", "Open song"]))
            .firstMatch
        XCTAssertTrue(
            control.waitForExistence(timeout: 30),
            "a preseeded last-visited song should put the bar in its resting state"
        )

        // Both orientations: the tab bar is a different height in each, and the old layout
        // overlapped in each (portrait on iOS 18.5 and 26.5; landscape measured on 18.5).
        addTeardownBlock { XCUIDevice.shared.orientation = .portrait }
        let orientations: [(UIDeviceOrientation, String)] = [
            (.portrait, "portrait"), (.landscapeLeft, "landscape"),
        ]
        for (orientation, name) in orientations {
            XCUIDevice.shared.orientation = orientation
            let bar = tabBar(of: app)
            XCTAssertTrue(
                bar.waitForExistence(timeout: 10),
                "the tab bar should be present alongside the resting bar (\(name))"
            )
            XCTAssertEqual(bar.buttons.count, 4, "all four tabs should be present (\(name))")
            XCTAssertTrue(
                waitUntil(5) { !control.frame.intersects(bar.frame) },
                "the mini-player overlaps the tab bar in \(name): control \(control.frame), "
                    + "tab bar \(bar.frame)"
            )
        }
    }

    /// **The reader destroyed the tab bar for the rest of the session — and the first fix for that
    /// put it back under the verses.** Both halves of song-detail.md v2's "NO bottom tab bar".
    ///
    /// `SongView` hides the tab bar with `.toolbar(.hidden, for: .tabBar)` on the documented
    /// assumption that the scoped modifier "restores automatically when this view is popped". It
    /// does not — measured on iOS 18.5 and 26.5: after one visit to the reader the tab bar was gone
    /// for good, `tabBars.count` 1 → 0, no items on screen and none in the accessibility tree
    /// (reproduced on `mono`). Stating a constant `.visible` on the tab roots restored it, but also
    /// overrode the reader, leaving a live tab bar under the verses. The tab roots now bind
    /// visibility to whether the reader is up, so this checks both: hidden in the reader, all four
    /// tabs back after it.
    ///
    /// Finds the first song card rather than naming one, so no corpus change can break it.
    func testReaderHidesTheTabBarAndPopRestoresIt() throws {
        try skipUnlessPhone()
        let app = XCUIApplication()
        app.launch()

        // Song cards are the only buttons labelled "<title>, <uid>, <author>"; matching on the
        // shape rather than on a title keeps this independent of which songs ship.
        let cards = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", ", "))
        let card = cards.firstMatch
        XCTAssertTrue(
            card.waitForExistence(timeout: 30),
            "home should show at least one song card (matched \(cards.count) of "
                + "\(app.buttons.count) buttons)"
        )
        XCTAssertEqual(
            tabBar(of: app).buttons.count, 4, "precondition: four tabs before the reader"
        )

        let back = app.buttons["Back"]
        // The grid settles while the corpus loads, so the first tap can land on a moving target.
        for _ in 0..<5 {
            if back.exists { break }
            card.tap()
            if back.waitForExistence(timeout: 8) { break }
        }
        XCTAssertTrue(back.exists, "tapping a card should open the reader")
        XCTAssertTrue(
            waitForAbsence(of: tabBar(of: app), timeout: 5),
            "the reader is full-screen: no tab bar while it is up (song-detail.md v2)"
        )
        back.tap()

        let bar = tabBar(of: app)
        XCTAssertTrue(
            bar.waitForExistence(timeout: 10),
            "the tab bar must come back when the reader is popped"
        )
        XCTAssertEqual(
            bar.buttons.count, 4,
            "all four tabs must be reachable again after returning from the reader"
        )
    }

    /// **In a two-column layout the reader must not take the tab bar with it.** On iPad the reader
    /// is a detail column beside the list and is never popped, so applying the phone's "no tab bar
    /// on song-detail" rule there removed iPadOS's top tab bar for the rest of the session — one
    /// tap on any song, reproduced on `mono` too. `AppNavigation` applies that rule in compact
    /// width only.
    ///
    /// The tab is found by its label, since the iPad bar is not exposed as a `TabBar`.
    func testReaderKeepsTheTabBarInTwoColumnLayouts() throws {
        try XCTSkipUnless(
            UIDevice.current.userInterfaceIdiom == .pad,
            "two-column layout: iPad only"
        )
        let app = XCUIApplication()
        app.launch()

        let library = app.buttons["Library"].firstMatch
        XCTAssertTrue(library.waitForExistence(timeout: 30), "precondition: the tab bar is up")
        let card = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", ", ")).firstMatch
        XCTAssertTrue(
            card.waitForExistence(timeout: 30), "home should show at least one song card"
        )

        let back = app.buttons["Back"]
        for _ in 0..<5 {
            if back.exists { break }
            card.tap()
            if back.waitForExistence(timeout: 8) { break }
        }
        XCTAssertTrue(back.exists, "tapping a card should open the reader")
        XCTAssertTrue(
            library.exists && library.isHittable,
            "the tab bar must stay while the reader occupies the detail column"
        )
    }
}
