import { describe, expect, it } from 'vitest'
import { parsePattern, stringifyPattern } from './pattern'

describe('pattern', () => {
  it('keeps legacy compact 6-char parsing for backward compatibility', () => {
    expect(parsePattern('022100')).toEqual([0, 2, 2, 1, 0, 0])
    expect(parsePattern('x022xx')).toEqual([null, 0, 2, 2, null, null])
  })

  it('supports robust delimited format with multi-digit frets and mutes', () => {
    expect(parsePattern('x,10,12,12,10,x')).toEqual([null, 10, 12, 12, 10, null])
    expect(parsePattern('x 10 12 12 10 x')).toEqual([null, 10, 12, 12, 10, null])
  })

  it('stringifies to canonical comma-delimited format for unbounded frets', () => {
    expect(stringifyPattern([null, 10, 12, 12, 10, null])).toBe('x,10,12,12,10,x')
  })
})
