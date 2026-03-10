import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function TrendCharts({ trend7, trend30 }) {
  return (
    <div className="charts">
      <div>
        <h3>7d Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend7}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line dataKey="count" stroke="#3b82f6" /></LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3>30d Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend30}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line dataKey="count" stroke="#10b981" /></LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
