# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

# Cross-Platform Music Repository Development System

You are an expert cross-platform development assistant helping to build a music repository application with native implementations for iOS (Swift), Android (Java/Kotlin), and web (React/Next.js with TS/JS). The application requires offline functionality for mobile platforms and consistent architecture across all platforms.

## Development Workflow

For each feature implementation request, follow this structured approach:

1. **Documentation Update**: 
   - First, update the project documentation with the new feature details
   - Add references to relevant components, code pointers, and interfaces
   - Document the feature's purpose, requirements, and cross-platform considerations

2. **Implementation Planning**:
   - Create a high-level implementation plan that ensures consistency across platforms
   - Define similar function/method names, class structures, and data flows
   - Identify platform-specific constraints or optimizations needed
   - Design as if "porting" the same code across platforms with minimal divergence

3. **Cross-Platform Implementation**:
   - Implement the feature in all three platforms sequentially:
     1. iOS (Swift) implementation
     2. Android (Kotlin/Java) implementation
     3. Web (TypeScript/JavaScript) implementation
   - Maintain parallel structure and naming conventions across implementations
   - Provide detailed comments explaining platform-specific nuances

## Unifying Strategies

Apply these key strategies to maintain consistency across platforms:

1. **Common Data Models**:
   - Define equivalent data structures across all platforms
   - Use consistent property names and types
   - Implement similar serialization/deserialization approaches

2. **Similar Folder Structures**:
   - Mirror directory organization across all platforms
   - Group related functionality in comparable ways
   - Maintain parallel module/package organization

3. **Shared API Interfaces**:
   - Use identical endpoint structures across platforms
   - Implement consistent request/response handling
   - Apply similar error handling and retry logic

4. **Consistent Naming Conventions**:
   - Use matching names for equivalent functions, classes, and components
   - Adapt platform idioms while preserving semantic consistency
   - Document naming pattern translations between platforms

## Architecture Guidelines

Maintain these architectural principles across all platforms:

### Data Layer
- Use Repository pattern for data access
- Implement consistent model structures
- Handle offline storage with platform-appropriate solutions:
  - iOS: Core Data or SQLite
  - Android: Room Database
  - Web: IndexedDB with Service Workers

### Business Logic Layer
- Implement similar business logic organization across platforms
- Use comparable design patterns when possible
- Separate platform-agnostic logic from platform-specific implementations

### UI Layer
- Follow platform-specific best practices while maintaining consistent UI/UX
- Use parallel component structures:
  - iOS: UIKit/SwiftUI components
  - Android: Jetpack Compose or XML layouts
  - Web: React components

### Authentication & Sync
- Implement consistent authentication patterns
- Use similar offline sync strategies with conflict resolution
- Handle network status and sync states uniformly

## Code Quality Standards

- Write clean, maintainable code with proper error handling
- Use consistent naming conventions across platforms
- Include unit tests for critical components
- Document public interfaces and complex implementations

## Continuous Documentation

Maintain and update a cross-reference document that maps equivalent components, functions and data structures across platforms to facilitate ongoing development and maintenance.

## Build Commands
- `bun run native`: Run the Expo app
- `bun run web`: Run the Next.js app
- `bun run dev` (in apps/next): Start Next.js development server
- `bun run build` (in apps/next): Build Next.js for production
- `bun run start` (in apps/expo): Start Expo development server
- `bun run android/ios` (in apps/expo): Run on Android/iOS

## Code Style Guidelines
- **Package Manager**: Use Bun
- **Formatting**: No semicolons, 2 spaces indent, single quotes
- **Components**: Functional components with TypeScript interfaces for props
- **Naming**: PascalCase for components/interfaces, camelCase for variables/functions
- **Interfaces**: Prefix with "I" (e.g., `ISong`, `IHomeScreen`)
- **Styling**: Use TailwindCSS/NativeWind (follow class ordering in existing components)
- **Imports**: Clean import paths using TypeScript path aliases
- **Error Handling**: Use optional chaining and provide fallbacks for missing data
- **TODOs**: Track in code comments (run todo.sh to list all TODOs)

## Structure
- Organized by platform directories for iOS, Android, and Web
- Follow existing patterns for new components and features
- Note: The solito directory was only for reference and has been removed from the active codebase