import { describe, expect, it } from 'vitest'
import {
  SUPPORTED_METERS,
  buildRealTrackId,
  choosePlaybackSource,
  findBestRealTrack,
  getMeterBeatIntervalMs,
  getMeterProfile,
  isAccentedBeat,
  resolvePlayback,
  type RealTrack,
} from './backing'

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

describe('meter profiles', () => {
  it('includes the common v1 meter list', () => {
    expect(SUPPORTED_METERS).toEqual(['2/4', '3/4', '4/4', '6/8', '12/8'])
  })

  it('falls back to 4/4 when meter is missing', () => {
    expect(getMeterProfile(undefined).signature).toBe('4/4')
  })

  it('maps accent groups for compound meters', () => {
    expect(isAccentedBeat('6/8', 1)).toBe(true)
    expect(isAccentedBeat('6/8', 4)).toBe(true)
    expect(isAccentedBeat('6/8', 3)).toBe(false)

    expect(isAccentedBeat('12/8', 1)).toBe(true)
    expect(isAccentedBeat('12/8', 4)).toBe(true)
    expect(isAccentedBeat('12/8', 7)).toBe(true)
    expect(isAccentedBeat('12/8', 10)).toBe(true)
    expect(isAccentedBeat('12/8', 11)).toBe(false)
  })

  it('changes beat interval by beat unit while keeping 4/4 legacy feel', () => {
    expect(getMeterBeatIntervalMs(120, '4/4')).toBe(375)
    expect(getMeterBeatIntervalMs(120, '6/8')).toBe(188)
  })
})

describe('meter support', () => {
  it('maps supported meters to proper beats and accents', () => {
    expect(getMeterProfile('2/4')).toMatchObject({ beatsPerBar: 2, beatUnit: 4, accentBeats: [1] })
    expect(getMeterProfile('3/4')).toMatchObject({ beatsPerBar: 3, beatUnit: 4, accentBeats: [1] })
    expect(getMeterProfile('4/4')).toMatchObject({ beatsPerBar: 4, beatUnit: 4, accentBeats: [1, 3] })
    expect(getMeterProfile('6/8')).toMatchObject({ beatsPerBar: 6, beatUnit: 8, accentBeats: [1, 4] })
    expect(getMeterProfile('12/8')).toMatchObject({ beatsPerBar: 12, beatUnit: 8, accentBeats: [1, 4, 7, 10] })
  })

  it('falls back to 4/4 for missing meter and keeps legacy beat interval', () => {
    expect(getMeterProfile(undefined).signature).toBe('4/4')
    expect(getMeterBeatIntervalMs(120, '4/4')).toBe(375)
    expect(getMeterBeatIntervalMs(120, undefined)).toBe(375)
  })

  it('computes accent grouping for compound meters', () => {
    expect(isAccentedBeat('6/8', 1)).toBe(true)
    expect(isAccentedBeat('6/8', 4)).toBe(true)
    expect(isAccentedBeat('6/8', 2)).toBe(false)
    expect(isAccentedBeat('12/8', 10)).toBe(true)
  })
})
