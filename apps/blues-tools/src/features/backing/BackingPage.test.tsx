import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BackingPage } from './BackingPage'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('BackingPage', () => {
  it('uses synth in auto mode when there is no matching real track and real when matched', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:c-jam')

    render(<BackingPage />)

    expect(screen.getByText('Playback source: Synth')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Track name'), { target: { value: 'C Jam' } })
    fireEvent.change(screen.getByLabelText('Track key'), { target: { value: 'C' } })
    fireEvent.change(screen.getByLabelText('Track bpm'), { target: { value: '90' } })

    const file = new File(['audio'], 'c-jam.mp3', { type: 'audio/mpeg' })
    fireEvent.change(screen.getByLabelText('Track file'), { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: 'Import Track' }))

    expect(screen.getByText('Playback source: Real Track')).toBeInTheDocument()
  })

  it('imports selected local audio file and allows deleting track', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:slow-c')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    render(<BackingPage />)

    fireEvent.change(screen.getByLabelText('Track name'), { target: { value: 'Slow C Jam' } })
    fireEvent.change(screen.getByLabelText('Track key'), { target: { value: 'C' } })
    fireEvent.change(screen.getByLabelText('Track bpm'), { target: { value: '90' } })

    const file = new File(['blobdata'], 'slow-c.mp3', { type: 'audio/mpeg' })
    fireEvent.change(screen.getByLabelText('Track file'), { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: 'Import Track' }))

    expect(screen.getByText(/Slow C Jam - C @ 90 BPM/)).toBeInTheDocument()
    expect(screen.getByText(/slow-c\.mp3, audio\/mpeg, 8 bytes/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText('No tracks imported yet.')).toBeInTheDocument()
    expect(revokeSpy).toHaveBeenCalledWith('blob:slow-c')
  })

  it('applies selected progression preset to displayed bar timeline', () => {
    render(<BackingPage />)

    expect(screen.getByText('Bar 2 chord: I')).toBeInTheDocument()
    expect(screen.getByText('Bar 12 chord: I')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Progression preset'), { target: { value: 'quick-change' } })
    expect(screen.getByText('Bar 2 chord: IV')).toBeInTheDocument()
    expect(screen.getByText('Bar 12 chord: V')).toBeInTheDocument()
  })

  it('restores persisted backing settings and track metadata from localStorage', () => {
    localStorage.setItem(
      'blues-tools:state:v1',
      JSON.stringify({
        selectedKey: 'G',
        bpm: 110,
        preset: 'quick-change',
        mode: 'real',
        tracks: [
          {
            id: 'g-track',
            name: 'G Shuffle',
            key: 'G',
            bpm: 110,
            fileName: 'g-shuffle.mp3',
            fileType: 'audio/mpeg',
            fileSize: 1234,
          },
        ],
      }),
    )

    render(<BackingPage />)

    expect(screen.getByLabelText('Key', { selector: 'select[aria-label="Key"]' })).toHaveValue('G')
    expect(screen.getByLabelText('BPM', { selector: 'input[aria-label="BPM"]' })).toHaveValue(110)
    expect(screen.getByLabelText('Progression preset')).toHaveValue('quick-change')
    expect(screen.getByText(/G Shuffle - G @ 110 BPM/)).toBeInTheDocument()
    expect(screen.getByText(/需重新选择本地文件以播放/)).toBeInTheDocument()
  })

  it('persists selected settings when controls are updated', () => {
    render(<BackingPage />)

    fireEvent.change(screen.getByLabelText('Key', { selector: 'select[aria-label="Key"]' }), { target: { value: 'D' } })
    fireEvent.change(screen.getByLabelText('BPM', { selector: 'input[aria-label="BPM"]' }), { target: { value: '120' } })
    fireEvent.change(screen.getByLabelText('Progression preset'), { target: { value: 'turnaround' } })
    fireEvent.click(screen.getByLabelText('实录 / Real Track'))

    const persisted = JSON.parse(localStorage.getItem('blues-tools:state:v1') ?? '{}')
    expect(persisted.selectedKey).toBe('D')
    expect(persisted.bpm).toBe(120)
    expect(persisted.preset).toBe('turnaround')
    expect(persisted.mode).toBe('real')
  })
})
