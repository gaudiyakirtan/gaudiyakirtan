# Shared Models

This document details the shared data models that are consistently implemented across all platforms in the Gaudiya Kirtan application.

## Model Structure

Each model maintains the same structure and property names across all platforms, with appropriate type mappings for each language:

### Song

The Song model represents a kirtan or devotional song in the repository:

| Property  | iOS (Swift) | Android (Java) | Web (TypeScript) |
|-----------|-------------|----------------|------------------|
| id        | String      | String         | string           |
| title     | String      | String         | string           |
| author    | String      | String         | string           |
| lyrics    | String      | String         | string           |
| tags      | [String]    | List<String>   | string[]         |
| dateAdded | Date        | Date           | Date             |

## Code Pointers

### Swift Implementation

```swift
// See: /ios/GaudiyaKirtan/GaudiyaKirtan/Models/Song.swift
struct Song: Codable, Identifiable {
    let id: String
    let title: String
    let author: String
    let lyrics: String
    let tags: [String]
    let dateAdded: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case author
        case lyrics
        case tags
        case dateAdded = "date_added"
    }
}
```

### Java Implementation

```java
// See: /android/app/src/main/java/com/gaudiyakirtan/models/Song.java
public class Song {
    private String id;
    private String title;
    private String author;
    private String lyrics;
    private List<String> tags;
    private Date dateAdded;
    
    // Constructor and getters/setters...
}
```

### TypeScript Implementation

```typescript
// See: /web/src/models/Song.ts
export interface ISong {
  id: string
  title: string
  author: string
  lyrics: string
  tags: string[]
  dateAdded: Date
}
```

### Shared Reference Model

```typescript
// See: /shared/models/Song.ts
export interface ISong {
  id: string
  title: string
  author: string
  lyrics: string
  tags: string[]
  dateAdded: Date
}
```

## Serialization

### JSON Format

All platforms will use the same JSON format for API communication:

```json
{
  "id": "song123",
  "title": "Hare Krishna Mahamantra",
  "author": "Traditional",
  "lyrics": "Hare Krishna Hare Krishna\nKrishna Krishna Hare Hare\nHare Rama Hare Rama\nRama Rama Hare Hare",
  "tags": ["mahamantra", "traditional", "krishna"],
  "date_added": "2023-04-01T12:00:00Z"
}
```