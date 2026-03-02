import type { MusicalKey } from '../../domain/music/types'

export type ChordQuality = 'dominant7' | 'minor7' | 'major'

const CHORD_FINGERINGS: Record<MusicalKey, Record<ChordQuality, string>> = {
  C: { dominant7: 'x32310', minor7: 'x35343', major: 'x32010' },
  'C#': { dominant7: 'x46464', minor7: 'x46454', major: 'x46664' },
  D: { dominant7: 'xx0212', minor7: 'xx0211', major: 'xx0232' },
  'D#': { dominant7: 'x65676', minor7: 'x68676', major: 'x68886' },
  E: { dominant7: '020100', minor7: '022030', major: '022100' },
  F: { dominant7: '131211', minor7: '131111', major: '133211' },
  'F#': { dominant7: '242322', minor7: '242222', major: '244322' },
  G: { dominant7: '320001', minor7: '353333', major: '320003' },
  'G#': { dominant7: '464544', minor7: '464444', major: '466544' },
  A: { dominant7: 'x02020', minor7: 'x02010', major: 'x02220' },
  'A#': { dominant7: '686766', minor7: '686666', major: '688766' },
  B: { dominant7: 'x21202', minor7: 'x20202', major: 'x24442' },
}

export function getChordFingering(root: MusicalKey, quality: ChordQuality): string {
  return CHORD_FINGERINGS[root][quality]
}
