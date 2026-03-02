import { getTwelveBarBluesProgression } from '../../domain/music/progression'
import type { MusicalKey } from '../../domain/music/types'
import { BLUES_KNOWLEDGE_CARDS } from './knowledge'
import { BLUES_RHYTHM_PRESETS } from './rhythms'

export const bluesStylePack = {
  id: 'blues',
  name: 'Blues',
  rhythms: BLUES_RHYTHM_PRESETS,
  knowledgeCards: BLUES_KNOWLEDGE_CARDS,
  progressionFor: (key: MusicalKey) => getTwelveBarBluesProgression(key),
}
