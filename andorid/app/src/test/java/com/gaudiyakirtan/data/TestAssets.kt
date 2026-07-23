package com.gaudiyakirtan.data

import java.io.File

/**
 * Locates the real `app/src/main/assets/` directory from a JVM unit test (`app/src/test`), so tests
 * exercise the actual bundled corpus rather than synthetic fixtures. Robust to Gradle's unit-test
 * working directory being either the `app/` module directory (the default for
 * `:app:testDebugUnitTest`) or the repo root.
 */
object TestAssets {
    val dir: File = listOf(
        File("src/main/assets"),
        File("app/src/main/assets"),
        File("andorid/app/src/main/assets")
    ).firstOrNull { it.isDirectory } ?: error(
        "Could not locate app/src/main/assets from working directory ${File(".").absolutePath}"
    )
}
