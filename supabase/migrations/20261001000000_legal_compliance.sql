-- Legal-compliance hardening. Review, then apply with `supabase db push`
-- (or paste into the SQL editor) on project nonaymiwdayfuulccxrl.

-- 1. Age gate on the public lead form, enforced server-side.
--    The landing page sends age_confirmed = true only after the visitor ticks
--    "18+". The NOT VALID check leaves existing rows alone but rejects every
--    new insert without it, so nothing from a refused attempt is stored.
alter table public.leads add column if not exists age_confirmed boolean not null default false;
alter table public.leads drop constraint if exists leads_age_confirmed;
alter table public.leads add constraint leads_age_confirmed check (age_confirmed) not valid;

-- 2. Anonymous visitors may only INSERT leads, never read them back.
alter table public.leads enable row level security;
drop policy if exists "anon can submit lead" on public.leads;
create policy "anon can submit lead" on public.leads
  for insert to anon with check (age_confirmed = true);
-- Make sure no policy grants SELECT/UPDATE/DELETE on leads to anon. Check with:
--   select policyname, roles, cmd from pg_policies where tablename = 'leads';

-- 3. Customer documents (IDs, bills, signatures) must not be public.
--    The app now stores storage://client_documents/<path> and opens files via
--    5-minute signed URLs, so the bucket can be private.
update storage.buckets set public = false where id = 'client_documents';

drop policy if exists "staff read client documents" on storage.objects;
create policy "staff read client documents" on storage.objects
  for select to authenticated using (bucket_id = 'client_documents');
drop policy if exists "staff upload client documents" on storage.objects;
create policy "staff upload client documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'client_documents');
