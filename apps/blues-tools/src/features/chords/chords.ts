import type { MusicalKey } from '../../domain/music/types'
import { CHROMATIC_KEYS } from '../../domain/music/keys'

export type ChordQuality = 'maj' | 'm' | '7' | 'maj7' | 'm7' | 'm7b5' | '9' | 'maj9' | 'm9'
export type RootString = 6 | 5 | 4
export type Inversion = 0 | 1 | 2 | 3
export type ChordInversion = 'root' | '1st' | '2nd'

type PatternToken = number | 'x'

type VoicingTemplate = {
  rootString: RootString
  inversion: Inversion
  tokens: [PatternToken, PatternToken, PatternToken, PatternToken, PatternToken, PatternToken]
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

export function getChordFingerings(
  root: MusicalKey,
  quality: ChordQuality,
  rootString: RootString = 6,
  inversion: Inversion | ChordInversion = 0,
): string[] {
  const rootFret = getRootFret(root, rootString)
  const inversionNumber = toInversionNumber(inversion)
  const templates = VOICING_TEMPLATES[rootString][quality].filter((template) => template.inversion === inversionNumber)

  const available = templates
    .map((template) => renderPattern(template, rootFret))
    .filter((pattern): pattern is string => pattern !== null)

  if (available.length > 0) {
    return [...new Set(available)].slice(0, 5)
  }

  if (inversionNumber !== 0) {
    return getChordFingerings(root, quality, rootString, 0)
  }

  return ['xxxxxx']
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
