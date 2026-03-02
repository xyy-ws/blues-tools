import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import { getTwelveBarBluesProgression } from '../../domain/music/progression'
import type { MusicalKey, ProgressionPreset } from '../../domain/music/types'
import { getDefaultState, loadState, saveState, toHydratedTracks, toPersistedTracks } from '../../app/persistence/localState'
import { buildRealTrackId, resolvePlayback, type BackingMode, type RealTrack } from './backing'

const PROGRESSION_PRESETS: Array<{ id: ProgressionPreset; label: string }> = [
  { id: 'standard-12', label: '标准 12 小节 / Standard 12-bar' },
  { id: 'quick-change', label: '快速换和弦 / Quick change' },
  { id: 'turnaround', label: '结尾回转 / Turnaround ending' },
]

const BAR_COUNT = 12
const BEATS_PER_BAR = 4

export function BackingPage() {
  const [initial] = useState(() => loadState() ?? getDefaultState())

  const [selectedKey, setSelectedKey] = useState<MusicalKey>(initial.selectedKey)
  const [bpm, setBpm] = useState(initial.bpm)
  const [preset, setPreset] = useState<ProgressionPreset>(initial.preset)
  const [mode, setMode] = useState<BackingMode>(initial.mode)
  const [tracks, setTracks] = useState<RealTrack[]>(toHydratedTracks(initial.tracks))

  const [newTrackName, setNewTrackName] = useState('')
  const [newTrackKey, setNewTrackKey] = useState<MusicalKey>('C')
  const [newTrackBpm, setNewTrackBpm] = useState(90)
  const [newTrackFile, setNewTrackFile] = useState<File | null>(null)
  const [playbackState, setPlaybackState] = useState<'stopped' | 'playing' | 'paused'>('stopped')
  const [currentBar, setCurrentBar] = useState(1)
  const [currentBeat, setCurrentBeat] = useState(1)

  const playbackResolution = useMemo(
    () => resolvePlayback(mode, { key: selectedKey, bpm }, tracks),
    [bpm, mode, selectedKey, tracks],
  )

  const progression = useMemo(() => getTwelveBarBluesProgression(selectedKey, preset), [preset, selectedKey])
  const playback = playbackResolution.resolved

  useEffect(() => {
    const existing = loadState() ?? getDefaultState()
    saveState({
      selectedKey,
      bpm,
      preset,
      mode,
      tracks: toPersistedTracks(tracks),
      improvKey: existing.improvKey,
      improvPreset: existing.improvPreset,
      fretboardKey: existing.fretboardKey,
    })
  }, [selectedKey, bpm, preset, mode, tracks])

  useEffect(() => {
    if (playbackState !== 'playing') return

    const beatIntervalMs = Math.max(120, Math.round((60_000 / Math.max(bpm, 1)) * 0.75))
    const timer = window.setInterval(() => {
      setCurrentBeat((prevBeat) => {
        if (prevBeat < BEATS_PER_BAR) {
          return prevBeat + 1
        }
        setCurrentBar((prevBar) => (prevBar % BAR_COUNT) + 1)
        return 1
      })
    }, beatIntervalMs)

    return () => window.clearInterval(timer)
  }, [bpm, playbackState])

  function handleTrackImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newTrackName || !newTrackFile) {
      return
    }

    const trackWithoutId = {
      name: newTrackName,
      key: newTrackKey,
      bpm: newTrackBpm,
      fileName: newTrackFile.name,
      fileUrl: URL.createObjectURL(newTrackFile),
      fileType: newTrackFile.type,
      fileSize: newTrackFile.size,
    }

    const track: RealTrack = {
      ...trackWithoutId,
      id: buildRealTrackId(trackWithoutId),
    }

    setTracks((existing) => [track, ...existing])
    setNewTrackName('')
    setNewTrackFile(null)
    event.currentTarget.reset()
  }

  function handleTrackFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setNewTrackFile(selected)
  }

  function deleteTrack(id: string) {
    setTracks((existing) => {
      const track = existing.find((item) => item.id === id)
      if (track?.fileUrl) {
        URL.revokeObjectURL(track.fileUrl)
      }
      return existing.filter((item) => item.id !== id)
    })
  }

  function togglePlayPause() {
    if (playbackState === 'playing') {
      setPlaybackState('paused')
      return
    }

    setPlaybackState('playing')
  }

  function handleStop() {
    setPlaybackState('stopped')
    setCurrentBar(1)
    setCurrentBeat(1)
  }

  const progressPercent = (((currentBar - 1) * BEATS_PER_BAR + currentBeat) / (BAR_COUNT * BEATS_PER_BAR)) * 100
  const sourceDetailText =
    mode === 'auto'
      ? playbackResolution.hasMatch
        ? '自动模式：已匹配实录音轨 / Auto: real track matched'
        : '自动模式：未匹配实录，使用合成 / Auto: fallback to synth'
      : mode === 'real'
        ? playbackResolution.hasMatch
          ? '实录模式：已匹配实录音轨 / Real mode: matched'
          : '实录模式：未匹配，临时回退合成 / Real mode: fallback to synth'
        : '合成模式：固定使用合成伴奏 / Synth mode: forced synth'

  return (
    <section className="page">
      <h1>伴奏 / Backing</h1>
      <p aria-live="polite">
        状态提示：{sourceDetailText}
        <span className={`badge ${playback === 'real' ? 'success' : 'info'}`} style={{ marginLeft: 8 }}>
          Active: {playback === 'real' ? 'Real' : 'Synth'}
        </span>
      </p>

      <div className="card">
        <div className="card-title-row">
          <h2>Session Controls</h2>
          <span className="badge warn">Mode: {mode.toUpperCase()} → Source: {playback === 'real' ? 'Real' : 'Synth'}</span>
        </div>
        <div className="grid-3">
          <label className="control">
            调性 / Key
            <select aria-label="Key" value={selectedKey} onChange={(e) => setSelectedKey(e.target.value as MusicalKey)}>
              {CHROMATIC_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
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

          <label className="control">
            进行预设 / Progression preset
            <select
              aria-label="Progression preset"
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
      </div>

      <fieldset className="card">
        <legend>模式 / Mode</legend>
        <div className="inline-actions">
          <label>
            <input type="radio" name="mode" checked={mode === 'synth'} onChange={() => setMode('synth')} /> 合成 / Synth
          </label>
          <label>
            <input type="radio" name="mode" checked={mode === 'real'} onChange={() => setMode('real')} /> 实录 / Real Track
          </label>
          <label>
            <input type="radio" name="mode" checked={mode === 'auto'} onChange={() => setMode('auto')} /> 自动 / Auto
          </label>
        </div>
      </fieldset>

      <div className="card">
        <div className="card-title-row">
          <h2>播放控制 / Playback Controls</h2>
          <span className={`badge ${playbackState === 'playing' ? 'success' : playbackState === 'paused' ? 'warn' : 'info'}`}>
            {playbackState === 'playing' ? 'Playing' : playbackState === 'paused' ? 'Paused' : 'Stopped'}
          </span>
        </div>
        <div className="inline-actions">
          <button type="button" className="btn-primary" onClick={togglePlayPause}>
            {playbackState === 'playing' ? 'Pause' : playbackState === 'paused' ? 'Resume' : 'Play'}
          </button>
          <button type="button" onClick={handleStop}>
            Stop
          </button>
        </div>
        <p style={{ marginTop: 8 }}>
          当前小节 / Current bar: {currentBar} · 当前拍 / Beat: {currentBeat}
        </p>
        <div className="bar-progress" aria-label="Current bar progress indicator">
          <div className="bar-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="beat-indicator" aria-label="1-2-3-4 beat indicator">
          {[1, 2, 3, 4].map((beat) => (
            <span key={beat} className={`beat-dot${currentBeat === beat ? ' active' : ''}`}>
              {beat}
            </span>
          ))}
        </div>
      </div>

      <div className="card grid-3">
        <p>Playback source: {playback === 'real' ? 'Real Track' : 'Synth'}</p>
        <p>Selected preset: {preset}</p>
        <p>Bar 2 chord: {progression[1].degree}</p>
        <p>Bar 12 chord: {progression[11].degree}</p>
      </div>

      <div className="card">
        <h2>导入本地实录伴奏 / Import local real track</h2>
        <form onSubmit={handleTrackImport} className="grid-3">
          <label className="control">
            Name
            <input
              aria-label="Track name"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              required
            />
          </label>

          <label className="control">
            Key
            <select aria-label="Track key" value={newTrackKey} onChange={(e) => setNewTrackKey(e.target.value as MusicalKey)}>
              {CHROMATIC_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
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

          <label className="control">
            File
            <input aria-label="Track file" type="file" accept="audio/*" onChange={handleTrackFileChange} />
          </label>

          <div className="inline-actions" style={{ alignItems: 'end' }}>
            <button type="submit">Import Track</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Imported tracks</h3>
        {tracks.length === 0 ? (
          <p className="empty-state">No tracks imported yet.</p>
        ) : (
          <ul className="list">
            {tracks.map((track) => (
              <li key={track.id} className="list-item">
                <div className="card-title-row">
                  <strong>
                    {track.name} - {track.key} @ {track.bpm} BPM
                  </strong>
                  <button type="button" onClick={() => deleteTrack(track.id)}>
                    Delete
                  </button>
                </div>
                <p className="muted">
                  {track.fileName}, {track.fileType}, {track.fileSize} bytes {track.fileUrl ? null : '（需重新选择本地文件以播放） '}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
