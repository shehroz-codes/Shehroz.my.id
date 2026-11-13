-- Disposable PostgreSQL fixture. Never run this against a hosted project.
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create schema storage;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as
  $$ select (nullif(current_setting('request.jwt.claims', true),'')::jsonb ->> 'sub')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as
  $$ select nullif(current_setting('request.jwt.claims', true),'')::jsonb $$;
grant usage on schema public, auth, storage to anon, authenticated, service_role;
create table public.visitor_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  text text not null check (char_length(btrim(text)) between 1 and 300),
  country_code text, country_name text, has_photo boolean not null default false,
  status text not null default 'published' check (status in ('published','hidden')),
  is_demo boolean not null default false, created_at timestamptz not null default now(),
  photo_path text, visitor_id uuid references auth.users(id)
);
create table public.visitor_cooldowns (user_id uuid primary key references auth.users(id), last_submitted_at timestamptz not null default now());
create table public.portfolio_admins (user_id uuid primary key references auth.users(id), created_at timestamptz not null default now());
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table public.visitor_messages enable row level security;
alter table public.visitor_cooldowns enable row level security;
alter table public.portfolio_admins enable row level security;
alter table storage.objects enable row level security;
create policy published_messages on public.visitor_messages for select to anon, authenticated using (status='published' and is_demo=false);
create policy own_admin_record on public.portfolio_admins for select to authenticated using
  (user_id=(select auth.uid()) and (select auth.jwt()->>'is_anonymous') is distinct from 'true');
grant all on public.visitor_messages to anon, authenticated;
grant select(photo_path,visitor_id), update(name) on public.visitor_messages to anon,authenticated;
grant select on public.portfolio_admins to authenticated;
grant all on storage.objects to anon, authenticated;
grant all on all tables in schema public to service_role;
create function public.rls_auto_enable() returns event_trigger language plpgsql security definer set search_path=pg_catalog as $$ begin null; end $$;
insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
insert into public.portfolio_admins(user_id) values ('00000000-0000-0000-0000-000000000001');
insert into public.visitor_messages(name,text,status,is_demo,photo_path,visitor_id) values
 ('Public','Visible','published',false,'private-object','00000000-0000-0000-0000-000000000001'),
 ('Hidden','Hidden','hidden',false,null,null), ('Demo','Demo','published',true,null,null);
insert into storage.objects(bucket_id,name) values ('visitor-photos-private','private-object');
