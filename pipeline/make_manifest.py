#!/usr/bin/env python3
"""Generate the catalog Manifest from canonical songs, per docs/data/manifest.md.

Data-prep tooling (orchestrator-owned, like the conversion pipeline). Emits
converted/manifest.json: one ManifestEntry per song for listing/search/offline-sync.
"""
import json, glob, hashlib, os, unicodedata


def first_letter(title_text: str) -> str:
    for ch in title_text:
        if ch.isalpha():
            # strip diacritics for a clean A-Z index bucket
            base = unicodedata.normalize("NFD", ch)[0].upper()
            return base if base.isascii() and base.isalpha() else ch.upper()
    return "#"


def pick_primary(title_main: list) -> dict:
    """Prefer a Latin/IAST title for list display; fall back to first entry."""
    for t in title_main:
        if t.get("script_code") == "Latn":
            return t
    return title_main[0] if title_main else {"script_code": "Latn", "text": ""}


def main():
    here = os.path.dirname(__file__)
    files = sorted(f for f in glob.glob(os.path.join(here, "converted", "*.json"))
                   if "_list" not in f and "manifest" not in f)
    entries = []
    for f in files:
        raw = open(f, "rb").read()
        d = json.loads(raw)
        primary = pick_primary(d.get("title_main", []))
        entries.append({
            "uid": d["uid"],
            "primary_title": primary,
            "titles": d.get("title_main", []),
            "author_uid": d.get("author_uid", "?"),
            "language_of_origin": d.get("language_of_origin", ""),
            "audio_available": d.get("audio_available", False),
            "first_letter": first_letter(primary.get("text", "")),
            "md5": hashlib.md5(raw).hexdigest(),
        })
    out = os.path.join(here, "converted", "manifest.json")
    json.dump(entries, open(out, "w"), ensure_ascii=False, indent=1)
    print(f"manifest.json: {len(entries)} entries -> {out}")


if __name__ == "__main__":
    main()
