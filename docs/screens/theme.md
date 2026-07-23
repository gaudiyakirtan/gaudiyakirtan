# System — Theme (Gaura / Shyam)

**Spec version:** 1

**Figma frames:** `Guar Theme`, `Shyam Theme`, `Colors`, `Components`.
**Palette values (authoritative):** [`../theme/colors.md`](../theme/colors.md).

## Purpose

The app has **two named palettes**, and they map to light/dark:

- **Gaura** — the **light** theme: warm cream background (`#FFF4E8`), gold accent (`#B36B00`).
  Named for Gaurāṅga, the golden/fair avatāra.
- **Shyam** — the **dark** theme: near-black background (`#191919`), soft-blue accent (`#8CB4FF`).
  Named for Śyāma, the dark-complexioned Kṛṣṇa.

So "the two-palette system" is not two themes each with a light+dark — it is these two specific
palettes, selectable explicitly or by following the device. The interim `gaura→light / shyam→dark`
mapping the earlier slices wired is the *intended* mapping; this slice locks the **exact** palette
values from `colors.md` and makes selection explicit.

## The `theme` setting

Driven by [settings](settings.md) `theme` ∈ `gaura | shyam | system`:
- `gaura` → always the Gaura (light) palette.
- `shyam` → always the Shyam (dark) palette.
- `system` → Gaura when the device is in light mode, Shyam when dark.

Changing it **repaints the whole app immediately** and persists. Labels may read "Gaura (Light)" /
"Shyam (Dark)" / "System" so the mapping is honest.

## Semantic tokens (the contract)

Every component styles via these semantic tokens — **never hardcoded hex**. Values per palette are
in [`colors.md`](../theme/colors.md):

`primary`, `secondary`, `tertiary`, `accent`, `highlight`, `onHighlight`, `background`,
`backgroundOffset`, `border`, `neutral`.

> `onHighlight` is the text/icon color placed **on** an accent/highlight fill (white in Gaura,
> near-black in Shyam, because Shyam's accent is light blue). Use it instead of hardcoding
> `white`/`black` on accent buttons/toggles so they stay legible in both palettes.

A component reads a token (e.g. `highlight`); the active palette supplies the value. This is what
makes song-detail/list/settings theme automatically (they already use these tokens).

## Per-platform mechanism

- **iOS:** color sets in `Assets.xcassets` with light(Gaura)/dark(Shyam) variants; `Color.<token>`.
  `ReaderSettings.theme` drives `.preferredColorScheme` for explicit gaura/shyam, `nil` for system.
  **Naming caveat:** `primary`/`secondary` collide with SwiftUI's built-in `Color.primary`/`.secondary`
  (a colorset of that exact name breaks asset codegen), so iOS maps `primary→primaryText`,
  `secondary→secondaryText`, `tertiary→tertiaryText`; the other tokens keep their names. Same token
  semantics, iOS-safe names.
- **Android:** `lightColorScheme` = Gaura, `darkColorScheme` = Shyam (exact values from `colors.md`);
  the theme setting selects which scheme regardless of device, or follows device for `system`.
- **Web:** CSS variables (`--gaur-*` / `--shyam-*` → `--primary` …) already scaffolded in `colors.md`;
  `ThemeContext` sets the active set by class/`data-theme`, from the persisted `theme`.

## Interactive controls (important)

The token model makes `primary` the **text** color and `highlight`/`accent` the **interactive** color.
So **interactive/selection controls must be tinted to `highlight`/`accent` explicitly** — switches,
toggles, radios, sliders, selected states, and primary-button fills — with `onHighlight` for content
sitting on them. Do **not** let them fall back to the platform's default control tint (which, under
this scheme, resolves to the dark/light *text* color and makes controls look gray/unfinished). This
is a semantic-token requirement, not per-platform styling.

## Theme conformance checklist (polish pass)

All three platforms built the base theme before these were finalized — reconcile:
1. **Gaura `tertiary` = `#5A5A5A`** (was locked to the old `#1A1A1A`; see `colors.md`).
2. **`onHighlight` token** present and used on every accent/highlight fill (white in Gaura, near-black
   in Shyam) — no hardcoded `white`/`black` on accent surfaces.
3. **Interactive controls tinted to `accent`/`highlight`** per the section above.

## Verification

- **Visual:** the app in Gaura matches the `Guar Theme` frame (warm/gold); in Shyam matches
  `Shyam Theme` (dark/blue). The `Colors` frame swatches match `colors.md`.
- **Behavioral:** switching `theme` in Settings repaints every screen (song-detail, list, settings,
  search) live and persists across relaunch; `system` follows the device; **no hardcoded colors**
  remain (grep each platform for stray hex — all styling goes through tokens).

## Change log

- **v1** — Initial spec: two named palettes Gaura(light)/Shyam(dark) with exact values from
  `colors.md`, explicit `gaura|shyam|system` selection driving an app-wide repaint, and the semantic
  token contract every component must use.
