import { describe, expect, it } from 'vitest'
import { getChordFingerings, getChordVoicingOptions, getInversionOptionsFor, getRootStringOptions, hasStandardChordShapes } from './chords'

describe('standard chord library', () => {
  it('returns curated standard entries with source metadata', () => {
    const [entry] = getChordVoicingOptions('E', '7', 6, 0)

    expect(entry).toBeDefined()
    expect(entry.pattern).toBe('020100')
    expect(entry.fallback).toBe(false)
    expect(entry.isApproximateFallback).toBe(false)
    expect(entry.shapeSource.verificationStatus).toBe('已校验')
    expect(entry.source.sourceName.length).toBeGreaterThan(0)
  })

  it('does not expose fallback/approximate entries for unsupported combinations', () => {
    const unsupported = getChordVoicingOptions('B', '9', 6, 0)

    expect(unsupported).toEqual([])
    expect(getChordFingerings('B', '9', 6, 0)).toEqual([])
  })

  it('only exposes root-string and inversion options present in standard dataset', () => {
    expect(getRootStringOptions('E', '7')).toEqual([6])
    expect(getInversionOptionsFor('E', '7', 6)).toEqual([0, 1])
    expect(hasStandardChordShapes('E', 'm7b5')).toBe(false)
  })
})
