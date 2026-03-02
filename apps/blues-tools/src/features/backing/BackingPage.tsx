import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import { getTwelveBarBluesProgression } from '../../domain/music/progression'
import type { MusicalKey, ProgressionPreset } from '../../domain/music/types'
import { getDefaultState, loadState, saveState, toHydratedTracks, toPersistedTracks } from '../../app/persistence/localState'
import { BUNDLED_REAL_TRACKS, GROOVE_PROFILES, buildRealTrackId, type GrooveId, type RealTrack } from './backing'
import { createBackingClickPlayer } from './backingAudio'
import { createPlaceholderBackingExtractorService } from './backingExtractor'

const PROGRESSION_PRESETS: Array<{ id: ProgressionPreset; label: string }> = [
  { id: 'standard-12', label: '标准 12 小节' },
  { id: 'quick-change', label: '快速换和弦' },
  { id: 'turnaround', label: '结尾回转' },
]

const BAR_COUNT = 12
const BEATS_PER_BAR = 4
const extractorService = createPlaceholderBackingExtractorService()

export function BackingPage() {
  const [searchParams] = useSearchParams()

  const [initial] = useState(() => {
    const stored = loadState() ?? getDefaultState()
    const key = searchParams.get('key') as MusicalKey | null
    const bpm = Number(searchParams.get('bpm'))
    const preset = searchParams.get('preset') as ProgressionPreset | null
    const bar = Number(searchParams.get('bar'))

    return {
      ...stored,
      selectedKey: key && CHROMATIC_KEYS.includes(key) ? key : stored.selectedKey,
      bpm: Number.isFinite(bpm) && bpm >= 40 && bpm <= 220 ? bpm : stored.bpm,
      preset: preset && PROGRESSION_PRESETS.some((item) => item.id === preset) ? preset : stored.preset,
      bar: Number.isFinite(bar) && bar >= 1 && bar <= BAR_COUNT ? bar : 1,
      lickId: searchParams.get('lickId') ?? '',
    }
  })

  const [selectedKey, setSelectedKey] = useState<MusicalKey>(initial.selectedKey)
  const [bpm, setBpm] = useState(initial.bpm)
  const [preset, setPreset] = useState<ProgressionPreset>(initial.preset)
  const [selectedGroove, setSelectedGroove] = useState<GrooveId>('slow-shuffle')
  const [tracks, setTracks] = useState<RealTrack[]>(toHydratedTracks(initial.tracks))
  const [selectedRealTrackId, setSelectedRealTrackId] = useState('')

  const [newTrackName, setNewTrackName] = useState('')
  const [newTrackKey, setNewTrackKey] = useState<MusicalKey>('C')
  const [newTrackGroove, setNewTrackGroove] = useState<GrooveId>('slow-shuffle')
  const [newTrackBpm, setNewTrackBpm] = useState(90)
  const [newTrackFile, setNewTrackFile] = useState<File | null>(null)

  const [playbackState, setPlaybackState] = useState<'stopped' | 'playing' | 'paused'>('stopped')
  const [currentSource, setCurrentSource] = useState<'synth' | 'real'>('synth')
  const [errorReason, setErrorReason] = useState('无')
  const [currentBar, setCurrentBar] = useState(initial.bar)
  const [currentBeat, setCurrentBeat] = useState(1)

  const clickPlayerRef = useRef(createBackingClickPlayer())
  const realAudioRef = useRef<HTMLAudioElement | null>(null)

  const allTracks = useMemo(() => [...tracks, ...BUNDLED_REAL_TRACKS], [tracks])
  const selectedRealTrack = useMemo(
    () => allTracks.find((track) => track.id === selectedRealTrackId) ?? allTracks[0] ?? null,
    [allTracks, selectedRealTrackId],
  )
  const progression = useMemo(() => getTwelveBarBluesProgression(selectedKey, preset), [preset, selectedKey])

  useEffect(() => {
    const existing = loadState() ?? getDefaultState()
    saveState({
      selectedKey,
      bpm,
      preset,
      mode: existing.mode,
      tracks: toPersistedTracks(tracks),
      improvKey: existing.improvKey,
      improvPreset: existing.improvPreset,
      fretboardKey: existing.fretboardKey,
    })
  }, [selectedKey, bpm, preset, tracks])

  useEffect(() => {
    if (playbackState !== 'playing' || currentSource !== 'synth') return

    const beatIntervalMs = Math.max(120, Math.round((60_000 / Math.max(bpm, 1)) * 0.75))
    const timer = window.setInterval(() => {
      setCurrentBeat((prevBeat) => {
        const nextBeat = prevBeat < BEATS_PER_BAR ? prevBeat + 1 : 1
        if (prevBeat >= BEATS_PER_BAR) {
          setCurrentBar((prevBar) => (prevBar % BAR_COUNT) + 1)
        }
        clickPlayerRef.current.playBeat(nextBeat === 1)
        return nextBeat
      })
    }, beatIntervalMs)

    return () => window.clearInterval(timer)
  }, [bpm, playbackState, currentSource])

  useEffect(() => {
    if (!selectedRealTrackId && allTracks[0]) {
      setSelectedRealTrackId(allTracks[0].id)
    }
  }, [allTracks, selectedRealTrackId])

  useEffect(() => {
    return () => {
      realAudioRef.current?.pause()
      clickPlayerRef.current.dispose()
      tracks.forEach((track) => {
        if (track.fileUrl.startsWith('blob:')) URL.revokeObjectURL(track.fileUrl)
      })
    }
  }, [tracks])

  function handleTrackImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newTrackName || !newTrackFile) return

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
    setSelectedRealTrackId(track.id)
    setNewTrackName('')
    setNewTrackFile(null)
    event.currentTarget.reset()
  }

  function handleTrackFileChange(event: ChangeEvent<HTMLInputElement>) {
    setNewTrackFile(event.target.files?.[0] ?? null)
  }

  function deleteTrack(id: string) {
    setTracks((existing) => {
      const track = existing.find((item) => item.id === id)
      if (track?.fileUrl) URL.revokeObjectURL(track.fileUrl)
      return existing.filter((item) => item.id !== id)
    })
    if (selectedRealTrackId === id) setSelectedRealTrackId('')
  }

  async function playSynth() {
    realAudioRef.current?.pause()
    const unlocked = await clickPlayerRef.current.ensureUnlocked()
    setCurrentSource('synth')
    setPlaybackState('playing')
    setErrorReason(unlocked ? '无' : '浏览器阻止音频，请再次点击播放')
  }

  async function playRealTrack() {
    if (!selectedRealTrack?.fileUrl) {
      setCurrentSource('synth')
      setErrorReason('所选实录无可用音频文件')
      return
    }

    try {
      if (!realAudioRef.current) {
        realAudioRef.current = new Audio()
        realAudioRef.current.loop = true
      }
      realAudioRef.current.src = selectedRealTrack.fileUrl
      realAudioRef.current.currentTime = 0
      await realAudioRef.current.play()
      setCurrentSource('real')
      setPlaybackState('playing')
      setErrorReason('无')
    } catch {
      setCurrentSource('synth')
      setPlaybackState('playing')
      setErrorReason('实录播放失败')
    }
  }

  function pauseCurrentSource() {
    if (currentSource === 'real') {
      realAudioRef.current?.pause()
    }
    setPlaybackState('paused')
  }

  function stopCurrentSource() {
    realAudioRef.current?.pause()
    if (realAudioRef.current) realAudioRef.current.currentTime = 0
    setPlaybackState('stopped')
    setCurrentSource('synth')
    setCurrentBar(1)
    setCurrentBeat(1)
  }

  const progressPercent = (((currentBar - 1) * BEATS_PER_BAR + currentBeat) / (BAR_COUNT * BEATS_PER_BAR)) * 100
  const selectedGrooveProfile = GROOVE_PROFILES.find((item) => item.id === selectedGroove)

  return (
    <section className="page">
      <h1>伴奏</h1>
      <div aria-live="polite">
        <p>{`当前播放源（合成/实录）：${currentSource === 'real' ? '实录' : '合成'}`}</p>
        <p>{`错误原因：${errorReason}`}</p>
        {initial.lickId ? <p>{`练习来源乐句：${initial.lickId}`}</p> : null}
      </div>

      <div className="card">
        <div className="card-title-row">
          <h2>合成伴奏（练习模式）</h2>
          <span className={`badge ${currentSource === 'synth' ? 'success' : 'info'}`}>状态：{currentSource === 'synth' ? playbackState : '未启用'}</span>
        </div>

        <div className="grid-3">
          <label className="control">
            调号
            <select aria-label="伴奏调性" value={selectedKey} onChange={(e) => setSelectedKey(e.target.value as MusicalKey)}>
              {CHROMATIC_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            BPM
            <input aria-label="伴奏 BPM" type="number" min={40} max={220} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          </label>

          <label className="control">
            进行预设
            <select aria-label="进行预设" value={preset} onChange={(e) => setPreset(e.target.value as ProgressionPreset)}>
              {PROGRESSION_PRESETS.map((progressionPreset) => (
                <option key={progressionPreset.id} value={progressionPreset.id}>
                  {progressionPreset.label}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            律动预设
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
        </div>

        <div className="inline-actions" style={{ marginTop: 8 }}>
          <button type="button" className="btn-primary" onClick={() => (currentSource === 'synth' && playbackState === 'playing' ? pauseCurrentSource() : void playSynth())}>
            {currentSource === 'synth' && playbackState === 'playing' ? '暂停' : '播放合成'}
          </button>
          <button type="button" onClick={stopCurrentSource}>停止</button>
        </div>

        <p style={{ marginTop: 8 }}>当前小节：{currentBar} · 当前拍：{currentBeat}</p>
        <p className="muted">音频状态：{errorReason === '无' ? '已解锁，可正常发声' : errorReason}</p>
        <p className="muted">{selectedGrooveProfile?.description}</p>
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

      <div className="card">
        <div className="card-title-row">
          <h2>实录伴奏（素材库）</h2>
          <span className={`badge ${currentSource === 'real' ? 'success' : 'info'}`}>状态：{currentSource === 'real' ? playbackState : '未启用'}</span>
        </div>

        <div className="grid-3">
          <label className="control">
            伴奏名称
            <select aria-label="伴奏名称" value={selectedRealTrack?.id ?? ''} onChange={(e) => setSelectedRealTrackId(e.target.value)}>
              {allTracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}（{track.key} / {track.bpm} BPM / {track.grooveId}）
                </option>
              ))}
            </select>
          </label>

          <p>调号：{selectedRealTrack?.key ?? '-'}</p>
          <p>BPM：{selectedRealTrack?.bpm ?? '-'}</p>
          <p>风格：{selectedRealTrack ? GROOVE_PROFILES.find((g) => g.id === selectedRealTrack.grooveId)?.displayName : '-'}</p>
        </div>

        <div className="inline-actions">
          <button type="button" className="btn-primary" onClick={() => (currentSource === 'real' && playbackState === 'playing' ? pauseCurrentSource() : void playRealTrack())}>
            {currentSource === 'real' && playbackState === 'playing' ? '暂停' : '播放所选实录'}
          </button>
          <button type="button" onClick={stopCurrentSource}>停止</button>
        </div>
      </div>

      <div className="card">
        <h2>上传实录伴奏</h2>
        <form onSubmit={handleTrackImport} className="grid-3">
          <label className="control">
            名称
            <input aria-label="Track name" value={newTrackName} onChange={(e) => setNewTrackName(e.target.value)} required />
          </label>

          <label className="control">
            调号
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
            <input aria-label="Track bpm" type="number" min={40} max={220} value={newTrackBpm} onChange={(e) => setNewTrackBpm(Number(e.target.value))} />
          </label>

          <label className="control">
            风格
            <select aria-label="Track groove" value={newTrackGroove} onChange={(e) => setNewTrackGroove(e.target.value as GrooveId)}>
              {GROOVE_PROFILES.map((groove) => (
                <option key={groove.id} value={groove.id}>
                  {groove.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            文件
            <input aria-label="Track file" type="file" accept="audio/*" onChange={handleTrackFileChange} required />
          </label>

          <div className="inline-actions" style={{ alignItems: 'end' }}>
            <button type="submit">导入音轨</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>链接提取素材（即将支持）</h2>
        <div className="inline-actions">
          <input aria-label="素材链接 URL" type="url" placeholder="粘贴 YouTube / 音频链接" style={{ minWidth: 280 }} />
          <button type="button" disabled>
            开始提取（即将支持）
          </button>
        </div>
        <p className="muted">该入口已预留服务层结构（backingExtractor.ts），当前版本不发起网络提取。</p>
        <p className="muted">服务状态：{typeof extractorService.extractFromUrl === 'function' ? '占位已接入' : '未接入'}</p>
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

      <div className="card grid-3">
        <p>所选预设：{preset}</p>
        <p>第 2 小节和弦：{progression[1].degree}</p>
        <p>第 12 小节和弦：{progression[11].degree}</p>
      </div>
    </section>
  )
}
