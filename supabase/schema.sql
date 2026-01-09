create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  color text not null default '#2563eb',
  pin_hash text not null,
  role text not null check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  map_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  site_id uuid not null references public.sites(id),
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  meeting_time timestamptz,
  is_direct_go boolean not null default false,
  is_direct_return boolean not null default false,
  note text,
  created_by uuid not null references public.users(id),
  updated_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before jsonb,
  after jsonb,
  actor_user_id uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  type text not null,
  payload jsonb not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger sites_set_updated_at
before update on public.sites
for each row execute function public.set_updated_at();

create trigger assignments_set_updated_at
before update on public.assignments
for each row execute function public.set_updated_at();

create or replace function public.log_assignment_changes()
returns trigger language plpgsql as $$
declare
  actor_id uuid;
  before_data jsonb;
  after_data jsonb;
  action_type text;
begin
  if (tg_op = 'INSERT') then
    actor_id := new.created_by;
    before_data := null;
    after_data := to_jsonb(new);
    action_type := 'create';
  elsif (tg_op = 'UPDATE') then
    actor_id := new.updated_by;
    before_data := to_jsonb(old);
    after_data := to_jsonb(new);
    action_type := 'update';
  elsif (tg_op = 'DELETE') then
    actor_id := coalesce(old.updated_by, old.created_by);
    before_data := to_jsonb(old);
    after_data := null;
    action_type := 'delete';
  end if;

  insert into public.audit_logs (entity_type, entity_id, action, before, after, actor_user_id)
  values ('assignment', coalesce(new.id, old.id), action_type, before_data, after_data, actor_id);

  insert into public.notifications (user_id, type, payload)
  select id,
    'assignment_changed',
    jsonb_build_object(
      'assignment_id', coalesce(new.id, old.id),
      'action', action_type,
      'title', coalesce(new.title, old.title)
    )
  from public.users
  where is_active = true;

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

create trigger assignments_audit
after insert or update or delete on public.assignments
for each row execute function public.log_assignment_changes();

alter table public.users enable row level security;
alter table public.sites enable row level security;
alter table public.assignments enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

create policy "users_select" on public.users
for select using (auth.role() = 'authenticated');

create policy "users_admin_write" on public.users
for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "sites_select" on public.sites
for select using (auth.role() = 'authenticated');

create policy "sites_admin_write" on public.sites
for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "assignments_crud" on public.assignments
for all using (auth.role() = 'authenticated');

create policy "audit_logs_insert" on public.audit_logs
for insert with check (auth.role() = 'authenticated');

create policy "audit_logs_select" on public.audit_logs
for select using (auth.role() = 'authenticated');

create policy "notifications_select" on public.notifications
for select using (auth.uid() = user_id);

create policy "notifications_update" on public.notifications
for update using (auth.uid() = user_id);
