-- Function to set stale sharing users to offline
-- Called by pg_cron or a scheduled Edge Function every 15 minutes
create or replace function public.cleanup_stale_sharers()
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set
    status = 'offline',
    location = null,
    location_updated_at = null,
    sharing_product_id = null
  where status = 'sharing'
    and location_updated_at < now() - interval '2 hours';
end;
$$;

-- If pg_cron is available, schedule it:
-- select cron.schedule('cleanup-stale-sharers', '*/15 * * * *', 'select public.cleanup_stale_sharers()');
