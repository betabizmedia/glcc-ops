// Shown when there are no records yet (server component — no secrets here).
export default function Empty() {
  return (
    <div className="empty">
      No records yet — run the SQL from <code>supabase/schema.sql</code> in your Supabase
      SQL editor (the O step), wire your <code>.env</code> (the E step), then refresh.
    </div>
  )
}
