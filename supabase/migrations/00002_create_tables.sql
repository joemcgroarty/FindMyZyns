-- ============================================
-- FindMyZyns Database Schema
-- ============================================

-- Utility: auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique
                  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name  text not null default ''
                  constraint display_name_length check (char_length(display_name) <= 50),
  avatar_url    text,
  karma         integer not null default 0,
  status        text not null default 'offline'
                  check (status in ('sharing', 'needing', 'offline')),
  sharing_product_id uuid,
  location      geography(Point, 4326),
  location_updated_at timestamptz,
  push_token    text,
  safety_acknowledged boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_profiles_location on public.profiles using gist(location);
create index idx_profiles_status on public.profiles(status) where status = 'sharing';

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================
-- PRODUCTS (user's nicotine collection)
-- ============================================
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null constraint product_name_length check (char_length(name) <= 100),
  brand       text constraint brand_length check (char_length(brand) <= 100),
  type        text not null
                check (type in ('pouches', 'vape', 'cigarettes', 'dip', 'snus', 'other')),
  flavor      text,
  strength    text,
  photo_url   text,
  created_at  timestamptz not null default now()
);

create index idx_products_user on public.products(user_id);

-- Add FK from profiles.sharing_product_id now that products table exists
alter table public.profiles
  add constraint fk_sharing_product
  foreign key (sharing_product_id)
  references public.products(id)
  on delete set null;

-- ============================================
-- CONNECTIONS
-- ============================================
create table public.connections (
  id              uuid primary key default gen_random_uuid(),
  requester_id    uuid not null references public.profiles(id),
  responder_id    uuid not null references public.profiles(id),
  status          text not null default 'pending'
                    check (status in ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint no_self_connection check (requester_id != responder_id)
);

create index idx_connections_responder_pending
  on public.connections(responder_id)
  where status = 'pending';

create trigger connections_updated_at
  before update on public.connections
  for each row execute function public.update_updated_at();

-- ============================================
-- MESSAGES (ephemeral chat)
-- ============================================
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  connection_id   uuid not null references public.connections(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id),
  body            text not null constraint message_length check (char_length(body) <= 1000),
  created_at      timestamptz not null default now()
);

create index idx_messages_connection on public.messages(connection_id, created_at);

-- ============================================
-- SHARES (karma ledger)
-- ============================================
create table public.shares (
  id                  uuid primary key default gen_random_uuid(),
  connection_id       uuid not null references public.connections(id),
  sharer_id           uuid not null references public.profiles(id),
  receiver_id         uuid not null references public.profiles(id),
  product_id          uuid references public.products(id) on delete set null,
  sharer_confirmed    boolean not null default false,
  receiver_confirmed  boolean not null default false,
  completed           boolean not null default false,
  completed_at        timestamptz,
  sharer_rating       smallint check (sharer_rating in (1, -1)),
  receiver_rating     smallint check (receiver_rating in (1, -1)),
  created_at          timestamptz not null default now(),
  constraint no_self_share check (sharer_id != receiver_id)
);

create index idx_shares_sharer on public.shares(sharer_id);
create index idx_shares_receiver on public.shares(receiver_id);
