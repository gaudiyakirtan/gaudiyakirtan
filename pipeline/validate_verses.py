#!/usr/bin/env python3
"""Verse-integrity check for the shipped corpus. Exits non-zero on any violation.

This is the guard that would have caught K29: a verse carrying a translation but no source text
renders on the song page as a floating paragraph with nothing above it — no original, no
transliteration, no word-for-word. Nothing in the decode path rejects it, and it is invisible in
28 other songs (where the empty block has no translation either), so it survived unnoticed.

Checks, per song:
  1. ORPHAN TRANSLATION — a verse with a translation but empty `source_text_master`. Always a bug:
     either the verse splitting is misaligned (K29) or text is missing.
  2. EMPTY VERSE — a verse with no source text at all. Harmless to look at, but it is a stray
     block every platform decodes and lays out.
  3. SCRIPT MISALIGNMENT — a `display_scripts` entry whose line count differs from
     `source_text_master`. The scripts are generated line-by-line from the master, so a mismatch
     means a verse was edited without regenerating them, and the reader would see the wrong
     script line beside a given source line.

Run from `pipeline/`:  python validate_verses.py [--dir ../web/src/data/songs]
"""
import argparse
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DIR = "../web/src/data/songs"


def lines_of(value):
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    return value


def check_raw(song, uid):
    """The hand-authored `songs/` shape: `lines` (lists of word objects) + a single `translation`.

    This is where K29's defect originated, so checking only the generated output would catch it a
    stage too late — a regeneration would quietly put it back. `UNDEFINED` is the corpus sentinel
    for "not translated" and is not counted as a translation.
    """
    problems = []
    verses = song.get("verses") or []

    def blank(verse):
        return not any(w.get("w", "").strip() for line in (verse.get("lines") or []) for w in line)

    def translated(verse):
        text = (verse.get("translation") or {}).get("eng", "") or ""
        return text.strip().upper() not in ("", "UNDEFINED", "NULL")

    for index, verse in enumerate(verses):
        if blank(verse) and translated(verse):
            problems.append(("ORPHAN TRANSLATION", f"{uid} verse {index + 1} (raw source)"))

    # The signature of K29's bug: more translations than there are verses to hang them on, because
    # the translations are per *stanza* while the verses pack two stanzas each. The surplus spills
    # onto a blank block and every translation before it sits one verse too early.
    real = sum(1 for v in verses if translated(v))
    non_blank = sum(1 for v in verses if not blank(v))
    if real > non_blank:
        problems.append((
            "TRANSLATION OVERFLOW",
            f"{uid}: {real} translations for {non_blank} verses (raw source) — verses are likely "
            f"packed two stanzas each while translations are per stanza",
        ))
    return problems


def check(path):
    """Returns a list of (kind, detail) problems for one song file.

    Some target dirs sit alongside non-song JSON (song_groups.json, gg_hierarchy.json — both
    top-level lists), so anything that is not a song object is skipped rather than crashing.
    """
    song = json.load(open(path))
    if not isinstance(song, dict) or "verses" not in song:
        return []
    uid = song.get("uid", os.path.basename(path))

    # Two shapes live in this repo: the hand-authored input and the generated output.
    if any("lines" in v for v in (song.get("verses") or [])):
        return check_raw(song, uid)

    problems = []

    for index, verse in enumerate(song.get("verses") or []):
        source = lines_of(verse.get("source_text_master"))
        blank = not "".join(source).strip()

        if blank and verse.get("translations"):
            problems.append(("ORPHAN TRANSLATION", f"{uid} verse {index + 1}"))
        elif blank:
            problems.append(("EMPTY VERSE", f"{uid} verse {index + 1}"))

        if not blank:
            for script in verse.get("display_scripts") or []:
                script_lines = lines_of(script.get("text"))
                if len(script_lines) != len(source):
                    problems.append((
                        "SCRIPT MISALIGNMENT",
                        f"{uid} verse {index + 1}: {script.get('script_code')} has "
                        f"{len(script_lines)} lines, source has {len(source)}",
                    ))

    return problems


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", default=DEFAULT_DIR, help="song directory to validate")
    args = parser.parse_args()

    directory = args.dir if os.path.isabs(args.dir) else os.path.join(HERE, args.dir)
    files = [
        f for f in sorted(glob.glob(os.path.join(directory, "*.json")))
        if "_list" not in os.path.basename(f) and "manifest" not in os.path.basename(f)
    ]
    if not files:
        sys.exit(f"no song files found in {directory}")

    by_kind = {}
    for path in files:
        for kind, detail in check(path):
            by_kind.setdefault(kind, []).append(detail)

    print(f"validated {len(files)} songs in {args.dir}")
    if not by_kind:
        print("OK — no verse-integrity problems")
        return

    for kind in ("ORPHAN TRANSLATION", "TRANSLATION OVERFLOW", "SCRIPT MISALIGNMENT", "EMPTY VERSE"):
        items = by_kind.get(kind)
        if not items:
            continue
        print(f"\n{kind}: {len(items)}")
        for detail in items[:40]:
            print(f"  {detail}")
        if len(items) > 40:
            print(f"  … and {len(items) - 40} more")

    sys.exit(1)


if __name__ == "__main__":
    main()
