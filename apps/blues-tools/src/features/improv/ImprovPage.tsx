import { useEffect, useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { getCurrentBarIndex, getCurrentChordLabel } from './improv'

export function ImprovPage() {
  const [sessionKey, setSessionKey] = useState<MusicalKey>('C')
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
    () => getCurrentChordLabel(sessionKey, elapsedSeconds),
    [elapsedSeconds, sessionKey],
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
