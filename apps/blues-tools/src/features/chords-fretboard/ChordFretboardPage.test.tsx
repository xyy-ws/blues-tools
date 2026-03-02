import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ChordFretboardPage } from './ChordFretboardPage'

afterEach(() => {
  cleanup()
})

describe('ChordFretboardPage', () => {
  it('updates displayed pattern when chord selection changes', () => {
    render(<ChordFretboardPage />)

    const patternBefore = screen.getByText(/Pattern:/).textContent
    fireEvent.change(screen.getByLabelText('Combined chord root'), { target: { value: 'C' } })
    const patternAfter = screen.getByText(/Pattern:/).textContent

    expect(patternAfter).not.toEqual(patternBefore)
  })

  it('supports fret range switch and tone legend metadata', () => {
    const { container } = render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('Fret range'), { target: { value: '0-12' } })

    expect(container.querySelector('[data-tone-type="root"]')).toBeInTheDocument()
    expect(container.querySelector('td')?.textContent).toContain('0:')
    expect(screen.getByText('Legend / 图例')).toBeInTheDocument()
    expect(screen.getByLabelText('Fingering hint')).toBeInTheDocument()
  })

  it('renders string 1 on top and string 6 on bottom', () => {
    render(<ChordFretboardPage />)

    const rows = within(screen.getByLabelText('Combined fretboard grid')).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('String 1 (E)')
    expect(rows.at(-1)).toHaveTextContent('String 6 (E)')
  })
})
