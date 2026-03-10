import { useState } from 'react'

export default function Top20Table({ items }) {
  const [q, setQ] = useState('')
  const f = items.filter((i) => i.text.includes(q.toLowerCase()))
  return (
    <div>
      <h3>Top20 Pain Points</h3>
      <input placeholder="filter text" value={q} onChange={(e) => setQ(e.target.value)} />
      <table>
        <thead><tr><th>ID</th><th>Category</th><th>Intensity</th><th>Theme</th><th>Text</th><th>Evidence</th></tr></thead>
        <tbody>
          {f.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.category}</td>
              <td>{r.intensity}</td>
              <td>{r.theme}</td>
              <td>{r.text.slice(0, 80)}</td>
              <td><a href={`http://127.0.0.1:8000/evidence/${r.id}`} target="_blank">open</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
