-- Match deployed execution grants in the disposable fixture.
revoke all on function public.publish_visitor_message(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.publish_visitor_message(uuid,text,text,text) to service_role;
