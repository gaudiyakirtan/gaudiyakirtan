import XCTest

/// Regression tests for the two layout defects that made the v15 resting mini-player unshippable on
/// iOS 26 — both of which are invisible to a unit test, because both are about where UIKit actually
/// puts the tab bar.
///
/// They are written against the *accessibility tree*, not against pixels: "does a tab bar with four
/// reachable items exist, and does the bar overlap it" is a hard question with a hard answer, and it
/// stays true across devices and OS versions in a way a screenshot comparison would not.
///
/// Neither test depends on a particular song being in the corpus. That is deliberate — seven of the
/// unit tests in this project had to be repaired for exactly that reason (see PR #52).
final class MiniPlayerBarUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
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

    /// **Defect 1 — the bar covered the tab bar.**
    ///
    /// A `safeAreaInset(edge: .bottom)` on a `TabView` is laid out against the *window's* bottom
    /// safe area, not above the tab bar, so the bar landed directly on top of it: measured on
    /// iOS 26.5, tab bar 791–874 and bar 784–840. `AppNavigation` offsets the bar by the tab bar's
    /// measured overhang to correct it; this pins that the two no longer intersect.
    ///
    /// Uses the preseeded route rather than navigating, so it is testing the inset's geometry and
    /// nothing else.
    func testRestingBarDoesNotCoverTheTabBar() {
        let app = launchResting(onSong: "A10")
        let control = app.buttons["Play"].firstMatch
        XCTAssertTrue(
            control.waitForExistence(timeout: 30),
            "a preseeded last-visited song should put the bar in its resting state"
        )

        let bar = tabBar(of: app)
        XCTAssertTrue(bar.exists, "the tab bar should be present alongside the resting bar")
        XCTAssertEqual(bar.buttons.count, 4, "all four tabs should be present")
        XCTAssertTrue(
            control.frame.maxY <= bar.frame.minY,
            "the mini-player overlaps the tab bar: bar ends at \(control.frame.maxY), "
                + "tab bar starts at \(bar.frame.minY)"
        )
    }

    /// **Defect 2 — the reader destroyed the tab bar for the rest of the session.**
    ///
    /// `SongView` hides the tab bar with `.toolbar(.hidden, for: .tabBar)` for its full-screen
    /// layout, on the documented assumption that the scoped modifier "restores automatically when
    /// this view is popped". On iOS 26 it does not: after one visit to the reader the tab bar was
    /// gone for good — `tabBars.count` 1 → 0, no items on screen and none in the accessibility
    /// tree. The tab roots now state `.toolbar(.visible, for: .tabBar)` to make the restore
    /// explicit.
    ///
    /// Finds the first song card rather than naming one, so no corpus change can break it.
    func testTabBarSurvivesAVisitToTheReader() {
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
        XCTAssertEqual(tabBar(of: app).buttons.count, 4, "precondition: four tabs before the reader")

        let back = app.buttons["Back"]
        // The grid settles while the corpus loads, so the first tap can land on a moving target.
        for _ in 0..<5 {
            if back.exists { break }
            card.tap()
            if back.waitForExistence(timeout: 8) { break }
        }
        XCTAssertTrue(back.exists, "tapping a card should open the reader")
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
}
