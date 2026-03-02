import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRouter } from './router'

describe('AppRouter', () => {
  it('routes to Backing page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Backing' })).toBeInTheDocument()
  })

  it('routes to Knowledge page', () => {
    render(
      <MemoryRouter initialEntries={['/knowledge']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Knowledge' })).toBeInTheDocument()
  })
})
