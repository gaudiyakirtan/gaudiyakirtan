#!/usr/bin/env python3
"""Repair reciter (performing-artist) names on every recording.

Root cause: during the conversion into the current corpus, 16 of the 44 performers lost their name
and kept only their short *code* — the tracks list showed "rasi", "taru", "shbi" instead of
"Rasika dasi", "BV Tirtha Maharaja", "Shyam-bihari das". The code is the prefix of each recording's
`audio_files[].uid` (e.g. `rasi-1` -> code `rasi`), and it also names the S3 portrait
(`artists/<code>.jpg`).

The authoritative names were recovered from the previous app's bundled data
(gaudiyakirtan-master/ux-app/src/data/datalz.ts, LZW-compressed; `audio[].meta.artist`), which
predates the lossy conversion and carries a name for every one of the 44 codes. This script sets
`audio_files[].artist` from that single source by code, so every recording is named consistently and
the leaked codes are gone.

Fix: rewrite `audio_files[].artist = CANON[code]` for each recording, in place over every target
song dir so all three platforms stay byte-identical.

One oddity, kept as the source has it: `taru` -> "BV Tirtha Maharaja" and `tirt` -> "Tarun Krsna"
read as if the two codes were swapped, but that is how the recordings are attributed in the source,
so we trust the attribution over the letters. Flagged here for a future human check.
"""
import json
import os

TARGETS = [
    "converted",
    "../web/src/data/songs",
    "../ios/gk-ios/Resources/songs",
    "../andorid/app/src/main/assets/songs",
]
HERE = os.path.dirname(os.path.abspath(__file__))

# code -> canonical romanized name, recovered from the previous app's data (see module docstring).
CANON = {
    "anad": "Anadi Krsna das",
    "bppm": "Srila BP Puri Gosvami Maharaja",
    "brsm": "Srila BR Sridhara Gosvami Maharaja",
    "bvnm": "Srila BV Narayana Gosvami Maharaja",
    "bvsm": "Srila BV Svami Prabhupada",
    "bvtm": "Srila BV Trivikrama Gosvami Maharaja",
    "casu": "Candrakanta & Sucandra",
    "damo": "Damodar das",
    "gaur": "Gaurasundar das",
    "hakr": "Hare Krsna das",
    "jahn": "Jahnava dasi",
    "jana": "Janaki dasi",
    "jays": "Jaya Sri dasi",
    "kana": "Kanai Prabhu",
    "kimo": "Kishori Mohan das",
    "krsb": "Krsna das Babaji",
    "krsn": "Krsnadas das",
    "madh": "Madhukar das",
    "maya": "Mayapur Gurukul",
    "mith": "Mithu dasi",
    "muni": "BV Muni Maharaja",
    "nank": "Nanda Kishor das",
    "pare": "Paresananda das",
    "rash": "Radhesh das",
    "rasi": "Rasika dasi",
    "rauk": "Radhika dasi (UK)",
    "raus": "Radhika dasi (Bay Area)",
    "rpri": "Radha Priya dasi",
    "sadh": "BV Sadhu Maharaja",
    "sara": "Sarasvati dasi",
    "sesa": "Sesasayi Prabhu",
    "sggm": "Srila Gaura Govinda Gosvami Maharaja",
    "shbi": "Shyam-bihari das",
    "srav": "Sravan das",
    "srrb": "Sudarsan das (Radha-ramana Babaji Maharaja)",
    "srvi": "Sri Vidyabhusan",
    "sude": "Sudevi dasi",
    "sudf": "Sudarsan das (Florida)",
    "suma": "Suman Bhattacarya",
    "tama": "Tamal Krsna das",
    "taru": "BV Tirtha Maharaja",
    "tirt": "Tarun Krsna",
    "vija": "Vijay das",
    "vraj": "Vraj Mohan das",
}


def code_of(uid):
    return uid.split("-")[0] if "-" in uid else uid


def fix_dir(path):
    changed = files = 0
    unknown = set()
    for name in sorted(os.listdir(path)):
        if not name.endswith(".json"):
            continue
        fp = os.path.join(path, name)
        with open(fp, encoding="utf-8") as f:
            song = json.load(f)
        if not isinstance(song, dict):
            continue  # list/index files in converted/ are not songs
        dirty = False
        for a in song.get("audio_files") or []:
            code = code_of(a.get("uid", ""))
            want = CANON.get(code)
            if want is None:
                unknown.add(code)
                continue
            if a.get("artist") != want:
                a["artist"] = want
                dirty = True
        if dirty:
            with open(fp, "w", encoding="utf-8") as f:
                json.dump(song, f, ensure_ascii=False, indent=2)
                f.write("\n")
            changed += 1
        files += 1
    return files, changed, unknown


def main():
    for t in TARGETS:
        path = os.path.normpath(os.path.join(HERE, t))
        if not os.path.isdir(path):
            print(f"skip (missing): {t}")
            continue
        files, changed, unknown = fix_dir(path)
        note = f"  ⚠ unknown codes: {sorted(unknown)}" if unknown else ""
        print(f"{t}: {changed}/{files} songs updated{note}")


if __name__ == "__main__":
    main()
