import { useEffect, useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey, ProgressionPreset } from '../../domain/music/types'
import { getDefaultState, loadState, saveState } from '../../app/persistence/localState'
import { getCurrentBarIndex, getCurrentChordLabel } from './improv'

const PROGRESSION_PRESETS: Array<{ id: ProgressionPreset; label: string }> = [
  { id: 'standard-12', label: '标准 12 小节 / Standard 12-bar' },
  { id: 'quick-change', label: '快速换和弦 / Quick change' },
  { id: 'turnaround', label: '结尾回转 / Turnaround ending' },
]

export function ImprovPage() {
  const [initial] = useState(() => loadState() ?? getDefaultState())
  const [sessionKey, setSessionKey] = useState<MusicalKey>(initial.improvKey ?? 'C')
  const [preset, setPreset] = useState<ProgressionPreset>(initial.improvPreset ?? 'standard-12')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const id = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1)
    }, 1000)

    return () => window.clearInterval(id)
  }, [isRunning])

  useEffect(() => {
    const existing = loadState() ?? getDefaultState()
    saveState({
      ...existing,
      improvKey: sessionKey,
      improvPreset: preset,
    })
  }, [sessionKey, preset])

  const barIndex = useMemo(() => getCurrentBarIndex(elapsedSeconds), [elapsedSeconds])
  const chordLabel = useMemo(
    () => getCurrentChordLabel(sessionKey, elapsedSeconds, preset),
    [elapsedSeconds, preset, sessionKey],
  )

  const bars = Array.from({ length: 12 }).map((_, index) => ({ index, active: index === barIndex }))

  return (
    <section className="page">
      <h1>即兴 / Improv</h1>
      <p>状态提示：{isRunning ? '计时进行中' : '已暂停，可随时开始'}。</p>

      <div className="card grid-2">
        <label className="control">
          Session key
          <select aria-label="Session key" value={sessionKey} onChange={(e) => setSessionKey(e.target.value as MusicalKey)}>
            {CHROMATIC_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          Progression preset
          <select
            aria-label="Improv progression preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value as ProgressionPreset)}
          >
            {PROGRESSION_PRESETS.map((progressionPreset) => (
              <option key={progressionPreset.id} value={progressionPreset.id}>
                {progressionPreset.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card">
        <div className="card-title-row">
          <h2>Timer Panel</h2>
          <span className={`badge ${isRunning ? 'success' : 'warn'}`}>{isRunning ? 'RUNNING' : 'STOPPED'}</span>
        </div>
        <p>Timer: {elapsedSeconds}s</p>
        <div className="inline-actions">
          <button type="button" onClick={() => setIsRunning(true)}>
            Start
          </button>
          <button type="button" onClick={() => setIsRunning(false)}>
            Stop
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRunning(false)
              setElapsedSeconds(0)
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Chord Progression Strip</h3>
        <div className="inline-actions">
          {bars.map((bar) => (
            <span key={bar.index} className={`badge ${bar.active ? 'success' : 'info'}`}>
              Bar {bar.index + 1}
            </span>
          ))}
        </div>
        <p>Current bar: {barIndex + 1} / 12</p>
        <p>Current chord: {chordLabel}</p>
      </div>
    </section>
  )
}
