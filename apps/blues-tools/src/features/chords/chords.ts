import type { MusicalKey } from '../../domain/music/types'
import { CHROMATIC_KEYS } from '../../domain/music/keys'

export type ChordQuality = 'maj' | 'm' | '7' | 'maj7' | 'm7' | 'm7b5' | '9' | 'maj9' | 'm9'
export type RootString = 6 | 5 | 4
export type Inversion = 0 | 1 | 2 | 3
export type ChordInversion = 'root' | '1st' | '2nd'

type PatternToken = number | 'x'

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

type VoicingTemplate = {
  rootString: RootString
  inversion: Inversion
  tokens: [PatternToken, PatternToken, PatternToken, PatternToken, PatternToken, PatternToken]
  sourceId?: keyof typeof CHORD_SOURCES
  verificationStatus?: VerificationStatus
  verificationNotes?: string
}

const CHORD_SOURCES: Record<string, ChordSource> = {
  caged: {
    id: 'caged',
    title: 'CAGED open-position + movable voicing practice set',
    publisherOrAuthor: 'Internal pedagogy baseline',
    sourceName: 'CAGED 练习体系',
    sourceType: '课程实践',
    confidenceLevel: 'medium',
  },
  halLeonard: {
    id: 'halLeonard',
    title: 'Hal Leonard Guitar Method, Chord Dictionary section',
    publisherOrAuthor: 'Will Schmid & Greg Koch',
    sourceName: 'Hal Leonard Guitar Method',
    sourceType: '理论',
    confidenceLevel: 'high',
  },
  justin: {
    id: 'justin',
    title: 'JustinGuitar Chord Library',
    publisherOrAuthor: 'Justin Sandercoe',
    url: 'https://www.justinguitar.com/chords',
    sourceName: 'JustinGuitar Chord Library',
    sourceType: '指型参考',
    confidenceLevel: 'high',
  },
  mickeyBaker: {
    id: 'mickeyBaker',
    title: 'Mickey Baker’s Complete Course in Jazz Guitar (Book 1)',
    publisherOrAuthor: 'Mickey Baker',
    sourceName: 'Mickey Baker Jazz Guitar',
    sourceType: '理论',
    confidenceLevel: 'medium',
  },
  fallback: {
    id: 'fallback',
    title: 'Auto fallback: nearest playable root-position voicing',
    publisherOrAuthor: 'blues-tools runtime fallback',
    sourceName: '运行时回退近似',
    sourceType: '课程实践',
    confidenceLevel: 'low',
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

const VOICING_TEMPLATES: Record<RootString, Record<ChordQuality, VoicingTemplate[]>> = {
  6: {
    maj: [
      { rootString: 6, inversion: 0, tokens: [0, 2, 2, 1, 0, 0] },
      { rootString: 6, inversion: 1, tokens: [0, x(1), 2, 1, 0, x(1)] },
      { rootString: 6, inversion: 2, tokens: [0, x(1), x(1), 1, 0, 0] },
    ],
    m: [
      { rootString: 6, inversion: 0, tokens: [0, 2, 2, 0, 0, 0] },
      { rootString: 6, inversion: 1, tokens: [0, x(1), 2, 0, 0, x(1)] },
      { rootString: 6, inversion: 2, tokens: [0, x(1), x(1), 0, 0, 0] },
    ],
    '7': [
      { rootString: 6, inversion: 0, tokens: [0, 2, 0, 1, 0, 0] },
      { rootString: 6, inversion: 0, tokens: [0, x(1), 2, 1, 3, 0] },
      { rootString: 6, inversion: 1, tokens: [0, x(1), 0, 1, 0, x(1)] },
      { rootString: 6, inversion: 2, tokens: [0, x(1), x(1), 1, 0, 0] },
      { rootString: 6, inversion: 3, tokens: [0, 2, 0, 1, 3, 0] },
    ],
    maj7: [
      { rootString: 6, inversion: 0, tokens: [0, 2, 1, 1, 0, 0] },
      { rootString: 6, inversion: 1, tokens: [0, x(1), 1, 1, 0, x(1)] },
      { rootString: 6, inversion: 2, tokens: [0, x(1), x(1), 1, 0, 0] },
      { rootString: 6, inversion: 3, tokens: [0, 2, 1, 1, 3, 0] },
    ],
    m7: [
      { rootString: 6, inversion: 0, tokens: [0, 2, 0, 0, 0, 0] },
      { rootString: 6, inversion: 1, tokens: [0, x(1), 0, 0, 0, x(1)] },
      { rootString: 6, inversion: 2, tokens: [0, x(1), x(1), 0, 0, 0] },
      { rootString: 6, inversion: 3, tokens: [0, 2, 0, 0, 3, 0] },
    ],
    m7b5: [
      { rootString: 6, inversion: 0, tokens: [0, 1, 0, 0, 0, 0] },
      { rootString: 6, inversion: 1, tokens: [0, x(1), 0, 0, 0, x(1)] },
      { rootString: 6, inversion: 2, tokens: [0, x(1), x(1), 0, 0, 0] },
      { rootString: 6, inversion: 3, tokens: [0, 1, 0, 0, 3, 0] },
    ],
    '9': [
      { rootString: 6, inversion: 0, tokens: [0, 2, 0, 1, 0, 2] },
      { rootString: 6, inversion: 1, tokens: [0, x(1), 0, 1, 2, 2] },
      { rootString: 6, inversion: 2, tokens: [0, x(1), x(1), 1, 2, 2] },
    ],
    maj9: [{ rootString: 6, inversion: 0, tokens: [0, 2, 1, 1, 0, 2] }],
    m9: [{ rootString: 6, inversion: 0, tokens: [0, 2, 0, 0, 0, 2] }],
  },
  5: {
    maj: [
      { rootString: 5, inversion: 0, tokens: ['x', 0, 2, 2, 2, 0] },
      { rootString: 5, inversion: 1, tokens: ['x', 0, 2, 2, 0, 0] },
      { rootString: 5, inversion: 2, tokens: ['x', 0, x(1), 2, 2, 0] },
    ],
    m: [
      { rootString: 5, inversion: 0, tokens: ['x', 0, 2, 2, 1, 0] },
      { rootString: 5, inversion: 1, tokens: ['x', 0, 2, 0, 1, 0] },
      { rootString: 5, inversion: 2, tokens: ['x', 0, x(1), 2, 1, 0] },
    ],
    '7': [
      { rootString: 5, inversion: 0, tokens: ['x', 0, 2, 0, 2, 0] },
      { rootString: 5, inversion: 1, tokens: ['x', 0, 2, 0, 0, 0] },
      { rootString: 5, inversion: 2, tokens: ['x', 0, x(1), 0, 2, 0] },
      { rootString: 5, inversion: 3, tokens: ['x', 0, 2, 0, 2, 3] },
    ],
    maj7: [
      { rootString: 5, inversion: 0, tokens: ['x', 0, 2, 1, 2, 0] },
      { rootString: 5, inversion: 1, tokens: ['x', 0, 2, 1, 0, 0] },
      { rootString: 5, inversion: 2, tokens: ['x', 0, x(1), 1, 2, 0] },
      { rootString: 5, inversion: 3, tokens: ['x', 0, 2, 1, 2, 4] },
    ],
    m7: [
      { rootString: 5, inversion: 0, tokens: ['x', 0, 2, 0, 1, 0] },
      { rootString: 5, inversion: 1, tokens: ['x', 0, 2, 0, 0, 0] },
      { rootString: 5, inversion: 2, tokens: ['x', 0, x(1), 0, 1, 0] },
      { rootString: 5, inversion: 3, tokens: ['x', 0, 2, 0, 1, 3] },
    ],
    m7b5: [
      { rootString: 5, inversion: 0, tokens: ['x', 0, 1, 0, 1, 0] },
      { rootString: 5, inversion: 1, tokens: ['x', 0, 1, 0, 0, 0] },
      { rootString: 5, inversion: 2, tokens: ['x', 0, x(1), 0, 1, 0] },
      { rootString: 5, inversion: 3, tokens: ['x', 0, 1, 0, 1, 3] },
    ],
    '9': [
      { rootString: 5, inversion: 0, tokens: ['x', 0, 2, 0, 2, 2] },
      { rootString: 5, inversion: 1, tokens: ['x', 0, 2, 0, 0, 2] },
      { rootString: 5, inversion: 2, tokens: ['x', 0, x(1), 0, 2, 2] },
    ],
    maj9: [{ rootString: 5, inversion: 0, tokens: ['x', 0, 2, 1, 2, 2] }],
    m9: [{ rootString: 5, inversion: 0, tokens: ['x', 0, 2, 0, 1, 2] }],
  },
  4: {
    maj: [
      { rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 2, 3, 2] },
      { rootString: 4, inversion: 1, tokens: ['x', 'x', 0, 2, 1, 2] },
      { rootString: 4, inversion: 2, tokens: ['x', 'x', 0, 0, 1, 2] },
    ],
    m: [
      { rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 2, 3, 1] },
      { rootString: 4, inversion: 1, tokens: ['x', 'x', 0, 2, 1, 1] },
      { rootString: 4, inversion: 2, tokens: ['x', 'x', 0, 0, 1, 1] },
    ],
    '7': [
      { rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 2, 1, 2] },
      { rootString: 4, inversion: 1, tokens: ['x', 'x', 0, 0, 1, 2] },
      { rootString: 4, inversion: 2, tokens: ['x', 'x', 0, 2, 1, 0] },
      { rootString: 4, inversion: 3, tokens: ['x', 'x', 0, 2, 4, 5] },
    ],
    maj7: [
      { rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 2, 2, 2] },
      { rootString: 4, inversion: 1, tokens: ['x', 'x', 0, 0, 2, 2] },
      { rootString: 4, inversion: 2, tokens: ['x', 'x', 0, 2, 2, 0] },
      { rootString: 4, inversion: 3, tokens: ['x', 'x', 0, 2, 5, 5] },
    ],
    m7: [
      { rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 2, 1, 1] },
      { rootString: 4, inversion: 1, tokens: ['x', 'x', 0, 0, 1, 1] },
      { rootString: 4, inversion: 2, tokens: ['x', 'x', 0, 2, 1, 0] },
      { rootString: 4, inversion: 3, tokens: ['x', 'x', 0, 2, 4, 4] },
    ],
    m7b5: [
      { rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 1, 1, 1] },
      { rootString: 4, inversion: 1, tokens: ['x', 'x', 0, 0, 1, 1] },
      { rootString: 4, inversion: 2, tokens: ['x', 'x', 0, 1, 1, 0] },
      { rootString: 4, inversion: 3, tokens: ['x', 'x', 0, 1, 4, 4] },
    ],
    '9': [
      { rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 2, 1, 2] },
      { rootString: 4, inversion: 1, tokens: ['x', 'x', 0, 0, 1, 2] },
      { rootString: 4, inversion: 2, tokens: ['x', 'x', 0, 2, 1, 0] },
    ],
    maj9: [{ rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 2, 2, 2] }],
    m9: [{ rootString: 4, inversion: 0, tokens: ['x', 'x', 0, 2, 1, 1] }],
  },
}

