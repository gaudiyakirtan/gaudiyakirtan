# Web Implementation

This document details the Web implementation of the Gaudiya Kirtan application using Next.js and TypeScript.

## Project Structure

The web app follows the Next.js application structure:

```
web/src/
├── components/     # Reusable UI components
├── pages/          # Next.js pages and routes
│   ├── _app.tsx    # Application wrapper
│   ├── index.tsx   # Home page
│   └── songs/      # Song-related pages
│       └── [id].tsx # Dynamic song detail page
├── hooks/          # Custom React hooks
├── services/       # API services
├── models/         # TypeScript interfaces
├── utils/          # Helper utilities
└── styles/         # CSS and TailwindCSS styles
    ├── globals.css # Global styles
    └── colors.css  # Color variables
```

## Key Components

### Entry Point

- [_app.tsx](/web/src/pages/_app.tsx) - Main application wrapper with Layout
- [index.tsx](/web/src/pages/index.tsx) - Home page displaying song list

### Components

- [SongListItem.tsx](/web/src/components/SongListItem.tsx) - Component for song items in list
- [VerseListItem.tsx](/web/src/components/VerseListItem.tsx) - Component for verse display
- [Layout.tsx](/web/src/components/Layout.tsx) - Shared layout component with navigation

### Data Models

- [Song.ts](/web/src/models/Song.ts) - Contains TypeScript interfaces for Song, ExtendedSong, and related types

## Theme

The web app uses the Gaudiya Kirtan color scheme based on the iOS design, implemented through:

1. **TailwindCSS Configuration**:
   - Defined in [tailwind.config.js](/web/tailwind.config.js)
   - Provides two color palettes:
     - `gaur`: Light mode colors
     - `shyam`: Dark mode colors

2. **CSS Variables**:
   - Defined in [colors.css](/web/src/styles/colors.css)
   - Accessible via var() syntax:
     ```css
     color: var(--primary);
     background-color: var(--background);
     ```

The colors match the iOS and Android implementations:

- **Primary**: Text color (#1A1A1A in light mode, #E0E0E0 in dark mode)
- **Background**: Main background color (#FFF4E8 in light mode, #191919 in dark mode)
- **BackgroundOffset**: Secondary background color (#F6EDDF in light mode, #252525 in dark mode)
- **Highlight**: Accent color (#B36B00 in light mode, #8CB4FF in dark mode)
- **Neutral**: Secondary text color (#6E6E6E in light mode, #9B9B9B in dark mode)

## Routing and Navigation

The web app uses Next.js routing:

- Static route: `/` (Home page)
- Dynamic route: `/songs/[id]` (Song detail page)

```jsx
// Navigation to song detail page
const handleSongClick = (id: string) => {
  router.push(`/songs/${id}`)
}
```

## Data Fetching

Currently uses static data with `getStaticProps` and `getServerSideProps`. In the future, this will be updated to use a common API service.

## Offline Support

The web app will use IndexedDB with service workers for offline functionality:

```typescript
// TODO: Implement IndexedDB with Dexie.js for offline storage
```

## Code Pointers

### Song Model Interface

```typescript
// See: /web/src/models/Song.ts
export interface ISong {
  id: string
  title: string
  author: string
  lyrics: string
  tags: string[]
  dateAdded: Date
  audio?: boolean
}

export interface IExtendedSong {
  id: string
  title: ITitle[]
  author?: IAuthor[]
  uid: string
  tags: string[]
  topics?: ITopic[]
  audio?: boolean
  verses?: IVerse[]
  tracks?: string[]
}
```

### Song List Item Component

```tsx
// See: /web/src/components/SongListItem.tsx
export const SongListItem: React.FC<ISongListItemProps> = ({ song, onClick }) => {
  const { title, author, id, audio, tags } = song

  return (
    <div 
      className="bg-gaur-background-offset dark:bg-shyam-background-offset flex h-14 w-full flex-row items-center rounded-xl px-2.5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-row items-center w-full">
          <span className="mr-1.5 text-sm flex-initial text-gaur-primary dark:text-shyam-primary truncate">
            {title}
          </span>
          <div className="bg-gaur-neutral/25 dark:bg-shyam-neutral/25 flex-shrink-0 rounded-xl px-2.5 py-0.5">
            <span className="text-gaur-neutral dark:text-shyam-neutral text-[10px] font-medium uppercase">
              {id}
            </span>
          </div>
        </div>
        {/* Author and tags */}
      </div>
    </div>
  )
}
```

### Home Page

```tsx
// See: /web/src/pages/index.tsx
const Home: React.FC<HomeProps> = ({ songs }) => {
  const router = useRouter()

  const handleSongClick = (id: string) => {
    router.push(`/songs/${id}`)
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2">
      <main className="flex flex-col items-center w-full flex-1 px-4 md:px-20 mt-8">
        <h1 className="text-6xl font-bold mb-8">
          Welcome to{' '}
          <span className="text-gaur-highlight dark:text-shyam-highlight">
            Gaudiya Kirtan
          </span>
        </h1>

        {/* Song list */}
        <div className="w-full max-w-4xl space-y-4">
          {songs.map((song) => (
            <SongListItem 
              key={song.id} 
              song={song} 
              onClick={() => handleSongClick(song.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
```