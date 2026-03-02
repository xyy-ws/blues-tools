import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRouter } from './router'

afterEach(() => {
  cleanup()
})

describe('AppRouter', () => {
  it('routes to Home page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '首页 / Home' })).toBeInTheDocument()
  })

  it('routes to Home page from /home', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '首页 / Home' })).toBeInTheDocument()
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
