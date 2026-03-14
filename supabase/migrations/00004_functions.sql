-- ============================================
-- Database Functions & Triggers
-- ============================================

-- Auto-create profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Complete share: when both parties confirm
-- ============================================
create or replace function public.complete_share()
returns trigger as $$
begin
  if new.sharer_confirmed = true
    and new.receiver_confirmed = true
    and old.completed = false
  then
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
  for each row execute function public.complete_share();

-- ============================================
-- Get nearby sharing users (PostGIS)
-- ============================================
create or replace function public.get_nearby_sharers(
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

-- ============================================
-- Get user stats
-- ============================================
create or replace function public.get_user_stats(target_user_id uuid)
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
