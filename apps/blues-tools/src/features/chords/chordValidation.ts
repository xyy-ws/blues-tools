import { Chord, Note } from '@tonaljs/tonal'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import type { ChordQuality, RootString } from './chords'

export type TonalValidationStatus = 'PASS' | 'WARN' | 'FAIL'

export type TonalValidationResult = {
  status: TonalValidationStatus
  expectedTones: MusicalKey[]
  actualTones: MusicalKey[]
  missingTones: MusicalKey[]
  extraTones: MusicalKey[]
}

export type PlayabilityValidationResult = {
  status: 'PASS' | 'FAIL'
  reasons: string[]
}

const OPEN_STRINGS: MusicalKey[] = ['E', 'A', 'D', 'G', 'B', 'E']

const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  maj: '',
  m: 'm',
  '7': '7',
  maj7: 'maj7',
  m7: 'm7',
  m7b5: 'm7b5',
  '9': '9',
  maj9: 'maj9',
  m9: 'm9',
}

const ENHARMONIC_TO_SHARP: Record<string, MusicalKey> = {
  C: 'C',
  'B#': 'C',
  'C#': 'C#',
  Db: 'C#',
  D: 'D',
  'D#': 'D#',
  Eb: 'D#',
  E: 'E',
  Fb: 'E',
  'E#': 'F',
  F: 'F',
  'F#': 'F#',
  Gb: 'F#',
  G: 'G',
  'G#': 'G#',
  Ab: 'G#',
  A: 'A',
  'A#': 'A#',
  Bb: 'A#',
  B: 'B',
  Cb: 'B',
}

function toSharpPitchClass(note: string): MusicalKey {
  const pitchClass = Note.pitchClass(note)
  const enharmonic = Note.enharmonic(pitchClass) || pitchClass
  const normalized = ENHARMONIC_TO_SHARP[enharmonic] ?? ENHARMONIC_TO_SHARP[pitchClass]
  if (!normalized) {
    throw new Error(`Unsupported pitch class from tonal: ${pitchClass}`)
  }
  return normalized
}

function semitoneOffset(from: MusicalKey, semitone: number): MusicalKey {
  const start = CHROMATIC_KEYS.indexOf(from)
  return CHROMATIC_KEYS[(start + semitone) % CHROMATIC_KEYS.length]
}

export function deriveTargetChordTones(root: MusicalKey, quality: ChordQuality): MusicalKey[] {
  const chord = Chord.get(`${root}${QUALITY_SUFFIX[quality]}`)
  return [...new Set(chord.notes.map((note) => toSharpPitchClass(note)))]
}

export function computePatternTones(pattern: string): MusicalKey[] {
  if (!isValidPatternFormat(pattern)) {
    return []
  }

  return [
    ...new Set(
      pattern
        .split('')
        .map((char, stringIndex) => {
          if (char === 'x') return null
          const fret = Number.parseInt(char, 10)
          if (Number.isNaN(fret)) return null
          return semitoneOffset(OPEN_STRINGS[stringIndex], fret)
        })
        .filter((note): note is MusicalKey => note !== null),
    ),
  ]
}

export function validateChordPattern(root: MusicalKey, quality: ChordQuality, pattern: string): TonalValidationResult {
  const expectedTones = deriveTargetChordTones(root, quality)

  const formatReasons = validatePatternFormat(pattern)
  if (formatReasons.length > 0) {
    return {
      status: 'FAIL',
      expectedTones,
      actualTones: [],
      missingTones: expectedTones,
      extraTones: [],
    }
  }

  const actualTones = computePatternTones(pattern)

  const expectedSet = new Set(expectedTones)
  const actualSet = new Set(actualTones)

  const missingTones = expectedTones.filter((tone) => !actualSet.has(tone))
  const extraTones = actualTones.filter((tone) => !expectedSet.has(tone))

  const qualityHasNinth = quality === '9' || quality === 'maj9' || quality === 'm9'
  const rootAndGuideTones = expectedTones.slice(0, 4)
  const missingGuideTone = rootAndGuideTones.some((tone) => !actualSet.has(tone))

  let status: TonalValidationStatus = 'PASS'
  if (missingTones.length === 0 && extraTones.length === 0) {
    status = 'PASS'
  } else if (!missingGuideTone && qualityHasNinth && missingTones.every((tone) => tone === expectedTones[4]) && extraTones.length === 0) {
    status = 'WARN'
  } else if (missingTones.length === 0 && extraTones.length <= 1) {
    status = 'WARN'
  } else {
    status = 'FAIL'
  }

  return {
    status,
    expectedTones,
    actualTones,
    missingTones,
    extraTones,
  }
}

