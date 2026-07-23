#!/usr/bin/env python3
"""Drop trailing empty verse blocks left behind by the converter.

29 songs ship a final verse whose `source_text_master` is `[""]` (and whose 12 `display_scripts`
are `[""]` too) — an off-by-one artifact of splitting on a trailing separator. In 28 of them the
block carries no translation either, so it renders as nothing: invisible, but still a real stray
verse in the data that every platform decodes and lays out.

**Never drops a block that carries a translation.** K29's trailing empty had one attached, which is
what made the bug visible there (a translation floating with no text above it) — deleting that
would have destroyed content rather than fixed alignment. That song is repaired separately by
`fix_k29_stanza_split.py`, which re-splits its verses so the translation lands on the stanza it
actually belongs to. Run that first; this pass then reports nothing left to do for K29.

Only *trailing* blocks are removed, so the surviving `verse_number`s stay contiguous and no
renumbering is needed. Idempotent.
"""
import glob
import json
import os

TARGETS = [
    "converted",
    "../web/src/data/songs",
    "../ios/gk-ios/Resources/songs",
    "../andorid/app/src/main/assets/songs",
]
HERE = os.path.dirname(os.path.abspath(__file__))


def is_empty(verse):
    source = verse.get("source_text_master") or []
    if isinstance(source, str):
        source = [source]
    return not "".join(source).strip()


def trim(song):
    """Remove empty, untranslated verses from the END of the song. Returns how many went."""
    verses = song.get("verses") or []
    removed = 0
    while verses and is_empty(verses[-1]) and not verses[-1].get("translations"):
        verses.pop()
        removed += 1
    return removed


def main():
    total_files = 0
    affected = set()
    kept_for_translation = set()

    for target in TARGETS:
        directory = os.path.join(HERE, target)
        if not os.path.isdir(directory):
            continue
        for path in sorted(glob.glob(os.path.join(directory, "*.json"))):
            name = os.path.basename(path)
            if "_list" in name or "manifest" in name:
                continue
            song = json.load(open(path))
            if "verses" not in song:
                continue

            removed = trim(song)

            # Surface anything this pass deliberately refuses to touch.
            for verse in song.get("verses") or []:
                if is_empty(verse) and verse.get("translations"):
                    kept_for_translation.add(song.get("uid", name))

            if removed:
                json.dump(song, open(path, "w"), ensure_ascii=False, indent=1)
                total_files += 1
                affected.add(song.get("uid", name))

    print(f"trimmed {total_files} file(s) across {len(affected)} song(s)")
    if affected:
        print("  " + ", ".join(sorted(affected)))
    if kept_for_translation:
        print("\nKEPT (empty but carries a translation — needs a real fix, not a delete):")
        print("  " + ", ".join(sorted(kept_for_translation)))


if __name__ == "__main__":
    main()
