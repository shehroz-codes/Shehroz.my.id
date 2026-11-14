-- New schema contract in a disposable PostgreSQL only.
do $$ begin
  assert not has_table_privilege('anon','public.private_contact_messages','select'), 'anonymous inbox access';
  assert not has_table_privilege('authenticated','public.private_contact_messages','insert'), 'browser inbox insert';
  assert not has_table_privilege('authenticated','public.visitor_photo_cleanup','select'), 'cleanup paths exposed';
  assert not has_function_privilege('authenticated','public.receive_private_message(uuid,text,text,text,text)','execute'), 'browser private RPC access';
end $$;
set role service_role;
select public.receive_private_message('00000000-0000-0000-0000-000000000001','Owner','owner@example.com','Hello','A private message');
do $$ begin
  begin
    perform public.receive_private_message('00000000-0000-0000-0000-000000000001','Owner','owner@example.com','Hello','A duplicate message');
    raise exception 'Cooldown missing';
  exception when raise_exception then
    if sqlerrm <> 'COOLDOWN' then raise; end if;
  end;
end $$;
reset role;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000002","is_anonymous":true}';
set role authenticated;
do $$ begin assert (select count(*)=0 from public.private_contact_messages), 'private inbox leaked'; end $$;
reset role;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","is_anonymous":false}';
set role authenticated;
do $$ begin assert (select count(*)=1 from public.private_contact_messages), 'owner cannot read inbox'; end $$;
reset role;
set role service_role;
delete from public.visitor_messages where photo_path='private-object';
do $$ begin assert exists(select 1 from public.visitor_photo_cleanup where path='private-object'), 'delete lost cleanup path'; end $$;
reset role;
\echo 'PASS: private inbox RLS, service-only writes, atomic cooldown, deletion cleanup queue'
