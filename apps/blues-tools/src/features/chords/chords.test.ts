import { describe, expect, it } from 'vitest'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import { CHORD_LIBRARY_VALIDATION_REPORT, getChordFingerings, getChordVoicingOptions, getInversionOptionsFor, getRootStringOptions, hasStandardChordShapes, type ChordQuality } from './chords'

const CORE_QUALITIES: ChordQuality[] = ['maj', 'm', '7', 'maj7', 'm7']
const EXPANDED_QUALITIES: ChordQuality[] = ['5', '6', 'm6', 'sus2', 'sus4', 'add9', 'dim', 'dim7', 'aug']

describe('standard chord library', () => {
  it('returns curated standard entries with source metadata', () => {
    const [entry] = getChordVoicingOptions('E', '7', 6, 0)

    expect(entry).toBeDefined()
    expect(entry.pattern).toBeTruthy()
    expect(entry.fallback).toBe(false)
    expect(entry.isApproximateFallback).toBe(false)
    expect(entry.shapeSource.verificationStatus).toBe('已校验')
    expect(entry.source.sourceName.length).toBeGreaterThan(0)
  })

  it('only exposes root-string and inversion options present in validated standard dataset', () => {
    const rootStrings = getRootStringOptions('E', '7')
    expect(rootStrings.length).toBeGreaterThan(0)

    const inversions = getInversionOptionsFor('E', '7', rootStrings[0])
    expect(inversions.length).toBeGreaterThan(0)
  })

  it('includes practical root-string-4 options for common seventh-family contexts', () => {
    expect(getRootStringOptions('D', '7')).toContain(4)
    expect(getRootStringOptions('E', 'maj7')).toContain(4)
    expect(getRootStringOptions('A', 'm7')).toContain(4)
    expect(getChordVoicingOptions('E', '7', 4, 0).length).toBeGreaterThan(0)
  })

  it('returns multiple practical voicings for common contexts', () => {
    expect(getChordVoicingOptions('E', '7', 6, 0).length).toBeGreaterThanOrEqual(2)
    expect(getChordVoicingOptions('D', '7', 5, 0).length).toBeGreaterThanOrEqual(2)
  })

  it('covers all 12 roots for core qualities with standard entries', () => {
    for (const root of CHROMATIC_KEYS) {
      for (const quality of CORE_QUALITIES) {
        expect(hasStandardChordShapes(root, quality), `${root} ${quality} should exist`).toBe(true)
        const rootStrings = getRootStringOptions(root, quality)
        expect(rootStrings.length, `${root} ${quality} should have root string options`).toBeGreaterThan(0)
        const inversions = getInversionOptionsFor(root, quality, rootStrings[0])
        expect(inversions.length, `${root} ${quality} should have inversion options`).toBeGreaterThan(0)
        expect(getChordFingerings(root, quality, rootStrings[0], inversions[0]).length, `${root} ${quality} should return fingering`).toBeGreaterThan(0)
      }
    }
  })

  it('provides representative standard voicings for newly supported practical quality families', () => {
    for (const quality of EXPANDED_QUALITIES) {
      expect(hasStandardChordShapes('E', quality) || hasStandardChordShapes('A', quality) || hasStandardChordShapes('D', quality)).toBe(true)
    }

    expect(getChordVoicingOptions('E', '5', 6, 0).length).toBeGreaterThan(0)
    expect(getChordVoicingOptions('A', '6', 5, 0).length).toBeGreaterThan(0)
    expect(getChordVoicingOptions('D', 'm6', 4, 0).length).toBeGreaterThan(0)
    expect(getChordVoicingOptions('E', 'sus2', 6, 0).length).toBeGreaterThan(0)
    expect(getChordVoicingOptions('A', 'sus4', 5, 0).length).toBeGreaterThan(0)
    expect(getChordVoicingOptions('D', 'add9', 4, 0).length).toBeGreaterThan(0)
    expect(getChordVoicingOptions('A', 'dim', 5, 0).length).toBeGreaterThan(0)
    expect(getChordVoicingOptions('E', 'dim7', 6, 0).length).toBeGreaterThan(0)
    expect(getChordVoicingOptions('E', 'aug', 6, 0).length).toBeGreaterThan(0)
  })

  it('excludes FAIL and WARN records from selector-facing dataset', () => {
    const invalid = CHORD_LIBRARY_VALIDATION_REPORT.filter((record) => record.status !== 'PASS')
    for (const item of invalid) {
      const voicing = getChordVoicingOptions(item.root, item.quality, item.rootString, item.inversion)
      expect(voicing.find((entry) => entry.pattern === item.pattern)).toBeUndefined()
    }
  })
})
