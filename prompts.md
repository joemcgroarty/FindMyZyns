# FindMyZyns

## Vision

Build **FindMyZyns** — a hyper-local social network that turns nicotine into a catalyst for real-world human connection. The thesis is simple: loneliness is an epidemic, and shared rituals bring people together. FindMyZyns is the platform where that happens.

---

## Tech Stack

- **Frontend:** React Native (Expo) — single codebase, iOS + Android
- **Backend:** Supabase (Postgres, Auth, Realtime, Edge Functions, Storage)
- **Maps:** React Native Maps + Google Places API
- **State Management:** Zustand
- **Navigation:** Expo Router (file-based routing)
- **Styling:** NativeWind (Tailwind for React Native)

---

## Core Features

### 1. The Map (Home Screen)

The map is the soul of the app. When a user opens FindMyZyns, they see a live, real-time map centered on their location.

- **User pins** appear on the map for anyone nearby who has set their status to **Sharing**
- Each pin shows the user's avatar, name, and what product they're sharing
- Tapping a pin opens a **quick-view card** with: profile photo, username, karma score, product they're sharing, and a "Connect" button
- **Store pins** show nearby nicotine retailers (gas stations, vape shops, smoke shops) pulled from Google Places API
- Store pins are visually distinct from user pins (different icon/color)
- Tapping a store pin shows: name, address, rating, hours, and a "Directions" button (deep-links to Apple/Google Maps)
- Map updates in real-time via Supabase Realtime subscriptions
- Users who are **Needing** do NOT appear on the map — they browse it

### 2. User Status System

Every user has a status that governs their visibility:

| Status | Behavior |
|---|---|
| **Sharing** | User appears on the map. They select which product they're sharing. Location broadcasts in real-time. |
| **Needing** | User does NOT appear on the map. They can browse and connect with Sharers. |
| **Offline** | Default state. User is invisible and the map is view-only. |

- Status toggle lives in a persistent bottom-sheet or FAB on the map screen
- When going to "Sharing," user picks from their saved products (or adds a new one on the spot)
- Location tracking activates only when status is Sharing (battery-conscious design)

### 3. User Profiles

Every user has a public profile:

- **Display name + avatar** (uploaded to Supabase Storage)
- **Karma score** — displayed prominently (see Karma System below)
- **Product showcase** — a grid/list of their favorite nicotine products, each with: product name, brand, type (pouches, vape, cigarettes, dip, etc.), flavor, nicotine strength, and an optional photo
- **Activity stats** — total shares given, total shares received, member since date
- Edit profile screen to manage all of the above

### 4. The Karma System

Karma is the social currency of FindMyZyns. It incentivizes generosity.

- **Sharing nicotine with someone:** Sharer gets **+1 karma**
- **Receiving nicotine from someone:** Receiver gets **-1 karma**
- Karma is a net score displayed on every user's profile and map pin
- High-karma users get a visual badge/glow on their map pin (e.g., gold pin at 50+, diamond at 100+)
- Karma transactions are logged and immutable — no gaming the system
- Both users confirm the transaction happened (mutual confirmation flow)

### 5. Connection Flow

When a Needer taps "Connect" on a Sharer's pin:

1. Sharer receives a push notification: "[Username] wants to connect!"
2. Sharer can **Accept** or **Decline**
3. On accept, a **temporary chat** opens between the two users (Supabase Realtime)
4. Chat is for coordinating the meetup — location, timing, etc.
5. After meeting up, either user can trigger **"Complete Share"**
6. Both users confirm the share happened
7. Karma is awarded: +1 to Sharer, -1 to Receiver
8. Chat closes. Both users can optionally rate the interaction (thumbs up/down)

### 6. Authentication

- **Supabase Auth** — email/password and OAuth (Google, Apple)
- Onboarding flow: Sign up -> Set display name + avatar -> Brief tutorial overlay -> Land on map
- All screens behind auth except a marketing/landing splash

---

## Database Schema (Supabase / Postgres)

```sql
-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  karma integer default 0,
  status text default 'offline' check (status in ('sharing', 'needing', 'offline')),
  sharing_product_id uuid references public.products(id),
  latitude double precision,
  longitude double precision,
  location_updated_at timestamptz,
  created_at timestamptz default now()
);

-- Nicotine products (user's collection)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  brand text,
  type text check (type in ('pouches', 'vape', 'cigarettes', 'dip', 'snus', 'other')),
  flavor text,
  strength text,
  photo_url text,
  created_at timestamptz default now()
);

-- Share transactions (karma ledger)
create table public.shares (
  id uuid default gen_random_uuid() primary key,
  sharer_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id),
  sharer_confirmed boolean default false,
  receiver_confirmed boolean default false,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Connection requests
create table public.connections (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) not null,
  responder_id uuid references public.profiles(id) not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed')),
  created_at timestamptz default now()
);

-- Chat messages (temporary, per connection)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  connection_id uuid references public.connections(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  body text not null,
  created_at timestamptz default now()
);
```

- Enable **Row Level Security** on all tables
- Enable **Supabase Realtime** on profiles (for live map pins) and messages (for chat)

---

## Screen Inventory

| Screen | Description |
|---|---|
| **Splash / Landing** | App branding, "Sign Up" and "Log In" CTAs |
| **Auth (Sign Up / Log In)** | Email + OAuth flows via Supabase Auth |
| **Onboarding** | Set username, display name, avatar upload, quick tutorial |
| **Map (Home)** | Full-screen map with user pins, store pins, status toggle, search |
| **Profile** | User's own profile — karma, products, stats, edit button |
| **Other User Profile** | View another user's profile from the map |
| **Product Add/Edit** | Form to add or edit a nicotine product in your collection |
| **Connection Request** | Notification + accept/decline UI for Sharers |
| **Chat** | Temporary 1:1 messaging during an active connection |
| **Share Confirmation** | Mutual confirmation screen post-meetup, triggers karma |
| **Settings** | Account management, notification preferences, log out |

---

## UX & Design Principles

- **Dark mode first** — the primary UI should be dark-themed, sleek, modern
- **Map-centric** — the map is always one tap away; it's the home screen
- **Minimal friction** — going from "I need nicotine" to finding someone sharing should take under 10 seconds
- **Trust signals** — karma scores, confirmation flows, and ratings build trust between strangers
- **Battery-conscious** — location tracking only when actively Sharing; efficient polling intervals

---

## Implementation Order

Build in this sequence, each phase fully functional before moving to the next:

1. **Project scaffolding** — Expo + Supabase init, navigation skeleton, auth flow
2. **Profiles & products** — Profile CRUD, product collection, avatar upload
3. **The map** — Live map with user pins (Sharing users), status toggle, real-time updates
4. **Store locator** — Google Places integration for nearby nicotine retailers
5. **Connection flow** — Request, accept/decline, temporary chat
6. **Karma system** — Share confirmation, karma ledger, badge tiers on map pins
7. **Polish** — Push notifications, animations, error states, empty states, loading skeletons
