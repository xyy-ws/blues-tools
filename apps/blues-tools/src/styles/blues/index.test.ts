import { describe, expect, it } from 'vitest'
import { bluesStylePack } from './index'

describe('bluesStylePack', () => {
  it('has basic metadata and content scaffolding', () => {
    expect(bluesStylePack.id).toBe('blues')
    expect(bluesStylePack.name).toBe('Blues')
    expect(bluesStylePack.rhythms.length).toBeGreaterThan(0)
    expect(bluesStylePack.knowledgeCards.length).toBeGreaterThan(0)
  })

  it('exposes progression builder', () => {
    const progression = bluesStylePack.progressionFor('E')
    expect(progression).toHaveLength(12)
    expect(progression[0].key).toBe('E')
  })
})
