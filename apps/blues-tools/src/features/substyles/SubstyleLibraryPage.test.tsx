import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubstyleLibraryPage } from './SubstyleLibraryPage'

describe('SubstyleLibraryPage', () => {
  it('renders list and detail, and supports search/filter', () => {
    render(<SubstyleLibraryPage />)

    expect(screen.getByRole('heading', { name: '布鲁斯子风格库 / Blues Substyle Library' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /三角洲布鲁斯/i })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search substyles'), { target: { value: 'fingerstyle' } })
    expect(screen.getByRole('button', { name: /皮德蒙特布鲁斯/i })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search substyles'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Filter substyle tag'), { target: { value: 'electric' } })
    expect(screen.getByRole('button', { name: /芝加哥布鲁斯/i })).toBeInTheDocument()
  })
})
