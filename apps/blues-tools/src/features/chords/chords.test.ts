import { describe, expect, it } from 'vitest'
import { getChordFingering, getChordFingerings } from './chords'

describe('getChordFingering', () => {
  it('returns a pattern for required chord types', () => {
    expect(getChordFingering('E', 'dominant7')).toBe('020100')
    expect(getChordFingering('E', 'minor7')).toBe('020000')
    expect(getChordFingering('E', 'major')).toBe('022100')
  })

  it('returns up to 5 fingering variants by root-string voicing families', () => {
    const root6 = getChordFingerings('E', 'dominant7', 6)
    const root5 = getChordFingerings('E', 'dominant7', 5)

    expect(root6.length).toBeGreaterThan(0)
    expect(root6.length).toBeLessThanOrEqual(5)
    expect(root5.length).toBeGreaterThan(0)
    expect(root5.length).toBeLessThanOrEqual(5)
    expect(root6).not.toEqual(root5)
  })
})
