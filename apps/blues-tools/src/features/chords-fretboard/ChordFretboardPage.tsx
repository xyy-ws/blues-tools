import { useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { getChordFingerings, type ChordQuality, type RootString } from '../chords/chords'
import { getFretNote, STANDARD_TUNING } from '../fretboard/fretboard'

type FretRange = '0-7' | '0-12'
const FRET_RANGE_MAX: Record<FretRange, number> = {
  '0-7': 7,
  '0-12': 12,
}

const DISPLAY_TUNING: Array<{ openString: MusicalKey; index: number }> = STANDARD_TUNING.map((openString, index) => ({ openString, index }))
  .slice()
  .reverse()

const QUALITY_LABELS: Record<ChordQuality, string> = {
  dominant7: '属七 / Dominant 7',
  minor7: '小七 / Minor 7',
  major: '大三 / Major',
}

function getHighlightedFrets(pattern: string): Array<{ stringIndex: number; fret: number }> {
  return pattern
    .split('')
    .map((value, stringIndex) => {
      if (value === 'x' || value === 'X') return null
      const fret = Number.parseInt(value, 10)
      if (Number.isNaN(fret)) return null
      return { stringIndex, fret }
    })
    .filter((item): item is { stringIndex: number; fret: number } => item !== null)
}

function getChordToneSet(root: MusicalKey, quality: ChordQuality): Set<MusicalKey> {
  const intervals: Record<ChordQuality, number[]> = {
    major: [0, 4, 7],
    minor7: [0, 3, 7, 10],
    dominant7: [0, 4, 7, 10],
  }

  const rootIndex = CHROMATIC_KEYS.indexOf(root)
  return new Set(intervals[quality].map((step) => CHROMATIC_KEYS[(rootIndex + step) % CHROMATIC_KEYS.length]))
}

function getFingeringHint(pattern: string): string {
  const frets = pattern
    .split('')
    .filter((value) => value !== 'x' && value !== 'X')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => !Number.isNaN(value))

  if (frets.length === 0) return '无可按品位 / No playable frets'

  const minFret = Math.min(...frets)
  const maxFret = Math.max(...frets)
  const span = maxFret - minFret

  if (maxFret <= 3) {
    return '建议：食指负责低把位，常见开放和弦手型。/ Hint: index anchors low/open shape.'
  }

  if (span <= 2) {
    return `建议：食指横按第 ${minFret} 品，中/无名指补充。/ Hint: barre around fret ${minFret}.`
  }

  return '建议：一指一品（index-middle-ring-pinky）覆盖跨度。/ Hint: one finger per fret for wider stretch.'
}

export function ChordFretboardPage() {
  const [root, setRoot] = useState<MusicalKey>('E')
  const [quality, setQuality] = useState<ChordQuality>('dominant7')
  const [rootString, setRootString] = useState<RootString>(6)
  const [variantIndex, setVariantIndex] = useState(0)
  const [fretRange, setFretRange] = useState<FretRange>('0-7')

  const fingerings = useMemo(() => getChordFingerings(root, quality, rootString), [root, quality, rootString])
  const selectedPattern = fingerings[variantIndex] ?? fingerings[0] ?? 'xxxxxx'
  const chordTones = useMemo(() => getChordToneSet(root, quality), [quality, root])

  const highlighted = useMemo(() => {
    const positions = getHighlightedFrets(selectedPattern)
    return new Set(positions.map(({ stringIndex, fret }) => `${stringIndex}-${fret}`))
  }, [selectedPattern])

  const fingeringHint = useMemo(() => getFingeringHint(selectedPattern), [selectedPattern])
  const maxFret = FRET_RANGE_MAX[fretRange]

  return (
    <section className="page">
      <h1>和弦 + 指板 / Chords + Fretboard</h1>

      <div className="card grid-3">
        <label className="control">
          Root
          <select
            aria-label="Combined chord root"
            value={root}
            onChange={(e) => {
              setRoot(e.target.value as MusicalKey)
              setVariantIndex(0)
            }}
          >
            {CHROMATIC_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          Quality
          <select
            aria-label="Combined chord quality"
            value={quality}
            onChange={(e) => {
              setQuality(e.target.value as ChordQuality)
              setVariantIndex(0)
            }}
          >
            {Object.entries(QUALITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          根音弦 / Root string
          <select
            aria-label="Chord root string"
            value={rootString}
            onChange={(e) => {
              setRootString(Number(e.target.value) as RootString)
              setVariantIndex(0)
            }}
          >
            <option value={6}>6th string</option>
            <option value={5}>5th string</option>
            <option value={4}>4th string</option>
          </select>
        </label>

        <label className="control">
          指法变体 / Fingering variant
          <select aria-label="Fingering variant" value={variantIndex} onChange={(e) => setVariantIndex(Number(e.target.value))}>
            {fingerings.map((_, index) => (
              <option key={index} value={index}>
                Variant {index + 1}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          指板范围 / Fret range
          <select aria-label="Fret range" value={fretRange} onChange={(e) => setFretRange(e.target.value as FretRange)}>
            <option value="0-7">Focused 0-7</option>
            <option value="0-12">Extended 0-12</option>
          </select>
        </label>
      </div>

      <article className="card">
        <div className="card-title-row">
          <h2>
            {root} {QUALITY_LABELS[quality]}
          </h2>
          <span className="badge info">Pattern: {selectedPattern}</span>
        </div>
        <p>
          当前指法 / Current fingering: <strong>{selectedPattern}</strong>
        </p>
        <p className="muted" style={{ marginBottom: 8 }}>
          Pattern format: EADGBe (x = mute). 选中和弦会在下方指板高亮对应品位。
        </p>
        <p className="muted" aria-label="Fingering hint">
          {fingeringHint}
        </p>
      </article>

      <div className="card">
        <div className="inline-actions" style={{ marginBottom: 8 }}>
          <span className="badge info">Legend / 图例</span>
          <span className="badge success">Root 根音</span>
          <span className="badge warn">Chord Tone 和弦音</span>
          <span className="badge">Other 其他音</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table aria-label="Combined fretboard grid" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
            <tbody>
              {DISPLAY_TUNING.map(({ openString, index: stringIndex }, displayIndex) => (
                <tr key={`${openString}-${stringIndex}`}>
                  <th scope="row" style={{ textAlign: 'left', paddingRight: 8, whiteSpace: 'nowrap' }}>
                    String {displayIndex + 1} ({openString})
                  </th>
                  {Array.from({ length: maxFret + 1 }).map((_, fret) => {
                    const note = getFretNote(openString, fret)
                    const isHighlighted = highlighted.has(`${stringIndex}-${fret}`)
                    const isRoot = note === root
                    const isChordTone = chordTones.has(note)
                    const toneTag = isRoot ? 'root' : isChordTone ? 'chord-tone' : 'other'
                    return (
                      <td
                        key={fret}
                        data-chord-highlight={isHighlighted ? 'yes' : 'no'}
                        data-tone-type={toneTag}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '0.35rem 0.45rem',
                          background: isHighlighted
                            ? 'rgba(77, 161, 255, 0.22)'
                            : isRoot
                              ? 'rgba(77, 210, 168, 0.14)'
                              : isChordTone
                                ? 'rgba(242, 194, 107, 0.14)'
                                : 'rgba(7, 15, 27, 0.72)',
                          color: isHighlighted ? '#dff0ff' : 'var(--muted)',
                          minWidth: 52,
                        }}
                      >
                        {fret}:{note}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
