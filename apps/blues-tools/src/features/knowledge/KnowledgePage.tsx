import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { bluesStylePack } from '../../styles/blues'
import { LicksDemoSection } from './LicksDemoSection'

const ALL_TAG = 'all'

const TODAY_TASKS = [
  '5 分钟：跟伴奏做 Call & Response',
  '5 分钟：Blue Notes 目标音（b3 / b5）',
  '5 分钟：11-12 小节 Turnaround 收尾',
]

export function KnowledgePage() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState(ALL_TAG)
  const [taskChecks, setTaskChecks] = useState<Record<string, boolean>>({})

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

      <section className="card" aria-label="Today practice checklist">
        <h2>今日练习任务 / Today practice</h2>
        <ul className="list" style={{ marginTop: 10 }}>
          {TODAY_TASKS.map((task) => (
            <li className="list-item" key={task}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={Boolean(taskChecks[task])}
                  onChange={(e) => setTaskChecks((prev) => ({ ...prev, [task]: e.target.checked }))}
                />
                <span>{task}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {filteredCards.length === 0 ? (
        <p className="empty-state">No cards matched your filters.</p>
      ) : (
        <ul className="list">
          {filteredCards.map((card) => (
            <li key={card.id} className="list-item">
              <h2>{card.title}</h2>
              <p>{card.content}</p>

              <div className="card" style={{ marginTop: 10 }}>
                <h3>什么时候用 / Where in 12-bar</h3>
                <p>{card.whereInTwelveBar}</p>

                <h3>常见错误 / Common mistakes</h3>
                <ul>
                  {card.commonMistakes.map((mistake) => (
                    <li key={`${card.id}-${mistake}`}>{mistake}</li>
                  ))}
                </ul>

                <h3>相关乐句 / Related licks</h3>
                <div className="inline-actions">
                  {card.relatedLicks.map((lick) => (
                    <span className="badge success" key={`${card.id}-${lick}`}>
                      {lick}
                    </span>
                  ))}
                </div>

                <div className="inline-actions" style={{ marginTop: 10 }}>
                  <Link
                    className="btn-primary"
                    to={`/backing?key=${card.practiceLink.key}&bpm=${card.practiceLink.bpm}&preset=${card.practiceLink.progression}`}
                  >
                    立即练习 / Practice now
                  </Link>
                </div>
              </div>

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
