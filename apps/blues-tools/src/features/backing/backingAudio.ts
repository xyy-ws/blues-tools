export interface BackingClickPlayer {
  ensureUnlocked: () => Promise<boolean>
  playBeat: (isDownbeat: boolean) => void
  isUnlocked: () => boolean
  dispose: () => void
}

type AudioContextCtor = typeof AudioContext

function getAudioCtor(): AudioContextCtor | undefined {
  if (typeof window === 'undefined') return undefined

  return (window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: AudioContextCtor }).webkitAudioContext) as
    | AudioContextCtor
    | undefined
}

export function createBackingClickPlayer(): BackingClickPlayer {
  const AudioCtor = getAudioCtor()

  if (!AudioCtor) {
    return {
      ensureUnlocked: async () => false,
      playBeat: () => undefined,
      isUnlocked: () => false,
      dispose: () => undefined,
    }
  }

  let ctx: AudioContext | null = null

  function getCtx() {
    if (!AudioCtor) return null
    if (!ctx) {
      ctx = new AudioCtor()
    }
    return ctx
  }

  async function ensureUnlocked() {
    const context = getCtx()
    if (!context) return false
    if (context.state === 'suspended') {
      await context.resume()
    }

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 1
    gain.gain.setValueAtTime(0.00001, context.currentTime)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.01)

    return context.state === 'running'
  }

  function playBeat(isDownbeat: boolean) {
    const context = ctx
    if (!context || context.state !== 'running') return

    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.value = isDownbeat ? 880 : 660

    const now = context.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.1)
  }

  function isUnlocked() {
    return !!ctx && ctx.state === 'running'
  }

  function dispose() {
    if (ctx && ctx.state !== 'closed') {
      void ctx.close()
    }
    ctx = null
  }

  return { ensureUnlocked, playBeat, isUnlocked, dispose }
}
