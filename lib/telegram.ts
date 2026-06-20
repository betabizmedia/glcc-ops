// Minimal Telegram sender. Reads the bot token from env at call time (never
// inline it on a command line). Safe to call even before the token is set — it
// just no-ops with a warning so the app doesn't crash.
export async function sendMessage(chatId: string | number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (!token) {
    console.warn('[GLCC] TELEGRAM_BOT_TOKEN not set yet — skipping sendMessage.')
    return
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    console.error('[GLCC] Telegram sendMessage failed:', body.description || res.status)
  }
}
