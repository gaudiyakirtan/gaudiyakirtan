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
| search | ✅ v9 | ✅ | ✅ |
| url-resolution (v1) / 404 | ✅ | n/a | n/a |
| pwa (v1) — offline/install | ✅ | n/a | n/a |
| seo (v1) — metadata/sitemap | ✅ | n/a | n/a |
| observability (v1) — analytics/Sentry | ✅ | n/a | n/a |
| settings | ✅ | ✅* | ✅ |
| theme (Gaura/Shyam) | ✅ | ✅* | ✅ |
| home (v3 — re-purposed) | ✅ | — | — |
| today (v1) — embedded as home §1 | ✅ | — | — |
| navigation (v2) | ✅ v2 green | ✅*ᶠ | ✅ᶠ |
| about / contact (v1) | ✅ | — | — |
| components (v2) | ✅ | — | — |
| collections / books / topics | ✅ | ✅* | ✅ |
| artist/book images | ✅ | ✅* | ✅ |
| unit tests | ✅ | ✅* | ✅ |
| resources | 🔨 | — | — |
| player / now-playing | ✅ v12 green | ✅* | ✅ |

Legend: `✅` verified · `✅*` iOS typecheck+harness (full `xcodebuild` sandbox-blocked; confirm on a real
Xcode machine) · `ᶠ` footer/nav polish · `🔨` in progress · `—` not applicable / not on that platform.

**Web overhaul (build + screenshot/CDP verified):** top bar removed; search is a **centered
command-palette modal** on desktop and a **full-screen search page** on mobile — one component,
one media query ([search.md](screens/search.md) v9; `SearchModal.tsx`, ⌘K / sidebar / mobile header,
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
