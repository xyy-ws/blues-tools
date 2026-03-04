import { describe, expect, it } from 'vitest'
import { generateRankedFingerings } from './algorithmicFingerings'

describe('generateRankedFingerings', () => {
  it('is deterministic for the same context', () => {
    const first = generateRankedFingerings('E', '7', 6, 0, 5)
    const second = generateRankedFingerings('E', '7', 6, 0, 5)

    expect(first.map((item) => item.pattern)).toEqual(second.map((item) => item.pattern))
    expect(first.map((item) => item.score)).toEqual(second.map((item) => item.score))
  })

  it('prioritizes lower-position easier voicings', () => {
    const result = generateRankedFingerings('E', 'maj', 6, 0, 5)
    expect(result.length).toBeGreaterThanOrEqual(3)

    const top = result[0]
    const bottom = result[result.length - 1]

    expect(top.metrics.avgFret).toBeLessThanOrEqual(bottom.metrics.avgFret)
    expect(top.metrics.fretSpan).toBeLessThanOrEqual(bottom.metrics.fretSpan + 2)
    expect(top.score).toBeGreaterThanOrEqual(bottom.score)
  })

  it('supports dynamic topN without fixed 3~5 constraint', () => {
    expect(generateRankedFingerings('E', '7', 6, 0, 1).length).toBeLessThanOrEqual(1)
    expect(generateRankedFingerings('E', '7', 6, 0, Number.POSITIVE_INFINITY).length).toBeGreaterThan(1)
  })

  it('does not hard-cap non-zero fret span at 3 (selector span clipping removed)', () => {
    const contexts: Array<Parameters<typeof generateRankedFingerings>> = [
      ['E', '7', 6, 0, Number.POSITIVE_INFINITY],
      ['E', 'maj7', 6, 0, Number.POSITIVE_INFINITY],
      ['A', 'm7', 5, 0, Number.POSITIVE_INFINITY],
      ['D', 'm9', 4, 0, Number.POSITIVE_INFINITY],
      ['B', 'maj9', 5, 0, Number.POSITIVE_INFINITY],
    ]

    const seenSpanOver3 = contexts.some((args) => {
      const result = generateRankedFingerings(...args)
      return result.some((item) => {
        const nonZeroFrets = item.pattern
          .split('')
          .map((char) => (char === 'x' ? null : Number.parseInt(char, 10)))
          .filter((fret): fret is number => fret !== null && !Number.isNaN(fret) && fret > 0)

        if (nonZeroFrets.length < 2) return false
        return Math.max(...nonZeroFrets) - Math.min(...nonZeroFrets) > 3
      })
    })

    expect(seenSpanOver3).toBe(true)
  })
})
