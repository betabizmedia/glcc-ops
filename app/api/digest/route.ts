import { sendMessage } from '@/lib/telegram'
import { getRecords, rm, todayISO, DEAL_CATS, NEW_CATS } from '@/lib/records'

export const dynamic = 'force-dynamic'

// The Y step: a Vercel Cron hits this once a day and texts the owner a summary.
// If you set a CRON_SECRET env var, Vercel Cron sends it as a Bearer token and
// this route rejects anyone else. Without it, the route is open (demo-friendly).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('forbidden', { status: 401 })
  }
  const rows = await getRecords()
  const open = rows.filter(r => ['open', 'new', 'contacted', 'pending'].includes(r.status) && !NEW_CATS.includes(r.category ?? '')).length
  const pipeline = rows.filter(r => r.category && DEAL_CATS.includes(r.category) && !['done', 'lost'].includes(r.status)).reduce((s, r) => s + Number(r.amount || 0), 0)
  const today = todayISO()
  const soon = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10)
  const relevant = rows.filter(r => r.due_date && r.due_date <= soon && !NEW_CATS.includes(r.category ?? '') && !['done', 'lost'].includes(r.status))
  const overdue = relevant.filter(r => r.due_date! < today)
  const upcoming = relevant.filter(r => r.due_date! >= today)

  const msg =
    `☀️ <b>Daily digest</b>\n` +
    `📦 ${rows.length} records · ${open} open\n` +
    `💰 Pipeline: <b>${rm(pipeline)}</b>\n` +
    (overdue.length ? `\n🔴 <b>Overdue:</b>\n` + overdue.map(r => `• ${r.title} (${r.due_date})`).join('\n') : '') +
    (upcoming.length ? `\n⏳ <b>Due in 3 days:</b>\n` + upcoming.map(r => `• ${r.title} (${r.due_date})`).join('\n') : '') +
    (!overdue.length && !upcoming.length ? `\n✅ Nothing due in the next 3 days.` : '')

  const owner = process.env.OWNER_CHAT_ID?.trim()
  if (owner) await sendMessage(owner, msg)
  return Response.json({ ok: true, sent: !!owner })
}
