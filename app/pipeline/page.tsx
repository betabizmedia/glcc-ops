import { getRecords, rm, DEAL_CATS } from '@/lib/records'
import Empty from '@/app/_components/Empty'

export const dynamic = 'force-dynamic'

// Your deal pipeline (leads + invoices), grouped by status.
const STAGES = ['open', 'new', 'contacted', 'pending', 'won', 'done', 'lost']

export default async function Pipeline() {
  const all = await getRecords()
  const rows = all.filter(r => r.category && DEAL_CATS.includes(r.category))
  const stages = STAGES.filter(st => rows.some(r => r.status === st))

  return (
    <>
      <h1 className="ph">Pipeline</h1>
      <p className="cap">Your leads &amp; invoices, grouped by status</p>
      {all.length === 0 ? <Empty /> : rows.length === 0 ? (
        <p className="empty">No leads or invoices yet — add some on the Dashboard.</p>
      ) : (
        <div className="cols">
          {stages.map(st => {
            const items = rows.filter(r => r.status === st)
            return (
              <div className="col" key={st}>
                <h3>{st} · {items.length}</h3>
                {items.map(r => (
                  <div className="kc" key={r.id}>
                    <p className="t">{r.title}</p>
                    <p className="s">{r.amount ? rm(r.amount) : (r.category ?? '—')}</p>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
