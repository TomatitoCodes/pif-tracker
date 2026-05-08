create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table treatments
  add column if not exists user_id uuid references users(id) on delete cascade;

alter table treatments
  add column if not exists start_day integer not null default 1;

alter table treatments
  add column if not exists started_at date not null default current_date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'treatments_start_day_check'
  ) then
    alter table treatments
      add constraint treatments_start_day_check check (start_day between 1 and 84);
  end if;
end $$;

create index if not exists treatments_user_id_idx on treatments (user_id);
create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);
