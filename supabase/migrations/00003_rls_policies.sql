-- ============================================
-- Row Level Security Policies
-- ============================================

-- PROFILES
alter table public.profiles enable row level security;

create policy "Public read for authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- PRODUCTS
alter table public.products enable row level security;

create policy "Public read products"
  on public.products for select
  using (auth.role() = 'authenticated');

create policy "Users insert own products"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "Users update own products"
  on public.products for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own products"
  on public.products for delete
  using (auth.uid() = user_id);

-- CONNECTIONS
alter table public.connections enable row level security;

create policy "Users see own connections"
  on public.connections for select
  using (auth.uid() in (requester_id, responder_id));

create policy "Authenticated users create connections"
  on public.connections for insert
  with check (auth.uid() = requester_id);

create policy "Participants update connections"
  on public.connections for update
  using (auth.uid() in (requester_id, responder_id));

-- MESSAGES
alter table public.messages enable row level security;

create policy "Connection participants read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.connections c
      where c.id = connection_id
      and auth.uid() in (c.requester_id, c.responder_id)
    )
  );

create policy "Connection participants send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.connections c
      where c.id = connection_id
      and c.status = 'accepted'
      and auth.uid() in (c.requester_id, c.responder_id)
    )
  );

-- SHARES
alter table public.shares enable row level security;

create policy "Participants read own shares"
  on public.shares for select
  using (auth.uid() in (sharer_id, receiver_id));
