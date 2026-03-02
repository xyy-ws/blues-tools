import { describe, expect, it } from 'vitest'
import { getBluesScaleNotes, getFretNote } from './fretboard'

describe('fretboard helpers', () => {
  it('returns minor blues notes for E', () => {
    expect(getBluesScaleNotes('E')).toEqual(['E', 'G', 'A', 'A#', 'B', 'D'])
  })

  it('returns note at fret', () => {
    expect(getFretNote('E', 12)).toBe('E')
    expect(getFretNote('A', 3)).toBe('C')
  })
})
