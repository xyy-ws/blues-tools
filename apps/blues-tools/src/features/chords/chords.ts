import type { MusicalKey } from '../../domain/music/types'
import { inferBassInversion, validateChordPattern, validateChordPlayability } from './chordValidation'
import { CURATED_CHORD_SHAPES } from './curatedShapes'

export type ChordQuality = 'maj' | 'm' | '7' | 'maj7' | 'm7' | 'm7b5' | '9' | 'maj9' | 'm9'
export type RootString = 6 | 5 | 4
export type Inversion = 0 | 1 | 2 | 3
export type ChordInversion = 'root' | '1st' | '2nd'

export type ChordSourceType = '理论' | '指型参考' | '课程实践'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type VerificationStatus = '已校验' | '近似'

export type ChordSource = {
  id: string
  title: string
  publisherOrAuthor: string
  url?: string
  sourceName: string
  sourceType: ChordSourceType
  confidenceLevel: ConfidenceLevel
  notes?: string
}

export type ChordShapeSourceRef = {
  source: ChordSource
  verificationStatus: VerificationStatus
  verificationNotes?: string
}

export type ChordVoicingOption = {
  pattern: string
  inversion: Inversion
  source: ChordSource
  shapeSource: ChordShapeSourceRef
  confidence: number
  fallback: boolean
  note?: string
  isApproximateFallback: boolean
  fallbackReason?: string
}

type StandardChordShape = {
  root: MusicalKey
  quality: ChordQuality
  rootString: RootString
  inversion: Inversion
  pattern: string
  labelZh: string
  sourceId: keyof typeof CHORD_SOURCES
  verificationStatus?: VerificationStatus
  verificationNotes?: string
}

const CHORD_SOURCES: Record<string, ChordSource> = {
  justin: {
    id: 'justin',
    title: 'JustinGuitar Chord Library',
    publisherOrAuthor: 'Justin Sandercoe',
    url: 'https://www.justinguitar.com/chords',
    sourceName: 'JustinGuitar 和弦库',
    sourceType: '指型参考',
    confidenceLevel: 'high',
  },
  chordRocks: {
    id: 'chordRocks',
    title: 'Chord.rocks practical guitar voicings',
    publisherOrAuthor: 'chord.rocks',
    url: 'https://chord.rocks/guitar/chords',
    sourceName: 'Chord.rocks 实战指型',
    sourceType: '指型参考',
    confidenceLevel: 'high',
  },
  guitaristsReference: {
    id: 'guitaristsReference',
    title: 'Guitarists Reference chord forms',
    publisherOrAuthor: 'Guitarists Reference',
    url: 'https://www.guitaristsreference.com/',
    sourceName: 'Guitarists Reference 常用和弦',
    sourceType: '课程实践',
    confidenceLevel: 'medium',
  },
}