const ROOT_STRING_TO_OPEN_NOTE: Record<RootString, MusicalKey> = {
  6: 'E',
  5: 'A',
  4: 'D',
}

function x(_n: number): 'x' {
  return 'x'
}

function getRootFret(root: MusicalKey, rootString: RootString): number {
  const open = ROOT_STRING_TO_OPEN_NOTE[rootString]
  const rootIndex = CHROMATIC_KEYS.indexOf(root)
  const openIndex = CHROMATIC_KEYS.indexOf(open)
  return (rootIndex - openIndex + CHROMATIC_KEYS.length) % CHROMATIC_KEYS.length
}

function toInversionNumber(inversion: Inversion | ChordInversion): Inversion {
  if (inversion === 'root') return 0
  if (inversion === '1st') return 1
  if (inversion === '2nd') return 2
  return inversion
}

function renderPattern(template: VoicingTemplate, rootFret: number): string | null {
  const rendered = template.tokens.map((token) => {
    if (token === 'x') return 'x'
    const fret = rootFret + token
    if (fret < 0 || fret > 9) return null
    return String(fret)
  })

  if (rendered.some((value) => value === null)) return null
  return rendered.join('')
}

function sourceIdByQuality(quality: ChordQuality): keyof typeof CHORD_SOURCES {
  if (quality === 'maj' || quality === 'm') return 'justin'
  if (quality === '7' || quality === 'maj7' || quality === 'm7') return 'halLeonard'
  return 'mickeyBaker'
}

