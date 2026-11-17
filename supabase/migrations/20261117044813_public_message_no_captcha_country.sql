begin;

-- Public posting has its own pseudonymous device cooldown and network quota.
-- No Auth account/session is created and no historical visitor identity changes.
create table public.public_visitor_limits (
  scope text not null check (scope in ('submit','country','visitor','network')),
  identity_hash text not null check (identity_hash ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null default now(),
  attempts integer not null default 1 check (attempts > 0),
  primary key (scope,identity_hash)
);
alter table public.public_visitor_limits enable row level security;
revoke all on public.public_visitor_limits from public,anon,authenticated;
grant all on public.public_visitor_limits to service_role;
create index public_visitor_limits_expiry on public.public_visitor_limits(window_start);

create function public.consume_public_visitor_request(p_network_hash text,p_purpose text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare used integer; quota integer;
begin
  if p_network_hash is null or p_network_hash !~ '^[0-9a-f]{64}$'
    or p_purpose is null or p_purpose not in ('submit','country') then raise exception 'INVALID_LIMIT'; end if;
  quota := case when p_purpose='submit' then 30 else 120 end;
  delete from public.public_visitor_limits where window_start < now()-interval '2 days';
  insert into public.public_visitor_limits as limits(scope,identity_hash,window_start,attempts)
    values(p_purpose,p_network_hash,now(),1)
    on conflict(scope,identity_hash) do update set
      attempts=case when limits.window_start <= now()-interval '1 hour' then 1 else least(limits.attempts+1,quota+1) end,
      window_start=case when limits.window_start <= now()-interval '1 hour' then now() else limits.window_start end
    returning attempts into used;
  return used <= quota;
end $$;

create function public.publish_public_visitor_message(
  p_visitor_hash text,p_network_hash text,p_name text,p_text text,p_photo_path text default null,
  p_country_code text default null,p_country_name text default null
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare message_id uuid;
begin
  if p_visitor_hash is null or p_visitor_hash !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_VISITOR'; end if;
  if p_network_hash is null or p_network_hash !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_NETWORK'; end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 80
    or p_text is null or char_length(btrim(p_text)) not between 1 and 300
    or p_name ~ '[\x01-\x1f\x7f]' or p_text ~ '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]'
    then raise exception 'INVALID_MESSAGE'; end if;
  if p_photo_path is not null and (char_length(p_photo_path)>255
    or left(p_photo_path,65) <> p_visitor_hash||'/') then raise exception 'INVALID_PHOTO_PATH'; end if;
  if (p_country_code is null) <> (p_country_name is null)
    or (p_country_code is not null and (p_country_code !~ '^[A-Z]{2}$'
      or char_length(p_country_name) not between 1 and 80)) then raise exception 'INVALID_COUNTRY'; end if;
  -- An independent network cooldown prevents rotating browser IDs/storage from
  -- bypassing the public cooldown. Shared networks intentionally share this cap.
  insert into public.public_visitor_limits(scope,identity_hash,window_start,attempts)
    values('network',p_network_hash,now(),1)
    on conflict(scope,identity_hash) do update set window_start=excluded.window_start,attempts=1
      where public.public_visitor_limits.window_start <= now()-interval '10 minutes';
  if not found then raise exception 'COOLDOWN'; end if;
  insert into public.public_visitor_limits(scope,identity_hash,window_start,attempts)
    values('visitor',p_visitor_hash,now(),1)
    on conflict(scope,identity_hash) do update set window_start=excluded.window_start,attempts=1
      where public.public_visitor_limits.window_start <= now()-interval '10 minutes';
  if not found then raise exception 'COOLDOWN'; end if;
  insert into public.visitor_messages(visitor_id,name,text,country_code,country_name,has_photo,photo_path,status,is_demo)
    values(null,btrim(p_name),btrim(p_text),p_country_code,p_country_name,p_photo_path is not null,p_photo_path,'published',false)
    returning id into message_id;
  return message_id;
end $$;

revoke all on function public.consume_public_visitor_request(text,text) from public,anon,authenticated;
revoke all on function public.publish_public_visitor_message(text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.consume_public_visitor_request(text,text) to service_role;
grant execute on function public.publish_public_visitor_message(text,text,text,text,text,text,text) to service_role;
commit;
