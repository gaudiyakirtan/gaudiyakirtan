#!/usr/bin/env python3
"""Add multi-script renderings to Book/Topic group titles in song_groups.json.

Book and topic titles ship with only a single Latin (IAST) `titles` entry, so the browse
cards can't honour the reader's List-language the way song titles and author names do
(those carry per-script renderings). This runs each group title through the SAME Aksharamukha
transliteration the song pipeline uses, adding Bengali / Devanagari / … renderings so a Bengali
(or Hindi, Telugu, …) reader sees the work/theme name in their script.

Only titles that actually carry Indic content (IAST diacritics) are transliterated; purely
English descriptive topic names ("Chant the Holy Name", "Essential Teachings", …) are left as
Latin — transliterating English words into Bengali script would be phonetic nonsense, and
pickScriptText falls back to Latin for them, which is correct.

`--write` applies to all platform data dirs + converted/; default is a dry-run report.
"""
import json
import os
import re
import sys

from aksharamukha import transliterate as ak

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_FILES = [
    os.path.join(HERE, "converted/song_groups.json"),
    os.path.join(HERE, "../web/src/data/song_groups.json"),
    os.path.join(HERE, "../ios/gk-ios/Resources/song_groups.json"),
    os.path.join(HERE, "../andorid/app/src/main/assets/song_groups.json"),
]
# The canonical copy we read from (the web bundle) — all outputs get the same result.
SOURCE = os.path.join(HERE, "../web/src/data/song_groups.json")

# The scripts the List-language setting offers (web settingsOptions.DISPLAY_SCRIPT_OPTIONS),
# mapped to their Aksharamukha target names. Latn is the existing source, so it's not regenerated.
SCRIPT_TARGETS = {
    "Beng": "Bengali",
    "Deva": "Devanagari",
    "Telu": "Telugu",
    "Knda": "Kannada",
    "Taml": "Tamil",
    "Mlym": "Malayalam",
    "Gujr": "Gujarati",
    "Orya": "Oriya",
    "Cyrl": "RussianCyrillic",
}

# A title carrying any of these IAST diacritic letters is a Sanskrit/Bengali name worth
# transliterating; a title without them is plain English and is left in Latin.
IAST_DIAC = re.compile(r"[āīūṛṝḷḹēōṁṃḥñṅṇṣśṭḍ]", re.IGNORECASE)


def latn_title(group):
    return next((t["text"] for t in group.get("titles", []) if t.get("script_code") == "Latn"), None)


def present_scripts(group):
    return {t.get("script_code") for t in group.get("titles", [])}


def build_titles(group):
    """Return the group's `titles` list with any missing transliterations appended (Latin first)."""
    latn = latn_title(group)
    if not latn or not IAST_DIAC.search(latn):
        return group.get("titles", []), []  # English or untitled: leave as-is

    have = present_scripts(group)
    added = []
    titles = list(group.get("titles", []))
    for code, ak_name in SCRIPT_TARGETS.items():
        if code in have:
            continue
        try:
            text = ak.process("IAST", ak_name, latn).strip()
        except Exception as exc:  # noqa: BLE001 — one bad script must not sink the rest
            print(f"  ! {latn} -> {code}: {exc}", file=sys.stderr)
            continue
        if text and text != latn:
            titles.append({"script_code": code, "text": text})
            added.append((code, text))
    return titles, added


def main(write):
    groups = json.load(open(SOURCE, encoding="utf-8"))
    total_added = 0
    skipped_english = []
    for g in groups:
        latn = latn_title(g)
        titles, added = build_titles(g)
        g["titles"] = titles
        if added:
            total_added += len(added)
            beng = next((t for c, t in added if c == "Beng"), "")
            print(f"  {g['uid']:32} {latn!r:34} + {len(added)} scripts   Beng={beng!r}")
        elif latn and not IAST_DIAC.search(latn):
            skipped_english.append(latn)

    print(f"\nTransliterated {total_added} renderings across "
          f"{sum(1 for g in groups if len(g['titles']) > 1)} groups.")
    if skipped_english:
        print(f"Left in English ({len(skipped_english)}): " + ", ".join(skipped_english))

    if not write:
        print("\n(dry run — pass --write to save)")
        return

    payload = json.dumps(groups, ensure_ascii=False, indent=2) + "\n"
    for path in OUT_FILES:
        if not os.path.exists(path):
            print(f"  skip (absent): {path}")
            continue
        with open(path, "w", encoding="utf-8") as f:
            f.write(payload)
        print(f"  wrote {path}")


if __name__ == "__main__":
    main("--write" in sys.argv)
