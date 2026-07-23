# Gaudiya Kirtan App

A native, **offline-first** repository of Gauḍīya Vaiṣṇava songs — lyrics with transliterations,
word-by-word glosses and full translations, plus recordings — with independent implementations for
iOS, Android, and Web.

There is **no backend.** Each app ships the corpus as bundled static data; the only network
dependency is audio and images streamed from a public S3 bucket. Everything else works offline.

## How this repo works

This project is **documentation-driven**: the specs in [`docs/`](docs/) are the source of truth, and
code is verified against them. Before changing behavior, read
**[`docs/WORKFLOW.md`](docs/WORKFLOW.md)** — the SPEC → IMPLEMENT → VERIFY loop and the commit
protocol.

## Project Structure

```
/
├── ios/        # iOS implementation (Swift/SwiftUI)
├── andorid/    # Android implementation (Kotlin/Jetpack Compose) — yes, the dir name is misspelled
├── web/        # Web implementation (TypeScript/Next.js, Pages Router)
├── pipeline/   # Python pipeline that builds the canonical corpus JSON
├── assets/     # Brand assets, icons, artwork
└── docs/       # Specs — the source of truth
```

## Key Features

- Browse songs by author, topic, and book
- Full song text: original script, IAST transliteration, word-by-word glosses, full translation
- Script toggle — titles and text render in the reader's selected script
- Audio playback with multiple recordings (takes) and reciters per song
- A lunar-calendar overlay surfacing what is sung in the current Gauḍīya month
- Works fully offline; the corpus is bundled, not fetched

Feature coverage differs per platform. The
[conformance matrix](docs/implementation-mapping.md) is the single status board of spec × platform —
consult it rather than inferring status from this list.

## Platform Implementations

| Platform | Stack |
|----------|-------|
| **iOS** | Swift / SwiftUI, MVVM |
| **Android** | Kotlin / Jetpack Compose, Material |
| **Web** | TypeScript / Next.js (Pages Router), TailwindCSS, statically generated |

All three consume the *same* canonical JSON emitted by `pipeline/`, read through a repository over
the Manifest. Shared visual language (Gaura / Shyam themes) is specified in
[`docs/screens/theme.md`](docs/screens/theme.md).

## Getting Started

### iOS
```bash
cd ios
xed ./gk-ios.xcodeproj
```

### Android
```bash
cd andorid
./gradlew :app:assembleDebug
```

### Web
```bash
cd web
pnpm install
pnpm dev
```

## Documentation

Everything lives under [`docs/`](docs/) — start at [`docs/README.md`](docs/README.md), which routes
to the rest.

- **[`docs/WORKFLOW.md`](docs/WORKFLOW.md)** — the doc-driven loop, agent roles, commit protocol
- **[`docs/data/`](docs/data/)** — platform-agnostic, versioned data specs (song, verse, author,
  manifest, collections, calendar, pipeline)
- **[`docs/screens/`](docs/screens/)** — screen behavior specs (Figma owns the pixels)
- **[`docs/implementation-mapping.md`](docs/implementation-mapping.md)** — the conformance matrix
- **[`docs/theme/`](docs/theme/)** — colors, typography, icons
- **[`docs/store-readiness.md`](docs/store-readiness.md)** — what remains before shipping to stores

## Contributing

Follow [`docs/WORKFLOW.md`](docs/WORKFLOW.md): update the relevant spec *first*, bump its version and
change log, then implement to the spec on each platform and record conformance in the matrix. Keep
data models and naming parallel across platforms so the same concept reads the same way everywhere.

Corpus totals (song / author / book counts) are deliberately **not** written into prose anywhere in
this repo — they go stale the moment the corpus changes. The live numbers come from the data.

## License

- **Songbook content** — CC-BY-ND 4.0, © Gaudiya Vedanta Publications. Attribution must be kept; see
  [`docs/store-readiness.md`](docs/store-readiness.md) for redistribution notes.
- **Code** — TBD.
