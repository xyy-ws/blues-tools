import { writeFileSync } from 'node:fs'
import { CHORD_LIBRARY_VALIDATION_REPORT } from '../src/features/chords/chords'

const summary = {
  total: CHORD_LIBRARY_VALIDATION_REPORT.length,
  pass: CHORD_LIBRARY_VALIDATION_REPORT.filter((item) => item.status === 'PASS').length,
  warn: CHORD_LIBRARY_VALIDATION_REPORT.filter((item) => item.status === 'WARN').length,
  fail: CHORD_LIBRARY_VALIDATION_REPORT.filter((item) => item.status === 'FAIL').length,
}

writeFileSync(
  'src/features/chords/chord-library-validation.json',
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      summary,
      records: CHORD_LIBRARY_VALIDATION_REPORT,
    },
    null,
    2,
  ),
)

console.log(summary)
