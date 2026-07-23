# Screens — Browse (Home, Authors, Collections, Navigation)

**Spec version:** 1

**Figma frames:** `Home`, `Home-1`, `Home-2`, `Authors`, `Collections`, `Collections-1`, `Topics`,
`Navigation`, `Navigation-1..5`, `Sidebar`, `Header`, `mobile-menu`, `Resources`.

These browse surfaces were **built in earlier slices** and wired to the real corpus. This spec
captures their conformance requirements so they can be **verified against Figma + the theme**, not
rebuilt from scratch.

## Home

- **Sections** over the real corpus (via the repository/manifest): featured/recent songs, authors,
  and — when data exists — books/topics. Each row/card taps into [song-detail](song-detail.md) or the
  relevant browse list.
- Search affordance in the header → global [search](search.md).
- Titles honor `listLanguage`; everything themes via the [theme](theme.md) tokens.
- **Empty groupings:** the corpus ships **no books/topics/collections and no tags** — those sections
  must render nothing (or a tasteful empty state), never placeholder/fake rows.

## Authors

- Manifest/derived-catalog list of the ~84 authors (name via `author_display`, uid fallback when
  empty). Tapping an author → the author-filtered list (`Library (Author)` / `?author=` — see
  [songs-list](songs-list.md)).
- No author images/bios ship — header is name + song count only.

## Collections / Topics / Books

- Same `SongGroup` browse surface ([collections data](../data/collections.md)). **No group data ships
  yet**, so these render an **empty state** (not fake groups). Keep the screens present and correct so
  they light up automatically when a `song_groups.json` is added to the pipeline.

## Navigation

- **Mobile:** bottom tab bar (`Navigation-*` frames) — Home, Library/Songs, Search, Settings — with
  the icon set (`home`/`library`/`search`/`stack`, filled + outline). Song-detail hides the tab bar
  (per [song-detail](song-detail.md)).
- **Web:** sidebar (`Sidebar`) + header (`Header`); collapsible; `mobile-menu` for small screens.
- Active state uses the accent/`highlight` token (per [theme](theme.md) interactive-controls rule).

## Resources (web)

- The three static reference pages (diacritics, meters, pronunciation) exist on web. Known issue:
  `meters.tsx`/`pronunciation.tsx` reference **undefined** CSS color vars (`--red`, `--green`, …) so
  their color-coding cells render blank — either define those vars (a small fixed reference palette,
  not the theme tokens) or convert to the media palette. Low priority; mobile parity is a later IA
  decision.

## Verification

- **Visual:** each surface matches its Figma frame per platform; empty states for books/topics/
  collections are graceful; navigation active-state uses the accent.
- **Behavioral:** sections/lists render the real corpus; taps navigate correctly; titles follow
  `listLanguage`; everything repaints under Gaura/Shyam; no fake/placeholder data anywhere.

## Change log

- **v3 (web)** — Sidebar collapse now **collapses completely** (slides fully off-canvas; content goes
  full-width; a floating `PanelLeft` button top-left reopens it) rather than shrinking to an icon rail —
  the rail moved icons to new x-positions, which read as confusing. Industry norm is one of: keep the
  icon rail with icons at a **fixed left x** (VS Code / Slack / Linear), or **hide entirely** with a
  reopen affordance (Notion); we took the latter. The sidebar **theme toggle** hover now previews the
  *other theme's surface* colour (its `--background-offset` + `--primary`), a soft preview rather than
  the harsh accent.
- **v2 (web)** — Browse groupings are now navigable: `books/[id]` and `topics/[id]` detail routes
  (`SongGroupScreen.tsx`) list a group's songs behind an accent-tinted header (books preserve
  `song_uids` order, topics sort by title); the home/index cards, previously `console.log` stubs, now
  route to them. **Navigation was restructured** — the top bar was removed (Notion-style) and the
  search box moved into a modernized always-on sidebar (`Sidebar.tsx`) that carries the wordmark,
  search (⌘K), nav groups, theme toggle, and settings; the mridanga logo was dropped. Author names
  honor the reader's script (romanized under Roman) on every browse surface.
- **v1** — Retroactive conformance spec for the already-built browse surfaces (home/authors/
  collections/navigation/resources): real-data sections, empty-state discipline for absent groupings,
  accent-tinted nav active state, and the web Resources undefined-color-var issue.
