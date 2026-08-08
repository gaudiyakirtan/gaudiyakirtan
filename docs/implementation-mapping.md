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
| [calendar](data/calendar.md) | v2 | ✅ | ✅ v2 | ✅ |
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
| Calendar overlay (lunar month → songs) | ✅ | ✅ | ✅ |
| Home renders the calendar (month + songs) | ✅ | ✅ | ✅ |
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
| home (v3 — re-purposed) | ✅ | — | 🔨 v3 partial |
| today (v2) — embedded as home §1 | ✅ v2 | ✅ v2 | ✅ v2 |
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

**home v3 — Android is `🔨 partial`, but §1 now matches web.** The "Welcome + this month" hero was
a flat accent-filled block; it is now the same object web renders — a bordered `background-offset`
card holding a gradient banner (accent → highlight → offset, under a bottom-to-top scrim) with the
month name, Gaudiya month, observances and the `adhika-māsa` badge overlaid on it, over a quiet
"sung this month" label and the shared `SongListItem` rows. Month artwork resolves to the same slug
web does (`ImageConfig.monthSlug`, unit-tested), but from `assets/months/` rather than a URL — the
bucket has no `months/` prefix and the hero must not need the radio. Only Vāmana ships a file, so
the gradient is the normal path. Still missing against web: the per-row **recording picker**
(stacked singer avatars + take count, plays in place), which needs player wiring; and **Recently
played** (region 2) does not exist on Android at all. One further divergence is not in this region
but in the shared row: `SongListItem` colors its title `colorScheme.primary`, which the theme v2
remap turned into the *accent*, so Android's list titles read gold where web's read as primary
text. That affects every list screen and should be fixed as its own slice, not here.

**today v2 — the basis-sort withdrawal.** v1 required ordering a month's songs by
`basis` strength; v2 withdraws that and makes the shipped `song_uids` sequence the ranking, with a
stable playable-first partition as the only permitted reordering. The conflict surfaced by rendering
both platforms' Śrāvaṇa list side by side: web preserved the curated order (`B25, B26, VT3, GN1`)
while Android sorted by basis (`B25, VT3, B26, GN1`). Web's behavior was judged the better one, so
the spec moved to it rather than the other way round — web is conformant unchanged, and Android now
pins that exact sequence in a regression test.

> **✅ iOS — v2, verified on macOS.** iOS now has the slice: `CalendarModels.swift`,
> `CalendarRepositoryLogic` (pure, ported from Android's), `CalendarRepository` (bundled
> `calendar.json`, injectable `Bundle`, `assertionFailure` + empty fallback), the `HomeViewModel`
> wiring incl. `significantTimeChangeNotification` re-resolution, `ThisMonthSection` in `HomeView`,
> and `CalendarRepositoryTests` mirroring Android's cases with the Śrāvaṇa and Kārtika sequences
> pinned. Ordering is v2's: shipped sequence preserved, one stable playable-first partition (two
> order-preserving `filter` passes — Swift's `sort` and `partition(by:)` are both unstable), no basis
> sort; the display cap (6) lives in the view.
>
> **Verifier run — Xcode 26.6 (17F113), iPhone 17 Pro simulator, iOS 26.5 runtime:** `xcodebuild
> build` **BUILD SUCCEEDED** with zero source changes needed, and `xcodebuild test` is **55/55
> passed, 0 failed, 0 skipped** — including all **16** `CalendarRepositoryTests` (the PR body said 14;
> the file has 16). Home's this-month region was rendered and screenshotted in both palettes:
> [`screenshots/ios/home-gaura.png`](screenshots/ios/home-gaura.png) ·
> [`screenshots/ios/home-shyam.png`](screenshots/ios/home-shyam.png). Both of the previously-flagged
> assumptions **held**: the `PBXFileSystemSynchronizedRootGroup`s did pick up all four new `.swift`
> files (confirmed in the compiled `SwiftFileList`, `.pbxproj` still untouched), and
> `Resources/months/vamana.jpg` lands in the flattened bundle root where `ImageConfig` looks
> (`testOnlyVamanaShipsBannerArtwork` passes).
>
> **Caveat carried by [`claude/ios-build-unblock`](https://github.com/gaudiyakirtan/gaudiyakirtan/pull/52):**
> the build only succeeds with `IPHONEOS_DEPLOYMENT_TARGET` raised **15.6 → 17.0**. That is a product
> decision needing human sign-off — it drops iOS 15 and 16 devices. Verification here was on iOS
> **26.5**; nothing has been run against a real 17.x device.
>
> Still missing against web, as on Android: the per-row **recording picker**, which needs player
> wiring. The Vāmana **artwork** banner path is covered by a unit test but has not been *rendered* —
> today (2026-08-07) falls in Śrāvaṇa, which correctly takes the gradient path, and the simulator's
> date was not moved to force the artwork case.

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
