export type PatternToken = number | null

export const CHORD_STRING_COUNT = 6
export const MUTED_TOKEN = 'x'

export function parsePattern(pattern: string): PatternToken[] | null {
  const trimmed = pattern.trim()
  if (!trimmed) return null

  const delimited = trimmed.includes(',')
    ? trimmed.split(',')
    : trimmed.includes(' ')
      ? trimmed.split(/\s+/)
      : null

  if (delimited) {
    if (delimited.length !== CHORD_STRING_COUNT) return null
    const parsed = delimited.map(parseToken)
    return parsed.every((value) => value !== undefined) ? (parsed as PatternToken[]) : null
  }

  if (trimmed.length !== CHORD_STRING_COUNT) return null
  const parsed = trimmed.split('').map(parseToken)
  return parsed.every((value) => value !== undefined) ? (parsed as PatternToken[]) : null
}

function parseToken(token: string): PatternToken | undefined {
  const normalized = token.trim()
  if (normalized === MUTED_TOKEN) return null
  if (!/^\d+$/.test(normalized)) return undefined

  const fret = Number.parseInt(normalized, 10)
  return Number.isNaN(fret) || fret < 0 ? undefined : fret
}

export function stringifyPattern(tokens: PatternToken[]): string {
  if (tokens.length !== CHORD_STRING_COUNT) {
    throw new Error(`Pattern must contain ${CHORD_STRING_COUNT} strings (got ${tokens.length})`)
  }
  return tokens.map((token) => (token === null ? MUTED_TOKEN : String(token))).join(',')
}
