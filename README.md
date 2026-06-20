# GLCC Starter — Your AI HQ

A small 8-tab "AI HQ" web app, backed by **one** Supabase table, that texts you a
daily digest, answers questions on Telegram, and runs a proactive AI chief-of-staff.
You build it at the **Go Live Cloud Challenge** — identical for everyone on Day 1,
personalized to your business on Day 2.

**Framework: OYEN** — but we *build* in the order **O → E → N → Y** (you must see
your data before you can usefully query it; the automation comes last):

| Letter | Job | In this repo |
|--------|-----|--------------|
| **O** Organize | one Supabase table (your "second brain") | `supabase/schema.sql` |
| **E** Expose | the 8-tab app | `app/page.tsx` (Dashboard) + `pipeline` · `money` · `tasks` · `projects` · `contacts` · `content` · `agents` |
| **N** Navigate | ask Jarvis on Telegram | `app/api/telegram/route.ts` |
| **Y** Yield | a daily digest texted to you | `app/api/digest/route.ts` + `vercel.json` |

The first four tabs are deal/work views; **Projects · Contacts · Content** are the
same `records` table filtered by `category` (extra fields live in a `meta` column).
The **AI Agents** tab (`app/agents/`) is an animated "office" of your AI workers —
the headline one is **Jarvis Oyen** 🐱 (`app/api/jarvis-oyen/route.ts`), a proactive
chief-of-staff that reviews everything and pings you + your team on Telegram with
what's overdue, blocked, and next. Set `CRON_SECRET` to switch on its daily ping;
add `TELEGRAM_TEAM_CHAT_IDS` to include your team.

## Quick start (we do this together in class)

```bash
npm install          # install dependencies (needs Node 20.9+ — check: node -v)
cp .env.example .env # mac/linux. Windows PowerShell: Copy-Item .env.example .env
npm run dev          # open http://localhost:3000
```

1. **O** — create a Supabase project, paste `supabase/schema.sql` into the SQL
   editor, Run. Put your `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
2. **E** — `npm run dev`, see your dashboard. Push to GitHub, import to Vercel,
   add the same env vars → your live URL.
3. **N** — add `ANTHROPIC_API_KEY` + the 4 Telegram vars, deploy, then set the
   webhook (works on Mac + Windows, no curl):
   `npm run webhook:set -- https://YOUR-APP.vercel.app`
   Verify it with `npm run webhook:info` (read `last_error_message`). Press
   **Start** in your bot once so it's allowed to text you back.
4. **Y** — `vercel.json` already schedules the daily digest. The `0 1 * * *` cron
   is **UTC** = 9:00am Malaysia time.

## Add a tab later (the "expand it yourself" recipe)

Paste this into Claude Code:

> *"Add a new tab called `<NAME>` to my GLCC Starter. Copy `app/page.tsx` into
> `app/<name>/page.tsx`, keep it a server component using the service-role
> client, change the filter to `<which records this tab shows>`, and add
> `{ href: '/<name>', label: '<NAME>' }` to the `TABS` array in
> `app/_components/Nav.tsx`. Do NOT add `'use client'`. Show me the diff first."*

## Safety

Your business data lives in **your** Supabase + your gitignored `.env`. This repo
is **code only**. The `service_role` key bypasses all security rules — keep it
server-side, never in a `'use client'` file, never logged. Coaching is opt-in and
code-only — see `COACH.md`.
