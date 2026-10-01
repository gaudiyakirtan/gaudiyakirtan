# Home v7 UI and motion research

**Reviewed:** October 1, 2026

## Sources

- Apple Human Interface Guidelines, Motion:
  <https://developer.apple.com/design/human-interface-guidelines/motion>
- Apple Human Interface Guidelines, SF Symbols:
  <https://developer.apple.com/design/human-interface-guidelines/sf-symbols>
- Material Design 3, Motion:
  <https://m3.material.io/styles/motion/overview>
- Material Design 3, State layers:
  <https://m3.material.io/foundations/interaction/states/state-layers>
- Material Design 3, Layout:
  <https://m3.material.io/foundations/layout/understanding-layout/overview>
- web.dev, High-performance CSS animations:
  <https://web.dev/articles/animations-guide>
- W3C, WCAG 2.2 Understanding 2.3.3:
  <https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html>
- Nielsen Norman Group, Visual Hierarchy in UX:
  <https://www.nngroup.com/articles/visual-hierarchy-ux-definition/>
- Nielsen Norman Group, Executing UX Animations:
  <https://www.nngroup.com/articles/animation-duration/>
- Nielsen Norman Group, Flat Design and Clickability:
  <https://www.nngroup.com/articles/flat-design-long-exposure/>

## Findings Applied

- The primary task must receive the strongest contrast, scale, and surrounding space.
- Secondary information should use proximity and rules before adding another container.
- Interactive elements need visible resting signifiers; hover cannot be the only clue.
- Press feedback should begin immediately, while common microinteractions finish near 100–200 ms.
- Motion should explain destination, continuity, or state. Decorative looping and scroll spectacle
  increase distraction without improving comprehension.
- Transform and opacity are the preferred Web animation properties.
- Reduced-motion users retain state changes through text, color, and immediate icon replacement.
- Platform navigation and controls remain native; only the shared intent and timing vocabulary are
  cross-platform.

## Resulting Decisions

- The featured song owns the one expressive surface and the explicit **Read & sing** action.
- Season becomes compact context beside or below the recommendation.
- The decorative month dial, progress duplication, colored topic blocks, author initials, and book
  collage are removed.
- Books provide the page's real visual texture through complete cover artwork.
- Links use state layers plus directional icon movement. Playback uses an in-place icon transition.
- Repeated rows never lift or scale. The only scale feedback belongs to standalone primary controls.
