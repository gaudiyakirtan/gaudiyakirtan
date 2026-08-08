package com.gaudiyakirtan.screenshot

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.github.takahirom.roborazzi.captureRoboImage
import com.gaudiyakirtan.myapplication.ui.settings.SettingsScreen
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/** Settings with its live preview, in both palettes, rendered off the real bundled corpus. */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
// A phone-width but very tall viewport, so one shot shows the whole scrollable screen instead of
// just the first 891dp of it.
@Config(sdk = [34], qualifiers = "w411dp-h2400dp-xhdpi")
class SettingsScreenshotTest {

    @get:Rule val compose = createComposeRule()

    @Test
    fun `settings gaura`() {
        compose.setContent { ScreenshotSurface(darkTheme = false) { SettingsScreen(onBackClick = {}) } }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/settings-gaura.png")
    }

    @Test
    fun `settings shyam`() {
        compose.setContent { ScreenshotSurface(darkTheme = true) { SettingsScreen(onBackClick = {}) } }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/settings-shyam.png")
    }
}
