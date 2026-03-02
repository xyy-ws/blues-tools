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
  dominant7: '属七和弦',
  minor7: '小七和弦',
  major: '大三和弦',
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

  if (frets.length === 0) return '没有可按的品位。'

  const minFret = Math.min(...frets)
  const maxFret = Math.max(...frets)
  const span = maxFret - minFret

  if (maxFret <= 3) {
    return '建议：食指负责低把位，按开放和弦手型处理更稳。'
  }

  if (span <= 2) {
    return `建议：食指横按第 ${minFret} 品，中指或无名指补位。`
  }

  return '建议：一指一品（食指-中指-无名指-小指）覆盖跨度。'
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
      <h1 className="page-title">和弦与指板</h1>
      <p className="muted helper-text">选择调性、和弦类型与指法变体，快速对照按法和指板位置。</p>

      <div className="card grid-3 card-controls">
        <label className="control">
          根音
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
          和弦性质
          <select
            aria-label="和弦性质"
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
          根音所在弦
          <select
            aria-label="根音弦"
            value={rootString}
            onChange={(e) => {
              setRootString(Number(e.target.value) as RootString)
              setVariantIndex(0)
            }}
          >
            <option value={6}>第 6 弦</option>
            <option value={5}>第 5 弦</option>
            <option value={4}>第 4 弦</option>
          </select>
        </label>

        <label className="control">
          指法变体
          <select aria-label="指法变体" value={variantIndex} onChange={(e) => setVariantIndex(Number(e.target.value))}>
            {fingerings.map((_, index) => (
              <option key={index} value={index}>
                变体 {index + 1}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          指板范围
          <select aria-label="Fret range" value={fretRange} onChange={(e) => setFretRange(e.target.value as FretRange)}>
            <option value="0-7">0–7 品（聚焦）</option>
            <option value="0-12">0–12 品（扩展）</option>
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
          当前指法：<strong>{selectedPattern}</strong>
        </p>
        <p className="muted helper-text" style={{ marginBottom: 8 }}>
          记谱格式为 EADGBe（x 表示闷音）。选中指法后，下方会高亮对应品位。
        </p>
        <p className="muted" aria-label="Fingering hint">
          {fingeringHint}
        </p>
      </article>

      <div className="card">
        <div className="inline-actions" style={{ marginBottom: 10 }}>
          <span className="badge info">图例</span>
          <span className="badge success">指法中的根音</span>
          <span className="badge warn">指法中的和弦音</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table aria-label="Combined fretboard grid" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 6 }}>
            <tbody>
              {DISPLAY_TUNING.map(({ openString, index: stringIndex }, displayIndex) => (
                <tr key={`${openString}-${stringIndex}`}>
                  <th scope="row" style={{ textAlign: 'left', paddingRight: 10, whiteSpace: 'nowrap' }}>
                    String {displayIndex + 1} ({openString})
                  </th>
                  {Array.from({ length: maxFret + 1 }).map((_, fret) => {
                    const note = getFretNote(openString, fret)
                    const isHighlighted = highlighted.has(`${stringIndex}-${fret}`)
                    const isRoot = note === root
                    const isChordTone = chordTones.has(note)
                    const toneTag = isHighlighted ? (isRoot ? 'root' : isChordTone ? 'chord-tone' : 'other') : undefined
                    const highlightColor =
                      toneTag === 'root'
                        ? 'rgba(77, 210, 168, 0.26)'
                        : toneTag === 'chord-tone'
                          ? 'rgba(242, 194, 107, 0.26)'
                          : 'rgba(77, 161, 255, 0.22)'

                    return (
                      <td
                        key={fret}
                        {...(isHighlighted ? { 'data-chord-highlight': 'yes', 'data-tone-type': toneTag } : {})}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '0.42rem 0.56rem',
                          background: isHighlighted ? highlightColor : 'rgba(7, 15, 27, 0.72)',
                          color: isHighlighted ? '#dff0ff' : 'var(--muted)',
                          minWidth: 60,
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
