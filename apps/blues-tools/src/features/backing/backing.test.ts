import { describe, expect, it } from 'vitest'
import { buildRealTrackId, choosePlaybackSource, findBestRealTrack, resolvePlayback, type RealTrack } from './backing'

const tracks: RealTrack[] = [
  {
    id: 'slow-c',
    name: 'Slow C',
    grooveId: 'slow-shuffle',
    key: 'C',
    bpm: 68,
    fileName: 'slow-c.mp3',
    fileUrl: 'blob:slow-c',
    fileType: 'audio/mpeg',
    fileSize: 1234,
  },
]

describe('choosePlaybackSource', () => {
  it('falls back to synth in auto mode when no matching groove/key track exists', () => {
    const source = choosePlaybackSource('auto', { grooveId: 'texas-straight', key: 'E', bpm: 108 }, tracks)
    expect(source).toBe('synth')
  })

  it('uses real track in auto mode when a match exists', () => {
    const source = choosePlaybackSource('auto', { grooveId: 'slow-shuffle', key: 'C', bpm: 68 }, tracks)
    expect(source).toBe('real')
  })
})

describe('resolvePlayback', () => {
  it('reports explicit real mode fallback when no matching track exists', () => {
    const result = resolvePlayback('real', { grooveId: 'chicago-shuffle', key: 'A', bpm: 98 }, tracks)
    expect(result).toMatchObject({ resolved: 'synth', hasMatch: false, mode: 'real' })
  })

  it('supports near bpm matching within tolerance', () => {
    const result = findBestRealTrack({ grooveId: 'slow-shuffle', key: 'C', bpm: 72 }, tracks)
    expect(result?.id).toBe('slow-c')
  })
})

describe('buildRealTrackId', () => {
  it('builds deterministic id from metadata', () => {
    expect(
      buildRealTrackId({
        name: 'My Jam',
        grooveId: 'texas-straight',
        key: 'A',
        bpm: 100,
        fileName: 'jam.wav',
        fileUrl: 'blob:jam',
        fileType: 'audio/wav',
        fileSize: 10,
      }),
    ).toBe('my-jam-texas-straight-a-100-jam.wav')
  })
})
