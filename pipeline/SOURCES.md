# SOURCES — upstream inputs & media provenance

The corpus JSON shipped in `../web`, `../ios`, `../andorid` is **generated** by the scripts in this
directory. This file records the things that are *not* in the repo but are needed to rebuild the
data from scratch, plus where the runtime media (audio, covers, portraits) actually lives.

If you can regenerate everything below, the app's whole catalog is reproducible. If any of these are
lost, that regeneration path is broken — so **archive them durably** (they are too large / too
copyright-encumbered to commit here).

---

## 1. Raw text sources (the true source of truth for verses & structure)

| What | Current location | Used by | Notes |
|------|------------------|---------|-------|
| **Śrī Gauḍīya Gīti-guccha, 7th ed. (2016)** — the songbook PDF | `~/Downloads/Gaudiya-Giti-guccha-7th-ed-2016.pdf` (6.3 MB) | verse text / manual reference during song JSON authoring in `songs/` | Copyrighted (GVP). Do **not** commit. Archive to durable storage. |
| **2024 Gauḍīya Gīti-guccha Song Order — FINAL CHECK** (docx) | `~/Downloads/2024 Gauḍīya Gīti-guccha Song Order_FINAL CHECK.docx.md` (29 KB) and `…docx.zip` (15 KB) | `apply_giti_guccha_tags.py`, `rebuild_song_groups.py` — the authoritative **chapter → section → language → sub-topic → song** hierarchy and thematic tags | The paragraph *colours* in the docx encode the hierarchy (h1 green3 = chapter, h2 green2 = section, h3 yellow = language, h4 green1 = sub-topic, plain = song). |

### Regenerating the hierarchy HTML that `apply_giti_guccha_tags.py` reads

`apply_giti_guccha_tags.py` reads a colour-preserving **HTML export** of that docx from a scratch
path:

```
HTML = "/tmp/gg_docx/2024GaudiyaGitigucchaSongOrder_FINALCHECK.doc.html"
```

That `/tmp` file is **ephemeral** — it is produced from the docx (unzip `…docx.zip`, or export the
doc to filtered HTML) and is not guaranteed to exist on a fresh machine. Recreate it from the
Downloads docx before re-running the tags pass. The already-derived outputs
(`converted/gg_hierarchy.json`, and `gg_hierarchy.json` / `song_groups.json` in each platform dir)
are committed, so you only need this step to **re-derive** the hierarchy, not to ship it.

---

## 2. Runtime media — the public S3 bucket (external, referenced by all 3 platforms)

Audio and remote images are served from the public, no-auth bucket
`https://gaudiyakirtan.s3.amazonaws.com/`. The bucket is the source of truth for media; it is **not**
part of this repo. Layout (see each platform's config: `web/src/config.ts`,
`ios/gk-ios/Utils/{AudioConfig,ImageConfig}.swift`, `andorid/.../data/ImageConfig.kt`):

| Prefix | Contents | Filename convention |
|--------|----------|---------------------|
| `audio/` | song recordings | `<track-uid>.mp3` (e.g. `A10-bvsm-1.mp3`) |
| `artists/` | performer portraits (Now-Playing credit) | `artists/<artist_code>.jpg` — best-effort; most 404 → UI falls back |
| `collections/` | book cover art | `collections/<slug>.jpg` — best-effort; only `gaura`, `nitai`, `radha` are known to exist today |

---

## 3. Book covers — canonical source & the cross-platform gap

The 7 curated book covers live in this repo as the canonical source:

```
pipeline/assets/covers/<group-uid>.jpg      ← source of truth (this dir)
web/public/covers/<group-uid>.jpg           ← web-consumed copy (byte-identical)
```

Files: `book-gitavali`, `book-kalyanakalpataru`, `book-saranagati`, `book-srimanahsiksa`,
`book-srinamastaka`, `book-srisiksastaka`, `book-sriupadesamrta` (`.jpg`).

**They currently render on web only.** The two native apps do **not** bundle covers — they fetch
from the S3 bucket `collections/<slug>.jpg` via a best-effort slug heuristic that only matches the
three deity slugs (`gaura`/`nitai`/`radha`), then fall back to the group's accent colour:

- `ios/gk-ios/Utils/ImageConfig.swift` → `bookCoverURL(forTitle:)`
- `andorid/app/src/main/java/com/gaudiyakirtan/data/ImageConfig.kt` → `bookCoverUrl(bookSlugFromGroupUid(uid))`

So dropping the jpgs into `ios/`/`andorid/` asset folders would **not** make them appear — no native
code reads local cover files. To show these 7 covers on native, pick one route:

- **Route A — upload to S3 (matches native's existing design; no app rebuild):** put the covers on
  the bucket at `collections/<slug>.jpg` and reconcile the slug mapping (web keys by full group uid,
  e.g. `book-gitavali`; native strips to `gitavali`). Requires bucket write credentials.
- **Route B — bundle locally (matches web's new design; needs native code changes):** copy the
  covers into `ios/gk-ios/Resources/covers/` + `andorid/app/src/main/assets/covers/` and change each
  platform's `BookCard` to load a local `covers/<uid>.jpg` before/instead of the S3 URL.

### Provenance gap

The covers' **original download URLs** (Instagram / Facebook signed URLs, and any capture HAR) are
**not recorded** and the HAR could not be located on disk (searched `~/Downloads`, `~/Desktop`,
`~/workspace/gaudiyakirtan`). The 7 jpgs above are therefore the only surviving copies — treat
`pipeline/assets/covers/` as the master and re-source originals if higher resolution is ever needed.

---

## 4. Reproducibility checklist

- [ ] Gīti-guccha PDF archived off `~/Downloads`
- [ ] 2024 song-order docx (`.docx.zip`) archived off `~/Downloads`
- [ ] Covers' original source URLs recovered/recorded (currently lost)
- [ ] S3 bucket contents backed up (audio + artists + collections)
- [ ] Decide native cover route (A: S3 upload, or B: local bundle) — see §3
