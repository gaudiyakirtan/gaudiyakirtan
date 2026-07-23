#!/usr/bin/env python3
"""Build calendar.json — the occasion/lunar-month overlay bundled into every platform.

Run alongside build_song_groups.py:

    python build_calendar.py                 # writes to all three platform data dirs
    python build_calendar.py --check         # validate only, write nothing

Why the lunar windows are PRECOMPUTED here rather than derived on-device
-----------------------------------------------------------------------
The Gaudiya month is an astronomical quantity (Meeus ch.49 moon phases + ch.25 solar
longitude + Lahiri ayanāṁśa; see gaudiya_calendar.py). Porting that to TypeScript,
Swift and Kotlin would mean three floating-point implementations that WILL drift apart
at month boundaries. Instead this script emits an explicit window table, so each
platform only does a date-range lookup. Matches the locked ROADMAP decision:
"static bundle, offline-first (no runtime backend for the read-only catalog)."

Regenerate when WINDOW_END approaches, or when gaudiya_months.json changes.
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import sys

import gaudiya_calendar as gc

HERE = os.path.dirname(os.path.abspath(__file__))
MONTHS_SRC = os.path.join(HERE, 'gaudiya_months.json')

# Platform data directories (the same three the corpus is bundled into).
TARGETS = [
    '../web/src/data/calendar.json',
    '../ios/gk-ios/Resources/songs/calendar.json',
    '../andorid/app/src/main/assets/calendar.json',
]
MANIFESTS = [
    '../web/src/data/manifest.json',
]

SPEC_VERSION = 2
WINDOW_START = datetime.date(2020, 1, 1)
WINDOW_END = datetime.date(2036, 1, 1)


def build_windows() -> list[dict]:
    """One row per pūrṇimānta lunar month covering [WINDOW_START, WINDOW_END).

    Windows are HALF-OPEN: `start` inclusive, `end` exclusive, and `end` always equals
    the next row's `start`. That makes date lookup total and unambiguous
    (`start <= d < end` matches exactly one row).

    Why half-open matters here: a month's closing full-moon day is also, depending on
    whether the full-moon instant precedes local sunrise, the next month's first day.
    Resolving that needs sunrise times for a specific location, which this table does
    not model - so boundary days carry ±1 day uncertainty. For exact liturgical dates
    (a festival's actual observance day) use the Caitanya-pañjikā, not this table.
    """
    seen: list[dict] = []
    d = WINDOW_START
    while d < WINDOW_END + datetime.timedelta(days=40):
        m = gc.lunar_month(d)
        if not seen or seen[-1]['start'] != m.starts:
            seen.append({
                'start': m.starts,
                'new_moon': m.new_moon,
                'lunar_month': m.month.replace('Adhika ', ''),
                'gaudiya_month': m.gaudiya_month,
                'adhika': m.adhika,
            })
        d += datetime.timedelta(days=7)

    rows: list[dict] = []
    for cur, nxt in zip(seen, seen[1:]):
        if cur['start'] >= WINDOW_END.isoformat():
            break
        rows.append({**cur, 'end': nxt['start']})
    return rows


def load_months() -> dict:
    with open(MONTHS_SRC, encoding='utf-8') as f:
        return json.load(f)


def _slug(name: str) -> str:
    import re
    import unicodedata
    s = unicodedata.normalize('NFD', name)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s)).strip('-')


def build_festivals() -> list[dict]:
    """Dated festivals for the home hero, merged from two files.

    `calendar_occasions.json` maps an occasion -> song uids (+ provenance);
    `panjika_festivals.json` supplies the actual observance DATES from the
    Śrī Caitanya-pañjikā. Only occasions with at least one date are emitted - an
    undated festival cannot be "upcoming" and would render a card with no when.
    """
    occ_path = os.path.join(HERE, 'calendar_occasions.json')
    pan_path = os.path.join(HERE, 'panjika_festivals.json')
    if not (os.path.exists(occ_path) and os.path.exists(pan_path)):
        return []

    with open(occ_path, encoding='utf-8') as f:
        occasions = json.load(f)
    with open(pan_path, encoding='utf-8') as f:
        panjika = json.load(f)

    by_key: dict[str, list[str]] = {}
    for entry in panjika:
        by_key.setdefault(entry['key'], []).extend(entry.get('dates', []))

    uids = known_uids()
    out: list[dict] = []
    for occ in occasions:
        key = occ.get('panjika_key') or ''
        dates = sorted(set(by_key.get(key, [])))
        if not dates:
            # try a loose key match (the pañjikā folds spellings across naming eras)
            for k, ds in by_key.items():
                if key and (key in k or k in key):
                    dates = sorted(set(ds))
                    break
        if not dates:
            continue
        songs = [{'uid': u, 'basis': 'panjika'}
                 for u in occ.get('song_uids', []) if not uids or u in uids]
        out.append({
            'id': _slug(occ['occasion']),
            'name': occ['occasion'],
            'months': occ.get('months') or [],
            'dates': dates,
            'songs': songs,
        })
    out.sort(key=lambda f: f['name'])
    return out


def known_uids() -> set[str]:
    for rel in MANIFESTS:
        p = os.path.normpath(os.path.join(HERE, rel))
        if os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return {s['uid'] for s in json.load(f)}
    return set()


def build() -> dict:
    src = load_months()
    uids = known_uids()

    def songs(block):
        # song_uids reference the Manifest, exactly like song_groups.json - titles are
        # NOT duplicated here, they resolve through the manifest at read time.
        return [{'uid': s['uid'], 'basis': s['basis']}
                for s in block if not uids or s['uid'] in uids]

    months = [{
        'lunar_month': m['lunar_month'],
        'gaudiya_month': m['gaudiya_month'],
        'observances': m['observances'],
        'note': m.get('note'),
        'songs': songs(m['songs']),
    } for m in src['months']]

    daily = [{
        'slot': d['slot'],
        'label': d['label'],
        'songs': songs(d['songs']),
    } for d in src['daily']]

    return {
        'spec_version': SPEC_VERSION,
        'generated': datetime.date.today().isoformat(),
        'window_start': WINDOW_START.isoformat(),
        'window_end': WINDOW_END.isoformat(),
        'basis_legend': src['basis_legend'],
        'sources': src['sources'],
        'windows': build_windows(),
        'months': months,
        'daily': daily,
        'festivals': build_festivals(),
    }


def validate(data: dict) -> list[str]:
    """Invariants from docs/data/calendar.md."""
    errs: list[str] = []
    uids = known_uids()
    names = {m['lunar_month'] for m in data['months']}

    w = data['windows']
    for i, row in enumerate(w):
        if row['start'] >= row['end']:
            errs.append(f'window {i}: start after end ({row["start"]}..{row["end"]})')
        if row['lunar_month'] not in names:
            errs.append(f'window {i}: unknown lunar_month {row["lunar_month"]!r}')
    # contiguous half-open cover: every window's `end` is the next window's `start`
    for a, b in zip(w, w[1:]):
        if a['end'] != b['start']:
            errs.append(f'gap/overlap: window ends {a["end"]}, next starts {b["start"]}')
    # every referenced song exists in the corpus
    if uids:
        for m in data['months']:
            for s in m['songs']:
                if s['uid'] not in uids:
                    errs.append(f'{m["lunar_month"]}: unknown song uid {s["uid"]}')
    # festivals must be dated and reference real songs
    for fest in data.get('festivals', []):
        if not fest.get('dates'):
            errs.append(f'festival {fest["id"]}: no dates')
        if uids:
            for s_ in fest.get('songs', []):
                if s_['uid'] not in uids:
                    errs.append(f'festival {fest["id"]}: unknown song uid {s_["uid"]}')
    # all 12 months + adhika present
    if len(data['months']) != 13:
        errs.append(f'expected 13 month blocks (12 + adhika), got {len(data["months"])}')
    return errs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='validate only, write nothing')
    args = ap.parse_args()

    data = build()
    errs = validate(data)

    n_adhika = sum(1 for w in data['windows'] if w['adhika'])
    print(f'windows      : {len(data["windows"])} lunar months '
          f'({data["window_start"]} .. {data["window_end"]}), {n_adhika} adhika')
    print(f'months       : {len(data["months"])} blocks, '
          f'{sum(len(m["songs"]) for m in data["months"])} song refs')
    print(f'daily        : {len(data["daily"])} slots, '
          f'{sum(len(d["songs"]) for d in data["daily"])} song refs')
    fests = data.get('festivals', [])
    print(f'festivals    : {len(fests)} dated, '
          f'{sum(len(f["songs"]) for f in fests)} song refs')

    if errs:
        print(f'\n{len(errs)} VALIDATION ERROR(S):')
        for e in errs[:20]:
            print('  -', e)
        return 1
    print('validation   : OK')

    if args.check:
        return 0

    payload = json.dumps(data, ensure_ascii=False, indent=1)
    for rel in TARGETS:
        p = os.path.normpath(os.path.join(HERE, rel))
        if not os.path.isdir(os.path.dirname(p)):
            print(f'skip (no dir) : {rel}')
            continue
        with open(p, 'w', encoding='utf-8') as f:
            f.write(payload)
        print(f'wrote        : {rel}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
