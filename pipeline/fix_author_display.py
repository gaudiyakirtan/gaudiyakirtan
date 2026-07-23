#!/usr/bin/env python3
"""Populate a romanized (IAST) author name into every song's `author_display`.

Root cause (screens/song-detail): `title_main` ships Beng + Latn, but `author_display` shipped
Beng-only (565 songs) or empty with the raw Bengali stuck in `author_uid` (138 songs). So the
reader, set to Roman, had no Latn author string to show and fell back to Bengali.

Fix: for each song, ensure `author_display = [<native>, {Latn IAST}]`. The IAST comes from a
curated map keyed by a *draft* transliteration (Aksharamukha, with Bengali ৱ→ব normalized so the
inherent vowels/conjuncts syllabify correctly) — keying by the draft (ASCII-ish) avoids
transcribing Bengali here. Curated finals apply Gaudiya/GVP conventions (v for ৱ/ব in proper
nouns, single -ārya, split śrī/śrīmad prefixes). Runs in-place over every target song dir so all
three platforms stay byte-identical.
"""
import re, json, glob, os, sys, unicodedata
from aksharamukha import transliterate

TARGETS = [
    "converted",
    "../web/src/data/songs",
    "../ios/gk-ios/Resources/songs",
    "../andorid/app/src/main/assets/songs",
]
HERE = os.path.dirname(os.path.abspath(__file__))


def is_beng(s):
    return any('ঀ' <= c <= '৿' for c in s)


def is_deva(s):
    return any('ऀ' <= c <= 'ॿ' for c in s)


def draft(uid, beng):
    """Deterministic draft romanization used as the CANON lookup key.

    The uid is the stable identity: when it embeds an IAST after '~', that is authoritative and
    is used even once a native Beng entry exists (keeps the pass idempotent)."""
    if '~' in uid:                       # uid already embeds an authoritative IAST after '~'
        return uid.split('~', 1)[1].strip()
    src = beng or uid
    if is_beng(src):
        return transliterate.process('Bengali', 'IAST', src.replace('ৱ', 'ব')).strip()
    if is_deva(src):
        return transliterate.process('Devanagari', 'IAST', src).strip()
    return src.strip()                   # already Latin


