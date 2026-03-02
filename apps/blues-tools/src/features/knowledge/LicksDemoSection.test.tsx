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

    expect(screen.getByLabelText('选择乐句')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Lick A/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Lick B/i })).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('选择乐句'), { target: { value: 'lick-b' } })
    expect(screen.getByRole('heading', { name: /Lick B/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Lick A/i })).not.toBeInTheDocument()
  })

  it('changes playback states with play, backing-only, pause and stop', () => {
    vi.useFakeTimers()
    vi.stubGlobal('AudioContext', AudioContextMock)

    render(<LicksDemoSection />)

    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    expect(screen.getByText('播放中（乐句）')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '只播放伴奏' }))
    expect(screen.getByText('播放中（仅伴奏）')).toBeInTheDocument()

    vi.advanceTimersByTime(300)
    fireEvent.click(screen.getByRole('button', { name: '暂停' }))
    expect(screen.getByText('已暂停（仅伴奏）')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '停止' }))
    expect(screen.getByText('已停止')).toBeInTheDocument()

  })
})
