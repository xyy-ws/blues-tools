import { describe, expect, it } from 'vitest'
import { CURATED_CHORD_SHAPES, mapChordDbSuffix, normalizeChordDbKey } from './chordsDbAdapter'

describe('chordsDbAdapter', () => {
  it('normalizes flat/sharp keys to app musical keys', () => {
    expect(normalizeChordDbKey('Eb')).toBe('D#')
    expect(normalizeChordDbKey('Bb')).toBe('A#')
    expect(normalizeChordDbKey('C#')).toBe('C#')
  })

  it('maps supported suffixes into app chord qualities', () => {
    expect(mapChordDbSuffix('major')).toBe('maj')
    expect(mapChordDbSuffix('minor')).toBe('m')
    expect(mapChordDbSuffix('maj7')).toBe('maj7')
    expect(mapChordDbSuffix('m7b5')).toBe('m7b5')
    expect(mapChordDbSuffix('5')).toBeNull()
  })

  it('adapts chords-db positions into selector-ready patterns with source metadata', () => {
    const eMajorOpen = CURATED_CHORD_SHAPES.find((item) => item.root === 'E' && item.quality === 'maj' && item.pattern === '022100')

    expect(eMajorOpen).toBeDefined()
    expect(eMajorOpen?.sourceId).toBe('chordsDb')
    expect(eMajorOpen?.verificationNotes).toContain('source=chords-db')
    expect(eMajorOpen?.verificationNotes).toContain('baseFret=1')
  })

  it('retains legacy fallback for unsupported quality families', () => {
    expect(CURATED_CHORD_SHAPES.some((item) => item.quality === '5' && item.sourceId === 'legacy')).toBe(true)
  })

  it('deduplicates repeated root-quality-pattern entries', () => {
    const key = (item: (typeof CURATED_CHORD_SHAPES)[number]) => `${item.root}|${item.quality}|${item.pattern}`
    const keys = CURATED_CHORD_SHAPES.map(key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('keeps high-fret chords-db variants using multi-digit-safe encoding', () => {
    const d9HighFret = CURATED_CHORD_SHAPES.filter((item) => item.root === 'D' && item.quality === '9').map((item) => item.pattern)
    expect(d9HighFret.some((pattern) => pattern.includes('10') || pattern.includes('11') || pattern.includes('12'))).toBe(true)
    expect(d9HighFret.some((pattern) => pattern.includes(','))).toBe(true)
  })
})
