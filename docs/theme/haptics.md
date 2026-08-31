# Haptics — cross-platform feel

**Spec version:** 1 · **Status:** the seek rail is implemented (player.md v16); everything below the
first table is **proposed**, not built.

Haptics are the third channel, after color and motion, for saying *something happened*. This doc is
the shared vocabulary so the two native apps feel like one product rather than two apps that each
invented their own buzz. Web has no equivalent capability and is out of scope.

## The rule

**A haptic marks a state change the user caused.** If nothing changed, or the user didn't cause it,
it must stay silent. That single rule is what keeps a haptic app from becoming a noisy one, and it
is the thing to check first in review.

Corollaries worth stating, because they are where this usually goes wrong:

- **Never on arrival of content.** A list loading, audio buffering, or artwork resolving is not the
  user's doing. Feedback there reads as a malfunction.
- **Never as decoration.** A tick that does not correspond to a discrete change is noise, and noise
  trains people to turn haptics off system-wide — which costs the affordances that *were* earning
  their keep.
- **Silence is a valid design.** Most taps need nothing; the visual response is already immediate.
  Reserve feel for the cases below.
- **Never gate it behind an app setting.** Both platforms already expose a system-level haptic
  preference and honour it inside `performHapticFeedback` / the Taptic Engine; iOS additionally
  silences haptics in Low Power Mode. An in-app toggle would be a second, worse switch.
- **Accessibility gets one confirmation, not a stream.** VoiceOver, TalkBack, Switch Control, and
  keyboards commit one value at a time. Feeding them the continuous ladder is both wrong and
  unpleasant.

## Implemented — the seek rail (player.md v16)

The rail's ruler *is* the haptic ladder: a short mark every 1/32 of the recording, a tall one every
1/8, and a tick as the finger crosses each, so the mark under the finger is the mark it feels.

| Moment | iOS | Android (API 34+) | Android (below 34) |
|---|---|---|---|
| Finger lands on the rail | `.rigid` impact @ 0.7 | `GestureThresholdActivate` | `ContextClick` |
| Minor detent (1/32) | `UISelectionFeedbackGenerator` | `SegmentFrequentTick` | `TextHandleMove` |
| Major detent (1/8) | `.light` impact @ 0.55 | `SegmentTick` | `TextHandleMove` |
| 0:00 or the end | `.soft` impact @ 1.0 | `GestureEnd` | `ContextClick` |
| Seek commits | `.soft` impact @ 0.6 | `GestureEnd` | `KeyboardTap` |

Shared arithmetic (iOS `ScrubHapticLadder`, Android `scrubTick`), unit-tested on both. Ticks are
rate-limited to 18 ms so a flick notches instead of rattling; boundaries fire on arrival, not while
held. Full contract in [`../screens/player.md`](../screens/player.md).

The reason the segment vocabulary matters: `SEGMENT_TICK` / `SEGMENT_FREQUENT_TICK` arrived in API
34 and are the only Android constants actually tuned for a notched drag. Below 34 the platform
ignores them outright, so the rail falls back to `TEXT_HANDLE_MOVE` rather than going silent on most
in-market devices. `AlphabeticalScrollBar` already used that constant; this is the same trade.

---

# Proposed

Ordered by value per unit of risk. Each is a slice that can ship alone.

## 1. The A–Z scroll index — finish what's there

`AlphabeticalScrollView` (iOS) and `AlphabeticalScrollBar` (Android) already tick per letter, and
they are the closest existing thing to the rail. Two gaps:

- iOS builds a **new `UIImpactFeedbackGenerator` per letter** inside the drag handler and never
  calls `prepare()`. That is the documented way to get late, inconsistent haptics: the engine spins
  up cold on each tick. It should hold one prepared generator for the gesture, exactly as
  `ScrubHapticEngine` does.
- Neither has a **boundary** feel at A and Z, so it is impossible to tell by feel that you have run
  out of list.

