import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BackingPage } from './BackingPage'

afterEach(() => {
  cleanup()
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
})
