import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { KnowledgePage } from './KnowledgePage'

afterEach(() => {
  cleanup()
})

describe('KnowledgePage', () => {
  it('filters cards by query and tag', () => {
    render(
      <MemoryRouter>
        <KnowledgePage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Search knowledge'), { target: { value: 'blue notes' } })
    expect(screen.getByRole('heading', { name: 'Blue Notes' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Filter tag'), { target: { value: 'turnaround' } })
    expect(screen.getByText('No cards matched your filters.')).toBeInTheDocument()
  })

  it('renders practical training sections and practice actions', () => {
    render(
      <MemoryRouter>
        <KnowledgePage />
      </MemoryRouter>,
    )

    expect(screen.getAllByRole('heading', { name: '今日练习任务 / Today practice' })[0]).toBeInTheDocument()
    expect(screen.getAllByText(/什么时候用 \/ Where in 12-bar/).length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByText(/常见错误 \/ Common mistakes/).length).toBeGreaterThanOrEqual(3)

    const practiceLinks = screen.getAllByRole('link', { name: '立即练习 / Practice now' })
    expect(practiceLinks.length).toBeGreaterThanOrEqual(3)
    expect(practiceLinks[0]).toHaveAttribute('href', expect.stringContaining('/backing?key='))

    expect(screen.getAllByText('Lick A').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Lick B').length).toBeGreaterThanOrEqual(1)
  })
})
