import { supabase, supabaseConfigured } from './supabase'

// One row of the "second brain". The whole app reads this single table.
// `meta` is a free-form bag of extra fields each tab can use (e.g. a Project's
// owner/%complete, a Contact's company/role) — so we stay ONE table, not many.
export type Rec = {
  id: number
  title: string
  status: string
  amount: number
  category: string | null
  due_date: string | null
  notes: string | null
  meta: Record<string, any>
  created_at: string
}

// Every tab calls this, then filters in its own way.
export async function getRecords(): Promise<Rec[]> {
  // Before Supabase is wired (placeholder env), skip the fetch entirely — a bad
  // or unreachable URL otherwise hangs ~7s per request before failing. The
  // ConnStatus banner tells the user to add their keys. (Found in the live run.)
  if (!supabaseConfigured) return []
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.warn('[GLCC] could not read records:', error.message)
  // Default meta to {} so a row added before the meta column existed never crashes a tab.
  return (data ?? []).map(r => ({ ...r, meta: r.meta ?? {} })) as Rec[]
}

// Read one field out of a record's meta bag, with a dash fallback for display.
export const m = (r: Rec, k: string) => {
  const v = r.meta?.[k]
  return v === undefined || v === null || v === '' ? '—' : v
}

export const rm = (n: number) => 'RM ' + Number(n || 0).toLocaleString('en-MY')

// Status buckets (free text, so we group loosely).
export const STILL_OPEN = ['open', 'new', 'contacted', 'pending']
export const CLOSED = ['won', 'done', 'paid', 'lost']

// Category buckets. Each tab owns a category so the new tabs (project/contact/
// content) don't pollute the deal/money/task numbers on the original tabs.
export const DEAL_CATS = ['lead', 'invoice']            // Money + Pipeline + Dashboard "Pipeline RM"
export const TASK_CATS = ['task']                       // (kept for reference)
export const NEW_CATS  = ['project', 'contact', 'content'] // the tabs added at GLCC

export const todayISO = () => new Date().toISOString().slice(0, 10)
