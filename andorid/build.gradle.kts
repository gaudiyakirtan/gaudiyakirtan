// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    // AGP 9 has built-in Kotlin support, so `kotlin.android` is no longer applied.
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.compose) apply false
}