import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { BackingPage } from './BackingPage'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

beforeEach(() => {
  class AudioContextMock {
    state: AudioContextState = 'suspended'
    sampleRate = 44100
    currentTime = 0
    destination = {}
    resume = vi.fn(async () => {
      this.state = 'running'
    })
    close = vi.fn(async () => {
      this.state = 'closed'
    })
    createOscillator = vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
      frequency: { value: 0 },
    }))
    createGain = vi.fn(() => ({
      connect: vi.fn(),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }))
  }

  class AudioMock {
    src = ''
    loop = false
    currentTime = 0
    play = vi.fn(async () => undefined)
    pause = vi.fn(() => undefined)
  }

  vi.stubGlobal('AudioContext', AudioContextMock)
  vi.stubGlobal('Audio', AudioMock)
})

function renderPage() {
  render(
    <MemoryRouter>
      <BackingPage />
    </MemoryRouter>,
  )
}

describe('BackingPage', () => {
  it('renders playback controls and handles play/pause/stop transitions', async () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    await screen.findByText('播放中')
    expect(screen.getByText('音频状态：已解锁，可正常发声')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '暂停' }))
    expect(screen.getByText('已暂停')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '停止' }))
    expect(screen.getByText('已停止')).toBeInTheDocument()
  })

  it('advances beat indicator while playing', async () => {
    vi.useFakeTimers()
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    await Promise.resolve()
    await Promise.resolve()

    vi.advanceTimersByTime(1000)

    expect(screen.getByLabelText('1-2-3-4 节拍指示')).toBeInTheDocument()
    expect(screen.getByText(/当前拍：/)).toBeInTheDocument()
  })

  it('supports groove selection and resolves bundled real track in auto mode', () => {
    renderPage()

    fireEvent.click(screen.getByRole('radio', { name: '自动' }))
    fireEvent.change(screen.getByLabelText('伴奏律动'), { target: { value: 'slow-shuffle' } })
    fireEvent.change(screen.getByLabelText('伴奏调性'), { target: { value: 'C' } })

    expect(screen.getByText(/状态提示：自动模式：实录伴奏已激活/)).toBeInTheDocument()
    expect(screen.getByText(/匹配音轨：慢速布鲁斯 Shuffle · C/)).toBeInTheDocument()
  })

  it('shows fallback status when no groove/key/bpm real track is available', () => {
    renderPage()

    fireEvent.click(screen.getByRole('radio', { name: '实录' }))
    fireEvent.change(screen.getByLabelText('伴奏律动'), { target: { value: 'texas-straight' } })
    fireEvent.change(screen.getByLabelText('伴奏调性'), { target: { value: 'C' } })
    fireEvent.change(screen.getByLabelText('伴奏 BPM'), { target: { value: '140' } })

    expect(screen.getByText(/状态提示：实录模式：未匹配到实录，回退到合成伴奏/)).toBeInTheDocument()
    expect(screen.getByText('当前来源：合成')).toBeInTheDocument()
  })

  it('guards no-sound regression by falling back when real track play fails', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:c-jam')
    const playMock = vi.fn(async () => {
      throw new Error('blocked')
    })

    vi.stubGlobal(
      'Audio',
      class {
        src = ''
        loop = false
        currentTime = 0
        play = playMock
        pause = vi.fn(() => undefined)
      },
    )

    renderPage()

    fireEvent.change(screen.getByLabelText('Track name'), { target: { value: 'C Jam' } })
    fireEvent.change(screen.getByLabelText('Track key'), { target: { value: 'C' } })
    fireEvent.change(screen.getByLabelText('Track bpm'), { target: { value: '90' } })

    const file = new File(['audio'], 'c-jam.mp3', { type: 'audio/mpeg' })
    fireEvent.change(screen.getByLabelText('Track file'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: '导入音轨' }))

    fireEvent.click(screen.getByRole('radio', { name: '实录' }))
    fireEvent.click(screen.getByRole('button', { name: '播放' }))

    await waitFor(() => expect(playMock).toHaveBeenCalled())
    expect(screen.getByText('音频状态：实录播放失败，已回退节拍器提示')).toBeInTheDocument()
  })
})
