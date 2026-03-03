import type { MusicalKey } from '../../domain/music/types'

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
  halLeonard: {
    id: 'halLeonard',
    title: 'Hal Leonard Guitar Method, Chord Dictionary section',
    publisherOrAuthor: 'Will Schmid & Greg Koch',
    sourceName: 'Hal Leonard 和弦字典',
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

const STANDARD_CHORD_SHAPES: StandardChordShape[] = [
  { root: 'E', quality: 'maj', rootString: 6, inversion: 0, pattern: '022100', labelZh: 'E 大三开放和弦', sourceId: 'justin' },
  { root: 'E', quality: 'm', rootString: 6, inversion: 0, pattern: '022000', labelZh: 'Em 开放和弦', sourceId: 'justin' },
  { root: 'E', quality: '7', rootString: 6, inversion: 0, pattern: '020100', labelZh: 'E7 开放和弦', sourceId: 'justin' },
  { root: 'E', quality: '7', rootString: 6, inversion: 0, pattern: '0x2430', labelZh: 'E7 开放替代按法', sourceId: 'caged' },
  { root: 'E', quality: '7', rootString: 6, inversion: 1, pattern: '0x2100', labelZh: 'E7 第一转位简化', sourceId: 'caged' },
  { root: 'E', quality: 'maj7', rootString: 6, inversion: 0, pattern: '021100', labelZh: 'Emaj7 开放和弦', sourceId: 'justin' },
  { root: 'E', quality: 'm7', rootString: 6, inversion: 0, pattern: '020000', labelZh: 'Em7 开放和弦', sourceId: 'justin' },
  { root: 'E', quality: '9', rootString: 6, inversion: 0, pattern: '020102', labelZh: 'E9 开放和弦', sourceId: 'halLeonard' },

  { root: 'A', quality: 'maj', rootString: 5, inversion: 0, pattern: 'x02220', labelZh: 'A 大三开放和弦', sourceId: 'justin' },
  { root: 'A', quality: 'm', rootString: 5, inversion: 0, pattern: 'x02210', labelZh: 'Am 开放和弦', sourceId: 'justin' },
  { root: 'A', quality: '7', rootString: 5, inversion: 0, pattern: 'x02020', labelZh: 'A7 开放和弦', sourceId: 'justin' },
  { root: 'A', quality: 'maj7', rootString: 5, inversion: 0, pattern: 'x02120', labelZh: 'Amaj7 开放和弦', sourceId: 'justin' },
  { root: 'A', quality: 'm7', rootString: 5, inversion: 0, pattern: 'x02010', labelZh: 'Am7 开放和弦', sourceId: 'justin' },
  { root: 'A', quality: '9', rootString: 5, inversion: 0, pattern: 'x02423', labelZh: 'A9 常用按法', sourceId: 'halLeonard' },

  { root: 'D', quality: 'maj', rootString: 4, inversion: 0, pattern: 'xx0232', labelZh: 'D 大三开放和弦', sourceId: 'justin' },
  { root: 'D', quality: 'm', rootString: 4, inversion: 0, pattern: 'xx0231', labelZh: 'Dm 开放和弦', sourceId: 'justin' },
  { root: 'D', quality: '7', rootString: 4, inversion: 0, pattern: 'xx0212', labelZh: 'D7 开放和弦', sourceId: 'justin' },
  { root: 'D', quality: 'maj7', rootString: 4, inversion: 0, pattern: 'xx0222', labelZh: 'Dmaj7 开放和弦', sourceId: 'justin' },
  { root: 'D', quality: 'm7', rootString: 4, inversion: 0, pattern: 'xx0211', labelZh: 'Dm7 开放和弦', sourceId: 'justin' },

  { root: 'C', quality: 'maj', rootString: 5, inversion: 0, pattern: 'x32010', labelZh: 'C 大三开放和弦', sourceId: 'justin' },
  { root: 'C', quality: '7', rootString: 5, inversion: 0, pattern: 'x32310', labelZh: 'C7 开放和弦', sourceId: 'justin' },
  { root: 'C', quality: 'maj7', rootString: 5, inversion: 0, pattern: 'x32000', labelZh: 'Cmaj7 开放和弦', sourceId: 'justin' },
  { root: 'C', quality: 'm7', rootString: 5, inversion: 0, pattern: 'x35343', labelZh: 'Cm7 封闭和弦', sourceId: 'halLeonard' },
  { root: 'C', quality: 'm', rootString: 5, inversion: 0, pattern: 'x35543', labelZh: 'Cm 封闭和弦', sourceId: 'halLeonard' },

  { root: 'G', quality: 'maj', rootString: 6, inversion: 0, pattern: '320003', labelZh: 'G 大三开放和弦', sourceId: 'justin' },
  { root: 'G', quality: '7', rootString: 6, inversion: 0, pattern: '320001', labelZh: 'G7 开放和弦', sourceId: 'justin' },
  { root: 'G', quality: 'maj7', rootString: 6, inversion: 0, pattern: '320002', labelZh: 'Gmaj7 开放和弦', sourceId: 'justin' },
  { root: 'G', quality: 'm', rootString: 6, inversion: 0, pattern: '355333', labelZh: 'Gm 封闭和弦', sourceId: 'halLeonard' },
  { root: 'G', quality: 'm7', rootString: 6, inversion: 0, pattern: '353333', labelZh: 'Gm7 封闭和弦', sourceId: 'halLeonard' },

  { root: 'F', quality: 'maj', rootString: 6, inversion: 0, pattern: '133211', labelZh: 'F 大三封闭和弦', sourceId: 'halLeonard' },
  { root: 'F', quality: 'm', rootString: 6, inversion: 0, pattern: '133111', labelZh: 'Fm 封闭和弦', sourceId: 'halLeonard' },
  { root: 'F', quality: '7', rootString: 6, inversion: 0, pattern: '131211', labelZh: 'F7 封闭和弦', sourceId: 'halLeonard' },
]

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
  const selected = STANDARD_CHORD_SHAPES.filter(
    (shape) => shape.root === root && shape.quality === quality && shape.rootString === rootString && shape.inversion === inversionNumber,
  )

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
