import { describe, expect, it } from 'vitest'
import { buildRealTrackId, choosePlaybackSource, type RealTrack } from './backing'

const tracks: RealTrack[] = [{ id: 'slow-c', name: 'Slow C', key: 'C', bpm: 90, fileName: 'slow-c.mp3' }]

describe('choosePlaybackSource', () => {
  it('falls back to synth in auto mode when no matching track exists', () => {
    const source = choosePlaybackSource('auto', { key: 'E', bpm: 120 }, tracks)
    expect(source).toBe('synth')
  })

  it('uses real track in auto mode when a match exists', () => {
    const source = choosePlaybackSource('auto', { key: 'C', bpm: 90 }, tracks)
    expect(source).toBe('real')
  })
})

describe('buildRealTrackId', () => {
  it('builds deterministic id from metadata', () => {
    expect(buildRealTrackId({ name: 'My Jam', key: 'A', bpm: 100, fileName: 'jam.wav' })).toBe(
      'my-jam-a-100-jam.wav',
    )
  })
})
