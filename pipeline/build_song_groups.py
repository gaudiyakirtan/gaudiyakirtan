#!/usr/bin/env python3
"""Build song_groups.json (books + topics), merging two sources:
  1. AUDIO SRC paths (authoritative, clean) — the team's own file organization, e.g.
     "17 Ārati/[07] Śrī Gaura Ārati/..." => book "Ārati", topic "Śrī Gaura Ārati". 235 songs.
  2. Giti-guccha PDF Contents — adds non-audio songs + finer topics (matched by fuzzy title).
Src wins for book name (clean); books merged by normalized key. Junk/front-matter topics filtered.
"""
import re, json, glob, os, unicodedata, difflib
from collections import defaultdict

HERE = os.path.dirname(__file__)
SRC = "/private/tmp/claude-501/-Users-kendreaditya-workspace-gaudiyakirtan/86fd259a-aa57-444b-9ea3-14f700c6bfe8/scratchpad/ggg-contents.txt"
PAGE_NUM = re.compile(r'^(.*?)\s+([0-9]{1,3})\s*$')
NOISE = re.compile(r'g\s*ī\s*t\s*i|gau\s*ḍ\s*ī\s*ya|^[ivxl]+$|^Contents$|humbly offer|holy master|following words|Bhakti Pr|Gosvāmī M|viṣṇupāda|vedānta-ācārya|succession of|sampradāya|generation|descendants|founder|branches|caitanya mahāprabhu,$|would always|his publications|dedicate|beloved gurudeva|with the words|best amongst', re.I)


def norm(s):  # for title matching (search-style)
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.lower().replace('v', 'b').replace('j', 'y')
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', s)).strip()


def bkey(s):  # canonical book/topic key (merge duplicates across sources)
    s = unicodedata.normalize('NFD', s.lower().replace('�', ''))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)


BOOK_CLEAN = {  # OCR-mangled PDF book headers -> clean name (bkey-matched)
    'srguru': 'Śrī Guru', 'srgauranga': 'Śrī Gaurāṅga', 'srradha': 'Śrī Rādhā',
    'srkrsna': 'Śrī Kṛṣṇa', 'srsiksastaka': 'Śrī Śikṣāṣṭaka', 'srekadasi': 'Śrī Ekādaśī',
    'sriekadasi': 'Śrī Ekādaśī',
    'mahaprasada': 'Mahā-prasāda', 'saranagati': 'Śaraṇāgati', 'arati': 'Ārati',
    'vaisnavas': 'Vaiṣṇavas',
}


def clean_book(name):
    return BOOK_CLEAN.get(bkey(name), name.replace('�', 'ī'))


def is_junk_topic(t):
    if not t:
        return True
    if len(t) > 42 or NOISE.search(t) or '�' in t:   # sentence fragments / colophon / OCR-mangled
        return True
    if re.search(r'\.(mp3|m4a)$|_', t):              # leaked filename
        return True
    return t[:1].islower() and ' ' in t              # lowercase running text, not a heading


# ---- source 1: audio src (authoritative) ----
src_book, src_topic = {}, {}
for f in glob.glob(os.path.join(HERE, 'songs', '*.json')):
    if '_list' in f:
        continue
    try:
        d = json.load(open(f))
    except Exception:
        continue
    for a in d.get('audio', []):
        parts = ((a.get('meta') or {}).get('src', '')).split('/')
        if len(parts) >= 2:
            book = re.sub(r'^\d+\s*', '', parts[0]).strip()
            if book:
                src_book[d['uid']] = book
                if len(parts) >= 3:   # book/topic/file — only then is parts[1] a real subsection
                    topic = re.sub(r'^\[\d+\]\s*', '', parts[1]).strip()
                    if topic and topic != book and not re.search(r'\.(mp3|m4a)$|_', topic):
                        src_topic[d['uid']] = topic
            break

