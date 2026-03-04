import { useEffect, useMemo, useState } from 'react'
import { CHROMATIC_KEYS } from '../../domain/music/keys'
import type { MusicalKey } from '../../domain/music/types'
import {
  getChordVoicingOptions,
  getRankedGeneratedChordVoicings,
  getInversionOptionsFor,
  getRootStringOptions,
  hasStandardChordShapes,
  QUALITY_INTERVALS,
  type ChordQuality,
  type Inversion,
  type RootString,
} from '../chords/chords'
import { getFretNote, STANDARD_TUNING } from '../fretboard/fretboard'

type FretRange = '0-7' | '0-12'
const FRET_RANGE_MAX: Record<FretRange, number> = {
  '0-7': 7,
  '0-12': 12,
}

const DISPLAY_TUNING: Array<{ openString: MusicalKey; index: number }> = STANDARD_TUNING.map((openString, index) => ({ openString, index }))
  .slice()
  .reverse()

const QUALITY_LABELS: Record<ChordQuality, string> = {
  maj: '大三和弦',
  m: '小三和弦',
  '5': '五和弦（5）',
  '6': '大六和弦',
  m6: '小六和弦',
  sus2: '挂二和弦',
  sus4: '挂四和弦',
  add9: '加九和弦',
  dim: '减三和弦',
  dim7: '减七和弦',
  aug: '增三和弦',
  '7': '属七和弦',
  maj7: '大七和弦',
  m7: '小七和弦',
  m7b5: '半减七和弦',
  '9': '属九和弦',
  maj9: '大九和弦',
  m9: '小九和弦',
}

const INVERSION_LABELS: Record<Inversion, string> = {
  0: '原位（根音最低）',
  1: '第一转位（3rd 最低）',
  2: '第二转位（5th 最低）',
  3: '第三转位（7th 最低）',
}

const DEFAULT_VISIBLE_VOICINGS = 5
const MAX_FRETTED_SPAN = 4

function getHighlightedFrets(pattern: string): Array<{ stringIndex: number; fret: number }> {
  return pattern
    .split('')
    .map((value, stringIndex) => {
      if (value === 'x' || value === 'X') return null
      const fret = Number.parseInt(value, 10)
      if (Number.isNaN(fret)) return null
      return { stringIndex, fret }
    })
    .filter((item): item is { stringIndex: number; fret: number } => item !== null)
}

function getFrettedSpan(pattern: string): number {
  const frettedPositions = pattern
    .split('')
    .filter((value) => value !== 'x' && value !== 'X')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => !Number.isNaN(value) && value > 0)

  if (frettedPositions.length === 0) return 0
  return Math.max(...frettedPositions) - Math.min(...frettedPositions)
}

function getFingeringHint(pattern: string): string {
  const frets = pattern
    .split('')
    .filter((value) => value !== 'x' && value !== 'X')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => !Number.isNaN(value))

  if (frets.length === 0) return '没有可按的品位。'

  const minFret = Math.min(...frets)
  const maxFret = Math.max(...frets)
  const span = maxFret - minFret

  if (maxFret <= 3) {
    return '建议：食指负责低把位，按开放和弦手型处理更稳。'
  }

  if (span <= 2) {
    return `建议：食指横按第 ${minFret} 品，中指或无名指补位。`
  }

  return '建议：一指一品（食指-中指-无名指-小指）覆盖跨度。'
}

