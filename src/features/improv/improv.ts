import { getTwelveBarBluesProgression } from '../../domain/music/progression'
import type { MusicalKey, ProgressionPreset } from '../../domain/music/types'

export function getCurrentBarIndex(elapsedSeconds: number, secondsPerBar = 4): number {
  return Math.floor(elapsedSeconds / secondsPerBar) % 12
}

export function getCurrentChordLabel(
  root: MusicalKey,
  elapsedSeconds: number,
  preset: ProgressionPreset = 'standard-12',
  secondsPerBar = 4,
): string {
  const progression = getTwelveBarBluesProgression(root, preset)
  const bar = progression[getCurrentBarIndex(elapsedSeconds, secondsPerBar)]
  return `${bar.degree} (${bar.key})`
}
