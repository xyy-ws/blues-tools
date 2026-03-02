import { useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { getChordFingerings, type ChordQuality } from '../chords/chords'
import { getFretNote, STANDARD_TUNING } from '../fretboard/fretboard'

const FRET_COUNT = 12

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

export function ChordFretboardPage() {
  const [root, setRoot] = useState<MusicalKey>('E')
  const [quality, setQuality] = useState<ChordQuality>('dominant7')
  const [variantIndex, setVariantIndex] = useState(0)

  const fingerings = useMemo(() => getChordFingerings(root, quality), [root, quality])
  const selectedPattern = fingerings[variantIndex] ?? fingerings[0]

  const highlighted = useMemo(() => {
    const positions = getHighlightedFrets(selectedPattern)
    return new Set(positions.map(({ stringIndex, fret }) => `${stringIndex}-${fret}`))
  }, [selectedPattern])

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
          指法变体 / Fingering variant
          <select aria-label="Fingering variant" value={variantIndex} onChange={(e) => setVariantIndex(Number(e.target.value))}>
            {fingerings.map((_, index) => (
              <option key={index} value={index}>
                Variant {index + 1}
              </option>
            ))}
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
        <p className="muted">Pattern format: EADGBe (x = mute). 选中和弦会在下方指板高亮对应品位。</p>
      </article>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table aria-label="Combined fretboard grid" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
            <tbody>
              {STANDARD_TUNING.map((openString, stringIndex) => (
                <tr key={`${openString}-${stringIndex}`}>
                  <th scope="row" style={{ textAlign: 'left', paddingRight: 8, whiteSpace: 'nowrap' }}>
                    String {6 - stringIndex} ({openString})
                  </th>
                  {Array.from({ length: FRET_COUNT + 1 }).map((_, fret) => {
                    const note = getFretNote(openString, fret)
                    const isHighlighted = highlighted.has(`${stringIndex}-${fret}`)
                    return (
                      <td
                        key={fret}
                        data-chord-highlight={isHighlighted ? 'yes' : 'no'}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '0.35rem 0.45rem',
                          background: isHighlighted ? 'rgba(77, 161, 255, 0.22)' : 'rgba(7, 15, 27, 0.72)',
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
