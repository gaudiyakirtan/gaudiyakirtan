# Month artwork — provenance and licensing

Banner artwork for the Gaudiya lunar months, used by home's "This month" region
(`docs/screens/home.md` §2) and resolved by `monthImageUrlFor()` in `web/src/config.ts`.

The twelve Gaudiya months are named for forms of Viṣṇu, so each month's artwork depicts its
namesake. Filenames are the lowercased, diacritic-stripped Gaudiya month name:
`vamana.jpg`, `damodara.jpg`, `kesava.jpg`, …

**Self-hosted, not hotlinked.** The app is offline-first, and upstream hosts (Wikimedia among
them) ask not to be hotlinked.

**Most months have no image yet.** That is expected — the banner falls back to a themed gradient
on any load error, and is designed to stay legible without artwork. Adding a file here is enough
to make it appear; no code change is needed.

Anything added to this directory must be public domain or under a licence permitting
redistribution in a shipped app. Record it below.

| File | Subject | Source | Date | Licence | Credit |
|------|---------|--------|------|---------|--------|
| `vamana.jpg` | Vāmana (Āṣāḍha) | [Wikimedia Commons — `File:Vamana_1825.jpg`](https://commons.wikimedia.org/wiki/File:Vamana_1825.jpg) | c. 1825 | Public domain (author unknown; work of age) | Victoria and Albert Museum, [O68224](https://collections.vam.ac.uk/item/O68224/painting-vamana/) |

Source resolution is 384 × 465. The banner crops with `object-cover`, so portrait originals are
fine, but anything much smaller will look soft.
