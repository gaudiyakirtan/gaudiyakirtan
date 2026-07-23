# Screen — Audio Player

**Spec version:** 1

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
- **Mini-player / Track** (`Track`, `trailingIcon2_`): a compact bar (title + play/pause) that can
  sit above the tab bar / in the reader while a track is loaded, tappable to expand to Now Playing.

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
- **Android:** `ExoPlayer`/Media3 (or `MediaPlayer`) behind a player `ViewModel`/service; a
  `PlayerScreen` + mini-player. `AUDIO_BASE_URL` in `AudioConfig.kt` or a `BuildConfig` field.
- **Web (unified mini-player, `PlayerWidget.tsx`):** an `<audio>` element behind `PlayerContext`,
  surfaced by a **single** sticky control in the bottom-right that **morphs** (framer-motion) between
  a circle and a card. It is **hidden entirely on non-song pages unless a track is loaded/playing**
  (a song page "arms" its song via `PlayerContext.arm()`, so the FAB shows there; elsewhere nothing
  until playback starts). States: *idle (armed)* → a compact circular play FAB; *loaded* → a
  mini-player **card** with artwork, **song title** (two lines → **marquee** when longer,
  `MarqueeTitle`), the recording's **reciter** (not the composer), a **scrubber** with times, and a
  control row (Lucide icons) — **loop / continue-playing / sleep-timer / download / share**, plus a
  stacked-avatar **recordings** picker (`RecordingPickerButton`) and a **minimize** button;
  *collapsed (while playing)* → back to a circle. The extra controls:
  - **Continue-playing** (`autoContinue`, default **on**) — when the current take ends, rolls on to
    the next take of the same song. Disabled (not hidden) on single-take songs so the control row
    doesn't reflow between songs. Precedence: `loop` wins over continue.
  - **Sleep timer** — a drop-up of minute presets + "End of track"; the button shows the remaining
    `mm:ss` (or "End"). Backed by `services/sleepTimer.ts`.
  - **Book/topic queue** — when a book or topic page arms a *queue* (`queueContext`), the card grows
    **previous / next** transport around the play button; with no queue those controls take no room.
    The queue is *not* otherwise labelled on the card (see v9).
  - **"Play this" chip** — when a take is playing but the reader has navigated to a *different*
    song's page (which armed itself), a chip appears above the widget to switch playback to the song
    being read.
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
  crash). The song-detail play button opens the player and starts the track. Build/typecheck green.
- **Visual:** matches `Now Playing` / `Player` / `Track` frames.

## Change log

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
