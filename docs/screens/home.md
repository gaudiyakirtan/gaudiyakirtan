# Screen — Home

**Spec version:** 6

**Status:** implemented on Web, iOS, and Android. v6 supersedes the v5 repeated-card feed and all
older Home layout guidance.

## Purpose

Home answers **“What do I sing, read, or hear now?”** It is an airy modular canvas, not a marketing
hero, dashboard table, or uniform catalog feed. Small labels sit outside modules. The modules vary
in proportion, tone, and media density, with intentional whitespace between groups.

The supplied music/timer/travel composition is the visual reference: quiet utility cards, one dark
focal object, image-led modules, compact supporting lists, and restrained depth. The shared
devotional identity comes from the 5th Avenue display face, real song and performer credits, the
mridanga mark, and actual book artwork. Do not generate or depict sacred figures.

## Modules

| Module | Contract |
|---|---|
| **Listen now** | Reflect the one shared player. A loaded song and take always override Home’s initial suggestion. Show the actual performer when present, play/pause/loading/error state, take count, and real elapsed/duration values. Retry errors through the player. |
| **Season** | Web/Android only. Dark navy focal card with the lunar and Gaudiya month names, full observances, and a static twelve-month dial. Intercalary windows display **Puruṣottama** with `adhika-māsa`. |
| **Seasonal songs** | Existing resolved month repertoire in canonical order. Web retains its recording picker; Android rows continue to open song detail. |
| **Songs** | Native-only four-song preview. The complete catalog remains in Library. |
| **Books** | Image-led collage using shipped cover art and a working full-library destination. Unknown covers use the existing contained fallback. |
| **Recently opened** | Web-only four-entry local history. Choosing a recording does not write history. |
| **Authors** | Compact list using real names and song counts, plus the existing complete destination. |
| **Topics** | Shallow color-coded links using real membership counts, plus the existing complete destination. |
| **Featured reading** | Native-only complete N9 reading with current reader preferences. |

Absent platform capabilities remain absent. iOS does not gain calendar, recents, or a Home recording
picker. Android does not gain recents or a recording picker. Web does not gain native Songs or
featured-reading regions. No backend, corpus, or public model changes are part of this version.

## Order And Geometry

Use one semantic traversal order at every width:

1. Brand and existing search/settings controls.
2. Season, where available.
3. Listen now.
4. Seasonal songs, where available.
5. Native Songs preview, where available.
6. Books.
7. Recently opened, where available.
8. Authors.
9. Topics.
10. Native featured reading, where available.

At expanded width, visual placement may put Listen left and Season in the center while preserving
the semantic order above. The Season card is lifted slightly and remains the strongest contrast.
Books leads the second group; authors and recents are quieter supporting modules; Topics is shallow.
At medium width use two columns. Compact and accessibility layouts use one column and allow every
label to wrap. On iOS, where Season is intentionally absent, Listen now uses the dark focal surface.

Select breakpoints from Home’s available width after persistent navigation and safe-area insets,
not the viewport. Recommended gutters are 16 compact, 24 medium, and 32 expanded, with a maximum
content width of 1200. Reserve the measured player/navigation obstruction plus 16 points of
clearance. No nested vertical scrolling is introduced.

## Data

Use the existing calendar, manifest, author, collection, recents, and shared-player repositories.
Calendar windows remain half-open and refresh at local midnight, foreground/resume, and timezone
change. Resolve month song UIDs through the manifest, omit missing references, preserve order within
playable and non-playable partitions, and apply Web’s six-row cap only after partitioning. Android
keeps the complete resolved month list.

The initial listening suggestion is the first real playable seasonal song, then the first playable
manifest song. Never fabricate progress, popularity, dates, counts, or recording identity. A
currently loaded shared-player item always wins over that suggestion.

## Visual Tokens

Keep the Gaura/Shyam semantic palette and 5th Avenue display face. Home may define named, scoped
surface roles for its near-white canvas, raised neutral cards, dark navy focal card, quiet borders,
topic fills, and author swatches; component code consumes those names rather than scattering raw
values. Song and verse text continue to use script-capable system fonts.

Cards use restrained borders and shadows. The Season dial is abstract calendar/rhythm geometry,
not a spinner, equalizer, sacred diagram, or progress indicator. It is decorative and hidden from
assistive technology. Real book covers and performer portraits retain graceful fallbacks.

## Interaction And Motion

Home motion is quick state feedback, never spectacle:

| Token | Duration | Use |
|---|---:|---|
| Press | 90 ms | Glyph-only press response where the platform does not provide native indication. |
| Release | 140 ms | Return from a pressed glyph state. |
| Selection/icon | 160 ms | Play, pause, retry, loading, and current-take state changes. |
| Panel enter | 180 ms | Existing Web recording picker. |
| Panel exit | 120 ms | Existing Web recording picker dismissal. |

Cards and rows stay spatially fixed. Do not animate progress width, month/date changes, card
position, radius, cover scale, or topic elevation. No loops, parallax, marquees, delayed commands,
or scroll-triggered reveals are added on Home.

Reduced motion removes custom transforms and transitions. State and color changes remain immediate;
focus remains visible. Android uses stock indication and respects the system animator-duration
scale. iOS uses `accessibilityReduceMotion`. Web uses `prefers-reduced-motion`.

## Accessibility

- Exactly one page heading remains exposed at every width, even when the visual mobile masthead is
  represented by the app shell.
- Decorative marks, artwork, and initials are hidden from assistive technology.
- Interactive icons have complete action labels and state descriptions.
- Primary Web controls are at least 44 × 44 CSS px; compact text links are at least 24 px high.
- Native targets are at least 44 pt on iOS and 48 dp on Android.
- Text meets WCAG 2.2 AA contrast, focus is visible, and keyboard/VoiceOver/TalkBack order follows
  the semantic order above.
- At 200% text and 400% Web zoom, content reflows without clipping or horizontal page overflow.

## Verification

Capture both palettes at compact, medium, and expanded widths, plus listening states, empty and
intercalary months, enlarged text, and the complete native featured reading. Verify Web lint, build,
unit tests, and Playwright; Android debug assembly, unit tests, and Roborazzi; iOS simulator build,
unit/UI tests, Dynamic Type, VoiceOver labels, and Reduce Motion when a compatible macOS runner is
available.

## Change Log

- **v6** — Replaces v5’s homogeneous feed with a reference-led modular canvas; adds a real
  shared-player listening card, dark month dial, image-led books, compact discovery modules, and
  consistent quick icon-state motion.
- **v5** — Earlier editorial/feed concept, superseded in full by v6.
