import { getKeyOffset } from './keys'
import type { MusicalKey, ProgressionChord, ProgressionPreset } from './types'

const PRESET_DEGREES: Record<ProgressionPreset, Array<ProgressionChord['degree']>> = {
  'standard-12': ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'],
  'quick-change': ['I', 'IV', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
  turnaround: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
}

const DEGREE_OFFSETS: Record<ProgressionChord['degree'], number> = {
  I: 0,
  II: 2,
  III: 4,
  IV: 5,
  V: 7,
  VI: 9,
  VII: 11,
}

export function getTwelveBarBluesProgression(
  root: MusicalKey,
  preset: ProgressionPreset = 'standard-12',
): ProgressionChord[] {
  return PRESET_DEGREES[preset].map((degree) => ({
    degree,
    key: getKeyOffset(root, DEGREE_OFFSETS[degree]),
  }))
}
