# Backend System Plan — Gaudiya Kirtan

## Overview

Build a GraphQL API using Next.js API routes + MongoDB, hosted on Vercel. Public read access, no auth for initial phase. Mobile apps use SQLite as a loose replica for offline support.

## Architecture

```
Website (Next.js) ──── GraphQL ────┐
                                    ├──▶ Next.js API Route ──▶ MongoDB Atlas
Mobile (iOS/Android) ── GraphQL ───┘         (Vercel)
         │
         ▼
    SQLite (offline replica)
```

**Phase 1 (this plan):** MongoDB + GraphQL API + data import + web client integration + mobile SQLite offline + asset bundling
**Phase 2 (later):** S3 audio, Search Service, Trending Songs (Redis/LRU), user auth

---

## 1. MongoDB Schema

### Collections (MongoDB)

**songs**
```json
{
  "_id": ObjectId,
  "uid": "N3",
  "title": "Sri Guru Vandana",
  "author": "Narottama Dasa Thakura",
  "audio": true,
  "tags": ["prayer", "guru"],
  "topics": ["topic_uid_1", "topic_uid_2"],
  "tracks": ["track_uid_1", "track_uid_2"],
  "verses": [
    {
      "index": 1,
      "language": "bn",
      "original": ["শ্রী-গুরু-চরণ-পদ্ম,", "বন্দো মুঞি সাবধান মতে"],
      "transliterations": [
        { "language": "en", "text": ["śrī-guru-caraṇa-padma,", "bando muñi sābadhāna mate"] }
      ],
      "wordToWords": [
        { "language": "en", "words": [["śrī-guru", "spiritual master"], ["caraṇa", "lotus feet"]] }
      ],
      "translations": [
        { "language": "en", "text": "The lotus feet of the spiritual master..." }
      ]
    }
  ]
}
```

**authors**
```json
{
  "_id": ObjectId,
  "uid": "narottama-dasa",
  "name": "Narottama Dasa Thakura",
  "slug": "narottama-dasa-thakura",
  "image": "https://...",
  "songs": ["N3", "L5"],
  "books": ["kalyana-kalpataru"]
}
```

**books**
```json
{
  "_id": ObjectId,
  "uid": "kalyana-kalpataru",
  "title": "Kalyana Kalpataru",
  "author": "Bhaktivinoda Thakura",
  "slug": "kalyana-kalpataru",
  "image": "https://...",
  "songs": {
    "type": "section",
    "children": [
      {
        "label": "Sanskrit Stotras",
        "type": "section",
        "children": [
          { "type": "song", "uid": "N3" },
          { "type": "song", "uid": "S1" }
        ]
      },
      {
        "label": "Bengali",
        "type": "section",
        "children": [
          {
            "label": "Succession of Gurus",
            "type": "section",
            "children": [
              { "type": "song", "uid": "E4" }
            ]
          }
        ]
      }
    ]
  }
}
```

The `songs` field is a recursive tree structure (max depth 5). Each node is either `{ type: "section", label: string, children: [] }` or `{ type: "song", uid: string }`.

**topics**
```json
{
  "_id": ObjectId,
  "uid": "sri-guru",
  "topic": "Sri Guru",
  "slug": "sri-guru",
  "songs": ["N3", "S1"]
}
```

**singers**
```json
{
  "_id": ObjectId,
  "uid": "tamal-krishna",
  "name": "Tamal Krishna Maharaj",
  "slug": "tamal-krishna-maharaj",
  "image": "https://...",
  "songs": ["N3", "E4"]
}
```

**tracks**
```json
{
  "_id": ObjectId,
  "uid": "track-001",
  "singer_uid": "tamal-krishna",
  "song_uid": "N3",
  "audio": "s3://gaudiyakirtan/tracks/track-001.mp3"
}
```

---

## 2. GraphQL Schema

File: `web/src/pages/api/graphql.ts`

