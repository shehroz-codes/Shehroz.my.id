-- Only executed by the disposable Docker database suite, never a hosted project.
do $$ begin
  assert (select relrowsecurity from pg_class where oid='public.public_visitor_limits'::regclass), 'rate limits missing RLS';
  assert not has_table_privilege('anon','public.public_visitor_limits','select'), 'public identifiers exposed';
  assert not has_table_privilege('authenticated','public.public_visitor_limits','insert'), 'browser can alter rate limits';
  assert not has_function_privilege('anon','public.consume_public_visitor_request(text,text)','execute'), 'browser quota RPC';
  assert not has_function_privilege('authenticated','public.publish_public_visitor_message(text,text,text,text,text,text,text)','execute'), 'browser publish RPC';
  assert (select count(*)=3 from public.visitor_messages), 'historical messages altered by migration';
end $$;
set role service_role;
do $$ declare i integer; message_id uuid; begin
  for i in 1..30 loop
    assert public.consume_public_visitor_request(repeat('a',64),'submit'), 'quota rejected too soon';
  end loop;
  assert not public.consume_public_visitor_request(repeat('a',64),'submit'), 'network quota missing';
  assert public.consume_public_visitor_request(repeat('a',64),'country'), 'country and submission quotas coupled';
  message_id := public.publish_public_visitor_message(repeat('b',64),repeat('c',64),'New visitor','Persistent public text',null,'NL','Netherlands');
  assert (select country_code='NL' and country_name='Netherlands' and visitor_id is null and status='published' and not is_demo from public.visitor_messages where id=message_id), 'public contract/country not persisted';
  begin
    perform public.publish_public_visitor_message(repeat('b',64),repeat('d',64),'Same device','Different network');
    raise exception 'device cooldown missing';
  exception when raise_exception then if sqlerrm <> 'COOLDOWN' then raise; end if; end;
  begin
    perform public.publish_public_visitor_message(repeat('e',64),repeat('c',64),'Rotated device','Same network');
    raise exception 'network cooldown missing';
  exception when raise_exception then if sqlerrm <> 'COOLDOWN' then raise; end if; end;
  message_id := public.publish_public_visitor_message(repeat('f',64),repeat('0',64),'No country','Lookup failure is allowed');
  assert (select country_code is null and country_name is null from public.visitor_messages where id=message_id), 'optional country failed';
end $$;
reset role;
set role anon;
do $$ begin
  assert (select count(*)=3 from public.visitor_messages), 'anonymous public refresh/read broke';
  begin
    insert into public.visitor_messages(name,text) values('Bypass','Direct write');
    raise exception 'browser write bypass';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
