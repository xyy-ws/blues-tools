import type { MusicalKey } from '../../domain/music/types'
import { inferBassInversion, validateChordPattern, validateChordPlayability } from './chordValidation'
import { parsePattern } from './pattern'
import { CURATED_CHORD_SHAPES } from './chordsDbAdapter'
import { generateRankedFingerings } from './algorithmicFingerings'

export type ChordQuality = 'maj' | 'm' | '5' | '6' | 'm6' | 'sus2' | 'sus4' | 'add9' | 'dim' | 'dim7' | 'aug' | '7' | 'maj7' | 'm7' | 'm7b5' | '9' | 'maj9' | 'm9'
export type RootString = 6 | 5 | 4
export type Inversion = 0 | 1 | 2 | 3
export type ChordInversion = 'root' | '1st' | '2nd'

export type ChordSourceType = '理论' | '指型参考' | '课程实践' | '算法生成'
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
  sourceKind?: 'curated' | 'generated'
  rankingScore?: number
  rankingBadges?: string[]
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
  generated: {
    id: 'generated',
    title: 'OpenClaw Algorithmic Fingering Generator',
    publisherOrAuthor: 'blues-tools',
    sourceName: '算法生成器',
    sourceType: '算法生成',
    confidenceLevel: 'medium',
    notes: '按和弦音/可演奏性规则搜索并排序',
  },
  chordsDb: {
    id: 'chordsDb',
    title: '@tombatossals/chords-db guitar dataset',
    publisherOrAuthor: 'Tom Batossals contributors',
    url: 'https://github.com/tombatossals/chords-db',
    sourceName: 'chords-db 吉他和弦库',
    sourceType: '指型参考',
    confidenceLevel: 'high',
  },
  legacy: {
    id: 'legacy',
    title: 'Legacy curated fallback shapes',
    publisherOrAuthor: 'blues-tools',
    sourceName: '历史补充指型',
    sourceType: '课程实践',
    confidenceLevel: 'medium',
    notes: '仅用于 chords-db 未覆盖的性质（例如 power chord 5）',
  },
}

export const QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
  maj: [0, 4, 7],
  m: [0, 3, 7],
  '5': [0, 7],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  aug: [0, 4, 8],
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
  '5': [0, 1],
  '6': [0, 1, 2, 3],
  m6: [0, 1, 2, 3],
  sus2: [0, 1, 2],
  sus4: [0, 1, 2],
  add9: [0, 1, 2, 3],
  dim: [0, 1, 2],
  dim7: [0, 1, 2, 3],
  aug: [0, 1, 2],
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
  '5': '五和弦 (5)',
  '6': '大六 (6)',
  m6: '小六 (m6)',
  sus2: '挂二 (sus2)',
  sus4: '挂四 (sus4)',
  add9: '加九 (add9)',
  dim: '减三 (dim)',
  dim7: '减七 (dim7)',
  aug: '增三 (aug)',
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
  const parsed = parsePattern(pattern)
  const frets = (parsed ?? []).filter((fret): fret is number => fret !== null)

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
      sourceKind: 'curated',
    }
  })
}

export function getRankedGeneratedChordVoicings(
  root: MusicalKey,
  quality: ChordQuality,
  rootString: RootString = 6,
  inversion: Inversion | ChordInversion = 0,
  topN = 5,
): ChordVoicingOption[] {
  const inversionNumber = toInversionNumber(inversion)
  const generated = generateRankedFingerings(root, quality, rootString, inversionNumber, topN)
  const source = CHORD_SOURCES.generated

  return generated.map((item) => ({
    pattern: item.pattern,
    inversion: item.inversion,
    source,
    shapeSource: {
      source,
      verificationStatus: '已校验',
      verificationNotes: '算法生成：和弦音 + 可演奏性校验通过',
    },
    confidence: 0.78,
    fallback: false,
    note: `评分 ${item.score.toFixed(1)} / 组合权重`,
    isApproximateFallback: false,
    sourceKind: 'generated',
    rankingScore: item.score,
    rankingBadges: item.badges,
  }))
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
