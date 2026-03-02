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

    fireEvent.change(screen.getByLabelText('搜索乐句知识'), { target: { value: '蓝调色彩音' } })
    expect(screen.getByRole('heading', { name: '蓝调色彩音' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('筛选标签'), { target: { value: '收尾' } })
    expect(screen.getByText('当前筛选条件下没有匹配卡片。')).toBeInTheDocument()
  })

  it('renders practical training sections and practice actions', () => {
    render(
      <MemoryRouter>
        <KnowledgePage />
      </MemoryRouter>,
    )

    expect(screen.getAllByRole('heading', { name: '今日练习任务' })[0]).toBeInTheDocument()
    expect(screen.getAllByText('适用位置').length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByText('常见错误').length).toBeGreaterThanOrEqual(3)

    const practiceLinks = screen.getAllByRole('link', { name: '立即练习' })
    expect(practiceLinks.length).toBeGreaterThanOrEqual(3)
    expect(practiceLinks[0]).toHaveAttribute('href', expect.stringContaining('/backing?key='))

    expect(screen.getAllByText('乐句 A').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('乐句 B').length).toBeGreaterThanOrEqual(1)
  })
})
