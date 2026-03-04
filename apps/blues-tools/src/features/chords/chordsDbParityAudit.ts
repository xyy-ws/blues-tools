import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { CURATED_CHORD_SHAPES } from './chordsDbAdapter'
import { getChordVoicingOptions, getInversionOptionsFor, getRootStringOptions, getVoicingValidationSummary, type ChordQuality } from './chords'

const DB_SUPPORTED_QUALITIES: ChordQuality[] = [
  'maj',
  'm',
  'dim',
  'dim7',
  'sus2',
  'sus4',
  'aug',
  '6',
  '7',
  '9',
  'add9',
  'm6',
  'm7',
  'm7b5',
  'm9',
  'maj7',
  'maj9',
]

export type ExclusionReasonBuckets = {
  tonalFail: number
  playabilityFail: number
  other: number
}

export type ChordParityAuditRow = {
  root: MusicalKey
  quality: ChordQuality
  dbCandidateCount: number
  appStrictPassCount: number
  excludedCount: number
  exclusionReasons: ExclusionReasonBuckets
  excludedExamples: Array<{ pattern: string; reasons: string[] }>
}

export type ChordParityAuditReport = {
  generatedAt: string
  totals: {
    combinations: number
    matched: number
    mismatched: number
    dbCandidates: number
    appStrictPass: number
    excluded: number
  }
  mismatches: ChordParityAuditRow[]
  rows: ChordParityAuditRow[]
}

function getDbCandidates(root: MusicalKey, quality: ChordQuality): string[] {
  return CURATED_CHORD_SHAPES.filter((shape) => shape.sourceId === 'chordsDb' && shape.root === root && shape.quality === quality).map((shape) => shape.pattern)
}

function getAppSelectorStrictPass(root: MusicalKey, quality: ChordQuality): Set<string> {
  const patterns = new Set<string>()
  for (const rootString of getRootStringOptions(root, quality)) {
    for (const inversion of getInversionOptionsFor(root, quality, rootString)) {
      for (const entry of getChordVoicingOptions(root, quality, rootString, inversion)) {
        if (entry.source.id === 'chordsDb') {
          patterns.add(entry.pattern)
        }
      }
    }
  }
  return patterns
}

function bucketReasons(root: MusicalKey, quality: ChordQuality, pattern: string): { buckets: ExclusionReasonBuckets; reasons: string[] } {
  const validation = getVoicingValidationSummary(root, quality, pattern)
  const reasons: string[] = []
  const buckets: ExclusionReasonBuckets = { tonalFail: 0, playabilityFail: 0, other: 0 }

  if (validation.failReasons.includes('tonal-fail')) {
    buckets.tonalFail += 1
    reasons.push('tonal fail')
  }

  if (validation.failReasons.includes('playability-fail')) {
    buckets.playabilityFail += 1
    reasons.push('playability fail')
  }

  if (reasons.length === 0) {
    buckets.other += 1
    reasons.push('excluded by non-validation logic')
  }

  return { buckets, reasons }
}

export function buildChordsDbParityAudit(): ChordParityAuditReport {
  const rows: ChordParityAuditRow[] = []

  for (const root of CHROMATIC_KEYS) {
    for (const quality of DB_SUPPORTED_QUALITIES) {
      const dbCandidates = getDbCandidates(root, quality)
      const appPatterns = getAppSelectorStrictPass(root, quality)
      const excluded = dbCandidates.filter((pattern) => !appPatterns.has(pattern))

      const reasonTotals: ExclusionReasonBuckets = { tonalFail: 0, playabilityFail: 0, other: 0 }
      const excludedExamples = excluded.slice(0, 5).map((pattern) => {
        const reasonInfo = bucketReasons(root, quality, pattern)
        reasonTotals.tonalFail += reasonInfo.buckets.tonalFail
        reasonTotals.playabilityFail += reasonInfo.buckets.playabilityFail
        reasonTotals.other += reasonInfo.buckets.other
        return { pattern, reasons: reasonInfo.reasons }
      })

      for (const pattern of excluded.slice(5)) {
        const reasonInfo = bucketReasons(root, quality, pattern)
        reasonTotals.tonalFail += reasonInfo.buckets.tonalFail
        reasonTotals.playabilityFail += reasonInfo.buckets.playabilityFail
        reasonTotals.other += reasonInfo.buckets.other
      }

      rows.push({
        root,
        quality,
        dbCandidateCount: dbCandidates.length,
        appStrictPassCount: appPatterns.size,
        excludedCount: excluded.length,
        exclusionReasons: reasonTotals,
        excludedExamples,
      })
    }
  }

  const matched = rows.filter((row) => row.dbCandidateCount === row.appStrictPassCount).length
  const totals = {
    combinations: rows.length,
    matched,
    mismatched: rows.length - matched,
    dbCandidates: rows.reduce((sum, row) => sum + row.dbCandidateCount, 0),
    appStrictPass: rows.reduce((sum, row) => sum + row.appStrictPassCount, 0),
    excluded: rows.reduce((sum, row) => sum + row.excludedCount, 0),
  }

  const mismatches = rows.filter((row) => row.dbCandidateCount !== row.appStrictPassCount)

  return {
    generatedAt: new Date().toISOString(),
    totals,
    mismatches,
    rows,
  }
}

export function renderParityMarkdown(report: ChordParityAuditReport): string {
  const lines: string[] = []
  lines.push('# Chords-DB Parity Audit')
  lines.push('')
  lines.push(`- generatedAt: ${report.generatedAt}`)
  lines.push(`- combinations: ${report.totals.combinations}`)
  lines.push(`- matched: ${report.totals.matched}`)
  lines.push(`- mismatched: ${report.totals.mismatched}`)
  lines.push(`- dbCandidates: ${report.totals.dbCandidates}`)
  lines.push(`- appStrictPass: ${report.totals.appStrictPass}`)
  lines.push(`- excluded: ${report.totals.excluded}`)
  lines.push('')

  const dmaj9 = report.rows.find((row) => row.root === 'D' && row.quality === 'maj9')
  if (dmaj9) {
    lines.push('## Dmaj9 Focus')
    lines.push(`- dbCandidateCount: ${dmaj9.dbCandidateCount}`)
    lines.push(`- appStrictPassCount: ${dmaj9.appStrictPassCount}`)
    lines.push(`- excludedCount: ${dmaj9.excludedCount}`)
    lines.push(`- exclusionReasons: tonal=${dmaj9.exclusionReasons.tonalFail}, playability=${dmaj9.exclusionReasons.playabilityFail}, other=${dmaj9.exclusionReasons.other}`)
    if (dmaj9.excludedExamples.length > 0) {
      lines.push('- excludedExamples:')
      for (const item of dmaj9.excludedExamples) {
        lines.push(`  - ${item.pattern}: ${item.reasons.join(' | ')}`)
      }
    }
    lines.push('')
  }

  lines.push('## Mismatches (dbCandidateCount != appStrictPassCount)')
  if (report.mismatches.length === 0) {
    lines.push('- none')
  } else {
    for (const row of report.mismatches) {
      lines.push(`- ${row.root} ${row.quality}: db=${row.dbCandidateCount}, app=${row.appStrictPassCount}, excluded=${row.excludedCount}, reasons(tonal/playability/other)=${row.exclusionReasons.tonalFail}/${row.exclusionReasons.playabilityFail}/${row.exclusionReasons.other}`)
      for (const item of row.excludedExamples) {
        lines.push(`  - ${item.pattern}: ${item.reasons.join(' | ')}`)
      }
    }
  }

  return lines.join('\n')
}
