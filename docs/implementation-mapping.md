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
| song-detail (v7) | ✅ v6 | ✅ v7 green (Xcode 26.6) | ✅ v7 green |
| songs-list / library | ✅ | ✅* | ✅ |
| tracks (v1) | ✅ | — | — |
| authors | ✅ | ✅* | ✅ |
| search | ✅ v10 | ✅ | ✅ |
| url-resolution (v1) / 404 | ✅ | n/a | n/a |
| pwa (v1) — offline/install | ✅ | n/a | n/a |
| seo (v1) — metadata/sitemap | ✅ | n/a | n/a |
| observability (v1) — analytics/Sentry | ✅ | n/a | n/a |
| settings (v5) | ✅ v4 ⏳ | ✅ v5 green (Xcode 26.6) | ✅ v5 green |
| theme (Gaura/Shyam) | ✅ | ✅* | ✅ |
| home (v3 — re-purposed) | ✅ | — | — |
| today (v1) — embedded as home §1 | ✅ | — | — |
| navigation (v5) | ✅ v5 green | ✅*ᶠ ʷ | ✅ᶠ ʷ |
| about / contact (v1) | ✅ | — | — |
| components (v4) | ✅ v4 green | — | — |
| collections / books / topics | ✅ | ✅* | ✅ |
| artist/book images | ✅ | ✅* | ✅ |
| unit tests | ✅ | ✅* | ✅ 28 green |
| screenshot tests | ✅ Playwright | — | ✅ Roborazzi (JVM, no device) |
| resources | 🔨 | — | — |
| player / now-playing | ✅ v13 green | ✅ v14 green (Xcode 26.6) | ✅ v14 green |

Legend: `✅` verified · `✅*` iOS typecheck+harness (full `xcodebuild` sandbox-blocked; confirm on a real
Xcode machine) · `ᶠ` footer/nav polish · `ʷ` the newest spec version is **web-only** — it describes a
web surface (navigation v5 / player v13: the web z-index scale and the drawer-over-mini-player
model), so iOS/Android are not stale against it; they stay conformant at the version before it ·
`🔨` in progress · `—` not applicable / not on that platform.

### Player v14 — open items

- **The `ʷ` footnote no longer applies to the player row.** It meant "the newest spec version is
  web-only, so mobile isn't stale against it". v14 is a *mobile* version, so iOS and Android are now
  measured against it directly. Web stays conformant at v13 and is not stale.
- **iOS v14 is built, tested and rendered.** Xcode 26.6, iPhone 17 Pro simulator, iOS 26.5:
  `xcodebuild build` succeeds and `xcodebuild test` is **70/70 green**, including all 16
  `TakeQueueTests`. The player was exercised against real streamed audio from the S3 bucket, and the
  song screen, the loaded/unloaded toolbar pill and Now Playing (playing + paused) were captured in
  both palettes — [`docs/screenshots/ios/`](screenshots/ios/). Mini-player suppression on the reader
  was confirmed visually: no bottom bar is present on song-detail in any capture.
- **Mobile has no book/topic queue**, so `shuffle`/`repeatMode` scope to a song's **takes**. Web's
  richer queue (`queueContext`, endless play, sleep timer) has no mobile counterpart, and the
  "queue" action on mobile therefore shows the takes in resolved play order. If a collection queue
  ever lands on mobile, that action is where it goes.
- **Share has no canonical link on mobile.** Web shares `/songs/<uid>?play=<take>`; iOS and Android
  have no app URL scheme or site-URL constant, so both share the take's public bucket URL plus the
  song/reciter credit. Worth replacing with a real site URL when one exists.

### Settings v5 — open items

- **iOS is now built and run.** Verified on a Mac with **Xcode 26.6**, iPhone 17 Pro simulator,
  **iOS 26.5** runtime: `xcodebuild build` succeeds and `xcodebuild test` is **54/54 green** (51 unit
  incl. the 15 new `SettingsResolverTests`, 3 UI). Settings was rendered in both palettes —
  [`docs/screenshots/ios/`](screenshots/ios/).
- **Rendering caught a layout defect the review could not.** The `MenuPickerStyle` pickers were
  compressed by their row's `Spacer`, so long shared labels ("English (Roman / Latin)" beside
  "IAST") wrapped character-by-character and drew over the sample verse and the word-by-word gloss.
  Fixed by giving the pickers their ideal width (`.lineLimit(1)` + `.fixedSize`) and stacking the
  caption above the control via `ViewThatFits` when they cannot share a line.
- **The iOS deployment target moved 15.6 → 17.0** (carried by PR #52, now on `mono`).
  `SongView.swift`'s `.toolbar(.hidden, for: .tabBar)` needs iOS 16 and the generated asset-catalog
  colour symbols (`Color.highlight` etc.) need iOS 17, so the project could not have been building
  at 15.6. **This is a product decision a human must confirm — it drops iOS 15 and 16 devices.**
- **Web is behind at v4 and diverges on ISO 15919.** `stripMasterFlags` deletes `[FLAG_HYPHEN_ALPHA]`
  outright, so web renders `nityānandarāya`; iOS and Android resolve it to a hyphen, giving
  `nityānanda-rāya`, which matches the IAST the corpus ships. Mobile is right here and web is the
  outlier. Web also has not adopted the shared `ScriptOptions` naming.

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
