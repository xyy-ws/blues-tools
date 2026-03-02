import { getKeyOffset } from './keys'
import type { MusicalKey, ProgressionChord } from './types'

const TWELVE_BAR_BLUES_DEGREES: Array<ProgressionChord['degree']> = [
  'I',
  'I',
  'I',
  'I',
  'IV',
  'IV',
  'I',
  'I',
  'V',
  'IV',
  'I',
  'I',
]

const DEGREE_OFFSETS: Record<ProgressionChord['degree'], number> = {
  I: 0,
  II: 2,
  III: 4,
  IV: 5,
  V: 7,
  VI: 9,
  VII: 11,
}

export function getTwelveBarBluesProgression(root: MusicalKey): ProgressionChord[] {
  return TWELVE_BAR_BLUES_DEGREES.map((degree) => ({
    degree,
    key: getKeyOffset(root, DEGREE_OFFSETS[degree]),
  }))
}
