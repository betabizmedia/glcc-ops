import { sendMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

// Daily Meta Ads report for the SUMA College webinar funnel.
// A Vercel Cron hits this at 00:00 UTC (= 08:00 Malaysia time) and texts the owner
// a weekly + yesterday performance summary. Same fail-closed CRON_SECRET guard as
// /api/digest: once CRON_SECRET is set, only Vercel can trigger it.
//
// Data comes straight from the Meta Marketing API (Graph API) — no MCP, no extra
// npm deps. The unique-lead Google Sheet dedupe is a future phase; v1 uses Meta's
// reported lead count.

const GRAPH = 'https://graph.facebook.com/v23.0'
// Which action_type counts as a "lead". Defaults to 'lead' (matches Ads Manager's
// Leads column for this account). Override via env if your account reports leads
// under a different type (e.g. onsite_conversion.lead_grouped) — no redeploy needed.
const LEAD_ACTION = (process.env.META_LEAD_ACTION_TYPE || 'lead').trim()

type Win = { since: string; until: string }
type AdsRow = { spend: number; leads: number; name?: string }

// --- Date math, all in Malaysia time (UTC+8) ---
// Shift the clock by +8h, then read UTC getters so they reflect the MYT calendar day.
function mytShift(ms: number): Date {
  return new Date(ms + 8 * 3600 * 1000)
}
function ymd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`
}
function windows() {
  const now = mytShift(Date.now())
  const yesterday = new Date(now.getTime() - 864e5)
  // Thursday = 4 (Sun=0). Walk back to the Thursday on-or-before yesterday — the
  // webinar week resets Thu 00:00 MYT (webinar runs Wednesdays).
  const daysSinceThu = (yesterday.getUTCDay() - 4 + 7) % 7
  const weekStart = new Date(yesterday.getTime() - daysSinceThu * 864e5)
  return {
    today: ymd(now),
    yesterday: { since: ymd(yesterday), until: ymd(yesterday) } as Win,
    week: { since: ymd(weekStart), until: ymd(yesterday) } as Win,
    weekStart: ymd(weekStart),
  }
}

// --- Meta Graph API ---
function leadsFrom(actions: { action_type: string; value: string }[] | undefined): number {
  if (!actions) return 0
  return actions
    .filter(a => a.action_type === LEAD_ACTION)
    .reduce((s, a) => s + Number(a.value || 0), 0)
}

async function insights(acct: string, token: string, win: Win, level: 'account' | 'ad'): Promise<AdsRow[]> {
  const params = new URLSearchParams({
    fields: level === 'ad' ? 'ad_name,spend,actions' : 'spend,actions',
    level,
    time_range: JSON.stringify(win),
    limit: '500',
    access_token: token,
  })
  const res = await fetch(`${GRAPH}/act_${acct}/insights?${params}`, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok || json.error) {
    throw new Error(json?.error?.message || `Graph API ${res.status}`)
  }
  return (json.data || []).map((r: { spend?: string; ad_name?: string; actions?: { action_type: string; value: string }[] }) => ({
    spend: Number(r.spend || 0),
    leads: leadsFrom(r.actions),
    name: r.ad_name,
  }))
}

// --- Formatting ---
const myr = (n: number) =>
  'RM' + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const cpl = (spend: number, leads: number) => (leads > 0 ? myr(spend / leads) : '—')
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('forbidden', { status: 401 })
  }

  const owner = process.env.OWNER_CHAT_ID?.trim()
  const acct = process.env.META_AD_ACCOUNT_ID?.trim()
  const token = process.env.META_ACCESS_TOKEN?.trim()
  const w = windows()

  if (!acct || !token) {
    const why = `⚠️ Ads report not configured: ${!acct ? 'META_AD_ACCOUNT_ID' : 'META_ACCESS_TOKEN'} is missing.`
    if (owner) await sendMessage(owner, why)
    return Response.json({ ok: false, error: 'missing META env', sent: !!owner })
  }

  try {
    const [weekAcc, dayAcc, weekAds] = await Promise.all([
      insights(acct, token, w.week, 'account'),
      insights(acct, token, w.yesterday, 'account'),
      insights(acct, token, w.week, 'ad'),
    ])

    const week = weekAcc[0] || { spend: 0, leads: 0 }
    const day = dayAcc[0] || { spend: 0, leads: 0 }
    const top = weekAds.filter(a => a.leads > 0).sort((a, b) => b.leads - a.leads)[0]

    const msg =
      `📊 <b>SUMA College — Ads Report</b>\n` +
      `🗓 ${w.today} (8:00 MYT)\n\n` +
      `📅 <b>This week</b> (since Thu ${w.weekStart})\n` +
      `• Leads: <b>${week.leads}</b>\n` +
      `• Spend: <b>${myr(week.spend)}</b>\n` +
      `• CPL: <b>${cpl(week.spend, week.leads)}</b>\n\n` +
      `🌙 <b>Yesterday</b> (${w.yesterday.since})\n` +
      `• Leads: <b>${day.leads}</b>\n` +
      `• Spend: <b>${myr(day.spend)}</b>\n` +
      `• CPL: <b>${cpl(day.spend, day.leads)}</b>\n\n` +
      `🏆 <b>Top creative this week</b>\n` +
      (top ? `• ${esc(top.name || 'Unnamed ad')} — ${top.leads} leads` : `• No leads recorded yet`)

    if (owner) await sendMessage(owner, msg)
    return Response.json({ ok: true, sent: !!owner, week, day, top: top || null })
  } catch (e) {
    const why = `⚠️ Ads report failed: ${(e as Error).message}`
    if (owner) await sendMessage(owner, why)
    return Response.json({ ok: false, error: (e as Error).message, sent: !!owner })
  }
}
