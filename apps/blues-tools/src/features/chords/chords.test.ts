import { describe, expect, it } from 'vitest'
import { getChordFingering } from './chords'

describe('getChordFingering', () => {
  it('returns a pattern for required chord types', () => {
    expect(getChordFingering('E', 'dominant7')).toBe('020100')
    expect(getChordFingering('E', 'minor7')).toBe('022030')
    expect(getChordFingering('E', 'major')).toBe('022100')
  })
})
