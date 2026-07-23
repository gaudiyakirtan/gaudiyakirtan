# Typography — the 5th Avenue brand face

**Spec version:** 1

## Purpose

One brand display face — **5th Avenue** (a Didone) — used **only** for the wordmark and the Home
welcome heading; everything else uses the platform UI sans. This doc records how the face ships per
platform and the one rule that keeps it legible.

## The face

- **`--font-display`** = `'5th Avenue', 'Iowan Old Style', Georgia, serif` (the `.font-display`
  utility; `web/src/styles/globals.css`).
- **Web:** `@font-face` loads `/fonts/5th-avenue.woff2` (≈82 KB) with a `.ttf` fallback (≈240 KB),
  `font-display: swap`.
- **iOS:** the ttf is registered via `INFOPLIST_KEY_UIAppFonts` **on the app target only** (not the
  Tests/UITests targets).
- **Android:** the same ttf ships as `res/font/fifth_avenue.ttf` — **renamed** because an Android
  resource name can't start with a digit.

## The one load-bearing rule — `font-normal`

The face **ships Regular only.** A `bold` / `font-semibold` class triggers a **synthetic (faux)
bold**, which smears a high-contrast Didone. So wherever the display face is used, weight must stay
**`font-normal`** — a correctness constraint, not a style preference. Consumers:
[`BrandWordmark`](../screens/components.md) (sidebar / header / 404) and the Home "Śrī Gaudiya Kirtan"
heading.

## App icons & favicons

The icon set is the colored **mridanga** recomposited onto the **brand dark surface** (`#191919`,
shyam-background) as a rounded app-tile. An earlier revision drew the drum on a *transparent* ground,
which left it floating on whatever colour the browser tab happened to be; the wide
`sri-gaudiya-kirtan.svg` wordmark was never a candidate (illegible at 16 px).

- `favicon.ico` — multi-size (16 / 32 / 48), rounding baked in; linked from `Layout`.
- `apple-touch-icon` — flattened to a **full dark square** (no rounding, no alpha) so iOS applies its
  own mask without corner slivers.
- `icon-192.png` / `icon-512.png` — the PWA manifest icons ([`../screens/pwa.md`](../screens/pwa.md)),
  keeping the baked rounding.
- The Next.js starter SVGs (`next/vercel/window/globe/file.svg`) were deleted after proving zero
  references.

## Verification

- The wordmark and Home heading render in 5th Avenue (not the Georgia fallback) at `font-normal`
  (no faux-bold smearing) — worth a side-by-side / glyph-width check, since a Didone is easily
  mistaken for a serif fallback.
- `favicon.ico` and the touch/PWA icons return 200 in production; the 5 starter SVGs 404.

## Change log

- **v1** — Initial spec: the 5th Avenue face (`--font-display`, woff2 + ttf, per-platform
  registration incl. the Android rename and iOS app-target-only plist key), the `font-normal`
  faux-bold rule, and the brand-derived favicon / app-icon set.
