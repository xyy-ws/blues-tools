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
      <h1 className="page-title">布鲁斯子风格库 / Blues Substyle Library</h1>
      <p className="muted helper-text">可按关键词与标签筛选常见子风格，并查看节奏、伴奏和练习建议。</p>

      <div className="card grid-2 card-controls">
        <label className="control">
          关键词搜索
          <input
            aria-label="Search substyles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：shuffle、slide、指弹"
          />
        </label>

        <label className="control">
          标签筛选
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
        <p className="empty-state">当前筛选条件下没有匹配结果。</p>
      ) : (
        <div className="grid-2">
          <div className="card">
            <div className="card-title-row">
              <h2>子风格列表</h2>
              <span className="badge info">共 {filteredSubstyles.length} 项</span>
            </div>
            <ul className="list" aria-label="子风格列表">
              {filteredSubstyles.map((substyle) => (
                <li key={substyle.id} className="list-item">
                  <button type="button" onClick={() => setActiveId(substyle.id)}>
                    {substyle.nameZh}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {activeSubstyle && (
            <article className="card" aria-label="子风格详情">
              <div className="card-title-row">
                <h2>{activeSubstyle.nameZh}</h2>
                <span className="badge success">推荐速度：{activeSubstyle.recommendedBpmRange}</span>
              </div>

              <p>
                <strong>地区与年代：</strong>
                {activeSubstyle.regionOriginEra}
              </p>

              <section>
                <h3>律动特征</h3>
                <ul className="list list-tight">
                  {activeSubstyle.grooveRhythmTraits.map((item) => (
                    <li key={item} className="list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>常见伴奏思路</h3>
                <ul className="list list-tight">
                  {activeSubstyle.commonProgressionBackingIdeas.map((item) => (
                    <li key={item} className="list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>练习要点</h3>
                <ul className="list list-tight">
                  {activeSubstyle.keyPracticeTips.map((item) => (
                    <li key={item} className="list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>代表作品与艺人</h3>
                <ul className="list list-tight">
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
