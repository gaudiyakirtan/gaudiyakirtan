# Screen — Navigation

**Spec version:** 1

**Figma frames:** `Navigation`, `Navigation-1..5`, `Sidebar`, `Header`, `mobile-menu`, `Mobile`.
The **sidebar footer** below post-dates these frames — verify the rest against them, not the footer.

## Purpose

How a reader moves through the app: a collapsible sidebar on web, a tab bar on mobile.

## Web — sidebar structure

| Region | Contents |
|--------|----------|
| Brand | `BrandWordmark` (live text, brand display face — [`components.md`](components.md)), linking home. Desktop collapse toggle. |
| Search | Opens the centered command palette (⌘K). See [`search.md`](search.md). |
| — | **Home** |
| **Library** | Songs · Tracks · Authors · Topics · Books |
| **Resources** | Verse Meters · Diacritic Guide · Pronunciation |
| **Footer** | One horizontal row — see below. |

### Footer row

A single horizontal row, not a stack:

```
[⚙ Settings]  [ⓘ About]  [✉ Contact]              [☀ Gaura]
```

- **Settings, About, Contact** are **icon-only**. Each carries an `aria-label` *and* a `title`, so
  the control is announced to screen readers and discoverable on hover. An icon-only control with
  neither is unusable, not merely terse.
- **The theme toggle is the only labelled control**, pushed right. This is deliberate and should
  not be "made consistent" by stripping the label: a sun/moon glyph does not tell you *which* theme
  you would get, whereas the other three are self-evident destinations. It is labelled by the theme
  it switches **to** (Gaura / Shyam) and previews that theme's surface colours on hover.

Icons come from **Lucide**, wrapped in `icons/SidebarIcons.tsx` so call sites stay stable.

### Collections — deferred

The sidebar previously carried a **Collections** group. It is **commented out**, not deleted.

A Collection is a curated, user-facing set ([`collections.md`](../data/collections.md)) — meaningful
only once a reader can own one, which requires **auth and accounts**. Until then the corpus ships no
`collection`-kind groups and the group rendered a permanent "No collections yet".

Restore the block together with its `getSongGroups` / `pickScriptText` imports and the `collections`
binding when accounts land. The data layer is untouched: `getSongGroups('collection')` still returns
`[]` and is still asserted by a test, so the contract is intact — only the nav surface is hidden.

## Mobile

Tab bar; the sidebar becomes a drawer behind a scrim. Same destinations.

## States

| State | Behavior |
|-------|----------|
| **Collapsed (desktop)** | Sidebar slides fully off-canvas; toggle restores it. Persisted. |
| **Drawer open (mobile)** | Scrim closes on tap; any nav tap closes it. |
| **Active route** | Highlighted, including nested routes (`/songs/K1` highlights Songs). |

## Per-platform notes

**Web.** `Sidebar.tsx` is client-rendered, so it imports leaf modules **directly** rather than the
`../services` barrel — the barrel re-exports `fs`-backed repositories that must never enter the
client bundle.

**iOS / Android.** Tab bar. About/Contact are not built there yet; when added they belong wherever
Settings lives, not in the main tab set.

## Verification

**Behavioral:**
- Every footer control has an accessible name; the three icon-only ones render no visible label and
  the theme toggle does.
- No Collections group appears while the corpus ships no `collection`-kind data.
- Active-route highlighting covers nested routes.

**Visual:** the footer row has **no frame** — draw one. The rest verifies against the `Navigation*`
and `Sidebar` frames.

## Change log

- **v1** — Initial spec. Footer collapsed from four stacked full-width items to one horizontal row
  (icon-only Settings/About/Contact + labelled theme toggle); Collections group deferred pending
  auth + accounts.
