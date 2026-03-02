import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ChordFretboardPage } from './ChordFretboardPage'

afterEach(() => {
  cleanup()
})

describe('ChordFretboardPage', () => {
  it('updates highlighted frets when chord selection changes', () => {
    const { container } = render(<ChordFretboardPage />)

    const initialHighlights = container.querySelectorAll('[data-chord-highlight="yes"]')
    expect(initialHighlights.length).toBeGreaterThan(0)

    fireEvent.change(screen.getByLabelText('Combined chord root'), { target: { value: 'C' } })

    const changedHighlights = container.querySelectorAll('[data-chord-highlight="yes"]')
    expect(changedHighlights.length).toBeGreaterThan(0)
    expect(screen.getByText('Pattern: x32310')).toBeInTheDocument()
  })

  it('switches fingering variant and updates displayed positions', () => {
    render(<ChordFretboardPage />)

    expect(screen.getByText('Pattern: 020100')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Fingering variant'), { target: { value: '1' } })

    expect(screen.getByText('Pattern: 030200')).toBeInTheDocument()
  })
})
