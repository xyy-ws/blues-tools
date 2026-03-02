import type { MusicalKey } from '../../domain/music/types'

export type BackingMode = 'synth' | 'real' | 'auto'

export interface RealTrack {
  id: string
  name: string
  key: MusicalKey
  bpm: number
  fileName: string
}

export interface BackingSelection {
  key: MusicalKey
  bpm: number
}

export function choosePlaybackSource(
  mode: BackingMode,
  selection: BackingSelection,
  tracks: RealTrack[],
): 'synth' | 'real' {
  if (mode === 'synth') {
    return 'synth'
  }

  const hasMatch = tracks.some((track) => track.key === selection.key && track.bpm === selection.bpm)

  if (mode === 'real') {
    return hasMatch ? 'real' : 'synth'
  }

  return hasMatch ? 'real' : 'synth'
}

export function buildRealTrackId(track: Omit<RealTrack, 'id'>): string {
  return `${track.name}-${track.key}-${track.bpm}-${track.fileName}`.toLowerCase().replaceAll(/\s+/g, '-')
}
