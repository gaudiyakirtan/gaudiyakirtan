#!/usr/bin/env python3
"""Resolve master-text flags that leaked into title_main / author_display / notes.

Data-prep fix (orchestrator-owned, like the conversion pipeline). The pipeline resolves
[FLAG_*] markers inside display_scripts but left them in title_main text. Per
docs/data/README.md, flags must never render literally. Latin: [FLAG_HYPHEN_ALPHA] -> '-';
any other stray flag is stripped. Non-Latin titles carry no flags. Rewrites converted/*.json
in place, then the manifest is regenerated separately.
"""
import json, glob, os, re

FLAG_RE = re.compile(r'\[FLAG_[A-Z_]+\]')


def resolve(text: str) -> str:
    # [FLAG_HYPHEN_ALPHA] is an alphabet-join hyphen in the roman master
    text = text.replace('[FLAG_HYPHEN_ALPHA]', '-')
    # defensively drop any other stray flag token
    return FLAG_RE.sub('', text)


def main():
    here = os.path.dirname(__file__)
    files = [f for f in glob.glob(os.path.join(here, 'converted', '*.json'))
             if '_list' not in f and 'manifest' not in f]
    changed = 0
    for f in files:
        d = json.load(open(f))
        touched = False
        for group in ('title_main', 'author_display'):
            for item in d.get(group, []):
                if FLAG_RE.search(item.get('text', '')):
                    item['text'] = resolve(item['text']); touched = True
        for n in d.get('notes', []):
            if isinstance(n, dict) and FLAG_RE.search(n.get('text', '')):
                n['text'] = resolve(n['text']); touched = True
        if touched:
            json.dump(d, open(f, 'w'), ensure_ascii=False, indent=1)
            changed += 1
    print(f"resolved flags in {changed} song files")


if __name__ == '__main__':
    main()
