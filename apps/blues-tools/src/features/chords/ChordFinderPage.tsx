import { useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { getChordFingering, type ChordQuality } from './chords'

const QUALITY_LABELS: Record<ChordQuality, string> = {
  dominant7: 'Dominant 7',
  minor7: 'Minor 7',
  major: 'Major',
}

export function ChordFinderPage() {
  const [root, setRoot] = useState<MusicalKey>('E')
  const [quality, setQuality] = useState<ChordQuality>('dominant7')

  const fingering = useMemo(() => getChordFingering(root, quality), [root, quality])

  return (
    <section className="page">
      <h1>Chords</h1>

      <div className="card grid-2">
        <label className="control">
          Root
          <select aria-label="Chord root" value={root} onChange={(e) => setRoot(e.target.value as MusicalKey)}>
            {CHROMATIC_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          Quality
          <select aria-label="Chord quality" value={quality} onChange={(e) => setQuality(e.target.value as ChordQuality)}>
            {Object.entries(QUALITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
          <span className="badge info">Chord Result</span>
        </div>
        <p>
          Fingering for {root} {QUALITY_LABELS[quality]}: <strong>{fingering}</strong>
        </p>
        <p className="muted">Pattern format: EADGBe (x = mute).</p>
      </article>
    </section>
  )
}
