import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LicksDemoSection } from './LicksDemoSection'

class AudioContextMock {
  currentTime = 0
  destination = {}

  createOscillator() {
    return {
      type: 'triangle',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as null | (() => void),
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

  close() {
    return Promise.resolve()
  }
}

describe('LicksDemoSection', () => {
  it('renders exactly two demo licks', () => {
    render(<LicksDemoSection />)

    expect(screen.getByRole('heading', { name: /Lick A/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Lick B/i })).toBeInTheDocument()
    expect(screen.getAllByText(/真实示范 \/ Real performance/)).toHaveLength(2)
  })

  it('changes playback states with play, pause and stop', () => {
    vi.useFakeTimers()
    vi.stubGlobal('AudioContext', AudioContextMock)

    render(<LicksDemoSection />)

    const playButtons = screen.getAllByRole('button', { name: '播放 Play' })
    const pauseButtons = screen.getAllByRole('button', { name: '暂停 Pause' })
    const stopButtons = screen.getAllByRole('button', { name: '停止 Stop' })

    fireEvent.click(playButtons[0])
    expect(screen.getByText('播放中 Playing')).toBeInTheDocument()

    vi.advanceTimersByTime(300)
    fireEvent.click(pauseButtons[0])
    expect(screen.getByText('已暂停 Paused')).toBeInTheDocument()

    fireEvent.click(stopButtons[0])
    expect(screen.getAllByText('已停止 Stopped')[0]).toBeInTheDocument()

    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
})
