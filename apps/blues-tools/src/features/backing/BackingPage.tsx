import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import { getTwelveBarBluesProgression } from '../../domain/music/progression'
import type { MusicalKey, ProgressionPreset } from '../../domain/music/types'
import { getDefaultState, loadState, saveState, toHydratedTracks, toPersistedTracks } from '../../app/persistence/localState'
import {
  BUNDLED_REAL_TRACKS,
  GROOVE_PROFILES,
  buildRealTrackId,
  resolvePlayback,
  type BackingMode,
  type GrooveId,
  type RealTrack,
} from './backing'
import { createBackingClickPlayer } from './backingAudio'

const PROGRESSION_PRESETS: Array<{ id: ProgressionPreset; label: string }> = [
  { id: 'standard-12', label: '标准 12 小节' },
  { id: 'quick-change', label: '快速换和弦' },
  { id: 'turnaround', label: '结尾回转' },
]

const BAR_COUNT = 12
const BEATS_PER_BAR = 4

export function BackingPage() {
  const [searchParams] = useSearchParams()

  const [initial] = useState(() => {
    const stored = loadState() ?? getDefaultState()
    const key = searchParams.get('key') as MusicalKey | null
    const bpm = Number(searchParams.get('bpm'))
    const preset = searchParams.get('preset') as ProgressionPreset | null

    return {
      ...stored,
      selectedKey: key && CHROMATIC_KEYS.includes(key) ? key : stored.selectedKey,
      bpm: Number.isFinite(bpm) && bpm >= 40 && bpm <= 220 ? bpm : stored.bpm,
      preset: preset && PROGRESSION_PRESETS.some((item) => item.id === preset) ? preset : stored.preset,
    }
  })

  const [selectedKey, setSelectedKey] = useState<MusicalKey>(initial.selectedKey)
  const [bpm, setBpm] = useState(initial.bpm)
  const [preset, setPreset] = useState<ProgressionPreset>(initial.preset)
  const [mode, setMode] = useState<BackingMode>(initial.mode)
  const [selectedGroove, setSelectedGroove] = useState<GrooveId>('slow-shuffle')
  const [tracks, setTracks] = useState<RealTrack[]>(toHydratedTracks(initial.tracks))

  const [newTrackName, setNewTrackName] = useState('')
  const [newTrackKey, setNewTrackKey] = useState<MusicalKey>('C')
  const [newTrackGroove, setNewTrackGroove] = useState<GrooveId>('slow-shuffle')
  const [newTrackBpm, setNewTrackBpm] = useState(90)
  const [newTrackFile, setNewTrackFile] = useState<File | null>(null)
  const [playbackState, setPlaybackState] = useState<'stopped' | 'playing' | 'paused'>('stopped')
  const [currentBar, setCurrentBar] = useState(1)
  const [currentBeat, setCurrentBeat] = useState(1)
  const [audioStatus, setAudioStatus] = useState<'idle' | 'ready' | 'blocked' | 'fallback'>('idle')

  const clickPlayerRef = useRef(createBackingClickPlayer())
  const realAudioRef = useRef<HTMLAudioElement | null>(null)

  const allTracks = useMemo(() => [...tracks, ...BUNDLED_REAL_TRACKS], [tracks])

  const playbackResolution = useMemo(
    () => resolvePlayback(mode, { key: selectedKey, bpm, grooveId: selectedGroove }, allTracks),
    [allTracks, bpm, mode, selectedGroove, selectedKey],
  )

  const progression = useMemo(() => getTwelveBarBluesProgression(selectedKey, preset), [preset, selectedKey])
  const playback = playbackResolution.resolved
  const matchedTrack = playbackResolution.matchedTrack

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
        const nextBeat = prevBeat < BEATS_PER_BAR ? prevBeat + 1 : 1
        if (prevBeat >= BEATS_PER_BAR) {
          setCurrentBar((prevBar) => (prevBar % BAR_COUNT) + 1)
        }

        if (playback === 'synth') {
          clickPlayerRef.current.playBeat(nextBeat === 1)
        }

        return nextBeat
      })
    }, beatIntervalMs)

    return () => window.clearInterval(timer)
  }, [bpm, playbackState, playback])

  useEffect(() => {
    return () => {
      realAudioRef.current?.pause()
      clickPlayerRef.current.dispose()
    }
  }, [])

  function handleTrackImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newTrackName || !newTrackFile) {
      return
    }

    const trackWithoutId = {
      name: newTrackName,
      grooveId: newTrackGroove,
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

  async function startPlayback() {
    try {
      const unlocked = await clickPlayerRef.current.ensureUnlocked()

      if (playback === 'real' && matchedTrack?.fileUrl && !matchedTrack.disabledReason) {
        if (!realAudioRef.current) {
          realAudioRef.current = new Audio()
          realAudioRef.current.loop = true
        }

        realAudioRef.current.src = matchedTrack.fileUrl
        realAudioRef.current.currentTime = 0

        try {
          await realAudioRef.current.play()
          setAudioStatus('ready')
        } catch {
          setAudioStatus(unlocked ? 'fallback' : 'blocked')
        }
      } else {
        setAudioStatus(unlocked ? 'ready' : 'blocked')
      }

      setPlaybackState('playing')
    } catch {
      setAudioStatus('blocked')
      setPlaybackState('playing')
    }
  }

  function togglePlayPause() {
    if (playbackState === 'playing') {
      realAudioRef.current?.pause()
      setPlaybackState('paused')
      return
    }

    void startPlayback()
  }

  function handleStop() {
    realAudioRef.current?.pause()
    if (realAudioRef.current) {
      realAudioRef.current.currentTime = 0
    }
    setPlaybackState('stopped')
    setCurrentBar(1)
    setCurrentBeat(1)
  }

  const progressPercent = (((currentBar - 1) * BEATS_PER_BAR + currentBeat) / (BAR_COUNT * BEATS_PER_BAR)) * 100
  const selectedGrooveProfile = GROOVE_PROFILES.find((item) => item.id === selectedGroove)
  const sourceDetailText =
    mode === 'auto'
      ? playbackResolution.hasMatch
        ? '自动模式：实录伴奏已激活'
        : '自动模式：未匹配到实录，回退到合成伴奏'
      : mode === 'real'
        ? playbackResolution.hasMatch
          ? '实录模式：实录伴奏已激活'
          : '实录模式：未匹配到实录，回退到合成伴奏'
        : '合成模式：固定使用合成伴奏'

  return (
    <section className="page">
      <h1>伴奏</h1>
      <p aria-live="polite">
        状态提示：{sourceDetailText}
        <span className={`badge ${playback === 'real' ? 'success' : 'info'}`} style={{ marginLeft: 8 }}>
          当前来源：{playback === 'real' ? '实录' : '合成'}
        </span>
      </p>

      <div className="card">
        <div className="card-title-row">
          <h2>练习控制</h2>
          <span className="badge warn">模式：{mode.toUpperCase()} → 来源：{playback === 'real' ? '实录' : '合成'}</span>
        </div>
        <div className="grid-3">
          <label className="control">
            伴奏律动
            <select
              aria-label="伴奏律动"
              value={selectedGroove}
              onChange={(e) => {
                const grooveId = e.target.value as GrooveId
                setSelectedGroove(grooveId)
                const profile = GROOVE_PROFILES.find((item) => item.id === grooveId)
                if (profile) setBpm(profile.bpmRange.recommended)
              }}
            >
              {GROOVE_PROFILES.map((groove) => (
                <option key={groove.id} value={groove.id}>
                  {groove.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            伴奏调性
            <select aria-label="伴奏调性" value={selectedKey} onChange={(e) => setSelectedKey(e.target.value as MusicalKey)}>
              {CHROMATIC_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            伴奏 BPM
            <input
              aria-label="伴奏 BPM"
              type="number"
              min={40}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </label>

          <label className="control">
            进行预设
            <select
              aria-label="进行预设"
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
        <p className="muted" aria-label="律动说明">
          {selectedGrooveProfile?.description}（建议 BPM {selectedGrooveProfile?.bpmRange.recommended}，范围 {selectedGrooveProfile?.bpmRange.min}-{selectedGrooveProfile?.bpmRange.max}）
        </p>
      </div>

      <fieldset className="card">
        <legend>模式</legend>
        <div className="inline-actions">
          <label>
            <input type="radio" name="mode" checked={mode === 'synth'} onChange={() => setMode('synth')} /> 合成
          </label>
          <label>
            <input type="radio" name="mode" checked={mode === 'real'} onChange={() => setMode('real')} /> 实录
          </label>
          <label>
            <input type="radio" name="mode" checked={mode === 'auto'} onChange={() => setMode('auto')} /> 自动
          </label>
        </div>
      </fieldset>

      <div className="card">
        <div className="card-title-row">
          <h2>播放控制</h2>
          <span className={`badge ${playbackState === 'playing' ? 'success' : playbackState === 'paused' ? 'warn' : 'info'}`}>
            {playbackState === 'playing' ? '播放中' : playbackState === 'paused' ? '已暂停' : '已停止'}
          </span>
        </div>
        <div className="inline-actions">
          <button type="button" className="btn-primary" onClick={togglePlayPause}>
            {playbackState === 'playing' ? '暂停' : playbackState === 'paused' ? '继续' : '播放'}
          </button>
          <button type="button" onClick={handleStop}>
            停止
          </button>
        </div>
        <p style={{ marginTop: 8 }}>
          当前小节：{currentBar} · 当前拍：{currentBeat}
        </p>
        <p className="muted" aria-label="音频状态">
          音频状态：
          {audioStatus === 'ready' ? '已解锁，可正常发声' : audioStatus === 'fallback' ? '实录播放失败，已回退节拍器提示' : audioStatus === 'blocked' ? '浏览器阻止音频，请再次点击播放' : '待启动'}
        </p>
        <div className="bar-progress" aria-label="当前小节进度">
          <div className="bar-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="beat-indicator" aria-label="1-2-3-4 节拍指示">
          {[1, 2, 3, 4].map((beat) => (
            <span key={beat} className={`beat-dot${currentBeat === beat ? ' active' : ''}`}>
              {beat}
            </span>
          ))}
        </div>
      </div>

      <div className="card grid-3">
        <p>播放源：{playback === 'real' ? '实录音轨' : '合成'}</p>
        <p>已选律动：{selectedGrooveProfile?.displayName}</p>
        <p>匹配音轨：{matchedTrack ? `${matchedTrack.name} (${matchedTrack.key} / ${matchedTrack.bpm})` : '未匹配'}</p>
        <p>所选预设：{preset}</p>
        <p>第 2 小节和弦：{progression[1].degree}</p>
        <p>第 12 小节和弦：{progression[11].degree}</p>
      </div>

      <div className="card">
        <h2>导入本地实录伴奏</h2>
        <form onSubmit={handleTrackImport} className="grid-3">
          <label className="control">
            名称
            <input
              aria-label="Track name"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              required
            />
          </label>

          <label className="control">
            律动风格
            <select aria-label="Track groove" value={newTrackGroove} onChange={(e) => setNewTrackGroove(e.target.value as GrooveId)}>
              {GROOVE_PROFILES.map((groove) => (
                <option key={groove.id} value={groove.id}>
                  {groove.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            调性
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
            文件
            <input aria-label="Track file" type="file" accept="audio/*" onChange={handleTrackFileChange} />
          </label>

          <div className="inline-actions" style={{ alignItems: 'end' }}>
            <button type="submit">导入音轨</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>内置实录 Groove</h3>
        <ul className="list">
          {BUNDLED_REAL_TRACKS.map((track) => (
            <li key={track.id} className="list-item">
              <strong>
                {track.name} - {track.key} @ {track.bpm} BPM
              </strong>
              <p className="muted">{track.fileUrl}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>已导入音轨</h3>
        {tracks.length === 0 ? (
          <p className="empty-state">还没有导入音轨。</p>
        ) : (
          <ul className="list">
            {tracks.map((track) => (
              <li key={track.id} className="list-item">
                <div className="card-title-row">
                  <strong>
                    {track.name} - {track.grooveId} - {track.key} @ {track.bpm} BPM
                  </strong>
                  <button type="button" onClick={() => deleteTrack(track.id)}>
                    删除
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
