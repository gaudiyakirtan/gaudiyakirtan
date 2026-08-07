# Implementation Mapping

The **conformance matrix** — the single status board for the doc-driven build (see
[`WORKFLOW.md`](WORKFLOW.md)): for each spec × platform, the spec version implemented and the
verifier status. **The verifier updates this; the orchestrator reviews it.**

Legend: `—` not started · `⏳ stale` (spec ahead of code) · `🔨 in progress` · `❌ failing` ·
`✅ vN green` (verifier-passed at spec version N).

### Data specs (`docs/data/`)

| Spec | Ver | Web | iOS | Android |
|------|-----|-----|-----|---------|
| [song](data/song.md) | v2 | ✅ | ✅* | ✅ |
| [verse](data/verse.md) | v2 | ✅ | ✅* | ✅ |
| [translation](data/translation.md) | v1 | ✅ | ✅* | ✅ |
| [author](data/author.md) | v1 | ✅ | ✅* | ✅ |
| [collections](data/collections.md) | v1 | ✅ | ✅* | ✅ |
| [manifest](data/manifest.md) | v1 | ✅ | ✅* | ✅ |
| [calendar](data/calendar.md) | v2 | ✅ | — | — |
| [pipeline](data/pipeline.md) | v1 | n/a | n/a | n/a |

