import type { MusicalKey } from '../../domain/music/types'
import { CHROMATIC_KEYS } from '../../domain/music/keys'

export type ChordQuality = 'dominant7' | 'minor7' | 'major'
export type RootString = 6 | 5 | 4

type PatternToken = number | 'x'

type VoicingTemplate = {
  rootString: RootString
  tokens: [PatternToken, PatternToken, PatternToken, PatternToken, PatternToken, PatternToken]
}

const VOICING_TEMPLATES: Record<RootString, Record<ChordQuality, VoicingTemplate[]>> = {
  6: {
    dominant7: [
      { rootString: 6, tokens: [0, 2, 0, 1, 0, 0] },
      { rootString: 6, tokens: [0, 2, 0, 1, 3, 0] },
      { rootString: 6, tokens: [0, 5, 3, 4, 3, 0] },
      { rootString: 6, tokens: [0, 2, 3, 1, 3, 0] },
      { rootString: 6, tokens: [0, 'x', 0, 1, 0, 'x'] },
    ],
    minor7: [
      { rootString: 6, tokens: [0, 2, 0, 0, 0, 0] },
      { rootString: 6, tokens: [0, 2, 0, 0, 3, 0] },
      { rootString: 6, tokens: [0, 5, 3, 3, 3, 0] },
      { rootString: 6, tokens: [0, 2, 2, 0, 3, 0] },
      { rootString: 6, tokens: [0, 'x', 0, 0, 0, 'x'] },
    ],
    major: [
      { rootString: 6, tokens: [0, 2, 2, 1, 0, 0] },
      { rootString: 6, tokens: [0, 2, 2, 1, 0, 3] },
      { rootString: 6, tokens: [0, 5, 5, 4, 3, 0] },
      { rootString: 6, tokens: [0, 2, 4, 1, 3, 0] },
      { rootString: 6, tokens: [0, 'x', 2, 1, 0, 'x'] },
    ],
  },
  5: {
    dominant7: [
      { rootString: 5, tokens: ['x', 0, 2, 0, 2, 0] },
      { rootString: 5, tokens: ['x', 0, 2, 0, 2, 3] },
      { rootString: 5, tokens: ['x', 0, 5, 3, 5, 3] },
      { rootString: 5, tokens: ['x', 0, 2, 3, 2, 3] },
      { rootString: 5, tokens: ['x', 0, 2, 0, 'x', 0] },
    ],
    minor7: [
      { rootString: 5, tokens: ['x', 0, 2, 0, 1, 0] },
      { rootString: 5, tokens: ['x', 0, 2, 0, 1, 3] },
      { rootString: 5, tokens: ['x', 0, 5, 3, 4, 3] },
      { rootString: 5, tokens: ['x', 0, 2, 0, 4, 3] },
      { rootString: 5, tokens: ['x', 0, 2, 0, 'x', 0] },
    ],
    major: [
      { rootString: 5, tokens: ['x', 0, 2, 2, 2, 0] },
      { rootString: 5, tokens: ['x', 0, 2, 2, 2, 5] },
      { rootString: 5, tokens: ['x', 0, 5, 4, 5, 3] },
      { rootString: 5, tokens: ['x', 0, 2, 2, 5, 5] },
      { rootString: 5, tokens: ['x', 0, 'x', 2, 2, 0] },
    ],
  },
  4: {
    dominant7: [
      { rootString: 4, tokens: ['x', 'x', 0, 2, 1, 2] },
      { rootString: 4, tokens: ['x', 'x', 0, 5, 3, 5] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 1, 0] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 4, 5] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 1, 'x'] },
    ],
    minor7: [
      { rootString: 4, tokens: ['x', 'x', 0, 2, 1, 1] },
      { rootString: 4, tokens: ['x', 'x', 0, 5, 4, 5] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 1, 0] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 4, 4] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 1, 'x'] },
    ],
    major: [
      { rootString: 4, tokens: ['x', 'x', 0, 2, 3, 2] },
      { rootString: 4, tokens: ['x', 'x', 0, 5, 5, 5] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 3, 5] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 5, 5] },
      { rootString: 4, tokens: ['x', 'x', 0, 2, 3, 'x'] },
    ],
  },
}

const ROOT_STRING_TO_OPEN_NOTE: Record<RootString, MusicalKey> = {
  6: 'E',
  5: 'A',
  4: 'D',
}

function getRootFret(root: MusicalKey, rootString: RootString): number {
  const open = ROOT_STRING_TO_OPEN_NOTE[rootString]
  const rootIndex = CHROMATIC_KEYS.indexOf(root)
  const openIndex = CHROMATIC_KEYS.indexOf(open)
  return (rootIndex - openIndex + CHROMATIC_KEYS.length) % CHROMATIC_KEYS.length
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

export function getChordFingerings(root: MusicalKey, quality: ChordQuality, rootString: RootString = 6): string[] {
  const rootFret = getRootFret(root, rootString)
  const fingerings = VOICING_TEMPLATES[rootString][quality]
    .map((template) => renderPattern(template, rootFret))
    .filter((pattern): pattern is string => pattern !== null)

  return [...new Set(fingerings)].slice(0, 5)
}

export function getChordFingering(root: MusicalKey, quality: ChordQuality, rootString: RootString = 6): string {
  return getChordFingerings(root, quality, rootString)[0] ?? 'xxxxxx'
}
