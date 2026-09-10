# Screen — Audio Player

**Spec version:** 15

**Figma frames:** `Now Playing`, `Player`, `Track`, `trailingIcon2_`.

## Purpose

Plays a song's recording. Many songs carry audio (`audio_available = true`), and
[song-detail](song-detail.md) shows a play affordance for them — this screen is what it opens.
Streaming, with graceful handling when a track can't load.

## Audio source — the base URL (PLACEHOLDER)

Each [AudioTrack](../data/song.md) is `{ uid, filename, artist? }` (e.g. `A10-bvsm-1.mp3`). The files
live on the **public `gaudiyakirtan` S3 bucket** (`audio/` prefix, no auth). The playable URL is:

```
AUDIO_BASE_URL = "https://gaudiyakirtan.s3.amazonaws.com/audio/"
playableUrl    = AUDIO_BASE_URL + filename        // e.g. .../audio/A10-bvsm-1.mp3
```

Keep `AUDIO_BASE_URL` as a **single config constant** per platform (`web/src/config.ts`, iOS
`AudioConfig.swift`, Android `AudioConfig.kt`/`BuildConfig`) — real value above, easy to change.
Related assets on the same bucket (for later): artist portraits `artists/<artist_code>.jpg`,
collection covers `collections/<name>.jpg`.

Playback still **degrades gracefully** on any load failure (network off, missing take) — clear
"audio unavailable" state, never crash.

## Data bindings

- The song's `audio_files` — **a song may have multiple takes** (up to ~9, different artists/renditions;
  rebuilt from the bucket). Default to the first; expose a take/artist selector when `> 1`. Bind each
  `filename` → URL and show `artist` for the now-playing credit.
