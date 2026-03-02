import { useEffect, useMemo, useRef, useState } from 'react'
import { DEMO_BPM, DEMO_LICKS, type BluesLick } from './licksDemo'

type PlaybackState = 'idle' | 'playing' | 'paused'

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
    playTone(step.frequency, stepMs * 0.92)

    timeoutRef.current = window.setTimeout(() => {
      setStepIndex((prev) => prev + 1)
    }, stepMs)

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [lick.steps, speed, state, stepIndex])

  function onPlay() {
    if (state === 'idle' && stepIndex >= lick.steps.length - 1) {
      setStepIndex(0)
    }
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

  const statusLabel = state === 'idle' ? '已停止 Stopped' : state === 'paused' ? '已暂停 Paused' : '播放中 Playing'

  return (
    <article className="card" aria-label={`${lick.name} demo card`}>
      <div className="card-title-row">
        <h3>
          {lick.name} · {lick.subtitle}
        </h3>
        <span className="badge info">{statusLabel}</span>
      </div>

      <div className="inline-actions" style={{ marginBottom: '0.65rem' }}>
        <span className="badge success">调 Key: {lick.key}</span>
        <span className="badge info">把位 Position: {lick.position}</span>
        <span className="badge warn">律动 Feel: {lick.feel}</span>
      </div>

      <div className="grid-2">
        <section>
          <h4>TAB 谱例</h4>
          <pre style={{ textAlign: 'left', margin: 0 }}>{lick.tabLines.join('\n')}</pre>
        </section>

        <section>
          <h4>指板定位 Fretboard</h4>
          <div role="grid" aria-label={`${lick.name} fretboard`} style={{ display: 'grid', gap: 4 }}>
            {STRINGS.map((label, rowIndex) => {
              const stringNo = 1 + rowIndex
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <strong style={{ width: 16 }}>{label}</strong>
                  {Array.from({ length: 13 }, (_, fret) => {
                    const active = currentStep?.string === stringNo && currentStep?.fret === fret && state !== 'idle'
                    return (
                      <span
                        key={`${label}-${fret}`}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          display: 'inline-flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          border: '1px solid var(--border)',
                          background: active ? 'rgba(77, 161, 255, 0.35)' : 'rgba(7, 15, 27, 0.65)',
                          color: active ? 'var(--text)' : 'var(--muted)',
                          fontSize: 11,
                        }}
                      >
                        {fret}
                      </span>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
            当前拍 Current beat: {Math.min(currentStep?.beat ?? 0, totalBeats)} / {totalBeats}
          </p>
        </section>
      </div>

      <div className="bar-progress" aria-label={`${lick.name} beat progress`}>
        <div className="bar-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="card" style={{ marginTop: 12, padding: 12 }}>
        <div className="card-title-row">
          <strong>控制 Controls</strong>
          <label>
            速度 Speed
            <select
              aria-label={`${lick.name} speed`}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value) as (typeof SPEED_OPTIONS)[number])}
              style={{ marginLeft: 8 }}
            >
              {SPEED_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}x
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="inline-actions" style={{ marginTop: 8 }}>
          <button type="button" className="btn-primary" onClick={onPlay}>
            播放 Play
          </button>
          <button type="button" onClick={onPause}>
            暂停 Pause
          </button>
          <button type="button" onClick={onStop}>
            停止 Stop
          </button>
        </div>
      </div>

      <p style={{ marginTop: 12, marginBottom: 8 }}>
        <strong>练习提示 Practice tip:</strong> {lick.practiceTip}
      </p>

      <div className="list-item" style={{ marginTop: 4 }}>
        <strong>真实示范 / Real performance</strong>
        <p className="muted" style={{ margin: '6px 0 10px' }}>
          将来可接入真实演奏音频或视频。Real take slot for future recording.
        </p>
        {lick.realDemoUrl ? (
          <a href={lick.realDemoUrl} target="_blank" rel="noreferrer">
            打开真实示范 Open real demo
          </a>
        ) : (
          <button type="button" disabled>
            真实示范即将上线 Real demo coming soon
          </button>
        )}
      </div>
    </article>
  )
}

export function LicksDemoSection() {
  return (
    <section className="page" aria-label="Licks demo section">
      <div>
        <h2>乐句演示 Licks Demo v1</h2>
        <p className="muted">2 条可播放 Demo 乐句（自动发声 + 指板高亮 + 速度控制）</p>
      </div>

      <div className="list">
        {DEMO_LICKS.map((lick) => (
          <LickPlayerCard key={lick.id} lick={lick} />
        ))}
      </div>
    </section>
  )
}
