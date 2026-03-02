import { useEffect, useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey, ProgressionPreset } from '../../domain/music/types'
import { getCurrentBarIndex, getCurrentChordLabel } from './improv'

const PROGRESSION_PRESETS: Array<{ id: ProgressionPreset; label: string }> = [
  { id: 'standard-12', label: 'Standard 12-bar' },
  { id: 'quick-change', label: 'Quick change' },
  { id: 'turnaround', label: 'Turnaround ending' },
]

export function ImprovPage() {
  const [sessionKey, setSessionKey] = useState<MusicalKey>('C')
  const [preset, setPreset] = useState<ProgressionPreset>('standard-12')
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

  const barIndex = useMemo(() => getCurrentBarIndex(elapsedSeconds), [elapsedSeconds])
  const chordLabel = useMemo(
    () => getCurrentChordLabel(sessionKey, elapsedSeconds, preset),
    [elapsedSeconds, preset, sessionKey],
  )

  return (
    <section>
      <h1>Improv</h1>

      <label>
        Session key
        <select aria-label="Session key" value={sessionKey} onChange={(e) => setSessionKey(e.target.value as MusicalKey)}>
          {CHROMATIC_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>

      <label>
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

      <p>Timer: {elapsedSeconds}s</p>
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

      <p>Current bar: {barIndex + 1} / 12</p>
      <p>Current chord: {chordLabel}</p>
    </section>
  )
}
