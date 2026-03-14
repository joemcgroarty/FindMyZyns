-- Delete messages older than 24h from completed/cancelled connections
create or replace function public.cleanup_old_messages()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.messages
  where connection_id in (
    select id from public.connections
    where status in ('completed', 'cancelled')
  )
  and created_at < now() - interval '24 hours';
end;
$$;

-- Delete old completed/declined/cancelled connections (30+ days)
create or replace function public.cleanup_old_connections()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.connections
  where status in ('completed', 'declined', 'cancelled')
  and updated_at < now() - interval '30 days';
end;
$$;

-- Schedule with pg_cron (if available):
-- select cron.schedule('cleanup-messages', '0 * * * *', 'select public.cleanup_old_messages()');
-- select cron.schedule('cleanup-connections', '0 3 * * *', 'select public.cleanup_old_connections()');
