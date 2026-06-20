import { supabase, supabaseConfigured } from './supabase'

// Short-term memory for the bot — keeps the last few turns so Jarvis can resolve
// "and her?" / "what about last week?". Backed by the bot_memory table.
type Turn = { q: string; a: string }

export async function loadTurns(chatId: number): Promise<string> {
  if (!supabaseConfigured) return ''   // skip the slow failing fetch before keys are set
  const { data } = await supabase.from('bot_memory').select('turns').eq('chat_id', chatId).maybeSingle()
  const turns = (data?.turns ?? []) as Turn[]
  return turns.slice(-6).map(t => `Q: ${t.q}\nA: ${t.a}`).join('\n')
}

export async function appendTurn(chatId: number, q: string, a: string) {
  if (!supabaseConfigured) return   // no memory to persist until keys are set
  const { data } = await supabase.from('bot_memory').select('turns').eq('chat_id', chatId).maybeSingle()
  const turns = ((data?.turns ?? []) as Turn[]).concat({ q, a }).slice(-6)
  await supabase.from('bot_memory').upsert({ chat_id: chatId, turns, updated_at: new Date().toISOString() })
}
