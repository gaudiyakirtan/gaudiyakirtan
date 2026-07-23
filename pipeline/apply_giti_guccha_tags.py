#!/usr/bin/env python3
"""Apply the Śrī Gauḍīya Gīti-guccha (2024 FINAL CHECK) hierarchy + tags to the corpus.

Source: an HTML export of the songbook's ordered contents, where paragraph colours encode a
hierarchy — h1 green3 = chapter, h2 green2 = section, h3 yellow = language, h4 green1 = sub-topic,
plain <p> = a song. For each song we:
  • match its title to a corpus uid (spaceless diacritic-insensitive key + prefix + fuzzy),
  • cross-check its language (the yellow header) against the corpus `language_of_origin`,
  • tag it with the GREEN thematic headers it sits under (section + sub-topic), written to the
    song JSON's `tags` (the app already renders these), and
  • save the full ordered hierarchy (with uids) to `gg_hierarchy.json` — so nothing is lost even
    though we don't tag each song with every level.
Idempotent: `tags` is replaced, not appended.
"""
import re, glob, json, os, unicodedata, difflib
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = "/tmp/gg_docx/2024GaudiyaGitigucchaSongOrder_FINALCHECK.doc.html"
CONVERTED = os.path.join(HERE, "converted")
PLATFORM_SONG_DIRS = [
    CONVERTED,
    os.path.join(HERE, "../web/src/data/songs"),
    os.path.join(HERE, "../ios/gk-ios/Resources/songs"),
    os.path.join(HERE, "../andorid/app/src/main/assets/songs"),
]
HIERARCHY_OUT = [
    os.path.join(CONVERTED, "gg_hierarchy.json"),
    os.path.join(HERE, "../web/src/data/gg_hierarchy.json"),
]

SKIP = re.compile(r'^(obeisance|obeisances|almost all|additional .*index|simple ma|new songs|see |note:|the succession|index|=+$)', re.I)


def strip_html(frag):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', frag)).strip()


def clean_hdr(t):
    if not t:
        return None
    return re.sub(r'\[[a-z0-9]{1,3}\]', '', t).replace('​', '').strip() or None


def clean_chapter(t):
    return re.sub(r'^\d+\s*', '', clean_hdr(t) or '').strip() or None


def lang_iso(y):
    if not y:
        return None
    y = clean_hdr(y).lower()
    if y.startswith('bengali'): return 'ben'
    if y.startswith('sanskrit'): return 'san'
    if y.startswith('hindi'): return 'hin'
    if y.startswith('oriya') or y.startswith('odia'): return 'ori'
    return None


def key(s):  # spaceless, diacritic-insensitive, v/b + j/y folded
    s = clean_hdr(s) or ''
    s = re.sub(r'\([^)]*\)', ' ', s)
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]', '', s).replace('v', 'b').replace('j', 'y')


# ---- parse the ordered stream ----
import html as htmllib
h = open(HTML, encoding='utf-8', errors='replace').read()
LEVEL = {'h1': 'chapter', 'h2': 'section', 'h3': 'language', 'h4': 'subtopic'}
stream = []  # ordered (level, text)
for m in re.finditer(r'<(h[1-4]|p)\b[^>]*>(.*?)</\1>', h, re.S):
    tag = m.group(1)
    t = htmllib.unescape(strip_html(m.group(2)))
    if not t:
        continue
    stream.append((LEVEL.get(tag, 'song'), t))

# ---- corpus index ----
corpus = defaultdict(list)
lang_of = {}
for f in glob.glob(os.path.join(CONVERTED, '*.json')):
    if any(x in f for x in ('_list', 'manifest', 'song_groups', 'gg_')):
        continue
    d = json.load(open(f))
    lang_of[d['uid']] = d.get('language_of_origin')
    for x in d.get('title_main', []):
        k = key(x['text'])
        if k:
            corpus[k].append(d['uid'])
ckeys = sorted(corpus)


