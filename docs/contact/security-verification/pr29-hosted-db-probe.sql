begin;
create function public.pr29_verify_visitor_limits()
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  n text := repeat(replace(gen_random_uuid()::text,'-',''),2);
  n2 text := repeat(replace(gen_random_uuid()::text,'-',''),2);
  v text := repeat(replace(gen_random_uuid()::text,'-',''),2);
  v2 text := repeat(replace(gen_random_uuid()::text,'-',''),2);
  i integer; message_id uuid;
  device_blocked boolean := false; network_blocked boolean := false;
  outcome jsonb;
  before_messages text; before_limits text;
begin
  if current_user <> 'service_role' then raise insufficient_privilege; end if;
  select md5(coalesce(string_agg(md5(to_jsonb(m)::text),'' order by id),'')) into before_messages from public.visitor_messages m;
  select md5(coalesce(string_agg(md5(to_jsonb(l)::text),'' order by scope,identity_hash),'')) into before_limits from public.public_visitor_limits l;
  begin
    for i in 1..30 loop
      assert public.consume_public_visitor_request(n,'submit'), 'submit quota rejected early';
    end loop;
    assert not public.consume_public_visitor_request(n,'submit'), 'submit quota exceeded';
    for i in 1..120 loop
      assert public.consume_public_visitor_request(n,'country'), 'country quota rejected early';
    end loop;
    assert not public.consume_public_visitor_request(n,'country'), 'country quota exceeded';
    update public.public_visitor_limits set window_start=now()-interval '61 minutes' where scope='submit' and identity_hash=n;
    assert public.consume_public_visitor_request(n,'submit'), 'hourly reset failed';
    assert (select attempts=1 from public.public_visitor_limits where scope='submit' and identity_hash=n), 'hourly attempts not reset';
    message_id := public.publish_public_visitor_message(v,n,'PR29 transaction-only probe','Never committed',null,'NL','Netherlands');
    assert (select visitor_id is null and country_code='NL' and country_name='Netherlands' from public.visitor_messages where id=message_id), 'publication contract failed';
    begin
      perform public.publish_public_visitor_message(v,n2,'PR29 transaction-only probe','Never committed');
    exception when raise_exception then
      if sqlerrm='COOLDOWN' then device_blocked:=true; else raise; end if;
    end;
    assert device_blocked, 'device cooldown missing';
    begin
      perform public.publish_public_visitor_message(v2,n,'PR29 transaction-only probe','Never committed');
    exception when raise_exception then
      if sqlerrm='COOLDOWN' then network_blocked:=true; else raise; end if;
    end;
    assert network_blocked, 'network cooldown missing';
    update public.public_visitor_limits set window_start=now()-interval '11 minutes'
      where (scope='network' and identity_hash=n) or (scope='visitor' and identity_hash=v);
    perform public.publish_public_visitor_message(v,n,'PR29 transaction-only probe','Cooldown expiry, never committed');
    outcome := jsonb_build_object('submit_30_then_reject',true,'country_120_then_reject',true,'scope_independence',true,'hourly_reset',true,'device_cooldown',device_blocked,'network_cooldown',network_blocked,'ten_minute_expiry',true,'country_columns',true);
    -- This exception exits and rolls back the entire inner block. Local PL/pgSQL
    -- outcome variables survive, but no message/quota write can be committed.
    raise exception using errcode='P9029', message='PR29 intentional subtransaction rollback';
  exception when sqlstate 'P9029' then null;
  end;
  assert before_messages=(select md5(coalesce(string_agg(md5(to_jsonb(m)::text),'' order by id),'')) from public.visitor_messages m), 'message snapshot changed';
  assert before_limits=(select md5(coalesce(string_agg(md5(to_jsonb(l)::text),'' order by scope,identity_hash),'')) from public.public_visitor_limits l), 'limits snapshot changed';
  return outcome || jsonb_build_object('all_test_writes_rolled_back',true);
end $$;
revoke all on function public.pr29_verify_visitor_limits() from public,anon,authenticated;
grant execute on function public.pr29_verify_visitor_limits() to service_role;
commit;
