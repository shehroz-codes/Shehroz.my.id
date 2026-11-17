-- Use only while PR #29's public handlers/frontend are still inactive.
-- Does not alter visitor_messages, private data, historical RPCs, RLS or Auth.
begin;
drop function if exists public.pr29_verify_visitor_limits();
drop function if exists public.publish_public_visitor_message(text,text,text,text,text,text,text);
drop function if exists public.consume_public_visitor_request(text,text);
drop table if exists public.public_visitor_limits;
commit;
