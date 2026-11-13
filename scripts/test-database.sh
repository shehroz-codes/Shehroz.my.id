#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Explicit local Docker socket; never accepts a hosted database connection.
docker_local() {
  env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH \
    docker --host=unix:///var/run/docker.sock "$@"
}
container="shehroz-audit-postgres-$$"
container_id=''
logs_dir=$(mktemp -d)
cleanup() {
  if [[ -n "$container_id" ]]; then docker_local rm -f "$container_id" >/dev/null 2>&1 || true; fi
  rm -rf "$logs_dir"
}
trap cleanup EXIT
container_id=$(docker_local run --rm -d --network none --name "$container" \
  -e POSTGRES_PASSWORD=audit-local-only -e POSTGRES_DB=audit \
  postgres:17@sha256:846a7ddaa67a4b354ae1d21087b683901aa6113a4ed626d3787cfbf6c85e3e07)
for attempt in {1..30}; do
  if docker_local exec "$container" pg_isready -h 127.0.0.1 -U postgres -d audit >/dev/null 2>&1; then break; fi
  sleep 1
done
psql_local() { docker_local exec -i "$container" psql -h 127.0.0.1 -U postgres -d audit -v ON_ERROR_STOP=1 "$@"; }
psql_local < tests/sql/fixture.sql >/dev/null
psql_local < tests/sql/rls_auto_enable_snapshot.sql >/dev/null
psql_local < tests/sql/publish_snapshot.sql >/dev/null
psql_local < tests/sql/rpc_permissions.sql >/dev/null
if psql_local < tests/sql/assertions.sql >"$logs_dir/baseline" 2>&1; then
  echo 'FAIL: expected baseline grant exposure was not detected' >&2; exit 1
fi
[[ $(<"$logs_dir/baseline") == *'private path still exposed'* ]]
echo 'PASS: baseline grant regression reproduced'
psql_local < supabase/migrations/20261113132516_restore_visitor_message_least_privilege.sql >/dev/null
psql_local <<'SQL'
create event trigger audit_auto_rls on ddl_command_end execute function public.rls_auto_enable();
create table public.audit_rls_probe(id integer);
do $$ begin assert (select relrowsecurity from pg_class where oid='public.audit_rls_probe'::regclass), 'auto-RLS trigger broken'; end $$;
drop table public.audit_rls_probe;
SQL
echo 'PASS: execute revocation preserves automatic RLS on new tables'
psql_local < tests/sql/assertions.sql
psql_local < supabase/migrations/20261113154901_complete_contact_delivery.sql
psql_local < tests/sql/contact_delivery.sql
psql_local -c "insert into auth.users values ('00000000-0000-0000-0000-000000000003');" >/dev/null
publish() {
  if psql_local -c "set role service_role; select public.publish_visitor_message('00000000-0000-0000-0000-000000000003','Concurrent','Concurrent',null);" >"$logs_dir/$1" 2>&1; then
    echo success >"$logs_dir/$1.result"
  else
    [[ $(<"$logs_dir/$1") == *'COOLDOWN'* ]] || return 1
    echo cooldown >"$logs_dir/$1.result"
  fi
}
publish first & first_pid=$!
publish second & second_pid=$!
wait "$first_pid"
wait "$second_pid"
results="$(<"$logs_dir/first.result") $(<"$logs_dir/second.result")"
[[ "$results" == 'success cooldown' || "$results" == 'cooldown success' ]]
echo 'PASS: two concurrent publishing requests produced one commit and one cooldown'
