import { describe, expect, it } from 'vitest'
import { buildRealTrackId, choosePlaybackSource, resolvePlayback, type RealTrack } from './backing'

const tracks: RealTrack[] = [
  {
    id: 'slow-c',
    name: 'Slow C',
    key: 'C',
    bpm: 90,
    fileName: 'slow-c.mp3',
    fileUrl: 'blob:slow-c',
    fileType: 'audio/mpeg',
    fileSize: 1234,
  },
]

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

describe('resolvePlayback', () => {
  it('reports explicit real mode fallback when no matching track exists', () => {
    const result = resolvePlayback('real', { key: 'E', bpm: 120 }, tracks)
    expect(result).toEqual({ resolved: 'synth', hasMatch: false, mode: 'real' })
  })
})

describe('buildRealTrackId', () => {
  it('builds deterministic id from metadata', () => {
    expect(
      buildRealTrackId({
        name: 'My Jam',
        key: 'A',
        bpm: 100,
        fileName: 'jam.wav',
        fileUrl: 'blob:jam',
        fileType: 'audio/wav',
        fileSize: 10,
      }),
    ).toBe('my-jam-a-100-jam.wav')
  })
})
