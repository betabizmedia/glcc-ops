import { supabase, supabaseConfigured, supabaseKeyRole } from '@/lib/supabase'

// Loud, friendly banner that tells a beginner WHICH layer is wrong — so a key
// problem doesn't look like an empty database. Server component (safe).
export default async function ConnStatus() {
  if (!supabaseConfigured) {
    return (
      <div className="banner">
        ⚠️ Supabase not connected — add <code>SUPABASE_URL</code> and{' '}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> to your <code>.env</code> (the O &amp; E steps), then refresh.
        <br />On <b>Vercel</b>: add them in <b>Settings → Environment Variables</b>, then <b>Redeploy</b> — env changes don't apply to a deploy that already ran.
      </div>
    )
  }
  // Catch the WRONG key BEFORE we query — anon/publishable can't read past RLS,
  // so it would otherwise look like an empty database with no error at all.
  if (supabaseKeyRole() === 'anon') {
    return (
      <div className="banner">
        ⚠️ That looks like the <b>anon / publishable</b> key — the dashboard needs the{' '}
        <code>service_role</code> (secret) key. In Supabase: <b>Settings → API Keys → service_role → Reveal</b>,
        copy it into <code>SUPABASE_SERVICE_ROLE_KEY</code>, then redeploy.
      </div>
    )
  }
  const { error } = await supabase.from('records').select('id').limit(1)
  if (error) {
    return (
      <div className="banner">
        ⚠️ Supabase rejected the request: <b>{error.message}</b>. Make sure you used the{' '}
        <code>service_role</code> key (not <code>publishable</code>/<code>anon</code>) and that you ran{' '}
        <code>supabase/schema.sql</code>.
      </div>
    )
  }
  return null
}
