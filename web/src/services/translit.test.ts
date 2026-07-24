// Unit tests for the query transliterator (src/services/translit.ts) — the "n²" full-string
// romanizer that ships. It turns a native-Brahmic-script query into IAST so it can match the
// romanized search index. Expected values are the real assembler's output, verified against
// aksharamukha (the engine that romanized the corpus).
import { describe, expect, it } from 'vitest'
import { detectScript, romanizeQuery } from './translit'

describe('detectScript', () => {
  it('names the script from the first strong character', () => {
    expect(detectScript('গ')).toBe('Beng')
    expect(detectScript('क')).toBe('Deva')
    expect(detectScript('క')).toBe('Telu')
    expect(detectScript('ಕ')).toBe('Knda')
    expect(detectScript('ക')).toBe('Mlym')
    expect(detectScript('ક')).toBe('Gujr')
    expect(detectScript('କ')).toBe('Orya')
    expect(detectScript('க')).toBe('Taml')
  })

  it('is Latin only when no character falls in a known script block', () => {
    expect(detectScript('abc')).toBe('Latn')
    expect(detectScript('')).toBe('Latn')
    // The first character in a known block decides; Latin characters are skipped, not decisive, so
    // a mixed query still romanizes its native part (the Latin part passes through unchanged).
    expect(detectScript('a গ')).toBe('Beng')
    expect(detectScript('গ a')).toBe('Beng')
  })
})

describe('romanizeQuery — abugida rules', () => {
  it('gives a bare consonant its inherent "a"', () => {
    expect(romanizeQuery('क')).toBe('ka')
    expect(romanizeQuery('ন')).toBe('na')
  })

  it('lets a matra replace the inherent vowel', () => {
    expect(romanizeQuery('कि')).toBe('ki')
    expect(romanizeQuery('का')).toBe('kā')
    expect(romanizeQuery('रा')).toBe('rā')
  })

  it('lets a virama drop the vowel, and forms conjuncts from it', () => {
    expect(romanizeQuery('क्')).toBe('k')
    // क् + ष + ण: virama drops क's vowel, ष takes no vowel before the next virama-less ण.
    expect(romanizeQuery('कृष्ण')).toBe('kṛṣṇa')
  })

  it('romanizes whole words across scripts', () => {
    expect(romanizeQuery('गोविन्द')).toBe('govinda') // Devanagari
    expect(romanizeQuery('রাধিকা')).toBe('rādhikā') // Bengali
  })

  it('maps native digits to Latin digits', () => {
    expect(romanizeQuery('১২৩')).toBe('123')
  })
})

describe('romanizeQuery — pass-through', () => {
  it('is a no-op for Latin, empty, and unmapped input', () => {
    expect(romanizeQuery('abc')).toBe('abc')
    expect(romanizeQuery('')).toBe('')
    expect(romanizeQuery('radhika')).toBe('radhika')
  })

  it('keeps spaces and punctuation between romanized tokens', () => {
    expect(romanizeQuery('क क')).toBe('ka ka')
  })

  it('does not throw on a lone matra or virama with nothing to attach to', () => {
    expect(() => romanizeQuery('ा')).not.toThrow()
    expect(() => romanizeQuery('्')).not.toThrow()
    expect(romanizeQuery('्')).toBe('') // a stray virama is dropped
  })
})
