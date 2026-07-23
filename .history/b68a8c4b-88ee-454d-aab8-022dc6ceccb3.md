# Session log — issues & design decisions

Session `b68a8c4b-88ee-454d-aab8-022dc6ceccb3` · working dir `gaudiyakirtan` (edits in `mono`).
**Transcript-derived** (rate-limited before self-authoring). Shares the same trunk as
[`a020eca5`](a020eca5-e4ff-4592-898f-e3a80a1d2bd7.md) and
[`acb03f61`](acb03f61-181a-4f8c-99eb-37ff2e49f7fb.md) through ~09:44 (pipeline vendoring → dev
deploy failure chain → world-class audit → Tracks tab → mini-player continue toggle). After a
`/compact` at 10:13 it diverges into a **list-page design exploration**, which is its unique content.

## Unique to this session — list-page redesign (exploratory)
- **10:20 — Issue raised by user.** The Songs / Tracks / Authors / Topics list pages "feel
  non-desktop" and not well-organized; asked to brainstorm new directions.
- **10:24 — Framing decision.** Approach it as a **design lead at a small studio** giving a
  bespoke visual identity per page rather than one uniform list treatment.
- **10:46 — User preferences captured (with a screenshot):**
  - **Songs** — keep the **two-pane layout**, but give the side rail an **alphabetized** index like
    Tracks has.
  - **Tracks** — prefers the **recording-takes** presentation.
  - **Authors** — a distinct author-list treatment.
- **Status.** This was an *exploration/brainstorm* thread (directions + preferences), not a set of
  shipped, verifier-green changes at the point the transcript captures. Any resulting layout work
  would land through the normal SPEC → IMPLEMENT loop; the shipped list behavior is specced in
  [`songs-list.md`](../docs/screens/songs-list.md) and [`tracks.md`](../docs/screens/tracks.md).

## Note
No new shipped feature originates uniquely here beyond the trunk work already documented in the
`86fd259a` / `acb03f61` logs; the list-redesign preferences are design input, not committed decisions.
