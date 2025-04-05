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