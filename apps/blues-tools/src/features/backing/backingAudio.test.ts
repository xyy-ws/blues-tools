import { describe, expect, it, vi, afterEach } from 'vitest'
import { createBackingClickPlayer } from './backingAudio'

afterEach(() => {
  vi.unstubAllGlobals()
})

class AudioContextMock {
  state: AudioContextState = 'suspended'
  currentTime = 0
  destination = {}

  async resume() {
    this.state = 'running'
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }
  }

  async close() {
    this.state = 'closed'
  }
}

describe('createBackingClickPlayer', () => {
  it('unlocks and plays click only when running', async () => {
    vi.stubGlobal('AudioContext', AudioContextMock)

    const player = createBackingClickPlayer()
    expect(player.isUnlocked()).toBe(false)

    const unlocked = await player.ensureUnlocked()
    expect(unlocked).toBe(true)
    expect(player.isUnlocked()).toBe(true)

    expect(() => player.playBeat(true)).not.toThrow()
    player.dispose()
  })
})
