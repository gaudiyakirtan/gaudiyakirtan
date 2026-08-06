# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Gaudiya Kirtan — Cross-Platform Development

Gaudiya Kirtan is a **native, offline-first** repository of Gauḍīya Vaiṣṇava songs with independent
implementations for **iOS (Swift/SwiftUI)**, **Android (Kotlin/Jetpack Compose)**, and
**Web (Next.js + TypeScript)**. There is **no backend**: each app ships the full corpus as bundled
static data and reads it through a repository over the Manifest. The only network dependency is
audio + images, streamed from the public S3 bucket; everything else works fully offline. Accounts,
auth, and sync are **not** part of the app — a few features (e.g. Collections) are deliberately
deferred until accounts exist.

## Doc-driven workflow

This repo is **documentation-driven**: the specs in `docs/` are the source of truth, and code is
verified against them. Follow **[`docs/WORKFLOW.md`](docs/WORKFLOW.md)** — the SPEC → IMPLEMENT →
VERIFY loop:

1. **SPEC** — update the relevant spec *first*. Data shape lives in [`docs/data/`](docs/data/)
   (platform-agnostic, versioned); screen behavior in [`docs/screens/`](docs/screens/) (Figma owns
   the pixels). Bump the spec version and its change log.
2. **IMPLEMENT** — build to the spec on each platform. Platforms are independent (own build, own
   idioms); keep data models, naming, and structure parallel across them so the same concept reads
   the same way everywhere.
3. **VERIFY** — check conformance (does the code match the spec?) and behavior, and record it in the
   conformance matrix, [`docs/implementation-mapping.md`](docs/implementation-mapping.md) — the
   single status board of spec × platform.

Do **not** hand-write corpus counts (song / author / book totals) into docs — they go stale; the
live numbers come from the data itself.

## Committing

**[`docs/WORKFLOW.md` §5](docs/WORKFLOW.md)** is the authoritative commit protocol; in short:

- **Two commit types.** A **spec** commit touches `docs/` only and bumps the entity's spec version —
  land it once the doc is internally consistent. An **implementation** commit is one platform's code
  for one slice, and lands **only when the verifier is green** (conformance + build/run).
- **Unit of change:** one spec-conformant slice (one entity / screen / data-flow) at one spec
  version, per platform — not per-field, not a whole track at once.
- **Invariants:** every commit leaves the repo buildable; spec may lead code, but the gap is recorded
  in the conformance matrix ([`docs/implementation-mapping.md`](docs/implementation-mapping.md)),
  never left implicit.
- **Message convention:** `docs(<entity>): v<N> <change>` · `feat(<platform>/<slice>): conform v<N>`
  · `feat(<platform>/<screen>): <screen>` · `fix(<platform>/<slice>): <fix> per v<N>`.

## Cross-platform consistency

- **Common data model.** All three apps consume the *same* canonical JSON the pipeline emits
  (identical snake_case field names; see [`docs/data/`](docs/data/)). Serialize/deserialize the same
  shape everywhere.
- **Parallel structure & naming.** Mirror directory organization and use matching names for
  equivalent types/components (`Song` / `ISong`, `Verse`, the repositories), adapting only to
  platform idioms. Web prefixes interfaces with `I`.
- **Offline store.** The corpus is bundled, not fetched: static JSON on web, bundled resources on
  iOS/Android, read through a Repository over the Manifest (lists never load full songs).
- **UI.** Native per platform — SwiftUI / Jetpack Compose / React — over a shared visual language
  (the Gaura/Shyam themes, [`docs/screens/theme.md`](docs/screens/theme.md); shared components in
  [`docs/screens/components.md`](docs/screens/components.md)) and the Material 3 Expressive design
  contract below.

## Design language — Material 3 Expressive

The app follows **Material Design 3 Expressive** — an evolution of M3, not a separate system. It
keeps M3's semantic color roles, type system, accessibility rules, and adaptive layouts, and adds
controlled variation: shape contrast, physics-based motion, stronger type/color hierarchy, and
expressive components (button groups, split buttons, floating toolbars, wavy indicators, morphing
controls).

**M3 defines consistency; Expressive adds controlled variation and emphasis.** "Expressive" is not
permission to invent styling — it is a budget for a small number of deliberate hierarchy decisions.

### Platform reality (state the platform before designing)

| Platform | Official Expressive implementation | Here |
|---|---|---|
| **Android** (Compose) | Yes — `androidx.compose.material3` | **Not yet reachable.** `andorid/` resolves material3 via Compose BOM `2024.04.01` → **1.2.1**; expressive APIs (`MaterialExpressiveTheme`, `MotionScheme`, wavy indicators) need a 1.4+/1.5-alpha bump first. Treat any expressive component as gated on that bump. |
| **iOS** (SwiftUI) | No | Reproduce expressive hierarchy with SwiftUI-native shape/motion over the Gaura/Shyam tokens. Never import a Material look-alike. |
| **Web** (React) | No complete official implementation | Reproduce with project tokens + CSS/SVG/Canvas. "Use M3 Expressive" is not an instruction a web slice can execute literally. |

