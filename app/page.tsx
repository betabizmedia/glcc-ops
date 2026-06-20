import { getRecords, rm, STILL_OPEN, DEAL_CATS, NEW_CATS } from '@/lib/records'
import Empty from '@/app/_components/Empty'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const rows = await getRecords()
  const open = rows.filter(r => STILL_OPEN.includes(r.status) && !NEW_CATS.includes(r.category ?? '')).length
  const pipeline = rows
    .filter(r => r.category && DEAL_CATS.includes(r.category) && !['done', 'lost'].includes(r.status))
    .reduce((s, r) => s + Number(r.amount || 0), 0)
  const closed = rows.filter(r => ['won', 'done', 'paid'].includes(r.status) && !NEW_CATS.includes(r.category ?? '')).length

  const cards: [string, string | number][] = [
    ['Total', rows.length],
    ['Open', open],
    ['Pipeline', rm(pipeline)],
    ['Closed', closed],
  ]

  return (
    <>
      <h1 className="ph">Dashboard</h1>
      <p className="cap">Everything at a glance</p>
      <div className="grid">
        {cards.map(([l, v]) => (
          <div className="stat" key={l}><p className="l">{l}</p><p className="v">{v}</p></div>
        ))}
      </div>
      {rows.length === 0 ? <Empty /> : (
        <table className="tbl">
          <thead><tr><th>Title</th><th>Status</th><th>Amount</th><th>Category</th><th>Due</th></tr></thead>
          <tbody>
            {rows.slice(0, 10).map(r => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td><span className={`pill ${r.status}`}>{r.status}</span></td>
                <td>{r.amount ? rm(r.amount) : '—'}</td>
                <td>{r.category ?? '—'}</td>
                <td>{r.due_date ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