def match(title):
    k = key(title)
    if len(k) < 4:
        return None
    if k in corpus:
        return corpus[k][0]
    if len(k) >= 10:
        pre = [c for c in ckeys if c.startswith(k)]
        if pre:
            return corpus[min(pre, key=len)][0]
        rpre = [c for c in ckeys if len(c) >= 10 and k.startswith(c)]
        if rpre:
            return corpus[max(rpre, key=len)][0]
    m = difflib.get_close_matches(k, ckeys, n=1, cutoff=0.9)
    return corpus[m[0]][0] if m else None


# ---- walk stream: build hierarchy + per-uid aggregation ----
ch = sec = lang = sub = None
started = False
hierarchy = []
agg = defaultdict(lambda: {'langs': set(), 'tags': set()})
matched = unmatched = 0
unmatched_titles = []

for level, text in stream:
    if level == 'chapter':
        started = started or bool(re.match(r'\d', text))
        ch, sec, lang, sub = text, None, None, None
        hierarchy.append({'level': 'chapter', 'title': clean_hdr(text)})
    elif level == 'section':
        sec, lang, sub = text, None, None
        hierarchy.append({'level': 'section', 'title': clean_hdr(text)})
    elif level == 'language':
        lang, sub = text, None
        hierarchy.append({'level': 'language', 'title': clean_hdr(text), 'iso': lang_iso(text)})
    elif level == 'subtopic':
        sub = text
        hierarchy.append({'level': 'subtopic', 'title': clean_hdr(text)})
    elif level == 'song' and started:
        ct = clean_hdr(text)
        if not ct or SKIP.match(ct):
            continue
        uid = match(ct)
        entry = {'level': 'song', 'title': ct, 'uid': uid}
        hierarchy.append(entry)
        if uid:
            matched += 1
            a = agg[uid]
            li = lang_iso(lang)
            if li:
                a['langs'].add(li)
            for g in (clean_hdr(sec), clean_hdr(sub)):
                if g:
                    a['tags'].add(g)
        else:
            unmatched += 1
            unmatched_titles.append(ct)

# ---- write tags into song JSONs (all platform dirs) ----
tagged_uids = {u: sorted(a['tags']) for u, a in agg.items() if a['tags']}
files_written = 0
for d in PLATFORM_SONG_DIRS:
    if not os.path.isdir(d):
        continue
    for uid, tags in tagged_uids.items():
        p = os.path.join(d, f'{uid}.json')
        if not os.path.exists(p):
            continue
        song = json.load(open(p))
        if song.get('tags') != tags:
            song['tags'] = tags
            json.dump(song, open(p, 'w'), ensure_ascii=False, indent=1)
            files_written += 1

# ---- save the hierarchy ----
for out in HIERARCHY_OUT:
    json.dump(hierarchy, open(out, 'w'), ensure_ascii=False, indent=1)

# ---- language cross-check report ----
agree = differ = 0
diffs = []
for uid, a in agg.items():
    if not a['langs']:
        continue
    dl = sorted(a['langs'])
    cur = lang_of.get(uid)
    if dl == [cur]:
        agree += 1
    elif len(dl) == 1 and cur != dl[0]:
        differ += 1
        diffs.append((uid, cur, dl[0]))

# ---- report ----
print(f"parsed stream: {len(stream)} paragraphs; songs matched {matched}, unmatched {unmatched}")
print(f"tags: {len(tagged_uids)} songs tagged with green thematic headers; {files_written} song files written across {len([d for d in PLATFORM_SONG_DIRS if os.path.isdir(d)])} dirs")
print(f"hierarchy saved: {len(hierarchy)} ordered entries -> {', '.join(os.path.relpath(o, HERE) for o in HIERARCHY_OUT)}")
print(f"language cross-check (songs with a yellow header): agree {agree}, single-value differ {differ}")
for uid, cur, dl in diffs:
    print(f"    ⚠ {uid}: corpus language_of_origin={cur!r} but doc section language={dl!r}")
open('/tmp/gg_docx/unmatched.txt', 'w').write('\n'.join(unmatched_titles))
print(f"unmatched titles ({len(unmatched_titles)}) written to /tmp/gg_docx/unmatched.txt")
