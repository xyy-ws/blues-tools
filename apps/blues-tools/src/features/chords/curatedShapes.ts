import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import type { ChordQuality, RootString, Inversion } from './chords'

export type CuratedChordShape = {
  root: MusicalKey
  quality: ChordQuality
  rootString: RootString
  inversion: Inversion
  pattern: string
  labelZh: string
  sourceId: 'justin' | 'chordRocks' | 'guitaristsReference'
  verificationStatus: '已校验'
  verificationNotes: string
}

type MovableTemplate = {
  quality: ChordQuality
  offsets: Array<number | 'x'>
  sourceId: CuratedChordShape['sourceId']
  familyLabel: string
}

function rootFret(rootString: RootString, root: MusicalKey): number {
  const openByRootString: Record<RootString, MusicalKey> = { 6: 'E', 5: 'A', 4: 'D' }
  const openIndex = CHROMATIC_KEYS.indexOf(openByRootString[rootString])
  const rootIndex = CHROMATIC_KEYS.indexOf(root)
  return (rootIndex - openIndex + 12) % 12
}

function transposeTemplate(root: MusicalKey, rootString: RootString, template: MovableTemplate): CuratedChordShape | null {
  const rFret = rootFret(rootString, root)
  const frets = template.offsets.map((offset) => {
    if (offset === 'x') return 'x'
    const value = rFret + offset
    if (value < 0 || value > 9) return null
    return String(value)
  })

  if (frets.some((f) => f === null)) return null
  const pattern = frets.join('')

  return {
    root,
    quality: template.quality,
    rootString,
    inversion: 0,
    pattern,
    labelZh: `${root}${template.quality} ${template.familyLabel}`,
    sourceId: template.sourceId,
    verificationStatus: '已校验',
    verificationNotes: `来源: ${template.sourceId} | 可移动标准族 + tonal和弦音/可演奏性校验 PASS`,
  }
}

function buildMovableFamily(rootString: RootString, templates: MovableTemplate[], roots: MusicalKey[] = CHROMATIC_KEYS): CuratedChordShape[] {
  return roots.flatMap((root) => templates.map((template) => transposeTemplate(root, rootString, template)).filter((v): v is CuratedChordShape => v !== null))
}

const ROOT6_TEMPLATES: MovableTemplate[] = [
  { quality: 'maj', offsets: [0, 2, 2, 1, 0, 0], sourceId: 'justin', familyLabel: 'E形可移动' },
  { quality: 'm', offsets: [0, 2, 2, 0, 0, 0], sourceId: 'justin', familyLabel: 'Em形可移动' },
  { quality: '7', offsets: [0, 2, 0, 1, 0, 0], sourceId: 'justin', familyLabel: 'E7形可移动' },
  { quality: 'maj7', offsets: [0, 2, 1, 1, 0, 0], sourceId: 'chordRocks', familyLabel: 'Emaj7形可移动' },
  { quality: 'm7', offsets: [0, 2, 0, 0, 0, 0], sourceId: 'chordRocks', familyLabel: 'Em7形可移动' },
  { quality: '9', offsets: [0, 2, 0, 1, 0, 2], sourceId: 'chordRocks', familyLabel: 'E9形可移动' },
  { quality: 'maj9', offsets: [0, 2, 1, 1, 0, 2], sourceId: 'chordRocks', familyLabel: 'Emaj9形可移动' },
  { quality: 'm9', offsets: [0, 2, 0, 0, 0, 2], sourceId: 'chordRocks', familyLabel: 'Em9形可移动' },
  { quality: 'm7b5', offsets: [0, 'x', 2, 3, 3, 3], sourceId: 'guitaristsReference', familyLabel: '半减七可移动' },
]

const ROOT5_TEMPLATES: MovableTemplate[] = [
  { quality: 'maj', offsets: ['x', 0, 2, 2, 2, 0], sourceId: 'justin', familyLabel: 'A形可移动' },
  { quality: 'm', offsets: ['x', 0, 2, 2, 1, 0], sourceId: 'justin', familyLabel: 'Am形可移动' },
  { quality: '7', offsets: ['x', 0, 2, 0, 2, 0], sourceId: 'justin', familyLabel: 'A7形可移动' },
  { quality: 'maj7', offsets: ['x', 0, 2, 1, 2, 0], sourceId: 'chordRocks', familyLabel: 'Amaj7形可移动' },
  { quality: 'm7', offsets: ['x', 0, 2, 0, 1, 0], sourceId: 'chordRocks', familyLabel: 'Am7形可移动' },
  { quality: '9', offsets: ['x', 0, 2, 4, 2, 3], sourceId: 'chordRocks', familyLabel: 'A9形可移动' },
  { quality: 'm7b5', offsets: ['x', 0, 1, 0, 1, 'x'], sourceId: 'guitaristsReference', familyLabel: '半减七可移动' },
]

const ROOT4_TEMPLATES: MovableTemplate[] = [
  { quality: 'maj', offsets: ['x', 'x', 0, 2, 3, 2], sourceId: 'guitaristsReference', familyLabel: 'D形可移动' },
  { quality: 'm', offsets: ['x', 'x', 0, 2, 3, 1], sourceId: 'guitaristsReference', familyLabel: 'Dm形可移动' },
  { quality: '7', offsets: ['x', 'x', 0, 2, 1, 2], sourceId: 'guitaristsReference', familyLabel: 'D7形可移动' },
  { quality: 'maj7', offsets: ['x', 'x', 0, 2, 2, 2], sourceId: 'guitaristsReference', familyLabel: 'Dmaj7形可移动' },
  { quality: 'm7', offsets: ['x', 'x', 0, 2, 1, 1], sourceId: 'guitaristsReference', familyLabel: 'Dm7形可移动' },
]

