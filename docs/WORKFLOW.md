# Development Workflow — Doc-Driven, Cross-Platform

This repository is built **doc-first**. The documentation is the source of truth; the three
platform codebases (iOS, Android, Web) are *derived* from it and must conform to it.

This file defines how work happens. Every contributor — human or agent — follows it.

---

## 1. Sources of Truth

| Domain | Source of truth | Location |
|--------|-----------------|----------|
| Data — entities, fields, data flows, pipelines | **Docs** (prose specs) | `docs/data/` |
| UI — screens, layout, components, states | **Figma** (PNGs + diagrams) | `Gaudiya Kirtan UI/`, `docs/screens/` |

Code is never the source of truth. If code and the source of truth disagree, **the code is wrong**.
If the source of truth is itself wrong, you **change the source first**, then the code — never the
reverse.

The specs are deliberately **platform-agnostic**: they describe *what* is stored and *what* a
function does, at a level precise enough to remove ambiguity, but without committing to any
platform's types, syntax, or libraries. There is **no codegen** — humans and agents read the spec
and implement it idiomatically per platform.

---

## 2. Roles

### Orchestrator (spec owner)
- **Reads** code and docs. **Edits only docs.** Never edits platform code.
- Owns the specs in `docs/`, keeps them precise and internally consistent.
- Dispatches implementer and verifier agents; tracks status in the conformance matrix.

### Platform Implementer agents — one per platform (`web`, `ios`, `android`)
- **Read** the relevant spec doc(s) and their platform's code. **Edit only their own platform.**
- Implement or update code to conform to a specific spec version.
- **Persistent:** each platform has ONE long-lived implementer agent, continued across slices via
  `SendMessage` so its context (conventions, file layout, prior decisions) carries forward. A fresh
  spawn is only for a cold restart.

### Verifier agent
- Runs **two-layer verification** on a platform's implementation of a slice:
  1. **Conformance** — does the code match the spec (fields, types, behavior, naming)?
  2. **Behavioral** — does it build, pass tests, and run/render correctly? (uses the `verify` skill)
- Reports pass/fail per platform + slice. A slice is not "done" until the verifier is green on
  both layers.

---

## 3. The Loop

Every unit of work — one entity, one screen, or one data-flow — runs this loop:

```
  SPEC                IMPLEMENT                 VERIFY
(orchestrator,   →  (implementer agent    →   (verifier agent:        →   pass? → commit
 docs only)          × platform, parallel)     conformance + build/run)   fail? → loop back
```

1. **SPEC** — orchestrator writes/updates the doc, bumps its spec version.
2. **IMPLEMENT** — each platform's persistent implementer agent updates its code to the new version,
   in parallel. Platforms may finish at different times.
3. **VERIFY** — verifier agent checks each platform (both layers).
4. **COMMIT** — green platforms commit (see §5). Lagging platforms are marked stale in the matrix
   and picked up next pass.

Spec-ahead-of-code is a **valid, tracked state**, not breakage.

---

## 4. Agent Continuity

- Spawn `web-implementer`, `ios-implementer`, `android-implementer` **once**; drive them thereafter
  with `SendMessage` to preserve context edit-to-edit.
- **Filesystem-as-truth fallback:** agents must treat `docs/` + the repo as durable truth. If an
  agent's context is ever lost, it re-derives everything from the specs and code — no knowledge
  lives only in an agent's memory.
- Each implementer's working brief is always: *"bring <platform> into conformance with
  `docs/<...>` spec vN for <slice>; edit only <platform>; report what changed."*

---

## 5. Commit Protocol

**Unit of change:** one spec-conformant slice (one entity / one screen / one data-flow) at one spec
version, per platform. Not per-field; not per-whole-track.

**Two commit types:**

| Type | Contents | Lands when |
|------|----------|-----------|
| **Spec** | docs only; bumps entity spec version | doc is internally consistent + orchestrator-reviewed |
| **Implementation** | one platform's code for one slice | verifier is **green on both layers** |

**Invariants**
- Every commit leaves the repo **buildable**.
- Every implementation commit is **verifier-green** (conformance + behavioral).
- Spec may lead code; the gap is recorded in the conformance matrix, never left implicit.

**Message convention**
```
docs(<entity>): v<N> <change>          e.g.  docs(song): v3 add audioFiles + offline flag
feat(<platform>/<slice>): conform v<N>  e.g.  feat(ios/song): conform to song v3
feat(<platform>/<screen>): <screen>     e.g.  feat(web/search): implement search per figma
fix(<platform>/<slice>): <fix> per v<N> e.g.  fix(android/verse): word-to-word order per verse v2
```

---

## 6. Conformance Matrix

`docs/implementation-mapping.md` is the live status board: for each entity/screen × platform, it
records the spec version implemented and the verifier status
(`✅ green` / `⏳ stale` / `❌ failing` / `— not started`). It is the single at-a-glance answer to
"what's left and where has it drifted." The verifier updates it; the orchestrator reviews it.

---

## 7. Change Propagation

When a spec changes:
1. Orchestrator edits the doc, bumps its version, commits the spec.
2. Matrix marks every platform for that entity **stale**.
3. Implementer agents are dispatched to re-conform.
4. Verifier re-checks; matrix returns to green as platforms catch up.
