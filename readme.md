# Gaudiya Kirtan App

A comprehensive cross-platform application for exploring Gaudiya Vaishnava kirtan and devotional songs. This monorepo contains native implementations for iOS, Android, and Web platforms.

## Project Structure

This project is organized as a monorepo with platform-specific implementations:

```
/
├── ios/              # iOS implementation (Swift/SwiftUI)
├── android/          # Android implementation (Java/Kotlin)
├── web/              # Web implementation (TypeScript/Next.js)
├── shared/           # Shared resources
└── docs/             # Documentation
```

## Key Features

- Browse songs, authors, topics, and books
- View song lyrics with original text, transliterations, word-by-word translations, and full translations
- Support for multiple languages (English, Bengali, Hindi, etc.)
- Consistent user experience across all platforms
- Offline functionality (coming soon)

## Platform Implementations

### iOS (Swift/SwiftUI)
- Native SwiftUI implementation with MVVM architecture
- Supports light and dark mode with custom theming
- Tab-based navigation with smooth transitions

### Android (Java/Kotlin)
- Dual implementation approach:
  1. Traditional Java implementation with XML layouts and RecyclerView
  2. Modern Kotlin implementation with Jetpack Compose
- Consistent theming with Material Design components

### Web (TypeScript/Next.js)
- React-based implementation with Next.js framework
- Responsive design with TailwindCSS
- Client-side routing with static page generation

## Getting Started

### iOS
```bash
cd ios
# Open Xcode project
xed ./gk-ios.xcodeproj
```

### Android
```bash
cd android
# Open in Android Studio
./gradlew build
```

### Web
```bash
cd web
npm install
npm run dev
```

## Documentation

Detailed documentation is available in the `/docs` directory:

- [Architecture Overview](/docs/architecture/overview.md)
- [iOS Implementation](/docs/ios/implementation.md)
- [Android Implementation](/docs/android/implementation.md)
- [Web Implementation](/docs/web/implementation.md)
- [Shared Models](/docs/shared/models.md)
- [Theme Colors](/docs/theme/colors.md)
- [Implementation Mapping](/docs/implementation-mapping.md)

## Contributing

Refer to the documentation for understanding the project structure and implementation approaches. When adding new features, ensure consistency across all platforms by following the established patterns and using the shared color scheme and component structures.

## License

TBD