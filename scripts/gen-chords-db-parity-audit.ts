import { mkdirSync, writeFileSync } from 'node:fs'
import { buildChordsDbParityAudit, renderParityMarkdown } from '../src/features/chords/chordsDbParityAudit'

const report = buildChordsDbParityAudit()
mkdirSync('artifacts', { recursive: true })

writeFileSync('artifacts/chords-db-parity-audit.json', JSON.stringify(report, null, 2))
writeFileSync('artifacts/chords-db-parity-audit.md', renderParityMarkdown(report))

console.log(
  JSON.stringify(
    {
      totals: report.totals,
      mismatches: report.mismatches.length,
    },
    null,
    2,
  ),
)
