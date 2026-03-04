import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KnowledgePage } from './KnowledgePage'

vi.mock('./LicksDemoSection', () => ({
  LicksDemoSection: () => null,
}))

vi.mock('../../styles/blues', () => ({
  bluesStylePack: {
    knowledgeCards: [
      {
        id: 'card-a',
        title: '蓝调色彩音',
        content: 'b3 与 b5 的色彩使用',
        tags: ['音色', '问答'],
        whereInTwelveBar: '第 1-4 小节',
        commonMistakes: ['音高不准'],
        relatedLicks: ['乐句 A'],
        practiceLink: { key: 'C', bpm: 90, progression: 'standard-12' },
      },
      {
        id: 'card-b',
        title: '收尾句构建',
        content: '11-12 小节收尾思路',
        tags: ['收尾'],
        whereInTwelveBar: '第 11-12 小节',
        commonMistakes: ['节奏拖沓'],
        relatedLicks: ['乐句 B'],
        practiceLink: { key: 'G', bpm: 96, progression: 'turnaround' },
      },
      {
        id: 'card-c',
        title: '问答句结构',
        content: '呼应与停顿',
        tags: ['问答'],
        whereInTwelveBar: '全段',
        commonMistakes: ['没有留白'],
        relatedLicks: ['乐句 C'],
        practiceLink: { key: 'A', bpm: 100, progression: 'quick-change' },
      },
    ],
  },
}))

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
