import { describe, expect, it } from 'vitest'
import { getChordFingering, getChordFingerings } from './chords'

describe('getChordFingering', () => {
  it('returns a pattern for required chord types', () => {
    expect(getChordFingering('E', 'dominant7')).toBe('020100')
    expect(getChordFingering('E', 'minor7')).toBe('022030')
    expect(getChordFingering('E', 'major')).toBe('022100')
  })

  it('returns 5 fingering variants by default', () => {
    const variants = getChordFingerings('E', 'dominant7')
    expect(variants).toHaveLength(5)
    expect(variants[0]).toBe('020100')
    expect(variants[1]).toBe('030200')
  })
})
