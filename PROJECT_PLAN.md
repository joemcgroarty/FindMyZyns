# FindMyZyns — Project Plan

> **Version:** 1.0.0
> **Created:** 2026-03-14
> **Team Size:** 6–8 Engineers
> **Timeline:** 7 Sprints (14 Weeks)
> **Sprint Cadence:** 2 Weeks

---

## Table of Contents

1. [Team Structure & Roles](#team-structure--roles)
2. [Sprint Calendar](#sprint-calendar)
3. [Epics Overview](#epics-overview)
4. [Epic 1 — Foundation & Auth](#epic-1--foundation--auth)
5. [Epic 2 — Profiles & Products](#epic-2--profiles--products)
6. [Epic 3 — The Living Map](#epic-3--the-living-map)
7. [Epic 4 — Store Locator](#epic-4--store-locator)
8. [Epic 5 — Connections & Chat](#epic-5--connections--chat)
9. [Epic 6 — Karma System](#epic-6--karma-system)
10. [Epic 7 — Push Notifications](#epic-7--push-notifications)
11. [Epic 8 — Polish & Launch Prep](#epic-8--polish--launch-prep)
12. [Epic 9 — Safety, Trust & Completeness](#epic-9--safety-trust--completeness)
13. [Epic 10 — Beta, Hardening & Store Submission](#epic-10--beta-hardening--store-submission)
14. [Sprint Summary](#sprint-summary)
15. [Risk Register](#risk-register)
16. [Definition of Done](#definition-of-done)

---

## Team Structure & Roles

| Role | Alias | Responsibilities |
|---|---|---|
| **Tech Lead / Fullstack** | TL | Architecture decisions, code review, Supabase infra, Edge Functions, unblocking |
| **Frontend 1 — Map & Geo** | FE-MAP | Map rendering, pins, clustering, location services, Google Places |
| **Frontend 2 — Screens & UI** | FE-UI | Auth screens, onboarding, profile, settings, product CRUD, design system |
| **Frontend 3 — Real-Time & Chat** | FE-RT | Realtime subscriptions, chat UI, connection flow UI, status toggle |
| **Backend 1 — Database** | BE-DB | Schema design, migrations, PostGIS, RLS policies, Postgres functions |
| **Backend 2 — Edge Functions** | BE-EF | Edge Functions (connection, share, notification dispatch), API contracts |
| **QA / Mobile Tester** | QA | E2E test authoring, manual device testing, regression, bug triage |
| **DevOps / Build** | DEVOPS | CI/CD pipeline, EAS Build config, environment management, monitoring setup |

> For a 6-person team: merge TL + BE-EF, and QA + DEVOPS into combined roles.

---

## Sprint Calendar

| Sprint | Dates | Focus | Epics |
|---|---|---|---|
| **Sprint 1** | Week 1–2 | Foundation | Epic 1 (Foundation & Auth) |
| **Sprint 2** | Week 3–4 | Core Data | Epic 2 (Profiles & Products), Epic 3 start (Map) |
| **Sprint 3** | Week 5–6 | The Map | Epic 3 (Living Map), Epic 4 (Store Locator) |
| **Sprint 4** | Week 7–8 | Social | Epic 5 (Connections & Chat), Epic 6 (Karma) |
| **Sprint 5** | Week 9–10 | Polish | Epic 7 (Push Notifications), Epic 8 (Polish & Launch) |
| **Sprint 6** | Week 11–12 | Safety & Completeness | Epic 9 (Safety, Trust & Completeness) |
| **Sprint 7** | Week 13–14 | Beta & Ship | Epic 10 (Beta, Hardening & Store Submission) |

---

## Epics Overview

```
Sprint 1        Sprint 2        Sprint 3        Sprint 4        Sprint 5        Sprint 6        Sprint 7
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ E1: Auth │   │E2: Profs │   │ E3: Map  │   │E5: Conns │   │E7: Push  │   │E9: Safety│   │E10: Beta │
│ & Found. │   │& Product │   │ (cont.)  │   │ & Chat   │   │  Notifs  │   │ & Trust  │   │ Harden & │
│          │   │          │   │          │   │          │   │          │   │          │   │  Ship    │
│          │   │E3: Map   │   │E4: Store │   │E6: Karma │   │E8: Polish│   │          │   │          │
│          │   │ (start)  │   │ Locator  │   │          │   │          │   │          │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

---

## Epic 1 — Foundation & Auth

> **Goal:** A user can install the app, create an account, complete onboarding, and land on an empty map. The database and CI pipeline are operational.

### User Stories

#### FMZ-101: Project Scaffolding

> _As a developer, I need a properly configured Expo + TypeScript project so that all team members can clone, install, and run the app locally._

**Owner:** TL + DEVOPS
**Points:** 5
**Acceptance Criteria:**
- [ ] Expo SDK 52+ project initialized with TypeScript strict mode
- [ ] Expo Router v4 file-based navigation configured
- [ ] NativeWind v4 installed and working (Tailwind classes render correctly)
- [ ] Zustand installed with a placeholder store
- [ ] ESLint + Prettier configured with shared rules
- [ ] App builds and runs on iOS Simulator and Android Emulator
- [ ] `README.md` with setup instructions

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-101-1 | Project boots on iOS | Manual | Run `npx expo start`, open in iOS Simulator | App renders default screen without errors |
| T-101-2 | Project boots on Android | Manual | Run `npx expo start`, open in Android Emulator | App renders default screen without errors |
| T-101-3 | TypeScript strict mode | Automated | Run `tsc --noEmit` | Zero type errors |
| T-101-4 | Lint passes | Automated | Run `npx eslint .` | Zero lint errors |

---

#### FMZ-102: Supabase Project & Database Init

> _As a developer, I need a Supabase project with all tables, indexes, RLS policies, and functions so that the backend is ready for feature development._

**Owner:** BE-DB
**Points:** 8
**Acceptance Criteria:**
- [ ] Supabase project created (staging environment)
- [ ] `supabase init` + local dev environment working via Docker
- [ ] All 5 tables created via migration: `profiles`, `products`, `connections`, `messages`, `shares`
- [ ] PostGIS extension enabled
- [ ] All indexes created (spatial index on `profiles.location`, status index, etc.)
- [ ] `updated_at` trigger function applied to `profiles` and `connections`
- [ ] `complete_share` trigger function on `shares` table
- [ ] RLS enabled on all tables with initial policies
- [ ] `get_nearby_sharers` Postgres RPC function deployed
- [ ] `get_user_stats` Postgres RPC function deployed
- [ ] Supabase types auto-generated via `supabase gen types typescript`
- [ ] Seed script with test data (5 users, 10 products, 3 connections)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-102-1 | Migration applies cleanly | Automated | Run `supabase db reset` | All tables created, zero errors |
| T-102-2 | RLS blocks cross-user writes | Integration | Authenticate as User A, attempt to update User B's profile | 403 / row-level security violation |
| T-102-3 | RLS allows self-update | Integration | Authenticate as User A, update own profile | 200 / success |
| T-102-4 | Spatial query returns nearby users | Integration | Insert 2 sharing users within 1km, 1 user 50km away, call `get_nearby_sharers` with 5km radius | Returns exactly 2 users, ordered by distance |
| T-102-5 | Karma trigger fires on dual confirm | Integration | Create share, set both `sharer_confirmed` and `receiver_confirmed` to true | `completed` = true, sharer karma +1, receiver karma -1 |
| T-102-6 | Cascade delete works | Integration | Delete a user from `auth.users` | Profile, products, and messages cascade-deleted |

---

#### FMZ-103: CI/CD Pipeline

> _As a developer, I need an automated CI pipeline so that every PR is linted, type-checked, and tested before merge._

**Owner:** DEVOPS
**Points:** 3
**Acceptance Criteria:**
- [ ] GitHub Actions workflow on PR to `main`
- [ ] Steps: install -> lint -> type-check -> unit test -> Supabase migration lint
- [ ] EAS Build profile configured for `development`, `staging`, `production`
- [ ] EAS Update configured for OTA JS bundle pushes

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-103-1 | CI runs on PR | Manual | Open a PR with a lint error | Pipeline fails at lint step |
| T-103-2 | CI passes clean PR | Manual | Open a PR with clean code | All steps pass, green check |

---

#### FMZ-104: Email + Password Sign Up

> _As a new user, I want to create an account with my email and password so that I can start using FindMyZyns._

**Owner:** FE-UI + TL
**Points:** 5
**Acceptance Criteria:**
- [ ] Sign Up screen with email, password, and confirm password fields
- [ ] Client-side validation: valid email format, password min 8 characters, passwords match
- [ ] Calls Supabase `auth.signUp()`
- [ ] On success, creates a row in `profiles` table (via DB trigger or client call)
- [ ] Shows confirmation message: "Check your email to verify your account"
- [ ] Error states: email already taken, weak password, network error

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-104-1 | Successful sign up | E2E | Enter valid email + password, tap Sign Up | Confirmation message displayed, user row exists in `auth.users` and `profiles` |
| T-104-2 | Duplicate email | E2E | Sign up with already-registered email | Error: "An account with this email already exists" |
| T-104-3 | Weak password | Unit | Enter password "123" | Validation error before API call: "Password must be at least 8 characters" |
| T-104-4 | Mismatched passwords | Unit | Enter different password and confirm password | Validation error: "Passwords don't match" |
| T-104-5 | Empty fields | Unit | Tap Sign Up with empty fields | All empty fields highlighted with error |

---

#### FMZ-105: Email + Password Log In

> _As a returning user, I want to log in with my email and password so that I can access my account._

**Owner:** FE-UI
**Points:** 3
**Acceptance Criteria:**
- [ ] Log In screen with email and password fields
- [ ] Calls Supabase `auth.signInWithPassword()`
- [ ] On success, navigates to Map (home) or Onboarding (if profile incomplete)
- [ ] Error states: invalid credentials, unverified email, network error
- [ ] "Forgot password?" link navigates to password reset screen

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-105-1 | Successful login | E2E | Enter valid credentials, tap Log In | Navigates to Map screen, session stored |
| T-105-2 | Invalid credentials | E2E | Enter wrong password | Error: "Invalid email or password" |
| T-105-3 | Unverified email | E2E | Log in before verifying email | Error: "Please verify your email first" |
| T-105-4 | Session persistence | E2E | Log in, kill app, reopen | User is still logged in, lands on Map |

---

#### FMZ-106: OAuth Sign In (Apple + Google)

> _As a user, I want to sign in with Apple or Google so that I don't need to manage another password._

**Owner:** FE-UI + TL
**Points:** 5
**Acceptance Criteria:**
- [ ] "Sign in with Apple" button (required for iOS App Store)
- [ ] "Sign in with Google" button
- [ ] Both use Supabase OAuth flow
- [ ] On first sign-in, profile row created
- [ ] On subsequent sign-in, routes to Map (or Onboarding if incomplete)
- [ ] Apple Sign In hides email option handled gracefully

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-106-1 | Apple Sign In (first time) | Manual | Tap "Sign in with Apple", complete OAuth | Account created, routed to Onboarding |
| T-106-2 | Google Sign In (first time) | Manual | Tap "Sign in with Google", complete OAuth | Account created, routed to Onboarding |
| T-106-3 | Returning OAuth user | Manual | Sign in with previously used Google account | Routed directly to Map |

---

#### FMZ-107: Onboarding Flow

> _As a new user, I want to set up my username, avatar, and see a quick tutorial so that my profile is ready and I know how the app works._

**Owner:** FE-UI
**Points:** 5
**Acceptance Criteria:**
- [ ] Step 1: Username screen — input, real-time availability check, format validation (`^[a-z0-9_]{3,20}$`)
- [ ] Step 2: Avatar screen — photo picker (camera + library), crop to square, upload to Supabase Storage
- [ ] Step 3: Tutorial — 3 swipeable cards explaining: (1) The Map, (2) Sharing & Needing, (3) Karma
- [ ] Progress indicator (dots or bar)
- [ ] "Skip" option on avatar and tutorial steps
- [ ] On complete, update `profiles` row and navigate to Map

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-107-1 | Valid username accepted | E2E | Enter "cool_user_42", tap Next | Username saved, proceeds to avatar step |
| T-107-2 | Duplicate username rejected | E2E | Enter username that already exists | Error: "Username taken" shown in real-time |
| T-107-3 | Invalid username format | Unit | Enter "AB CD!" | Validation error: "Only lowercase letters, numbers, and underscores" |
| T-107-4 | Avatar upload | E2E | Select photo from library, crop, confirm | Avatar URL saved to profile, image visible |
| T-107-5 | Skip avatar | E2E | Tap "Skip" on avatar step | Proceeds to tutorial, avatar_url remains null |
| T-107-6 | Complete onboarding | E2E | Finish all steps | User lands on Map, profile is fully populated |

---

#### FMZ-108: Session Management & Auth Guard

> _As a user, I want to stay logged in across app restarts and be redirected to login if my session expires._

**Owner:** TL
**Points:** 3
**Acceptance Criteria:**
- [ ] Root layout checks Supabase session on mount
- [ ] If valid session + complete profile -> Map
- [ ] If valid session + incomplete profile -> Onboarding
- [ ] If no session -> Splash / Auth screens
- [ ] Session auto-refreshes on app foreground
- [ ] On any 401 API response, redirect to Login with toast

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-108-1 | Auto-redirect logged-in user | E2E | Open app with valid session | Lands on Map without seeing login |
| T-108-2 | Auto-redirect logged-out user | E2E | Open app with no session | Lands on Splash/Auth screen |
| T-108-3 | Session refresh on foreground | Integration | Background app for 2 hours, foreground | Session refreshed silently, no login prompt |

---

### Sprint 1 Assignments

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-101: Project Scaffolding | TL, DEVOPS | 5 |
| FMZ-102: Supabase & DB Init | BE-DB | 8 |
| FMZ-103: CI/CD Pipeline | DEVOPS | 3 |
| FMZ-104: Email Sign Up | FE-UI, TL | 5 |
| FMZ-105: Email Log In | FE-UI | 3 |
| FMZ-106: OAuth Sign In | FE-UI, TL | 5 |
| FMZ-107: Onboarding Flow | FE-UI | 5 |
| FMZ-108: Auth Guard | TL | 3 |
| **Sprint Total** | | **37 pts** |

---

## Epic 2 — Profiles & Products

> **Goal:** Users can view and edit their profile, manage a collection of nicotine products, and view other users' profiles.

### User Stories

#### FMZ-201: View Own Profile

> _As a user, I want to see my profile with my avatar, karma score, stats, and product list so that I know how I appear to others._

**Owner:** FE-UI
**Points:** 5
**Acceptance Criteria:**
- [ ] Profile tab shows: avatar, display name, @username, karma score with tier label
- [ ] Stats row: shares given, shares received, member since (calls `get_user_stats`)
- [ ] Product list section below stats
- [ ] "Edit Profile" button navigates to edit screen
- [ ] "+ Add Product" button navigates to product creation
- [ ] Pull-to-refresh reloads profile data

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-201-1 | Profile renders correctly | E2E | Navigate to Profile tab | All profile data displayed correctly |
| T-201-2 | Karma tier label | Unit | Karma = 0 -> "Neutral", 42 -> "Contributor", 75 -> "Generous", 150 -> "Legend" | Correct tier label rendered |
| T-201-3 | Empty product list | E2E | View profile with no products | Empty state: "Add your first product" with CTA |
| T-201-4 | Pull to refresh | E2E | Pull down on profile screen | Data reloads, loading indicator shown |

---

#### FMZ-202: Edit Profile

> _As a user, I want to update my display name and avatar so that I can personalize my identity._

**Owner:** FE-UI
**Points:** 3
**Acceptance Criteria:**
- [ ] Edit screen pre-populated with current display name and avatar
- [ ] Display name field with 50-character limit
- [ ] Tap avatar to replace (camera or library, crop to square)
- [ ] Save button updates `profiles` row and uploads new avatar to Storage
- [ ] Old avatar file deleted on replacement
- [ ] Cancel / back navigates without saving
- [ ] Loading state on save

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-202-1 | Update display name | E2E | Change display name, save | Profile screen reflects new name |
| T-202-2 | Update avatar | E2E | Select new photo, save | New avatar shown on profile and map pin |
| T-202-3 | Cancel without saving | E2E | Change name, press back | Original name still displayed |
| T-202-4 | Display name too long | Unit | Enter 51+ characters | Input truncated or error shown |

---

#### FMZ-203: Add Product

> _As a user, I want to add a nicotine product to my collection so that others know what I have to share._

**Owner:** FE-UI + BE-DB
**Points:** 5
**Acceptance Criteria:**
- [ ] Form fields: name (required), brand, type (picker: pouches/vape/cigarettes/dip/snus/other), flavor, strength, photo
- [ ] Photo picker with optional camera or library
- [ ] Photo uploaded to `products` Storage bucket
- [ ] Inserts row into `products` table
- [ ] On success, navigates back to profile with new product visible
- [ ] Validation: name required, max 100 chars

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-203-1 | Add product with all fields | E2E | Fill all fields including photo, tap Save | Product appears in profile list with all details |
| T-203-2 | Add product with required only | E2E | Enter only name and type, tap Save | Product created successfully |
| T-203-3 | Missing required name | Unit | Leave name empty, tap Save | Validation error on name field |
| T-203-4 | Product photo upload | E2E | Add product with photo | Photo visible on product card |

---

#### FMZ-204: Edit Product

> _As a user, I want to edit or delete products in my collection so that my list stays accurate._

**Owner:** FE-UI
**Points:** 3
**Acceptance Criteria:**
- [ ] Tap product in list -> navigate to edit screen pre-populated with data
- [ ] All fields editable (same form as Add)
- [ ] Save updates the `products` row
- [ ] Delete button with confirmation dialog ("Are you sure?")
- [ ] Delete removes row from `products` and photo from Storage

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-204-1 | Edit product name | E2E | Change product name, save | Updated name shown in profile list |
| T-204-2 | Delete product | E2E | Tap delete, confirm | Product removed from list and database |
| T-204-3 | Delete cancellation | E2E | Tap delete, cancel in dialog | Product still exists |

---

#### FMZ-205: View Other User's Profile

> _As a user, I want to view another user's profile so that I can see their karma and what products they share._

**Owner:** FE-UI
**Points:** 3
**Acceptance Criteria:**
- [ ] Accessible from map pin quick-view card ("View Profile" link)
- [ ] Shows: avatar, display name, @username, karma + tier, stats, product list
- [ ] Read-only — no edit/delete actions
- [ ] Back button returns to previous screen (map or chat)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-205-1 | View other profile from map | E2E | Tap user pin -> "View Profile" | Other user's profile displayed correctly |
| T-205-2 | Karma tier display | E2E | View profile of user with karma 75 | Shows "Generous" tier with gold badge |
| T-205-3 | No edit controls | E2E | View another user's profile | No edit button, no delete on products |

---

#### FMZ-206: Settings Screen

> _As a user, I want a settings screen where I can manage my account and preferences._

**Owner:** FE-UI
**Points:** 3
**Acceptance Criteria:**
- [ ] Log Out button (calls `supabase.auth.signOut()`, navigates to Splash)
- [ ] Delete Account button with double-confirmation dialog
- [ ] Delete cascades via Supabase (removes all user data)
- [ ] App version displayed at bottom
- [ ] Notification preferences toggle (placeholder for Sprint 5)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-206-1 | Log out | E2E | Tap Log Out | Session cleared, redirected to Splash |
| T-206-2 | Delete account | E2E | Tap Delete Account, confirm twice | All user data removed, redirected to Splash |
| T-206-3 | Cancel delete | E2E | Tap Delete Account, cancel at confirmation | Account still active |

---

### Sprint 2 Assignments (Part 1: Profiles & Products)

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-201: View Own Profile | FE-UI | 5 |
| FMZ-202: Edit Profile | FE-UI | 3 |
| FMZ-203: Add Product | FE-UI, BE-DB | 5 |
| FMZ-204: Edit Product | FE-UI | 3 |
| FMZ-205: View Other Profile | FE-UI | 3 |
| FMZ-206: Settings | FE-UI | 3 |
| **Epic 2 Total** | | **22 pts** |

---

## Epic 3 — The Living Map

> **Goal:** Sharing users appear as live pins on the map. Users can toggle their status, and the map updates in real-time.

### User Stories

#### FMZ-301: Map Screen with User Location

> _As a user, I want to see a map centered on my current location so that I know where I am relative to others._

**Owner:** FE-MAP
**Points:** 5
**Acceptance Criteria:**
- [ ] Full-screen map on the Map tab (home)
- [ ] Requests foreground location permission with custom pre-permission screen
- [ ] If granted: map centers on user's location with a pulsing blue dot
- [ ] If denied: map shows a default city view with a banner prompting to enable location
- [ ] Uses Apple Maps on iOS, Google Maps on Android
- [ ] Smooth pan, zoom, and rotate at 60fps
- [ ] Initial zoom level shows ~1km radius

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-301-1 | Map renders with location | E2E | Grant location permission, open Map tab | Map centered on current location with blue dot |
| T-301-2 | Map renders without location | E2E | Deny location permission, open Map tab | Map shows default view with "Enable location" banner |
| T-301-3 | Map gestures | Manual | Pan, pinch-zoom, rotate on map | Smooth 60fps interactions |

---

#### FMZ-302: Status Toggle FAB

> _As a user, I want to toggle my status between Offline, Sharing, and Needing so that I control my visibility and intent._

**Owner:** FE-RT
**Points:** 5
**Acceptance Criteria:**
- [ ] Floating Action Button on map screen shows current status with icon and label
- [ ] Tap opens a bottom sheet with three options: Offline, Sharing, Needing
- [ ] Selecting "Sharing" opens a product picker (list of user's products)
- [ ] On Sharing: starts location broadcasting, updates `profiles.status` and `profiles.sharing_product_id`
- [ ] On Needing: updates `profiles.status`, no location broadcast
- [ ] On Offline: stops location broadcast, clears location, updates status
- [ ] FAB color changes per status: gray (offline), green (sharing), orange (needing)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-302-1 | Toggle to Sharing | E2E | Tap FAB -> Sharing -> select product | FAB turns green, status updated in DB, location broadcasting |
| T-302-2 | Toggle to Needing | E2E | Tap FAB -> Needing | FAB turns orange, status updated, no location broadcast |
| T-302-3 | Toggle to Offline | E2E | Tap FAB -> Offline | FAB turns gray, location cleared in DB |
| T-302-4 | No products | E2E | Set to Sharing with empty product list | Prompt to add a product first (redirect to Add Product) |
| T-302-5 | Status persists on background | E2E | Set to Sharing, background app 30s, foreground | Still Sharing, still broadcasting |

---

#### FMZ-303: Location Broadcasting

> _As a sharing user, I want my location to update on the map in real-time so that Needers can find me accurately._

**Owner:** FE-MAP + BE-DB
**Points:** 5
**Acceptance Criteria:**
- [ ] When status = Sharing, client sends location update every 10 seconds
- [ ] Only sends if user has moved > 10 meters since last update
- [ ] Updates `profiles.location` (PostGIS geography) and `profiles.location_updated_at`
- [ ] Stops broadcasting immediately when status changes away from Sharing
- [ ] On Offline: `profiles.location` set to null

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-303-1 | Location updates in DB | Integration | Set to Sharing, move simulated location | `profiles.location` updated within 10 seconds |
| T-303-2 | Movement threshold | Integration | Set to Sharing, stay still for 30s | No DB updates after initial one (< 10m movement) |
| T-303-3 | Stop on Offline | Integration | Set to Sharing, then Offline | Location set to null, no more updates |

---

#### FMZ-304: Render Sharing Users as Map Pins

> _As a user, I want to see other sharing users as pins on the map so that I can find nicotine nearby._

**Owner:** FE-MAP + BE-DB
**Points:** 8
**Acceptance Criteria:**
- [ ] Calls `get_nearby_sharers` RPC on map load and on significant region change
- [ ] Renders custom pins for each sharing user: circular avatar with colored border
- [ ] Pin border color matches karma tier (default/silver/gold/diamond)
- [ ] Pins cluster at low zoom levels (react-native-map-clustering)
- [ ] Tapping a pin opens a **quick-view card** (bottom sheet) with: avatar, username, karma + tier, product name + type, distance, "Connect" button, "View Profile" link
- [ ] Quick-view card dismisses on tap-away or swipe-down

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-304-1 | Pins render for sharing users | E2E | Create 3 sharing users nearby, open map | 3 user pins visible on map |
| T-304-2 | Quick-view card | E2E | Tap a user pin | Bottom sheet shows avatar, name, karma, product, distance |
| T-304-3 | Karma tier badge | E2E | View pin for user with karma 75 | Gold border on pin, "Generous" label in quick-view |
| T-304-4 | Pin clustering | E2E | Zoom out with 10+ nearby users | Pins cluster into numbered group marker |
| T-304-5 | Offline users hidden | E2E | User goes Offline | Their pin disappears from all other users' maps |

---

#### FMZ-305: Real-Time Map Updates

> _As a user, I want the map to update live as sharers move, appear, or disappear so that I always see current information._

**Owner:** FE-RT + BE-DB
**Points:** 5
**Acceptance Criteria:**
- [ ] Subscribe to Supabase Realtime on `profiles` table (status and location changes)
- [ ] When a user goes Sharing: pin appears on nearby users' maps within 2 seconds
- [ ] When a sharing user moves: pin animates to new position
- [ ] When a user goes Offline: pin disappears within 2 seconds
- [ ] Subscription reconnects automatically on network interruption

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-305-1 | New sharer appears | E2E (2 devices) | User A goes Sharing; User B has map open | Pin for User A appears on User B's map within 2s |
| T-305-2 | Sharer disappears | E2E (2 devices) | User A goes Offline; User B watching | Pin for User A disappears within 2s |
| T-305-3 | Location updates live | E2E (2 devices) | User A moves while Sharing | Pin for User A slides to new position on User B's map |

---

#### FMZ-306: Auto-Offline on Inactivity

> _As a system, I want to automatically set users to Offline after 2 hours of inactivity so that stale pins don't pollute the map._

**Owner:** BE-EF
**Points:** 3
**Acceptance Criteria:**
- [ ] Edge Function or pg_cron job runs every 15 minutes
- [ ] Sets `status = 'offline'` and `location = null` for any user whose `location_updated_at` is > 2 hours ago and `status = 'sharing'`
- [ ] Triggers Realtime event (pin disappears for other users)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-306-1 | Stale user goes offline | Integration | Set `location_updated_at` to 3 hours ago, run cleanup | User status = 'offline', location = null |
| T-306-2 | Active user not affected | Integration | Set `location_updated_at` to 5 minutes ago, run cleanup | User status unchanged |

---

### Sprint 2 Assignments (Part 2: Map Start) + Sprint 3 Assignments

**Sprint 2 (Map start — parallel with Epic 2):**

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-301: Map + Location | FE-MAP | 5 |
| FMZ-302: Status Toggle | FE-RT | 5 |
| FMZ-303: Location Broadcasting | FE-MAP, BE-DB | 5 |
| **Sprint 2 Map Subtotal** | | **15 pts** |

**Sprint 3 (Map completion):**

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-304: User Pins | FE-MAP, BE-DB | 8 |
| FMZ-305: Real-Time Updates | FE-RT, BE-DB | 5 |
| FMZ-306: Auto-Offline | BE-EF | 3 |
| **Sprint 3 Map Subtotal** | | **16 pts** |

---

## Epic 4 — Store Locator

> **Goal:** Nearby nicotine retail stores appear on the map alongside user pins.

### User Stories

#### FMZ-401: Google Places Integration

> _As a user, I want to see nearby stores that sell nicotine on the map so that I can buy some if no one is sharing._

**Owner:** FE-MAP + BE-EF
**Points:** 8
**Acceptance Criteria:**
- [ ] Calls Google Places Nearby Search API for gas stations, convenience stores with nicotine/vape/tobacco keywords
- [ ] API call made via Edge Function (keeps API key server-side)
- [ ] Returns up to 20 stores within 5km of user's location
- [ ] Results cached for 15 minutes per geographic cell to reduce API costs
- [ ] Store pins rendered on map with distinct icon (blue shopping bag, smaller than user pins)
- [ ] Refreshes when user pans map significantly (> 2km from last search center)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-401-1 | Stores render on map | E2E | Open map in an urban area | Store pins visible alongside user pins |
| T-401-2 | Store pin distinct from user pin | Manual | View map with both user and store pins | Visually distinguishable icons and colors |
| T-401-3 | Cache hit | Integration | Call store search twice for same location within 15 min | Second call served from cache, no API call |
| T-401-4 | Map pan triggers refresh | E2E | Pan map > 2km from center | New store results loaded for new area |

---

#### FMZ-402: Store Detail Card

> _As a user, I want to tap a store pin and see its details so that I can decide whether to go there._

**Owner:** FE-MAP
**Points:** 3
**Acceptance Criteria:**
- [ ] Tap store pin opens bottom sheet with: store name, address, star rating, open/closed status, today's hours
- [ ] "Get Directions" button deep-links to Apple Maps (iOS) or Google Maps (Android)
- [ ] Card visually distinct from user quick-view card (different header color/icon)
- [ ] Dismiss on tap-away or swipe-down

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-402-1 | Store card displays info | E2E | Tap a store pin | Bottom sheet shows name, address, rating, hours |
| T-402-2 | Get Directions (iOS) | Manual | Tap "Get Directions" on iOS | Apple Maps opens with directions to store |
| T-402-3 | Get Directions (Android) | Manual | Tap "Get Directions" on Android | Google Maps opens with directions to store |
| T-402-4 | Open/closed indicator | E2E | View store detail during business hours vs after | Correct open/closed status shown |

---

### Sprint 3 Assignments (Store Locator)

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-401: Places Integration | FE-MAP, BE-EF | 8 |
| FMZ-402: Store Detail Card | FE-MAP | 3 |
| **Epic 4 Total** | | **11 pts** |

---

## Epic 5 — Connections & Chat

> **Goal:** A Needer can request to connect with a Sharer, they can accept/decline, chat to coordinate, and meet up.

### User Stories

#### FMZ-501: Send Connection Request

> _As a Needer, I want to tap "Connect" on a Sharer's pin so that I can request to meet them._

**Owner:** FE-RT + BE-EF
**Points:** 5
**Acceptance Criteria:**
- [ ] "Connect" button visible on Sharer's quick-view card (only when user status = Needing)
- [ ] Button disabled if user already has 3 pending requests (with tooltip explaining limit)
- [ ] Calls `create-connection` Edge Function
- [ ] Edge Function validates: requester is Needing, responder is Sharing, no existing pending/active connection between them
- [ ] Creates `connections` row with status = 'pending'
- [ ] UI shows "Request Sent" confirmation, button changes to "Pending..."
- [ ] Request auto-declines after 5 minutes if no response

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-501-1 | Send request successfully | E2E | As Needer, tap Connect on a Sharer | Connection created, UI shows "Pending..." |
| T-501-2 | Max pending limit | E2E | Send 3 requests, try 4th | Button disabled, tooltip: "Max 3 pending requests" |
| T-501-3 | Duplicate prevention | Integration | Send request to same user twice | Second request rejected with error |
| T-501-4 | Not visible when Offline | E2E | View Sharer pin while status = Offline | Connect button not shown |
| T-501-5 | Auto-decline timeout | Integration | Create connection, wait 5+ minutes | Connection status auto-set to 'declined' |

---

#### FMZ-502: Receive & Respond to Connection Request

> _As a Sharer, I want to be notified when someone wants to connect and accept or decline the request._

**Owner:** FE-RT + BE-EF
**Points:** 5
**Acceptance Criteria:**
- [ ] Real-time listener on `connections` table filtered to `responder_id = current_user`
- [ ] Incoming request shows as in-app alert/modal: requester avatar, username, karma, product they're seeking
- [ ] Two buttons: "Accept" and "Decline"
- [ ] Accept: calls `respond-connection` Edge Function with `action: 'accept'`, opens chat screen
- [ ] Decline: calls Edge Function with `action: 'decline'`, alert dismisses
- [ ] If Sharer already has an active connection, new requests show "Busy" and auto-queue/decline

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-502-1 | Receive request in-app | E2E (2 devices) | User A sends request to User B | User B sees in-app alert within 2 seconds |
| T-502-2 | Accept request | E2E | Sharer taps Accept | Connection status = 'accepted', both navigate to chat |
| T-502-3 | Decline request | E2E | Sharer taps Decline | Connection status = 'declined', alert dismissed |
| T-502-4 | Busy Sharer | E2E | Sharer already has active connection, new request arrives | New request auto-declined or shows "Busy" |

---

#### FMZ-503: Ephemeral Chat

> _As connected users, we want a temporary chat so that we can coordinate our meetup._

**Owner:** FE-RT + BE-DB
**Points:** 8
**Acceptance Criteria:**
- [ ] Chat screen opens for both users when connection is accepted
- [ ] Messages sent via Supabase insert (RLS allows participants to write)
- [ ] Messages received via Supabase Realtime subscription on `messages` table filtered by `connection_id`
- [ ] Message list scrolls to bottom on new message
- [ ] Text input with Send button, max 1,000 characters
- [ ] Shows sender avatar and timestamp per message
- [ ] "Complete Share" button prominently visible above chat input
- [ ] Back button returns to map (chat accessible again from an active connection indicator)
- [ ] Chat only functional when connection status = 'accepted'

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-503-1 | Send and receive message | E2E (2 devices) | User A sends message | User B receives it within 1 second |
| T-503-2 | Message ordering | E2E | Send 5 messages rapidly | All appear in correct chronological order |
| T-503-3 | Character limit | Unit | Type 1001 characters | Input capped at 1000 characters |
| T-503-4 | Chat blocked after completion | E2E | Complete a share, attempt to send message | Input disabled, message: "Connection completed" |
| T-503-5 | Return to chat | E2E | Leave chat screen, tap active connection indicator | Returns to chat with full history |

---

#### FMZ-504: Cancel Connection

> _As either participant, I want to cancel an active connection so that I can exit if plans change._

**Owner:** FE-RT + BE-EF
**Points:** 3
**Acceptance Criteria:**
- [ ] "Cancel" option accessible in chat screen (header or menu)
- [ ] Confirmation dialog: "End this connection? Chat will be closed."
- [ ] Updates connection status to 'cancelled'
- [ ] Both users returned to map, chat messages preserved for 24h then deleted
- [ ] No karma impact for cancellation

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-504-1 | Cancel connection | E2E | Tap Cancel in chat, confirm | Connection cancelled, both users back on map |
| T-504-2 | Cancel confirmation | E2E | Tap Cancel, then "No" in dialog | Connection remains active |
| T-504-3 | Other user notified | E2E (2 devices) | User A cancels | User B sees "Connection ended" and returns to map |

---

### Sprint 4 Assignments (Connections & Chat)

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-501: Send Request | FE-RT, BE-EF | 5 |
| FMZ-502: Receive & Respond | FE-RT, BE-EF | 5 |
| FMZ-503: Ephemeral Chat | FE-RT, BE-DB | 8 |
| FMZ-504: Cancel Connection | FE-RT, BE-EF | 3 |
| **Epic 5 Total** | | **21 pts** |

---

## Epic 6 — Karma System

> **Goal:** Share transactions are confirmed by both parties, karma is awarded, and badges are displayed.

### User Stories

#### FMZ-601: Initiate Share Confirmation

> _As either participant in an active connection, I want to trigger "Complete Share" so that we can confirm the transaction happened._

**Owner:** FE-RT + BE-EF
**Points:** 5
**Acceptance Criteria:**
- [ ] "Complete Share" button visible in chat screen
- [ ] Tapping creates (or retrieves existing) `shares` record via `confirm-share` Edge Function
- [ ] Sets the calling user's confirmation flag (`sharer_confirmed` or `receiver_confirmed`)
- [ ] UI shows: "Waiting for [other user] to confirm..." if other party hasn't confirmed yet
- [ ] If both confirmed: share marked completed, karma updated, connection completed

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-601-1 | Sharer confirms first | E2E | Sharer taps Complete Share | `sharer_confirmed = true`, waiting state shown |
| T-601-2 | Receiver confirms first | E2E | Receiver taps Complete Share | `receiver_confirmed = true`, waiting state shown |
| T-601-3 | Both confirm | E2E (2 devices) | Both users tap Complete Share | Share completed, karma awarded, connection completed |
| T-601-4 | Anti-gaming: duplicate share | Integration | Same pair tries to share again within 24h | Edge Function rejects: "You already shared with this user today" |

---

#### FMZ-602: Karma Display & Badges

> _As a user, I want my karma score and tier badge to be visible on my profile and map pin so that others trust me._

**Owner:** FE-MAP + FE-UI
**Points:** 3
**Acceptance Criteria:**
- [ ] Karma score shown on profile screen with tier label and icon
- [ ] Map pins have colored borders matching karma tier
- [ ] Quick-view card shows karma score and tier badge
- [ ] Karma updates optimistically in UI on share confirmation
- [ ] Tier thresholds: < 0 (red), 0-9 (default), 10-49 (silver), 50-99 (gold), 100+ (diamond)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-602-1 | Karma increments on share | E2E | Complete a share as Sharer | Profile karma increases by 1, tier updates if threshold crossed |
| T-602-2 | Karma decrements on receive | E2E | Complete a share as Receiver | Profile karma decreases by 1 |
| T-602-3 | Pin badge matches karma | E2E | User with karma 75 goes Sharing | Gold-bordered pin on map |
| T-602-4 | Negative karma display | E2E | View profile of user with karma -5 | Red tint, "Newcomer" tier |

---

#### FMZ-603: Post-Share Rating

> _As a user, I want to rate my share interaction so that the community can maintain quality._

**Owner:** FE-RT
**Points:** 2
**Acceptance Criteria:**
- [ ] After share is completed, both users see a rating prompt: thumbs up / thumbs down
- [ ] Rating stored in `shares` table (add `sharer_rating` and `receiver_rating` columns)
- [ ] Rating is optional — user can dismiss
- [ ] Ratings are private (not displayed publicly at MVP, stored for future use)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-603-1 | Submit rating | E2E | Tap thumbs up after share | Rating saved to shares record |
| T-603-2 | Skip rating | E2E | Dismiss rating prompt | No rating saved, user returns to map |

---

### Sprint 4 Assignments (Karma)

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-601: Share Confirmation | FE-RT, BE-EF | 5 |
| FMZ-602: Karma Display | FE-MAP, FE-UI | 3 |
| FMZ-603: Post-Share Rating | FE-RT | 2 |
| **Epic 6 Total** | | **10 pts** |

---

## Epic 7 — Push Notifications

> **Goal:** Users receive push notifications for connection requests, acceptances, declines, and completed shares.

### User Stories

#### FMZ-701: Push Token Registration

> _As a user, I want to register for push notifications so that I can receive alerts when someone wants to connect._

**Owner:** FE-RT + BE-DB
**Points:** 3
**Acceptance Criteria:**
- [ ] On first app launch (after auth), request notification permission
- [ ] Register Expo push token via `Notifications.getExpoPushTokenAsync()`
- [ ] Store token in `profiles.push_token`
- [ ] Re-register on app foreground if token changed

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-701-1 | Token registration | E2E | Grant notification permission | `profiles.push_token` populated |
| T-701-2 | Permission denied | E2E | Deny notification permission | App works normally, no push token stored |

---

#### FMZ-702: Connection Push Notifications

> _As a Sharer, I want to receive a push notification when someone requests to connect so that I don't miss opportunities._

**Owner:** BE-EF
**Points:** 5
**Acceptance Criteria:**
- [ ] `create-connection` Edge Function sends push to responder: "New connection request — {username} wants to connect for {product}"
- [ ] `respond-connection` Edge Function sends push to requester: "Connection accepted!" or "Connection declined"
- [ ] `confirm-share` Edge Function sends push to other party: "Share confirmed! Karma updated."
- [ ] All pushes include `data` payload with deep-link target
- [ ] Tapping push notification opens relevant screen (connection or profile)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-702-1 | Request notification received | E2E (2 devices) | User A sends connection to User B | User B receives push with User A's name |
| T-702-2 | Accept notification received | E2E (2 devices) | User B accepts | User A receives push: "Connection accepted!" |
| T-702-3 | Deep link from push | Manual | Tap push notification | App opens to correct screen |
| T-702-4 | No push to denied permissions | Integration | User with no push_token gets a connection request | No push sent, no error thrown |

---

### Sprint 5 Assignments (Push)

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-701: Push Token Registration | FE-RT, BE-DB | 3 |
| FMZ-702: Connection Pushes | BE-EF | 5 |
| **Epic 7 Total** | | **8 pts** |

---

## Epic 8 — Polish & Launch Prep

> **Goal:** The app is production-ready — smooth, resilient, delightful, and submitted to app stores.

### User Stories

#### FMZ-801: Loading & Empty States

> _As a user, I want to see loading indicators and helpful empty states so that the app never feels broken._

**Owner:** FE-UI
**Points:** 5
**Acceptance Criteria:**
- [ ] Skeleton loaders on: profile screen, product list, map initial load
- [ ] Empty states with illustration + CTA for: no products ("Add your first product"), no nearby sharers ("Be the first to share!"), no connections ("Find someone sharing nearby")
- [ ] Pull-to-refresh on all list screens
- [ ] Button loading states (disabled + spinner) on all async actions

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-801-1 | Profile skeleton | E2E | Navigate to Profile on slow connection | Skeleton UI visible before data loads |
| T-801-2 | Empty product list | E2E | View profile with no products | Illustration + "Add your first product" CTA |
| T-801-3 | Empty map | E2E | Open map with no nearby sharers | "Be the first to share!" message |

---

#### FMZ-802: Error Boundaries & Recovery

> _As a user, I want the app to handle errors gracefully so that it never crashes or shows a white screen._

**Owner:** TL + FE-UI
**Points:** 5
**Acceptance Criteria:**
- [ ] React error boundary wrapping each tab screen
- [ ] Fallback UI: "Something went wrong" with "Try Again" button
- [ ] Network error banner: "No connection. Retrying..." (auto-retry with backoff)
- [ ] Supabase Realtime reconnection on network recovery
- [ ] Toast notifications for transient errors (failed to send message, etc.)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-802-1 | Error boundary catches crash | E2E | Force a component error | Fallback UI shown, not white screen |
| T-802-2 | Network loss recovery | Manual | Toggle airplane mode on/off | Banner appears, auto-reconnects, banner dismisses |
| T-802-3 | Realtime reconnection | Manual | Kill network for 30s, restore | Map pins reappear, chat resumes |

---

#### FMZ-803: Animations & Haptics

> _As a user, I want subtle animations and haptic feedback so that the app feels premium._

**Owner:** FE-UI + FE-MAP
**Points:** 3
**Acceptance Criteria:**
- [ ] Pin appear/disappear: fade + scale animation (300ms)
- [ ] Status toggle: color transition animation
- [ ] Karma update: number counter animation (+1 / -1 tick)
- [ ] Haptic feedback on: status change, send message, share confirmation, connection accept
- [ ] Bottom sheet spring animation on open/close
- [ ] Tab bar smooth highlight transition

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-803-1 | Pin animation | Manual | Watch map as user goes Sharing | Pin fades in with scale animation |
| T-803-2 | Haptic on status change | Manual | Toggle status | Haptic tap felt on device |
| T-803-3 | Karma counter animation | Manual | Complete a share | Karma number ticks up/down visually |

---

#### FMZ-804: Data Cleanup Crons

> _As a system, I want to automatically clean up stale data so that the database stays healthy._

**Owner:** BE-EF + BE-DB
**Points:** 3
**Acceptance Criteria:**
- [ ] Cron: delete messages older than 24h from completed/cancelled connections (runs hourly)
- [ ] Cron: set stale sharing users to offline (> 2h since location update, runs every 15 min) — see FMZ-306
- [ ] Cron: delete connections older than 30 days with status completed/declined/cancelled (runs daily)
- [ ] All crons implemented via pg_cron or scheduled Edge Functions

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-804-1 | Message cleanup | Integration | Create messages 25h ago, run cron | Messages deleted |
| T-804-2 | Recent messages preserved | Integration | Create messages 1h ago, run cron | Messages still exist |
| T-804-3 | Connection cleanup | Integration | Create completed connection 31 days ago, run cron | Connection deleted |

---

#### FMZ-805: App Store Assets & Submission

> _As a team, we need app store assets and a successful submission so that users can download FindMyZyns._

**Owner:** DEVOPS + TL
**Points:** 5
**Acceptance Criteria:**
- [ ] App icon (1024x1024) for iOS and Android
- [ ] Splash screen (branded loading screen)
- [ ] App Store screenshots (6.7" iPhone, 6.5" iPhone, iPad) — 5 screens each
- [ ] Google Play screenshots (phone, tablet) — 5 screens each
- [ ] App Store description, keywords, category (Social Networking)
- [ ] Privacy policy URL (required for both stores)
- [ ] EAS Build production profile creates signed IPA and AAB
- [ ] Submit to App Store Connect (TestFlight first, then production review)
- [ ] Submit to Google Play Console (Internal track first, then production)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-805-1 | iOS build succeeds | CI | Run `eas build --platform ios --profile production` | Signed IPA generated |
| T-805-2 | Android build succeeds | CI | Run `eas build --platform android --profile production` | Signed AAB generated |
| T-805-3 | TestFlight install | Manual | Install from TestFlight on physical device | App launches, all features functional |
| T-805-4 | Internal track install | Manual | Install from Play Console internal track | App launches, all features functional |

---

#### FMZ-806: Monitoring & Crash Reporting

> _As a team, we need crash reporting and monitoring so that we can find and fix issues post-launch._

**Owner:** DEVOPS
**Points:** 3
**Acceptance Criteria:**
- [ ] Sentry installed via `sentry-expo`
- [ ] Source maps uploaded on each EAS Build
- [ ] Unhandled JS exceptions reported to Sentry with stack traces
- [ ] Native crashes reported (iOS + Android)
- [ ] Sentry alert rules: notify on new error, spike in error rate
- [ ] Supabase dashboard monitoring configured: API latency, auth failures, Realtime connection count

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-806-1 | JS error reported | Integration | Throw unhandled error in app | Error appears in Sentry with stack trace |
| T-806-2 | Source maps work | Integration | View Sentry error details | Stack trace shows original TypeScript file + line |

---

### Sprint 5 Assignments (Polish & Launch)

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-801: Loading & Empty States | FE-UI | 5 |
| FMZ-802: Error Boundaries | TL, FE-UI | 5 |
| FMZ-803: Animations & Haptics | FE-UI, FE-MAP | 3 |
| FMZ-804: Data Cleanup Crons | BE-EF, BE-DB | 3 |
| FMZ-805: App Store Submission | DEVOPS, TL | 5 |
| FMZ-806: Monitoring | DEVOPS | 3 |
| **Epic 8 Total** | | **24 pts** |

---

## Epic 9 — Safety, Trust & Completeness

> **Goal:** The app has all safety-critical features required for App Store approval and user trust, plus the missing functional flows that weren't covered in the core MVP sprints.

### User Stories

#### FMZ-901: Block User

> _As a user, I want to block another user so that they can no longer see me on the map or send me connection requests._

**Owner:** FE-RT + BE-EF + BE-DB
**Points:** 8
**Acceptance Criteria:**
- [ ] "Block" option accessible from: other user's profile, chat screen menu, quick-view card (overflow menu)
- [ ] Confirmation dialog: "Block @username? They won't be able to see you or connect with you."
- [ ] Creates row in new `blocks` table: `blocker_id`, `blocked_id`, `created_at`
- [ ] Blocked user's pin is hidden from blocker's map (filter in `get_nearby_sharers`)
- [ ] Blocker's pin is hidden from blocked user's map
- [ ] Blocked user cannot send connection requests to blocker (Edge Function validation)
- [ ] If an active connection exists between them, it is immediately cancelled
- [ ] Unblock available in Settings -> Blocked Users list

```sql
-- New table
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
```

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-901-1 | Block hides user from map | E2E (2 devices) | User A blocks User B; User B is Sharing | User B's pin disappears from User A's map |
| T-901-2 | Block is bidirectional visibility | E2E (2 devices) | User A blocks User B; User A is Sharing | User A's pin disappears from User B's map |
| T-901-3 | Blocked user can't connect | Integration | Blocked user tries to send connection request to blocker | Edge Function rejects with generic "Unable to connect" |
| T-901-4 | Active connection cancelled on block | E2E | Block user during active connection | Connection cancelled, both returned to map |
| T-901-5 | Unblock restores visibility | E2E | Unblock a previously blocked user | Their pin reappears on map when Sharing |
| T-901-6 | Blocked users list | E2E | Block 2 users, navigate to Settings -> Blocked Users | Both users listed with Unblock buttons |

---

#### FMZ-902: Report User

> _As a user, I want to report another user for inappropriate behavior so that the community stays safe._

**Owner:** FE-UI + BE-EF + BE-DB
**Points:** 5
**Acceptance Criteria:**
- [ ] "Report" option accessible from: other user's profile, chat screen menu (alongside Block)
- [ ] Report flow: select reason (picker) -> optional details text -> submit
- [ ] Report reasons: "Inappropriate behavior", "Harassment", "Spam/fake account", "Safety concern", "Other"
- [ ] Creates row in new `reports` table: `reporter_id`, `reported_id`, `reason`, `details`, `connection_id` (optional), `created_at`
- [ ] Confirmation: "Report submitted. We'll review this within 24 hours."
- [ ] Auto-block the reported user after submission (with option to undo)
- [ ] Reports visible in Supabase dashboard for admin review (no admin UI at MVP — query directly)

```sql
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
create index idx_reports_status on public.reports(status) where status = 'pending';
```

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-902-1 | Submit report | E2E | Select reason, add details, submit | Report created in DB, confirmation shown |
| T-902-2 | Auto-block on report | E2E | Report a user | Reported user is automatically blocked |
| T-902-3 | Report with connection context | E2E | Report from chat screen | `connection_id` populated in report record |
| T-902-4 | Duplicate report prevention | Integration | Report same user twice | Second report accepted (multiple reports are valid signals) but UI notes "You've already reported this user" |

---

#### FMZ-903: Forgot Password / Password Reset

> _As a user who has forgotten my password, I want to reset it via email so that I can regain access to my account._

**Owner:** FE-UI
**Points:** 3
**Acceptance Criteria:**
- [ ] "Forgot password?" link on login screen navigates to reset screen
- [ ] Reset screen: email input + "Send Reset Link" button
- [ ] Calls `supabase.auth.resetPasswordForEmail()`
- [ ] Success message: "Check your email for a password reset link"
- [ ] Deep link from email opens app to "Set New Password" screen
- [ ] New password screen: password + confirm password, same validation as sign up
- [ ] On success: auto-login, navigate to Map

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-903-1 | Request reset email | E2E | Enter registered email, tap Send | Success message displayed, email received |
| T-903-2 | Unregistered email | E2E | Enter unregistered email, tap Send | Same success message (no email enumeration) |
| T-903-3 | Set new password | E2E | Open reset link, enter new password | Password updated, auto-logged in |
| T-903-4 | Password validation | Unit | Enter mismatched or weak passwords | Validation errors shown |

---

#### FMZ-904: Map Search Bar

> _As a user, I want to search for a location on the map so that I can explore areas beyond my current location._

**Owner:** FE-MAP
**Points:** 5
**Acceptance Criteria:**
- [ ] Search bar at top of map screen
- [ ] Autocomplete powered by Google Places Autocomplete API (cities, addresses, landmarks)
- [ ] Selecting a result pans and zooms the map to that location
- [ ] Nearby sharers and stores reload for the new map center
- [ ] "Current Location" button to snap back to user's real location
- [ ] Search bar collapses when user interacts with the map (non-obstructive)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-904-1 | Search autocomplete | E2E | Type "Austin, TX" in search bar | Autocomplete suggestions appear |
| T-904-2 | Select search result | E2E | Tap an autocomplete result | Map pans to that location, pins reload |
| T-904-3 | Return to current location | E2E | Search somewhere, tap "Current Location" button | Map snaps back to real location |
| T-904-4 | Empty search | E2E | Clear search bar | No change to map state |

---

#### FMZ-905: Active Connection Indicator

> _As a user with an active connection, I want a persistent indicator on the map so that I can get back to the chat at any time._

**Owner:** FE-RT
**Points:** 3
**Acceptance Criteria:**
- [ ] When a connection is in 'accepted' status, a floating banner/pill appears at the top of the map screen
- [ ] Banner shows: other user's avatar, username, and "Tap to open chat"
- [ ] Tapping the banner navigates to the active chat screen
- [ ] Banner disappears when connection is completed or cancelled
- [ ] Banner persists across tab switches (map -> profile -> map)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-905-1 | Banner appears on accept | E2E | Accept a connection request | Banner visible on map screen |
| T-905-2 | Banner navigates to chat | E2E | Tap the banner | Opens chat screen with correct connection |
| T-905-3 | Banner disappears on complete | E2E | Complete a share | Banner removed from map |
| T-905-4 | Banner persists across tabs | E2E | Switch to Profile tab and back to Map | Banner still visible |

---

#### FMZ-906: Username & Display Name Moderation

> _As a system, I want to prevent offensive usernames and display names so that the app stays welcoming._

**Owner:** BE-EF + BE-DB
**Points:** 3
**Acceptance Criteria:**
- [ ] Profanity filter runs on username and display name during onboarding and profile edit
- [ ] Uses a server-side word list (Edge Function) — not client-side (bypassable)
- [ ] Checks against common profanity, slurs, and hate speech terms
- [ ] Rejects with: "This name isn't allowed. Please choose another."
- [ ] Case-insensitive and handles common substitutions (e.g., "a" -> "@", "i" -> "1")
- [ ] Word list maintained as a Supabase Storage file (easy to update without redeployment)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-906-1 | Profanity in username rejected | Integration | Submit username containing profanity | Rejected with "not allowed" message |
| T-906-2 | Leet speak bypass blocked | Integration | Submit username with letter substitutions | Rejected |
| T-906-3 | Clean username accepted | Integration | Submit normal username | Accepted |
| T-906-4 | Profanity in display name rejected | Integration | Edit display name to profanity | Rejected |

---

#### FMZ-907: Rate Limiting on Edge Functions

> _As a system, I want to rate-limit API calls so that abuse and cost overruns are prevented._

**Owner:** BE-EF + TL
**Points:** 5
**Acceptance Criteria:**
- [ ] Rate limits applied to all Edge Functions:
  - `create-connection`: 10 requests per user per hour
  - `respond-connection`: 20 requests per user per hour
  - `confirm-share`: 10 requests per user per hour
  - Store search proxy: 30 requests per user per hour
- [ ] Rate limiting implemented via Supabase Edge Function with a `rate_limits` table or in-memory counter (per-user, sliding window)
- [ ] On limit exceeded: HTTP 429 response with `Retry-After` header
- [ ] Client shows toast: "You're doing that too fast. Please wait a moment."
- [ ] Rate limit state resets on window expiry (no permanent penalty)

```sql
create table public.rate_limits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  action      text not null,
  window_start timestamptz not null default now(),
  count       integer not null default 1,
  constraint unique_rate_limit unique (user_id, action, window_start)
);

create index idx_rate_limits_lookup on public.rate_limits(user_id, action, window_start);
```

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-907-1 | Under limit succeeds | Integration | Call `create-connection` 5 times in 1 hour | All succeed |
| T-907-2 | Over limit rejected | Integration | Call `create-connection` 11 times in 1 hour | 11th call returns 429 |
| T-907-3 | Window resets | Integration | Hit limit, wait for window expiry | Requests succeed again |
| T-907-4 | Client handles 429 | E2E | Trigger rate limit | Toast message shown, no crash |

---

#### FMZ-908: Analytics Event Tracking

> _As a product team, we want to track key user events so that we can measure engagement and optimize the experience._

**Owner:** TL + FE-RT
**Points:** 5
**Acceptance Criteria:**
- [ ] Analytics SDK integrated (Expo-compatible: Mixpanel, Amplitude, or PostHog)
- [ ] Events tracked:
  - `app_opened` (with `source`: push notification, organic, deep link)
  - `status_changed` (with `from`, `to`, `product_id`)
  - `connection_requested` (with `distance_meters`)
  - `connection_responded` (with `action`: accept/decline)
  - `share_completed` (with `time_to_complete` in seconds)
  - `store_tapped` (with `place_id`, `store_name`)
  - `product_added` (with `type`, `brand`)
  - `map_viewed` (with `sharers_visible_count`, `stores_visible_count`)
  - `profile_viewed` (with `is_own_profile`: boolean)
- [ ] User properties set: `karma`, `status`, `product_count`, `member_since`
- [ ] Events fire on both iOS and Android
- [ ] No PII in event properties (no email, no exact lat/lng — round to 2 decimal places)

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-908-1 | status_changed fires | Integration | Toggle status to Sharing | Event logged with correct `from`/`to` values |
| T-908-2 | share_completed fires | Integration | Complete a share | Event logged with `time_to_complete` |
| T-908-3 | No PII in events | Audit | Review all event payloads | No email, phone, exact coordinates, or full names |
| T-908-4 | Events on both platforms | Manual | Perform actions on iOS and Android | Events appear in analytics dashboard for both |

---

#### FMZ-909: Terms of Service & Privacy Policy

> _As a business, we need legal pages so that we meet App Store requirements and protect the company._

**Owner:** TL + DEVOPS
**Points:** 3
**Acceptance Criteria:**
- [ ] Terms of Service page — accessible from Settings and sign-up screen
- [ ] Privacy Policy page — accessible from Settings and sign-up screen
- [ ] Both hosted as web pages (external URL) and opened in an in-app browser
- [ ] Sign-up flow includes "By signing up, you agree to our Terms of Service and Privacy Policy" with links
- [ ] Privacy Policy covers: data collected, location data usage, data retention, third-party services (Supabase, Google), user rights (deletion)
- [ ] URLs registered in App Store Connect and Google Play Console

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-909-1 | ToS accessible from settings | E2E | Tap "Terms of Service" in Settings | Web page loads in in-app browser |
| T-909-2 | Privacy Policy from sign-up | E2E | Tap "Privacy Policy" link on sign-up screen | Web page loads |
| T-909-3 | Legal links present on sign-up | E2E | View sign-up screen | "Terms of Service" and "Privacy Policy" links visible |

---

#### FMZ-910: Safety Guidelines Screen

> _As a user, I want to see safety guidelines before my first share so that I know how to stay safe meeting strangers._

**Owner:** FE-UI
**Points:** 2
**Acceptance Criteria:**
- [ ] One-time safety screen shown before a user's first connection (either sending or receiving)
- [ ] Content covers: meet in public places, tell a friend, trust your instincts, report bad behavior
- [ ] "I Understand" button to dismiss (required to proceed)
- [ ] Flag stored in `profiles` table: `safety_acknowledged boolean default false`
- [ ] Accessible again from Settings -> "Safety Tips"

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-910-1 | Safety screen on first connect | E2E | Tap Connect for the first time | Safety guidelines screen shown before request sends |
| T-910-2 | Not shown on subsequent connects | E2E | Connect after acknowledging safety | Goes directly to connection request |
| T-910-3 | Accessible from settings | E2E | Tap "Safety Tips" in Settings | Safety guidelines screen displayed |

---

### Sprint 6 Assignments

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-901: Block User | FE-RT, BE-EF, BE-DB | 8 |
| FMZ-902: Report User | FE-UI, BE-EF, BE-DB | 5 |
| FMZ-903: Forgot Password | FE-UI | 3 |
| FMZ-904: Map Search Bar | FE-MAP | 5 |
| FMZ-905: Active Connection Indicator | FE-RT | 3 |
| FMZ-906: Content Moderation | BE-EF, BE-DB | 3 |
| FMZ-907: Rate Limiting | BE-EF, TL | 5 |
| FMZ-908: Analytics | TL, FE-RT | 5 |
| FMZ-909: Legal Pages | TL, DEVOPS | 3 |
| FMZ-910: Safety Guidelines | FE-UI | 2 |
| **Epic 9 Total** | | **42 pts** |

---

## Epic 10 — Beta, Hardening & Store Submission

> **Goal:** The app is battle-tested with real users, all critical bugs are fixed, performance is validated under load, security is audited, and the app is submitted to both app stores.

### User Stories

#### FMZ-1001: Closed Beta Distribution

> _As a team, we want to distribute the app to 50–100 beta testers so that we get real-world feedback before public launch._

**Owner:** DEVOPS + QA + TL
**Points:** 5
**Acceptance Criteria:**
- [ ] iOS: TestFlight build distributed to beta group (50–100 external testers)
- [ ] Android: Google Play Internal Testing track or Firebase App Distribution
- [ ] Beta testers recruited (internal team, friends, target demographic)
- [ ] In-app feedback mechanism: "Shake to Report" or a dedicated feedback button in Settings
- [ ] Feedback collected via Google Form, Canny, or a shared Slack channel
- [ ] Beta period: minimum 7 days of active usage
- [ ] Crash-free rate target: > 99%
- [ ] Beta metrics dashboard set up (Sentry + analytics) to monitor real usage

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-1001-1 | TestFlight distribution | Manual | Invite 50 testers, send build | All testers can install and open app |
| T-1001-2 | Android distribution | Manual | Distribute via Internal Testing | All testers can install and open app |
| T-1001-3 | Feedback mechanism works | Manual | Shake device (or tap feedback button) | Feedback form opens |
| T-1001-4 | Crash-free rate | Monitoring | Monitor Sentry for 7 days | Crash-free rate > 99% |

---

#### FMZ-1002: Full Regression Test Suite

> _As a QA engineer, I want to run a comprehensive regression test across all features so that we ship with confidence._

**Owner:** QA
**Points:** 8
**Acceptance Criteria:**
- [ ] Complete E2E test suite covering all critical paths:
  - Auth: sign up, log in (email + OAuth), forgot password, session persistence, log out
  - Profile: view, edit, avatar upload, product CRUD
  - Map: location permission, status toggle (all 3 states), user pins, store pins, search
  - Connection: request, accept, decline, chat, cancel, complete share
  - Karma: confirmation flow, score update, tier badge display
  - Push: receive notification, deep link navigation
  - Safety: block, report, safety guidelines, content moderation
- [ ] Tested on minimum device matrix:
  - iOS: iPhone 14 (or later) + iPhone SE 3rd gen (small screen)
  - Android: Pixel 7 (or later) + Samsung Galaxy S23 (manufacturer skin)
- [ ] Tested on minimum OS versions: iOS 16+, Android 12+
- [ ] All E2E tests documented with pass/fail results
- [ ] Bug tracker (Linear, GitHub Issues, or Jira) has all open bugs categorized as P0/P1/P2
- [ ] Zero P0 bugs; all P1 bugs resolved or have accepted workarounds

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-1002-1 | iOS full regression | Manual | Run all E2E tests on iPhone 14 | All pass, results documented |
| T-1002-2 | iOS small screen | Manual | Run critical path tests on iPhone SE | All UI elements accessible, no layout breaks |
| T-1002-3 | Android full regression | Manual | Run all E2E tests on Pixel 7 | All pass, results documented |
| T-1002-4 | Android manufacturer skin | Manual | Run critical path tests on Samsung Galaxy | No visual or functional regressions |
| T-1002-5 | Bug triage complete | Process | Review all open bugs | Zero P0, P1s resolved or deferred with justification |

---

#### FMZ-1003: Load & Performance Testing

> _As a team, we want to validate that the system performs under realistic load so that launch day doesn't bring the backend down._

**Owner:** BE-EF + TL + DEVOPS
**Points:** 5
**Acceptance Criteria:**
- [ ] Load test scenarios defined:
  - 500 concurrent sharing users broadcasting location every 10s
  - 200 concurrent map viewers receiving Realtime updates
  - 50 concurrent chat sessions with 1 message per 5 seconds
  - 100 `get_nearby_sharers` RPC calls per minute
- [ ] Load tests executed against staging environment using k6, Artillery, or custom script
- [ ] Performance benchmarks met:
  - `get_nearby_sharers` p95 < 300ms at 100 concurrent users
  - Realtime message delivery p95 < 500ms
  - Edge Function response p95 < 1s
  - Supabase Postgres CPU < 70% under peak load
- [ ] Bottlenecks identified and resolved (index optimization, connection pooling, query tuning)
- [ ] Load test results documented

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-1003-1 | Spatial query under load | Load | 100 concurrent `get_nearby_sharers` calls per minute for 10 minutes | p95 response < 300ms |
| T-1003-2 | Realtime at scale | Load | 500 sharing users + 200 subscribers for 10 minutes | Message delivery p95 < 500ms, no dropped connections |
| T-1003-3 | Chat throughput | Load | 50 concurrent chats, 1 msg/5s for 10 minutes | All messages delivered in order, p95 < 500ms |
| T-1003-4 | DB resource usage | Monitoring | Monitor Supabase dashboard during load test | CPU < 70%, RAM < 80%, connection count < pool limit |

---

#### FMZ-1004: Security Audit

> _As a team, we want to audit our security posture so that user data is protected and we're not shipping exploitable vulnerabilities._

**Owner:** TL + BE-DB + BE-EF
**Points:** 5
**Acceptance Criteria:**
- [ ] **RLS policy audit:** For every table, verify that:
  - Users cannot read other users' private data (messages, blocks, reports)
  - Users cannot write to other users' rows
  - Service role bypasses are intentional and documented
  - Test by calling Supabase client SDK with User A's JWT, attempting to access User B's data
- [ ] **Edge Function auth audit:** Every Edge Function validates `Authorization` header and rejects unauthenticated requests
- [ ] **API key audit:**
  - Google Places API key restricted to app bundle IDs + specific API
  - Supabase anon key has no dangerous permissions
  - Service role key is NEVER exposed to client (only Edge Functions)
  - No secrets in source code (check git history)
- [ ] **Input validation audit:** All user inputs (username, display name, message body, product fields) are length-limited and sanitized
- [ ] **Dependency audit:** Run `npm audit` / `expo doctor`, resolve any critical/high vulnerabilities
- [ ] **OWASP Mobile Top 10 checklist review** completed
- [ ] Security audit results documented with findings and remediations

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-1004-1 | RLS: cross-user message read | Security | Authenticate as User A, query User B's messages | Empty result or 403 |
| T-1004-2 | RLS: cross-user profile update | Security | Authenticate as User A, update User B's profile | Rejected by RLS |
| T-1004-3 | RLS: cross-user karma manipulation | Security | Authenticate as User A, directly update User B's karma | Rejected by RLS (karma only via trigger) |
| T-1004-4 | Edge Function: unauthenticated call | Security | Call `create-connection` without auth header | 401 Unauthorized |
| T-1004-5 | No secrets in codebase | Security | Run `git log --all -p | grep -i "service_role\|secret\|password"` (excluding .env.example) | Zero matches |
| T-1004-6 | Dependency vulnerabilities | Automated | Run `npm audit --audit-level=high` | Zero high/critical vulnerabilities |

---

#### FMZ-1005: Beta Bug Fix Sprint

> _As a team, we want to fix all bugs discovered during beta testing so that the public release is stable._

**Owner:** All Engineers
**Points:** 13
**Acceptance Criteria:**
- [ ] All P0 bugs fixed and verified (P0 = crash, data loss, security vulnerability, complete feature failure)
- [ ] All P1 bugs fixed or have documented workaround (P1 = feature partially broken, bad UX, performance issue)
- [ ] P2 bugs triaged: fix if quick, defer to v1.1 backlog if not
- [ ] Each fix includes a regression test (unit or E2E)
- [ ] No fix introduces new P0/P1 bugs (verified by re-running regression suite)
- [ ] Release notes drafted summarizing changes from beta

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-1005-1 | P0 fix verification | Manual | Reproduce original P0 bug after fix | Bug no longer occurs |
| T-1005-2 | Regression after fixes | Automated + Manual | Run full regression suite after all fixes | No new failures |
| T-1005-3 | Beta re-validation | Manual | Send updated build to beta testers, collect feedback for 48h | No new P0/P1 bugs reported |

---

#### FMZ-1006: Production Environment Setup

> _As a team, we need a production Supabase project with proper configuration so that we're not launching on staging._

**Owner:** DEVOPS + TL
**Points:** 5
**Acceptance Criteria:**
- [ ] Production Supabase project created (separate from staging)
- [ ] All migrations applied to production database
- [ ] PostGIS extension enabled in production
- [ ] RLS policies verified in production (re-run security tests against prod)
- [ ] Storage buckets created with correct policies
- [ ] Edge Functions deployed to production
- [ ] Environment variables configured in EAS for production builds:
  - `SUPABASE_URL` (production)
  - `SUPABASE_ANON_KEY` (production)
  - `GOOGLE_PLACES_API_KEY` (production, with tighter restrictions)
  - `SENTRY_DSN` (production)
- [ ] Supabase project upgraded to Pro plan (for production Realtime limits, daily backups, higher connection limits)
- [ ] Database backups verified (Point-in-Time Recovery enabled)
- [ ] pg_cron jobs configured in production
- [ ] Supabase monitoring alerts set: high CPU, high connection count, auth failures spike

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-1006-1 | Production migrations | Automated | Run `supabase db push` against production | All tables, functions, policies created |
| T-1006-2 | Production Edge Functions | Automated | Deploy and call each Edge Function | All return expected responses |
| T-1006-3 | Production build connects | Manual | Build production app, test against production Supabase | Auth, DB, Realtime all functional |
| T-1006-4 | Backup verification | Manual | Confirm PITR is enabled in Supabase dashboard | Backups visible, restore tested on staging |

---

#### FMZ-1007: App Store Submission (Final)

> _As a team, we want to submit the production-ready app to both app stores so that users can download FindMyZyns._

**Owner:** DEVOPS + TL
**Points:** 5
**Acceptance Criteria:**
- [ ] **iOS App Store:**
  - EAS Build production IPA generated and signed
  - App Store Connect listing complete: description, keywords, screenshots (6.7", 6.5", iPad), privacy policy URL, support URL, marketing URL
  - App category: Social Networking
  - Age rating questionnaire completed
  - App Review notes: explain that the app is a social network (not a nicotine sales platform), reference that no commerce or age-restricted purchases occur in-app
  - Submit for review
- [ ] **Google Play Store:**
  - EAS Build production AAB generated and signed
  - Play Console listing complete: description, screenshots (phone, tablet, 7" tablet), feature graphic, privacy policy URL
  - Content rating questionnaire completed
  - Data safety section filled out (location data, user profile data, messages)
  - Target audience and content: 18+ (nicotine reference)
  - Submit for review on production track
- [ ] **OTA Update pipeline verified:**
  - `eas update` pushes JS bundle to production channel
  - App picks up update on next launch
- [ ] **Rollback plan documented:**
  - How to disable new sign-ups if critical issue found
  - How to push emergency OTA fix
  - How to revert database migration if needed

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-1007-1 | iOS production build | CI | `eas build --platform ios --profile production` | Signed IPA uploaded to App Store Connect |
| T-1007-2 | Android production build | CI | `eas build --platform android --profile production` | Signed AAB uploaded to Play Console |
| T-1007-3 | OTA update flow | Manual | Push OTA update, reopen app | App loads updated JS bundle |
| T-1007-4 | App Store review submission | Manual | Submit iOS app for review | Status changes to "Waiting for Review" |
| T-1007-5 | Play Store review submission | Manual | Submit Android app for review | Status changes to "In Review" |

---

#### FMZ-1008: Launch Runbook

> _As a team, we need a documented launch plan so that launch day is coordinated and we can respond to issues._

**Owner:** TL + DEVOPS
**Points:** 3
**Acceptance Criteria:**
- [ ] **Launch runbook document** covering:
  - Pre-launch checklist (all items from this epic verified)
  - Launch sequence: Enable production, verify monitoring, announce
  - On-call rotation for first 72 hours post-launch
  - Escalation path: who to contact for DB issues, API issues, app crashes
  - Monitoring dashboards to watch: Sentry, Supabase, Analytics, App Store reviews
  - Rollback procedures for each component (OTA, Edge Functions, DB)
  - Communication templates for: "we found a bug" and "we're investigating an outage"
- [ ] **Post-launch monitoring plan:**
  - Check crash-free rate every 4 hours for first 48 hours
  - Monitor App Store / Play Store reviews daily for first 2 weeks
  - Nightly analytics review for first week (DAU, connections, shares, retention)
- [ ] **v1.1 backlog** created with deferred P2 bugs + next features:
  - In-app messaging improvements (images, link previews)
  - Advanced admin dashboard
  - User verification (phone number, ID)
  - Referral program
  - Leaderboards

**Tests:**
| ID | Test | Type | Steps | Expected Result |
|---|---|---|---|---|
| T-1008-1 | Runbook review | Process | Entire team reviews runbook | All team members understand their launch day role |
| T-1008-2 | On-call rotation set | Process | On-call schedule published | Every 8-hour window has a named engineer |
| T-1008-3 | Rollback drill | Manual | Simulate rollback of OTA update | Previous version restored within 5 minutes |

---

### Sprint 7 Assignments

| Story | Owner(s) | Points |
|---|---|---|
| FMZ-1001: Closed Beta | DEVOPS, QA, TL | 5 |
| FMZ-1002: Regression Tests | QA | 8 |
| FMZ-1003: Load Testing | BE-EF, TL, DEVOPS | 5 |
| FMZ-1004: Security Audit | TL, BE-DB, BE-EF | 5 |
| FMZ-1005: Beta Bug Fixes | All Engineers | 13 |
| FMZ-1006: Production Env | DEVOPS, TL | 5 |
| FMZ-1007: Store Submission | DEVOPS, TL | 5 |
| FMZ-1008: Launch Runbook | TL, DEVOPS | 3 |
| **Epic 10 Total** | | **49 pts** |

---

## Sprint Summary

| Sprint | Epics | Total Points | Team Velocity Target |
|---|---|---|---|
| **Sprint 1** | E1: Foundation & Auth | 37 | 35–40 |
| **Sprint 2** | E2: Profiles & Products + E3: Map (start) | 37 | 35–40 |
| **Sprint 3** | E3: Map (finish) + E4: Store Locator | 27 | 25–30 |
| **Sprint 4** | E5: Connections & Chat + E6: Karma | 31 | 30–35 |
| **Sprint 5** | E7: Push + E8: Polish | 32 | 30–35 |
| **Sprint 6** | E9: Safety, Trust & Completeness | 42 | 40–45 |
| **Sprint 7** | E10: Beta, Hardening & Store Submission | 49 | 45–50 |
| **Total** | **10 Epics, 48 Stories** | **255 pts** | — |

> **Note on Sprint 7 velocity:** Sprint 7 is intentionally heavy at 49 points because (a) FMZ-1005 (bug fixes) is estimated conservatively at 13 points but may require less if beta goes well, and (b) several stories are process-oriented (runbook, audits) that parallelize well across the full team. If beta reveals significant issues, defer FMZ-1008 (Launch Runbook) to a Sprint 7.5 buffer week.

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Google Places API costs exceed budget | Medium | High | Cache results aggressively (15 min TTL per geo cell); set API budget cap in Google Cloud Console; rate-limit client requests |
| R2 | Apple rejects app for nicotine content | Medium | Critical | App facilitates social connection, not sales; no transactions/commerce; frame as social networking in review notes; have legal review App Store guidelines 1.4.3; include age rating 18+ |
| R3 | Real-time performance degrades at scale | Low | High | Supabase Realtime scales well for MVP; filter subscriptions by geography; implement polling fallback; validated by load testing in Sprint 7 |
| R4 | Location permission denial rate > 50% | Medium | High | Custom pre-permission screen explaining value; functional (degraded) experience without location; manual city/zip search fallback (FMZ-904) |
| R5 | Low share completion rate | Medium | Medium | Streamline confirmation UX; push reminders; gamify karma with tier progression and badges |
| R6 | Battery drain complaints | Medium | Medium | Location tracking only when Sharing; 10s interval with 10m threshold; use `Accuracy.Balanced` not `High` |
| R7 | User safety concerns (meeting strangers) | Medium | Critical | Karma/reputation system; post-share ratings; block/report (FMZ-901/902); in-app safety guidelines (FMZ-910); never share exact location until connection accepted |
| R8 | Scope creep delays launch | High | High | Strict MVP scope in this document; features not listed here go to v1.1 backlog; sprint reviews enforce scope |
| R9 | App Store review rejection (any reason) | Medium | High | Pre-submission checklist; legal pages in place (FMZ-909); privacy disclosures complete; prepare appeal letter with clarification |
| R10 | Beta reveals architectural issues | Low | Critical | 7-day beta minimum; load test independently of beta (FMZ-1003); rollback plan in runbook (FMZ-1008); buffer week available if needed |
| R11 | Content moderation at scale | Medium | Medium | Profanity filter (FMZ-906) + report system (FMZ-902) handles MVP; v1.1 backlog includes automated flagging and admin dashboard |
| R12 | Key team member unavailable | Low | High | Cross-train: every feature has a primary AND secondary owner; documented architecture in SPEC.md reduces bus factor |

---

## Definition of Done

A story is **Done** when ALL of the following are true:

- [ ] Code is written, reviewed, and merged to `main`
- [ ] All acceptance criteria are met
- [ ] All listed tests pass (unit, integration, E2E, manual as applicable)
- [ ] No P0/P1 bugs introduced
- [ ] TypeScript strict mode — zero type errors
- [ ] ESLint — zero errors
- [ ] Loading states implemented for async operations
- [ ] Error states handled (network failure, empty data, unauthorized)
- [ ] Tested on both iOS and Android
- [ ] Supabase migration checked in (if schema changed)
- [ ] RLS policies verified (if new table/query)
- [ ] No secrets or API keys in client-side code
- [ ] Analytics events fire correctly (Sprint 6+)
- [ ] Rate limits enforced on new endpoints (Sprint 6+)
- [ ] Accessibility: minimum tap targets (44x44pt), VoiceOver labels on interactive elements
