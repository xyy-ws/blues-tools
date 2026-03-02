import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnowledgePage } from './KnowledgePage'

describe('KnowledgePage', () => {
  it('filters cards by query and tag', () => {
    render(<KnowledgePage />)

    fireEvent.change(screen.getByLabelText('Search knowledge'), { target: { value: 'blue notes' } })
    expect(screen.getByRole('heading', { name: 'Blue Notes' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Filter tag'), { target: { value: 'turnaround' } })
    expect(screen.getByText('No cards matched your filters.')).toBeInTheDocument()
  })
})
