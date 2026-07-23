#!/usr/bin/env python3
"""Re-split K29 (śrīmaṅgala-gītam) so its verses line up with its translations.

Root cause: the song is nine stanzas, but the converter packed them **two to a verse block** after
the first, while the six English translations are one *per stanza*. So the two only agree on verse
1 and then drift:

    block 0 = stanza 1          <- translation 1   (correct)
    block 1 = stanzas 2 + 3     <- translation 2   (half right)
    block 2 = stanzas 4 + 5     <- translation 3   (WRONG: this is Kāliya's verse)
    block 3 = stanzas 6 + 7     <- translation 4   (WRONG)
    block 4 = stanzas 8 + 9     <- translation 5   (WRONG)
    block 5 = <empty>           <- translation 6   (orphan: a translation with no text at all)

That last block is what surfaced the bug on the song page — a translation floating with no source,
no transliteration and no word-for-word above it.

Fix: split the paired blocks back into one stanza per verse (5 populated blocks -> 9 verses), drop
the empty block, and re-attach the translations **in document order** to the first six stanzas.
That ordering is the whole basis of the repair, and it is verified rather than assumed: each
translation's distinguishing phrase is asserted against its stanza's opening word below, so the
script refuses to write anything if the corpus it is run against is not the one this was written
for.

The split is a pure line-slice: `source_text_master` is a list of lines (2 per stanza) and every
one of the 12 `display_scripts` entries is line-aligned to it, so no re-transliteration is needed
and the native scripts cannot be mangled. Idempotent — a song already at 9 verses is left alone.
"""
import json
import os
import sys

TARGETS = [
    "converted",
    "../web/src/data/songs",
    "../ios/gk-ios/Resources/songs",
    "../andorid/app/src/main/assets/songs",
]
HERE = os.path.dirname(os.path.abspath(__file__))
UID = "K29"

# Stanza opening word (romanized) -> a phrase that must appear in ITS translation. The pairing this
# script performs is only correct if the corpus matches these nine stanzas in this order.
EXPECTED = [
    ("śrita", "breasts of Kamala"),
    ("dinamaṇimaṇḍala", "sun globe"),
    ("kāliya", "Kāliya"),
    ("madhu", "Madhu, Mura"),
    ("amala", "immaculate lotus"),
    ("janakasutā", "King Janaka"),
    ("abhinava", None),   # stanzas 7-9 carry no translation in the shipped corpus
    ("tava", None),
    ("śrījayadeva", None),
]


def stanzas_of(verses):
    """Flatten the packed verse blocks into one entry per stanza.

    Each entry is (source_lines, {script_code: script_lines}). Block 0 is left whole because its
    third line is the `dhru` refrain marker, which belongs to that stanza rather than starting a
    new one; the remaining blocks are exactly two 2-line stanzas each.
    """
    out = []
    for index, verse in enumerate(verses):
        src = verse["source_text_master"]
        scripts = verse["display_scripts"]
        if not "".join(src).strip():
            continue                                  # the empty trailing block
        spans = [(0, len(src))] if index == 0 else [(0, 2), (2, 4)]
        if index > 0 and len(src) != 4:
            sys.exit(f"{UID}: block {index} has {len(src)} lines, expected 4 — aborting")
        for start, end in spans:
            out.append((
                src[start:end],
                [{**s, "text": s["text"][start:end]} for s in scripts],
            ))
    return out


def rebuild(song):
    verses = song["verses"]
    if len(verses) == 9:
        return False                                   # already split

    # Translations in document order — the sequence the repair re-attaches by.
    translations = [v["translations"] for v in verses if v.get("translations")]
    stanzas = stanzas_of(verses)

    if len(stanzas) != len(EXPECTED):
        sys.exit(f"{UID}: got {len(stanzas)} stanzas, expected {len(EXPECTED)} — aborting")

    for i, ((src, _scripts), (opening, phrase)) in enumerate(zip(stanzas, EXPECTED)):
        if not src[0].lstrip().startswith(opening):
            sys.exit(f"{UID}: stanza {i + 1} starts {src[0][:30]!r}, expected {opening!r} — aborting")
        if phrase is None:
            continue
        if i >= len(translations) or phrase not in " ".join(translations[i][0]["text"]):
            sys.exit(f"{UID}: translation {i + 1} does not contain {phrase!r} — aborting")

    rebuilt = []
    for i, (src, scripts) in enumerate(stanzas):
        verse = {
            "verse_number": i + 1,
            "source_text_master": src,
            "display_scripts": scripts,
        }
        if i < len(translations):
            verse["translations"] = translations[i]
        rebuilt.append(verse)

    song["verses"] = rebuilt
    return True


def main():
    written = 0
    for target in TARGETS:
        path = os.path.join(HERE, target, f"{UID}.json")
        if not os.path.exists(path):
            continue
        song = json.load(open(path))
        if not rebuild(song):
            print(f"  skip (already 9 verses): {target}")
            continue
        json.dump(song, open(path, "w"), ensure_ascii=False, indent=1)
        written += 1
        print(f"  rewrote {len(song['verses'])} verses: {target}")
    print(f"{UID}: {written} file(s) updated")


if __name__ == "__main__":
    main()
