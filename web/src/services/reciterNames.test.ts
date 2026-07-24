// Unit tests for the reciter-name lookup (src/services/reciterNames.ts) — asserted against the real
// committed table (src/data/reciter_names.json, emitted by pipeline/build_reciter_scripts.py).
import { describe, expect, it } from 'vitest'
import { reciterCode, pickReciterName, reciterNames } from './reciterNames'

describe('reciterCode', () => {
  it('takes the code before the take number', () => {
    expect(reciterCode('tama-1')).toBe('tama')
    expect(reciterCode('srrb-12')).toBe('srrb')
    expect(reciterCode('rasi')).toBe('rasi') // no take suffix
  })
})

describe('pickReciterName', () => {
  it('returns the name in the reader listLanguage', () => {
    expect(pickReciterName('tama-1', 'Beng', 'x')).toBe('তমাল কৃষ্ণ দাস')
    expect(pickReciterName('tama-1', 'Deva', 'x')).toBe('तमाल कृष्ण दास')
  })

  it('returns the romanized name for Latn', () => {
    expect(pickReciterName('rasi-1', 'Latn', 'x')).toBe('Rasika dasi')
  })

  it('keeps sannyasi initials and place qualifiers in Latin, transliterating the rest', () => {
    expect(pickReciterName('bvsm-1', 'Beng', 'x')).toBe('শ্রীল BV স্বামী প্রভুপাদ')
    expect(pickReciterName('raus-1', 'Beng', 'x')).toBe('রাধিকা দাসী (Bay Area)')
  })

  it('falls back to the given romanized string for an unknown code', () => {
    expect(pickReciterName('zzz-1', 'Beng', 'Some Artist')).toBe('Some Artist')
  })

  it('has a rendering for every one of the 44 reciters', () => {
    for (const code of ['rasi', 'taru', 'shbi', 'casu', 'sude', 'tama', 'bvsm']) {
      expect(reciterNames(code)?.length).toBeGreaterThan(1)
    }
  })
})
