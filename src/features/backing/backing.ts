import type { MusicalKey } from '../../domain/music/types'

export type BackingMode = 'synth' | 'real' | 'auto'

export type GrooveId = 'slow-shuffle' | 'chicago-shuffle' | 'texas-straight' | 'custom'

export const SUPPORTED_METERS = ['2/4', '3/4', '4/4', '6/8', '12/8'] as const
export type MeterSignature = (typeof SUPPORTED_METERS)[number]

export interface MeterProfile {
  signature: MeterSignature
  beatsPerBar: number
  beatUnit: 4 | 8
  accentBeats: number[]
}

export interface GrooveProfile {
  id: GrooveId
  displayName: string
  bpmRange: { min: number; max: number; recommended: number }
  description: string
}

export const GROOVE_PROFILES: GrooveProfile[] = [
  {
    id: 'custom',
    displayName: '自定义 / Custom',
    bpmRange: { min: 40, max: 220, recommended: 90 },
    description: '上传素材自动识别失败时使用的默认风格标签。',
  },
  {
    id: 'slow-shuffle',
    displayName: '慢速布鲁斯 Shuffle / Slow Blues Shuffle',
    bpmRange: { min: 58, max: 82, recommended: 68 },
    description: '重拍明确、三连音律动，适合慢速揉弦和句子呼吸。',
  },
  {
    id: 'chicago-shuffle',
    displayName: '中速芝加哥 Shuffle / Medium Chicago Shuffle',
    bpmRange: { min: 84, max: 112, recommended: 98 },
    description: '中速城市蓝调摇摆，鼓点紧凑，适合经典 Chicago phrasing。',
  },
  {
    id: 'texas-straight',
    displayName: '德州直八 Blues / Texas Blues Straight',
    bpmRange: { min: 92, max: 126, recommended: 108 },
    description: '直八分推进感更强，适合 Texas 风格强攻击演奏。',
  },
]

export interface RealTrack {
  id: string
  name: string
  grooveId: GrooveId
  key: MusicalKey
  bpm: number
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  disabledReason?: string
}

export interface BackingSelection {
  key: MusicalKey
  bpm: number
  grooveId: GrooveId
}

export interface PlaybackResolution {
  resolved: 'synth' | 'real'
  hasMatch: boolean
  mode: BackingMode
  matchedTrack: RealTrack | null
}

const BPM_TOLERANCE = 10
const LEGACY_SWING_FACTOR = 0.75

const METER_PROFILES: Record<MeterSignature, MeterProfile> = {
  '2/4': { signature: '2/4', beatsPerBar: 2, beatUnit: 4, accentBeats: [1] },
  '3/4': { signature: '3/4', beatsPerBar: 3, beatUnit: 4, accentBeats: [1] },
  '4/4': { signature: '4/4', beatsPerBar: 4, beatUnit: 4, accentBeats: [1, 3] },
  '6/8': { signature: '6/8', beatsPerBar: 6, beatUnit: 8, accentBeats: [1, 4] },
  '12/8': { signature: '12/8', beatsPerBar: 12, beatUnit: 8, accentBeats: [1, 4, 7, 10] },
}

export function findBestRealTrack(selection: BackingSelection, tracks: RealTrack[]): RealTrack | null {
  const candidates = tracks.filter(
    (track) =>
      !track.disabledReason &&
      !!track.fileUrl &&
      track.grooveId === selection.grooveId &&
      track.key === selection.key,
  )

  if (candidates.length === 0) return null

  const exact = candidates.find((track) => track.bpm === selection.bpm)
  if (exact) return exact

  const nearest = candidates
    .map((track) => ({ track, distance: Math.abs(track.bpm - selection.bpm) }))
    .sort((a, b) => a.distance - b.distance)[0]

  return nearest.distance <= BPM_TOLERANCE ? nearest.track : null
}

export function resolvePlayback(mode: BackingMode, selection: BackingSelection, tracks: RealTrack[]): PlaybackResolution {
  if (mode === 'synth') {
    return { resolved: 'synth', hasMatch: false, mode, matchedTrack: null }
  }

  const matchedTrack = findBestRealTrack(selection, tracks)
  const hasMatch = !!matchedTrack

  return {
    resolved: hasMatch ? 'real' : 'synth',
    hasMatch,
    mode,
    matchedTrack,
  }
}

export function choosePlaybackSource(
  mode: BackingMode,
  selection: BackingSelection,
  tracks: RealTrack[],
): 'synth' | 'real' {
  return resolvePlayback(mode, selection, tracks).resolved
}

export function buildRealTrackId(track: Omit<RealTrack, 'id'>): string {
  return `${track.name}-${track.grooveId}-${track.key}-${track.bpm}-${track.fileName}`.toLowerCase().replaceAll(/\s+/g, '-')
}

export function inferGrooveId(input: string): GrooveId {
  const text = input.toLowerCase()
  if (text.includes('texas') || text.includes('straight') || text.includes('直八')) return 'texas-straight'
  if (text.includes('chicago') || text.includes('芝加哥')) return 'chicago-shuffle'
  if (text.includes('shuffle') || text.includes('slow') || text.includes('慢速')) return 'slow-shuffle'
  return 'custom'
}

export function getMeterProfile(meter: MeterSignature | null | undefined): MeterProfile {
  if (!meter || !(meter in METER_PROFILES)) return METER_PROFILES['4/4']
  return METER_PROFILES[meter]
}

export function isAccentedBeat(meter: MeterSignature | null | undefined, beat: number): boolean {
  const profile = getMeterProfile(meter)
  if (beat < 1 || beat > profile.beatsPerBar) return false
  return profile.accentBeats.includes(beat)
}

export function getMeterBeatIntervalMs(bpm: number, meter: MeterSignature | null | undefined): number {
  const profile = getMeterProfile(meter)
  const quarterNoteMs = (60_000 / Math.max(bpm, 1)) * LEGACY_SWING_FACTOR
  const beatMs = quarterNoteMs * (4 / profile.beatUnit)
  return Math.max(120, Math.round(beatMs))
}
