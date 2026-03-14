-- ============================================
-- Storage Buckets & Policies
-- ============================================

-- Create storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

insert into storage.buckets (id, name, public)
values ('products', 'products', true);

-- Avatars: users can upload to their own folder
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public avatar read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Products: same pattern
create policy "Users upload own product photos"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own product photos"
  on storage.objects for update
  using (
    bucket_id = 'products'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own product photos"
  on storage.objects for delete
  using (
    bucket_id = 'products'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public product photo read"
  on storage.objects for select
  using (bucket_id = 'products');
