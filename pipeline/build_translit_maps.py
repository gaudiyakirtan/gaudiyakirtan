#!/usr/bin/env python3
"""Emit per-script transliteration maps (native Brahmic script -> IAST) for the web query
transliterator (web/src/services/translit.ts).

Why this exists: the search index ships romanized (IAST) text only, so a query typed in Bengali or
Devanagari matches nothing. Rather than ship a second index per script (~900 KB each), the web app
romanizes the *query* on a non-Latin keystroke and searches the one Latin index. Retrieval is ~100%
because Duet is fuzzy and its normalizer strips diacritics anyway (see the search-lab PoC).

The maps are generated from **aksharamukha** — the same engine the pipeline used to romanize the
corpus — so a runtime romanization lines up with the indexed text by construction. Output is a small
static JSON committed to web/public/; the scripts do not change, so this runs on demand, not every
build.

The map is deliberately shallow: per script, the IAST for each independent vowel, the bare form of
each consonant (no inherent vowel), the vowel each dependent sign (matra) stands for, which codepoint
is the virama, and the anusvara/visarga/candrabindu marks. The ~40-line JS assembler in translit.ts
applies the abugida rules (a consonant carries an inherent 'a'; a matra replaces it; a virama drops
it) — the maps carry only the alphabet, not the logic.
"""
import json
import os
import unicodedata

from aksharamukha import transliterate as ak

# Bundled in src (2 KB gzipped), not fetched from public/: the query transliterator must run
# synchronously on each keystroke, so the map cannot be a lazily-loaded file that might not be there
# yet.
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../web/src/data/translit-maps.json")

# script_code -> (aksharamukha source name, unicode block start, end)
SCRIPTS = {
    "Deva": ("Devanagari", 0x0900, 0x097F),
    "Beng": ("Bengali", 0x0980, 0x09FF),
    "Gujr": ("Gujarati", 0x0A80, 0x0AFF),
    "Orya": ("Oriya", 0x0B00, 0x0B7F),
    "Taml": ("Tamil", 0x0B80, 0x0BFF),
    "Telu": ("Telugu", 0x0C00, 0x0C7F),
    "Knda": ("Kannada", 0x0C80, 0x0CFF),
    "Mlym": ("Malayalam", 0x0D00, 0x0D7F),
}

# Independent-vowel letter names (the suffix after "<SCRIPT> LETTER "); everything else that is a
# LETTER is a consonant.
VOWEL_LETTERS = {
    "A", "AA", "I", "II", "U", "UU", "E", "EE", "AI", "O", "OO", "AU",
    "VOCALIC R", "VOCALIC RR", "VOCALIC L", "VOCALIC LL",
    "CANDRA E", "CANDRA O", "SHORT E", "SHORT O", "SHORT A",
}


def iast(source, text):
    try:
        return ak.process(source, "IAST", text)
    except Exception:
        return ""


def build_script(source, lo, hi):
    """Classify every codepoint in the block and derive its IAST via aksharamukha."""
    ref_cons = None      # a reference consonant (KA) to derive matra vowels against
    virama_char = None
    vowels, consonants, matras, marks, digits = {}, {}, {}, {}, {}
    letters = []

    for cp in range(lo, hi + 1):
        ch = chr(cp)
        try:
            name = unicodedata.name(ch)
        except ValueError:
            continue
        short = name.split(" LETTER ")[-1] if " LETTER " in name else None

        if "VIRAMA" in name or "PULLI" in name:  # Tamil calls it PULLI
            virama_char = ch
        elif "VOWEL SIGN" in name:
            matras[ch] = cp  # resolved below, once we know the reference consonant
        elif "SIGN ANUSVARA" in name:
            marks[ch] = "ṁ"
        elif "SIGN VISARGA" in name:
            marks[ch] = "ḥ"
        elif "SIGN CANDRABINDU" in name or "CANDRABINDU" in name:
            marks[ch] = "m̐"
        elif "DIGIT" in name:
            digits[ch] = iast(source, ch)
        elif " LETTER " in name:
            if short in VOWEL_LETTERS:
                vowels[ch] = iast(source, ch)
            else:
                letters.append(ch)
                if short == "KA" and ref_cons is None:
                    ref_cons = ch

    if ref_cons is None and letters:
        ref_cons = letters[0]

    # Bare consonant = consonant + virama (drops the inherent 'a'): क् -> "k".
    ref_prefix = iast(source, ref_cons + virama_char) if virama_char else ""
    for ch in letters:
        bare = iast(source, ch + virama_char) if virama_char else iast(source, ch).rstrip("a")
        consonants[ch] = bare

    # Matra vowel = (reference consonant + matra) with the bare-consonant prefix removed: का -> "ā".
    resolved = {}
    for ch in matras:
        full = iast(source, ref_cons + ch)
        resolved[ch] = full[len(ref_prefix):] if full.startswith(ref_prefix) else full
    matras = resolved

    return {
        "vowels": vowels,
        "consonants": consonants,
        "matras": matras,
        "virama": virama_char or "",
        "marks": marks,
        "digits": digits,
    }


def main():
    out = {}
    for code, (source, lo, hi) in SCRIPTS.items():
        out[code] = build_script(source, lo, hi)
        m = out[code]
        print(f"{code}: {len(m['vowels'])} vowels, {len(m['consonants'])} consonants, "
              f"{len(m['matras'])} matras, {len(m['marks'])} marks")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"\nwrote {OUT} ({os.path.getsize(OUT)} bytes)")


if __name__ == "__main__":
    main()
