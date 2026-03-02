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

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    expect(screen.getByText(/Current bar:\s*1/)).toBeInTheDocument()
    expect(screen.getByText('Stopped')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByText('Playing')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByText('Paused')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByText('Stopped')).toBeInTheDocument()
    expect(screen.getByText(/Current bar:\s*1/)).toBeInTheDocument()
  })

  it('advances beat indicator while playing', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    vi.advanceTimersByTime(1000)

    expect(screen.getByLabelText('1-2-3-4 beat indicator')).toBeInTheDocument()
    expect(screen.getByText(/当前拍 \/ Beat:/)).toBeInTheDocument()
  })

  it('uses synth in auto mode when there is no matching real track and real when matched', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:c-jam')

    renderPage()

    expect(screen.getByText('Playback source: Synth')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Track name'), { target: { value: 'C Jam' } })
    fireEvent.change(screen.getByLabelText('Track key'), { target: { value: 'C' } })
    fireEvent.change(screen.getByLabelText('Track bpm'), { target: { value: '90' } })

    const file = new File(['audio'], 'c-jam.mp3', { type: 'audio/mpeg' })
    fireEvent.change(screen.getByLabelText('Track file'), { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: 'Import Track' }))

    expect(screen.getByText('Playback source: Real Track')).toBeInTheDocument()
    expect(screen.getByText(/自动模式：已匹配实录音轨/)).toBeInTheDocument()
  })
})
