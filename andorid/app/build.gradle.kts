plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    kotlin("plugin.serialization") version "2.0.21"
    // Compose screenshot tests run on the JVM (Robolectric), so a CI box without an emulator --
    // or a KVM-less container -- can still verify the screens visually. See app/src/test/.../screenshot/.
    id("io.github.takahirom.roborazzi") version "1.32.2"
}

android {
    namespace = "com.gaudiyakirtan.myapplication"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.gaudiyakirtan.myapplication"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
    testOptions {
        // Robolectric needs the merged Android resources + assets (the bundled corpus lives in
        // assets/, so screenshot tests can render real songs offline).
        unitTests.isIncludeAndroidResources = true
        unitTests.all { it.systemProperty("robolectric.graphicsMode", "NATIVE") }
    }
}

/*
 * Workaround for an AGP 8.8 packaging bug that blocks Robolectric.
 *
 * `packageDebugUnitTestForUnitTest` is supposed to emit an `apk-for-local-test.ap_` holding the
 * linked resources *and* the merged assets; on AGP 8.8 it emits only the assets, with no
 * `AndroidManifest.xml` and no `resources.arsc`. Robolectric reads that archive's path out of the
 * generated `com/android/tools/test_config.properties` and dies with
 * `FileNotFoundException: AndroidManifest.xml` before any test body runs.
 *
 * So rebuild the archive ourselves from the two intermediates AGP produced correctly. Harmless once
 * AGP is fixed -- it would just rewrite an equivalent file. Drop it when the unit-test APK contains
 * a manifest again (check with `unzip -l` on the path below).
 */
val rebuildUnitTestApk = tasks.register<Zip>("rebuildDebugUnitTestApk") {
    dependsOn("packageDebugUnitTestForUnitTest")
    from(zipTree(layout.buildDirectory.file(
        "intermediates/linked_resources_binary_format/debug/processDebugResources/linked-resources-binary-format-debug.ap_"
    )))
    from(layout.buildDirectory.dir("intermediates/assets/debug/mergeDebugAssets")) { into("assets") }
    archiveFileName.set("apk-for-local-test.ap_")
    destinationDirectory.set(layout.buildDirectory.dir("robolectric-apk"))
    doLast {
        // Copy over AGP's broken artifact outside Gradle's output tracking, so generateDebugUnitTestConfig
        // (which reads that path) doesn't see it as an undeclared producer.
        archiveFile.get().asFile.copyTo(
            layout.buildDirectory.file(
                "intermediates/apk_for_local_test/debugUnitTest/packageDebugUnitTestForUnitTest/apk-for-local-test.ap_"
            ).get().asFile,
            overwrite = true
        )
    }
}
tasks.matching { it.name == "testDebugUnitTest" }.configureEach { dependsOn(rebuildUnitTestApk) }

dependencies {
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    val nav_version = "2.8.5"

    // Jetpack Compose integration
    implementation("androidx.navigation:navigation-compose:$nav_version")

    // Views/Fragments integration
    implementation("androidx.navigation:navigation-fragment:$nav_version")
    implementation("androidx.navigation:navigation-ui:$nav_version")

    // Feature module support for Fragments
    implementation("androidx.navigation:navigation-dynamic-features-fragment:$nav_version")

    // Testing Navigation
    androidTestImplementation("androidx.navigation:navigation-testing:$nav_version")

    // JSON serialization library, works with the Kotlin serialization plugin
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // Coil image loading
    implementation("io.coil-kt.coil3:coil-compose:3.0.4")
    implementation("io.coil-kt.coil3:coil-network-okhttp:3.0.4")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("androidx.compose.material:material:1.7.6")
    implementation("androidx.compose.foundation:foundation:1.7.6")

    val lifecycle_version = "2.8.7"
    val arch_version = "2.2.0"

    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:$lifecycle_version")
    // ViewModel utilities for Compose
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:$lifecycle_version")
    // LiveData
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:$lifecycle_version")
    // Lifecycles only (without ViewModel or LiveData)
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:$lifecycle_version")
    // Lifecycle utilities for Compose
    implementation("androidx.lifecycle:lifecycle-runtime-compose:$lifecycle_version")

    // Saved state module for ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-savedstate:$lifecycle_version")

    // Annotation processor
//    kapt("androidx.lifecycle:lifecycle-compiler:$lifecycle_version")
    // alternately - if using Java8, use the following instead of lifecycle-compiler
    implementation("androidx.lifecycle:lifecycle-common-java8:$lifecycle_version")

    // optional - helpers for implementing LifecycleOwner in a Service
    implementation("androidx.lifecycle:lifecycle-service:$lifecycle_version")

    // optional - ProcessLifecycleOwner provides a lifecycle for the whole application process
    implementation("androidx.lifecycle:lifecycle-process:$lifecycle_version")

    // optional - ReactiveStreams support for LiveData
    implementation("androidx.lifecycle:lifecycle-reactivestreams-ktx:$lifecycle_version")

    // optional - Test helpers for LiveData
    testImplementation("androidx.arch.core:core-testing:$arch_version")

    // optional - Test helpers for Lifecycle runtime
    testImplementation ("androidx.lifecycle:lifecycle-runtime-testing:$lifecycle_version")

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    testImplementation(libs.junit)

    // JVM Compose screenshot tests (Robolectric + Roborazzi) -- no emulator required.
    testImplementation("org.robolectric:robolectric:4.14.1")
    testImplementation("io.github.takahirom.roborazzi:roborazzi:1.32.2")
    testImplementation("io.github.takahirom.roborazzi:roborazzi-compose:1.32.2")
    testImplementation(platform(libs.androidx.compose.bom))
    testImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.test.manifest)

    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}