# Gaudiya Kirtan — Completion Roadmap

Goal: bring the monorepo to **store-ready** on all three platforms (iOS, Android, Web),
running on the **full real song corpus**, delivered as a **static, offline-first bundle**.

This build is **doc-driven**. The method is defined in [`docs/WORKFLOW.md`](docs/WORKFLOW.md);
this file tracks *what's left*. The conformance matrix in
[`docs/implementation-mapping.md`](docs/implementation-mapping.md) tracks *where each platform
stands*.

---

## Operating model (summary)

Source of truth: **docs** for data ([`docs/data/`](docs/data/)), **Figma** for UI
(`Gaudiya Kirtan UI/`, `docs/screens/`). Code is derived and must conform.

Every unit of work runs the loop:

```
  SPEC (orchestrator, docs only) → IMPLEMENT (persistent agent × platform) → VERIFY (conformance + build/run) → commit or iterate
```

- **Orchestrator** reads code + docs, **edits only docs**, dispatches agents.
- **Implementer agents** (`web`/`ios`/`android`) — one persistent agent each, continued via
  `SendMessage`; edit only their platform.
- **Verifier agent** — two layers: conformance to spec + behavioral (build/test/run).
- **Commit unit** — one entity/screen/data-flow at one spec version, per platform; implementation
  commits land only when verifier-green. Full protocol in `docs/WORKFLOW.md` §5.

---

## Current State (reassessed 2026-07-22, late)

The earlier assessment on this line ("UI shells on hardcoded sample data") is **superseded** — the
real corpus now ships on all three platforms. Live per-spec status is in
[`docs/implementation-mapping.md`](docs/implementation-mapping.md); this is the summary.

| Area | Web | iOS | Android |
|------|-----|-----|---------|
| Real corpus (702 songs) | ✅ bundled | ✅ bundled | ✅ bundled |
| Data source | `src/data/` | `Resources/songs/` | `assets/` |
| Offline storage | ✅ static bundle | ✅ bundle | ✅ assets |
| Search | ✅ command palette | ✅ | ✅ |
| Audio playback | ✅ mini-player | ✅* | ✅ |
| Calendar overlay | ✅ home §1 | — | — |
| About / Contact | ✅ | — | — |

Facts still shaping the plan: no `shared/` layer (docs fill that role); ~3800 verses remain without
translation or word-to-word; **no Figma frames exist** for the reworked home, its calendar region,
the sidebar footer, or About/Contact, so those ship behaviorally-verified only.

---

## M0 — Specs (doc-first foundation) — IN PROGRESS

The convergence point for both tracks. Orchestrator-only (docs).

- [x] `docs/WORKFLOW.md` — operating model, roles, loop, commit protocol.
- [x] `docs/data/README.md` — conventions (uid, language/script codes, flags) + entity template.
- [x] `docs/data/` entity specs — song, verse, translation, author, collections, manifest, pipeline.
- [ ] `docs/screens/` — screen specs referencing Figma frames (Track B source of truth companion).
- [ ] `docs/implementation-mapping.md` — convert into the live conformance matrix
      (entity/screen × platform × spec-version × verifier status).

**Exit:** every core data entity has a frozen v1 spec; matrix scaffolded; agents can be briefed.

---

## TRACK A — Data (real corpus, offline-first) · runs the loop

Source of truth: `docs/data/`. Each item = SPEC (done in M0) → IMPLEMENT × platform → VERIFY.

### A1. Finish the pipeline (`pipeline`) — output must conform to `docs/data/`
- [x] Install deps (aksharamukha, python-dotenv).
- [x] Verify single-song run against `docs/data/pipeline.md` contract.
- [x] Full transliteration run over 703 (no API) → **703 converted, 0 conformance failures**, 4853 verses, 10 scripts.
- [ ] Translations + word-to-word for ~3800 untranslated verses via **Sonnet/Haiku subagents** (not paid API).
- [ ] Emit `manifest` per [`manifest.md`](docs/data/manifest.md) + bundle canonical dataset for apps.

### A2. Data models — per platform, conform to `docs/data/`
- [ ] Web / iOS / Android model layers conform to song, verse, translation, author, collections, manifest.

### A3. Data layer (Repository, offline-first) — per platform
- [ ] Web: replace `sampleData.ts`; static-generate from canonical corpus.
- [ ] iOS: bundle JSON + Codable + Core Data/SQLite cache.
- [ ] Android: bundle JSON in `assets/` + Room.

