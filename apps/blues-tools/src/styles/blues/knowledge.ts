export interface KnowledgeCard {
  id: string
  title: string
  content: string
  tags: string[]
}

export const BLUES_KNOWLEDGE_CARDS: KnowledgeCard[] = [
  {
    id: 'call-response',
    title: 'Call and Response',
    content: 'Use call-and-response phrasing over a 12-bar form.',
    tags: ['phrasing', 'form'],
  },
  {
    id: 'blue-notes',
    title: 'Blue Notes',
    content: 'Target the b3 and b5 for blues color.',
    tags: ['notes', 'scale'],
  },
  {
    id: 'turnaround',
    title: 'Turnaround Awareness',
    content: 'Build tension in bars 11-12 and release on bar 1.',
    tags: ['form', 'turnaround'],
  },
]
