import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('LicksDemoSection', () => {
  it('uses selector and only shows selected lick details', () => {
    render(<LicksDemoSection />)

    expect(screen.getByLabelText('Select lick')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Lick A/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Lick B/i })).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Select lick'), { target: { value: 'lick-b' } })
    expect(screen.getByRole('heading', { name: /Lick B/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Lick A/i })).not.toBeInTheDocument()
  })

  it('changes playback states with play, backing-only, pause and stop', () => {
    vi.useFakeTimers()
    vi.stubGlobal('AudioContext', AudioContextMock)

    render(<LicksDemoSection />)

    fireEvent.click(screen.getByRole('button', { name: '播放 Play' }))
    expect(screen.getByText('播放中 Playing (Lick)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '只播放伴奏 / Backing only' }))
    expect(screen.getByText('播放中 Playing (Backing only)')).toBeInTheDocument()

    vi.advanceTimersByTime(300)
    fireEvent.click(screen.getByRole('button', { name: '暂停 Pause' }))
    expect(screen.getByText('已暂停 Paused (Backing only)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '停止 Stop' }))
    expect(screen.getByText('已停止 Stopped')).toBeInTheDocument()

  })
})