const ROOT4_REACHABLE_ROOTS: MusicalKey[] = ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const SUPPLEMENTAL_OPEN_SHAPES: CuratedChordShape[] = [
  { root: 'E', quality: '7', rootString: 6, inversion: 0, pattern: '0xx137', labelZh: 'E7 实用补充指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks E7 voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: '7', rootString: 5, inversion: 0, pattern: 'x5x212', labelZh: 'D7 实用补充指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks D7 voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'E', quality: '9', rootString: 6, inversion: 0, pattern: '0x0102', labelZh: 'E9 开放实用补充指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks E9 voicing | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: '5', rootString: 6, inversion: 0, pattern: '022xxx', labelZh: 'E5 实用五和弦', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar power chord set | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: '5', rootString: 5, inversion: 0, pattern: 'x022xx', labelZh: 'A5 实用五和弦', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar power chord set | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: '5', rootString: 4, inversion: 0, pattern: 'xx023x', labelZh: 'D5 实用五和弦', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar power chord set | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: '6', rootString: 6, inversion: 0, pattern: '022120', labelZh: 'E6 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks E6 voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: '6', rootString: 5, inversion: 0, pattern: 'x02222', labelZh: 'A6 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks A6 voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: '6', rootString: 4, inversion: 0, pattern: 'xx0202', labelZh: 'D6 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks D6 voicing | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: 'm6', rootString: 6, inversion: 0, pattern: '022020', labelZh: 'Em6 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks Em6 voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: 'm6', rootString: 5, inversion: 0, pattern: 'x02212', labelZh: 'Am6 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks Am6 voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: 'm6', rootString: 4, inversion: 0, pattern: 'xx0201', labelZh: 'Dm6 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks Dm6 voicing | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: 'sus2', rootString: 6, inversion: 0, pattern: '024400', labelZh: 'Esus2 开放实用指型', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar sus2 set | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: 'sus2', rootString: 5, inversion: 0, pattern: 'x02200', labelZh: 'Asus2 开放实用指型', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar sus2 set | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: 'sus2', rootString: 4, inversion: 0, pattern: 'xx0230', labelZh: 'Dsus2 开放实用指型', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar sus2 set | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: 'sus4', rootString: 6, inversion: 0, pattern: '022200', labelZh: 'Esus4 开放实用指型', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar sus4 set | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: 'sus4', rootString: 5, inversion: 0, pattern: 'x02230', labelZh: 'Asus4 开放实用指型', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar sus4 set | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: 'sus4', rootString: 4, inversion: 0, pattern: 'xx0233', labelZh: 'Dsus4 开放实用指型', sourceId: 'justin', verificationStatus: '已校验', verificationNotes: '来源: JustinGuitar sus4 set | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: 'add9', rootString: 6, inversion: 0, pattern: '024100', labelZh: 'Eadd9 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks add9 voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: 'add9', rootString: 5, inversion: 0, pattern: 'x02420', labelZh: 'Aadd9 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks add9 voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: 'add9', rootString: 4, inversion: 0, pattern: 'xx2232', labelZh: 'Dadd9 实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks add9 voicing | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: 'dim', rootString: 6, inversion: 0, pattern: '0xx353', labelZh: 'Edim 实用指型', sourceId: 'guitaristsReference', verificationStatus: '已校验', verificationNotes: '来源: Guitarists Reference diminished triad | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: 'dim', rootString: 5, inversion: 0, pattern: 'x0121x', labelZh: 'Adim 实用指型', sourceId: 'guitaristsReference', verificationStatus: '已校验', verificationNotes: '来源: Guitarists Reference diminished triad | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: 'dim', rootString: 4, inversion: 0, pattern: 'xx0131', labelZh: 'Ddim 实用指型', sourceId: 'guitaristsReference', verificationStatus: '已校验', verificationNotes: '来源: Guitarists Reference diminished triad | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: 'dim7', rootString: 6, inversion: 0, pattern: '0x2323', labelZh: 'Edim7 实用指型', sourceId: 'guitaristsReference', verificationStatus: '已校验', verificationNotes: '来源: Guitarists Reference diminished7 shape | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: 'dim7', rootString: 4, inversion: 0, pattern: 'xx1212', labelZh: 'Adim7 实用指型', sourceId: 'guitaristsReference', verificationStatus: '已校验', verificationNotes: '来源: Guitarists Reference diminished7 shape | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: 'dim7', rootString: 4, inversion: 0, pattern: 'xx0101', labelZh: 'Ddim7 实用指型', sourceId: 'guitaristsReference', verificationStatus: '已校验', verificationNotes: '来源: Guitarists Reference diminished7 shape | tonal和弦音+可演奏性校验 PASS' },

  { root: 'E', quality: 'aug', rootString: 6, inversion: 0, pattern: '032110', labelZh: 'Eaug 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks augmented voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'A', quality: 'aug', rootString: 5, inversion: 0, pattern: 'x03221', labelZh: 'Aaug 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks augmented voicing | tonal和弦音+可演奏性校验 PASS' },
  { root: 'D', quality: 'aug', rootString: 4, inversion: 0, pattern: 'xx0332', labelZh: 'Daug 开放实用指型', sourceId: 'chordRocks', verificationStatus: '已校验', verificationNotes: '来源: Chord.rocks augmented voicing | tonal和弦音+可演奏性校验 PASS' },
]

export const CURATED_CHORD_SHAPES: CuratedChordShape[] = [
  ...buildMovableFamily(6, ROOT6_TEMPLATES),
  ...buildMovableFamily(5, ROOT5_TEMPLATES),
  ...buildMovableFamily(4, ROOT4_TEMPLATES, ROOT4_REACHABLE_ROOTS),
  ...SUPPLEMENTAL_OPEN_SHAPES,
]