# ---- source 2: PDF contents (fuzzy-matched) ----
corpus = {}
for f in glob.glob(os.path.join(HERE, 'converted', '*.json')):
    if any(x in f for x in ('_list', 'manifest', 'song_groups')):
        continue
    d = json.load(open(f))
    for t in d.get('title_main', []):
        corpus.setdefault(norm(t['text']), d['uid'])
ckeys = list(corpus)


def match(title):
    n = norm(title)
    if n in corpus:
        return corpus[n]
    m = difflib.get_close_matches(n, ckeys, n=1, cutoff=0.84)
    return corpus[m[0]] if m else None


pdf_book, pdf_topic = {}, {}
cur_b = cur_t = None
for raw in open(SRC):
    line = raw.rstrip('\n')
    if not line.strip():
        continue
    ind = len(line) - len(line.lstrip())
    text = line.strip()
    if NOISE.search(text) or set(text) <= {'.', ' ', '-'} or re.search(r'\s{2,}[ivxlcdm]{2,}\.?\s*$', text, re.I):
        continue
    m = PAGE_NUM.match(line)
    if m and m.group(1).strip() and not NOISE.search(m.group(1)):
        uid = match(m.group(1).strip())
        if uid:
            if cur_b:
                pdf_book.setdefault(uid, cur_b)
            if cur_t and not is_junk_topic(cur_t):
                pdf_topic.setdefault(uid, cur_t)
    elif ind >= 15:
        cur_b, cur_t = text, None
    else:
        cur_t = text

# ---- merge: src book wins; register canonical display names ----
book_name = {}   # bkey -> display (src clean names preferred, registered first)
for uid, b in src_book.items():
    book_name.setdefault(bkey(clean_book(b)), clean_book(b))
for uid, b in pdf_book.items():
    cb = clean_book(b)
    book_name.setdefault(bkey(cb), cb)

song_book, song_topic = {}, {}
for uid in set(src_book) | set(pdf_book):
    b = clean_book(src_book.get(uid) or pdf_book.get(uid))
    disp = book_name[bkey(b)]
    song_book[uid] = disp
    t = src_topic.get(uid) or pdf_topic.get(uid)
    if t and not is_junk_topic(t):
        song_topic[uid] = (disp, t)

# ---- assemble groups ----
books = defaultdict(list)
for uid, b in song_book.items():
    books[b].append(uid)
topics = defaultdict(list)
for uid, (b, t) in song_topic.items():
    topics[(b, t)].append(uid)

groups = []
colors = ['#B36B00', '#8CB4FF', '#7A5FAf', '#3F8C6E', '#B0553A', '#9C6B3F']
for i, (b, uids) in enumerate(sorted(books.items(), key=lambda x: -len(x[1]))):
    groups.append({'uid': 'book-' + bkey(b)[:26], 'kind': 'book', 'ordered': True,
                   'titles': [{'script_code': 'Latn', 'text': b}],
                   'song_uids': sorted(set(uids)), 'color': colors[i % len(colors)]})
for (b, t), uids in sorted(topics.items()):
    if len(uids) < 1:
        continue
    groups.append({'uid': 'topic-' + bkey(b)[:12] + '-' + bkey(t)[:16], 'kind': 'topic',
                   'ordered': False, 'titles': [{'script_code': 'Latn', 'text': t}],
                   'song_uids': sorted(set(uids))})

json.dump(groups, open(os.path.join(HERE, 'converted', 'song_groups.json'), 'w'),
          ensure_ascii=False, indent=1)
nb = sum(1 for g in groups if g['kind'] == 'book')
nt = sum(1 for g in groups if g['kind'] == 'topic')
placed = len(song_book)
print(f"songs placed in a book: {placed}  (src {len(src_book)} + pdf-only {placed-len(src_book)})")
print(f"groups: {nb} books, {nt} topics")
print("books:", [g['titles'][0]['text'] for g in groups if g['kind'] == 'book'])
