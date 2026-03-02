import { describe, expect, it } from 'vitest'
import { getTwelveBarBluesProgression } from './progression'

describe('getTwelveBarBluesProgression', () => {
  it('builds standard 12-bar form in C', () => {
    const progression = getTwelveBarBluesProgression('C', 'standard-12')

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
    const progression = getTwelveBarBluesProgression('A', 'standard-12')
    expect(progression[4].key).toBe('D')
    expect(progression[8].key).toBe('E')
  })

  it('applies quick-change preset at bar 2 and 12', () => {
    const quick = getTwelveBarBluesProgression('C', 'quick-change').map((bar) => bar.degree)
    expect(quick[1]).toBe('IV')
    expect(quick[11]).toBe('V')
  })

  it('applies turnaround preset ending differently from standard', () => {
    const standard = getTwelveBarBluesProgression('C', 'standard-12').map((bar) => bar.degree)
    const turnaround = getTwelveBarBluesProgression('C', 'turnaround').map((bar) => bar.degree)

    expect(turnaround[11]).toBe('V')
    expect(standard[11]).toBe('I')
  })
})
