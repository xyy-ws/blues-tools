import { useEffect, useState } from 'react'
import KpiCards from '../components/KpiCards'
import Top20Table from '../components/Top20Table'
import TrendCharts from '../components/TrendCharts'
import { api } from '../services/api'

export default function DashboardPage() {
  const [overview, setOverview] = useState(null)
  const [items, setItems] = useState([])
  const [trend7, setTrend7] = useState([])
  const [trend30, setTrend30] = useState([])
  const [category, setCategory] = useState('')

  useEffect(() => {
    api.overview().then(setOverview)
    api.top20(category, 30).then((r) => setItems(r.items || []))
    api.trend(7).then((r) => setTrend7(r.items || []))
    api.trend(30).then((r) => setTrend30(r.items || []))
  }, [category])

  return (
    <>
      <KpiCards overview={overview} />
      <label>Category Filter: </label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All</option>
        <option value="function">Function</option>
        <option value="process">Process</option>
        <option value="pricing">Pricing</option>
      </select>
      <Top20Table items={items} />
      <TrendCharts trend7={trend7} trend30={trend30} />
    </>
  )
}
