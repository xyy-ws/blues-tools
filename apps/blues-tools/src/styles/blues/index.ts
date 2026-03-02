import { getTwelveBarBluesProgression } from '../../domain/music/progression'
import type { MusicalKey } from '../../domain/music/types'
import { BLUES_KNOWLEDGE_CARDS } from './knowledge'
import { BLUES_RHYTHM_PRESETS } from './rhythms'
import { BLUES_SUBSTYLE_LIBRARY } from './substyles'

export const bluesStylePack = {
  id: 'blues',
  name: 'Blues',
  rhythms: BLUES_RHYTHM_PRESETS,
  knowledgeCards: BLUES_KNOWLEDGE_CARDS,
  substyles: BLUES_SUBSTYLE_LIBRARY,
  progressionFor: (key: MusicalKey) => getTwelveBarBluesProgression(key),
}
