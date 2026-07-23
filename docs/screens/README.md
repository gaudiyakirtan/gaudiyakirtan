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

## Screen index → Figma frames

Per-platform **build status lives in one place** — the
[conformance matrix](../implementation-mapping.md). This index is only spec ⇄ frame ⇄ purpose, so it
can't drift out of sync with what's actually shipped.

| Screen spec | Figma frame(s) | Notes |
|-------------|----------------|-------|
| `home.md` | `Home`, `Home-1`, `Home-2` (**superseded**) | v1 re-purposes home: Now / Continue / one browse row |
| `today.md` | **none yet** | Home-screen section over [calendar](../data/calendar.md); no Figma frame |
| `song-detail.md` | `Song`, `Song-1..4`, `Song (hidden song)`, `Song Component (app/web)`, `song view` | Platform-split song component |
| `songs-list.md` | `Songs`, `Song List`, `Song List-1`, `Flat Song List`, `Library_Songs` | Table vs card layouts |
| `tracks.md` | **none** — behavioral | Browse by recording; reciter filter; shared `AuthorNames` payload |
| `library.md` | `Library`, `Library (Author)`, `Library (Author)-1/2` | Mobile Library ≈ web browse |
| `authors.md` | `Authors` | |
| `collections.md` | `Collections`, `Collections-1`, `Topics` | Book/Topic/Collection browse |
| `search.md` | `Search`, `Search-1` | Fuzzy command palette over the [Manifest](../data/manifest.md) |
| `url-resolution.md` | **none** — behavioral | Case-fix + scoped-fuzzy URL rescue; branded 404 |
| `player.md` | `Now Playing`, `Player`, `Track`, `trailingIcon2_` | Unified morphing mini-player; continue-play, sleep timer, book/topic queue |
| `settings.md` | `Settings`, `Settings-1/2/3` | Language, theme, verse toggles |
| `resources.md` | `Resources`, `Resources-1` | Diacritics/meters/pronunciation |
| `navigation.md` | `Navigation`, `Navigation-1..5`, `Sidebar`, `Header`, `mobile-menu`, `Mobile` | Sidebar footer is one row; Collections deferred |
| `theme.md` | `Guar Theme`, `Shyam Theme`, `Colors` | Two named palettes, not just light/dark |
| `components.md` | `Components`, `Group 15/16`, `Frame *` | SongListItem/`surface`, `singleRow`, HeroBanner, `BrandWordmark`, icons |
| `about-contact.md` | **none yet** | Static pages; required Gīti-guccha attribution |
| `pwa.md` | **none** — infra | Installable + offline service worker; cache strategy; S3 bypass |
| `seo.md` | **none** — infra | Per-page `<Seo>`, JSON-LD, sitemap/robots, canonical → apex |
| `observability.md` | **none** — infra | Cookieless Vercel analytics + Sentry (`@sentry/react`) |

---

## Gap analysis

Live per-platform status is the [conformance matrix](../implementation-mapping.md); this section
captures the *structural* gaps that remain regardless of platform.

**Web has shipped** player, search, tracks, url-resolution, home (v3), today, about/contact,
navigation, components, and the library/authors/collections screens. What structurally remains:

- **Two-theme system** — `theme.md`. **Gaura** (`Guar Theme`, warm/gold) and **Shyam**
  (`Shyam Theme`, dark/blue) are named palettes + a switcher, not merely light/dark.
- **Mobile parity** — iOS/Android trail web on the newer screens (player, tracks, search polish,
  today/calendar). Per-platform state is in the matrix.
- **Settings** — Android has no Settings screen; web/iOS partial (`Settings-1/2/3` variants:
  language, theme, verse-display toggles).
- **Resources** — web-only (3 pages); not on mobile. Decide per IA reconciliation (Track C1).

**Missing Figma frames** (built behaviorally; the *visual* verifier layer can't run until frames are
drawn): `today.md`, `tracks.md`, `url-resolution.md`, `about-contact.md`.

**Exists but must be re-verified against spec + real data:** the mobile shells for Home, Song detail,
Songs list, Library, Authors, Collections, Navigation were built against sample data and pre-date
these specs.

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
