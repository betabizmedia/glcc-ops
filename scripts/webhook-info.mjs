// Check your Telegram webhook health. Usage: npm run webhook:info
// Look at "last_error_message" — that's what tells you WHY the bot is silent.
const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN in .env.')
  process.exit(1)
}
const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)
const body = await res.json()
console.log(JSON.stringify(body.result ?? body, null, 2))
if (body.result?.last_error_message) {
  console.log(`\n⚠️ Last error: ${body.result.last_error_message}`)
}
