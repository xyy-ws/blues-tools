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
    title: 'Call and Response',
    content: 'Use call-and-response phrasing over a 12-bar form.',
    tags: ['phrasing', 'form'],
    whereInTwelveBar: 'Bars 1-4 and 5-8: ask a short phrase, then answer it in the next bar.',
    commonMistakes: [
      '每小节都塞满音符 / Overplaying every bar with no space.',
      '问答长度不均衡 / Call and response phrases with mismatched lengths.',
    ],
    relatedLicks: ['Lick A', 'Lick B'],
    practiceLink: {
      key: 'A',
      bpm: 84,
      progression: 'standard-12',
    },
  },
  {
    id: 'blue-notes',
    title: 'Blue Notes',
    content: 'Target the b3 and b5 for blues color.',
    tags: ['notes', 'scale'],
    whereInTwelveBar: 'Bars 1-2 and bars 9-10 are strong spots to land on b3/b5 for color.',
    commonMistakes: [
      '把蓝调音当作长期停留点 / Sitting too long on blue notes without resolving.',
      '音准和推弦不到位 / Bends not landing in tune.',
    ],
    relatedLicks: ['Lick A', 'Lick B'],
    practiceLink: {
      key: 'A',
      bpm: 76,
      progression: 'quick-change',
    },
  },
  {
    id: 'turnaround',
    title: 'Turnaround Awareness',
    content: 'Build tension in bars 11-12 and release on bar 1.',
    tags: ['form', 'turnaround'],
    whereInTwelveBar: 'Bars 11-12: set up tension, then resolve on bar 1 of next chorus.',
    commonMistakes: [
      '提前结束句子 / Ending phrases too early before bar 12.',
      '忽略下一轮开头 / Not targeting a clear landing note on bar 1.',
    ],
    relatedLicks: ['Lick B', 'Lick A'],
    practiceLink: {
      key: 'E',
      bpm: 88,
      progression: 'turnaround',
    },
  },
]