> **✅\* iOS**: data layer typechecks clean (`swiftc -typecheck`, 0 errors, verified independently)
> + the decode harness passes over the full corpus. Full `xcodebuild` app build is **blocked in this
> sandbox only** (`actool` asset-catalog codegen can't spawn — fails identically on baseline); the
> simulator build+run must be confirmed on a normal macOS/Xcode machine.

Pipeline is platform-agnostic data prep; its status is tracked in `ROADMAP.md` Track A1.

### Data layer & features

| Capability | Web | iOS | Android |
|------------|-----|-----|---------|
| Real corpus loaded (no sampleData) | ✅ | ✅* | ✅ |
| Offline store (static bundle / Core Data / Room) | ✅ static | ✅ bundle | ✅ assets |
| Repository over Manifest | ✅ | ✅* | ✅ |
| Calendar overlay (lunar month → songs) | ✅ | — | — |
| Home renders the calendar (month + songs) | ✅ | — | — |
| Recently played (device-local history) | ✅ | — | — |
| Search (fuzzy) | ✅ | ✅ | ✅ |

> **Data layer: all 3 platforms done.** Web ✅ `pnpm build` (full static export). Android ✅
> `assembleDebug` + tests, APK packs the full corpus. iOS ✅* typecheck clean + decode harness (full
> build sandbox-blocked; confirm on a real Xcode machine).

### Screen specs (`docs/screens/`)

| Screen | Web | iOS | Android |
|--------|-----|-----|---------|
| song-detail (v3) | ✅ | ✅* | ✅ |
| songs-list / library | ✅ | ✅* | ✅ |
| tracks (v1) | ✅ | — | — |
| authors | ✅ | ✅* | ✅ |
| search | ✅ v10 | ✅ | ✅ |
| url-resolution (v1) / 404 | ✅ | n/a | n/a |
| pwa (v1) — offline/install | ✅ | n/a | n/a |
| seo (v1) — metadata/sitemap | ✅ | n/a | n/a |
| observability (v1) — analytics/Sentry | ✅ | n/a | n/a |
| settings | ✅ | ✅* | ✅ |
| theme (v3 — Gaura/Shyam + expressive + spacing) | ⏳ v1 | ⏳ v1* | 🔨 v3 partial |
| home (v3 — re-purposed) | ✅ | — | — |
| today (v1) — embedded as home §1 | ✅ | — | — |
| navigation (v5) | ✅ v5 green | ✅*ᶠ ʷ | ✅ᶠ ʷ |
| about / contact (v1) | ✅ | — | — |
| components (v4) | ✅ v4 green | — | — |
| collections / books / topics | ✅ | ✅* | ✅ |
| artist/book images | ✅ | ✅* | ✅ |
| unit tests | ✅ | ✅* | ✅ |
| resources | 🔨 | — | — |
| player / now-playing | ✅ v13 green | ✅* ʷ | ✅ ʷ |

Legend: `✅` verified · `✅*` iOS typecheck+harness (full `xcodebuild` sandbox-blocked; confirm on a real
Xcode machine) · `ᶠ` footer/nav polish · `ʷ` the newest spec version is **web-only** — it describes a
web surface (navigation v5 / player v13: the web z-index scale and the drawer-over-mini-player
model), so iOS/Android are not stale against it; they stay conformant at the version before it ·
`🔨` in progress · `—` not applicable / not on that platform.

**theme v3 (Material 3 Expressive) — Android is `🔨 partial`.** Landed: `MaterialExpressiveTheme` +
`MotionScheme.expressive()`, the shape scale, the type scale, the remapped Material color slots with
the container ramp filled, the 4dp spacing scale applied across every screen (155 values tokenized),
`GaudiyaTopAppBar` replacing four hand-rolled headers, and the wavy playback indicator.

**Both Android test tasks are now green**: `:app:assembleDebug` builds, and `:app:testDebugUnitTest`
is **26/26** — up from 11/14. The 3 long-standing failures were stale hardcoded corpus totals (703
manifest rows, 93 song groups, a `book-sri-guru` uid the corpus never shipped) asserted against a
corpus of 702/21; per CLAUDE.md those counts must not be hand-written, so the assertions are now
structural. The remaining 12 are new JVM Compose tests under Robolectric — no emulator is available
here or in CI — covering the container ramp (a regression test for the baseline-lilac Switch bug),
the palette-to-slot mapping in both themes, the shape ladder's monotonicity, and the player's
accessibility contract (exactly one seekable control, exactly one announced progress range, the
mini bar silent to assistive tech).

Still **not** done, and why the row is not green: the UI is still predominantly hand-rolled layout
primitives; `SearchBar`/`ExpandedFullScreenSearchBar`, `ButtonGroup`, `LoadingIndicator` and
`Card`/`ListItem` remain unadopted; the `largeIncreased`/`extraLargeIncreased` shape steps are
declared but unused; there is no adaptive behavior at all (no `material3.adaptive`, no
`WindowSizeClass`, no compact/medium/expanded branch); only the player has an expressive focal
element; and no screen spec besides this one has had the CLAUDE.md 7-point treatment. Reaching
the wavy indicator required
`androidx.compose.material3:material3:1.5.0-alpha25`, which in turn forced **compileSdk 37, AGP
9.4.0-alpha08, Gradle 9.7.0 and Kotlin 2.4.10** — the app now sits on an alpha Android toolchain,
which is the standing cost of that one component. material3 **1.4.0 stable** carries
`MaterialExpressiveTheme`, `MotionScheme` and `Shapes` but **not** the wavy indicators.

**Web and iOS are `⏳ v1`, not behind schedule.** v2's slot remap is an Android *mechanism* and does
not apply to them. What does apply is the new **Shape** scale and **Motion** contract — neither
platform has an official Expressive implementation, so both must reproduce that behavior in their own
idiom (SwiftUI shape/animation; CSS/SVG/Canvas) before they can be marked v2. Until they are, the
three platforms differ in shape rhythm and in the player's progress affordance.

**Web overhaul (build + screenshot/CDP verified):** top bar removed; search is a **centered
command-palette modal** on desktop and a **full-screen search page** on mobile — one component,
one media query ([search.md](screens/search.md) v10 — the mobile surface layers an opaque
underlay behind a visual-viewport-sized panel, so the iOS keyboard accessory strip can never show
the page; `SearchModal.tsx`, ⌘K / sidebar / mobile header,
client index `/search-index.json`); a **collapsible** sidebar (`Sidebar.tsx` — icon-rail toggle,
persisted; theme
toggle labelled **Gaura/Shyam**, previewing the other theme's colour on hover); a **Tracks** library
tab ([tracks.md](screens/tracks.md)); a scope-aware **URL resolver + branded 404**
([url-resolution.md](screens/url-resolution.md)). The three player surfaces unified into one
bottom-right **mini-player** (`PlayerWidget.tsx`, see [player.md](screens/player.md)) — a morphing
FAB↔card with a **2-line/marquee title**, a **scrubber**, and a **loop / continue-playing /
sleep-timer / download / share** row plus a stacked-avatar recordings picker and a book/topic
**queue** with prev/next; **share** copies a `?play=<track>` deep link that cues+plays on arrival.
Icons standardized on **Lucide** (`icons/SidebarIcons.tsx`). **Book/topic detail routes**
(`books/[id]`, `topics/[id]`); desktop **Settings** with a live annotated sample verse
([settings.md](screens/settings.md) v2); the brand set as live text
([`BrandWordmark`](screens/components.md)); a build-time **`.md` export**
([markdown-export.md](screens/markdown-export.md)). iOS/Android keep the v1 layouts.
