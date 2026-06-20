-- ============================================================
-- GLCC STARTER — your "second brain". Paste this whole block into
-- the Supabase SQL Editor (your own project, free tier) and Run once.
-- Safe to re-run: it never duplicates or deletes your rows.
-- ============================================================

-- 1) The universal second brain. One row = one thing you track.
create table if not exists records (
  id          bigint generated always as identity primary key,
  title       text        not null,                  -- "Acme Sdn Bhd", "Invoice #014", "Reel: 3 AI tips"
  status      text        not null default 'open',    -- open | pending | won | done | active | scheduled... (free text)
  amount      numeric     default 0,                  -- RM value if money-related, else 0
  category    text,                                   -- lead | invoice | task | post | project | contact | content
  due_date    date,                                   -- optional deadline
  notes       text,                                   -- free text
  meta        jsonb       not null default '{}'::jsonb,-- extra per-tab fields (owner, client, platform, %...)
  created_at  timestamptz not null default now()
);

-- If you ran an OLDER version of this file before, the table already exists and
-- the line above won't add the new `meta` column — so add it explicitly here.
-- `add column if not exists` is safe to run any number of times.
alter table records add column if not exists meta jsonb not null default '{}'::jsonb;

-- 2) Bot short-term memory (read/written by lib/bot-memory.ts).
create table if not exists bot_memory (
  chat_id     bigint      primary key,
  turns       jsonb       not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Security: server-side only. No public/anon access.
-- Your Next.js server reads/writes with the SERVICE_ROLE key, which bypasses RLS.
alter table records    enable row level security;
alter table bot_memory enable row level security;

-- ⚠️ The SERVICE_ROLE key reads/writes your ENTIRE database and IGNORES these
--    rules. Keep it ONLY in your gitignored .env and Vercel server env. Never
--    put it in a "use client" file, never log it, never expose a public route
--    that returns raw rows.

-- ============================================================
-- SEED ROWS — so the 8 tabs show something live on minute one.
-- The `where not exists` guard means re-running this file is SAFE: seeds only
-- insert when the table is empty, so you never get duplicates.
-- Day 2: clear these and add your own real data for your vertical.
-- ============================================================
insert into records (title, status, amount, category, due_date, notes, meta)
select * from (values
  -- deals & work (Dashboard / Pipeline / Money / Tasks)
  ('Acme Sdn Bhd',                'open',     5000, 'lead',    current_date + 6,  'Met at workshop, wants AI audit',  '{}'::jsonb),
  ('Invoice #001 - Acme',         'pending',  5000, 'invoice', current_date + 11, 'Sent, awaiting bank transfer',     '{}'::jsonb),
  ('Beta Trading',                'won',      3200, 'lead',    null,              'Closed - onboarding next week',    '{}'::jsonb),
  ('Reel: 3 ways AI saves time',  'done',        0, 'post',    current_date + 1,  'Posted, 12k views',                '{}'::jsonb),
  ('Onboard Beta Trading',        'open',        0, 'task',    current_date + 8,  'Kickoff call + setup',             '{}'::jsonb),
  ('Invoice #002 - Lai',          'pending',  2400, 'invoice', current_date - 2,  'Overdue - chase payment',          '{}'::jsonb),
  ('Follow up Keith',             'open',        0, 'task',    current_date + 2,  'Send proposal recap',              '{}'::jsonb),
  ('Cendana Group',               'open',     4500, 'lead',    current_date + 14, 'Referral - warm',                  '{}'::jsonb),
  -- Projects tab
  ('Website Revamp',  'active',   8500, 'project', current_date + 28, 'Full site revamp',         '{"client":"Caremetic Sdn Bhd","owner":"Sean","start":"2026-06-01","pct":60}'::jsonb),
  ('CRM Migration',   'active',  12000, 'project', current_date + 40, 'Move to new CRM',          '{"client":"Lai Holdings","owner":"Mei","start":"2026-06-10","pct":25}'::jsonb),
  ('Brand Shoot',     'on_hold',  3000, 'project', current_date + 15, 'Waiting on product samples','{"client":"Beta Trading","owner":"Sean","start":"2026-05-20","pct":40}'::jsonb),
  -- Contacts tab
  ('Keith Lim',       'lead',        0, 'contact', null, 'Met at expo',   '{"company":"Cendana Group","role":"Procurement Manager","source":"referral","last_contact":"2026-06-15","next":"send proposal"}'::jsonb),
  ('Aisha Rahman',    'contacted',   0, 'contact', null, 'Warm inbound',  '{"company":"Acme Sdn Bhd","role":"Operations Lead","source":"event","last_contact":"2026-06-12","next":"book demo"}'::jsonb),
  ('Daniel Tan',      'new',         0, 'contact', null, 'From IG ad',    '{"company":"Tan F&B","role":"Owner","source":"ad","last_contact":"2026-06-16","next":"qualify"}'::jsonb),
  -- Content tab
  ('3 ways AI saves you 10 hours', 'scheduled', 0, 'content', current_date + 3, 'Reel for IG',  '{"platform":"IG","format":"reel","views":0}'::jsonb),
  ('Client case study carousel',   'draft',     0, 'content', null,             'For LinkedIn', '{"platform":"LinkedIn","format":"carousel","views":0}'::jsonb),
  ('Behind the scenes: workshop',  'posted',    0, 'content', current_date - 2, 'TikTok BTS',   '{"platform":"TikTok","format":"reel","views":12000}'::jsonb)
) as seed(title, status, amount, category, due_date, notes, meta)
where not exists (select 1 from records);
