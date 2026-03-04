import { CHROMATIC_KEYS, getKeyOffset } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'

export const STANDARD_TUNING: MusicalKey[] = ['E', 'A', 'D', 'G', 'B', 'E']

const BLUES_SCALE_OFFSETS = [0, 3, 5, 6, 7, 10]

export function getBluesScaleNotes(root: MusicalKey): MusicalKey[] {
  return BLUES_SCALE_OFFSETS.map((offset) => getKeyOffset(root, offset))
}

export function getFretNote(openStringKey: MusicalKey, fret: number): MusicalKey {
  return CHROMATIC_KEYS[(CHROMATIC_KEYS.indexOf(openStringKey) + fret) % CHROMATIC_KEYS.length]
}
