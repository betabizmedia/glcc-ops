import { createClient } from '@supabase/supabase-js'

// Server-only Supabase client.
//
// We use the service_role key, which bypasses all security rules — so this file
// must NEVER be imported into a "use client" component. Keep it server-side.

// Clean the env values so the most common copy-paste mistakes don't break deploy:
//  • .trim() strips a stray newline/space — those are ILLEGAL in an HTTP header
//    and otherwise crash EVERY request with
//    "TypeError: Headers.set: <key> is an invalid header value".
//  • the URL is normalised to the base project URL, so pasting the
//    "…supabase.co/rest/v1" REST endpoint (a very common slip) still works.
const cleanUrl = (process.env.SUPABASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '')            // drop trailing slash(es)
  .replace(/\/rest\/v\d+$/i, '')  // drop a pasted /rest/v1 endpoint
const cleanKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()

// The `|| 'placeholder'` fallbacks let the app build and `npm run dev` start
// even before you've added your real keys in the O/E steps.
const url = cleanUrl || 'https://placeholder.supabase.co'
const key = cleanKey || 'placeholder-key'

if (!cleanUrl || !cleanKey) {
  console.warn('[GLCC] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set yet — add them to .env (the O & E steps).')
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  // Cap every request at 4s so a wrong/unreachable SUPABASE_URL fails fast
  // instead of hanging ~7s per page (found in the live participant run).
  global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, signal: AbortSignal.timeout(4000) }) },
})

// "Configured" = REAL, non-placeholder values present (after cleaning). So a
// participant who runs `npm run dev` right after `cp .env.example .env` (before
// filling Supabase) sees the connect banner INSTANTLY instead of a ~7s hang.
export const supabaseConfigured = Boolean(
  cleanUrl && cleanKey &&
  !/YOUR-PROJECT|placeholder/i.test(cleanUrl) &&
  !/placeholder/i.test(cleanKey),
)

// Best-effort detection of the WRONG Supabase key (anon / publishable) so the UI
// can say so plainly — anon can't bypass RLS, so the dashboard would look empty
// with no error. Returns 'anon' | 'service' | 'unknown'. Never throws.
export function supabaseKeyRole(): 'anon' | 'service' | 'unknown' {
  const k = cleanKey
  if (!k) return 'unknown'
  if (k.startsWith('sb_secret_')) return 'service'        // new secret key format
  if (k.startsWith('sb_publishable_')) return 'anon'      // new publishable key format
  const parts = k.split('.')                              // legacy JWT: decode the role claim
  if (parts.length === 3) {
    try {
      const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
      const role = JSON.parse(json).role
      if (role === 'service_role') return 'service'
      if (role === 'anon') return 'anon'
    } catch { /* not a decodable JWT — fall through */ }
  }
  return 'unknown'
}
