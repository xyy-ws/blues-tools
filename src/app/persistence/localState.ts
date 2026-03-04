import type { MusicalKey, ProgressionPreset } from '../../domain/music/types'
import type { BackingMode, GrooveId, RealTrack } from '../../features/backing/backing'

const STORAGE_KEY = 'blues-tools:state:v1'

export interface PersistedTrackMetadata {
  id: string
  name: string
  grooveId: GrooveId
  key: MusicalKey
  bpm: number
  fileName: string
  fileType: string
  fileSize: number
}

export interface PersistedState {
  selectedKey: MusicalKey
  bpm: number
  preset: ProgressionPreset
  mode: BackingMode
  tracks: PersistedTrackMetadata[]
  improvKey?: MusicalKey
  improvPreset?: ProgressionPreset
  fretboardKey?: MusicalKey
}

export function getDefaultState(): PersistedState {
  return {
    selectedKey: 'C',
    bpm: 90,
    preset: 'standard-12',
    mode: 'auto',
    tracks: [],
    improvKey: 'C',
    improvPreset: 'standard-12',
    fretboardKey: 'E',
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadState(): PersistedState | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PersistedState
    parsed.tracks = (parsed.tracks ?? []).map((track) => ({
      ...track,
      grooveId: track.grooveId ?? 'slow-shuffle',
    }))
    return parsed
  } catch {
    return null
  }
}

export function toPersistedTracks(tracks: RealTrack[]): PersistedTrackMetadata[] {
  return tracks.map(({ id, name, grooveId, key, bpm, fileName, fileType, fileSize }) => ({
    id,
    name,
    grooveId,
    key,
    bpm,
    fileName,
    fileType,
    fileSize,
  }))
}

export function toHydratedTracks(tracks: PersistedTrackMetadata[] = []): RealTrack[] {
  return tracks.map((track) => ({
    ...track,
    grooveId: track.grooveId ?? 'slow-shuffle',
    fileUrl: '',
  }))
}
