#!/usr/bin/env python3
"""Rebuild canonical audio_files from the authoritative S3 bucket listing.

The bucket's audio/ folder is the source of truth for what recordings actually exist
(754 files, 245 songs, multiple takes). Filenames are <songUid>-<artistCode>-<take>.(mp3|m4a).
Artist display names come from a code->name map derived from the legacy song JSONs' meta.artist.
Writes audio_files = [{uid:"<artistCode>-<take>", filename, artist}] per song; sets audio_available.
"""
import json, glob, os, re

HERE = os.path.dirname(__file__)
SCRATCH = "/private/tmp/claude-501/-Users-kendreaditya-workspace-gaudiyakirtan/86fd259a-aa57-444b-9ea3-14f700c6bfe8/scratchpad"
FN_RE = re.compile(r'^([A-Za-z]+\d+)-([a-z]+)-(\d+)\.(mp3|m4a)$')


def artist_map():
    """code -> display name, from legacy meta.artist (audio uid like 'tama-2' => code 'tama')."""
    m = {}
    for f in glob.glob(os.path.join(HERE, 'songs', '*.json')):
        if '_list' in f:
            continue
        try:
            d = json.load(open(f))
        except Exception:
            continue
        for a in d.get('audio', []):
            code = (a.get('uid', '') or '').split('-')[0]
            name = (a.get('meta') or {}).get('artist')
            if code and name and code not in m:
                m[code] = name
    return m


def bucket_by_song():
    idx = {}
    for line in open(os.path.join(SCRATCH, 'audio-files.txt')):
        fn = line.strip()
        mt = FN_RE.match(fn)
        if not mt:
            continue
        song_uid, code, take, _ = mt.groups()
        idx.setdefault(song_uid, []).append((code, int(take), fn))
    return idx


def main():
    names = artist_map()
    buckets = bucket_by_song()
    updated = 0
    for f in glob.glob(os.path.join(HERE, 'converted', '*.json')):
        if '_list' in f or 'manifest' in f:
            continue
        d = json.load(open(f))
        recs = buckets.get(d['uid'])
        if recs:
            recs.sort(key=lambda r: (r[0], r[1]))
            d['audio_files'] = [
                {'uid': f'{code}-{take}', 'filename': fn,
                 'artist': names.get(code, code)}
                for code, take, fn in recs
            ]
            d['audio_available'] = True
        else:
            d['audio_files'] = []
            d['audio_available'] = False
        json.dump(d, open(f, 'w'), ensure_ascii=False, indent=1)
        updated += 1
    songs_audio = sum(1 for f in glob.glob(os.path.join(HERE, 'converted', '*.json'))
                      if '_list' not in f and 'manifest' not in f
                      and json.load(open(f)).get('audio_available'))
    print(f"artist codes mapped: {len(names)}")
    print(f"songs rewritten: {updated}; now with audio: {songs_audio}")


if __name__ == '__main__':
    main()
