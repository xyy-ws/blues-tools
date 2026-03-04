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
      expect(screen.getByRole('status')).toHaveTextContent('仅有 1 个通过严格校验的按法')
    }
  })

  it('keeps standard-library-only rendering without approximate fallback badge', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦根音'), { target: { value: 'E' } })

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

  it('keeps selector voicings whose fretted span distance is within 3 frets', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦性质'), { target: { value: '9' } })
    fireEvent.change(screen.getByLabelText('指型来源'), { target: { value: 'curated' } })

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    const patterns = Array.from(voicingSelect.options)
      .map((option) => option.textContent ?? '')
      .map((text) => text.match(/[0-9x]{6}/)?.[0])
      .filter((value): value is string => Boolean(value))

    const span = (pattern: string) => {
      const fretted = pattern
        .split('')
        .filter((value) => value !== 'x')
        .map((value) => Number(value))
        .filter((value) => value > 0)
      if (fretted.length === 0) return 0
      return Math.max(...fretted) - Math.min(...fretted)
    }

    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns.every((pattern) => span(pattern) <= 3)).toBe(true)
    expect(patterns.some((pattern) => pattern === '5x2009')).toBe(false)
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

  it('filters out D7 root-string-5 voicings whose fretted span distance exceeds 3 frets', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦根音'), { target: { value: 'D' } })
    fireEvent.change(screen.getByLabelText('和弦性质'), { target: { value: '7' } })
    fireEvent.change(screen.getByLabelText('根音弦'), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText('指型来源'), { target: { value: 'curated' } })

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    const optionTexts = Array.from(voicingSelect.options).map((option) => option.textContent ?? '')

    expect(optionTexts.some((text) => text.includes('x5x212'))).toBe(false)
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

  it('uses chords-db traceability label for curated selector voicings', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦根音'), { target: { value: 'E' } })
    fireEvent.change(screen.getByLabelText('和弦性质'), { target: { value: 'maj' } })
    fireEvent.change(screen.getByLabelText('指型来源'), { target: { value: 'curated' } })

    const sourcePanel = screen.getByLabelText('指型来源追溯')
    expect(sourcePanel).toHaveTextContent('chords-db 吉他和弦库')
  })

  it('caps default displayed voicing count to top 5', () => {
    render(<ChordFretboardPage />)

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    expect(voicingSelect.options.length).toBeGreaterThan(0)
    expect(voicingSelect.options.length).toBeLessThanOrEqual(5)
  })

  it('shows generated list with dynamic count sorted by score', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('指型来源'), { target: { value: 'generated' } })

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    expect(voicingSelect.options.length).toBeGreaterThan(0)

    const scores: number[] = []
    const sampleCount = Math.min(voicingSelect.options.length, 8)
    for (let i = 0; i < sampleCount; i += 1) {
      fireEvent.change(voicingSelect, { target: { value: String(i) } })
      const scoreText = within(screen.getByLabelText('评分摘要')).getByText(/评分/).textContent ?? ''
      const score = Number(scoreText.replace(/[^0-9.]/g, ''))
      scores.push(score)
    }

    const sorted = [...scores].sort((a, b) => b - a)
    expect(scores).toEqual(sorted)
  })

  it('handles variant counts below 5 without UI break', () => {
    render(<ChordFretboardPage />)

    fireEvent.change(screen.getByLabelText('和弦根音'), { target: { value: 'E' } })
    fireEvent.change(screen.getByLabelText('和弦性质'), { target: { value: 'add9' } })
    fireEvent.change(screen.getByLabelText('指型来源'), { target: { value: 'curated' } })

    const voicingSelect = screen.getByLabelText('按法变体') as HTMLSelectElement
    expect(voicingSelect.options.length).toBeGreaterThan(0)
    expect(voicingSelect.options.length).toBeLessThan(5)
    expect(screen.getByText(/当前按法变体：/)).toHaveTextContent(new RegExp(`变体 1 / ${voicingSelect.options.length}`))
  })

  it('renders string 1 on top and string 6 on bottom', () => {
    render(<ChordFretboardPage />)

    const rows = within(screen.getByLabelText('和弦指板网格')).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('第 1 弦（E）')
    expect(rows.at(-1)).toHaveTextContent('第 6 弦（E）')
  })
})