export function ChordFretboardPage() {
  const [root, setRoot] = useState<MusicalKey>('E')
  const [quality, setQuality] = useState<ChordQuality>('7')
  const [rootString, setRootString] = useState<RootString>(6)
  const [voicingIndex, setVoicingIndex] = useState(0)
  const [inversion, setInversion] = useState<Inversion>(0)
  const [fretRange, setFretRange] = useState<FretRange>('0-7')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'generated' | 'curated'>('all')
  const [showAllVoicings, setShowAllVoicings] = useState(false)

  const playableRootStrings = useMemo(() => getRootStringOptions(root, quality), [quality, root])
  const resolvedRootString = playableRootStrings.includes(rootString) ? rootString : playableRootStrings[0]

  const inversionOptions = useMemo(
    () => (resolvedRootString ? getInversionOptionsFor(root, quality, resolvedRootString) : []),
    [quality, resolvedRootString, root],
  )
  const resolvedInversion = inversionOptions.includes(inversion) ? inversion : inversionOptions[0]

  useEffect(() => {
    if (resolvedRootString && rootString !== resolvedRootString) {
      setRootString(resolvedRootString)
      setVoicingIndex(0)
      setShowAllVoicings(false)
    }
  }, [resolvedRootString, rootString])

  useEffect(() => {
    if (resolvedInversion !== undefined && inversion !== resolvedInversion) {
      setInversion(resolvedInversion)
      setVoicingIndex(0)
      setShowAllVoicings(false)
    }
  }, [resolvedInversion, inversion])

  const allFingeringEntries = useMemo(() => {
    if (!resolvedRootString || resolvedInversion === undefined) return []
    const curated = getChordVoicingOptions(root, quality, resolvedRootString, resolvedInversion)
    const generated = getRankedGeneratedChordVoicings(root, quality, resolvedRootString, resolvedInversion, 20)

    const dedupeByPattern = (items: typeof curated) => {
      const seen = new Set<string>()
      return items.filter((item) => {
        if (seen.has(item.pattern)) return false
        seen.add(item.pattern)
        return true
      })
    }

    const curatedDeduped = dedupeByPattern(curated)
    const generatedDeduped = generated.filter((item) => !curatedDeduped.some((curatedItem) => curatedItem.pattern === item.pattern))

    const combined = sourceFilter === 'curated' ? curatedDeduped : sourceFilter === 'generated' ? dedupeByPattern(generated) : [...curatedDeduped, ...generatedDeduped]

    return combined.filter((entry) => getFrettedSpan(entry.pattern) <= MAX_FRETTED_SPAN)
  }, [quality, resolvedInversion, resolvedRootString, root, sourceFilter])
  const fingeringEntries = useMemo(
    () => (showAllVoicings ? allFingeringEntries : allFingeringEntries.slice(0, DEFAULT_VISIBLE_VOICINGS)),
    [allFingeringEntries, showAllVoicings],
  )
  const hiddenVoicingCount = Math.max(0, allFingeringEntries.length - fingeringEntries.length)

  useEffect(() => {
    if (voicingIndex >= fingeringEntries.length) {
      setVoicingIndex(0)
    }
  }, [fingeringEntries.length, voicingIndex])

  const selectedEntry = fingeringEntries[voicingIndex] ?? fingeringEntries[0]
  const selectedPattern = selectedEntry?.pattern ?? 'xxxxxx'
  const voicingConstrained = fingeringEntries.length < 2
  const hasStandardShape = fingeringEntries.length > 0
  const chordTones = useMemo(() => {
    const rootIndex = CHROMATIC_KEYS.indexOf(root)
    return new Set(QUALITY_INTERVALS[quality].map((step) => CHROMATIC_KEYS[(rootIndex + step) % CHROMATIC_KEYS.length]))
  }, [quality, root])

  const highlighted = useMemo(() => {
    const positions = getHighlightedFrets(selectedPattern)
    return new Set(positions.map(({ stringIndex, fret }) => `${stringIndex}-${fret}`))
  }, [selectedPattern])

  const fingeringHint = useMemo(() => getFingeringHint(selectedPattern), [selectedPattern])
  const maxFret = FRET_RANGE_MAX[fretRange]

  return (
    <section className="page">
      <h1 className="page-title">和弦与指板</h1>
      <p className="muted helper-text">
        按法变体（Voicing）= 同一转位下的不同按法；转位（Inversion）= 低音音级变化（根音/三音/五音/七音）。
      </p>

      <div className="card grid-3 card-controls">
        <label className="control">
          根音
          <select
            aria-label="和弦根音"
            value={root}
            onChange={(e) => {
              setRoot(e.target.value as MusicalKey)
              setVoicingIndex(0)
              setShowAllVoicings(false)
            }}
          >
            {CHROMATIC_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          和弦性质
          <select
            aria-label="和弦性质"
            value={quality}
            onChange={(e) => {
              const next = e.target.value as ChordQuality
              setQuality(next)
              setVoicingIndex(0)
              setShowAllVoicings(false)
            }}
          >
            {Object.entries(QUALITY_LABELS).map(([value, label]) => {
              const playable = hasStandardChordShapes(root, value as ChordQuality)
              return (
                <option key={value} value={value} disabled={!playable}>
                  {label}{playable ? '' : '（暂无标准指型）'}
                </option>
              )
            })}
          </select>
        </label>

        <label className="control">
          根音所在弦
          <select
            aria-label="根音弦"
            value={resolvedRootString ?? ''}
            onChange={(e) => {
              setRootString(Number(e.target.value) as RootString)
              setVoicingIndex(0)
              setShowAllVoicings(false)
            }}
            disabled={playableRootStrings.length === 0}
          >
            {([6, 5, 4] as const).map((stringNo) => (
              <option key={stringNo} value={stringNo} disabled={!playableRootStrings.includes(stringNo)}>
                第 {stringNo} 弦{playableRootStrings.includes(stringNo) ? '' : '（无标准）'}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          转位（Inversion）
          <select
            aria-label="转位"
            value={resolvedInversion ?? ''}
            onChange={(e) => {
              setInversion(Number(e.target.value) as Inversion)
              setVoicingIndex(0)
              setShowAllVoicings(false)
            }}
            disabled={inversionOptions.length === 0}
          >
            {inversionOptions.map((inv) => (
              <option key={inv} value={inv}>
                {INVERSION_LABELS[inv]}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          指型来源
          <select
            aria-label="指型来源"
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value as 'all' | 'generated' | 'curated')
              setVoicingIndex(0)
              setShowAllVoicings(false)
            }}
          >
            <option value="all">综合（算法 + 标准库）</option>
            <option value="generated">算法生成</option>
            <option value="curated">标准库</option>
          </select>
        </label>

        <label className="control">
          按法变体（Voicing）
          <select
            aria-label="按法变体"
            value={voicingIndex}
            onChange={(e) => setVoicingIndex(Number(e.target.value))}
            disabled={voicingConstrained}
          >
            {fingeringEntries.map((entry, index) => (
              <option key={`${entry.pattern}-${index}`} value={index}>
                变体 {index + 1} · {entry.pattern} · {entry.sourceKind === 'generated' ? '算法生成' : '标准库'}
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          指板范围
          <select aria-label="指板范围" value={fretRange} onChange={(e) => setFretRange(e.target.value as FretRange)}>
            <option value="0-7">0–7 品（聚焦）</option>
            <option value="0-12">0–12 品（扩展）</option>
          </select>
        </label>
      </div>

      <article className="card">
        <div className="card-title-row">
          <h2>
            {root} {QUALITY_LABELS[quality]}
          </h2>
          <span className="badge info">指法：{selectedPattern}</span>
        </div>
        {hasStandardShape ? (
          <>
            <p>
              当前转位：<strong>{INVERSION_LABELS[resolvedInversion ?? 0]}</strong>
            </p>
            <p>
              当前按法变体：<strong>变体 {voicingIndex + 1} / {fingeringEntries.length}</strong>（{selectedPattern}）
              {selectedEntry?.sourceKind === 'generated' ? ' · 算法生成' : ' · 标准库'}
              {hiddenVoicingCount > 0 ? ` · 已隐藏 ${hiddenVoicingCount} 个候选` : ''}
            </p>
            {selectedEntry?.sourceKind === 'generated' ? (
              <div className="inline-actions" aria-label="评分摘要">
                <span className="badge info">评分 {selectedEntry.rankingScore?.toFixed(1) ?? '--'}</span>
                {(selectedEntry.rankingBadges ?? []).map((badge) => (
                  <span key={badge} className="badge success">
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="card-nested" aria-label="指型来源追溯" style={{ marginTop: 8 }}>
              <p className="muted helper-text" style={{ marginTop: 0 }}>
                来源名称：<strong>{selectedEntry?.shapeSource.source.sourceName ?? '未标注'}</strong>
              </p>
              <p className="muted helper-text">来源类型：{selectedEntry?.shapeSource.source.sourceType ?? '课程实践'}</p>
              <p className="muted helper-text">可信度等级：{selectedEntry?.shapeSource.source.confidenceLevel ?? 'low'}</p>
              <p className="muted helper-text">校验状态：{selectedEntry?.shapeSource.verificationStatus ?? '已校验'}</p>
              {selectedEntry?.shapeSource.source.url ? (
                <p className="muted helper-text">
                  Source Link：
                  <a href={selectedEntry.shapeSource.source.url} target="_blank" rel="noreferrer">
                    {selectedEntry.shapeSource.source.url}
                  </a>
                </p>
              ) : null}
              <p className="muted helper-text">说明：{selectedEntry?.note ?? selectedEntry?.shapeSource.verificationNotes ?? selectedEntry?.source.notes ?? '此按法来自可验证和弦资料。'}</p>
            </div>
            {hiddenVoicingCount > 0 ? (
              <div className="inline-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAllVoicings(true)
                    setVoicingIndex(0)
                  }}
                >
                  显示更多（+{hiddenVoicingCount}）
                </button>
              </div>
            ) : null}
            {showAllVoicings && allFingeringEntries.length > DEFAULT_VISIBLE_VOICINGS ? (
              <div className="inline-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAllVoicings(false)
                    setVoicingIndex(0)
                  }}
                >
                  收起到前 {DEFAULT_VISIBLE_VOICINGS} 个
                </button>
              </div>
            ) : null}
            {voicingConstrained ? (
              <p className="muted helper-text" role="status">
                当前组合仅有 {fingeringEntries.length} 个通过严格校验的按法；可切换根音弦或转位以尝试更多按法。
              </p>
            ) : null}
          </>
        ) : (
          <p className="muted helper-text" role="alert">该组合暂无通过严格校验的可用指型（0 个结果）。请切换根音、性质、根音弦或转位。</p>
        )}
        <p className="muted helper-text" style={{ marginBottom: 8 }}>
          记谱格式为 EADGBe（x 表示闷音）。先选转位，再切换同转位下的按法变体。
        </p>
        <p className="muted" aria-label="按法建议">
          {fingeringHint}
        </p>
      </article>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>小提示：按法变体 vs 转位</h3>
        <p className="muted helper-text" style={{ marginTop: 4 }}>
          按法变体：低音不变，只是同一组音换一种更顺手的按法。转位：把和弦里的某个音（3rd/5th/7th）放到最低音，声音重心会明显改变。
        </p>
      </div>

      <div className="card">
        <div className="inline-actions" style={{ marginBottom: 10 }}>
          <span className="badge info">图例</span>
          <span className="badge success">指法中的根音</span>
          <span className="badge warn">指法中的和弦音</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table aria-label="和弦指板网格" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 6 }}>
            <tbody>
              {DISPLAY_TUNING.map(({ openString, index: stringIndex }, displayIndex) => (
                <tr key={`${openString}-${stringIndex}`}>
                  <th scope="row" style={{ textAlign: 'left', paddingRight: 10, whiteSpace: 'nowrap' }}>
                    第 {displayIndex + 1} 弦（{openString}）
                  </th>
                  {Array.from({ length: maxFret + 1 }).map((_, fret) => {
                    const note = getFretNote(openString, fret)
                    const isHighlighted = highlighted.has(`${stringIndex}-${fret}`)
                    const isRoot = note === root
                    const isChordTone = chordTones.has(note)
                    const toneTag = isHighlighted ? (isRoot ? 'root' : isChordTone ? 'chord-tone' : 'other') : undefined
                    const highlightColor =
                      toneTag === 'root'
                        ? 'rgba(77, 210, 168, 0.26)'
                        : toneTag === 'chord-tone'
                          ? 'rgba(242, 194, 107, 0.26)'
                          : 'rgba(77, 161, 255, 0.22)'

                    return (
                      <td
                        key={fret}
                        {...(isHighlighted ? { 'data-chord-highlight': 'yes', 'data-tone-type': toneTag } : {})}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '0.42rem 0.56rem',
                          background: isHighlighted ? highlightColor : 'rgba(7, 15, 27, 0.72)',
                          color: isHighlighted ? '#dff0ff' : 'var(--muted)',
                          minWidth: 60,
                        }}
                      >
                        {fret}:{note}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
