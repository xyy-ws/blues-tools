export default function KpiCards({ overview }) {
  if (!overview) return null
  return (
    <div className="kpis">
      <div className="card"><b>Total Pain Points</b><div>{overview.total_painpoints}</div></div>
      <div className="card"><b>High Emotion Ratio</b><div>{overview.high_emotion_ratio}</div></div>
      <div className="card"><b>Weekly WoW</b><div>{overview.weekly_wow_change}</div></div>
    </div>
  )
}
