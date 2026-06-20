# Go-Live Coaching (OPTIONAL — off by default)

Kingsley / Claude Malaysia can coach you for 60 days after the workshop by
reviewing your CODE (never your data). Nothing happens unless YOU turn it on.

## What you're authorizing if you opt in (exactly 3 things)
1. Facilitators get READ access to your repo to comment/coach, for 60 days.
2. A weekly automated Claude code-review CLONES your repo's CODE and posts a
   feedback issue.
3. On each deploy, your build sends METADATA ONLY — your name, your chosen
   vertical, your repo URL, your live Vercel URL, and the time of last deploy —
   to the coaching dashboard.

❌ NEVER your records / customers / business data — that stays in YOUR Supabase
   and your gitignored `.env`. This repo holds CODE + sample seed rows only.

## To OPT IN (only if you want coaching)
1. On GitHub, open your repo → **Settings → Secrets and variables → Actions →
   Variables** tab → **New repository variable**.
2. Name it `COACH_OPT_IN`, value `true`. Save.
   (This is a repo *Variable*, set in the GitHub UI — NOT a line you commit.
    Editing files in the repo can't turn this on, which is the point.)
3. Add two more Variables the same way: `NAME` (your name) and `VERTICAL`
   (one of: `marketing | finance | sales | proposals | delivery`).
4. Add the phone-home secret: **Settings → Secrets and variables → Actions →
   Secrets** tab → New repository secret → name `GLCC_TOKEN`, value = the token
   your facilitator gives you.
5. Turn on the workflow itself: on GitHub click **Add file → Create new file**,
   set the path to `.github/workflows/phone-home.yml`, and paste in the contents
   of **`coaching/phone-home.yml`** from this repo → **Commit**. (Do this in the
   GitHub **web UI** — that way you don't need a `workflow`-scoped token. The file
   ships under `/coaching` by default precisely so your Day-1 `git push` is never
   rejected.)
6. Give the coach **Read** access so reviews + backups can clone your CODE:
   **Settings → Collaborators → Add people** → type `kingsleylow123` → pick
   **Read**. Read-only — we can never change or delete your repo.
7. A facilitator will help you do all of this in the **Day-2 opt-in ritual**.

## To OPT OUT later
Set the `COACH_OPT_IN` variable back to `false` (or delete it, or delete
`.github/workflows/phone-home.yml`). Revocable anytime. You own this repo —
fork it private or remove Kingsley's org access whenever you want.