Because two of three platforms have no official implementation, **the spec — not a library — is the
cross-platform contract.** An expressive decision lands in [`docs/screens/`](docs/screens/) first,
then each platform implements it in its own idiom.

### Screen design process

Before implementing a screen, state: (1) the primary user goal; (2) the primary action; (3) the
canonical Material layout used (feed / list-detail / supporting pane); (4) the navigation component;
(5) the primary/secondary/tertiary content hierarchy; (6) compact / medium / expanded behavior;
(7) the one expressive focal element; (8) why *that* element earns the emphasis.

### Rules

- **One principal expressive focal area per screen.** Expressiveness works by contrast — if
  everything is expressive, nothing is emphasized. Secondary and repeated controls stay quiet.
- **Expressive motion** for hero transitions, selection changes, playback/activity, and important
  state changes. **Standard motion** for repeated utility interactions.
- **Motion must communicate** hierarchy, continuity, or state — where content came from, what
  changed, what is active. The wavy playback indicator is the canonical example: wavy = playing,
  flat = paused. Motion is never decoration.
- **Shape carries hierarchy, not novelty.** Ordinary containers get standard rounded shapes;
  selected items a stronger shape; the primary action a distinctive one; state transitions an
  intentional morph. Use defined shape tokens — no arbitrary corner radii, no decorative blobs.
- **Color and type go through this repo's semantic tokens**, not raw values and not stock Material
  palettes. [`docs/screens/theme.md`](docs/screens/theme.md) is authoritative: `primary`,
  `secondary`, `tertiary`, `accent`, `highlight`, `onHighlight`, `background`, `backgroundOffset`,
  `border`, `neutral`, resolved per palette in [`docs/theme/colors.md`](docs/theme/colors.md). On
  Android these tokens *are* the M3 color scheme (Gaura = `lightColorScheme`, Shyam =
  `darkColorScheme`). No hex in feature code; no one-off font sizes.
- **Official components before custom ones** — on Android, where they exist at the pinned version.
- **Accessibility is not traded for expression:** reduced-motion behavior, contrast, touch targets,
  focus states, and scalable text survive every expressive decision.

### Required component states

Implement each that applies: default, pressed, focused, hovered, selected, loading, empty, error,
disabled.

### Before adding a custom component

Explain: (1) why no Material component suffices; (2) which tokens it uses; (3) its accessibility
behavior; (4) its responsive behavior; (5) its motion behavior. Then spec it in
[`docs/screens/components.md`](docs/screens/components.md) — a component reused across screens is a
shared contract, not a screen's private markup.

## Code quality

- Clean, maintainable code with real error handling; optional chaining + fallbacks for missing data.
- Unit tests for the load-bearing logic (decode, pickers, resolvers).
- Document public interfaces and non-obvious decisions inline; keep the **specs** — not code
  comments or a cross-reference table — as the cross-platform source of truth.

## Build Commands
This is a **native multi-platform monorepo** (not the old Solito/bun setup). Each platform is standalone:
- **Web** (`web/`, Next.js + pnpm): `pnpm install`, `pnpm build`, `pnpm dev`, `pnpm test`
- **Android** (`andorid/`, Gradle): `./gradlew :app:assembleDebug`, `./gradlew :app:testDebugUnitTest`
  (use Android Studio's bundled JBR 21 if the system JDK is too new)
- **iOS** (`ios/`, Xcode): `xcodebuild -project gk-ios.xcodeproj -scheme gk-ios build`; typecheck via
  `swiftc -typecheck` against the iphonesimulator SDK

## Data pipeline (`pipeline/`, Python)
Canonical song data is generated by the pipeline (now vendored in-repo at `pipeline/`; run scripts
from that directory — they read/write `../web`, `../ios`, `../andorid` relative to it). Upstream raw
inputs and media provenance are documented in `pipeline/SOURCES.md`. Data-fix scripts:
`pipeline.py` (convert), `make_manifest.py`, `fix_*` (flag/title/audio corrections;
`fix_author_display.py` adds a `Latn` IAST author name to every song so authors honor the script
toggle), `build_song_groups.py` (books/topics from the Giti-guccha PDF),
`build_calendar.py` + `gaudiya_calendar.py` (lunar-month → song overlay; `--check` validates
without writing — see `docs/data/calendar.md`). Audio + images live on the public
S3 bucket `s3://gaudiyakirtan/` (`https://gaudiyakirtan.s3.amazonaws.com/audio|artists|collections/`).

## Code Style Guidelines
- **Package Manager**: Web uses **pnpm** (not bun); Android uses Gradle; iOS uses SwiftPM/Xcode.
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
