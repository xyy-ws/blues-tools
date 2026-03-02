import type { MusicalKey } from './types'

export const CHROMATIC_KEYS: MusicalKey[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

export function getKeyOffset(root: MusicalKey, semitones: number): MusicalKey {
  const start = CHROMATIC_KEYS.indexOf(root)
  return CHROMATIC_KEYS[(start + semitones + CHROMATIC_KEYS.length) % CHROMATIC_KEYS.length]
}
