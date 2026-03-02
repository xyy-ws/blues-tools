import { describe, expect, it } from 'vitest'
import { getTwelveBarBluesProgression } from './progression'

describe('getTwelveBarBluesProgression', () => {
  it('builds standard 12-bar form in C', () => {
    const progression = getTwelveBarBluesProgression('C')

    expect(progression).toHaveLength(12)
    expect(progression.map((bar) => `${bar.degree}:${bar.key}`)).toEqual([
      'I:C',
      'I:C',
      'I:C',
      'I:C',
      'IV:F',
      'IV:F',
      'I:C',
      'I:C',
      'V:G',
      'IV:F',
      'I:C',
      'I:C',
    ])
  })

  it('transposes the same form to A', () => {
    const progression = getTwelveBarBluesProgression('A')
    expect(progression[4].key).toBe('D')
    expect(progression[8].key).toBe('E')
  })
})
