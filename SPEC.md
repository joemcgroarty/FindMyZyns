# FindMyZyns — Software Engineering Specification

> **Version:** 1.0.0
> **Last Updated:** 2026-03-14
> **Status:** Pre-Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack & Toolchain](#3-tech-stack--toolchain)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Database Design](#5-database-design)
6. [API Layer](#6-api-layer)
7. [Real-Time System](#7-real-time-system)
8. [Geolocation & Mapping](#8-geolocation--mapping)
9. [Feature Specifications](#9-feature-specifications)
10. [Screen-by-Screen Breakdown](#10-screen-by-screen-breakdown)
11. [State Management](#11-state-management)
12. [Push Notifications](#12-push-notifications)
13. [File Storage](#13-file-storage)
14. [Security & Privacy](#14-security--privacy)
15. [Performance Budget](#15-performance-budget)
16. [Error Handling Strategy](#16-error-handling-strategy)
17. [Testing Strategy](#17-testing-strategy)
18. [Deployment & CI/CD](#18-deployment--cicd)
19. [Analytics & Observability](#19-analytics--observability)
20. [Implementation Phases](#20-implementation-phases)

---

## 1. Executive Summary

**FindMyZyns** is a hyper-local, real-time social network that connects nicotine users for peer-to-peer sharing and nearby retail discovery. The core interaction loop: a user who has nicotine to share goes live on the map, a user who needs nicotine finds them, they connect via ephemeral chat, meet up, share, and both walk away with a real human connection — and a karma score that reflects their generosity.

### Core Value Proposition

- **For Sharers:** Social capital (karma), meeting people, community status
- **For Needers:** Instant access to nicotine from nearby humans or stores
- **For Everyone:** Real-world connections that combat isolation

### Success Metrics (North Stars)

| Metric | Target (6 months post-launch) |
|---|---|
| DAU / MAU ratio | > 30% |
| Avg. time to first connection | < 60 seconds |
| Share completion rate | > 70% of accepted connections |
| D7 retention | > 25% |
| Avg. session duration | > 3 minutes |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE CLIENT                           │
│              React Native (Expo Managed)                    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Map View │  │ Profiles │  │   Chat   │  │   Auth     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │              │             │               │         │
│  ┌────┴──────────────┴─────────────┴───────────────┴──────┐  │
│  │              Zustand Store (Global State)               │  │
│  └────┬──────────────┬─────────────┬───────────────┬──────┘  │
│       │              │             │               │         │
│  ┌────┴──────────────┴─────────────┴───────────────┴──────┐  │
│  │             Supabase Client SDK (JS)                    │  │
│  └────────────────────────┬────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTPS / WSS
┌───────────────────────────┼──────────────────────────────────┐
│                     SUPABASE CLOUD                           │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Auth       │  │  Realtime    │  │  Edge Functions     │  │
│  │  (GoTrue)   │  │  (Channels) │  │  (Deno Runtime)     │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘  │
│         │                │                      │             │
│  ┌──────┴────────────────┴──────────────────────┴──────────┐  │
│  │                  PostgreSQL + PostGIS                    │  │
│  │               (Row Level Security ON)                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────┐  ┌────────────────────────────────────┐  │
│  │  Storage        │  │  pg_cron (Karma recalc, cleanup)  │  │
│  │  (S3-compat)    │  │                                    │  │
│  └─────────────────┘  └────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               │   EXTERNAL SERVICES     │
               │                         │
               │  - Google Places API    │
               │  - Expo Push Service    │
               │  - Apple/Google Maps    │
               │    (deep-link only)     │
               └─────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Supabase over custom backend | Auth, Realtime, Postgres, Storage, Edge Functions — one platform. Eliminates 80% of backend boilerplate. |
| PostGIS for geospatial | Native `ST_DWithin` queries for "users within X meters" — orders of magnitude faster than Haversine in application code. |
| Edge Functions over REST | Serverless Deno functions for business logic that must be trusted (karma mutations, connection management). Prevents client-side tampering. |
| Zustand over Redux/Context | Minimal boilerplate, great React Native perf, built-in subscriptions, tiny bundle size. |
| Expo Managed Workflow | Faster dev cycles, OTA updates, EAS Build for native binaries. Eject only if a native module demands it. |

---

## 3. Tech Stack & Toolchain

### Runtime & Framework

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React Native | 0.76+ | Cross-platform mobile UI |
| Platform | Expo SDK | 52+ | Managed workflow, OTA updates |
| Language | TypeScript | 5.x | Type safety across entire codebase |
| Navigation | Expo Router | v4 | File-based routing, deep linking |
| Styling | NativeWind | v4 | Tailwind CSS for React Native |

### Backend & Data

| Layer | Technology | Purpose |
|---|---|---|
| BaaS | Supabase | Auth, DB, Realtime, Storage, Edge Functions |
| Database | PostgreSQL 15+ | Primary data store |
| Geospatial | PostGIS extension | Spatial queries, distance calculations |
| Serverless | Supabase Edge Functions (Deno) | Trusted business logic |
| Caching | Supabase Realtime | Live state sync (no separate cache layer needed at MVP) |

### External APIs

| Service | Purpose | Auth |
|---|---|---|
| Google Places API (New) | Nearby store search, place details | API Key (restricted) |
| Expo Push Notifications | Cross-platform push delivery | Expo push token |

### Dev Toolchain

| Tool | Purpose |
|---|---|
| ESLint + Prettier | Linting & formatting |
| Vitest | Unit & integration tests |
| Detox or Maestro | E2E mobile testing |
| EAS Build | Cloud-based native builds |
| EAS Update | OTA JavaScript updates |
| GitHub Actions | CI/CD pipeline |
| Supabase CLI | Local dev, migrations, type generation |

---

## 4. Authentication & Authorization

### Auth Flows

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  Splash     │────>│  Sign Up /   │────>│  Onboarding    │
│  Screen     │     │  Log In      │     │  (username,    │
│             │     │              │     │   avatar, tour) │
└─────────────┘     └──────────────┘     └───────┬────────┘
                                                  │
                                                  v
                                         ┌────────────────┐
                                         │  Map (Home)    │
                                         └────────────────┘
```

#### Supported Providers

1. **Email + Password** — Supabase GoTrue, email confirmation required
2. **Sign in with Apple** — Required for iOS App Store
3. **Sign in with Google** — OAuth 2.0 via Supabase

#### Session Management

- Supabase handles JWT refresh automatically via the client SDK
- Access tokens expire after 1 hour; refresh tokens are long-lived
- On app foreground, silently refresh the session
- On 401 from any API call, redirect to login

#### Authorization Model

All authorization is enforced via **Postgres Row Level Security (RLS)**. The client never has direct write access to another user's data.

```sql
-- Example RLS policy: users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Example: anyone authenticated can read profiles of sharing users
create policy "Read sharing profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');
```

Critical mutations (karma changes, share completion) are handled exclusively by Edge Functions that use the **service role key** — never exposed to the client.

---

## 5. Database Design

### Entity-Relationship Diagram

```
auth.users (Supabase managed)
    │
    │ 1:1
    v
profiles ──────────< products
    │                    │
    │ 1:N (as sharer)    │ 0..1 (shared product)
    │ 1:N (as receiver)  │
    v                    v
shares <─────────────────┘
    │
connections
    │
    │ 1:N
    v
messages
```

### Table Definitions

#### `profiles`

Extends `auth.users`. Source of truth for user identity, status, and location.

```sql
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null
                  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name  text not null default ''
                  constraint display_name_length check (char_length(display_name) <= 50),
  avatar_url    text,
  karma         integer not null default 0,
  status        text not null default 'offline'
                  check (status in ('sharing', 'needing', 'offline')),
  sharing_product_id uuid references public.products(id) on delete set null,
  location      geography(Point, 4326),  -- PostGIS geography type
  location_updated_at timestamptz,
  push_token    text,                     -- Expo push token
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Spatial index for proximity queries
create index idx_profiles_location on public.profiles using gist(location);

-- Index for filtering sharing users
create index idx_profiles_status on public.profiles(status) where status = 'sharing';

-- Trigger: auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();
```

#### `products`

A user's personal collection of nicotine products.

```sql
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null constraint product_name_length check (char_length(name) <= 100),
  brand       text constraint brand_length check (char_length(brand) <= 100),
  type        text not null
                check (type in ('pouches', 'vape', 'cigarettes', 'dip', 'snus', 'other')),
  flavor      text,
  strength    text,              -- e.g., "6mg", "Strong", "3%"
  photo_url   text,
  created_at  timestamptz not null default now()
);

create index idx_products_user on public.products(user_id);
```

#### `connections`

Represents a connection request between a Needer and a Sharer.

```sql
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
  for each row execute function update_updated_at();
```

#### `messages`

Ephemeral chat messages scoped to a connection.

```sql
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  connection_id   uuid not null references public.connections(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id),
  body            text not null constraint message_length check (char_length(body) <= 1000),
  created_at      timestamptz not null default now()
);

create index idx_messages_connection on public.messages(connection_id, created_at);
```

#### `shares`

Immutable ledger of completed share transactions. This is the karma source of truth.

```sql
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
  created_at          timestamptz not null default now(),

  constraint no_self_share check (sharer_id != receiver_id)
);

create index idx_shares_sharer on public.shares(sharer_id);
create index idx_shares_receiver on public.shares(receiver_id);

-- Trigger: when both confirm, mark completed and update karma
create or replace function complete_share()
returns trigger as $$
begin
  if new.sharer_confirmed = true and new.receiver_confirmed = true and old.completed = false then
    new.completed := true;
    new.completed_at := now();

    update public.profiles set karma = karma + 1 where id = new.sharer_id;
    update public.profiles set karma = karma - 1 where id = new.receiver_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_complete_share
  before update on public.shares
  for each row execute function complete_share();
```

### Row Level Security Policies

```sql
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

create policy "Users manage own products"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

-- Shares are created/updated ONLY via Edge Functions (service role)
```

---

## 6. API Layer

### Client-Side (Supabase JS SDK)

All standard CRUD operations go through the Supabase client SDK directly, protected by RLS.

```typescript
// Example: fetch nearby sharing users
const { data: nearbyUsers } = await supabase.rpc('get_nearby_sharers', {
  user_lat: currentLocation.latitude,
  user_lng: currentLocation.longitude,
  radius_meters: 5000,
});
```

### Postgres Functions (RPC)

#### `get_nearby_sharers`

```sql
create or replace function get_nearby_sharers(
  user_lat double precision,
  user_lng double precision,
  radius_meters integer default 5000
)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  karma integer,
  latitude double precision,
  longitude double precision,
  product_name text,
  product_type text,
  product_brand text,
  distance_meters double precision
)
language sql stable
security definer
as $$
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.karma,
    ST_Y(p.location::geometry) as latitude,
    ST_X(p.location::geometry) as longitude,
    pr.name as product_name,
    pr.type as product_type,
    pr.brand as product_brand,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  from public.profiles p
  left join public.products pr on p.sharing_product_id = pr.id
  where p.status = 'sharing'
    and p.location is not null
    and ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  order by distance_meters;
$$;
```

#### `get_user_stats`

```sql
create or replace function get_user_stats(target_user_id uuid)
returns json
language sql stable
security invoker
as $$
  select json_build_object(
    'shares_given', (select count(*) from public.shares where sharer_id = target_user_id and completed = true),
    'shares_received', (select count(*) from public.shares where receiver_id = target_user_id and completed = true),
    'member_since', (select created_at from public.profiles where id = target_user_id)
  );
$$;
```

### Edge Functions

Edge Functions handle trusted operations that must not be tampered with from the client.

#### `POST /functions/v1/create-connection`

Creates a connection request and sends a push notification to the responder.

```typescript
// Input
{ responder_id: string }

// Logic
// 1. Validate requester is authenticated and status = 'needing'
// 2. Validate responder exists and status = 'sharing'
// 3. Check no existing pending/accepted connection between these users
// 4. Check requester has < 3 pending connections
// 5. Insert into connections table
// 6. Send push notification to responder via Expo Push API
// 7. Return connection object

// Output
{ connection: Connection }
```

#### `POST /functions/v1/respond-connection`

Accept or decline a connection request.

```typescript
// Input
{ connection_id: string, action: 'accept' | 'decline' }

// Logic
// 1. Validate caller is the responder
// 2. Validate connection status is 'pending'
// 3. If accepting, check responder has no other active connections
// 4. Update connection status
// 5. If accepted, create a shares record (unconfirmed)
// 6. Send push notification to requester
// 7. Return updated connection

// Output
{ connection: Connection }
```

#### `POST /functions/v1/confirm-share`

Confirm that a share transaction happened (called by each participant).

```typescript
// Input
{ share_id: string }

// Logic
// 1. Validate caller is either sharer or receiver
// 2. Check no duplicate share between same pair in last 24h
// 3. Set the appropriate confirmed flag
// 4. The DB trigger handles: if both confirmed -> complete + karma update
// 5. If completed, update connection status to 'completed'
// 6. Send push notification to other party
// 7. Return updated share

// Output
{ share: Share }
```

---

## 7. Real-Time System

### Supabase Realtime Channels

| Channel | Table/Event | Purpose | Subscribers |
|---|---|---|---|
| `map-updates` | `profiles` (UPDATE where status = 'sharing') | Live location updates on the map | All users with map open |
| `connection:{id}` | `connections` (UPDATE) | Connection status changes | Both participants |
| `chat:{connection_id}` | `messages` (INSERT) | New chat messages | Both participants |
| `user:{id}` | `connections` (INSERT where responder_id = id) | Incoming connection requests | Individual user |

### Implementation Pattern

```typescript
// Subscribe to nearby sharing users
const mapChannel = supabase
  .channel('map-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: 'status=eq.sharing',
    },
    (payload) => {
      updateMapPin(payload.new);
    }
  )
  .subscribe();
```

### Location Broadcasting

When a user is in "Sharing" status, the client sends location updates:

- **Frequency:** Every 10 seconds while app is foregrounded
- **Threshold:** Only send if user has moved > 10 meters since last update
- **Method:** Direct Supabase update to own profile row (RLS allows self-update)

```typescript
await supabase
  .from('profiles')
  .update({
    location: `POINT(${longitude} ${latitude})`,
    location_updated_at: new Date().toISOString(),
  })
  .eq('id', userId);
```

---

## 8. Geolocation & Mapping

### React Native Maps Configuration

```typescript
// Map provider selection
const MAP_CONFIG = {
  provider: Platform.OS === 'ios' ? 'apple' : 'google',
  initialRegion: {
    latitudeDelta: 0.01,   // ~1km view
    longitudeDelta: 0.01,
  },
  minZoomLevel: 10,
  maxZoomLevel: 20,
};
```

### Location Permissions Strategy

```
App Launch
    │
    ├── First time? -> Show custom pre-permission screen explaining WHY
    │                  ("FindMyZyns needs your location to find nicotine near you")
    │                  └── User taps "Enable" -> Request OS permission
    │
    ├── Permission granted -> Use foreground location
    │
    └── Permission denied -> Show map centered on manual city search
                            (degraded but functional experience)
```

- **Foreground only** — never request background location (battery + privacy)
- Use `expo-location` with `Accuracy.Balanced` (good enough for city-block precision, saves battery)

### Google Places Integration

#### Nearby Store Search

```typescript
// Edge Function or direct client call (API key restricted to app bundle ID)
const PLACE_TYPES = ['gas_station', 'convenience_store'];
const KEYWORD = 'vape OR smoke OR tobacco OR nicotine';

// Google Places Nearby Search (New)
const response = await fetch(
  'https://places.googleapis.com/v1/places:searchNearby',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours,places.id',
    },
    body: JSON.stringify({
      includedTypes: PLACE_TYPES,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 5000.0,
        },
      },
    }),
  }
);
```

### Map Pin Design

| Pin Type | Visual | Color | Size |
|---|---|---|---|
| Sharing User (karma < 10) | User avatar in circle | Green border | 40px |
| Sharing User (karma 10-49) | User avatar + silver check | Silver border | 40px |
| Sharing User (karma 50-99) | User avatar + gold glow | Gold border | 44px |
| Sharing User (karma 100+) | User avatar + diamond badge | Diamond/blue border | 48px |
| Store | Shopping bag icon | Blue | 32px |
| User's own location | Pulsing dot | White | 16px |

---

## 9. Feature Specifications

### 9.1 Status Toggle

**Component:** `StatusToggle` — persistent FAB (Floating Action Button) on the map screen.

```
States:
  ┌──────────┐
  │ OFFLINE  │ <-- default
  └────┬─────┘
       │ tap
       v
  ┌──────────────────────────────┐
  │  Choose: Sharing or Needing  │
  └──────┬───────────┬───────────┘
         │           │
         v           v
  ┌──────────┐  ┌──────────┐
  │ SHARING  │  │ NEEDING  │
  │ (pick    │  │ (browse) │
  │ product) │  │          │
  └──────────┘  └──────────┘
```

- Toggling to Sharing opens a product picker bottom sheet
- Toggling to Offline stops location broadcasting immediately
- Status persists across app backgrounding but resets to Offline after 2 hours of inactivity

### 9.2 Karma System

#### Karma Tiers

| Tier | Karma Range | Visual Badge | Map Pin Effect |
|---|---|---|---|
| Newcomer | < 0 | None (red tint) | Standard pin |
| Neutral | 0 - 9 | None | Standard pin |
| Contributor | 10 - 49 | Silver checkmark | Standard pin |
| Generous | 50 - 99 | Gold star | Gold glow |
| Legend | 100+ | Diamond | Diamond glow + larger pin |

#### Anti-Gaming Rules

- A user pair can only complete **1 share per 24 hours** (prevents karma farming between friends)
- Both users must independently confirm — no auto-complete
- Shares are immutable once completed — no undo
- Karma is a server-side computed value; client never writes to it directly

### 9.3 Connection Flow — Detailed State Machine

```
                    ┌──────────┐
         ┌─────────│ PENDING  │──────────┐
         │         └──────────┘          │
    requester               responder
    cancels                 responds
         │                       │
         v                  ┌────┴─────┐
  ┌────────────┐     ┌──────┤          ├──────┐
  │ CANCELLED  │     │ ACCEPTED       │ DECLINED
  └────────────┘     │      │         └──────────┘
                     │      v
                     │  Chat opens
                     │  Share record created
                     │      │
                     │  Both confirm
                     │      │
                     │      v
                     │ ┌───────────┐
                     └>│ COMPLETED │
                       └───────────┘
```

- **Timeout:** Pending connections auto-decline after 5 minutes (Edge Function cron or client-side)
- **Concurrency:** A Sharer can have at most 1 active (accepted) connection at a time
- **A Needer can have at most 3 pending requests** at a time (prevents spam)

### 9.4 Ephemeral Chat

- Messages are plain text only (no images, no links — keep it simple at MVP)
- Max message length: 1,000 characters
- Chat is only available when connection status = 'accepted'
- Messages are soft-deleted (cascade) when the connection is completed or after 24 hours — whichever is first
- No chat history preserved between sessions (ephemeral by design — encourages in-person interaction)

---

## 10. Screen-by-Screen Breakdown

### Navigation Structure (Expo Router)

```
app/
├── _layout.tsx                    # Root layout (auth check, theme)
├── index.tsx                      # Splash / redirect
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-password.tsx
├── (onboarding)/
│   ├── _layout.tsx
│   ├── username.tsx
│   ├── avatar.tsx
│   └── tutorial.tsx
├── (tabs)/
│   ├── _layout.tsx                # Tab bar layout
│   ├── map.tsx                    # Home — the map
│   ├── profile.tsx                # Own profile
│   └── settings.tsx
├── user/
│   └── [id].tsx                   # Other user's profile
├── connection/
│   └── [id].tsx                   # Active connection (chat + confirm)
└── product/
    ├── new.tsx
    └── [id]/
        └── edit.tsx
```

### Screen Detail: Map (Home)

```
┌──────────────────────────────────────────┐
│ ┌──────────────────────────────────────┐ │
│ │           Search Bar                 │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              ┌─────┐                     │
│              │ P1  │ <- User pin         │
│              └─────┘                     │
│                                          │
│    ┌─────┐              ┌─────┐          │
│    │ S1  │              │ P2  │          │
│    └─────┘              └─────┘          │
│                 MAP                      │
│                                          │
│         ┌─────┐                          │
│         │ P3  │                          │
│         └─────┘                          │
│                                          │
│                                          │
│                                          │
│                         ┌──────────────┐ │
│                         │  Status FAB  │ │
│                         │   OFFLINE v  │ │
│                         └──────────────┘ │
│──────────────────────────────────────────│
│    Map    │    Profile    │    Settings   │
└──────────────────────────────────────────┘
```

### Screen Detail: Profile

```
┌──────────────────────────────────────────┐
│         ┌──────────────┐                 │
│         │   Avatar     │    [Edit]       │
│         └──────────────┘                 │
│         @username                        │
│         Display Name                     │
│                                          │
│    ┌────────────────────────────────┐    │
│    │      Karma: +42               │    │
│    │      Contributor Tier          │    │
│    └────────────────────────────────┘    │
│                                          │
│    ┌────────┐  ┌────────┐  ┌────────┐   │
│    │Given:27│  │Got: 15 │  │Since:  │   │
│    │ shares │  │shares  │  │Jan '26 │   │
│    └────────┘  └────────┘  └────────┘   │
│                                          │
│    My Products                  [+ Add]  │
│    ┌────────────────────────────────┐    │
│    │ Zyn Cool Mint 6mg             │    │
│    ├────────────────────────────────┤    │
│    │ Velo Citrus 4mg               │    │
│    ├────────────────────────────────┤    │
│    │ On! Wintergreen 8mg           │    │
│    └────────────────────────────────┘    │
│──────────────────────────────────────────│
│    Map    │    Profile    │    Settings   │
└──────────────────────────────────────────┘
```

### Screen Detail: Chat / Active Connection

```
┌──────────────────────────────────────────┐
│  < Back        @username        [Close]  │
│──────────────────────────────────────────│
│                                          │
│         ┌────────────────────┐           │
│         │ hey, I'm near the  │           │
│         │ coffee shop on 5th │           │
│         └────────────────────┘           │
│                                          │
│  ┌────────────────────┐                  │
│  │ cool, be there in  │                  │
│  │ 2 min              │                  │
│  └────────────────────┘                  │
│                                          │
│                                          │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │      Complete Share              │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────┐  ┌──────────┐  │
│  │  Type a message...   │  │  Send    │  │
│  └──────────────────────┘  └──────────┘  │
└──────────────────────────────────────────┘
```

---

## 11. State Management

### Zustand Store Architecture

```typescript
// stores/useAuthStore.ts
interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// stores/useMapStore.ts
interface MapState {
  region: Region;
  nearbySharers: SharerPin[];
  nearbyStores: StorePin[];
  selectedPin: SharerPin | StorePin | null;
  setRegion: (region: Region) => void;
  fetchNearbySharers: (lat: number, lng: number) => Promise<void>;
  fetchNearbyStores: (lat: number, lng: number) => Promise<void>;
  selectPin: (pin: SharerPin | StorePin | null) => void;
}

// stores/useStatusStore.ts
interface StatusState {
  status: 'offline' | 'sharing' | 'needing';
  sharingProduct: Product | null;
  setStatus: (status: string, productId?: string) => Promise<void>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
}

// stores/useConnectionStore.ts
interface ConnectionState {
  activeConnection: Connection | null;
  pendingRequests: Connection[];
  messages: Message[];
  createConnection: (responderId: string) => Promise<void>;
  respondToConnection: (id: string, action: 'accept' | 'decline') => Promise<void>;
  sendMessage: (body: string) => Promise<void>;
  confirmShare: (shareId: string) => Promise<void>;
}
```

### Type Definitions

```typescript
// types/index.ts
interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  karma: number;
  status: 'sharing' | 'needing' | 'offline';
  sharing_product_id: string | null;
  location: { latitude: number; longitude: number } | null;
  push_token: string | null;
  created_at: string;
}

interface Product {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  type: 'pouches' | 'vape' | 'cigarettes' | 'dip' | 'snus' | 'other';
  flavor: string | null;
  strength: string | null;
  photo_url: string | null;
}

interface Connection {
  id: string;
  requester_id: string;
  responder_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  created_at: string;
}

interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface Share {
  id: string;
  connection_id: string;
  sharer_id: string;
  receiver_id: string;
  product_id: string | null;
  sharer_confirmed: boolean;
  receiver_confirmed: boolean;
  completed: boolean;
  completed_at: string | null;
}

interface SharerPin {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  karma: number;
  latitude: number;
  longitude: number;
  product_name: string;
  product_type: string;
  product_brand: string | null;
  distance_meters: number;
}

interface StorePin {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  is_open: boolean | null;
}
```

---

## 12. Push Notifications

### Notification Types

| Event | Recipient | Title | Body | Deep Link |
|---|---|---|---|---|
| Connection request | Sharer | "New connection request" | "{username} wants to connect for {product}" | `/connection/{id}` |
| Connection accepted | Requester | "Connection accepted!" | "{username} accepted your request" | `/connection/{id}` |
| Connection declined | Requester | "Connection declined" | "{username} isn't available right now" | `/map` |
| Share confirmed | Other party | "Share confirmed!" | "Karma updated. You're at {karma} now" | `/profile` |

### Implementation

- Use **Expo Notifications** for cross-platform push
- Store `ExpoPushToken` in the `profiles.push_token` column
- Edge Functions send push via `expo-server-sdk` (Deno-compatible)

```typescript
// In Edge Function
import { Expo } from 'expo-server-sdk';

const expo = new Expo();
await expo.sendPushNotificationsAsync([{
  to: recipientPushToken,
  title: 'New connection request',
  body: `${requesterName} wants to connect for ${productName}`,
  data: { connectionId, screen: 'connection' },
}]);
```

---

## 13. File Storage

### Supabase Storage Buckets

| Bucket | Purpose | Access | Max Size |
|---|---|---|---|
| `avatars` | User profile photos | Public read, authenticated write (own files only) | 2 MB |
| `products` | Product photos | Public read, authenticated write (own files only) | 5 MB |

### Upload Flow

1. Client compresses image to max 1024x1024, JPEG quality 80%
2. Upload to Supabase Storage with path: `{bucket}/{user_id}/{uuid}.jpg`
3. Store the returned public URL in the relevant table column
4. Old file is deleted when URL is overwritten (Edge Function cleanup)

### Storage Policies

```sql
-- Avatars: users can only upload to their own folder
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for all authenticated users
create policy "Public avatar read"
  on storage.objects for select
  using (bucket_id = 'avatars');
```

---

## 14. Security & Privacy

### Threat Model

| Threat | Mitigation |
|---|---|
| Location stalking | Location only broadcast while status = 'sharing'; exact coordinates rounded to ~50m for map display; user can go offline instantly |
| Karma manipulation | Karma mutations only via server-side trigger + Edge Functions; 1 share per pair per 24h limit |
| Spam connection requests | Max 3 pending requests per Needer; auto-decline after 5 min timeout |
| Chat abuse | Report/block functionality (v2); message length limits; no media in chat |
| API key exposure | Google Places API key restricted by app bundle ID + API; Supabase anon key is safe by design (RLS enforces access) |
| Account takeover | Email confirmation required; OAuth providers handle 2FA |
| SQL injection | All queries via Supabase SDK (parameterized); no raw SQL from client |

### Privacy Controls

- Users can delete their account (cascading delete of all data)
- Location data is ephemeral — cleared when user goes offline
- No location history is stored
- Chat messages are deleted within 24 hours of connection completion
- Profile visibility: all authenticated users can see profiles (future: block list)

### Data Retention

| Data | Retention |
|---|---|
| Profile data | Until account deletion |
| Products | Until user deletes or account deletion |
| Location | Only while status = 'sharing' (cleared on offline) |
| Chat messages | 24 hours after connection completion |
| Share records | Permanent (karma audit trail) |
| Connection records | 30 days after completion |

---

## 15. Performance Budget

| Metric | Target | Measurement |
|---|---|---|
| App cold start | < 2s | Expo performance monitor |
| Map initial load | < 1.5s | Time from mount to pins rendered |
| Time to interactive (auth -> map) | < 3s | Custom timing |
| Map pan/zoom FPS | 60fps | React Native perf monitor |
| Location update round-trip | < 500ms | Client -> Supabase -> Realtime -> other clients |
| JS bundle size | < 5 MB | EAS Build output |
| API response (p95) | < 300ms | Supabase dashboard |

### Optimization Strategies

- **Map pin clustering** at low zoom levels (`react-native-map-clustering`)
- **Debounced location updates** (10s interval, 10m movement threshold)
- **Lazy-load** screens with Expo Router's built-in code splitting
- **Image caching** via `expo-image` (built-in disk cache)
- **Optimistic UI** for status changes, message sends, and karma updates
- **Paginated queries** for product lists and chat history (cursor-based)

---

## 16. Error Handling Strategy

### Error Categories

```typescript
enum ErrorType {
  NETWORK = 'network',        // No internet, timeout
  AUTH = 'auth',              // Session expired, unauthorized
  VALIDATION = 'validation',  // Bad input
  NOT_FOUND = 'not_found',    // Resource doesn't exist
  CONFLICT = 'conflict',      // Duplicate, stale state
  RATE_LIMIT = 'rate_limit',  // Too many requests
  SERVER = 'server',          // 500s
}
```

### User-Facing Error States

| Scenario | UI Treatment |
|---|---|
| No internet | Banner at top: "No connection. Retrying..." with auto-retry |
| Session expired | Redirect to login with toast: "Session expired. Please log in again." |
| Location permission denied | Map shows with overlay: "Enable location to find nicotine near you" + settings deep link |
| No sharers nearby | Empty state illustration: "No one sharing nearby. Be the first!" |
| Connection request failed | Toast: "Couldn't send request. Try again." |
| Google Places API error | Store pins hidden; user pins still functional; silent error log |

---

## 17. Testing Strategy

### Test Pyramid

```
         ┌──────────┐
         │   E2E    │  Maestro / Detox
         │  (few)   │  Critical paths only
         ├──────────┤
         │ Integr.  │  Supabase local + Edge Functions
         │ (some)   │  API contract tests
         ├──────────┤
         │  Unit    │  Vitest
         │ (many)   │  Store logic, utils, pure functions
         └──────────┘
```

### Critical E2E Flows

1. Sign up -> onboarding -> land on map
2. Go to Sharing -> appear on map -> receive connection -> accept -> chat -> confirm share -> karma updates
3. Go to Needing -> find Sharer -> connect -> chat -> confirm share
4. Add product -> edit product -> delete product
5. Offline -> Sharing -> Offline (location clears)

### Unit Test Targets

- Zustand store actions and selectors
- Karma tier calculation logic
- Location update throttling/debouncing
- Connection state machine transitions
- Input validation (username format, message length)

---

## 18. Deployment & CI/CD

### Pipeline

```
Push to main
    │
    ├── Lint (ESLint)
    ├── Type check (tsc --noEmit)
    ├── Unit tests (Vitest)
    ├── Supabase migration check (supabase db lint)
    │
    ├── [on PR merge] ──> EAS Update (OTA JS bundle)
    │
    └── [on version tag] ──> EAS Build (native binary)
                                ├── iOS -> TestFlight -> App Store
                                └── Android -> Internal Track -> Play Store
```

### Environment Strategy

| Environment | Supabase Project | Purpose |
|---|---|---|
| Local | `supabase start` (Docker) | Development |
| Staging | Separate Supabase project | QA, E2E tests |
| Production | Production Supabase project | Live users |

### Database Migrations

- All schema changes via `supabase migration new` — checked into git
- Migrations run automatically on `supabase db push` (staging) and via CI for production
- Never modify production schema manually

---

## 19. Analytics & Observability

### Key Events to Track

| Event | Properties |
|---|---|
| `status_changed` | `from`, `to`, `product_id` |
| `connection_requested` | `responder_id`, `distance_meters` |
| `connection_responded` | `connection_id`, `action` |
| `share_completed` | `connection_id`, `time_to_complete` |
| `store_tapped` | `place_id`, `store_name` |
| `product_added` | `type`, `brand` |
| `map_viewed` | `sharers_visible_count`, `stores_visible_count` |

### Monitoring

- **Supabase Dashboard** — DB health, API latency, auth events, Realtime connections
- **Sentry** (via `sentry-expo`) — crash reporting, JS error tracking
- **Expo Analytics** — OTA update adoption, build distribution

---

## 20. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** App boots, user can sign up, log in, and see a blank map.

- [ ] Initialize Expo project with TypeScript, NativeWind, Expo Router
- [ ] Set up Supabase project + local dev environment
- [ ] Create database tables + initial migration
- [ ] Implement auth flow (sign up, log in, log out)
- [ ] Build onboarding screens (username, avatar, tutorial)
- [ ] Tab navigation skeleton (Map, Profile, Settings)
- [ ] Map screen with user's current location (no pins yet)

### Phase 2: Profiles & Products (Week 3)

**Goal:** Users have rich profiles and can curate their product collections.

- [ ] Profile screen (own profile — display, karma placeholder, stats)
- [ ] Edit profile screen (display name, avatar upload)
- [ ] Product CRUD (add, edit, delete products)
- [ ] Product photo upload to Supabase Storage
- [ ] Other user profile screen (view-only)
- [ ] Settings screen (account management, log out)

### Phase 3: The Living Map (Week 4-5)

**Goal:** Sharing users appear on the map in real-time.

- [ ] Status toggle (FAB) with Offline / Sharing / Needing states
- [ ] Product picker bottom sheet (when going to Sharing)
- [ ] Location broadcasting (when Sharing)
- [ ] `get_nearby_sharers` Postgres function with PostGIS
- [ ] Render user pins on map with avatar, karma badge
- [ ] Pin tap -> quick-view card with Connect button
- [ ] Supabase Realtime subscription for live pin updates
- [ ] Auto-offline after 2 hours of inactivity

### Phase 4: Store Locator (Week 5)

**Goal:** Nearby nicotine retailers appear on the map.

- [ ] Google Places API integration (nearby search)
- [ ] Render store pins on map (distinct from user pins)
- [ ] Store detail card (name, address, rating, hours)
- [ ] "Get Directions" deep link to Apple/Google Maps
- [ ] Cache store results for 15 minutes to reduce API costs

### Phase 5: Connection & Chat (Week 6-7)

**Goal:** Users can connect, chat, and meet up.

- [ ] "Connect" button on sharer quick-view card
- [ ] `create-connection` Edge Function + push notification
- [ ] Accept/decline UI for sharers
- [ ] `respond-connection` Edge Function
- [ ] Ephemeral chat (Supabase Realtime messages)
- [ ] Chat UI (message list + input)
- [ ] Connection state management (pending -> accepted -> completed)
- [ ] Cancel/timeout handling

### Phase 6: Karma & Confirmation (Week 7-8)

**Goal:** Shares are confirmed, karma flows, badges appear.

- [ ] "Complete Share" button in active connection screen
- [ ] `confirm-share` Edge Function
- [ ] Mutual confirmation UI (both sides)
- [ ] Karma trigger (DB function: +1/-1 on completion)
- [ ] Karma tier badges on map pins
- [ ] Anti-gaming: 1 share per pair per 24h enforcement
- [ ] Post-share rating (thumbs up/down)

### Phase 7: Polish & Launch Prep (Week 9-10)

**Goal:** Production-ready, smooth, delightful.

- [ ] Loading skeletons on all data-dependent screens
- [ ] Empty states with illustrations
- [ ] Error boundaries and error state UI
- [ ] Haptic feedback on key interactions
- [ ] Animations (pin appear/disappear, status change, karma update)
- [ ] Message cleanup cron (delete messages > 24h old)
- [ ] Stale connection cleanup (auto-decline > 5 min pending)
- [ ] App icon, splash screen, store listing assets
- [ ] Sentry integration for crash reporting
- [ ] Final round of E2E testing
- [ ] EAS Build -> TestFlight / Internal Track
- [ ] Submit to App Store + Google Play

---

*This specification is a living document. Update it as requirements evolve and architectural decisions are made during implementation.*
