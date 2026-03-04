import { describe, expect, it } from 'vitest'
import { buildChordsDbParityAudit } from './chordsDbParityAudit'

describe('buildChordsDbParityAudit', () => {
  it('has no strict-pass parity mismatches between chords-db candidates and selector-facing app voicings', () => {
    const report = buildChordsDbParityAudit()

    expect(report.mismatches.every((row) => row.appStrictPassCount <= row.dbCandidateCount)).toBe(true)
    expect(report.rows.every((row) => row.exclusionReasons.other === 0)).toBe(true)
  })

  it('captures Dmaj9 parity breakdown for focused troubleshooting', () => {
    const report = buildChordsDbParityAudit()
    const dmaj9 = report.rows.find((row) => row.root === 'D' && row.quality === 'maj9')

    expect(dmaj9).toBeDefined()
    expect(dmaj9?.dbCandidateCount).toBeGreaterThanOrEqual(dmaj9?.appStrictPassCount ?? 0)
    expect((dmaj9?.exclusionReasons.tonalFail ?? 0) + (dmaj9?.exclusionReasons.playabilityFail ?? 0) + (dmaj9?.exclusionReasons.other ?? 0)).toBe(
      dmaj9?.excludedCount ?? 0,
    )
  })
})
