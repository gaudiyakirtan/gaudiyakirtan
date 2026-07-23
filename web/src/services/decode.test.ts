// Unit tests for the decode boundary (src/services/decode.ts): canonical snake_case JSON ->
// camelCase models (docs/data/song.md, manifest.md, collections.md). This is the ONLY layer that
// should know about the on-disk field names, so these tests pin that mapping down directly rather
// than through a repository.
import { describe, expect, it } from 'vitest'
import { decodeManifestEntry, decodeSong, decodeSongGroup } from './decode'

describe('decodeSong', () => {
  const raw = {
    uid: 'A1',
    language_of_origin: 'ben',
    title_main: [
      { script_code: 'Beng', text: 'জয় জয় গুরুদেব' },
      { script_code: 'Latn', standard: 'IAST', text: 'jaya jaya gurudeba' },
    ],
    author_uid: '?',
    author_display: [{ script_code: 'Beng', text: 'অজানা লেখক' }],
    topics: [],
    tags: [],
    verses: [
      {
        verse_number: 1,
        source_text_master: ['jaya jaya gurudeba'],
        display_scripts: [{ script_code: 'Latn', standard: 'IAST', text: ['jaya jaya gurudeba'] }],
      },
    ],
    notes: [],
    audio_available: false,
  }

  it('maps snake_case fields to the camelCase ISong shape', () => {
    const song = decodeSong(raw)
    expect(song.uid).toBe('A1')
    expect(song.languageOfOrigin).toBe('ben')
    expect(song.authorUid).toBe('?')
    expect(song.audioAvailable).toBe(false)
    expect(song.titleMain).toEqual([
      { scriptCode: 'Beng', text: 'জয় জয় গুরুদেব' },
      { scriptCode: 'Latn', standard: 'IAST', text: 'jaya jaya gurudeba' },
    ])
    expect(song.verses).toHaveLength(1)
    expect(song.verses[0].verseNumber).toBe(1)
  })

  it('omits empty optional arrays (topics/tags/notes/audioFiles) rather than keeping []', () => {
    const song = decodeSong(raw)
    // getStaticProps rejects a literal `undefined` value, so decode.ts must actually DELETE the
    // key, not set it to undefined (see deepStripUndefined's doc comment).
    expect('topics' in song).toBe(false)
    expect('tags' in song).toBe(false)
    expect('notes' in song).toBe(false)
    expect('audioFiles' in song).toBe(false)
  })

  it('flattens the corpus notes shape ({language_code, text}[]) into plain strings', () => {
    const song = decodeSong({
      ...raw,
      notes: [
        { language_code: 'eng', text: 'A glossary note.' },
        { language_code: 'ben', text: 'দ্বিতীয় নোট' },
      ],
    })
    expect(song.notes).toEqual(['A glossary note.', 'দ্বিতীয় নোট'])
  })

  it('decodes audio_files ({uid, filename, artist?}) per song.md spec v2', () => {
    const song = decodeSong({
      ...raw,
      audio_available: true,
      audio_files: [
        { uid: 'bvsm-1', filename: 'A1-bvsm-1.mp3', artist: 'Bhakti Vikasa Swami' },
        { uid: 'anad-2', filename: 'A1-anad-2.mp3' },
      ],
    })
    expect(song.audioAvailable).toBe(true)
    expect(song.audioFiles).toEqual([
      { uid: 'bvsm-1', filename: 'A1-bvsm-1.mp3', artist: 'Bhakti Vikasa Swami' },
      { uid: 'anad-2', filename: 'A1-anad-2.mp3' },
    ])
    // No artist given -> key omitted, not undefined.
    expect('artist' in song.audioFiles![1]).toBe(false)
  })

  it('preserves a non-empty topics/tags list', () => {
    const song = decodeSong({ ...raw, topics: ['topic-1'], tags: ['festival'] })
    expect(song.topics).toEqual(['topic-1'])
    expect(song.tags).toEqual(['festival'])
  })
})

describe('decodeManifestEntry', () => {
  it('maps snake_case fields to the camelCase IManifestEntry shape', () => {
    const entry = decodeManifestEntry({
      uid: 'N9',
      primary_title: { script_code: 'Latn', standard: 'IAST', text: 'akrodha paramananda' },
      author_uid: 'ldt',
      language_of_origin: 'ben',
      audio_available: false,
      first_letter: 'A',
      md5: 'deadbeef',
    })
    expect(entry).toEqual({
      uid: 'N9',
      primaryTitle: { scriptCode: 'Latn', standard: 'IAST', text: 'akrodha paramananda' },
      authorUid: 'ldt',
      languageOfOrigin: 'ben',
      audioAvailable: false,
      firstLetter: 'A',
      md5: 'deadbeef',
    })
  })

  it('omits firstLetter/titles when absent rather than emitting undefined', () => {
    const entry = decodeManifestEntry({
      uid: 'N9',
      primary_title: { script_code: 'Latn', text: 'x' },
      author_uid: '?',
      language_of_origin: 'ben',
      audio_available: false,
      md5: 'abc',
    })
    expect('firstLetter' in entry).toBe(false)
    expect('titles' in entry).toBe(false)
  })
})

describe('decodeSongGroup', () => {
  it('maps the song_groups.json shape to camelCase ISongGroup (docs/data/collections.md)', () => {
    const group = decodeSongGroup({
      uid: 'book-sri-guru',
      kind: 'book',
      ordered: true,
      titles: [{ script_code: 'Latn', text: 'Śrī Guru' }],
      song_uids: ['G2', 'G3'],
      color: '#8CB4FF',
    })
    expect(group).toEqual({
      uid: 'book-sri-guru',
      kind: 'book',
      ordered: true,
      titles: [{ scriptCode: 'Latn', text: 'Śrī Guru' }],
      songUids: ['G2', 'G3'],
      color: '#8CB4FF',
    })
  })

  it('omits color when absent (topics ship without one) and defaults ordered falsy', () => {
    const group = decodeSongGroup({
      uid: 'topic-0-prayers-for-mercy',
      kind: 'topic',
      ordered: false,
      titles: [{ script_code: 'Latn', text: 'Prayers For Mercy' }],
      song_uids: ['N9'],
    })
    expect(group.ordered).toBe(false)
    expect('color' in group).toBe(false)
  })
})
