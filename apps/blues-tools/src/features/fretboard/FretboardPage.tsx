import { useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import { getBluesScaleNotes, getFretNote, STANDARD_TUNING } from './fretboard'

const FRET_COUNT = 12

export function FretboardPage() {
  const [key, setKey] = useState<MusicalKey>('E')

  const bluesNotes = useMemo(() => getBluesScaleNotes(key), [key])

  return (
    <section>
      <h1>Fretboard</h1>
      <label>
        Key
        <select aria-label="Fretboard key" value={key} onChange={(e) => setKey(e.target.value as MusicalKey)}>
          {CHROMATIC_KEYS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <p>Blues scale notes: {bluesNotes.join(', ')}</p>

      <table aria-label="Fretboard grid">
        <tbody>
          {STANDARD_TUNING.map((openString, stringIndex) => (
            <tr key={`${openString}-${stringIndex}`}>
              <th scope="row">String {6 - stringIndex} ({openString})</th>
              {Array.from({ length: FRET_COUNT + 1 }).map((_, fret) => {
                const note = getFretNote(openString, fret)
                const inScale = bluesNotes.includes(note)
                return (
                  <td key={fret} data-scale-note={inScale ? 'yes' : 'no'}>
                    {fret}:{note}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
