import { Chord, Note } from '@tonaljs/tonal'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import type { ChordQuality, RootString } from './chords'
import { CHORD_STRING_COUNT, parsePattern, stringifyPattern } from './pattern'

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

const QUALITY_REQUIRED_TONE_INDEXES: Record<ChordQuality, number[]> = {
  maj: [0, 1, 2],
  m: [0, 1, 2],
  '5': [0, 1],
  '6': [0, 1, 3],
  m6: [0, 1, 3],
  sus2: [0, 1, 2],
  sus4: [0, 1, 2],
  add9: [0, 1, 2, 3],
  dim: [0, 1, 2],
  dim7: [0, 1, 2, 3],
  aug: [0, 1, 2],
  '7': [0, 1, 3],
  maj7: [0, 1, 3],
  m7: [0, 1, 3],
  m7b5: [0, 1, 2, 3],
  '9': [0, 1, 3, 4],
  maj9: [0, 1, 3, 4],
  m9: [0, 1, 3, 4],
}

const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  maj: '',
  m: 'm',
  '5': '5',
  '6': '6',
  m6: 'm6',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: 'add9',
  dim: 'dim',
  dim7: 'dim7',
  aug: 'aug',
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
  const parsed = parsePattern(pattern)
  if (!parsed) {
    return []
  }

  return [...new Set(parsed.map((fret, stringIndex) => (fret === null ? null : semitoneOffset(OPEN_STRINGS[stringIndex], fret))).filter((note): note is MusicalKey => note !== null))]
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

  const requiredToneSet = new Set((QUALITY_REQUIRED_TONE_INDEXES[quality] ?? []).map((index) => expectedTones[index]).filter(Boolean))
  const missingRequiredTones = [...requiredToneSet].filter((tone) => !actualSet.has(tone))

  const status: TonalValidationStatus = extraTones.length === 0 && missingRequiredTones.length === 0 ? 'PASS' : 'FAIL'

  return {
    status,
    expectedTones,
    actualTones,
    missingTones,
    extraTones,
  }
}

export function inferBassInversion(root: MusicalKey, quality: ChordQuality, pattern: string): number {
  const parsed = parsePattern(pattern)
  if (!parsed) return 0

  const expectedTones = deriveTargetChordTones(root, quality)
  const bassTone = parsed.map((fret, stringIndex) => (fret === null ? null : semitoneOffset(OPEN_STRINGS[stringIndex], fret))).find((note): note is MusicalKey => note !== null)

  if (!bassTone) return 0
  const inversionIndex = expectedTones.indexOf(bassTone)
  if (inversionIndex === -1) return 0
  return Math.min(inversionIndex, 3)
}

export function inferRootString(pattern: string): RootString {
  const parsed = parsePattern(pattern)
  if (!parsed) return 6

  const firstActive = parsed.findIndex((fret) => fret !== null)
  if (firstActive <= 0) return 6
  if (firstActive === 1) return 5
  return 4
}

const NON_PLAYABLE_PATTERNS = new Set(['5,x,2,0,0,9'])

function isValidPatternFormat(pattern: string): boolean {
  return parsePattern(pattern) !== null
}

function validatePatternFormat(pattern: string): string[] {
  return isValidPatternFormat(pattern)
    ? []
    : [
        `pattern must encode ${CHORD_STRING_COUNT} strings using digits or x (legacy compact: 6 chars; multi-digit format: comma/space delimited)`,
      ]
}

export function validateChordPlayability(pattern: string): PlayabilityValidationResult {
  const formatReasons = validatePatternFormat(pattern)
  if (formatReasons.length > 0) {
    return { status: 'FAIL', reasons: formatReasons }
  }

  const parsed = parsePattern(pattern)
  const canonical = parsed ? stringifyPattern(parsed) : null

  if (canonical && NON_PLAYABLE_PATTERNS.has(canonical)) {
    return { status: 'FAIL', reasons: ['blocked known unreliable shape'] }
  }

  if (!parsed) {
    return { status: 'FAIL', reasons: ['invalid pattern format'] }
  }

  const activeStringIndices = parsed.map((fret, idx) => (fret === null ? null : idx)).filter((idx): idx is number => idx !== null)
  const frets = parsed.filter((fret): fret is number => fret !== null)

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
    const hasInnerMuteGap = parsed.slice(firstActive, lastActive + 1).some((fret) => fret === null)
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
