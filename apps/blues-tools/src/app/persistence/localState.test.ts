import { describe, expect, it } from 'vitest'
import { loadState, saveState, toHydratedTracks, toPersistedTracks, type PersistedState } from './localState'

describe('localState persistence', () => {
  it('saves and loads state from localStorage', () => {
    const state: PersistedState = {
      selectedKey: 'C',
      bpm: 90,
      preset: 'standard-12',
      mode: 'auto',
      tracks: [],
      improvKey: 'E',
      improvPreset: 'turnaround',
      fretboardKey: 'A',
    }

    saveState(state)
    expect(loadState()).toEqual(state)
  })

  it('returns null for malformed data', () => {
    localStorage.setItem('blues-tools:state:v1', '{bad-json')
    expect(loadState()).toBeNull()
  })

  it('serializes and hydrates tracks without object URLs', () => {
    const persisted = toPersistedTracks([
      {
        id: 'x1',
        name: 'Jam',
        key: 'A',
        bpm: 95,
        fileName: 'jam.mp3',
        fileUrl: 'blob:jam',
        fileType: 'audio/mpeg',
        fileSize: 100,
      },
    ])

    expect(persisted[0]).not.toHaveProperty('fileUrl')

    const hydrated = toHydratedTracks(persisted)
    expect(hydrated[0].fileUrl).toBe('')
    expect(hydrated[0].name).toBe('Jam')
  })
})
