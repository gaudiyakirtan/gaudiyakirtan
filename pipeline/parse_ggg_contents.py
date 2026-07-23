#!/usr/bin/env python3
"""Parse the Gaudiya Giti-guccha Contents into a book>topic>song hierarchy.

Layout heuristics (from `pdftotext -layout`):
  - trailing arabic page number + indented  -> SONG (title = text before the number)
  - centered (big leading indent), no number -> BOOK (major section)
  - left/lightly indented, no number         -> TOPIC (sub-section)
  - running headers / roman page markers / blank -> skip
Prints the parsed hierarchy for inspection (matching to corpus uids happens next).
"""
import re, sys

SRC = "/private/tmp/claude-501/-Users-kendreaditya-workspace-gaudiyakirtan/86fd259a-aa57-444b-9ea3-14f700c6bfe8/scratchpad/ggg-contents.txt"
PAGE_NUM = re.compile(r'^(.*?)\s+([0-9]{1,3})\s*$')
NOISE = re.compile(r'g\s*ī\s*t\s*i|gau\s*ḍ\s*ī\s*ya|^[ivxl]+$|^Contents$|humbly offer|holy master|gurudeva|paramparā|generation|founder|branches|following words|Bhakti Pr|Gosvāmī M|viṣṇupāda|vedānta-ācārya', re.I)


def main():
    books, cur_book, cur_topic = [], None, None
    for raw in open(SRC):
        line = raw.rstrip('\n')
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip())
        text = line.strip()
        if NOISE.search(text):
            continue
        m = PAGE_NUM.match(line)
        if m and m.group(1).strip():
            title = m.group(1).strip()
            if NOISE.search(title):
                continue
            # a "song" line: indented with a page number
            if cur_book is None:
                cur_book = {'title': 'Front Matter', 'topics': []}; books.append(cur_book)
            if cur_topic is None:
                cur_topic = {'title': None, 'songs': []}; cur_book['topics'].append(cur_topic)
            cur_topic['songs'].append({'title': title, 'page': int(m.group(2))})
        else:
            # a header with no page number
            if indent >= 15:      # centered -> BOOK
                cur_book = {'title': text, 'topics': []}; books.append(cur_book)
                cur_topic = None
            else:                  # left/light -> TOPIC
                cur_topic = {'title': text, 'songs': []}
                if cur_book is None:
                    cur_book = {'title': 'Front Matter', 'topics': []}; books.append(cur_book)
                cur_book['topics'].append(cur_topic)
    # summary
    nsong = sum(len(t['songs']) for b in books for t in b['topics'])
    print(f"BOOKS: {len(books)}   SONGS: {nsong}\n")
    for b in books:
        bn = sum(len(t['songs']) for t in b['topics'])
        print(f"■ {b['title']}  ({bn} songs, {len(b['topics'])} topics)")
        for t in b['topics'][:4]:
            names = ', '.join(s['title'] for s in t['songs'][:2])
            print(f"    – {t['title']}: {names}{'...' if len(t['songs'])>2 else ''}")
    import json
    json.dump(books, open(sys.argv[1], 'w') if len(sys.argv) > 1 else sys.stdout, ensure_ascii=False, indent=1) if len(sys.argv) > 1 else None


if __name__ == '__main__':
    main()
