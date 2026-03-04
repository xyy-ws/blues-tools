import guitarDb from '@tombatossals/chords-db/lib/guitar.json'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { inferBassInversion } from './chordValidation'
import type { ChordQuality, Inversion, RootString } from './chords'

type ChordsDbPosition = {
  frets: number[]
  fingers: number[]
  baseFret: number
  barres?: number[]
}

type ChordsDbChord = {
  key: string
  suffix: string
  positions: ChordsDbPosition[]
}

type ChordsDbData = {
  chords: Record<string, ChordsDbChord[]>
}

const chordsDbData = guitarDb as ChordsDbData

export type CuratedChordShape = {
  root: MusicalKey
  quality: ChordQuality
  rootString: RootString
  inversion: Inversion
  pattern: string
  labelZh: string
  sourceId: 'chordsDb' | 'legacy'
  verificationStatus: '已校验'
  verificationNotes: string
}

const SUFFIX_TO_QUALITY: Partial<Record<string, ChordQuality>> = {
  major: 'maj',
  minor: 'm',
  dim: 'dim',
  dim7: 'dim7',
  sus2: 'sus2',
  sus4: 'sus4',
  aug: 'aug',
  '6': '6',
  '7': '7',
  '9': '9',
  add9: 'add9',
  m6: 'm6',
  m7: 'm7',
  m7b5: 'm7b5',
  m9: 'm9',
  maj7: 'maj7',
  maj9: 'maj9',
}

const FLAT_TO_SHARP: Record<string, MusicalKey> = {
  C: 'C',
  'C#': 'C#',
  Db: 'C#',
  D: 'D',
  'D#': 'D#',
  Eb: 'D#',
  E: 'E',
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
}

const OPEN_STRINGS: MusicalKey[] = ['E', 'A', 'D', 'G', 'B', 'E']

const LEGACY_UNSUPPORTED_SHAPES: CuratedChordShape[] = [
  {
    root: 'E',
    quality: '5',
    rootString: 6,
    inversion: 0,
    pattern: '022xxx',
    labelZh: 'E5 实用五和弦',
    sourceId: 'legacy',
    verificationStatus: '已校验',
    verificationNotes: 'Legacy fallback for unsupported chords-db suffix (5).',
  },
  {
    root: 'A',
    quality: '5',
    rootString: 5,
    inversion: 0,
    pattern: 'x022xx',
    labelZh: 'A5 实用五和弦',
    sourceId: 'legacy',
    verificationStatus: '已校验',
    verificationNotes: 'Legacy fallback for unsupported chords-db suffix (5).',
  },
  {
    root: 'D',
    quality: '5',
    rootString: 4,
    inversion: 0,
    pattern: 'xx023x',
    labelZh: 'D5 实用五和弦',
    sourceId: 'legacy',
    verificationStatus: '已校验',
    verificationNotes: 'Legacy fallback for unsupported chords-db suffix (5).',
  },
]

export function normalizeChordDbKey(key: string): MusicalKey | null {
  return FLAT_TO_SHARP[key] ?? null
}

export function mapChordDbSuffix(suffix: string): ChordQuality | null {
  return SUFFIX_TO_QUALITY[suffix] ?? null
}

function toAbsoluteFret(fret: number, baseFret: number): number {
  if (fret <= 0) return fret
  return baseFret > 1 ? fret + baseFret - 1 : fret
}

function toPattern(position: ChordsDbPosition): string | null {
  if (position.frets.length !== 6) return null
  const pattern = position.frets
    .map((fret) => {
      if (fret < 0) return 'x'
      const absolute = toAbsoluteFret(fret, position.baseFret)
      if (absolute < 0 || absolute > 9) return null
      return String(absolute)
    })
    .join('')

  if (pattern.includes('null')) return null
  return pattern
}

function semitoneOffset(from: MusicalKey, semitone: number): MusicalKey {
  const start = CHROMATIC_KEYS.indexOf(from)
  return CHROMATIC_KEYS[(start + semitone + CHROMATIC_KEYS.length) % CHROMATIC_KEYS.length]
}

function inferRootStringFromPattern(root: MusicalKey, pattern: string): RootString | null {
  const chars = pattern.split('')
  const candidates: RootString[] = [6, 5, 4]

  for (const rootString of candidates) {
    const stringIndex = 6 - rootString
    const char = chars[stringIndex]
    if (char === 'x') continue
    const fret = Number.parseInt(char, 10)
    if (Number.isNaN(fret)) continue
    const note = semitoneOffset(OPEN_STRINGS[stringIndex], fret)
    if (note === root) return rootString
  }

  const firstActive = chars.findIndex((char) => char !== 'x')
  if (firstActive <= 0) return 6
  if (firstActive === 1) return 5
  if (firstActive === 2) return 4
  return null
}

function adaptFromChordsDb(): CuratedChordShape[] {
  const adapted: CuratedChordShape[] = []

  for (const chordEntries of Object.values(chordsDbData.chords)) {
    for (const entry of chordEntries) {
      const root = normalizeChordDbKey(entry.key)
      const quality = mapChordDbSuffix(entry.suffix)
      if (!root || !quality) continue

      for (const position of entry.positions) {
        const pattern = toPattern(position)
        if (!pattern) continue
        const rootString = inferRootStringFromPattern(root, pattern)
        if (!rootString) continue
        const inversion = inferBassInversion(root, quality, pattern) as Inversion
        const barreText = position.barres && position.barres.length > 0 ? position.barres.join('/') : 'none'

        adapted.push({
          root,
          quality,
          rootString,
          inversion,
          pattern,
          labelZh: `${root}${quality} chords-db`,
          sourceId: 'chordsDb',
          verificationStatus: '已校验',
          verificationNotes: `source=chords-db guitar; baseFret=${position.baseFret}; barres=${barreText}; fingers=${position.fingers.join(',')}`,
        })
      }
    }
  }

  return adapted
}

function dedupeShapes(shapes: CuratedChordShape[]): CuratedChordShape[] {
  const seen = new Set<string>()
  const deduped: CuratedChordShape[] = []

  for (const shape of shapes) {
    const key = `${shape.root}|${shape.quality}|${shape.pattern}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(shape)
  }

  return deduped
}

export const CURATED_CHORD_SHAPES: CuratedChordShape[] = dedupeShapes([...adaptFromChordsDb(), ...LEGACY_UNSUPPORTED_SHAPES])

export const SUPPORTED_CHORDS_DB_SUFFIXES = Object.keys(SUFFIX_TO_QUALITY).sort()
