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
    createOscillator = vi.fn(() => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), type: 'sine', frequency: { value: 0 } }))
    createGain = vi.fn(() => ({
      connect: vi.fn(),
      gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
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

function renderPage(initialEntries?: string[]) {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <BackingPage />
    </MemoryRouter>,
  )
}

describe('BackingPage', () => {
  it('renders split synth/real cards and source status', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: '合成伴奏（练习模式）' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '实录伴奏（素材库）' })).toBeInTheDocument()
    expect(screen.getByText('当前播放源（合成/实录）：合成')).toBeInTheDocument()
  })

  it('supports synth play/pause/stop', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: '播放合成' }))
    await waitFor(() => expect(screen.getByText('状态：playing')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '暂停' }))
    fireEvent.click(screen.getAllByRole('button', { name: '停止' })[0])
    expect(screen.getByText('状态：stopped')).toBeInTheDocument()
  })

  it('imports user real track and can play real', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:c-jam')
    renderPage()
    fireEvent.change(screen.getByLabelText('Track name'), { target: { value: 'C Jam' } })
    fireEvent.change(screen.getByLabelText('Track file'), { target: { files: [new File(['audio'], 'c-jam.mp3', { type: 'audio/mpeg' })] } })
    fireEvent.click(screen.getByRole('button', { name: '导入音轨' }))
    fireEvent.click(screen.getByRole('button', { name: '播放所选实录' }))
    await waitFor(() => expect(screen.getByText('当前播放源（合成/实录）：实录')).toBeInTheDocument())
  })

  it('accepts bar/key/bpm params from lick jump link', () => {
    renderPage(['/backing?key=G&bpm=96&bar=11&lickId=lick-b'])
    expect(screen.getByDisplayValue('G')).toBeInTheDocument()
    expect(screen.getByDisplayValue('96')).toBeInTheDocument()
    expect(screen.getByText('当前小节：11 · 当前拍：1')).toBeInTheDocument()
    expect(screen.getByText('练习来源乐句：lick-b')).toBeInTheDocument()
  })

  it('shows extraction placeholder', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: '链接提取素材（即将支持）' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开始提取（即将支持）' })).toBeDisabled()
  })
})
