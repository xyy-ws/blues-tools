import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { LicksDemoSection, buildLickPracticeUrl } from './LicksDemoSection'
import { DEMO_LICKS } from './licksDemo'

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

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('LicksDemoSection', () => {
  it('uses selector and only shows selected lick details', () => {
    render(
      <MemoryRouter>
        <LicksDemoSection />
      </MemoryRouter>,
    )

    const selector = screen.getByLabelText('选择乐句') as HTMLSelectElement
    expect(selector).toBeInTheDocument()
    expect(selector.value).toBe('lick-a')
    expect(screen.getByText(DEMO_LICKS[0].practiceTip)).toBeInTheDocument()
    expect(screen.queryByText(DEMO_LICKS[1].practiceTip)).not.toBeInTheDocument()

    fireEvent.change(selector, { target: { value: 'lick-b' } })
    expect(selector.value).toBe('lick-b')
    expect(screen.getByText(DEMO_LICKS[1].practiceTip)).toBeInTheDocument()
    expect(screen.queryByText(DEMO_LICKS[0].practiceTip)).not.toBeInTheDocument()
  })

  it('shows 12-bar recommendation and chinese timing guidance', () => {
    render(
      <MemoryRouter>
        <LicksDemoSection />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '第 1 小节' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '第 12 小节' })).toBeInTheDocument()
    expect(screen.getByText(/什么时候用：适合在第 1-2 小节先抛出主题/)).toBeInTheDocument()
    expect(screen.getByText(/用途：开场/)).toBeInTheDocument()
  })

  it('changes playback states with play, backing-only, pause and stop', () => {
    vi.useFakeTimers()
    vi.stubGlobal('AudioContext', AudioContextMock)

    render(
      <MemoryRouter>
        <LicksDemoSection />
      </MemoryRouter>,
    )

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '播放' }))
    })
    expect(screen.getByText('播放中（乐句）')).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '只播放伴奏' }))
    })
    expect(screen.getByText('播放中（仅伴奏）')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(300)
      fireEvent.click(screen.getByRole('button', { name: '暂停' }))
    })
    expect(screen.getByText('已暂停（仅伴奏）')).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '停止' }))
    })
    expect(screen.getByText('已停止')).toBeInTheDocument()
  })

  it('navigates to backing with recommended bar + key + bpm params', () => {
    render(
      <MemoryRouter initialEntries={['/knowledge']}>
        <Routes>
          <Route path="/knowledge" element={<LicksDemoSection />} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '跳到推荐小节练习' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/backing?key=A&bpm=84&preset=standard-12&bar=1&lickId=lick-a')
  })

  it('builds practice url from selected lick and bar', () => {
    const url = buildLickPracticeUrl(DEMO_LICKS[1], 11)
    expect(url).toBe('/backing?key=A&bpm=84&preset=standard-12&bar=11&lickId=lick-b')
  })
})
