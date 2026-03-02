import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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

  it('routes to Blues Home page from /home', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '布鲁斯主页 / Blues Home' })).toBeInTheDocument()
  })

  it('navigates from home Blues selection to style sub-home', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: '布鲁斯 / Blues' }))

    expect(screen.getByRole('heading', { name: '布鲁斯主页 / Blues Home' })).toBeInTheDocument()
  })

  it('resolves Blues card href and navigation correctly with basename', () => {
    render(
      <MemoryRouter basename="/blues" initialEntries={['/blues/']}>
        <AppRouter />
      </MemoryRouter>,
    )

    const bluesCardLink = screen.getByRole('link', { name: '布鲁斯 / Blues' })
    expect(bluesCardLink).toHaveAttribute('href', '/blues/home')

    fireEvent.click(bluesCardLink)
    expect(screen.getByRole('heading', { name: '布鲁斯主页 / Blues Home' })).toBeInTheDocument()
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
