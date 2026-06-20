import { getRecords, m } from '@/lib/records'
import Empty from '@/app/_components/Empty'

export const dynamic = 'force-dynamic'

// A lightweight CRM. category === 'contact'. Extra fields live in `meta`.
export default async function Contacts() {
  const all = await getRecords()
  const rows = all.filter(r => r.category === 'contact')

  return (
    <>
      <h1 className="ph">Contacts</h1>
      <p className="cap">People &amp; companies · {rows.length} total</p>
      {rows.length === 0 ? <Empty /> : (
        <table className="tbl">
          <thead><tr><th>Name</th><th>Company</th><th>Role</th><th>Source</th><th>Last contact</th><th>Next action</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{m(r, 'company')}</td>
                <td>{m(r, 'role')}</td>
                <td>{m(r, 'source')}</td>
                <td>{m(r, 'last_contact')}</td>
                <td>{m(r, 'next')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
