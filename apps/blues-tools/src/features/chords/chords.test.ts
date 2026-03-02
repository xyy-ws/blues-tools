import { describe, expect, it } from 'vitest'
import { getChordFingering, getChordFingerings, INVERSION_OPTIONS } from './chords'

describe('getChordFingering', () => {
  it('supports expanded chord qualities', () => {
    const qualities = ['maj', 'm', '7', 'maj7', 'm7', 'm7b5', '9', 'maj9', 'm9'] as const

    qualities.forEach((quality) => {
      expect(getChordFingering('E', quality)).toMatch(/^[0-9x]{6}$/)
    })
  })

  it('separates inversion and voicing choices', () => {
    const rootPosition = getChordFingerings('E', '7', 6, 0)
    const firstInversion = getChordFingerings('E', '7', 6, 1)

    expect(rootPosition.length).toBeGreaterThan(0)
    expect(firstInversion.length).toBeGreaterThan(0)
    expect(rootPosition[0]).not.toEqual(firstInversion[0])
  })

  it("supports explicit inversion options for quality '9' and only falls back when inversion is unsupported", () => {
    expect(INVERSION_OPTIONS['9']).toEqual([0, 1, 2])

    const secondInversion = getChordFingerings('E', '9', 6, 2)
    expect(secondInversion).not.toEqual(getChordFingerings('E', '9', 6, 0))

    expect(getChordFingerings('E', '9', 6, 3)).toEqual(getChordFingerings('E', '9', 6, 0))
  })
})
