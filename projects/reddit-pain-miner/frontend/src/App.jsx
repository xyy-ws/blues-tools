import { Link, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <div className="container">
      <h1>Reddit Pain Miner</h1>
      <nav>
        <Link to="/">Dashboard</Link> | <Link to="/report">Daily Report</Link>
      </nav>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </div>
  )
}
