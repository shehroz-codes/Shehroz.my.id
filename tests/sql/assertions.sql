-- No production connection: execute only in the disposable fixture container.
do $$
declare r text;
begin
 foreach r in array array['anon','authenticated'] loop
  assert not has_column_privilege(r,'public.visitor_messages','photo_path','SELECT'), 'private path still exposed';
  assert not has_column_privilege(r,'public.visitor_messages','visitor_id','SELECT'), 'visitor id still exposed';
  assert not has_table_privilege(r,'public.visitor_messages','INSERT,UPDATE,DELETE'), 'broad message writes';
  assert not has_column_privilege(r,'public.visitor_messages','name','UPDATE'), 'independent column write';
  assert not has_function_privilege(r,'public.publish_visitor_message(uuid,text,text,text)','EXECUTE'), 'public RPC';
  assert not has_function_privilege(r,'public.rls_auto_enable()','EXECUTE'), 'event entry point';
 end loop;
 assert has_function_privilege('service_role','public.publish_visitor_message(uuid,text,text,text)','EXECUTE');
end $$;
set role anon;
do $$ begin
 assert (select count(id)=1 from public.visitor_messages), 'hidden/demo rows visible';
 assert (select count(*)=0 from storage.objects), 'private object visible';
 begin perform photo_path from public.visitor_messages; raise exception 'private path readable'; exception when insufficient_privilege then null; end;
 begin perform user_id from public.visitor_cooldowns; raise exception 'cooldown readable'; exception when insufficient_privilege then null; end;
 begin perform user_id from public.portfolio_admins; raise exception 'admin readable'; exception when insufficient_privilege then null; end;
 begin insert into public.visitor_messages(name,text) values ('Blocked','Blocked'); raise exception 'direct insert accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-000000000001","is_anonymous":true,"role":"authenticated"}';
set role authenticated;
do $$ begin
 assert (select count(id)=1 from public.visitor_messages), 'hidden/demo rows visible';
 assert (select count(*)=0 from public.portfolio_admins), 'anonymous user gained admin data';
 assert (select count(*)=0 from storage.objects), 'private object visible';
end $$;
reset role;
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-000000000001","is_anonymous":false,"role":"authenticated"}';
set role authenticated;
do $$ begin assert (select count(*)=1 from public.portfolio_admins), 'permanent admin cannot see own membership'; end $$;
reset role;
set role service_role;
select public.publish_visitor_message('00000000-0000-0000-0000-000000000001','First','First',null);
do $$ begin
 begin perform public.publish_visitor_message('00000000-0000-0000-0000-000000000001','Second','Second',null); raise exception 'cooldown missing';
 exception when raise_exception then if SQLERRM <> 'COOLDOWN' then raise; end if; end;
end $$;
reset role;
alter table public.visitor_messages add constraint audit_reject_text check (text <> 'reject-after-claim');
set role service_role;
do $$ begin
 begin perform public.publish_visitor_message('00000000-0000-0000-0000-000000000002','Test','reject-after-claim',null);
 exception when check_violation then null; end;
end $$;
reset role;
do $$ begin
 assert not exists (select 1 from public.visitor_cooldowns where user_id='00000000-0000-0000-0000-000000000002'), 'failed insert consumed cooldown';
 assert (select count(*)=1 from public.visitor_cooldowns), 'unexpected cooldown count';
 assert (select count(*)=4 from public.visitor_messages), 'unexpected message count';
end $$;
select 'PASS: grants, RLS, private Storage, anonymous admin isolation, cooldown and atomic rollback' as result;
