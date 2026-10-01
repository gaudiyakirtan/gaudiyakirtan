import XCTest

final class HomeUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor
    func testSettingsSheetReturnsToHomeAndRetainsTabs() {
        let app = XCUIApplication()
        app.launch()
        let settings = app.buttons["home.settings"]
        XCTAssertTrue(settings.waitForExistence(timeout: 10))
        XCTAssertGreaterThanOrEqual(settings.frame.width, 44)
        XCTAssertGreaterThanOrEqual(settings.frame.height, 44)
        settings.tap()
        XCTAssertTrue(app.navigationBars["Settings"].waitForExistence(timeout: 5))
        app.buttons["Done"].tap()
        XCTAssertTrue(settings.waitForExistence(timeout: 5))
        for tab in ["Home", "Library", "Collections", "Search"] {
            XCTAssertTrue(app.tabBars.buttons[tab].exists)
        }
    }

    @MainActor
    func testHomeSongGridOpensDetailAndReturns() {
        let app = XCUIApplication()
        app.launch()
        let song = app.descendants(matching: .any)
            .matching(NSPredicate(format: "identifier BEGINSWITH %@", "home.song.")).firstMatch
        XCTAssertTrue(song.waitForExistence(timeout: 10))
        XCTAssertGreaterThanOrEqual(song.frame.height, 44)
        song.tap()
        let back = app.buttons["Back"]
        XCTAssertTrue(back.waitForExistence(timeout: 5))
        back.tap()
        XCTAssertTrue(app.buttons["home.settings"].waitForExistence(timeout: 5))
    }

    @MainActor
    func testHomeSearchAutofocusesAndOpensARealSong() {
        let app = XCUIApplication()
        app.launch()
        let search = app.descendants(matching: .any).matching(identifier: "home.search").firstMatch
        XCTAssertTrue(search.waitForExistence(timeout: 10))
        XCTAssertGreaterThanOrEqual(search.frame.height, 44)
        search.tap()
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5))
        let field = app.textFields["Search songs or authors"]
        field.typeText("akrodha paramananda")
        let song = app.descendants(matching: .any).matching(identifier: "song.N9").firstMatch
        XCTAssertTrue(song.waitForExistence(timeout: 5))
        song.tap()
        XCTAssertTrue(app.buttons["Back"].waitForExistence(timeout: 5))
    }
}
