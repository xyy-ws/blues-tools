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
  return [
    ...new Set(
      pattern
        .split('')
        .map((char, stringIndex) => {
          if (char.toLowerCase() === 'x') return null
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
  const expectedTones = deriveTargetChordTones(root, quality)
  const bassTone = pattern
    .split('')
    .map((char, stringIndex) => {
      if (char.toLowerCase() === 'x') return null
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
  const chars = pattern.split('')
  const firstActive = chars.findIndex((char) => char.toLowerCase() !== 'x')
  if (firstActive <= 0) return 6
  if (firstActive === 1) return 5
  return 4
}
