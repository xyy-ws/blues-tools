import { describe, expect, it } from 'vitest'
import { getCurrentBarIndex, getCurrentChordLabel } from './improv'

describe('improv helpers', () => {
  it('calculates current bar index', () => {
    expect(getCurrentBarIndex(0)).toBe(0)
    expect(getCurrentBarIndex(16)).toBe(4)
    expect(getCurrentBarIndex(48)).toBe(0)
  })

  it('returns current chord label for time point', () => {
    expect(getCurrentChordLabel('C', 0)).toBe('I (C)')
    expect(getCurrentChordLabel('C', 32)).toBe('V (G)')
  })

  it('uses preset-specific timeline for chord label', () => {
    expect(getCurrentChordLabel('C', 4, 'standard-12')).toBe('I (C)')
    expect(getCurrentChordLabel('C', 4, 'quick-change')).toBe('IV (F)')
    expect(getCurrentChordLabel('C', 44, 'turnaround')).toBe('V (G)')
  })
})
