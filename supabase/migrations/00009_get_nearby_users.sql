-- Get nearby active users (both sharing and needing)
create or replace function public.get_nearby_users(
  user_lat double precision,
  user_lng double precision,
  radius_meters integer default 10000
)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  karma integer,
  user_status text,
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
    p.status as user_status,
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
  where p.status in ('sharing', 'needing')
    and p.location is not null
    and ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  order by distance_meters;
$$;
