#!/usr/bin/env python3
"""Emit multi-script renderings of every reciter (performer) name, so the tracks list and the search
palette can show a performer's name in the reader's listLanguage instead of only romanized —
matching how song titles and authors already behave.

Reciters had no script variants at all: `audio_files[].artist` is a single romanized string. Their
names are Gauḍīya-Vaiṣṇava devotional names (Sanskrit/Bengali), so they transliterate like any title.
This script:

  1. Takes the authoritative romanized names (fix_reciter_names.CANON) as the `Latn` rendering.
  2. Uses a hand-authored **IAST** per name (IAST_NAMES below) — the loose romanization ("Krsna das")
     is not clean enough to transliterate directly, so the diacritics are supplied by hand.
  3. Transliterates the IAST to each Indic script with aksharamukha (the engine that romanized the
     corpus), **token by token**, keeping non-Sanskrit pieces in Latin: sannyāsī initialisms (BV, BP,
     BR), place qualifiers (Bay Area, Florida, UK), and `&`. Transliterating "BV" would be nonsense;
     a place name is not a Sanskrit word.

Output: web/src/data/reciter_names.json = { "<code>": [ {script_code, text}, ... ] }, keyed by the
artist code (the prefix of each recording's audio_files[].uid). The tracks page and gen-markdown join
by that code. Bundled in src (small), read server-side in getStaticProps and the build script.
"""
import json
import os
import re

from aksharamukha import transliterate as ak

from fix_reciter_names import CANON  # code -> authoritative romanized name

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../web/src/data/reciter_names.json")

# aksharamukha script name -> corpus script_code. Same Indic set the titles carry (Cyrillic omitted —
# these names' Latin qualifiers do not Cyrillicize meaningfully).
SCRIPTS = {
    "Bengali": "Beng", "Devanagari": "Deva", "Telugu": "Telu", "Kannada": "Knda",
    "Malayalam": "Mlym", "Gujarati": "Gujr", "Oriya": "Orya", "Tamil": "Taml",
}

# Hand-authored IAST for each code. The Sanskrit/Bengali core carries diacritics; initialisms and
# English qualifiers stay plain ASCII so the transliterator leaves them alone (see keep_latin).
IAST_NAMES = {
    "anad": "anādi kṛṣṇa dāsa",
    "bppm": "śrīla BP purī gosvāmī mahārāja",
    "brsm": "śrīla BR śrīdhara gosvāmī mahārāja",
    "bvnm": "śrīla BV nārāyaṇa gosvāmī mahārāja",
    "bvsm": "śrīla BV svāmī prabhupāda",
    "bvtm": "śrīla BV trivikrama gosvāmī mahārāja",
    "casu": "candrakānta & sucandra",
    "damo": "dāmodara dāsa",
    "gaur": "gaurasundara dāsa",
    "hakr": "hare kṛṣṇa dāsa",
    "jahn": "jāhnavā dāsī",
    "jana": "jānakī dāsī",
    "jays": "jaya śrī dāsī",
    "kana": "kānāi prabhu",
    "kimo": "kiśorī mohana dāsa",
    "krsb": "kṛṣṇa dāsa bābājī",
    "krsn": "kṛṣṇadāsa dāsa",
    "madh": "madhukara dāsa",
    "maya": "māyāpura gurukula",
    "mith": "miṭhu dāsī",
    "muni": "BV muni mahārāja",
    "nank": "nanda kiśora dāsa",
    "pare": "pareśānanda dāsa",
    "rash": "rādheśa dāsa",
    "rasi": "rasika dāsī",
    "rauk": "rādhikā dāsī (UK)",
    "raus": "rādhikā dāsī (Bay Area)",
    "rpri": "rādhā priyā dāsī",
    "sadh": "BV sādhu mahārāja",
    "sara": "sarasvatī dāsī",
    "sesa": "śeṣaśāyī prabhu",
    "sggm": "śrīla gaura govinda gosvāmī mahārāja",
    "shbi": "śyāma-bihārī dāsa",
    "srav": "śravaṇa dāsa",
    "srrb": "sudarśana dāsa (rādhā-ramaṇa bābājī mahārāja)",
    "srvi": "śrī vidyābhūṣaṇa",
    "sude": "sudevī dāsī",
    "sudf": "sudarśana dāsa (Florida)",
    "suma": "sumana bhaṭṭācārya",
    "tama": "tamāla kṛṣṇa dāsa",
    "taru": "BV tīrtha mahārāja",
    "tirt": "taruṇa kṛṣṇa",
    "vija": "vijaya dāsa",
    "vraj": "vraja mohana dāsa",
}

ENGLISH_WORDS = {"Bay", "Area", "Florida", "UK"}


def keep_latin(word):
    """A token that must NOT be transliterated: a sannyāsī initialism, an English place word, or
    pure punctuation."""
    if not word:
        return True
    if re.fullmatch(r"[A-Z]{2,}", word):  # BV, BP, BR, UK
        return True
    if word in ENGLISH_WORDS:
        return True
    if re.fullmatch(r"[^\w]+", word):  # &, stray punctuation
        return True
    return False


def to_script(iast, ak_script):
    """Transliterate `iast` to a script, leaving keep-Latin tokens (and parentheses) intact."""
    out = []
    for tok in re.split(r"(\s+)", iast):
        if not tok or tok.isspace():
            out.append(tok)
            continue
        pre, mid, post = re.match(r"^(\(*)(.*?)(\)*)$", tok).groups()
        if keep_latin(mid):
            out.append(tok)
        else:
            out.append(pre + ak.process("IAST", ak_script, mid) + post)
    return "".join(out)


def main():
    missing = sorted(set(CANON) - set(IAST_NAMES))
    if missing:
        raise SystemExit(f"IAST missing for codes: {missing}")

    table = {}
    for code, iast in IAST_NAMES.items():
        rows = [{"script_code": "Latn", "text": CANON[code]}]
        for ak_name, sc in SCRIPTS.items():
            rows.append({"script_code": sc, "text": to_script(iast, ak_name)})
        table[code] = rows

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(table, f, ensure_ascii=False, indent=0)
    print(f"wrote {len(table)} reciters × {1 + len(SCRIPTS)} scripts -> {os.path.relpath(OUT, HERE)}")
    print("sample:", json.dumps(table["tama"], ensure_ascii=False))


if __name__ == "__main__":
    main()
