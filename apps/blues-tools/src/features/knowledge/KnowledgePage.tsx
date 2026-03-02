import { useMemo, useState } from 'react'
import { bluesStylePack } from '../../styles/blues'
import { LicksDemoSection } from './LicksDemoSection'

const ALL_TAG = 'all'

export function KnowledgePage() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState(ALL_TAG)

  const tags = useMemo(() => {
    return [ALL_TAG, ...new Set(bluesStylePack.knowledgeCards.flatMap((card) => card.tags))]
  }, [])

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return bluesStylePack.knowledgeCards.filter((card) => {
      const textMatch =
        !normalizedQuery ||
        card.title.toLowerCase().includes(normalizedQuery) ||
        card.content.toLowerCase().includes(normalizedQuery)
      const tagMatch = tag === ALL_TAG || card.tags.includes(tag)
      return textMatch && tagMatch
    })
  }, [query, tag])

  return (
    <section className="page">
      <h1>Knowledge</h1>

      <div className="card grid-2">
        <label className="control">
          Search
          <input
            aria-label="Search knowledge"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts"
          />
        </label>

        <label className="control">
          Filter tag
          <select aria-label="Filter tag" value={tag} onChange={(e) => setTag(e.target.value)}>
            {tags.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredCards.length === 0 ? (
        <p className="empty-state">No cards matched your filters.</p>
      ) : (
        <ul className="list">
          {filteredCards.map((card) => (
            <li key={card.id} className="list-item">
              <h2>{card.title}</h2>
              <p>{card.content}</p>
              <div className="inline-actions">
                {card.tags.map((item) => (
                  <span className="badge info" key={`${card.id}-${item}`}>
                    {item}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <LicksDemoSection />
    </section>
  )
}
