import { useEffect, useMemo, useRef, useState } from 'react'
import { DEMO_BPM, DEMO_LICKS, type BluesLick } from './licksDemo'

type PlaybackState = 'idle' | 'playing' | 'paused'
type PlaybackMode = 'lick' | 'backing-only'

const SPEED_OPTIONS = [0.5, 0.75, 1] as const
const STRINGS = ['e', 'B', 'G', 'D', 'A', 'E']

function playTone(frequency: number, durationMs: number) {
  const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return

  const ctx = new AudioCtor()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.value = frequency

  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(ctx.currentTime + durationMs / 1000)
  oscillator.onended = () => void ctx.close()
}

function LickPlayerCard({ lick }: { lick: BluesLick }) {
  const [state, setState] = useState<PlaybackState>('idle')
  const [mode, setMode] = useState<PlaybackMode>('lick')
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1)
  const [stepIndex, setStepIndex] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  const totalBeats = useMemo(() => lick.steps.reduce((sum, step) => sum + step.durationBeats, 0), [lick.steps])
  const currentStep = lick.steps[stepIndex]
  const currentBeat = currentStep?.beat ?? totalBeats
  const progressPercent = state === 'idle' ? 0 : Math.min((currentBeat / totalBeats) * 100, 100)

  useEffect(() => {
    if (state !== 'playing') return

    if (stepIndex >= lick.steps.length) {
      setState('idle')
      setStepIndex(0)
      return
    }

    const step = lick.steps[stepIndex]
    const stepMs = (60000 / DEMO_BPM) * (step.durationBeats / speed)
    if (mode === 'lick') {
      playTone(step.frequency, stepMs * 0.92)
    } else {
      playTone(step.beat % 4 === 0 ? 130.81 : 98, stepMs * 0.4)
    }

    timeoutRef.current = window.setTimeout(() => {
      setStepIndex((prev) => prev + 1)
    }, stepMs)

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [lick.steps, mode, speed, state, stepIndex])

  function onPlay(nextMode: PlaybackMode = mode) {
    if (state === 'idle' || state === 'paused') {
      if (stepIndex >= lick.steps.length || (state === 'idle' && stepIndex >= lick.steps.length - 1)) {
        setStepIndex(0)
      }
    }
    setMode(nextMode)
    setState('playing')
  }

  function onPause() {
    if (state !== 'playing') return
    setState('paused')
  }

  function onStop() {
    setState('idle')
    setStepIndex(0)
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const statusLabel =
    state === 'idle'
      ? '已停止'
      : state === 'paused'
        ? `已暂停（${mode === 'lick' ? '乐句' : '仅伴奏'}）`
        : `播放中（${mode === 'lick' ? '乐句' : '仅伴奏'}）`

  return (
    <article className="card" aria-label={`${lick.name} 演示卡片`}>
      <div className="card-title-row">
        <h3>
          {lick.name} · {lick.subtitle}
        </h3>
        <span className="badge info">{statusLabel}</span>
      </div>

      <div className="inline-actions meta-row">
        <span className="badge success">调性：{lick.key}</span>
        <span className="badge info">把位：{lick.position}</span>
        <span className="badge warn">律动：{lick.feel}</span>
      </div>

      <div className="grid-2">
        <section>
          <h4 className="subsection-title">六线谱示例</h4>
          <pre className="tab-block">{lick.tabLines.join('\n')}</pre>
        </section>

        <section>
          <h4 className="subsection-title">指板定位</h4>
          <div role="grid" aria-label={`${lick.name} 指板`} className="fretboard-grid">
            {STRINGS.map((label, rowIndex) => {
              const stringNo = 1 + rowIndex
              return (
                <div key={label} className="fretboard-row">
                  <strong className="fretboard-string-label">{label}</strong>
                  {Array.from({ length: 13 }, (_, fret) => {
                    const active = currentStep?.string === stringNo && currentStep?.fret === fret && state !== 'idle'
                    return (
                      <span key={`${label}-${fret}`} className={`fretboard-fret${active ? ' active' : ''}`}>
                        {fret}
                      </span>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <p className="muted helper-text">
            当前拍： {Math.min(currentStep?.beat ?? 0, totalBeats)} / {totalBeats}
          </p>
        </section>
      </div>

      <div className="bar-progress" aria-label={`${lick.name} 拍子进度`}>
        <div className="bar-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="card card-nested controls-panel">
        <div className="card-title-row">
          <strong className="subsection-title">练习控制</strong>
          <label className="control-inline">
            <span className="control-label">速度</span>
            <select
              aria-label={`${lick.name} 速度`}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value) as (typeof SPEED_OPTIONS)[number])}
            >
              {SPEED_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}x
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="inline-actions button-group">
          <button type="button" className="btn-primary" onClick={() => onPlay('lick')}>
            播放
          </button>
          <button type="button" onClick={() => onPlay('backing-only')}>
            只播放伴奏
          </button>
          <button type="button" onClick={onPause}>
            暂停
          </button>
          <button type="button" onClick={onStop}>
            停止
          </button>
        </div>
      </div>

      <p className="practice-tip">
        <strong>练习提示：</strong> {lick.practiceTip}
      </p>

      <div className="list-item real-demo-card">
        <strong>真实示范</strong>
        <p className="muted helper-text">
          将来可接入真实演奏音频或视频。
        </p>
        {lick.realDemoUrl ? (
          <a href={lick.realDemoUrl} target="_blank" rel="noreferrer">
            打开真实示范
          </a>
        ) : (
          <button type="button" disabled>
            真实示范即将上线
          </button>
        )}
      </div>
    </article>
  )
}

export function LicksDemoSection() {
  const [selectedLickId, setSelectedLickId] = useState(DEMO_LICKS[0]?.id ?? '')
  const selectedLick = useMemo(
    () => DEMO_LICKS.find((lick) => lick.id === selectedLickId) ?? DEMO_LICKS[0],
    [selectedLickId],
  )

  if (!selectedLick) {
    return null
  }

  return (
    <section className="page" aria-label="乐句演示区块">
      <div>
        <h2 className="section-title">乐句示范</h2>
        <p className="muted helper-text">选择一个乐句进行练习（自动发声、指板高亮和速度控制）</p>
      </div>

      <div className="card card-controls">
        <label className="control">
          <span className="control-label">选择乐句</span>
          <select aria-label="选择乐句" value={selectedLickId} onChange={(e) => setSelectedLickId(e.target.value)}>
            {DEMO_LICKS.map((lick) => (
              <option key={lick.id} value={lick.id}>
                {lick.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="list">
        <LickPlayerCard key={selectedLick.id} lick={selectedLick} />
      </div>
    </section>
  )
}