Also worth aligning: Android uses `TextHandleMove` where the rail now uses the segment vocabulary on
API 34+. Same gesture shape, so it should get the same treatment.

## 2. Transport controls

The strongest candidate after the rail, because play/pause is the app's primary action and its state
change is real.

| Action | Feel | iOS | Android |
|---|---|---|---|
| Play | a rising confirmation | `.soft` impact @ 0.6 | `ToggleOn` |
| Pause | a softer, lower one | `.soft` impact @ 0.4 | `ToggleOff` |
| Next / previous recording | one crisp tick | `.light` impact | `SegmentTick` |
| Wrapping past the last recording | boundary — you looped | `.rigid` impact @ 0.8 | `ContextClick` |

The wrap case earns its place: the transport already wraps at the ends, and today nothing tells you
that you have come back around to the first recording other than reading the title.

## 3. Take / recording picker

Selecting a different recording of the same song swaps artwork, reciter, and rail seed. That is a
substantial change presented quietly.

- Committing a selection → `UISelectionFeedbackGenerator` / `ToggleOn`.
- Selecting the take that is already playing → **nothing**. No state changed, so per the rule it is
  silent. This is the case most likely to be got wrong.

## 4. Pull-to-refresh and over-scroll on the library lists

- Crossing the refresh threshold → `GestureThresholdActivate` / `.rigid`. Fire on **crossing**, and
  once — the same arrival-not-held discipline the rail's boundary uses.
- Release below the threshold → nothing. Nothing happened.

## 5. Search

- Committing a query from the command palette → `.light` / `KeyboardTap`.
- **A query that returns nothing** → `Reject` on Android, `UINotificationFeedbackGenerator(.warning)`
  on iOS. This is the one genuinely informational haptic in the set: it tells you the search ran and
  found nothing, which is otherwise indistinguishable from the search not having run.
- Per-keystroke feedback → never. The keyboard already provides it.

## 6. Destructive and irreversible actions

Downloads cleared, offline audio deleted. `UINotificationFeedbackGenerator(.warning)` / `Reject` on
the confirm step — not on opening the dialog. Long-press to enter a selection mode uses the platform
`LongPress` and nothing custom.

## Pairing haptics with motion

A haptic lands when it agrees with what the eye sees; the two are one event, not two.
[`../screens/theme.md`](../screens/theme.md) already asks each screen for **one** principal
expressive focal element, and that element is the one that should carry feel.

- **Co-time them.** The tick belongs at the frame the animation commits, not at gesture start and
  not at animation end. A tick that leads its animation reads as a glitch.
- **The player's wavy↔flat scrubber morph** (theme.md "Motion") is the focal element and already
  marks play/pause; §2's toggle feels should fire on the same frame the morph starts, so the
  transport reads as one event across both channels.
- **Springs, not eases, where a haptic is involved.** A spring settling gives the finger something to
  agree with. On Android this is `MotionScheme.expressive()`; on iOS, `.snappy`/`.bouncy`.
- **Reduce Motion does not imply reduce haptics.** They are separate system preferences and each is
  honoured on its own. When motion is suppressed the haptic often becomes *more* valuable, because
  it is carrying feedback the animation no longer is — so do not helpfully disable both.

## Verification

The pure ladder arithmetic is unit-testable and should stay that way — that is what
`ScrubHapticsTests` / `ScrubHapticsTest` lock, on both platforms, including the invariant that the
two ladders agree. What cannot be asserted in a unit test is whether it *feels* right, so each slice
above needs a pass on real hardware: **the simulator and emulator have no actuator**, and Android's
API 34+ segment constants are exactly the ones that no-op on the emulator and on older phones.

Minimum device check per slice: one iPhone, one API 34+ Android phone, one below 34 — the last to
confirm the fallback still fires rather than going silent.

## Change log

- **v1** — Established the vocabulary and the "marks a state change the user caused" rule from the
  seek rail's implementation (player.md v16), and proposed the A–Z index repair, transport, take
  picker, pull-to-refresh, search, and destructive-action slices.
