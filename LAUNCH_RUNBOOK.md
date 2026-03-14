# FindMyZyns Launch Runbook

## Pre-Launch Checklist

- [ ] All Sprint 1-7 stories completed and verified
- [ ] Production Supabase project created and configured
- [ ] All migrations applied to production (`supabase db push`)
- [ ] PostGIS extension enabled in production
- [ ] Storage buckets created (avatars, products)
- [ ] Edge Functions deployed to production
- [ ] Environment variables set in EAS (production profile)
- [ ] Google Places API key restricted to production bundle IDs
- [ ] Sentry DSN configured for production
- [ ] Privacy Policy and Terms of Service URLs live
- [ ] App icons and splash screen finalized
- [ ] App Store screenshots captured (iPhone 6.7", 6.5", iPad)
- [ ] Play Store screenshots captured (phone, tablet)
- [ ] Security audit passed (`npx tsx scripts/security-audit.ts`)
- [ ] Load test completed against staging
- [ ] Beta period complete (7+ days, crash-free rate > 99%)
- [ ] All P0 bugs fixed, P1 bugs resolved or documented

## Launch Sequence

1. **T-60 min:** Final smoke test on production build
2. **T-30 min:** Verify monitoring dashboards (Sentry, Supabase)
3. **T-0:** Release app on App Store and Play Store
4. **T+15 min:** Verify first user can sign up, complete onboarding
5. **T+30 min:** Verify map loads, status toggle works
6. **T+1 hr:** Check Sentry for crash reports
7. **T+4 hr:** Review analytics for DAU, sessions, connection attempts

## On-Call Rotation (First 72 Hours)

| Window | Primary | Backup |
|--------|---------|--------|
| Day 1: 8am-4pm | TL | BE-EF |
| Day 1: 4pm-12am | BE-DB | FE-RT |
| Day 1: 12am-8am | DEVOPS | TL |
| Day 2-3 | Rotate same pattern | |

## Monitoring Dashboards

- **Sentry:** Crash-free rate, error spike alerts
- **Supabase:** API latency, auth failures, Realtime connections, DB CPU
- **Analytics:** DAU, sessions, connections, shares, retention

## Rollback Procedures

### OTA JavaScript Fix
```bash
eas update --branch production --message "hotfix: description"
```

### Revert to Previous OTA Update
```bash
eas update:rollback --branch production
```

### Disable New Sign-Ups (Emergency)
```sql
-- In Supabase dashboard > SQL Editor:
ALTER TABLE auth.users DISABLE TRIGGER ALL;
-- Re-enable: ALTER TABLE auth.users ENABLE TRIGGER ALL;
```

### Revert Database Migration
```bash
supabase migration repair --status reverted <migration_id>
```

## Communication Templates

### Bug Found
> We're aware of [issue description] and are actively working on a fix.
> Expected resolution: [timeframe]. We'll update this thread when resolved.

### Outage
> FindMyZyns is experiencing [degraded performance / an outage].
> Our team is investigating. Updates every 30 minutes.

## v1.1 Backlog

- In-app messaging improvements (images, link previews)
- Admin dashboard for content moderation
- User verification (phone number)
- Referral program
- Leaderboards
- Favorite / follow users
- Dark/light theme toggle
- Background location for sharers
