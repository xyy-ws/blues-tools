import { describe, expect, it } from 'vitest'
import { bluesStylePack } from '../../styles/blues'
import { ALL_SUBSTYLE_TAG, filterSubstyles } from './substyles'

describe('filterSubstyles', () => {
  it('matches by keyword', () => {
    const result = filterSubstyles(bluesStylePack.substyles, '摇摆', ALL_SUBSTYLE_TAG)
    expect(result.some((style) => style.id === 'chicago-blues')).toBe(true)
  })

  it('matches by tag', () => {
    const result = filterSubstyles(bluesStylePack.substyles, '', '指弹')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('piedmont-blues')
  })
})
