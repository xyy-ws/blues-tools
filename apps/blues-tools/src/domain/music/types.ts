export type MusicalKey =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B'

export type RomanDegree = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII'

export type ProgressionPreset = 'standard-12' | 'quick-change' | 'turnaround'

export interface ProgressionChord {
  degree: RomanDegree
  key: MusicalKey
}
