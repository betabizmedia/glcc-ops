import { getRecords, todayISO, NEW_CATS } from '@/lib/records'
import Empty from '@/app/_components/Empty'

export const dynamic = 'force-dynamic'

// Anything with a due date (leads, invoices, tasks, posts), soonest first.
// Projects/Contacts/Content have their own tabs, so we keep them out of here.
export default async function Tasks() {
  const today = todayISO()
  const all = await getRecords()
  const rows = all
    .filter(r => r.due_date && !NEW_CATS.includes(r.category ?? '') && !['done', 'lost', 'paid'].includes(r.status))
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
  const overdue = rows.filter(r => r.due_date! < today).length

  return (
    <>
      <h1 className="ph">Tasks</h1>
      <p className="cap">Anything with a due date · {overdue} overdue</p>
      {all.length === 0 ? <Empty /> : rows.length === 0 ? (
        <p className="empty">Nothing has a due date yet — add one on the Dashboard.</p>
      ) : (
        <table className="tbl">
          <thead><tr><th>Title</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(r => {
              const od = r.due_date! < today
              return (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td style={od ? { color: '#ff9b9b' } : undefined}>{r.due_date}</td>
                  <td><span className={`pill ${od ? 'overdue' : r.status}`}>{od ? 'overdue' : r.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </>
  )
}
