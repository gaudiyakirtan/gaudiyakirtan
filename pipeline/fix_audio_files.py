#!/usr/bin/env python3
"""Restore real audio filenames + artist into canonical audio_files.

Data-prep fix (orchestrator-owned). The converter degraded audio to {uid:"audio_0",
filename:"audio_0.mp3"} because the legacy audio uses `fn` (not `filename`) and carries the
artist under `meta.artist`. This maps the legacy audio array into the canonical shape
{uid, filename, artist?} using the real values. Rewrites converted/*.json in place.
"""
import json, glob, os

HERE = os.path.dirname(__file__)


def legacy_audio_index():
    idx = {}
    for f in glob.glob(os.path.join(HERE, 'songs', '*.json')):
        if '_list' in f:
            continue
        try:
            d = json.load(open(f))
        except Exception:
            continue
        if d.get('audio'):
            idx[d['uid']] = d['audio']
    return idx


def main():
    legacy = legacy_audio_index()
    fixed = 0
    for f in glob.glob(os.path.join(HERE, 'converted', '*.json')):
        if '_list' in f or 'manifest' in f:
            continue
        d = json.load(open(f))
        if not d.get('audio_files'):
            continue
        src = legacy.get(d['uid'])
        if not src:
            continue
        new = []
        for i, a in enumerate(src):
            fn = a.get('fn') or a.get('filename') or f"audio_{i}.mp3"
            entry = {'uid': a.get('uid', f'audio_{i}'), 'filename': fn}
            artist = (a.get('meta') or {}).get('artist')
            if artist:
                entry['artist'] = artist
            new.append(entry)
        if new != d['audio_files']:
            d['audio_files'] = new
            json.dump(d, open(f, 'w'), ensure_ascii=False, indent=1)
            fixed += 1
    print(f"restored real audio_files in {fixed} songs")


if __name__ == '__main__':
    main()