### A4. Search — per platform (productionize from `../search-benchmark`)
- [ ] Fuzzy title/author over the Manifest (eval vs `search-benchmark/search-database.csv`).
- [ ] Optional on-device semantic (sqlite-vec POC).

### A5. Calendar overlay — "what should I sing today?" (spec [`calendar.md`](docs/data/calendar.md) v2)
- [x] Lunar-month engine (`pipeline/gaudiya_calendar.py`) — Meeus ch.49/25 + Lahiri ayanāṁśa,
      pure stdlib. Validated against independently-observed Kārtika windows (2024-10-17..11-15,
      2025-10-07..11-05) and adhika-māsa cadence (2023, 2026).
- [x] `build_calendar.py` emits + validates `calendar.json` (199 half-open lunar windows
      2020→2036, 13 month blocks, 5 daily ārati slots, **36 dated festivals** at spec v2) into all
      three platform data dirs.
- [x] Web: `calendarRepository` (client-safe) + `Calendar` models + decoder, **25 tests green**.
- [x] Screen spec [`today.md`](docs/screens/today.md) v1 — home-screen section, all three platforms.
- [x] **Web renders it**: home §1 shows the lunar month, its observances and its songs
      ([`home.md`](docs/screens/home.md) v3). `festivals[]` + `getUpcomingFestivals()` ship and are
      tested but are **not surfaced by any screen** — the festival hero was removed.
- [ ] iOS / Android repositories over the same bundled `calendar.json`.
- [ ] **Figma frames** — none exist for the home calendar region; until they do the screen
      verifier's visual layer cannot run and it ships behaviorally-verified only.
- [ ] Implement the calendar region on iOS / Android.
- [ ] Month artwork: only `vamana.jpg` ships (`public/assets/months/`, provenance in `CREDITS.md`);
      the other eleven months fall back to a gradient.
- [ ] Curation: ~11 pañjikā-dated occasions still have no song assigned — Janmāṣṭamī is the
      conspicuous one (13 dated occurrences, 0 links). Pauṣa legitimately ships zero songs.
- [ ] Regenerate before `WINDOW_END` (2036-01-01).

> Provenance is tracked per song link (`observed` / `panjika` / `book` / `thematic`) so evidence
> strength is never flattened. Sources: the Śrī Caitanya-pañjikā (3866 events, 2011–2027), 2172
> dated @madhudas livestreams, and the Gīti-guccha's own rubrics.

---

## TRACK B — App to Figma (UI, placeholder data) · runs the loop

Source of truth: `Gaudiya Kirtan UI/` PNGs + `docs/screens/`. Verifier uses **visual** comparison
(screenshot vs frame) + behavioral. Builds against the M0 data interface, not real data.

- [ ] **B1. Screen specs + gap analysis** — author `docs/screens/*`, map each Figma frame → per-platform component, list gaps.
- [ ] **B2. Audio player** — `Now Playing` / `Player` / `Track` (built nowhere): all 3 platforms.
- [ ] **B3. Search UI** — `Search` / `Search-1`.
- [ ] **B4. Settings** — complete `Settings-1/2/3` variants.
- [ ] **B5. Two-theme system** — Gaura (`Guar Theme`) + Shyam (`Shyam Theme`) palettes + switcher (current apps only do light/dark).
- [ ] **B6. Remaining screens/states** — Library(Author) variants, Flat Song List, hidden-song state, platform-split Song component.

---

## TRACK C — Finishing (after A + B)

- [ ] **C1. IA parity** — reconcile web (Authors/Books/Topics/Resources) vs mobile (Library/Collections) into one IA.
- [ ] **C2. Quality** — real unit/UI tests (only scaffolds exist); wire CI (`.github/`); fix package-manager inconsistency (CLAUDE.md says bun, web uses pnpm).
- [ ] **C3. Store readiness** — icons/splash/metadata; iOS signing + TestFlight + App Store; Android signing + Play Console; web Vercel prod deploy.
- [ ] **C4. Repo hygiene** — commit in-flight changes; sync with `origin/mono` (remote pushed more recently than local worktree).

---

## Key Decisions (locked)
- Scope: **all 3 platforms, store-ready.**
- Data delivery: **static bundle, offline-first** (no runtime backend for the read-only catalog).
- Method: **doc-driven** — docs = data truth, Figma = UI truth; orchestrator/implementer/verifier loop.
- Sequencing: **M0 → (Track A ∥ Track B) → Track C.**
