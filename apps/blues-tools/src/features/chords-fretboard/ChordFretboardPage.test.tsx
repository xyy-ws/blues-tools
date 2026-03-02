import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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
    expect(screen.getByText(/Pattern:/)).toBeInTheDocument()
  })

  it('changes fingering set when root string changes', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('Combined chord root'), { target: { value: 'E' } })
    const patternOn6 = screen.getByText(/Pattern:/).textContent

    fireEvent.change(screen.getByLabelText('Chord root string'), { target: { value: '5' } })
    const patternOn5 = screen.getByText(/Pattern:/).textContent

    expect(patternOn6).not.toEqual(patternOn5)
  })

  it('renders string 1 on top and string 6 on bottom', () => {
    render(<ChordFretboardPage />)

    const rows = within(screen.getByLabelText('Combined fretboard grid')).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('String 1 (E)')
    expect(rows.at(-1)).toHaveTextContent('String 6 (E)')
  })
})
