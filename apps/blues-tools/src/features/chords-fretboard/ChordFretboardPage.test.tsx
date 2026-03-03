import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ChordFretboardPage } from './ChordFretboardPage'

afterEach(() => {
  cleanup()
})

describe('ChordFretboardPage', () => {
  it('updates displayed pattern when inversion changes to another standard inversion', () => {
    render(<ChordFretboardPage />)

    const before = screen.getByText(/当前按法变体：/).textContent
    fireEvent.change(screen.getByLabelText('转位'), { target: { value: '1' } })
    const after = screen.getByText(/当前按法变体：/).textContent

    expect(after).not.toEqual(before)
  })

  it('shows multiple standard voicing variants when available', () => {
    render(<ChordFretboardPage />)

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    expect(voicingSelect.disabled).toBe(false)
    expect(voicingSelect.options.length).toBeGreaterThanOrEqual(2)

    const before = screen.getByText(/当前按法变体：/).textContent
    fireEvent.change(voicingSelect, { target: { value: '1' } })
    const after = screen.getByText(/当前按法变体：/).textContent

    expect(after).not.toEqual(before)
  })

  it('shows empty state for unsupported standard combo and hides approximate fallback badge', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦根音'), { target: { value: 'B' } })

    const qualitySelect = screen.getByLabelText('和弦性质') as HTMLSelectElement
    fireEvent.change(qualitySelect, { target: { value: '9' } })

    expect(screen.getByRole('alert')).toHaveTextContent('该组合暂无标准指型')
    expect(screen.queryByText('近似指型')).not.toBeInTheDocument()
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

  it('shows shape-level source traceability metadata for selected standard fingering', () => {
    render(<ChordFretboardPage />)

    const sourcePanel = screen.getByLabelText('指型来源追溯')
    expect(sourcePanel).toHaveTextContent('来源名称：')
    expect(sourcePanel).toHaveTextContent('来源类型：')
    expect(sourcePanel).toHaveTextContent('可信度等级：')
    expect(sourcePanel).toHaveTextContent('校验状态：')
  })

  it('renders string 1 on top and string 6 on bottom', () => {
    render(<ChordFretboardPage />)

    const rows = within(screen.getByLabelText('和弦指板网格')).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('第 1 弦（E）')
    expect(rows.at(-1)).toHaveTextContent('第 6 弦（E）')
  })
})
