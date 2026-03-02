import type { BluesSubstyle } from '../../styles/blues/substyles'

export const ALL_SUBSTYLE_TAG = '全部'

export function filterSubstyles(substyles: BluesSubstyle[], query: string, tag: string) {
  const normalizedQuery = query.trim().toLowerCase()

  return substyles.filter((style) => {
    const queryMatched =
      !normalizedQuery ||
      style.nameZh.toLowerCase().includes(normalizedQuery) ||
      style.nameEn.toLowerCase().includes(normalizedQuery) ||
      style.regionOriginEra.toLowerCase().includes(normalizedQuery) ||
      style.grooveRhythmTraits.some((item) => item.toLowerCase().includes(normalizedQuery)) ||
      style.commonProgressionBackingIdeas.some((item) => item.toLowerCase().includes(normalizedQuery)) ||
      style.representativeSongsArtists.some((item) => item.toLowerCase().includes(normalizedQuery)) ||
      style.tags.some((item) => item.toLowerCase().includes(normalizedQuery))

    const tagMatched = tag === ALL_SUBSTYLE_TAG || style.tags.includes(tag)

    return queryMatched && tagMatched
  })
}
