import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { deriveTargetChordTones, inferBassInversion, validateChordPattern, validateChordPlayability } from './chordValidation'
import type { ChordQuality, Inversion, RootString } from './chords'

const OPEN_STRINGS: MusicalKey[] = ['E', 'A', 'D', 'G', 'B', 'E']

type CandidateMetrics = {
  minFret: number
  maxFret: number
  avgFret: number
  fretSpan: number
  barreCount: number
  muteGapCount: number
  stretchPenalty: number
}

export type GeneratedFingering = {
  pattern: string
  inversion: Inversion
  score: number
  badges: string[]
  metrics: CandidateMetrics
}

function normalizeKey(index: number): MusicalKey {
  return CHROMATIC_KEYS[(index + CHROMATIC_KEYS.length) % CHROMATIC_KEYS.length]
}

function noteAt(stringIndex: number, fret: number): MusicalKey {
  const open = CHROMATIC_KEYS.indexOf(OPEN_STRINGS[stringIndex])
  return normalizeKey(open + fret)
}

function buildMetrics(pattern: string): CandidateMetrics {
  const chars = pattern.split('')
  const frets = chars
    .map((char) => (char === 'x' ? null : Number.parseInt(char, 10)))
    .filter((fret): fret is number => fret !== null && !Number.isNaN(fret))

  const nonZeroFrets = frets.filter((fret) => fret > 0)
  const minFret = nonZeroFrets.length > 0 ? Math.min(...nonZeroFrets) : 0
  const maxFret = nonZeroFrets.length > 0 ? Math.max(...nonZeroFrets) : 0
  const avgFret = nonZeroFrets.length > 0 ? nonZeroFrets.reduce((sum, fret) => sum + fret, 0) / nonZeroFrets.length : 0
  const fretSpan = maxFret - minFret

  let barreCount = 0
  for (let i = 0; i < chars.length - 1; i += 1) {
    const a = chars[i]
    const b = chars[i + 1]
    if (a !== 'x' && b !== 'x' && a === b && a !== '0') {
      barreCount += 1
    }
  }

  const active = chars.map((char, index) => (char === 'x' ? null : index)).filter((i): i is number => i !== null)
  let muteGapCount = 0
  if (active.length > 0) {
    const first = active[0]
    const last = active[active.length - 1]
    muteGapCount = chars.slice(first, last + 1).filter((char) => char === 'x').length
  }

  let stretchPenalty = 0
  for (let i = 0; i < chars.length - 1; i += 1) {
    const a = chars[i]
    const b = chars[i + 1]
    if (a === 'x' || b === 'x') continue
    const fa = Number.parseInt(a, 10)
    const fb = Number.parseInt(b, 10)
    if (Number.isNaN(fa) || Number.isNaN(fb)) continue
    const diff = Math.abs(fa - fb)
    if (diff > 2) stretchPenalty += diff - 2
  }

  return { minFret, maxFret, avgFret, fretSpan, barreCount, muteGapCount, stretchPenalty }
}

function scoreMetrics(metrics: CandidateMetrics): number {
  const positionScore = 100 - metrics.avgFret * 8 - metrics.maxFret * 3 - metrics.minFret * 2
  const barreScore = 28 - metrics.barreCount * 11
  const spanScore = 24 - metrics.fretSpan * 6
  const comfortScore = 26 - metrics.muteGapCount * 7 - metrics.stretchPenalty * 5
  return Number((positionScore + barreScore + spanScore + comfortScore).toFixed(2))
}

function badgesFor(metrics: CandidateMetrics): string[] {
  const badges: string[] = []
  if (metrics.avgFret <= 3.5 && metrics.maxFret <= 5) badges.push('低把位')
  if (metrics.barreCount <= 1) badges.push('少横按')
  if (metrics.fretSpan <= 3 && metrics.muteGapCount <= 1 && metrics.stretchPenalty <= 1) badges.push('易按')
  return badges.length > 0 ? badges : ['实用']
}

function clampTopN(topN: number): number {
  if (!Number.isFinite(topN)) return Number.MAX_SAFE_INTEGER
  return Math.max(1, Math.round(topN))
}

const CACHE = new Map<string, GeneratedFingering[]>()

export function generateRankedFingerings(root: MusicalKey, quality: ChordQuality, rootString: RootString, inversion: Inversion, topN = 5): GeneratedFingering[] {
  const resolvedTopN = clampTopN(topN)
  const cacheKey = `${root}|${quality}|${rootString}|${inversion}`
  const cached = CACHE.get(cacheKey)
  if (cached) return cached.slice(0, resolvedTopN)

  const rootIndex = 6 - rootString
  const chordTones = new Set(deriveTargetChordTones(root, quality))
  const rootFrets = Array.from({ length: 10 }, (_, fret) => fret).filter((fret) => noteAt(rootIndex, fret) === root)
  const results = new Map<string, GeneratedFingering>()

  for (const rootFret of rootFrets) {
    const choicesByString: string[][] = Array.from({ length: 6 }, (_, index) => {
      if (index < rootIndex) return ['x']
      if (index === rootIndex) return [String(rootFret)]

      const options = Array.from({ length: 10 }, (_, fret) => fret)
        .filter((fret) => chordTones.has(noteAt(index, fret)))
        .filter((fret) => fret === 0 || Math.abs(fret - rootFret) <= 4)
        .map((fret) => String(fret))

      return ['x', ...options]
    })

    function walk(stringIndex: number, partial: string[], nonZeroFrets: number[]) {
      if (stringIndex === 6) {
        const pattern = partial.join('')
        const tonal = validateChordPattern(root, quality, pattern)
        if (tonal.status !== 'PASS') return
        const playability = validateChordPlayability(pattern)
        if (playability.status === 'FAIL') return
        if (inferBassInversion(root, quality, pattern) !== inversion) return

        const metrics = buildMetrics(pattern)
        const score = scoreMetrics(metrics)
        results.set(pattern, { pattern, inversion, score, metrics, badges: badgesFor(metrics) })
        return
      }

      for (const value of choicesByString[stringIndex]) {
        const nextNonZero = [...nonZeroFrets]
        if (value !== 'x' && value !== '0') {
          nextNonZero.push(Number.parseInt(value, 10))
        }

        if (nextNonZero.length > 1) {
          const span = Math.max(...nextNonZero) - Math.min(...nextNonZero)
          if (span > 3) continue
        }

        partial.push(value)
        walk(stringIndex + 1, partial, nextNonZero)
        partial.pop()
      }
    }

    walk(0, [], rootFret > 0 ? [rootFret] : [])
  }

  const sorted = [...results.values()].sort((a, b) => b.score - a.score || a.pattern.localeCompare(b.pattern))
  CACHE.set(cacheKey, sorted)
  return sorted.slice(0, resolvedTopN)
}
