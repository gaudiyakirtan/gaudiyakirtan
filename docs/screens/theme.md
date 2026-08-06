# System — Theme (Gaura / Shyam)

**Spec version:** 2

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
  **v2 slot mapping** — the accent goes in Material's *brand* slot, not in a surface slot:

  | Token | Material slot |
  |---|---|
  | `accent` / `highlight` | `primary` (+ `primaryContainer`, `secondary`, `tertiary`) |
  | `onHighlight` | `onPrimary` (+ the matching `on*` slots) |
  | `background` | `background` |
  | primary text | `onBackground`, `onSurface` |
  | `backgroundOffset` | `surface`, `surfaceVariant` |
  | secondary text | `onSurfaceVariant` |
  | `border` | `outline`, `outlineVariant` |
  | `neutral` | no Material slot — carried on a `CompositionLocal` and exposed as `ColorScheme.neutral` |

  The **container ramp** (`surfaceContainerLowest/Low/…/Highest`, `surfaceDim`, `surfaceBright`,
  `inverseSurface`) must be filled from the palette too. Components read those slots directly — an
  unchecked `Switch` track is `surfaceContainerHighest` — and any unset slot silently falls back to
  the M3 *baseline* palette, painting stock Material colors onto Gaura/Shyam. `outline` is the
  higher-contrast boundary role and takes `neutral`; `outlineVariant` is the subtle divider and
  takes `border`.

  v1 put the accent in `surfaceVariant` and the *text* color in `primary`, which inverted Material's
  own semantics and made every stock component render gray/unfinished until it was given a bespoke
  `colors()` override. This is a **platform mechanism change only** — the semantic tokens and their
  values are unchanged, so iOS and Web are not affected by it and do not go stale against v2 on
  this point.
- **Web:** CSS variables (`--gaur-*` / `--shyam-*` → `--primary` …) already scaffolded in `colors.md`;
  `ThemeContext` sets the active set by class/`data-theme`, from the persisted `theme`.

## Interactive controls (important)

Interactive and selection controls — switches, toggles, radios, sliders, selected states, primary
button fills — render in `highlight`/`accent`, with `onHighlight` for content sitting on them. A
control that comes out in the *text* color is wrong: it reads gray/unfinished.

**How that is achieved is per-platform, and v2 changes it on Android.** Where a platform's controls
default to a brand slot, the fix is to put `accent` in that slot once, in the theme, so the defaults
are correct. Where they don't, controls must be tinted explicitly at the call site.

- **Android (v2):** solved in the theme. `accent` occupies `primary`, so stock components are correct
  by default and must **not** carry per-component `colors()` overrides. v1's `accentSwitchColors()`
  and `accentRadioButtonColors()` helpers are deleted; re-introducing that pattern is a regression.
- **iOS / Web:** unchanged — tint explicitly, since neither has a brand slot to park the accent in.

## Shape

Shape is a hierarchy axis, so it is a **scale with named steps**, never a per-component radius.
Arbitrary values (the app previously carried 4, 8, 10, 11, 12, 16, 20 and 22.dp side by side) are
not permitted; pick the step whose role matches.

| Step | Radius | Role |
|---|---|---|
| `extraSmall` | 4 | tags, chips, small indicators |
| `small` | 10 | list rows, compact cards |
| `medium` | 16 | standard cards — the default container |
| `large` | 22 | sheets, prominent cards |
| `largeIncreased` | 28 | a *selected* or *active* container stepping up one level |
| `extraLarge` | 32 | full-bleed/hero containers |
| `extraLargeIncreased` | 40 | the same, stepped up |

The `*Increased` steps exist so an emphasis state can change shape without inventing a radius. Two
deliberate exceptions: a directional/asymmetric shape (e.g. the alphabetical scroll bar's leading-edge
rounding) and an animated radius driven by state (the play/pause morph) are not scale steps.

## Motion

Motion communicates hierarchy, continuity, or state — never decoration.

- **Expressive motion** for hero transitions, selection changes, playback/activity, and important
  state changes.
- **Standard motion** for repeated utility interactions.
- Every screen gets **one** principal expressive focal element. *Today only the player satisfies
  this*; the other eight screens have no focal element yet and are not conformant on this clause.
  In the player it is the scrubber:
  **wavy = playing, flat = paused**, morphing between the two rather than switching, so the change
  itself is legible. The play/pause control echoes it (circle → squircle).
- Accessibility is not traded for expression: a decorative or duplicated indicator clears its
  semantics rather than adding a second announced control, and any control that replaces an
  interactive one must keep that control's semantics (the player draws the wavy indicator but keeps
  a real slider for seek, keyboard, and TalkBack).

On Android these come from `MaterialExpressiveTheme` + `MotionScheme.expressive()`. iOS and Web have
no such implementation and reproduce the same behavior in their own idiom.

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

- **v2** — Material 3 Expressive. Adds the **Shape** scale and the **Motion** contract (expressive
  vs standard, one focal element per screen, wavy = playing). Rewrites **Interactive controls** so
  the requirement is stated once and the *mechanism* is per-platform. Records Android's remapped
  Material slot table: `accent` moves from `surfaceVariant` to `primary` so stock components are
  correct by default, which retires the per-component `colors()` overrides. Palette values and
  token semantics are unchanged from v1.
- **v1** — Initial spec: two named palettes Gaura(light)/Shyam(dark) with exact values from
  `colors.md`, explicit `gaura|shyam|system` selection driving an app-wide repaint, and the semantic
  token contract every component must use.
