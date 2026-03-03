import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ChordFretboardPage } from './ChordFretboardPage'

afterEach(() => {
  cleanup()
})

describe('ChordFretboardPage', () => {
  it('keeps inversion control constrained to available validated inversions', () => {
    render(<ChordFretboardPage />)

    const inversionSelect = screen.getByLabelText('转位') as HTMLSelectElement
    expect(inversionSelect.options.length).toBeGreaterThan(0)
    expect(Array.from(inversionSelect.options).every((option) => option.value !== '')).toBe(true)
  })

  it('renders validated standard voicing selector state', () => {
    render(<ChordFretboardPage />)

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    expect(voicingSelect.options.length).toBeGreaterThanOrEqual(1)

    if (voicingSelect.options.length >= 2) {
      const before = screen.getByText(/当前按法变体：/).textContent
      fireEvent.change(voicingSelect, { target: { value: '1' } })
      const after = screen.getByText(/当前按法变体：/).textContent
      expect(after).not.toEqual(before)
    } else {
      expect(voicingSelect.disabled).toBe(true)
      expect(screen.getByRole('status')).toHaveTextContent('仅有 1 个可用按法变体')
    }
  })

  it('keeps standard-library-only rendering without approximate fallback badge', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦根音'), { target: { value: 'B' } })

    const qualitySelect = screen.getByLabelText('和弦性质') as HTMLSelectElement
    fireEvent.change(qualitySelect, { target: { value: '9' } })

    expect(screen.queryByText('近似指型')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText(/当前按法变体：/)).toBeInTheDocument()
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

  it('keeps practical compact dominant voicings in selector and excludes blocked garbage', () => {
    render(<ChordFretboardPage />)

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    const optionTexts = Array.from(voicingSelect.options).map((option) => option.textContent ?? '')

    expect(optionTexts.some((text) => text.includes('0xx137'))).toBe(true)
    expect(optionTexts.some((text) => text.includes('5x2009'))).toBe(false)
  })

  it('keeps common strummable E major shape visible and usable', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦性质'), { target: { value: 'maj' } })
    fireEvent.change(screen.getByLabelText('指型来源'), { target: { value: 'curated' } })

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    const optionTexts = Array.from(voicingSelect.options).map((option) => option.textContent ?? '')

    expect(optionTexts.some((text) => text.includes('022100'))).toBe(true)
    expect(screen.getByText(/当前按法变体：/)).toHaveTextContent('022100')
  })

  it('shows shape-level source traceability metadata for selected standard fingering', () => {
    render(<ChordFretboardPage />)
    fireEvent.change(screen.getByLabelText('指型来源'), { target: { value: 'curated' } })

    const sourcePanel = screen.getByLabelText('指型来源追溯')
    expect(sourcePanel).toHaveTextContent('来源名称：')
    expect(sourcePanel).toHaveTextContent('来源类型：')
    expect(sourcePanel).toHaveTextContent('可信度等级：')
    expect(sourcePanel).toHaveTextContent('校验状态：')
  })

  it('shows generated top list with 3-5 items sorted by score', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('指型来源'), { target: { value: 'generated' } })

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    expect(voicingSelect.options.length).toBeGreaterThanOrEqual(3)
    expect(voicingSelect.options.length).toBeLessThanOrEqual(5)

    const scores: number[] = []
    for (let i = 0; i < voicingSelect.options.length; i += 1) {
      fireEvent.change(voicingSelect, { target: { value: String(i) } })
      const scoreText = within(screen.getByLabelText('评分摘要')).getByText(/评分/).textContent ?? ''
      const score = Number(scoreText.replace(/[^0-9.]/g, ''))
      scores.push(score)
    }

    const sorted = [...scores].sort((a, b) => b - a)
    expect(scores).toEqual(sorted)
  })

  it('renders string 1 on top and string 6 on bottom', () => {
    render(<ChordFretboardPage />)

    const rows = within(screen.getByLabelText('和弦指板网格')).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('第 1 弦（E）')
    expect(rows.at(-1)).toHaveTextContent('第 6 弦（E）')
  })
})
