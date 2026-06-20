'use client'
import { useState } from 'react'

// This is the ONLY 'use client' page. It must NEVER import lib/supabase or
// lib/records (those carry the service_role key) — it only ever calls the server
// through fetch('/api/jarvis-oyen').
//
// Add an agent? Add an entry here + a matching .w<N> keyframe in globals.css.
const AGENTS = [
  { key: 'oyen',      name: 'Jarvis Oyen', emoji: '🐱', tag: 'proactive', role: 'Chief of Staff. Reviews everything and pings you + your team on Telegram with what\'s overdue, blocked, and the top next steps.' },
  { key: 'jarvis',    name: 'Jarvis',      emoji: '💬', tag: 'live',       role: 'Q&A bot. Ask it anything about your data on Telegram — "how much is in pipeline?"' },
  { key: 'digest',    name: 'Digest',      emoji: '📅', tag: 'live',       role: 'Texts you a one-glance summary of your HQ every morning.' },
  { key: 'scribe',    name: 'Scribe',      emoji: '✍️', tag: 'soon',       role: 'Drafts captions & posts for your Content tab. (Day-2 skill-pack.)' },
  { key: 'collector', name: 'Collector',   emoji: '💰', tag: 'soon',       role: 'Chases your overdue invoices automatically. (Day-2 skill-pack.)' },
  { key: 'scout',     name: 'Scout',       emoji: '🔎', tag: 'soon',       role: 'Researches new leads for your Pipeline. (Day-2 skill-pack.)' },
]

export default function Office() {
  const [sel, setSel] = useState('oyen')
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)

  const agent = AGENTS.find(a => a.key === sel)

  async function run() {
    setLoading(true); setBrief('')
    try {
      const res = await fetch('/api/jarvis-oyen?preview=1', { headers: { 'x-glcc-preview': '1' } })
      const data = await res.json().catch(() => ({}))
      if (data.ok && data.briefing) setBrief(data.briefing.replace(/<\/?b>/g, '').replace(/<\/?i>/g, ''))
      else if (data.reason === 'no_api_key') setBrief('⚙️ Add your ANTHROPIC_API_KEY (the N step) — then Jarvis Oyen can brief you here. This is expected before setup, not a bug.')
      else if (data.reason === 'api_error') setBrief('⚙️ Your ANTHROPIC_API_KEY errored — check it has credit, then try again.')
      else setBrief('Could not reach the agent yet. It lights up once you\'ve added your ANTHROPIC_API_KEY and deployed.')
    } catch {
      setBrief('Could not reach the agent yet. It lights up once you\'ve added your ANTHROPIC_API_KEY and deployed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="office" aria-label="AI agents office">
        {AGENTS.map((a, i) => (
          <button
            key={a.key}
            className={`agent w${i}${a.tag === 'soon' ? ' soon' : ''}${sel === a.key ? ' on' : ''}`}
            onClick={() => setSel(a.key)}
            title={a.name}
          >
            <span className="ava">{a.emoji}</span>
            <span className="nm">{a.name}</span>
          </button>
        ))}
        <span className="office-hint">hover to pause · click an agent</span>
      </div>

      {agent && (
        <div className="agent-card">
          <p className="ac-name">
            {agent.emoji} {agent.name}
            <span className={`tag ${agent.tag}`}>
              {agent.tag === 'soon' ? 'Day-2 skill-pack' : agent.tag}
            </span>
          </p>
          <p className="ac-role">{agent.role}</p>
          {agent.key === 'oyen' && (
            <>
              <button className="btn" onClick={run} disabled={loading}>
                {loading ? 'Thinking…' : 'Run now (preview)'}
              </button>
              {brief && <pre className="brief">{brief}</pre>}
            </>
          )}
        </div>
      )}
    </>
  )
}
