import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubstyleLibraryPage } from './SubstyleLibraryPage'

describe('SubstyleLibraryPage', () => {
  it('renders list and detail, and supports search/filter', () => {
    render(<SubstyleLibraryPage />)

    expect(screen.getByRole('heading', { name: '布鲁斯子风格库' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /三角洲布鲁斯/i })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('搜索子风格'), { target: { value: 'fingerstyle' } })
    expect(screen.getByRole('button', { name: /皮德蒙特布鲁斯/i })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('搜索子风格'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('筛选子风格标签'), { target: { value: 'electric' } })
    expect(screen.getByRole('button', { name: /芝加哥布鲁斯/i })).toBeInTheDocument()
  })
})
