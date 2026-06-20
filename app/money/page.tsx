import { getRecords, rm, STILL_OPEN, DEAL_CATS } from '@/lib/records'
import Empty from '@/app/_components/Empty'

export const dynamic = 'force-dynamic'

// Your money: leads + invoices that carry a value.
export default async function Money() {
  const all = await getRecords()
  const rows = all.filter(r => Number(r.amount) > 0 && r.category && DEAL_CATS.includes(r.category))
  const outstanding = rows.filter(r => STILL_OPEN.includes(r.status)).reduce((s, r) => s + Number(r.amount), 0)
  const collected = rows.filter(r => ['won', 'paid', 'done'].includes(r.status)).reduce((s, r) => s + Number(r.amount), 0)
  const total = rows.reduce((s, r) => s + Number(r.amount), 0)

  const cards: [string, string][] = [
    ['Outstanding', rm(outstanding)],
    ['Collected', rm(collected)],
    ['Total tracked', rm(total)],
  ]

  return (
    <>
      <h1 className="ph">Money</h1>
      <p className="cap">Leads &amp; invoices with a value</p>
      <div className="grid">
        {cards.map(([l, v]) => (
          <div className="stat" key={l}><p className="l">{l}</p><p className="v">{v}</p></div>
        ))}
      </div>
      {all.length === 0 ? <Empty /> : rows.length === 0 ? (
        <p className="empty">No leads or invoices have an amount yet — add a value on the Dashboard.</p>
      ) : (
        <table className="tbl">
          <thead><tr><th>Title</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td><span className={`pill ${r.status}`}>{r.status}</span></td>
                <td>{rm(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
