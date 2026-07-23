# Icons — cross-platform pack

**Standard: [Lucide](https://lucide.dev)** (MIT). One consistent, modern, thin-stroke icon language
across all three platforms — it matches the existing Feather-style aesthetic and ships everywhere:

- **Web** — `lucide-react`. The shared set is wrapped in
  [`web/src/components/icons/SidebarIcons.tsx`](/web/src/components/icons/SidebarIcons.tsx) (named
  exports like `HomeIcon`, `SongsIcon`, …) so call sites stay stable; player/search/sidebar use
  `lucide-react` icons directly (`Play`, `Pause`, `Repeat`, `Download`, `Share2`, `Search`, `Sun`,
  `Moon`, `ChevronsLeft`, …).
- **Android** — Lucide ships raw SVGs; import them as **vector drawables** (or the `lucide` Compose
  community package) using the same glyph names.
- **iOS** — use the Lucide SVGs (e.g. via a `lucide-swift`-style asset catalog) or the closest
  **SF Symbol** equivalent where a 1:1 system symbol exists; keep names aligned to the web set.

Icon sizing convention: 16–18px in dense UI (nav, controls), stroke width 2. Colour comes from the
theme tokens (`currentColor` → `var(--neutral)`/`var(--primary)`/`var(--highlight)`), never hardcoded.