- Song title (in the reader's script) + author for the now-playing display.

## Layout & regions (per the frames)

- **Now Playing / Player:** artwork/placeholder, song title, author + `artist`, a **play/pause**
  control, a **scrubber** (position / duration), and skip controls (dormant until multi-recording).
  On **iOS/Android** this is the full surface described in "Now Playing (mobile)" below.
- **Mini-player / Track** (`Track`, `trailingIcon2_`): a compact bar (title + play/pause) that can
  sit above the tab bar while a track is loaded, tappable to expand to Now Playing. **It does not
  appear on song-detail** — see "The reader gets a pill, not a bar".

## The reader gets a pill, not a bar (mobile, v14)

On [song-detail](song-detail.md) the mini-player bar is **suppressed**. Two things claimed the bottom
of the reading screen — the bar and the reader's own scroll — and a full-width bar is a heavy piece
of furniture on the one screen whose job is uninterrupted reading. Instead:

- The song screen's **top toolbar carries a now-playing pill**: a compact capsule between the back
  button and the "Aa" display control, showing small artwork/note, the **title** and **reciter** of
  what is playing, and a play/pause affordance.
- **Tapping the pill body opens Now Playing as a modal**; tapping the play/pause affordance inside it
  toggles playback without opening anything. The two hit targets are distinct.
- The pill is bound to the **player**, not to the page: if a different song is playing, the pill shows
  *that* song. When nothing is loaded and the song being read has audio, the pill is the screen's
  **play affordance** for that song (it starts the song's first take, per song-detail's "play"
  interaction) — one control, two states, so the toolbar never grows a second button.
- When the song has no audio and nothing is playing, the pill is absent and the toolbar keeps its
  existing back / "Aa" layout.
- Everywhere **outside** song-detail the mini-player bar behaves as before (above the tab bar).

## The mini-player is never empty (mobile, v15)

Outside [song-detail](song-detail.md), the mini-player slot has **two** states, and the slot itself
never disappears once the reader has opened a single song. Nothing about the app changes size when
playback starts or stops.

| State | When | What it shows |
|-------|------|---------------|
| **Playing** (the track state) | a take is loaded — playing, paused, loading or errored | the existing bar: artwork, title, the **reciter**, and a play/pause control |
| **Last visited** (the resting state) | nothing has ever been loaded this session, but a song was opened | the **same bar, same height**: artwork, title, the song's **author** — and a **play affordance**, not a transport |
| *(absent)* | a fresh install where no song has been opened yet | nothing — there is genuinely nothing to resume |

The point is that the reader's last song is one tap away from anywhere in the app, and that the
place it lives doesn't move. Precedence is simple: **whatever is loaded in the player wins**; the
last-visited song only fills the slot when the player is empty.

### It is not a track

The resting state deliberately does **not** pretend to be playback:

- No scrubber, no elapsed/remaining, no transport pair. A single **play** affordance, because the
  only thing you can do to a song that isn't loaded is start it.
- The credit line is the song's **author** (the composer), not a reciter — no take is chosen yet, so
  there is no reciter to name. This is the one place the two differ; see
  [tracks.md](tracks.md) "reciter vs author".
- Tapping it **starts the song's first take**, which promotes the slot into the playing state.
  It does not open Now Playing — an empty player has nothing to show.
- Songs with `audio_available = false` still occupy the slot (the reader was there, it is still the
  way back to it), but the play affordance is replaced by an open-song chevron.

### Persistence

One record, written when song-detail opens a song, holding the **uid only** — every platform can
rehydrate title/author/audio from the bundled corpus, so nothing denormalized can go stale against a
pipeline resync.

- **iOS:** `UserDefaults`, key `player.lastVisitedSongUid`, alongside the existing `reader.*` keys.
- **Android:** the same `SharedPreferences` store the settings use, key `last_visited_song_uid`,
  exposed as a `StateFlow` so the bar reacts without a restart.
- **Web:** already has this shape in `gk.recents` (`utils/useRecents.ts`) — mobile is not obliged to
  match its 10-entry history; one uid is enough for this surface.

Reading history is **device-local and never transmitted**, matching the posture `useRecents.ts`
already documents.

**It never autoplays.** Restoring a song into the slot is a convenience, not a request for sound —
the same rule web's resume already follows ("restores paused, never autoplays"). A cold start shows
the resting state and stays silent.

Storage failures are swallowed on every platform: a missing or unparsable record means the slot is
absent, never a crash.

## Now Playing (mobile, v14)

Now Playing is a **modal** on both platforms — iOS a `.sheet`, Android a `ModalBottomSheet` — not a
pushed navigation destination. It is a transient surface over whatever you were reading, and it must
return you there untouched: dismissing it never stops playback and never pops the reader.

Layout, top to bottom (a full-bleed portrait surface in the "large artwork, big transport" idiom):

1. **Drag/dismiss affordance** and a **context caption** — a small uppercase line naming where the
   audio came from ("PLAYING FROM SONG", or the book/topic when a collection queue exists) over the
   song title in small type.
2. **Artwork** — a large rounded square, as wide as the screen minus a generous margin, from
   `artists/<artist_code>.jpg`. Most portraits 404; the placeholder (surface fill + note glyph) is the
   normal case, not an error, and must look deliberate.
3. **Title / credit row** — the song title large and bold, the **reciter** (`audio_files[].artist`,
   not the composer — see [tracks.md](tracks.md) "reciter vs author") beneath it in muted type, with
   the composer as the fallback when a take carries no artist.
4. **Scrubber** — a draggable track with **elapsed on the left and remaining (`-m:ss`) on the right**.
   Remaining, not total: it answers the question a listener actually has. While dragging, the elapsed
   label follows the thumb and the seek is committed on release.
5. **Transport row** — five controls on one line, the play/pause a large filled circle in the middle,
   flanked by previous/next, flanked by **shuffle** and **repeat**. Previous/next step through the
   song's **takes** (`audio_files`); previous restarts the current take when more than ~3 s in,
   matching the universal convention. Shuffle and repeat render **enabled-but-inert-looking** (muted)
   rather than disabled on single-take songs, so the row never reflows between songs.
6. **Actions row** — take/recordings picker (showing the take count), share, and the queue.

**Shuffle and repeat** operate over the song's takes, the only queue mobile has:

| Setting | Values | Behavior at end of take |
|---------|--------|-------------------------|
| `repeatMode` | `off` · `all` · `one` | `one` → replay this take. `all` → next take, wrapping past the last. `off` → next take, **stopping** after the last. |
| `shuffle` | on/off | When on, "next" draws from a shuffled permutation of the takes rather than their listed order. Turning it off restores listed order from the current take. |

Precedence at end of track, mirroring web's `resolveTrackEndAction`: **repeat-one** wins over
everything; then the shuffle/repeat-aware next take; otherwise stop. Keep this decision in a **pure,
unit-tested function** with no `AVPlayer`/`MediaPlayer` in sight — web does the same and it is the
only part of playback that can be tested without a device.

**States** are unchanged (idle / loading / playing / paused / error). The error state keeps the whole
layout and replaces the transport with the "audio unavailable" message, so a failed take doesn't
collapse the screen.

## States

- **Idle** (nothing loaded), **loading**, **playing**, **paused**.
- **Error / unreachable** (expected with the placeholder URL): a clear "audio unavailable" message;
  never crash or spin forever. Also covers real offline-with-no-download.
- Play affordances appear only when `audio_available`.

## Interactions

- song-detail play button → start this song's track + open/raise the player (replaces the stub).
- Play/pause, scrub, seek. Continues while navigating (mini-player) — a global playback service, not
  per-screen state.

## Per-platform notes

- **iOS:** `AVPlayer` (AVFoundation) behind a shared `AudioPlayerService` (ObservableObject);
  a `PlayerView` (Now Playing) + a mini-player. `AudioConfig.swift` holds `AUDIO_BASE_URL`.
  The mini-player is mounted **on each tab's `NavigationView`** via `.safeAreaInset(.bottom)` — not
  once on the root `TabView`, whose bottom inset is laid out against the window's safe area and so
  draws the bar over the tab bar (measured on iOS 26.5). A tab's own stack has the tab bar, and the
  keyboard, in its safe area, so the bar sits on the tab bar and flush on the keyboard with no
  measured offset. Song-detail suppresses it through a published record on the player service —
  *which tab* it is on, set on appear and cleared on disappear — rather than by trying to remove a
  parent's inset; in compact width the same record hides that tab's tab bar, because song-detail's
  own `.toolbar(.hidden, for: .tabBar)` does not restore it on pop on iOS 26. Now Playing is already
  a `.sheet` (`isExpanded`). It draws its own grab handle rather than using
  `.presentationDragIndicator(.visible)`, which needed iOS 16 when the deployment target was 15.6.
- **Android:** `ExoPlayer`/Media3 (or `MediaPlayer`) behind a player `ViewModel`/service; a
  `PlayerScreen` + mini-player. `AUDIO_BASE_URL` in `AudioConfig.kt` or a `BuildConfig` field.
  The mini-player lives in the `Scaffold`'s `bottomBar`, so song-detail is excluded there by route.
  Now Playing moves off its `NavHost` route into a `ModalBottomSheet` hosted at the navigation root,
  so it can be raised from any screen without a back-stack entry.
- **Take-end logic (both):** `resolveTakeEndAction(repeatMode, shuffle, takes, currentTakeUid, order)`
  — a pure function returning *replay* / *play take X* / *stop*, unit-tested with no player object.
- **Web (unified mini-player, `PlayerWidget.tsx`):** an `<audio>` element behind `PlayerContext`,
  surfaced by a **single** sticky control in the bottom-right that **morphs** (framer-motion) between
  a circle and a card. It is **hidden entirely on non-song pages unless a track is loaded/playing**
  (a song page "arms" its song via `PlayerContext.arm()`, so the FAB shows there; elsewhere nothing
  until playback starts). States: *idle (armed)* → a compact circular play FAB; *loaded* → a
  mini-player **card** with artwork, **song title** (two lines → **marquee** when longer,
  `MarqueeTitle`), an **open-song** arrow (`ArrowUpRight`) that participates in the title's inline
  text flow like its final character—attached to the final glyph on the final rendered line, never
  aligned independently at the top or far edge of the title column—the
  recording's **reciter** (not the composer), a **scrubber** with times, and a
  control row (Lucide icons) — **loop / continue-playing / sleep-timer / download / share**, plus a
  stacked-avatar **recordings** picker (`RecordingPickerButton`) and a **minimize** button;
  *collapsed (while playing)* → back to a circle. The extra controls:
  - **Open song** — the title-row arrow navigates directly to `/songs/<playing-song-uid>` with
    client-side routing, preserving the active player session. It always targets the song loaded in
    the player, not a different `armedSong` from the page being read and not an arbitrary browser
    history entry. It remains available when the recording is in the error state because the song
    text is still useful. The control appears only on the expanded loaded card, where the title is
    visible; the armed idle FAB and collapsed circle do not duplicate it. Its accessible label and
    tooltip include the displayed song title, with a generic fallback if that rendering is empty.
    The icon sits in a clipped, icon-sized viewport. On hover or keyboard focus, Framer Motion sends
    the glyph out toward the upper-right and brings it back from the lower-left; reduced-motion
    preferences disable that movement.
  - **Continue-playing** (`autoContinue`, default **on**) — when the current take ends, rolls on to
    the next take of the same song. Disabled (not hidden) on single-take songs so the control row
    doesn't reflow between songs. Precedence: `loop` wins over continue.
  - **Sleep timer** — a drop-up of minute presets + "End of track"; the button shows the remaining
    `mm:ss` (or "End"). Backed by `services/sleepTimer.ts`.
  - **Book/topic queue** — when a book or topic page arms a *queue* (`queueContext`), the card grows
    **previous / next** transport around the play button. The pair is rendered off whether it can
    actually *move* (`canPrevious || canNext`), not off whether a queue exists — the queue is armed
    by whichever page is open while the buttons act on the *playing* song, and when those disagree
    the old check drew two permanently-dead arrows (see v10). The queue is *not* otherwise labelled
    on the card (see v9).
  - **Keep playing (endless)** — on (the default), playback never stops on its own: the song's other
    **takes** first, then its **book/topic** in order, then **any other song with audio**, forever.
    The pool is the build-time `/search-listings.json` filtered to `audioAvailable`, fetched once and
    only while the toggle is on; the pick is random so a long unattended session doesn't march
    through the corpus in uid order. Endless is strictly *last* in `resolveTrackEndAction` — it never
    pre-empts a song's own takes or its collection order, and still yields to an end-of-track sleep
    timer and to repeat-one. With it on, **next** also skips past the end of a queue.
  - **"Play this" strip** — when a take is playing but the reader has navigated to a *different*
    song's page (which armed itself), a strip switches playback to the song being read. It is
    **tucked behind the card's top edge** — inset horizontally, rounded on top only, its lower edge
    hidden behind the card — so it reads as part of the player rather than a second floating
    control. It renders **only on the expanded card**: collapsing is a deliberate "get out of my
    way", so the circle stays a bare circle (as a free-floating pill it covered ~190px of a phone
    screen). See v10.
  - **Layering** — the widget is **page furniture, not an overlay**: it sits in the page layer of
    the shared scale in [`navigation.md`](navigation.md#layer-order-web), above content and the
    mobile header, *below* the mobile navigation scrim. So opening the mobile menu dims the player
    along with the rest of the screen in every state (card, circle, armed FAB, "Play this" strip),
    the widget goes inert for pointer and keyboard while the drawer is open, and any open drop-up
    closes. Playback, position and collapse state are untouched by all of this — closing the drawer
    hands back exactly the player that was there.
  - **Share** copies a deep link `/songs/<uid>?play=<trackUid>` (or the Web Share sheet); the song
    page reads `?play=` and cues+plays that take — autoplay-blocked degrades to *paused/cued*, not
    error. **Download** fetches the mp3 as a blob (falls back to opening the S3 URL — the bucket
    sends no CORS/Content-Disposition). Loop → `audio.loop`. `AUDIO_BASE_URL` in `web/src/config.ts`.
- **Offline download** of tracks is a later enhancement — this slice is streaming + graceful errors.

## Playback internals (web)

- **Track-end priority chain** (`services/playerQueue.ts` `resolveTrackEndAction`, unit-tested with
  no DOM). When a take ends, exactly one action fires, in order:
  1. **Sleep "end of track"** armed → **stop** (an explicit request for silence must not be pre-empted).
  2. **Loop** → **repeat** the same take.
  3. **Continue-playing** and another take exists → **next take** of the same song.
  4. An armed **book/topic queue** has a next song → **advance** to it (`router.push` + a one-shot
     `consumeAutoplay(uid)` handshake — no full-song data crosses the context on a static site).
  5. Otherwise → **stop**.
- **Media Session** (`navigator.mediaSession`, feature-detected): sets `MediaMetadata`
  (title/artist/artwork), keeps `playbackState` in sync, wires play/pause/seek/next/previous handlers,
  and reports `setPositionState({ …, playbackRate: 1 })` — so OS lock-screen / headset controls drive
  playback. Rate is a constant `1` (see the removed speed control in the change log).
- **Resume** (`services/resume.ts` + `gk-player-resume` in `localStorage`): position is saved at most
  every 5 s and, on next load, restored by `onLoadedMetadata` into a **paused** state — it **never
  autoplays**. Storage failures are swallowed (resume is a convenience, never worth throwing over).

## Verification

- **Behavioral:** with a *test* URL (or a stubbed reachable file), play/pause/scrub work and the
  now-playing shows title/author/artist; with the placeholder URL, the error state shows cleanly (no
  crash). The song-detail play button opens the player and starts the track. From another route,
  the title-row open-song arrow returns to the loaded song's canonical detail route without
  replacing the player session; it still targets the loaded song when the page has armed a
  different one. Build/typecheck green.
- **Visual:** matches `Now Playing` / `Player` / `Track` frames. For both one- and two-line titles,
  the open-song arrow begins no more than 8 px after the title's final glyph and shares the final
  line; long titles retain their bounded two-line/marquee behavior. Its hover/focus animation is
  clipped to the icon viewport and does not disturb title layout.

## Change log

- **v15 (iOS + Android)** — **The mini-player slot stopped being empty.** It only existed while a
  take was loaded, so it appeared and vanished under the reader and there was no way back to the last
  song from elsewhere in the app. It now has a **resting state**: when nothing is loaded but a song
  has been opened, the same bar shows that song — artwork, title, **author** (no take is chosen, so
  there is no reciter to name) — with a single **play** affordance and no transport, so it can't be
  mistaken for playback. Whatever is loaded in the player always wins; the resting state only fills
  the gap. Backed by one persisted **uid** (`player.lastVisitedSongUid` / `last_visited_song_uid`),
  rehydrated from the bundled corpus so nothing can go stale, device-local, and it **never
  autoplays**. *(iOS per-platform note corrected during simulator verification, same version: the
  bar mounts per tab, not on the root `TabView` — the contract above is unchanged.)*
- **v14 (iOS + Android)** — **The reader lost the bottom bar and gained a pill.** The mini-player is
  now suppressed on [song-detail](song-detail.md); the song screen's top toolbar carries a compact
  **now-playing pill** instead, bound to the player (not the page), whose body opens Now Playing and
  whose inner control toggles playback. With nothing loaded it doubles as the screen's play
  affordance, so the toolbar gains no second button. **Now Playing became a modal** on both platforms
  (iOS `.sheet` + drag indicator, Android `ModalBottomSheet` hosted at the nav root instead of a
  pushed route) and was **redesigned** into the large-artwork/big-transport idiom: context caption,
  full-width square artwork, title + reciter, a scrubber showing **elapsed / remaining** rather than
  elapsed / total, a five-control transport row (shuffle · previous · play · next · repeat), and an
  actions row. **Previous/next stopped being dead stubs** — they step through the song's takes, with
  previous restarting the current take past ~3 s. **`shuffle` and `repeatMode` (`off`/`all`/`one`)
  are new player state**, resolved at end-of-take by a pure `resolveTakeEndAction` that is unit-tested
  without a player object (the same split web uses for `resolveTrackEndAction`).
- **v13 (web)** — Placed the widget explicitly in the shared layer scale
  ([navigation.md](navigation.md#layer-order-web) v3). It had outranked the mobile drawer's scrim,
  so a loaded mini-player stayed lit and clickable above the dim while the menu was open. It now
  dims with the page in every state, goes inert while the drawer is open, and closes its drop-ups —
  with no change to playback, position or collapse state.
- **v12 (web)** — Made the open-song arrow a true inline suffix of the title, including two-line
  titles, rather than a flex sibling aligned to the title box. Added a clipped Framer Motion
  upper-right exit / lower-left return animation on hover and focus, with reduced-motion support.
- **v11 (web)** — Added a compact **open-song** `ArrowUpRight` beside the expanded mini-player
  title. It uses the loaded player's uid for a deterministic client-side link to the canonical song
  detail route, so it cannot accidentally follow browser history or jump to a different song armed
  by the current page. The action remains present when audio is unavailable, closes any player
  drop-up before navigation, and is omitted from the title-less idle/collapsed circles.
- **v10 (web)** — **Continue-playing became "Keep playing" (endless).** It previously only rolled on
  to the next *take*, so a single-take song, or the last song of a book, stopped dead. It now falls
  through to any other song with audio and never stops on its own (`pickEndlessSong` +
  `endlessNextSongUid`, last in the priority order so takes and collection order still win). No
  longer disabled on single-take songs. **Dead transport arrows fixed:** previous/next were rendered
  from `queue` (armed by the open page) but enabled from the *playing* song, so reading song B while
  song A played drew two arrows that could never move; they now render off `canPrevious || canNext`,
  and `next` skips onward via endless play when a queue runs out. **Tooltips** added to every player
  control (all 10 buttons + the recordings picker) so hovering explains each icon.
  Also: the **"Play this" chip became a tucked strip.** It was a full-width pill floating
  *above* the widget; stacked over the card it covered ~190px of a 390px-wide phone screen and read
  as a second, competing player. It now sits **behind** the card's top edge (inset `mx-3`,
  `rounded-t-2xl`, lower edge overlapped by the card) as one visual unit, and is **gated on the
  expanded state** so a collapsed player is a bare circle again. Also toned down from the solid
  `--highlight` fill to the card's own surface with a `--highlight` play glyph, since it is a
  secondary action next to the transport.
- **v9 (web)** — Removed the "**Playing from** \<collection\> · N of M" line from the card. The
  collection breadcrumb duplicated context the reader already had (they arrived from that book/topic
  page) and competed with the title/reciter for the card's two legible lines. The **queue itself is
  unchanged**: previous/next transport still appears whenever a collection page arms one, and
  `queuePosition` remains on the context for any future surface — it simply has no UI consumer now.
- **v8 (web)** — Documented the playback internals that shipped with the audio batch: the
  `resolveTrackEndAction` priority chain (sleep-end > loop > next-take > queue-advance > stop), the
  **Media Session** integration (lock-screen/headset controls; constant rate 1), and localStorage
  **resume** (restores paused, never autoplays). A **playback-speed** control was briefly added then
  **removed** (it wrapped the ~330 px control row and offered little for sung kīrtana); Media Session
  now reports a fixed rate of 1.
- **v7 (web)** — Reconciled the spec with the shipped widget after several additions landed together:
  a **continue-playing** toggle (`autoContinue`, default on — advances to the next take when the
  current ends, `loop` taking precedence); a **sleep timer** (minute presets + end-of-track,
  `services/sleepTimer.ts`); a **book/topic queue** (`queueContext`) adding previous/next transport
  and a "Playing from …" line when a collection page arms one; and a **"Play this" chip** for when
  the reader is on a different song's page than the one playing. Also corrected the Web bullet, which
  had drifted to v4 (it still claimed the reciter/recordings picker was removed — v5 restored it).
- **v6 (web)** — Stronger morph: springier transition + a cross-fade (`AnimatePresence` scale/opacity)
  between circle and card. The **recordings** control now shows a **stacked cluster of singer avatars**
  (up to 3 distinct artists, overlapping, ringed) + the take count, and the **minimize** button moved
  down **next to it** in the control row (off the top row). Added an `Avatar` (ringed photo + note
  fallback).
- **v5 (web)** — The widget now **morphs** (framer-motion `layout`) between the circle and the card
  instead of swapping. Added a **collapse** (minimize) button on the card and an **expand** button on
  the collapsed circle, so a playing session can be minimized to a circle and restored. **Restored the
  recordings/take picker** as a drop-up (list button shows the take count) — the mini-player again lets
  you switch a song's recordings; the primary text stays song title + author. (Hooks reordered before
  the early return — React #310.)
- **v4 (web)** — Smaller FAB; widget hidden on non-song pages unless playing; removed the hover
  scale-jump; controls are now **loop / download / share** (volume removed); reciter drop-up removed;
  all icons migrated to **Lucide** (the cross-platform pack). Loop + volume state added to
  `PlayerContext`; download via blob-with-open-fallback.
- **v3 (web)** — Mini-player card: artwork, 2-line/marquee title, author, scrubber, loop/volume/share;
  share deep link `?play=`; autoplay-block → paused/cued.
- **v2 (web)** — Consolidated the three player surfaces into one animated bottom-right widget
  (`PlayerWidget.tsx`): idle FAB → left-expanding pill (portrait / singer / song) → drop-up reciter
  selector. Removed `MiniPlayerBar`, `NowPlayingPanel`, `SongPlayerButton`; added `armedSong`/`arm`
  to `PlayerContext` so the corner FAB starts the open song. Mobile/iOS/Android keep the v1 layout.
- **v1** — Initial spec: streaming player bound to `audio_files` (`{uid, filename, artist}`), URL =
  `AUDIO_BASE_URL + filename` with `AUDIO_BASE_URL` as a placeholder config constant; Now-Playing +
  mini-player, full state machine incl. a graceful unreachable/error state, global playback service.