# draft (Aksharamukha, ৱ→ব) -> canonical IAST display
CANON = {
    'ajānā lekhaka': 'Unknown Author',
    'The Gaudiya Kirtan Team': 'The Gaudiya Kirtan Team',
    'Unknown Author': 'Unknown Author',
    'śrīla bhaktisiddhānta sarasbatī gosbāmī prabhupāda': 'Śrīla Bhaktisiddhānta Sarasvatī Gosvāmī Prabhupāda',
    'śrīla bhaktibinoda ṭhākura': 'Śrīla Bhaktivinoda Ṭhākura',
    'śrīla kṛṣṇadāsa kabirāja gosbāmī': 'Śrīla Kṛṣṇadāsa Kavirāja Gosvāmī',
    'śrīla locana dāsa ṭhākura': 'Śrīla Locana dāsa Ṭhākura',
    'śrīla narottama dāsa ṭhākura': 'Śrīla Narottama dāsa Ṭhākura',
    'śrīla premānanda dāsa ṭhākura': 'Śrīla Premānanda dāsa Ṭhākura',
    'śrīla raghunātha dāsa gosbāmī': 'Śrīla Raghunātha dāsa Gosvāmī',
    'śrīla rūpa gosbāmī': 'Śrīla Rūpa Gosvāmī',
    'śrīla biśbanātha cakrabartī ṭhākura': 'Śrīla Viśvanātha Cakravartī Ṭhākura',
    'śrīla bṛndābana dāsa ṭhākura': 'Śrīla Vṛndāvana dāsa Ṭhākura',
    'mīrābāi': 'Mīrābāi',
    'śrīmadbhaktivedānta nārāyaṇa gosvāmī mahārāja': 'Śrīmad Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja',
    'ananta dāsa': 'Ananta dāsa',
    'kṛṣṇadāsa': 'Kṛṣṇadāsa',
    'gobinda dāsa': 'Govinda dāsa',
    'gobinda dāsa kabirāja': 'Govinda dāsa Kavirāja',
    'gaurīdāsa paṇḍita': 'Gaurīdāsa Paṇḍita',
    'ghanaśyāma dāsa': 'Ghanaśyāma dāsa',
    'jagadānanda paṇḍita': 'Jagadānanda Paṇḍita',
    'jñānadāsa': 'Jñānadāsa',
    'debakīnandana dāsa': 'Devakīnandana dāsa',
    'dbija haridāsa': 'Dvija Haridāsa',
    'narahari dāsa': 'Narahari dāsa',
    'naẏanānanda dāsa': 'Nayanānanda dāsa',
    'premadāsa': 'Prema dāsa',
    'baṃśīdāsa': 'Vaṁśīdāsa',
    'banamālī': 'Vanamālī',
    'balarāma dāsa': 'Balarāma dāsa',
    'basudeba ghoṣa': 'Vāsudeva Ghoṣa',
    'bāsudeba ghoṣa': 'Vāsudeva Ghoṣa',
    'bṛndābana dāsa': 'Vṛndāvana dāsa',
    'baiṣṇaba dāsa': 'Vaiṣṇava dāsa',
    'Vaiṣṇava dāsa (aka Śrī Gopāla-govinda Mahānta)': 'Vaiṣṇava dāsa (aka Śrī Gopāla-govinda Mahānta)',
    'baiṣṇabadāsa': 'Vaiṣṇava dāsa',
    'manohara dāsa': 'Manohara dāsa',
    'mādhaba dāsa': 'Mādhava dāsa',
    'rādhāballabha dāsa': 'Rādhāvallabha dāsa',
    'rādhāmohana dāsa': 'Rādhāmohana dāsa',
    'rāmānanda dāsa': 'Rāmānanda dāsa',
    'śibānanda': 'Śivānanda',
    'śrī satyabrata muni)': 'Śrī Satyavrata Muni',
    'śrī satyabrata muni': 'Śrī Satyavrata Muni',
    'śrīmadbhaktibibeka bhāratī gosbāmī mahārāja': 'Śrīmad Bhakti Viveka Bhāratī Gosvāmī Mahārāja',
    'śrīkṛṣṇadbaipāẏana bedabyāsa': 'Śrī Kṛṣṇa-dvaipāyana Vedavyāsa',
    'śrīgopālatāpanīẏa-śrutidhṛtam': 'Śrī Gopāla-tāpanī Śruti',
    'śrīcaṇḍīdāsa': 'Śrī Caṇḍīdāsa',
    'śrīcaitanya mahāprabhu': 'Śrī Caitanya Mahāprabhu',
    'From Śrī Caitanya-bhāgavata': 'From Śrī Caitanya-bhāgavata',
    'śrījagadānanda paṇḍita': 'Śrī Jagadānanda Paṇḍita',
    'śrījaẏadeba gosbāmī': 'Śrī Jayadeva Gosvāmī',
    'śrīdharasbāmīpāda': 'Śrīdhara Svāmīpāda',
    'śrībidyāpati': 'Śrī Vidyāpati',
    'śrībīrabhadra': 'Śrī Vīrabhadra',
    'śrīmad ballabhācāryya': 'Śrīmad Vallabhācārya',
    'śrīmadbhaktikumuda santa gosbāmī mahārāja': 'Śrīmad Bhakti Kumuda Santa Gosvāmī Mahārāja',
    'śrīmadbhaktideśika ācāryya mahārāja': 'Śrīmad Bhakti Deśika Ācārya Mahārāja',
    'śrīmadbhaktiprajñāna keśaba gosbāmī mahārāja': 'Śrīmad Bhakti Prajñāna Keśava Gosvāmī Mahārāja',
    'Śrīla Bhakti Viveka Bhāratī Gosvāmī Mahārāja': 'Śrīla Bhakti Viveka Bhāratī Gosvāmī Mahārāja',
    'Śrīmad Bhakti Viveka Bhāratī Gosvāmī Mahārāja': 'Śrīmad Bhakti Viveka Bhāratī Gosvāmī Mahārāja',
    'śrīmadbhaktibedānta sbāmī prabhupāda': 'Śrīmad Bhaktivedānta Svāmī Prabhupāda',
    'śrīmadbhaktibedānta ūrddhbanmahī mahārāja': 'Śrīmad Bhaktivedānta Ūrdhvamahī Mahārāja',
    'śrīmadbhaktibedānta tribikrama gosbāmī mahārāja': 'Śrīmad Bhaktivedānta Trivikrama Gosvāmī Mahārāja',
    'śrīmad acyutānanda gosbāmī': 'Śrīmad Acyutānanda Gosvāmī',
    'śrīmurārigupta': 'Śrī Murāri Gupta',
    'śrīla gaurakiśoradāsa bābājī mahārāja': 'Śrīla Gaura Kiśora dāsa Bābājī Mahārāja',
    'śrīla jība gosbāmī': 'Śrīla Jīva Gosvāmī',
    'śrīla prabodhānanda sarasbatīpāda': 'Śrīla Prabodhānanda Sarasvatīpāda',
    'śrīla bhaktirakṣaka śrīdhara gosbāmī mahārāja': 'Śrīla Bhakti Rakṣaka Śrīdhara Gosvāmī Mahārāja',
    'śrīla raghunātha bhāgabatācāryya': 'Śrīla Raghunātha Bhāgavatācārya',
    'śrīla śukadeba gosbāmī': 'Śrīla Śukadeva Gosvāmī',
    'śrīla śrīnibāsācāryya': 'Śrīla Śrīnivāsa Ācārya',
    'śrīla sanātana gosbāmī': 'Śrīla Sanātana Gosvāmī',
    'śrīla sārbbabhauma bhaṭṭācāryya': 'Śrīla Sārvabhauma Bhaṭṭācārya',
    'śrīśaṅkarācāryya': 'Śrī Śaṅkarācārya',
    'śrībiṭhalācāryya': 'Śrī Viṭṭhalācārya',
    'śrībilbamaṅgala ṭhākura': 'Śrī Vilvamaṅgala Ṭhākura',
    'śrībedabyāsa': 'Śrī Vedavyāsa',
    'sadānanda dāsa': 'Sadānanda dāsa',
    'sanātana dāsa': 'Sanātana dāsa',
    'brahma': 'Brahmā',
    'brahmaṇḍa purāṇa': 'Brahmāṇḍa Purāṇa',
}


