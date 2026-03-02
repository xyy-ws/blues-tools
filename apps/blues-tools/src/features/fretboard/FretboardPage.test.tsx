import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FretboardPage } from './FretboardPage'

afterEach(() => {
  cleanup()
})

describe('FretboardPage', () => {
  it('renders string 1 at top and string 6 at bottom', () => {
    render(<FretboardPage />)

    const rows = within(screen.getByLabelText('Fretboard grid')).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('String 1 (E)')
    expect(rows.at(-1)).toHaveTextContent('String 6 (E)')
  })
})
