import { getTwelveBarBluesProgression } from '../../domain/music/progression'
import type { MusicalKey } from '../../domain/music/types'

export function getCurrentBarIndex(elapsedSeconds: number, secondsPerBar = 4): number {
  return Math.floor(elapsedSeconds / secondsPerBar) % 12
}

export function getCurrentChordLabel(root: MusicalKey, elapsedSeconds: number, secondsPerBar = 4): string {
  const progression = getTwelveBarBluesProgression(root)
  const bar = progression[getCurrentBarIndex(elapsedSeconds, secondsPerBar)]
  return `${bar.degree} (${bar.key})`
}
