import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
  vi.useFakeTimers()
})

function renderPage() {
  render(
    <MemoryRouter>
      <BackingPage />
    </MemoryRouter>,
  )
}

describe('BackingPage', () => {
  it('renders playback controls and handles play/pause(stop via toggle)/stop transitions', () => {
    renderPage()

    expect(screen.getByRole('button', { name: '播放' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '停止' })).toBeInTheDocument()
    expect(screen.getByText(/当前小节：\s*1/)).toBeInTheDocument()
    expect(screen.getByText('已停止')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    expect(screen.getByText('播放中')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '暂停' }))
    expect(screen.getByText('已暂停')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '继续' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '停止' }))
    expect(screen.getByText('已停止')).toBeInTheDocument()
    expect(screen.getByText(/当前小节：\s*1/)).toBeInTheDocument()
  })

  it('advances beat indicator while playing', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    vi.advanceTimersByTime(1000)

    expect(screen.getByLabelText('1-2-3-4 节拍指示')).toBeInTheDocument()
    expect(screen.getByText(/当前拍：/)).toBeInTheDocument()
  })

  it('uses synth in auto mode when there is no matching real track and real when matched', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:c-jam')

    renderPage()

    expect(screen.getByText('播放源：合成')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Track name'), { target: { value: 'C Jam' } })
    fireEvent.change(screen.getByLabelText('Track key'), { target: { value: 'C' } })
    fireEvent.change(screen.getByLabelText('Track bpm'), { target: { value: '90' } })

    const file = new File(['audio'], 'c-jam.mp3', { type: 'audio/mpeg' })
    fireEvent.change(screen.getByLabelText('Track file'), { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: '导入音轨' }))

    expect(screen.getByText('播放源：实录音轨')).toBeInTheDocument()
    expect(screen.getByText(/自动模式：已匹配实录音轨/)).toBeInTheDocument()
  })
})
