#!/usr/bin/env python3
"""Fix 35 Hindi titles where Devanagari text was mislabeled script_code=Latn.

Data-prep fix (orchestrator-owned). The pipeline left the Devanagari original in the
title's `Latn` entry with no romanization, so these songs have no roman title (breaking the
A-Z index and the romanized header). Transliterate Deva -> IAST for the Latn entry, and make
sure a proper Deva-script entry exists. Rewrites converted/*.json in place.
"""
import json, glob, os, re
from aksharamukha import transliterate

DEVA = re.compile(r'[ऀ-ॿ]')


def main():
    here = os.path.dirname(__file__)
    files = [f for f in glob.glob(os.path.join(here, 'converted', '*.json'))
             if '_list' not in f and 'manifest' not in f]
    fixed = 0
    for f in files:
        d = json.load(open(f))
        tm = d.get('title_main', [])
        latn_bad = next((t for t in tm
                         if t.get('script_code') == 'Latn' and DEVA.search(t.get('text', ''))), None)
        if not latn_bad:
            continue
        deva_text = latn_bad['text']
        roman = transliterate.process('Devanagari', 'IAST', deva_text)
        # ensure a native Deva entry exists
        if not any(t.get('script_code') == 'Deva' for t in tm):
            tm.insert(0, {'script_code': 'Deva', 'text': deva_text})
        # fix the Latn entry to the romanization
        latn_bad['text'] = roman
        latn_bad['standard'] = 'IAST'
        d['title_main'] = tm
        json.dump(d, open(f, 'w'), ensure_ascii=False, indent=1)
        fixed += 1
        if fixed <= 5:
            print(f"  {d['uid']}: {deva_text[:30]!r} -> {roman[:40]!r}")
    print(f"fixed {fixed} Hindi titles")


if __name__ == '__main__':
    main()
