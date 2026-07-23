# Screen Specifications

Specs for every screen and major UI component. For **UI, the source of truth is Figma**
(`../../Gaudiya Kirtan UI/*.png`) — these docs capture *behavior, states, data-binding, and
cross-platform structure* that a PNG can't. Pixel layout is read from the frame; these specs say
what the screen *does* and which [data](../data/) it binds. See [`../WORKFLOW.md`](../WORKFLOW.md).

Verifier for screens is two-layer: **visual** (screenshot vs. the referenced Figma frame) +
**behavioral** (navigates, binds data, handles states). Full per-screen specs are authored
**just-in-time** as Track B picks each screen up (the SPEC step of the loop); this index +
gap-analysis is complete now so nothing is missed.

---

## Screen index → Figma frames → status

| Screen spec | Figma frame(s) | Web | iOS | Android | Notes |
|-------------|----------------|-----|-----|---------|-------|
| `home.md` ✅ | `Home`, `Home-1`, `Home-2` (**superseded**) | — | — | — | **v1 re-purposes home**: Now / Continue / one browse row |
| `today.md` ✅ | **none yet** | — | — | — | **New** — home-screen section over [calendar](../data/calendar.md); no Figma frame |
| `song-detail.md` ✅ | `Song`, `Song-1..4`, `Song (hidden song)`, `Song Component (app/web)`, `song view` | shell | shell | shell | Platform-split song component |
| `songs-list.md` | `Songs`, `Song List`, `Song List-1`, `Flat Song List`, `Library_Songs` | shell | shell | shell | Table vs card layouts |
| `library.md` | `Library`, `Library (Author)`, `Library (Author)-1/2` | — | shell | shell | Mobile Library ≈ web browse |
| `authors.md` | `Authors` | shell | shell | shell | |
| `collections.md` | `Collections`, `Collections-1`, `Topics` | shell(Books/Topics) | shell | shell | Book/Topic/Collection browse |
| `search.md` | `Search`, `Search-1` | — | — | — | **New — built nowhere** |
| `player.md` | `Now Playing`, `Player`, `Track`, `trailingIcon2_` | — | — | — | **New — audio, built nowhere** |
| `settings.md` | `Settings`, `Settings-1/2/3` | shell | shell | — | Language, theme, verse toggles |
| `resources.md` | `Resources`, `Resources-1` | shell(3 pages) | — | — | Diacritics/meters/pronunciation |
| `navigation.md` ✅ | `Navigation`, `Navigation-1..5`, `Sidebar`, `Header`, `mobile-menu`, `Mobile` | ✅ | shell | shell | Sidebar footer is **one row**; Collections deferred |
| `theme.md` | `Guar Theme`, `Shyam Theme`, `Colors` | partial(light/dark) | partial | partial | **Two named palettes, not just light/dark** |
| `components.md` ✅ | `Components`, `Group 15/16`, `Frame *` | ✅ | — | — | SongListItem/`surface`, `singleRow`, HeroBanner, icons |
| `about-contact.md` ✅ | **none yet** | ✅ | — | — | **New** — static pages; required Gīti-guccha attribution |

Status: `—` not started · `shell` = exists but predates spec (re-verify) · `partial` · `✅` spec authored.

---

## Gap analysis (what Track B must add)

**Entirely missing (built on no platform):**
- **Audio player** — `player.md` (`Now Playing`/`Player`/`Track`). Largest gap; needs a player
  service + UI + offline download, binding `Song.audioFiles`.
- **Search UI** — `search.md`. Wires to the fuzzy search over the [Manifest](../data/manifest.md).
- **Two-theme system** — `theme.md`. Current apps do only light/dark; Figma defines **Gaura**
  (`Guar Theme`, warm/gold) and **Shyam** (`Shyam Theme`, dark/blue) as named palettes + a switcher.
- **About / Contact** — `about-contact.md` ✅ v1, shipped on web. Replaces the old `A0`
  placeholder-song-as-announcement hack (that record is now gone; the corpus is 702 songs).
  **No Figma frames.**
- **Home rework** — `home.md` ✅ v3. The shipped screen is four browse grids duplicating the
  sidebar, two of them labelled "Popular" with no popularity data. v1 re-points it at "what do I
  sing right now". Existing `Home*` frames show the superseded layout.
- **Today section** — `today.md` ✅ (spec authored). Home-screen section over the
  [calendar](../data/calendar.md) overlay, which currently renders on no platform. **Has no Figma
  frame** — it post-dates the file — so the visual verifier layer cannot run until one is drawn.

**Incomplete:**
- **Settings** — Android has no Settings screen; web/iOS partial (need `Settings-1/2/3` variants:
  language, theme, verse-display toggles).
- **Resources** — web-only (3 pages); not on mobile. Decide per IA reconciliation (Track C1).

**Exists but must be re-verified against spec + real data:**
- Home, Song detail, Songs list, Library, Authors, Collections, Navigation on all platforms — these
  shells were built against sample data and pre-date these specs.

---

## Screen spec template

Each screen spec has:
1. **Spec version** — bumped on change.
2. **Figma frames** — the authoritative visual reference(s).
3. **Purpose** — what the screen is for.
4. **Data bindings** — which [data entities](../data/) it reads, and how.
5. **Layout & regions** — structure (header/list/detail), responsive behavior.
6. **States** — loading / empty / error / hidden-song / offline.
7. **Interactions** — taps, navigation targets, toggles.
8. **Per-platform notes** — TabView vs sidebar, Compose vs SwiftUI vs React specifics.
9. **Verification** — the visual + behavioral checks that make it "done".
10. **Change log.**
