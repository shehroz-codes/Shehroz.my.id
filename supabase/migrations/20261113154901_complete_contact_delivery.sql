-- New changes only. The PR #24 grants migration is already deployed as 20261113141350.
begin;
create index visitor_messages_photo_lookup on public.visitor_messages(photo_path) where photo_path is not null;

create table public.visitor_photo_cleanup (
  path text primary key,
  created_at timestamptz not null default now()
);
alter table public.visitor_photo_cleanup enable row level security;
revoke all on public.visitor_photo_cleanup from public, anon, authenticated;
grant all on public.visitor_photo_cleanup to service_role;

create function public.queue_deleted_visitor_photo() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if old.photo_path is not null then
    insert into public.visitor_photo_cleanup(path) values (old.photo_path) on conflict do nothing;
  end if;
  return old;
end $$;
revoke all on function public.queue_deleted_visitor_photo() from public, anon, authenticated;
create trigger queue_deleted_visitor_photo before delete on public.visitor_messages
for each row execute function public.queue_deleted_visitor_photo();

create table public.private_contact_messages (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references auth.users(id),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  email text not null check (char_length(email) between 3 and 120),
  subject text not null check (char_length(btrim(subject)) between 3 and 100),
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  created_at timestamptz not null default now()
);
create table public.private_contact_cooldowns (
  user_id uuid primary key references auth.users(id),
  last_submitted_at timestamptz not null default now()
);
alter table public.private_contact_messages enable row level security;
alter table public.private_contact_cooldowns enable row level security;
revoke all on public.private_contact_messages, public.private_contact_cooldowns from public, anon, authenticated;
grant all on public.private_contact_messages, public.private_contact_cooldowns to service_role;
grant select on public.private_contact_messages to authenticated;
create policy private_inbox_owner on public.private_contact_messages for select to authenticated using (
  (select auth.jwt()->>'is_anonymous') is distinct from 'true'
  and exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid()))
);

-- Only the authenticated Edge Function's privileged client can call this atomic operation.
create function public.receive_private_message(p_user_id uuid, p_name text, p_email text, p_subject text, p_message text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare message_id uuid;
begin
  insert into public.private_contact_cooldowns(user_id,last_submitted_at) values(p_user_id,now())
    on conflict(user_id) do update set last_submitted_at=excluded.last_submitted_at
    where public.private_contact_cooldowns.last_submitted_at <= now()-interval '10 minutes';
  if not found then raise exception 'COOLDOWN'; end if;
  insert into public.private_contact_messages(visitor_id,name,email,subject,message)
    values(p_user_id,p_name,p_email,p_subject,p_message) returning id into message_id;
  return message_id;
end $$;
revoke all on function public.receive_private_message(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.receive_private_message(uuid,text,text,text,text) to service_role;
commit;