```graphql
type Query {
  songs(limit: Int, offset: Int): [Song!]!
  song(uid: String!): Song
  authors: [Author!]!
  author(uid: String!): Author
  books: [Book!]!
  book(uid: String!): Book
  topics: [Topic!]!
  topic(uid: String!): Topic
  singers: [Singer!]!
  singer(uid: String!): Singer
}

type Song {
  uid: String!
  title: String!
  author: String
  audio: Boolean
  tags: [String!]!
  topics: [Topic!]!
  verses: [Verse!]!
  tracks: [Track!]!
}

type Verse {
  index: Int!
  language: String
  original: [String!]!
  transliterations: [Transliteration!]!
  wordToWords: [WordToWord!]!
  translations: [Translation!]!
}

type Transliteration { language: String!, text: [String!]! }
type WordToWord { language: String!, words: [[String!]!]! }
type Translation { language: String!, text: String! }

type Author {
  uid: String!
  name: String!
  slug: String!
  image: String
  songs: [Song!]!
  books: [Book!]!
}

type Book {
  uid: String!
  title: String!
  author: String
  slug: String!
  image: String
  songs: SongTreeNode!
}

union SongTreeNode = SongSection | SongLeaf
type SongSection { label: String!, children: [SongTreeNode!]! }
type SongLeaf { uid: String!, song: Song }

type Topic {
  uid: String!
  topic: String!
  slug: String!
  songs: [Song!]!
}

type Singer {
  uid: String!
  name: String!
  slug: String!
  image: String
  songs: [Song!]!
}

type Track {
  uid: String!
  singer: Singer!
  song_uid: String!
  audio: String!
}
```

---

## 3. Implementation Plan

### Step 1: Set up MongoDB Atlas
- Create free-tier MongoDB Atlas cluster
- Add connection string to `.env.local` as `MONGODB_URI`
- Add `mongodb` package to web dependencies

### Step 2: Create database utility
- `web/src/lib/mongodb.ts` — connection singleton with caching for serverless

### Step 3: Create GraphQL API route
- `web/src/pages/api/graphql.ts` — Apollo Server micro setup
- Dependencies: `@apollo/server`, `graphql`, `@as-integrations/next`
- Define type definitions and resolvers
- Each resolver queries MongoDB collections

### Step 4: Create data import script
- `web/scripts/import-data.ts` — reads JSON files, validates, inserts into MongoDB
- Can also seed from current `sampleData.ts` as a starting point

### Step 5: Create GraphQL client utility
- `web/src/lib/graphql-client.ts` — for web SSR/SSG data fetching
- Used in `getStaticProps` to replace direct `sampleData` imports

### Step 6: Update web pages to use API
- Replace `sampleData` imports with GraphQL queries in:
  - `pages/index.tsx` (home)
  - `pages/songs/[id].tsx` (song detail)
  - `pages/authors/index.tsx`
  - `pages/books/index.tsx`
  - `pages/topics/index.tsx`

### Step 7: Mobile offline database (iOS — Core Data / SQLite)

The app ships with all song data pre-bundled so it works fully offline (except audio streaming). Data syncs when online.

**iOS approach:**
- Use SwiftData with a pre-populated SQLite store (requires iOS 17+ — bump deployment target from 16.0 to 17.0)
- Bundle a `gk-data.sqlite` file in the app at build time
- On first launch, copy bundled DB to app documents directory
- Background sync: periodically fetch GraphQL for updates, merge into local DB
- Models: Song, Verse, Author, Book, Topic, Singer mapped to SwiftData entities
- Images: bundle author/book images as app assets, or cache from URLs using `AsyncImage` with disk caching

**Data flow:**
```
App Launch → Load from local SQLite (instant, offline)
             ↓
        Background sync → GraphQL API → Update SQLite
```

**Files to create:**
- `ios/gk-ios/Data/DataStore.swift` — SwiftData container + sync logic
- `ios/gk-ios/Data/Entities/` — SwiftData entity definitions (Song, Verse, etc.)
- `ios/gk-ios/Data/GraphQLClient.swift` — Apollo iOS client for sync
- `ios/gk-ios/Data/SyncManager.swift` — background sync coordinator
- Bundle: `ios/gk-ios/Resources/gk-data.sqlite` — pre-populated database

**Dependencies:**
- Apollo iOS (Swift Package Manager)
- SwiftData (built into iOS 17+) — bump deployment target from 16.0 to 17.0

### Step 8: Mobile offline database (Android — Room)

Same offline-first approach as iOS.

**Android approach:**
- Use Room database with a pre-populated `.db` file
- Bundle `gk-data.db` in `assets/` folder, Room copies on first launch via `.createFromAsset()`
- Background sync: WorkManager periodically fetches GraphQL, updates Room DB
- Models: Song, Verse, Author, Book, Topic, Singer as Room @Entity classes
- Images: bundle in `res/drawable` or cache with Coil's disk cache

**Data flow:**
```
App Launch → Load from Room DB (instant, offline)
             ↓
        WorkManager → GraphQL API → Update Room DB
```

