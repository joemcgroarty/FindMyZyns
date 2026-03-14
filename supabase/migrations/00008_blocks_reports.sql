create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references public.profiles(id) on delete cascade,
  blocked_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint unique_block unique (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id != blocked_id)
);

create index idx_blocks_blocker on public.blocks(blocker_id);
create index idx_blocks_blocked on public.blocks(blocked_id);

alter table public.blocks enable row level security;

create policy "Users manage own blocks"
  on public.blocks for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

create table public.reports (
  id              uuid primary key default gen_random_uuid(),
  reporter_id     uuid not null references public.profiles(id),
  reported_id     uuid not null references public.profiles(id),
  reason          text not null check (reason in (
    'inappropriate_behavior', 'harassment', 'spam_fake', 'safety_concern', 'other'
  )),
  details         text constraint details_length check (char_length(details) <= 2000),
  connection_id   uuid references public.connections(id),
  status          text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at      timestamptz not null default now()
);

create index idx_reports_reported on public.reports(reported_id);

alter table public.reports enable row level security;

create policy "Users create own reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users read own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);