def native_of(uid, existing_beng):
    """The author's name in its own script (Beng/Deva), cleaned of any '~ IAST' suffix / junk."""
    if existing_beng:
        return ('Beng', existing_beng)
    s = uid.split('~', 1)[0]                      # drop embedded IAST
    s = s.replace('‌', '').strip().rstrip(')').strip()
    if is_beng(s):
        return ('Beng', s)
    if is_deva(s):
        return ('Deva', s)
    return (None, None)                           # pure Latin (team / unknown-english)


def iast_for(uid, existing_beng):
    key = draft(uid, existing_beng)
    if key in CANON:
        return CANON[key]
    # fallback: never crash — title-case the draft so a new/unseen author still reads in Latin
    print(f"  ! uncurated author draft: {key!r} (uid={uid!r})", file=sys.stderr)
    return ' '.join(w.capitalize() for w in key.split())


def process_dir(d):
    skip = ('_list', 'manifest', 'song_groups')
    files = [f for f in glob.glob(os.path.join(d, '*.json'))
             if not any(s in os.path.basename(f) for s in skip)]
    changed = 0
    for f in files:
        song = json.load(open(f))
        if not isinstance(song, dict) or 'author_uid' not in song:
            continue                                  # not a per-song file
        uid = song.get('author_uid') or '?'
        ad = song.get('author_display') or []
        beng = next((x['text'] for x in ad if x.get('script_code') == 'Beng'), None)
        deva = next((x['text'] for x in ad if x.get('script_code') == 'Deva'), None)
        iast = iast_for(uid, beng)
        nat_sc, nat_txt = native_of(uid, beng or deva)
        new_ad = []
        if nat_txt:
            new_ad.append({'script_code': nat_sc, 'text': nat_txt})
        new_ad.append({'script_code': 'Latn', 'standard': 'IAST', 'text': iast})
        if new_ad != ad:
            song['author_display'] = new_ad
            json.dump(song, open(f, 'w'), ensure_ascii=False, indent=1)
            changed += 1
    return len(files), changed


if __name__ == '__main__':
    for rel in TARGETS:
        d = os.path.normpath(os.path.join(HERE, rel))
        if not os.path.isdir(d):
            print(f"skip (missing): {d}")
            continue
        n, c = process_dir(d)
        print(f"{d}: {c}/{n} song files updated")
