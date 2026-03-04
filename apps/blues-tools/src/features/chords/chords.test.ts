import { describe, expect, it } from 'vitest'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import {
  CHORD_LIBRARY_VALIDATION_REPORT,
  getChordFingerings,
  getChordVoicingOptions,
  getInversionOptionsFor,
  getRankedGeneratedChordVoicings,
  getRootStringOptions,
  hasStandardChordShapes,
  type ChordQuality,
} from './chords'
import { validateChordPattern, validateChordPlayability } from './chordValidation'

const chordPatternStatusCache = new Map<string, ReturnType<typeof validateChordPattern>['status']>()
const chordPlayabilityStatusCache = new Map<string, ReturnType<typeof validateChordPlayability>['status']>()

function getChordPatternStatus(root: (typeof CHROMATIC_KEYS)[number], quality: ChordQuality, pattern: string) {
  const key = `${root}|${quality}|${pattern}`
  const cached = chordPatternStatusCache.get(key)
  if (cached !== undefined) return cached
  const status = validateChordPattern(root, quality, pattern).status
  chordPatternStatusCache.set(key, status)
  return status
}

function getChordPlayabilityStatus(pattern: string) {
  const cached = chordPlayabilityStatusCache.get(pattern)
  if (cached !== undefined) return cached
  const status = validateChordPlayability(pattern).status
  chordPlayabilityStatusCache.set(pattern, status)
  return status
}

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
  })

  it('returns at least one practical voicing for common contexts', () => {
    expect(getChordVoicingOptions('E', '7', 6, 0).length).toBeGreaterThanOrEqual(1)
    expect(getChordVoicingOptions('D', '7', 5, 0).length).toBeGreaterThanOrEqual(1)
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
    expect(getChordVoicingOptions('E', 'add9', 6, 0).length).toBeGreaterThan(0)
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

  it('returns generated voicings ranked by descending score with dynamic count', () => {
    const generated = getRankedGeneratedChordVoicings('E', '7', 6, 0, 20)
    expect(generated.length).toBeGreaterThan(0)
    expect(generated.every((entry) => entry.sourceKind === 'generated')).toBe(true)

    const scores = generated.map((entry) => entry.rankingScore ?? 0)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('only returns strict PASS selector-facing entries for curated and generated options', () => {
    const qualitySet = [...CORE_QUALITIES, ...EXPANDED_QUALITIES, '9', 'maj9', 'm9', 'm7b5'] as ChordQuality[]

    // Curated selector-facing entries: check all supported qualities on representative open roots.
    for (const root of ['E', 'A', 'D'] as const) {
      for (const quality of qualitySet) {
        for (const rootString of getRootStringOptions(root, quality)) {
          for (const inversion of getInversionOptionsFor(root, quality, rootString)) {
            const curated = getChordVoicingOptions(root, quality, rootString, inversion)
            for (const entry of curated) {
              expect(getChordPatternStatus(root, quality, entry.pattern)).toBe('PASS')
              expect(getChordPlayabilityStatus(entry.pattern)).toBe('PASS')
            }
          }
        }
      }
    }

    // Generated selector-facing entries: verify strict PASS on high-traffic practical contexts.
    const generatedCases: Array<{ root: (typeof CHROMATIC_KEYS)[number]; quality: ChordQuality; rootString: 6 | 5 | 4; inversion: 0 | 1 | 2 | 3 }> = [
      { root: 'E', quality: '7', rootString: 6, inversion: 0 },
      { root: 'A', quality: 'maj', rootString: 5, inversion: 0 },
      { root: 'D', quality: 'm7', rootString: 4, inversion: 0 },
      { root: 'E', quality: '9', rootString: 6, inversion: 0 },
      { root: 'A', quality: 'm7b5', rootString: 5, inversion: 0 },
    ]

    for (const item of generatedCases) {
      const generated = getRankedGeneratedChordVoicings(item.root, item.quality, item.rootString, item.inversion, 20)
      for (const entry of generated) {
        expect(getChordPatternStatus(item.root, item.quality, entry.pattern)).toBe('PASS')
        expect(getChordPlayabilityStatus(entry.pattern)).toBe('PASS')
      }
    }
  })
})
