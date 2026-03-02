import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BackingPage } from './BackingPage'

describe('BackingPage', () => {
  it('uses synth in auto mode when there is no matching real track and real when matched', () => {
    render(<BackingPage />)

    expect(screen.getByText('Playback source: Synth')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Track name'), { target: { value: 'C Jam' } })
    fireEvent.change(screen.getByLabelText('Track key'), { target: { value: 'C' } })
    fireEvent.change(screen.getByLabelText('Track bpm'), { target: { value: '90' } })
    fireEvent.change(screen.getByLabelText('Track file'), { target: { value: 'c-jam.mp3' } })

    fireEvent.click(screen.getByRole('button', { name: 'Import Track' }))

    expect(screen.getByText('Playback source: Real Track')).toBeInTheDocument()
  })
})
