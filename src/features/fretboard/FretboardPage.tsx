import { useEffect, useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { getDefaultState, loadState, saveState } from '../../app/persistence/localState'
import { getBluesScaleNotes, getFretNote, STANDARD_TUNING } from './fretboard'

const FRET_COUNT = 12
const DISPLAY_TUNING: Array<{ openString: MusicalKey; index: number }> = STANDARD_TUNING.map((openString, index) => ({ openString, index })).slice().reverse()

export function FretboardPage() {
  const [initial] = useState(() => loadState() ?? getDefaultState())
  const [key, setKey] = useState<MusicalKey>(initial.fretboardKey ?? 'E')

  useEffect(() => {
    const existing = loadState() ?? getDefaultState()
    saveState({
      ...existing,
      fretboardKey: key,
    })
  }, [key])

  const bluesNotes = useMemo(() => getBluesScaleNotes(key), [key])

  return (
    <section className="page">
      <h1>指板 / Fretboard</h1>
      <p>状态提示：当前高亮为 {key} 小调布鲁斯音阶。</p>

      <div className="card grid-2">
        <label className="control">
          Key
          <select aria-label="Fretboard key" value={key} onChange={(e) => setKey(e.target.value as MusicalKey)}>
            {CHROMATIC_KEYS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div>
          <div className="badge info" style={{ marginBottom: 8 }}>
            Active Key/Scale
          </div>
          <div>
            <strong>{key} Blues Scale</strong>
          </div>
          <div className="muted">Blues scale notes: {bluesNotes.join(', ')}</div>
        </div>
      </div>

      <div className="card">
        <div className="inline-actions" style={{ marginBottom: 8 }}>
          <span className="badge success">Highlighted note = in scale</span>
          <span className="badge info">Cell format: fret:note</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table aria-label="Fretboard grid" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
            <tbody>
              {DISPLAY_TUNING.map(({ openString, index: stringIndex }, displayIndex) => (
                <tr key={`${openString}-${stringIndex}`}>
                  <th scope="row" style={{ textAlign: 'left', paddingRight: 8, whiteSpace: 'nowrap' }}>
                    String {displayIndex + 1} ({openString})
                  </th>
                  {Array.from({ length: FRET_COUNT + 1 }).map((_, fret) => {
                    const note = getFretNote(openString, fret)
                    const inScale = bluesNotes.includes(note)
                    return (
                      <td
                        key={fret}
                        data-scale-note={inScale ? 'yes' : 'no'}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '0.35rem 0.45rem',
                          background: inScale ? 'rgba(77, 210, 168, 0.18)' : 'rgba(7, 15, 27, 0.72)',
                          color: inScale ? '#ddfff4' : 'var(--muted)',
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
