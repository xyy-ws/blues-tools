export interface LickStep {
  id: string
  string: number
  fret: number
  beat: number
  durationBeats: number
  frequency: number
}

export interface BluesLick {
  id: string
  name: string
  subtitle: string
  key: string
  position: string
  feel: string
  practiceTip: string
  realDemoUrl?: string
  tabLines: string[]
  steps: LickStep[]
}

export const DEMO_BPM = 84

export const DEMO_LICKS: BluesLick[] = [
  {
    id: 'lick-a',
    name: 'Lick A',
    subtitle: 'Beginner-friendly minor blues phrase',
    key: 'A minor blues',
    position: '5th position',
    feel: 'Straight 8ths',
    practiceTip: 'Keep your fingers close to the strings and focus on even timing.',
    tabLines: [
      'e|----------------5-8-5---|',
      'B|------------5-8-------8-|',
      'G|--------5-7-------------|',
      'D|----5-7-----------------|',
      'A|-5-8--------------------|',
      'E|------------------------|',
    ],
    steps: [
      { id: 'a1', string: 5, fret: 5, beat: 0, durationBeats: 1, frequency: 110 },
      { id: 'a2', string: 5, fret: 8, beat: 1, durationBeats: 1, frequency: 130.81 },
      { id: 'a3', string: 4, fret: 5, beat: 2, durationBeats: 1, frequency: 146.83 },
      { id: 'a4', string: 4, fret: 7, beat: 3, durationBeats: 1, frequency: 164.81 },
      { id: 'a5', string: 3, fret: 5, beat: 4, durationBeats: 1, frequency: 196 },
      { id: 'a6', string: 3, fret: 7, beat: 5, durationBeats: 1, frequency: 220 },
      { id: 'a7', string: 2, fret: 5, beat: 6, durationBeats: 1, frequency: 246.94 },
      { id: 'a8', string: 2, fret: 8, beat: 7, durationBeats: 1, frequency: 293.66 },
      { id: 'a9', string: 1, fret: 5, beat: 8, durationBeats: 1, frequency: 329.63 },
      { id: 'a10', string: 1, fret: 8, beat: 9, durationBeats: 1, frequency: 392 },
      { id: 'a11', string: 1, fret: 5, beat: 10, durationBeats: 1, frequency: 329.63 },
      { id: 'a12', string: 2, fret: 8, beat: 11, durationBeats: 1, frequency: 293.66 },
    ],
    realDemoUrl: '',
  },
  {
    id: 'lick-b',
    name: 'Lick B',
    subtitle: 'Expressive phrase with slide',
    key: 'A minor blues',
    position: '8th position',
    feel: 'Shuffle feel',
    practiceTip: 'On the slide, keep pressure steady and land right on the beat.',
    tabLines: [
      'e|-------------------------|',
      'B|-----------8/10--8------|',
      'G|-------7-9---------9-7--|',
      'D|---7-9----------------9-|',
      'A|-7----------------------|',
      'E|------------------------|',
    ],
    steps: [
      { id: 'b1', string: 5, fret: 7, beat: 0, durationBeats: 1, frequency: 123.47 },
      { id: 'b2', string: 4, fret: 7, beat: 1, durationBeats: 1, frequency: 164.81 },
      { id: 'b3', string: 4, fret: 9, beat: 2, durationBeats: 1, frequency: 185 },
      { id: 'b4', string: 3, fret: 7, beat: 3, durationBeats: 1, frequency: 220 },
      { id: 'b5', string: 3, fret: 9, beat: 4, durationBeats: 1, frequency: 246.94 },
      { id: 'b6', string: 2, fret: 8, beat: 5, durationBeats: 1, frequency: 293.66 },
      { id: 'b7', string: 2, fret: 10, beat: 6, durationBeats: 1, frequency: 329.63 },
      { id: 'b8', string: 2, fret: 8, beat: 7, durationBeats: 1, frequency: 293.66 },
      { id: 'b9', string: 3, fret: 9, beat: 8, durationBeats: 1, frequency: 246.94 },
      { id: 'b10', string: 3, fret: 7, beat: 9, durationBeats: 1, frequency: 220 },
      { id: 'b11', string: 4, fret: 9, beat: 10, durationBeats: 1, frequency: 185 },
    ],
    realDemoUrl: '',
  },
]
