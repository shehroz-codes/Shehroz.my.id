-- Review-only: restore the verified public contract after broad table grants.
-- No row/policy/schema changes. Apply only after explicit production approval.
begin;
revoke all privileges on table public.visitor_messages from public, anon, authenticated;
-- Table revocation alone does not remove independent column grants.
revoke all privileges (id, name, text, country_code, country_name, has_photo,
  status, is_demo, created_at, photo_path, visitor_id)
  on table public.visitor_messages from public, anon, authenticated;
grant select (id, name, text, country_code, country_name, has_photo, status,
  is_demo, created_at) on table public.visitor_messages to anon, authenticated;
-- Event-trigger entry point has no intended browser caller.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
commit;
