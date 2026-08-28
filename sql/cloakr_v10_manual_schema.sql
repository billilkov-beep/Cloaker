-- Cloakr V10.2 FULL REAL APP Public Release SQL
-- Run once in Supabase SQL Editor before deploying V10.2.
-- This build uses Supabase REST through SUPABASE_SERVICE_ROLE_KEY.
-- No automatic migration and no DATABASE_URL required.
-- V10.2 includes: light Messenger/WhatsApp style UI, login success popup,
-- new-tab secure connection, SSE + 800ms polling live chat, typing animation,
-- read ticks, voice notes, image/video/document messages.

create extension if not exists pgcrypto;

drop table if exists public.ss_messages cascade;
drop table if exists public.ss_sessions cascade;
drop table if exists public.ss_auth_tokens cascade;
drop table if exists public.ss_users cascade;

create table public.ss_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_plain text not null,
  created_at timestamptz not null default now()
);

create table public.ss_auth_tokens (
  token text primary key,
  user_id uuid not null references public.ss_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.ss_sessions (
  id text primary key,
  pair_key text not null unique,
  user_a_id uuid not null references public.ss_users(id) on delete cascade,
  user_b_id uuid not null references public.ss_users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ss_sessions_not_self check (user_a_id <> user_b_id)
);

create table public.ss_messages (
  id text primary key,
  session_id text not null references public.ss_sessions(id) on delete cascade,
  sender_user_id uuid not null references public.ss_users(id) on delete cascade,
  kind text not null default 'text' check (kind in ('text','voice','image','video','document')),
  encrypted_envelope jsonb not null,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_ss_users_email_v102 on public.ss_users(email);
create index idx_ss_tokens_user_v102 on public.ss_auth_tokens(user_id);
create index idx_ss_tokens_expiry_v102 on public.ss_auth_tokens(expires_at);
create index idx_ss_sessions_pair_v102 on public.ss_sessions(pair_key);
create index idx_ss_sessions_a_v102 on public.ss_sessions(user_a_id);
create index idx_ss_sessions_b_v102 on public.ss_sessions(user_b_id);
create index idx_ss_sessions_updated_v102 on public.ss_sessions(updated_at desc);
create index idx_ss_messages_session_time_v102 on public.ss_messages(session_id, created_at);
create index idx_ss_messages_sender_v102 on public.ss_messages(sender_user_id);
create index idx_ss_messages_kind_v102 on public.ss_messages(kind);
create index idx_ss_messages_read_v102 on public.ss_messages(read_at);

alter table public.ss_users disable row level security;
alter table public.ss_auth_tokens disable row level security;
alter table public.ss_sessions disable row level security;
alter table public.ss_messages disable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.ss_users to anon, authenticated, service_role;
grant select, insert, update, delete on public.ss_auth_tokens to anon, authenticated, service_role;
grant select, insert, update, delete on public.ss_sessions to anon, authenticated, service_role;
grant select, insert, update, delete on public.ss_messages to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

insert into public.ss_users (id, name, email, password_plain, created_at)
values
  ('11111111-1111-4111-8111-111111111111', 'John Secure', 'john@securesession.test', 'John@123456', now()),
  ('22222222-2222-4222-8222-222222222222', 'Paul Private', 'paul@securesession.test', 'Paul@123456', now())
on conflict (email) do update set
  name = excluded.name,
  password_plain = excluded.password_plain;
