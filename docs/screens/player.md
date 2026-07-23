# Screen — Audio Player

**Spec version:** 1

**Figma frames:** `Now Playing`, `Player`, `Track`, `trailingIcon2_`.

## Purpose

Plays a song's recording. 235 of the 703 songs carry audio (`audio_available = true`), and
[song-detail](song-detail.md) shows a play affordance for them (currently stubbed) — this screen is
what it opens. Streaming, with graceful handling when a track can't load.

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
- **Web (v4 — unified mini-player):** an `<audio>` element behind `PlayerContext`, surfaced by a
  **single** sticky control in the bottom-right (`PlayerWidget.tsx`). It is **hidden entirely on
  non-song pages unless a track is loaded/playing** (a song page "arms" its song via
  `PlayerContext.arm()`, so the FAB shows there; elsewhere nothing until playback starts). States:
  *idle (armed)* → a compact circular play FAB; *loaded* → a mini-player **card** with artwork,
  **song title** (up to two lines, then a **marquee** if longer — `MarqueeTitle`), author, a
  **scrubber** with times, and a **loop / download / share** control row (Lucide icons). Reciter
  selection was **removed** (default recording plays). **Share** copies a deep link
  `/songs/<uid>?play=<trackUid>` (or the Web Share sheet); the song page reads `?play=` and
  cues+plays that take — autoplay-blocked degrades to *paused/cued*, not error. **Download** fetches
  the mp3 as a blob (falls back to opening the S3 URL — the bucket sends no CORS/Content-Disposition).
  Loop → `audio.loop`. `AUDIO_BASE_URL` in `web/src/config.ts`.
- **Offline download** of tracks is a later enhancement — this slice is streaming + graceful errors.

## Verification

- **Behavioral:** with a *test* URL (or a stubbed reachable file), play/pause/scrub work and the
  now-playing shows title/author/artist; with the placeholder URL, the error state shows cleanly (no
  crash). The song-detail play button opens the player and starts the track. Build/typecheck green.
- **Visual:** matches `Now Playing` / `Player` / `Track` frames.

## Change log

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
