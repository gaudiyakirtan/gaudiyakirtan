# Architecture Overview

This document provides an overview of the Gaudiya Kirtan application architecture across all platforms.

## Core Principles

The application follows these core architectural principles:

1. **Platform-Native Implementations**: Each platform uses its native technologies and follows platform-specific best practices.
2. **Consistent Data Models**: All platforms share the same data model structure.
3. **Parallel Component Structure**: Similar components and screens exist across all platforms.
4. **Offline-First Approach**: All platforms support offline functionality with data sync.

## Code Structure

### iOS (Swift)
- Entry Point: [AppDelegate.swift](/ios/GaudiyaKirtan/GaudiyaKirtan/AppDelegate.swift)
- Main UI: [HomeViewController.swift](/ios/GaudiyaKirtan/GaudiyaKirtan/Controllers/HomeViewController.swift)
- Data Models: [Song.swift](/ios/GaudiyaKirtan/GaudiyaKirtan/Models/Song.swift)

### Android (Java/Kotlin)
- Entry Point: [MainActivity.java](/android/app/src/main/java/com/gaudiyakirtan/MainActivity.java)
- UI Layout: [activity_main.xml](/android/app/src/main/res/layout/activity_main.xml)
- Data Models: [Song.java](/android/app/src/main/java/com/gaudiyakirtan/models/Song.java)

### Web (React/Next.js)
- Entry Point: [index.tsx](/web/src/pages/index.tsx)
- Data Models: [Song.ts](/web/src/models/Song.ts)

### Shared
- Common Models: [Song.ts](/shared/models/Song.ts)

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Interface │     │  Business Logic │     │    Data Layer   │
│  (Views/Pages)  │────▶│  (Controllers)  │────▶│  (Repositories) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  Offline Store  │
                                               │   (Local DB)    │
                                               └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   Remote API    │
                                               │    (Server)     │
                                               └─────────────────┘
```