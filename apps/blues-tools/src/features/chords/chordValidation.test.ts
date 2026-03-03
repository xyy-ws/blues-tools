import { describe, expect, it } from 'vitest'
import { computePatternTones, deriveTargetChordTones, validateChordPattern, validateChordPlayability } from './chordValidation'

describe('chordValidation', () => {
  it('derives target tones using tonaljs with sharp normalization', () => {
    expect(deriveTargetChordTones('D#', 'maj')).toEqual(['D#', 'G', 'A#'])
    expect(deriveTargetChordTones('A#', 'maj7')).toEqual(['A#', 'D', 'F', 'A'])
  })

  it('computes actual tones from fingering patterns', () => {
    expect(computePatternTones('022100')).toEqual(['E', 'B', 'E', 'G#', 'B', 'E'].filter((v, i, arr) => arr.indexOf(v) === i))
  })

  it('marks exact chord-tone coverage as PASS', () => {
    const result = validateChordPattern('E', '7', '020100')
    expect(result.status).toBe('PASS')
    expect(result.missingTones).toEqual([])
  })

  it('marks missing ninth extension as WARN for ninth chords', () => {
    const result = validateChordPattern('E', '9', '020100')
    expect(result.status).toBe('WARN')
    expect(result.missingTones.length).toBeGreaterThan(0)
  })

  it('marks major/minor quality mismatches as FAIL', () => {
    const result = validateChordPattern('E', 'maj', '022000')
    expect(result.status).toBe('FAIL')
  })

  it('rejects non-strummable analysis-like distributions', () => {
    const result = validateChordPlayability('0xx137')
    expect(result.status).toBe('FAIL')
    expect(result.reasons.join(' ')).toContain('analysis-like distribution')
  })

  it('accepts common strummable chord shape', () => {
    const result = validateChordPlayability('022100')
    expect(result.status).toBe('PASS')
  })
})
