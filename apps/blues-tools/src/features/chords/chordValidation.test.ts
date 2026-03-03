import { describe, expect, it } from 'vitest'
import { computePatternTones, deriveTargetChordTones, validateChordPattern, validateChordPlayability } from './chordValidation'

describe('chordValidation', () => {
  it('derives target tones using tonaljs with sharp normalization', () => {
    expect(deriveTargetChordTones('D#', 'maj')).toEqual(['D#', 'G', 'A#'])
    expect(deriveTargetChordTones('A#', 'maj7')).toEqual(['A#', 'D', 'F', 'A'])
    expect(deriveTargetChordTones('E', 'dim7')).toEqual(['E', 'G', 'A#', 'C#'])
    expect(deriveTargetChordTones('A', 'sus2')).toEqual(['A', 'B', 'E'])
  })

  it('computes actual tones from fingering patterns', () => {
    expect(computePatternTones('022100')).toEqual(['E', 'B', 'E', 'G#', 'B', 'E'].filter((v, i, arr) => arr.indexOf(v) === i))
  })

  it('marks exact chord-tone coverage as PASS', () => {
    const result = validateChordPattern('E', '7', '020100')
    expect(result.status).toBe('PASS')
    expect(result.missingTones).toEqual([])
  })

  it('fails ninth-family chords that omit the required 9th extension tone', () => {
    const result = validateChordPattern('C', '9', 'x32313')
    expect(result.status).toBe('FAIL')
    expect(result.missingTones).toContain('D')
  })

  it('accepts valid C9 voicing when the 9th is present', () => {
    const result = validateChordPattern('C', '9', 'x32333')
    expect(result.status).toBe('PASS')
    expect(result.missingTones).toEqual([])
  })

  it('also enforces required 9th for maj9', () => {
    expect(validateChordPattern('C', 'maj9', 'x32000').status).toBe('FAIL')
  })

  it('marks major/minor quality mismatches as FAIL', () => {
    const result = validateChordPattern('E', 'maj', '022000')
    expect(result.status).toBe('FAIL')
  })

  it('still rejects clearly non-practical sparse gap shapes', () => {
    const result = validateChordPlayability('x0x9x9')
    expect(result.status).toBe('FAIL')
    expect(result.reasons.join(' ')).toContain('too few anchor tones')
  })

  it('accepts practical compact voicings with muted bass strings', () => {
    const result = validateChordPlayability('xx2434')
    expect(result.status).toBe('PASS')
  })

  it('accepts common strummable chord shape', () => {
    const result = validateChordPlayability('022100')
    expect(result.status).toBe('PASS')
  })

  it('rejects malformed pattern with special characters', () => {
    const playability = validateChordPlayability('0@2100')
    const tonal = validateChordPattern('E', '7', '0@2100')

    expect(playability.status).toBe('FAIL')
    expect(tonal.status).toBe('FAIL')
  })

  it('rejects malformed overlong pattern', () => {
    const playability = validateChordPlayability('022100022100')
    const tonal = validateChordPattern('E', 'maj', '022100022100')

    expect(playability.status).toBe('FAIL')
    expect(tonal.status).toBe('FAIL')
  })

  it('rejects malformed patterns with wrong length or uppercase mute markers', () => {
    for (const pattern of ['02210', '02210X', '0x21-0']) {
      expect(validateChordPlayability(pattern).status).toBe('FAIL')
      expect(validateChordPattern('E', 'maj', pattern).status).toBe('FAIL')
    }
  })
})
