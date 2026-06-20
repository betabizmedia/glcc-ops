import Office from './Office'

export const dynamic = 'force-dynamic'

// Server component (keeps the service_role key server-side). The animated office
// + the "run" button live in the 'use client' <Office> child, which talks to the
// server ONLY through /api/jarvis-oyen — it never imports lib/supabase.
export default function Agents() {
  return (
    <>
      <h1 className="ph">AI Agents</h1>
      <p className="cap">Your AI team — working your HQ around the clock</p>
      <Office />
    </>
  )
}
