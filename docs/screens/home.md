# Screen — Home

**Spec version:** 7

**Status:** implementation in progress. v7 replaces the rejected v6 dashboard composition.

## Product Intent

Home answers one question first: **“What can I sing, read, or hear now?”**

The visual concept is **The Singing Page**: a contemporary songbook prepared for use. Search and
one featured song lead. Season, recent history, books, authors, and topics support that choice in a
dense editorial rhythm. The screen must feel warm, grounded, devotional, and current without
borrowing temple ornament, generic SaaS dashboards, or arbitrary bento geometry.

Research informing this version:

- Apple HIG Motion: custom motion is purposeful, brief, precise, interruptible, and optional.
- Material 3 Motion and States: one coherent motion system; fast spatial motion for small controls,
  effect motion for opacity/color, and one state layer at a time.
- Material 3 Layout: adaptive hierarchy and key actions determine the layout.
- Nielsen Norman Group: hierarchy comes from limited contrast, scale, grouping, and whitespace;
  every extra visual unit competes with the primary task.
- web.dev: prefer transform and opacity for smooth compositor-friendly animation.
- WCAG 2.2 SC 2.3.3: interaction-triggered nonessential motion can be disabled.

## Hierarchy

Use this semantic order at every width:

1. Existing app chrome.
2. Page heading and search entry.
3. Featured song with **Read & sing** as the primary action and playback as the secondary action.
4. Season context and seasonal songs on Web and Android.
5. Recent history on Web.
6. Books.
7. Authors.
8. Topics.
9. Existing native featured reading.

iOS intentionally omits calendar and recents. Android intentionally omits recents and the Web
recording picker. Missing capabilities disappear rather than rendering empty placeholders.

## Opening Composition

The opening is one focal composition rather than three competing cards.

### Featured song

- Use the first playable seasonal song, then the existing first playable catalog fallback.
- A currently loaded shared-player item may supply displayed playback state only when its song UID
  matches the featured song.
- Show the real song title, author, and performer when available.
- **Read & sing** opens the existing song detail destination.
- **Play recording** starts the suggested recording. Once active, it becomes **Pause** or **Resume**.
- Loading and error states change the playback control without hiding the reading action.
- Do not render duplicate playback progress; the persistent player owns time and seeking.

### Season

- Web and Android show a compact text strip: lunar month, Gaudiya month, song count, and complete
  observances.
- Season explains why the songs are present; it is not the page hero.
- Remove the v6 clock/dial. It implied progress or an adjustable value without providing either.
- Long observances wrap or disclose inline. They are never clipped.

### Seasonal songs

- Preserve repository ordering and existing platform-specific recording behavior.
- Web previews six entries; Android retains the complete resolved month list.
- Titles, author, UID, and recording affordance stay together in a compact row.
- The title remains the largest row element. Metadata never competes with it.

## Discovery

### Recent

Web only. Show up to four real local-history entries in a compact list. Omit the section when empty.
Do not fabricate timestamps, progress, or listening history.

### Books

Use actual licensed covers as the principal visual texture. Present each cover as one book, preserve
its aspect ratio, and keep its title visible. Missing covers use the real title in a quiet fallback.
Avoid mixed-image collages and promotional copy that competes with the song action.

### Authors

Show real names and counts in compact text rows. Do not use arbitrary colored initials as identity.

### Topics

Use wrapping text links or quiet outlined chips with counts. Do not use large pastel tiles.

## Adaptive Layout

### Web

- Expanded: content width at most 1120 px, 12 columns, 24 px gaps, and at least 40 px outer gutter.
- Medium: 8 columns with 20 px gaps and 24 px outer gutter.
- Compact: one column with 20 px gutter; 16 px at 359 px and below.
- Expanded opening: featured song spans 7 columns and seasonal repertoire spans 5.
- Medium and compact opening: featured song, season strip, and repertoire stack in semantic order.
- Books use a horizontal rail with three complete covers visible on expanded screens and two plus a
  clear next edge on phones.
- Authors remain a compact list. Topics wrap naturally.

### iOS

- Use the existing navigation stack, tab bar, search destination, and shared player.
- Use 20 pt page insets and native 44 pt minimum targets.
- Featured song leads; books, songs, authors, and topics follow in readable native sections.
- At wide widths, books and authors may share an approximately 840 pt content region.

### Android

- Use the existing top app bar, bottom navigation, search destination, and shared player.
- Use 16 dp page insets and native 48 dp minimum targets.
- Featured song leads. A compact season strip and month repertoire follow.
- Tablets remain a readable feed; books and authors may share a bounded supporting row.

