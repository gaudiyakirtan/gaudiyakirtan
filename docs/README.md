# Gaudiya Kirtan Application Documentation

Welcome to the Gaudiya Kirtan application documentation. This repository contains comprehensive documentation for the cross-platform Gaudiya Kirtan application.

## Table of Contents

- [Architecture Overview](/docs/architecture/overview.md)
- Platform-Specific Implementations:
  - [iOS Implementation](/docs/ios/implementation.md)
  - [Android Implementation](/docs/android/implementation.md)
  - [Web Implementation](/docs/web/implementation.md)
- [Shared Models](/docs/shared/models.md)

## Project Overview

Gaudiya Kirtan is a cross-platform application designed to provide access to a comprehensive repository of devotional songs. The application is implemented natively for each platform:

- iOS: Swift/UIKit
- Android: Java/Kotlin
- Web: TypeScript/Next.js

All platforms share consistent data models, UI flow, and offline capabilities.

## CI/CD Workflows

The project uses GitHub Actions for continuous integration, delivery, and release with the following workflows:

### Build Verification and Release

- **iOS Build**: Verifies and releases the iOS app
  - Triggered on changes to iOS code in the `mono` branch
  - Builds the app using Xcode without code signing
  - For direct pushes to `mono`, creates an IPA file and publishes a GitHub release
  
- **Android Build**: Verifies and releases the Android app
  - Triggered on changes to Android code in the `mono` branch
  - Builds a debug APK using Gradle
  - For direct pushes to `mono`, publishes the APK as a GitHub release
  
- **Web Build**: Verifies and packages the web application
  - Triggered on changes to web code in the `mono` branch
  - Runs linting and builds the Next.js application
  - For direct pushes to `mono`, packages the build and publishes it as a GitHub release

### Combined Workflow

- **All Platform Build**: Orchestrates builds for all three platforms based on changed files
  - Triggered on pushes and pull requests to the `mono` branch
  - Determines which platform code has changed
  - Triggers the appropriate platform-specific build workflows
  - Can be manually triggered via workflow dispatch
  
### Release Artifacts

Each successful build on the `mono` branch automatically:
- Creates a tagged GitHub release with incrementing build numbers
- Attaches platform-specific build artifacts to the release
- Provides a changelog based on the commit that triggered the build

## Code Pointers

This documentation contains code pointers that reference specific files in the codebase. These pointers serve as navigational aids to help developers understand the relationships between documentation concepts and their implementation in code.

Example of a code pointer:
```
See: /ios/GaudiyaKirtan/GaudiyaKirtan/Models/Song.swift
```

## Development Workflow

When implementing new features, refer to the [Architecture Overview](/docs/architecture/overview.md) to ensure consistent implementation across all platforms. Each feature should maintain parallel structure and naming conventions across all platform implementations.

## Maintaining Documentation

As the codebase evolves, please update this documentation to keep it current. Documentation updates should:

1. Reflect changes in data models or architecture
2. Update code pointers when file paths change
3. Add new sections for new features or components
4. Remove references to deprecated or removed features