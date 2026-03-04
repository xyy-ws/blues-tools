export interface PracticeLink {
  key: string
  bpm: number
  progression: 'standard-12' | 'quick-change' | 'turnaround'
}

export interface KnowledgeCard {
  id: string
  title: string
  content: string
  tags: string[]
  whereInTwelveBar: string
  commonMistakes: string[]
  relatedLicks: string[]
  practiceLink: PracticeLink
}

export const BLUES_KNOWLEDGE_CARDS: KnowledgeCard[] = [
  {
    id: 'call-response',
    title: '问句与答句',
    content: '在 12 小节结构里，用“先提问、再回答”的句式组织乐句。',
    tags: ['乐句组织', '曲式结构'],
    whereInTwelveBar: '第 1-4 小节与 5-8 小节：先抛出短句，再在下一小节给出回答。',
    commonMistakes: ['每小节都塞满音符，缺少留白。', '问句和答句长度差异过大，听感失衡。'],
    relatedLicks: ['乐句 A', '乐句 B'],
    practiceLink: {
      key: 'A',
      bpm: 84,
      progression: 'standard-12',
    },
  },
  {
    id: 'blue-notes',
    title: '蓝调色彩音',
    content: '重点瞄准 b3 与 b5，让旋律更有蓝调味道。',
    tags: ['音阶音色', '目标音'],
    whereInTwelveBar: '第 1-2 小节与第 9-10 小节，是落在 b3/b5 的常见位置。',
    commonMistakes: ['把色彩音停留过久，缺少回归。', '推弦不到位，音高不准。'],
    relatedLicks: ['乐句 A', '乐句 B'],
    practiceLink: {
      key: 'A',
      bpm: 76,
      progression: 'quick-change',
    },
  },
  {
    id: 'turnaround',
    title: '收尾意识',
    content: '在第 11-12 小节制造张力，并在下一轮第 1 小节顺畅落地。',
    tags: ['曲式结构', '收尾'],
    whereInTwelveBar: '第 11-12 小节先铺垫张力，再在下一轮第 1 小节解决。',
    commonMistakes: ['第 12 小节前过早收句，句子不完整。', '忽略下一轮开头，没有明确落点音。'],
    relatedLicks: ['乐句 B', '乐句 A'],
    practiceLink: {
      key: 'E',
      bpm: 88,
      progression: 'turnaround',
    },
  },
]