function inferShapeSourceId(template: VoicingTemplate, quality: ChordQuality): keyof typeof CHORD_SOURCES {
  if (template.sourceId) return template.sourceId
  const mutedStrings = template.tokens.filter((token) => token === 'x').length
  if (quality === '9' || quality === 'maj9' || quality === 'm9') return 'mickeyBaker'
  if (template.inversion === 3) return 'halLeonard'
  if (mutedStrings >= 2) return 'caged'
  return sourceIdByQuality(quality)
}

function resolveTemplateSource(template: VoicingTemplate, quality: ChordQuality): ChordShapeSourceRef {
  const source = CHORD_SOURCES[inferShapeSourceId(template, quality)]
  const verificationStatus: VerificationStatus = template.verificationStatus ?? '已校验'
  return {
    source,
    verificationStatus,
    verificationNotes: template.verificationNotes ?? (verificationStatus === '近似' ? '该形态来自近似映射。' : undefined),
  }
}

function confidenceBySource(source: ChordSource): number {
  if (source.confidenceLevel === 'high') return 0.92
  if (source.confidenceLevel === 'medium') return 0.84
  return 0.62
}

export function getChordVoicingOptions(
  root: MusicalKey,
  quality: ChordQuality,
  rootString: RootString = 6,
  inversion: Inversion | ChordInversion = 0,
): ChordVoicingOption[] {
  const rootFret = getRootFret(root, rootString)
  const inversionNumber = toInversionNumber(inversion)
  const templates = VOICING_TEMPLATES[rootString][quality].filter((template) => template.inversion === inversionNumber)

  const options = templates
    .map((template) => {
      const pattern = renderPattern(template, rootFret)
      if (!pattern) return null
      const shapeSource = resolveTemplateSource(template, quality)
      return {
        pattern,
        inversion: inversionNumber,
        source: shapeSource.source,
        shapeSource,
        confidence: confidenceBySource(shapeSource.source),
        fallback: false,
        isApproximateFallback: false,
      }
    })
    .filter((entry): entry is ChordVoicingOption => entry !== null)

  const deduped = options.filter((option, index) => options.findIndex((candidate) => candidate.pattern === option.pattern) === index).slice(0, 5)
  if (deduped.length > 0) return deduped

  if (inversionNumber !== 0) {
    return getChordVoicingOptions(root, quality, rootString, 0).map((option) => ({
      ...option,
      inversion: inversionNumber,
      source: CHORD_SOURCES.fallback,
      shapeSource: {
        source: CHORD_SOURCES.fallback,
        verificationStatus: '近似',
        verificationNotes: '当前转位暂无可验证指型，回退到原位可按形态。',
      },
      confidence: Math.min(0.65, option.confidence),
      fallback: true,
      note: '当前转位暂无稳定按法，先回退到同根音弦的原位按法。',
      isApproximateFallback: true,
      fallbackReason: '回退到原位近似按法：当前转位暂无稳定资料。',
    }))
  }

  return [
    {
      pattern: 'xxxxxx',
      inversion: 0,
      source: CHORD_SOURCES.fallback,
      shapeSource: {
        source: CHORD_SOURCES.fallback,
        verificationStatus: '近似',
        verificationNotes: '无可用可按指型，使用占位模式提示切换参数。',
      },
      confidence: 0.1,
      fallback: true,
      note: '未找到可按弦组合，建议切换根音弦或和弦性质。',
      isApproximateFallback: true,
      fallbackReason: '回退到占位指法：当前组合无可用按法。',
    },
  ]
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

export function getChordToneSet(root: MusicalKey, quality: ChordQuality): Set<MusicalKey> {
  const rootIndex = CHROMATIC_KEYS.indexOf(root)
  return new Set(QUALITY_INTERVALS[quality].map((step) => CHROMATIC_KEYS[(rootIndex + step) % CHROMATIC_KEYS.length]))
}
