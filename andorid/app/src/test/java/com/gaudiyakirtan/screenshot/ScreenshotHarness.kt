package com.gaudiyakirtan.screenshot

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme

/**
 * Shared setup for the JVM Compose screenshot tests.
 *
 * These run on Robolectric rather than a device, so a machine with no emulator (and no KVM) can
 * still verify the screens visually -- the rendered PNGs are what we attach to a PR. Assets are
 * merged into the unit-test runtime (`testOptions.unitTests.isIncludeAndroidResources`), so the
 * bundled corpus is readable and the shots show real songs, exactly like the offline app.
 */
object Devices {
    /** Pixel-ish phone in dp; Roborazzi renders at this logical size. */
    const val PHONE_WIDTH_DP = 411
    const val PHONE_HEIGHT_DP = 891
}

/** Wraps content in the app palette so a shot shows the real Gaura/Shyam tokens, not Material defaults. */
@Composable
fun ScreenshotSurface(darkTheme: Boolean, content: @Composable () -> Unit) {
    GaudiyaKirtanTheme(darkTheme = darkTheme) {
        Surface(color = MaterialTheme.colorScheme.background) {
            Box(modifier = Modifier.fillMaxSize()) { content() }
        }
    }
}

/*
 * Running these:
 *   ./gradlew :app:recordRoborazziDebug --tests "com.gaudiyakirtan.screenshot.*"
 * writes PNGs under `app/build/screenshots/`. Verify against recorded goldens with
 * `:app:verifyRoborazziDebug`. No device, no emulator, no KVM -- which is what makes these usable
 * from CI and from a container.
 */