The final item must scroll above the measured player, navigation, and safe-area obstruction.

## Visual Language

- Keep the existing Gaura/Shyam semantic tokens and 5th Avenue brand face.
- Use the display face for the brand and the featured song title only. All song body text uses the
  existing script-capable text face.
- Spend strongest contrast on the featured title, primary reading action, focus, and active
  playback. Season, counts, and browsing metadata remain quieter.
- Use a spacing scale of 4, 8, 12, 16, 24, 32, 40, and 48.
- Use small control corners and medium surface corners. Reserve circles for circular controls.
- Resting sections have no ambient shadow. Elevation belongs to overlays and the persistent player.
- Use one nonfigurative rhythm field behind the featured song: repeated vertical beats crossed by
  one restrained arc. It is decorative, static at rest, clipped to its surface, and inaccessible.

## Interaction And Motion

Home motion communicates clickability, continuity, and player state.

| Token | Timing | Use |
|---|---:|---|
| Press | 80 ms | Immediate control compression or state layer. |
| Release | 120 ms | Return from press. |
| Hover/focus effect | 120 ms | Tint, border, underline, and icon emphasis. |
| Icon replace | 140 ms | Play/pause/loading/retry and disclosure symbols. |
| Picker enter | 180 ms | Opacity plus at most 4 px translation. |
| Picker exit | 120 ms | Faster reverse transition. |
| Page/section entrance | 180–220 ms | One initial grouped reveal only. |

Use `cubic-bezier(.2, 0, 0, 1)` for Web entry/state transitions. Native motion uses the closest
critically damped platform spring without visible bounce.

### Required states

- **Hover:** a restrained state layer, clearer link underline, and a 2 px directional arrow shift.
  Essential actions remain visible without hover.
- **Focus:** a visible 2 px outline separated from the surface; focus is distinct from selection.
- **Press:** immediate tint; compact standalone controls may scale to 0.98. Rows stay fixed.
- **Loading:** reserve geometry. If playback remains pending after 150 ms, replace the icon with a
  static pending symbol and stable label.
- **Playing:** replace play with pause and show one small accent state mark.
- **Paused:** restore play while preserving selection and position.
- **Error:** keep **Read & sing** usable and expose a concise Retry state.
- **Selection:** use text/checkmark and tint, never color alone.

Specific icon motion:

- Play and pause crossfade in one fixed box.
- Search changes from secondary to primary ink when active.
- Browse arrows move 2 px toward their destination.
- Disclosure chevrons replace between down/up states.
- A recording checkmark fades into reserved space.

Do not add perpetual pulse, bounce, floating cards, parallax, automatic carousels, dancing
equalizers, broad blur animation, or layout-size animation.

Reduced motion removes transforms, stagger, and spatial movement. State changes remain immediate
through color, text, and icon replacement.

## Accessibility

- Exactly one page heading is exposed.
- Interactive elements use native buttons/links and complete accessible names.
- Web targets are at least 44 × 44 CSS px for principal controls and 24 × 24 for inline links.
- Native targets are at least 44 pt on iOS and 48 dp on Android.
- Contrast meets WCAG 2.2 AA. Focus is visible in both palettes and forced colors.
- Text reflows at 400% Web zoom and native accessibility sizes without clipping.
- Decorative rhythm art and initials are hidden from assistive technology.

## Rejection Criteria

Reject the implementation if any of these remain:

- The month dial or a large season card dominates the opening viewport.
- The primary reading action is ambiguous, below the fold, or obscured by the player.
- A phone screen becomes a long stack of oversized cards or full-width topic tiles.
- Book imagery is cropped into an unrelated collage.
- Hover is the only indication that content is interactive.
- Text, diacritics, focus rings, or controls clip at supported widths or text sizes.
- Playback state differs between Home and the shared player.
- Reduced-motion mode retains spatial transforms or entrance staggering.

## Verification

Capture both palettes at 1440 × 900, 1024 × 768, 390 × 844, and 320 × 568. Capture native phones
with the shared player active and absent. Verify initial, playing, paused, loading, error, empty,
long-title, large-text, keyboard/focus, and reduced-motion states.

The screenshot must make the featured song, search, and primary action identifiable at first glance.
At 390 × 844 with the player active, the primary action and at least two seasonal rows must be fully
reachable above the player on Web and Android. iOS must show the primary action and the beginning of
the next content section.

## Change Log

- **v7** — Replaces v6’s dashboard/bento composition with The Singing Page: one compact featured
  song, explicit read/play actions, lightweight season context, editorial browsing, and a complete
  quick-interaction motion system.
- **v6** — Rejected dashboard composition with month dial and modular cards.
