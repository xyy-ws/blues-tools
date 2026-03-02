import { useMemo, useState, type FormEvent } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { buildRealTrackId, choosePlaybackSource, type BackingMode, type RealTrack } from './backing'

const PROGRESSION_PRESETS = [
  { id: 'standard-12', label: 'Standard 12-bar' },
  { id: 'quick-change', label: 'Quick change' },
  { id: 'turnaround', label: 'Turnaround ending' },
]

export function BackingPage() {
  const [selectedKey, setSelectedKey] = useState<MusicalKey>('C')
  const [bpm, setBpm] = useState(90)
  const [preset, setPreset] = useState(PROGRESSION_PRESETS[0].id)
  const [mode, setMode] = useState<BackingMode>('auto')
  const [tracks, setTracks] = useState<RealTrack[]>([])

  const [newTrackName, setNewTrackName] = useState('')
  const [newTrackKey, setNewTrackKey] = useState<MusicalKey>('C')
  const [newTrackBpm, setNewTrackBpm] = useState(90)
  const [newTrackFileName, setNewTrackFileName] = useState('')

  const playback = useMemo(
    () => choosePlaybackSource(mode, { key: selectedKey, bpm }, tracks),
    [bpm, mode, selectedKey, tracks],
  )

  function handleTrackImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newTrackName || !newTrackFileName) {
      return
    }

    const trackWithoutId = {
      name: newTrackName,
      key: newTrackKey,
      bpm: newTrackBpm,
      fileName: newTrackFileName,
    }

    const track: RealTrack = {
      ...trackWithoutId,
      id: buildRealTrackId(trackWithoutId),
    }

    setTracks((existing) => [track, ...existing])
    setNewTrackName('')
    setNewTrackFileName('')
  }

  function deleteTrack(id: string) {
    setTracks((existing) => existing.filter((track) => track.id !== id))
  }

  return (
    <section>
      <h1>Backing</h1>

      <label>
        Key
        <select aria-label="Key" value={selectedKey} onChange={(e) => setSelectedKey(e.target.value as MusicalKey)}>
          {CHROMATIC_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>

      <label>
        BPM
        <input
          aria-label="BPM"
          type="number"
          min={40}
          max={220}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
      </label>

      <label>
        Progression preset
        <select aria-label="Progression preset" value={preset} onChange={(e) => setPreset(e.target.value)}>
          {PROGRESSION_PRESETS.map((progressionPreset) => (
            <option key={progressionPreset.id} value={progressionPreset.id}>
              {progressionPreset.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>Mode</legend>
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === 'synth'}
            onChange={() => setMode('synth')}
          />
          Synth
        </label>
        <label>
          <input type="radio" name="mode" checked={mode === 'real'} onChange={() => setMode('real')} />
          Real Track
        </label>
        <label>
          <input type="radio" name="mode" checked={mode === 'auto'} onChange={() => setMode('auto')} />
          Auto
        </label>
      </fieldset>

      <p aria-live="polite">Playback source: {playback === 'real' ? 'Real Track' : 'Synth'}</p>
      <p>Selected preset: {preset}</p>

      <h2>Import local real track</h2>
      <form onSubmit={handleTrackImport}>
        <label>
          Name
          <input
            aria-label="Track name"
            value={newTrackName}
            onChange={(e) => setNewTrackName(e.target.value)}
            required
          />
        </label>

        <label>
          Key
          <select aria-label="Track key" value={newTrackKey} onChange={(e) => setNewTrackKey(e.target.value as MusicalKey)}>
            {CHROMATIC_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label>
          BPM
          <input
            aria-label="Track bpm"
            type="number"
            min={40}
            max={220}
            value={newTrackBpm}
            onChange={(e) => setNewTrackBpm(Number(e.target.value))}
          />
        </label>

        <label>
          File
          <input
            aria-label="Track file"
            placeholder="slow-blues-c.mp3"
            value={newTrackFileName}
            onChange={(e) => setNewTrackFileName(e.target.value)}
            required
          />
        </label>

        <button type="submit">Import Track</button>
      </form>

      <h3>Imported tracks</h3>
      {tracks.length === 0 ? (
        <p>No tracks imported yet.</p>
      ) : (
        <ul>
          {tracks.map((track) => (
            <li key={track.id}>
              {track.name} - {track.key} @ {track.bpm} BPM ({track.fileName}){' '}
              <button type="button" onClick={() => deleteTrack(track.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
