// Set your Telegram webhook — works the same on Mac, Windows, and Linux (no curl).
// Usage:  npm run webhook:set -- https://YOUR-APP.vercel.app
// Reads TELEGRAM_BOT_TOKEN + TELEGRAM_WEBHOOK_SECRET from .env (via --env-file).
const base = process.argv[2]
const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()

if (!base) {
  console.error('Usage: npm run webhook:set -- https://YOUR-APP.vercel.app')
  process.exit(1)
}
if (!token || !secret) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET in .env — fill them in first.')
  process.exit(1)
}

const url = `${base.replace(/\/+$/, '')}/api/telegram`
const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url, secret_token: secret }),
})
const body = await res.json()
console.log(body.ok ? `✅ Webhook set to ${url}` : `❌ Failed: ${body.description}`)
console.log(body)
