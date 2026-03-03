import type { MusicalKey } from '../../domain/music/types'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import { inferBassInversion, inferRootString, validateChordPattern } from './chordValidation'

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

type RawChordShape = Omit<StandardChordShape, 'rootString' | 'inversion'> & {
  rootString?: RootString
  inversion?: Inversion
}

type MovableTemplate = {
  root: MusicalKey
  quality: ChordQuality
  rootString: RootString
  pattern: string
  sourceId: keyof typeof CHORD_SOURCES
  labelZh: string
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
  tonal: {
    id: 'tonal',
    title: 'TonalJS chord spellings and interval validation',
    publisherOrAuthor: 'Tonal contributors',
    url: 'https://github.com/tonaljs/tonal',
    sourceName: 'TonalJS 音程校验',
    sourceType: '理论',
    confidenceLevel: 'high',
  },
  caged: {
    id: 'caged',
    title: 'CAGED open-position + movable voicing practice set',
    publisherOrAuthor: 'Internal pedagogy baseline',
    sourceName: 'CAGED 教学整理',
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

const GENERATED_SHAPES: Record<MusicalKey, Record<ChordQuality, { pattern: string; rootString: RootString }>> = {
  C: {
    maj: { pattern: '8xxx53', rootString: 6 },
    m: { pattern: '8xxx43', rootString: 6 },
    '7': { pattern: '8xx056', rootString: 6 },
    maj7: { pattern: '8xx000', rootString: 6 },
    m7: { pattern: '8xx046', rootString: 6 },
    m7b5: { pattern: '8xx342', rootString: 6 },
    '9': { pattern: '8x0056', rootString: 6 },
    maj9: { pattern: '8x0000', rootString: 6 },
    m9: { pattern: '8x0046', rootString: 6 },
  },
  'C#': {
    maj: { pattern: '9xxx64', rootString: 6 },
    m: { pattern: '9xxx54', rootString: 6 },
    '7': { pattern: '9xx101', rootString: 6 },
    maj7: { pattern: '9xx111', rootString: 6 },
    m7: { pattern: '9xx100', rootString: 6 },
    m7b5: { pattern: '9xx000', rootString: 6 },
    '9': { pattern: '9x1101', rootString: 6 },
    maj9: { pattern: '9x1111', rootString: 6 },
    m9: { pattern: '9x1100', rootString: 6 },
  },
  D: {
    maj: { pattern: 'x5xx75', rootString: 5 },
    m: { pattern: 'x5xx65', rootString: 5 },
    '7': { pattern: 'x5x212', rootString: 5 },
    maj7: { pattern: 'x5x222', rootString: 5 },
    m7: { pattern: 'x5x211', rootString: 5 },
    m7b5: { pattern: 'x5x111', rootString: 5 },
    '9': { pattern: 'x52212', rootString: 5 },
    maj9: { pattern: 'x52222', rootString: 5 },
    m9: { pattern: 'x52211', rootString: 5 },
  },
  'D#': {
    maj: { pattern: 'x6xx86', rootString: 5 },
    m: { pattern: 'x6xx76', rootString: 5 },
    '7': { pattern: 'x6x026', rootString: 5 },
    maj7: { pattern: 'x6x036', rootString: 5 },
    m7: { pattern: 'x6x322', rootString: 5 },
    m7b5: { pattern: 'x6x222', rootString: 5 },
    '9': { pattern: 'x63026', rootString: 5 },
    maj9: { pattern: 'x60066', rootString: 5 },
    m9: { pattern: 'x63322', rootString: 5 },
  },
  E: {
    maj: { pattern: '0xxx04', rootString: 6 },
    m: { pattern: '0xxx03', rootString: 6 },
    '7': { pattern: '0xx137', rootString: 6 },
    maj7: { pattern: '0xx147', rootString: 6 },
    m7: { pattern: '0xx037', rootString: 6 },
    m7b5: { pattern: '0xx036', rootString: 6 },
    '9': { pattern: '0x0102', rootString: 6 },
    maj9: { pattern: '0x1102', rootString: 6 },
    m9: { pattern: '0x0002', rootString: 6 },
  },
  F: {
    maj: { pattern: '1xxx15', rootString: 6 },
    m: { pattern: '1xxx14', rootString: 6 },
    '7': { pattern: '1xx248', rootString: 6 },
    maj7: { pattern: '1xx210', rootString: 6 },
    m7: { pattern: '1xx148', rootString: 6 },
    m7b5: { pattern: '1xx147', rootString: 6 },
    '9': { pattern: '1x1015', rootString: 6 },
    maj9: { pattern: '1x2015', rootString: 6 },
    m9: { pattern: '1x1014', rootString: 6 },
  },
  'F#': {
    maj: { pattern: '2xxx26', rootString: 6 },
    m: { pattern: '2xxx25', rootString: 6 },
    '7': { pattern: '2xx320', rootString: 6 },
    maj7: { pattern: '2xx321', rootString: 6 },
    m7: { pattern: '2xx220', rootString: 6 },
    m7b5: { pattern: '2xx210', rootString: 6 },
    '9': { pattern: '2x2126', rootString: 6 },
    maj9: { pattern: '2x3126', rootString: 6 },
    m9: { pattern: '2x2125', rootString: 6 },
  },
  G: {
    maj: { pattern: '3xxx37', rootString: 6 },
    m: { pattern: '3xxx36', rootString: 6 },
    '7': { pattern: '3xx431', rootString: 6 },
    maj7: { pattern: '3xx432', rootString: 6 },
    m7: { pattern: '3xx331', rootString: 6 },
    m7b5: { pattern: '3xx321', rootString: 6 },
    '9': { pattern: '3x0201', rootString: 6 },
    maj9: { pattern: '3x0202', rootString: 6 },
    m9: { pattern: '3x0266', rootString: 6 },
  },
  'G#': {
    maj: { pattern: '4xxx48', rootString: 6 },
    m: { pattern: '4xxx47', rootString: 6 },
    '7': { pattern: '4xx542', rootString: 6 },
    maj7: { pattern: '4xx048', rootString: 6 },
    m7: { pattern: '4xx442', rootString: 6 },
    m7b5: { pattern: '4xx432', rootString: 6 },
    '9': { pattern: '4x1312', rootString: 6 },
    maj9: { pattern: '4x1016', rootString: 6 },
    m9: { pattern: '4x1302', rootString: 6 },
  },
  A: {
    maj: { pattern: '5xxx20', rootString: 6 },
    m: { pattern: '5xxx10', rootString: 6 },
    '7': { pattern: '5xx020', rootString: 6 },
    maj7: { pattern: '5xx120', rootString: 6 },
    m7: { pattern: '5xx010', rootString: 6 },
    m7b5: { pattern: '5xx048', rootString: 6 },
    '9': { pattern: '5x2009', rootString: 6 },
    maj9: { pattern: '5x2109', rootString: 6 },
    m9: { pattern: '5x2008', rootString: 6 },
  },
  'A#': {
    maj: { pattern: '6xxx31', rootString: 6 },
    m: { pattern: '6xxx21', rootString: 6 },
    '7': { pattern: '6xx131', rootString: 6 },
    maj7: { pattern: '6xx231', rootString: 6 },
    m7: { pattern: '6xx121', rootString: 6 },
    m7b5: { pattern: '6xx120', rootString: 6 },
    '9': { pattern: '6x0111', rootString: 6 },
    maj9: { pattern: '6x0211', rootString: 6 },
    m9: { pattern: '6x3119', rootString: 6 },
  },
  B: {
    maj: { pattern: '7xxx42', rootString: 6 },
    m: { pattern: '7xxx32', rootString: 6 },
    '7': { pattern: '7xx242', rootString: 6 },
    maj7: { pattern: '7xx342', rootString: 6 },
    m7: { pattern: '7xx232', rootString: 6 },
    m7b5: { pattern: '7xx231', rootString: 6 },
    '9': { pattern: '7x1222', rootString: 6 },
    maj9: { pattern: '7x1322', rootString: 6 },
    m9: { pattern: '7x0222', rootString: 6 },
  },
}

const MOVABLE_TEMPLATES: MovableTemplate[] = [
  { root: 'E', quality: 'maj', rootString: 6, pattern: '022100', sourceId: 'chordRocks', labelZh: 'E-shape 大三开放/横按指型' },
  { root: 'E', quality: 'm', rootString: 6, pattern: '022000', sourceId: 'chordRocks', labelZh: 'E-shape 小三开放/横按指型' },
  { root: 'E', quality: '7', rootString: 6, pattern: '020100', sourceId: 'justin', labelZh: 'E7 开放/蓝调核心指型' },
  { root: 'E', quality: 'maj7', rootString: 6, pattern: '021100', sourceId: 'guitaristsReference', labelZh: 'Emaj7 开放指型' },
  { root: 'E', quality: 'm7', rootString: 6, pattern: '020000', sourceId: 'chordRocks', labelZh: 'Em7 开放/横按指型' },
  { root: 'E', quality: 'm7b5', rootString: 6, pattern: '0x2333', sourceId: 'guitaristsReference', labelZh: 'Em7♭5 实用封闭形' },
  { root: 'E', quality: '9', rootString: 6, pattern: '020102', sourceId: 'chordRocks', labelZh: 'E9 开放常用指型' },
  { root: 'E', quality: 'maj9', rootString: 6, pattern: '021102', sourceId: 'guitaristsReference', labelZh: 'Emaj9 开放常用指型' },
  { root: 'E', quality: 'm9', rootString: 6, pattern: '020002', sourceId: 'guitaristsReference', labelZh: 'Em9 开放常用指型' },

  { root: 'A', quality: 'maj', rootString: 5, pattern: 'x02220', sourceId: 'chordRocks', labelZh: 'A-shape 大三开放/横按指型' },
  { root: 'A', quality: 'm', rootString: 5, pattern: 'x02210', sourceId: 'chordRocks', labelZh: 'A-shape 小三开放/横按指型' },
  { root: 'A', quality: '7', rootString: 5, pattern: 'x02020', sourceId: 'justin', labelZh: 'A7 蓝调核心指型' },
  { root: 'A', quality: 'maj7', rootString: 5, pattern: 'x02120', sourceId: 'guitaristsReference', labelZh: 'Amaj7 开放指型' },
  { root: 'A', quality: 'm7', rootString: 5, pattern: 'x02010', sourceId: 'chordRocks', labelZh: 'Am7 开放/横按指型' },
  { root: 'A', quality: 'm7b5', rootString: 5, pattern: 'x01011', sourceId: 'guitaristsReference', labelZh: 'Am7♭5 常用封闭形' },
  { root: 'A', quality: '9', rootString: 5, pattern: 'x02423', sourceId: 'chordRocks', labelZh: 'A9 常用五弦根音形' },
  { root: 'A', quality: 'maj9', rootString: 5, pattern: 'x02100', sourceId: 'guitaristsReference', labelZh: 'Amaj9 开放常用形' },
  { root: 'A', quality: 'm9', rootString: 5, pattern: 'x02000', sourceId: 'guitaristsReference', labelZh: 'Am9 开放常用形' },
]

function canTranspose(pattern: string, semitone: number): boolean {
  return pattern.split('').every((char) => {
    if (char === 'x' || char === 'X') return true
    const fret = Number.parseInt(char, 10)
    if (Number.isNaN(fret)) return false
    return fret + semitone >= 0 && fret + semitone <= 9
  })
}

function transposePattern(pattern: string, semitone: number): string {
  return pattern
    .split('')
    .map((char) => {
      if (char === 'x' || char === 'X') return 'x'
      const fret = Number.parseInt(char, 10)
      return String(fret + semitone)
    })
    .join('')
}

function transposeMovableTemplates(): RawChordShape[] {
  const result: RawChordShape[] = []

  for (const template of MOVABLE_TEMPLATES) {
    const templateIndex = CHROMATIC_KEYS.indexOf(template.root)
    for (const targetRoot of CHROMATIC_KEYS) {
      const targetIndex = CHROMATIC_KEYS.indexOf(targetRoot)
      const semitone = (targetIndex - templateIndex + 12) % 12
      if (!canTranspose(template.pattern, semitone)) continue

      result.push({
        root: targetRoot,
        quality: template.quality,
        pattern: transposePattern(template.pattern, semitone),
        rootString: template.rootString,
        sourceId: template.sourceId,
        labelZh: `${targetRoot}${template.quality} ${template.labelZh}`,
      })
    }
  }

  return result
}

function buildRawShapes(): RawChordShape[] {
  const generated = CHROMATIC_KEYS.flatMap((root) =>
    (Object.keys(CHORD_QUALITY_LABELS) as ChordQuality[]).map((quality) => ({
      root,
      quality,
      pattern: GENERATED_SHAPES[root][quality].pattern,
      rootString: GENERATED_SHAPES[root][quality].rootString,
      sourceId: 'caged' as const,
      labelZh: `${root}${quality} 标准指型`,
    })),
  )

  return [...generated, ...transposeMovableTemplates()]
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

function finalizeShapes(rawShapes: RawChordShape[]) {
  const records: ChordLibraryValidationRecord[] = rawShapes.map((shape) => {
    const result = validateChordPattern(shape.root, shape.quality, shape.pattern)
    const rootString = shape.rootString ?? inferRootString(shape.pattern)
    const inversion = shape.inversion ?? (inferBassInversion(shape.root, shape.quality, shape.pattern) as Inversion)

    return {
      root: shape.root,
      quality: shape.quality,
      pattern: shape.pattern,
      rootString,
      inversion,
      status: result.status,
      expectedTones: result.expectedTones,
      actualTones: result.actualTones,
      missingTones: result.missingTones,
      extraTones: result.extraTones,
    }
  })

  const validPatterns = new Set(records.filter((record) => record.status === 'PASS').map((record) => `${record.root}|${record.quality}|${record.pattern}`))

  const curated: StandardChordShape[] = rawShapes
    .filter((shape) => validPatterns.has(`${shape.root}|${shape.quality}|${shape.pattern}`))
    .map((shape) => {
      const rootString = shape.rootString ?? inferRootString(shape.pattern)
      const inversion = shape.inversion ?? (inferBassInversion(shape.root, shape.quality, shape.pattern) as Inversion)
      return {
        ...shape,
        rootString,
        inversion,
        verificationStatus: '已校验' as const,
        verificationNotes: `${shape.labelZh}（tonal PASS）`,
      }
    })

  return { curated, records }
}

const { curated: STANDARD_CHORD_SHAPES, records: CHORD_LIBRARY_VALIDATION_REPORT } = finalizeShapes(buildRawShapes())

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
