#!/usr/bin/env python3
"""Add multi-script renderings to song TITLES and AUTHOR names so the reader's List-language
setting works for every script — not just the song's own native script + Roman.

Songs ship `title_main` / `author_display` (and the manifest's `titles`) with only the native
script (Bengali *or* Devanagari) plus Latin/IAST. So a reader who sets Display-language to
Devanagari sees a Bengali-origin song's title fall back to Roman — the script simply isn't there.
This runs each Latin/IAST rendering through the SAME Aksharamukha the song pipeline uses, adding
Bengali / Devanagari / Telugu / … so pickScriptText can honour any List-language.

Transliterates from the Latin/IAST entry (the pipeline's canonical intermediate — gives clean
`jaya`→जय, not the nukta'd जय़ a Bengali source produces). Only Latin text carrying IAST
diacritics is transliterated; plain-English strings (English-origin titles, the "Unknown Author"
placeholder) are left Latin — transliterating English into an Indic script is phonetic nonsense,
and pickScriptText falls back to Latin for them.

Idempotent: skips any script already present. `--write` saves; default is a dry-run count.
"""
import glob
import json
import os
import re
import sys

from aksharamukha import transliterate as ak

HERE = os.path.dirname(os.path.abspath(__file__))
MONO = os.path.join(HERE, "..")

# (manifest.json | None, songs-dir | None) per platform + the pipeline's own converted/ copy.
TARGETS = [
    (f"{MONO}/web/src/data/manifest.json", f"{MONO}/web/src/data/songs"),
    (f"{MONO}/andorid/app/src/main/assets/manifest.json", f"{MONO}/andorid/app/src/main/assets/songs"),
    (f"{MONO}/ios/gk-ios/Resources/songs/manifest.json", f"{MONO}/ios/gk-ios/Resources/songs"),
    (f"{HERE}/converted/manifest.json", f"{HERE}/converted/songs"),
]

SCRIPT_TARGETS = {
    "Beng": "Bengali", "Deva": "Devanagari", "Telu": "Telugu", "Knda": "Kannada",
    "Taml": "Tamil", "Mlym": "Malayalam", "Gujr": "Gujarati", "Orya": "Oriya",
    "Cyrl": "RussianCyrillic",
}
IAST_DIAC = re.compile(r"[āīūṛṝḷḹēōṁṃḥñṅṇṣśṭḍ]", re.IGNORECASE)

_cache: dict = {}
_stats = {"added": 0, "lists": 0, "skipped_english": 0}


def _translit(text, code):
    key = (text, code)
    if key not in _cache:
        try:
            _cache[key] = ak.process("IAST", SCRIPT_TARGETS[code], text).strip()
        except Exception:  # noqa: BLE001
            _cache[key] = ""
    return _cache[key]


def augment(entries):
    """Append missing-script renderings to one ScriptText list (in place). Returns True if changed."""
    if not entries:
        return False
    latn = next((e for e in entries if e.get("script_code") == "Latn"), None)
    if not latn or not latn.get("text"):
        return False
    src = latn["text"]
    if not IAST_DIAC.search(src):
        _stats["skipped_english"] += 1
        return False  # plain English — leave as Latin
    have = {e.get("script_code") for e in entries}
    changed = False
    for code in SCRIPT_TARGETS:
        if code in have:
            continue
        text = _translit(src, code)
        if text and text != src:
            entries.append({"script_code": code, "text": text})
            _stats["added"] += 1
            changed = True
    if changed:
        _stats["lists"] += 1
    return changed


def process_manifest(path, write):
    data = json.load(open(path, encoding="utf-8"))
    entries = data if isinstance(data, list) else data.get("entries", data.get("songs", []))
    changed = False
    for e in entries:
        if augment(e.get("titles")):
            changed = True
    if write and changed:
        json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    return changed


def process_songs(songs_dir, write):
    n = 0
    for path in glob.glob(os.path.join(songs_dir, "*.json")):
        # Some platforms keep manifest.json / song_groups.json inside the songs dir — skip
        # anything that isn't a single song object.
        if os.path.basename(path) in ("manifest.json", "song_groups.json"):
            continue
        d = json.load(open(path, encoding="utf-8"))
        if not isinstance(d, dict):
            continue
        c1 = augment(d.get("title_main"))
        c2 = augment(d.get("author_display"))
        if (c1 or c2):
            n += 1
            if write:
                json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    return n


def main(write):
    for manifest, songs_dir in TARGETS:
        label = os.path.relpath(os.path.dirname(manifest), HERE)
        if os.path.exists(manifest):
            ch = process_manifest(manifest, write)
            print(f"  manifest [{label}]: {'updated' if ch else 'no change'}")
        if songs_dir and os.path.isdir(songs_dir):
            n = process_songs(songs_dir, write)
            print(f"  songs    [{label}]: {n} files {'written' if write else 'to change'}")
    print(f"\nAdded {_stats['added']} renderings across {_stats['lists']} title/name lists; "
          f"left {_stats['skipped_english']} English strings as-is. "
          f"({len(_cache)} unique transliterations cached)")
    if not write:
        print("(dry run — pass --write to save)")


if __name__ == "__main__":
    main("--write" in sys.argv)
