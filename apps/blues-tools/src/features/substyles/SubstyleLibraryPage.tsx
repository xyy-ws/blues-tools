import { useMemo, useState } from 'react'
import { bluesStylePack } from '../../styles/blues'
import { ALL_SUBSTYLE_TAG, filterSubstyles } from './substyles'

export function SubstyleLibraryPage() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState(ALL_SUBSTYLE_TAG)
  const [activeId, setActiveId] = useState(bluesStylePack.substyles[0]?.id ?? '')

  const tags = useMemo(
    () => [ALL_SUBSTYLE_TAG, ...new Set(bluesStylePack.substyles.flatMap((substyle) => substyle.tags))],
    [],
  )

  const filteredSubstyles = useMemo(
    () => filterSubstyles(bluesStylePack.substyles, query, tag),
    [query, tag],
  )

  const activeSubstyle =
    filteredSubstyles.find((substyle) => substyle.id === activeId) ?? filteredSubstyles[0] ?? null

  return (
    <section className="page">
      <h1>布鲁斯子风格库 / Blues Substyle Library</h1>
      <p className="muted">按关键词或标签筛选常见风格，并查看节奏、伴奏与练习建议。</p>

      <div className="card grid-2">
        <label className="control">
          关键词搜索 / Search
          <input
            aria-label="Search substyles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如: shuffle, slide, 指弹"
          />
        </label>

        <label className="control">
          标签筛选 / Filter tag
          <select aria-label="Filter substyle tag" value={tag} onChange={(e) => setTag(e.target.value)}>
            {tags.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredSubstyles.length === 0 ? (
        <p className="empty-state">没有匹配结果 / No substyles matched your filters.</p>
      ) : (
        <div className="grid-2">
          <div className="card">
            <div className="card-title-row">
              <h2>子风格列表 / Substyles</h2>
              <span className="badge info">{filteredSubstyles.length} styles</span>
            </div>
            <ul className="list" aria-label="Blues substyle list">
              {filteredSubstyles.map((substyle) => (
                <li key={substyle.id} className="list-item">
                  <button type="button" onClick={() => setActiveId(substyle.id)}>
                    {substyle.nameZh} / {substyle.nameEn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {activeSubstyle && (
            <article className="card" aria-label="Substyle detail">
              <div className="card-title-row">
                <h2>
                  {activeSubstyle.nameZh} / {activeSubstyle.nameEn}
                </h2>
                <span className="badge success">{activeSubstyle.recommendedBpmRange}</span>
              </div>

              <p>
                <strong>地区与年代 / Region & Era:</strong> {activeSubstyle.regionOriginEra}
              </p>

              <section>
                <h3>律动特征 / Groove Traits</h3>
                <ul className="list">
                  {activeSubstyle.grooveRhythmTraits.map((item) => (
                    <li key={item} className="list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>常见伴奏思路 / Backing Ideas</h3>
                <ul className="list">
                  {activeSubstyle.commonProgressionBackingIdeas.map((item) => (
                    <li key={item} className="list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>练习要点 / Practice Tips</h3>
                <ul className="list">
                  {activeSubstyle.keyPracticeTips.map((item) => (
                    <li key={item} className="list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>代表作品/艺人 / Songs & Artists</h3>
                <ul className="list">
                  {activeSubstyle.representativeSongsArtists.map((item) => (
                    <li key={item} className="list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="inline-actions">
                {activeSubstyle.tags.map((item) => (
                  <span className="badge info" key={`${activeSubstyle.id}-${item}`}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          )}
        </div>
      )}
    </section>
  )
}