export function inferBassInversion(root: MusicalKey, quality: ChordQuality, pattern: string): number {
  if (!isValidPatternFormat(pattern)) return 0

  const expectedTones = deriveTargetChordTones(root, quality)
  const bassTone = pattern
    .split('')
    .map((char, stringIndex) => {
      if (char === 'x') return null
      const fret = Number.parseInt(char, 10)
      if (Number.isNaN(fret)) return null
      return semitoneOffset(OPEN_STRINGS[stringIndex], fret)
    })
    .find((note): note is MusicalKey => note !== null)

  if (!bassTone) return 0
  const inversionIndex = expectedTones.indexOf(bassTone)
  if (inversionIndex === -1) return 0
  return Math.min(inversionIndex, 3)
}

export function inferRootString(pattern: string): RootString {
  if (!isValidPatternFormat(pattern)) return 6

  const chars = pattern.split('')
  const firstActive = chars.findIndex((char) => char !== 'x')
  if (firstActive <= 0) return 6
  if (firstActive === 1) return 5
  return 4
}

const NON_PLAYABLE_PATTERNS = new Set(['5x2009'])

function isValidPatternFormat(pattern: string): boolean {
  return pattern.length === 6 && /^[0-9x]+$/.test(pattern)
}

function validatePatternFormat(pattern: string): string[] {
  const reasons: string[] = []
  if (pattern.length !== 6) {
    reasons.push(`pattern length must be 6 (got ${pattern.length})`)
  }
  if (!/^[0-9x]+$/.test(pattern)) {
    reasons.push('pattern contains invalid characters (only 0-9 and lowercase x allowed)')
  }
  return reasons
}

export function validateChordPlayability(pattern: string): PlayabilityValidationResult {
  if (NON_PLAYABLE_PATTERNS.has(pattern)) {
    return { status: 'FAIL', reasons: ['blocked known unreliable shape'] }
  }

  const formatReasons = validatePatternFormat(pattern)
  if (formatReasons.length > 0) {
    return { status: 'FAIL', reasons: formatReasons }
  }

  const chars = pattern.split('')
  const activeStringIndices = chars.map((char, idx) => (char.toLowerCase() === 'x' ? null : idx)).filter((idx): idx is number => idx !== null)
  const frets = chars
    .map((char) => (char.toLowerCase() === 'x' ? null : Number.parseInt(char, 10)))
    .filter((fret): fret is number => fret !== null && !Number.isNaN(fret))

  if (frets.length === 0) {
    return { status: 'FAIL', reasons: ['no fretted notes'] }
  }

  const reasons: string[] = []
  const nonZeroFrets = frets.filter((fret) => fret > 0)
  const hasOpenString = frets.includes(0)

  if (activeStringIndices.length < 3) {
    reasons.push(`too few active strings for practical voicing (${activeStringIndices.length})`)
  }

  if (activeStringIndices.length > 0) {
    const firstActive = activeStringIndices[0]
    const lastActive = activeStringIndices[activeStringIndices.length - 1]
    const hasInnerMuteGap = chars.slice(firstActive, lastActive + 1).some((char) => char.toLowerCase() === 'x')
    if (hasInnerMuteGap && activeStringIndices.length < 4) {
      reasons.push('contains inner muted-string gaps with too few anchor tones')
    }
  }

  if (nonZeroFrets.length > 0) {
    const minFret = Math.min(...nonZeroFrets)
    const maxFret = Math.max(...nonZeroFrets)
    const frettedSpan = maxFret - minFret

    if (frettedSpan > 8) {
      reasons.push(`fretted span too wide (${frettedSpan})`)
    }

    if (hasOpenString && maxFret > 9) {
      reasons.push(`open-string + high-fret stretch not common-practice (max fret ${maxFret})`)
    }
  }

  return reasons.length === 0 ? { status: 'PASS', reasons: [] } : { status: 'FAIL', reasons }
}