**Files to create:**
- `andorid/app/src/main/java/com/gaudiyakirtan/data/AppDatabase.kt` — Room database definition
- `andorid/app/src/main/java/com/gaudiyakirtan/data/dao/` — DAOs for each entity
- `andorid/app/src/main/java/com/gaudiyakirtan/data/entities/` — Room entities
- `andorid/app/src/main/java/com/gaudiyakirtan/data/sync/GraphQLClient.kt` — Apollo Kotlin client
- `andorid/app/src/main/java/com/gaudiyakirtan/data/sync/SyncWorker.kt` — WorkManager sync
- Bundle: `andorid/app/src/main/assets/gk-data.db` — pre-populated database

**Dependencies to add (in `libs.versions.toml`):**
- Apollo Kotlin (`com.apollographql.apollo3`)
- Room is already available via AndroidX

### Step 9: Asset bundling strategy

All non-audio assets ship with the app for full offline support:

| Asset Type | iOS | Android | Web |
|------------|-----|---------|-----|
| Author images | `Assets.xcassets` or bundled in app | `res/drawable` or `assets/` | Served from CDN/S3 |
| Book cover images | Same | Same | Same |
| Singer images | Same | Same | Same |
| App icons/logos | `Assets.xcassets` | `res/mipmap` | `public/` |
| Song data | Pre-populated SQLite | Pre-populated Room DB | GraphQL at build time (SSG) |
| Audio tracks | Streamed from S3 (Phase 2) | Streamed from S3 (Phase 2) | Streamed from S3 (Phase 2) |

### Step 10: Build-time data generation

Create a script that:
1. Exports MongoDB data to JSON
2. Generates pre-populated SQLite DB for iOS
3. Generates pre-populated Room DB for Android
4. Copies images into platform asset directories

This runs as part of the release/CI pipeline so bundled data stays fresh.

**Script:** `scripts/generate-mobile-data.ts`

---

## 4. File Structure

```
web/
├── src/
│   ├── lib/
│   │   ├── mongodb.ts              # MongoDB connection singleton
│   │   └── graphql-client.ts       # GraphQL client for SSR
│   ├── pages/
│   │   └── api/
│   │       └── graphql.ts          # GraphQL API route
│   ├── graphql/
│   │   ├── schema.ts               # Type definitions
│   │   ├── resolvers/
│   │   │   ├── song.ts
│   │   │   ├── author.ts
│   │   │   ├── book.ts
│   │   │   ├── topic.ts
│   │   │   ├── singer.ts
│   │   │   └── track.ts
│   │   └── queries.ts              # Client-side query strings
│   └── models/                     # Existing TypeScript interfaces (keep)
├── scripts/
│   └── import-data.ts              # Data import script
├── data/
│   └── songs.json                  # Source JSON data for import
└── .env.local                      # MONGODB_URI
```

---

## 5. Dependencies to Add

```json
{
  "@apollo/server": "^4",
  "@as-integrations/next": "^3",
  "graphql": "^16",
  "graphql-tag": "^2",
  "mongodb": "^6"
}
```

---

## 6. Environment Variables

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gaudiyakirtan
```

---

## 7. Migration Path

Current → Backend transition:

| Current | After |
|---------|-------|
| `sampleData.ts` imports in pages | GraphQL queries in `getStaticProps` |
| In-memory data on all platforms | MongoDB (source of truth) + local DB (offline) |
| No API | `/api/graphql` endpoint |
| iOS `SampleData.swift` | Pre-populated SwiftData/SQLite + background sync |
| Android `SampleData.kt` | Pre-populated Room DB + WorkManager sync |
| Hardcoded bookmarks | (Phase 2: user collections API) |
| No audio files | (Phase 2: S3 + Track streaming) |
| No search | (Phase 2: MongoDB text search or Algolia) |
| No trending | (Phase 2: Redis/LRU cache) |
| Images from URLs | Bundled in app + cached from CDN |

---

## 8. Verification

1. Set up MongoDB Atlas cluster, get connection string
2. Run import script to seed data from JSON
3. Start dev server: `bun run dev`
4. Open GraphQL playground at `http://localhost:3000/api/graphql`
5. Query `{ songs { uid title author verses { index } } }` — verify data returns
6. Open song page — verify it loads from API instead of sample data
7. Build: `bun run build` — verify SSG works with API data
8. iOS: verify app launches with pre-populated SQLite, loads songs offline
9. Android: verify app launches with pre-populated Room DB, loads songs offline
10. Toggle airplane mode on mobile — verify all data (except audio) still works
