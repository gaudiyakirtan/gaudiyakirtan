#!/usr/bin/env python3
"""Rebuild song_groups.json (Books + Topics) from the authoritative Śrī Gauḍīya Gīti-guccha
hierarchy (gg_hierarchy.json), replacing the old audio-folder-derived groups.

The old groups conflated three things under "book" (languages, themes, actual works) and had 188
mostly single-song junk "topics". This rebuild applies a clean Gauḍīya-Vaiṣṇava taxonomy:

  • TOPIC  = a theme/subject (the Gīti-guccha's thematic chapters: Śrī Guru, Śrī Kṛṣṇa, Śrī Rādhā,
             Chant the Holy Name, Ārati, …). Grouped by subject.
  • BOOK   = a named literary WORK. Two kinds:
      – whole-chapter works: Śaraṇāgati, Śrī Śikṣāṣṭaka, Śrī Upadeśāmṛta, Śrī Nāmāṣṭaka;
      – cross-cutting SOURCE books identified from sub-topic headers ("… from Kalyāṇa-kalpataru",
        "… from Gītāvalī", Navadvīpa-dhāma-māhātmya / -bhāva-taraṅga, Manaḥ-śikṣā).
    A song can carry a topic AND a source-book (e.g. a Kalyāṇa-kalpataru song under the
    "Awakening to One's Ultimate Welfare" theme).

`--write` applies to converted/ + all three platform data dirs; default is a dry-run report.
"""
import re, json, os, sys, unicodedata
from collections import defaultdict, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
HIER = os.path.join(HERE, "converted/gg_hierarchy.json")
if not os.path.exists(HIER):
    HIER = os.path.join(HERE, "../web/src/data/gg_hierarchy.json")
OUT_DIRS = [
    os.path.join(HERE, "converted"),
    os.path.join(HERE, "../web/src/data"),
    os.path.join(HERE, "../ios/gk-ios/Resources"),
    os.path.join(HERE, "../andorid/app/src/main/assets"),
]

# chapters whose whole content IS a named work -> a BOOK (clean title)
BOOK_CHAPTERS = {
    "Śrī Nāmāṣṭaka": "Śrī Nāmāṣṭaka",
    "Śrī Śikṣāṣṭaka": "Śrī Śikṣāṣṭaka",
    "Śrī Upadeśāmṛta": "Śrī Upadeśāmṛta",
    "Śaraṇāgati": "Śaraṇāgati",
}
# sub-topic header patterns that name a SOURCE book -> that book (cross-cutting)
SOURCE_BOOKS = [
    (re.compile(r'kaly[aā].?.?[- ]?kalpataru', re.I), "Kalyāṇa-kalpataru"),
    (re.compile(r'from\s+gītāvalī|gitavali', re.I), "Gītāvalī"),
    (re.compile(r'navadvīpa[- ]dhāma[- ]māhātmya', re.I), "Navadvīpa-dhāma-māhātmya"),
    (re.compile(r'navadvīpa[- ]bhāva[- ]taraṅga', re.I), "Navadvīpa-bhāva-taraṅga"),
    (re.compile(r'manaḥ[- ]śikṣā', re.I), "Śrī Manaḥ-śikṣā"),
]

BOOK_COLORS = ['#B36B00', '#8C6D3F', '#7A5FAF', '#3F6FB0', '#4A7A5A', '#9C6B3F', '#6E5AA8', '#8A5A3A', '#5A7A8C']
TOPIC_COLORS = ['#B0553A', '#3F8C6E', '#7A5FAf', '#B36B00', '#3F6FB0', '#8C5A7A', '#5A8C6E', '#9C6B3F', '#6E6E8C', '#8CB4FF', '#B08C3A', '#6E8C3F', '#8C3F6E', '#3F8C8C', '#B03A5A']


def slug(s):
    # NFD-fold diacritics first (ś→s, ā→a, ṇ→n) so the slug is clean ASCII, not letters dropped.
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)[:26]


def main(write):
    h = json.load(open(HIER))
    chapter = subtopic = None
    started = False
    book_songs = OrderedDict()   # book title -> [uids] (insertion order)
    topic_songs = OrderedDict()  # topic title -> [uids]

    for e in h:
        lvl = e['level']
        if lvl == 'chapter':
            chapter = re.sub(r'^\d+\s*', '', e['title']).strip().rstrip('!').strip()
            subtopic = None
            started = chapter.lower() != 'appendix'   # the doc appendix is not a topic
        elif lvl == 'section':
            subtopic = e['title']
        elif lvl == 'subtopic':
            subtopic = e['title']
        elif lvl == 'song' and started and e.get('uid'):
            uid = e['uid']
            # source book from the current sub-topic header?
            src_book = None
            for rx, name in SOURCE_BOOKS:
                if subtopic and rx.search(subtopic):
                    src_book = name
                    break
            if chapter in BOOK_CHAPTERS:                       # whole-chapter work -> book only
                book_songs.setdefault(BOOK_CHAPTERS[chapter], []).append(uid)
            else:                                              # thematic chapter -> topic
                topic_songs.setdefault(chapter, []).append(uid)
            if src_book:                                       # + a source book, if named
                book_songs.setdefault(src_book, []).append(uid)

    def dedup(d):
        return OrderedDict((k, list(dict.fromkeys(v))) for k, v in d.items() if v)

    book_songs, topic_songs = dedup(book_songs), dedup(topic_songs)

    groups = []
    for i, (title, uids) in enumerate(book_songs.items()):
        groups.append({'uid': 'book-' + slug(title), 'kind': 'book', 'ordered': True,
                       'titles': [{'script_code': 'Latn', 'text': title}],
                       'song_uids': sorted(set(uids)), 'color': BOOK_COLORS[i % len(BOOK_COLORS)]})
    # Drop tiny "topics" (the old data's single-song-topic problem): a topic needs a real cluster.
    TOPIC_MIN = 4
    topic_songs = OrderedDict((t, u) for t, u in topic_songs.items() if len(set(u)) >= TOPIC_MIN)
    for i, (title, uids) in enumerate(topic_songs.items()):
        groups.append({'uid': 'topic-' + slug(title), 'kind': 'topic', 'ordered': False,
                       'titles': [{'script_code': 'Latn', 'text': title}],
                       'song_uids': sorted(set(uids)), 'color': TOPIC_COLORS[i % len(TOPIC_COLORS)]})

    # ---- report ----
    print(f"BOOKS ({len(book_songs)}):")
    for t, u in book_songs.items():
        print(f"  {len(set(u)):3}  {t}")
    print(f"TOPICS ({len(topic_songs)}):")
    for t, u in topic_songs.items():
        print(f"  {len(set(u)):3}  {t}")
    total_songs = len(set(sum(book_songs.values(), []) + sum(topic_songs.values(), [])))
    print(f"distinct songs grouped: {total_songs}")

    if not write:
        print("\n(dry run — pass --write to apply to all 4 data dirs)")
        return
    for d in OUT_DIRS:
        if os.path.isdir(d):
            json.dump(groups, open(os.path.join(d, 'song_groups.json'), 'w'), ensure_ascii=False, indent=1)
    print(f"\nwrote song_groups.json ({len(groups)} groups) to {sum(1 for d in OUT_DIRS if os.path.isdir(d))} dirs")


if __name__ == '__main__':
    main('--write' in sys.argv)