export const QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
  maj: [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  '9': [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
}

export const INVERSION_OPTIONS: Record<ChordQuality, Inversion[]> = {
  maj: [0, 1, 2],
  m: [0, 1, 2],
  '7': [0, 1, 2, 3],
  maj7: [0, 1, 2, 3],
  m7: [0, 1, 2, 3],
  m7b5: [0, 1, 2, 3],
  '9': [0, 1, 2],
  maj9: [0, 1, 2],
  m9: [0, 1, 2],
}

export const CHORD_QUALITY_LABELS: Record<ChordQuality, string> = {
  maj: '大三 (maj)',
  m: '小三 (m)',
  '7': '属七 (7)',
  maj7: '大七 (maj7)',
  m7: '小七 (m7)',
  m7b5: '小七降五 (m7b5)',
  '9': '属九 (9)',
  maj9: '大九 (maj9)',
  m9: '小九 (m9)',
}

export type ChordLibraryValidationRecord = {
  root: MusicalKey
  quality: ChordQuality
  pattern: string
  rootString: RootString
  inversion: Inversion
  status: 'PASS' | 'WARN' | 'FAIL'
  expectedTones: MusicalKey[]
  actualTones: MusicalKey[]
  missingTones: MusicalKey[]
  extraTones: MusicalKey[]
}

function shapeRank(pattern: string): number {
  const frets = pattern
    .split('')
    .filter((char) => char !== 'x' && char !== 'X')
    .map((char) => Number.parseInt(char, 10))
    .filter((fret) => !Number.isNaN(fret))

  if (frets.length === 0) return 999
  const min = Math.min(...frets)
  const max = Math.max(...frets)
  const span = max - min
  const openCount = frets.filter((fret) => fret === 0).length

  return min * 10 + span * 2 - openCount
}

function finalizeShapes(rawShapes: StandardChordShape[]) {
  const records: ChordLibraryValidationRecord[] = rawShapes.map((shape) => {
    const tonal = validateChordPattern(shape.root, shape.quality, shape.pattern)
    const playability = validateChordPlayability(shape.pattern)
    const inferredInversion = inferBassInversion(shape.root, shape.quality, shape.pattern) as Inversion

    const status = tonal.status === 'PASS' && playability.status === 'PASS' ? 'PASS' : 'FAIL'

    return {
      root: shape.root,
      quality: shape.quality,
      pattern: shape.pattern,
      rootString: shape.rootString,
      inversion: shape.inversion ?? inferredInversion,
      status,
      expectedTones: tonal.expectedTones,
      actualTones: tonal.actualTones,
      missingTones: tonal.missingTones,
      extraTones: tonal.extraTones,
    }
  })

  const validPatterns = new Set(records.filter((record) => record.status === 'PASS').map((record) => `${record.root}|${record.quality}|${record.pattern}`))

  const curated: StandardChordShape[] = rawShapes.filter((shape) => validPatterns.has(`${shape.root}|${shape.quality}|${shape.pattern}`))

  return { curated, records }
}

const { curated: STANDARD_CHORD_SHAPES, records: CHORD_LIBRARY_VALIDATION_REPORT } = finalizeShapes(CURATED_CHORD_SHAPES)

export { CHORD_LIBRARY_VALIDATION_REPORT }

function toInversionNumber(inversion: Inversion | ChordInversion): Inversion {
  if (inversion === 'root') return 0
  if (inversion === '1st') return 1
  if (inversion === '2nd') return 2
  return inversion
}

function confidenceBySource(source: ChordSource): number {
  if (source.confidenceLevel === 'high') return 0.92
  if (source.confidenceLevel === 'medium') return 0.84
  return 0.62
}

export function getRootStringOptions(root: MusicalKey, quality: ChordQuality): RootString[] {
  return [...new Set(STANDARD_CHORD_SHAPES.filter((shape) => shape.root === root && shape.quality === quality).map((shape) => shape.rootString))] as RootString[]
}

export function getInversionOptionsFor(root: MusicalKey, quality: ChordQuality, rootString: RootString): Inversion[] {
  return [
    ...new Set(
      STANDARD_CHORD_SHAPES
        .filter((shape) => shape.root === root && shape.quality === quality && shape.rootString === rootString)
        .map((shape) => shape.inversion),
    ),
  ] as Inversion[]
}

export function hasStandardChordShapes(root: MusicalKey, quality: ChordQuality): boolean {
  return STANDARD_CHORD_SHAPES.some((shape) => shape.root === root && shape.quality === quality)
}

export function getChordVoicingOptions(
  root: MusicalKey,
  quality: ChordQuality,
  rootString: RootString = 6,
  inversion: Inversion | ChordInversion = 0,
): ChordVoicingOption[] {
  const inversionNumber = toInversionNumber(inversion)
  const selected = STANDARD_CHORD_SHAPES
    .filter((shape) => shape.root === root && shape.quality === quality && shape.rootString === rootString && shape.inversion === inversionNumber)
    .slice()
    .sort((a, b) => shapeRank(a.pattern) - shapeRank(b.pattern) || a.pattern.localeCompare(b.pattern))

  return selected.map((shape) => {
    const source = CHORD_SOURCES[shape.sourceId]
    const shapeSource: ChordShapeSourceRef = {
      source,
      verificationStatus: shape.verificationStatus ?? '已校验',
      verificationNotes: shape.verificationNotes ?? shape.labelZh,
    }

    return {
      pattern: shape.pattern,
      inversion: shape.inversion,
      source,
      shapeSource,
      confidence: confidenceBySource(source),
      fallback: false,
      note: shape.labelZh,
      isApproximateFallback: false,
    }
  })
}

export function getChordFingeringEntries(
  root: MusicalKey,
  quality: ChordQuality,
  rootString: RootString = 6,
  inversion: Inversion | ChordInversion = 0,
): ChordVoicingOption[] {
  return getChordVoicingOptions(root, quality, rootString, inversion)
}

export function getChordFingerings(
  root: MusicalKey,
  quality: ChordQuality,
  rootString: RootString = 6,
  inversion: Inversion | ChordInversion = 0,
): string[] {
  return getChordFingeringEntries(root, quality, rootString, inversion).map((option) => option.pattern)
}

export function getChordFingering(
  root: MusicalKey,
  quality: ChordQuality,
  rootString: RootString = 6,
  inversion: Inversion | ChordInversion = 0,
): string {
  return getChordFingerings(root, quality, rootString, inversion)[0] ?? 'xxxxxx'
}
