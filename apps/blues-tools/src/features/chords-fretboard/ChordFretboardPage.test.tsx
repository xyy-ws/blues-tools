import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ChordFretboardPage } from './ChordFretboardPage'

afterEach(() => {
  cleanup()
})

describe('ChordFretboardPage', () => {
  it('updates displayed pattern when inversion changes', () => {
    render(<ChordFretboardPage />)

    const before = screen.getByText(/当前按法变体：/).textContent
    fireEvent.change(screen.getByLabelText('转位'), { target: { value: '1' } })
    const after = screen.getByText(/当前按法变体：/).textContent

    expect(after).not.toEqual(before)
  })

  it('offers multiple voicing variants and updates displayed pattern when voicing changes', () => {
    render(<ChordFretboardPage />)

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    expect(voicingSelect.disabled).toBe(false)
    expect(voicingSelect.options.length).toBeGreaterThanOrEqual(2)

    const before = screen.getByText(/当前按法变体：/).textContent
    fireEvent.change(voicingSelect, { target: { value: '1' } })
    const after = screen.getByText(/当前按法变体：/).textContent

    expect(after).not.toEqual(before)
  })

  it('highlights only fingering positions and keeps tone types inside highlighted notes', () => {
    const { container } = render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('指板范围'), { target: { value: '0-12' } })

    const highlightedCells = container.querySelectorAll('[data-chord-highlight="yes"]')
    const typedCells = container.querySelectorAll('[data-tone-type]')
    const nonHighlightCells = Array.from(container.querySelectorAll('td')).filter((cell) => !cell.hasAttribute('data-chord-highlight'))

    expect(highlightedCells.length).toBeGreaterThan(0)
    expect(typedCells.length).toBe(highlightedCells.length)
    expect(container.querySelector('[data-chord-highlight="no"]')).not.toBeInTheDocument()
    expect(nonHighlightCells.length).toBeGreaterThan(0)
    expect(nonHighlightCells.every((cell) => !cell.hasAttribute('data-tone-type'))).toBe(true)

    expect(container.querySelector('[data-chord-highlight="yes"][data-tone-type="root"]')).toBeInTheDocument()
    expect(container.querySelector('[data-chord-highlight="yes"][data-tone-type="chord-tone"]')).toBeInTheDocument()

    expect(container.querySelector('td')?.textContent).toContain('0:')
    expect(screen.getByText('图例')).toBeInTheDocument()
    expect(screen.getByLabelText('按法建议')).toBeInTheDocument()
  })

  it('shows source/confidence metadata for selected fingering', () => {
    render(<ChordFretboardPage />)

    expect(screen.getByLabelText('指型来源')).toHaveTextContent('来源：')
    expect(screen.getByLabelText('指型来源')).toHaveTextContent('可信度：')
  })

  it('marks approximate fallback voicing clearly', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦根音'), { target: { value: 'C' } })
    fireEvent.change(screen.getByLabelText('和弦性质'), { target: { value: '9' } })

    expect(screen.getByText('近似指型')).toBeInTheDocument()
  })

  it('renders string 1 on top and string 6 on bottom', () => {
    render(<ChordFretboardPage />)

    const rows = within(screen.getByLabelText('和弦指板网格')).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('第 1 弦（E）')
    expect(rows.at(-1)).toHaveTextContent('第 6 弦（E）')
  })
})
