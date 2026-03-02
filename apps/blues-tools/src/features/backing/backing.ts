import type { MusicalKey } from '../../domain/music/types'

export type BackingMode = 'synth' | 'real' | 'auto'

export interface RealTrack {
  id: string
  name: string
  key: MusicalKey
  bpm: number
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

export interface BackingSelection {
  key: MusicalKey
  bpm: number
}

export interface PlaybackResolution {
  resolved: 'synth' | 'real'
  hasMatch: boolean
  mode: BackingMode
}

export function resolvePlayback(mode: BackingMode, selection: BackingSelection, tracks: RealTrack[]): PlaybackResolution {
  if (mode === 'synth') {
    return { resolved: 'synth', hasMatch: false, mode }
  }

  const hasMatch = tracks.some((track) => track.key === selection.key && track.bpm === selection.bpm)

  if (mode === 'real') {
    return { resolved: hasMatch ? 'real' : 'synth', hasMatch, mode }
  }

  return { resolved: hasMatch ? 'real' : 'synth', hasMatch, mode }
}

export function choosePlaybackSource(
  mode: BackingMode,
  selection: BackingSelection,
  tracks: RealTrack[],
): 'synth' | 'real' {
  return resolvePlayback(mode, selection, tracks).resolved
}

export function buildRealTrackId(track: Omit<RealTrack, 'id'>): string {
  return `${track.name}-${track.key}-${track.bpm}-${track.fileName}`.toLowerCase().replaceAll(/\s+/g, '-')
}
