create extension if not exists pgcrypto;

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

create table if not exists treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  cat_name text not null default 'mi gato',
  share_token text not null unique,
  start_day integer not null default 1 check (start_day between 1 and 84),
  started_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists injections (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references treatments(id) on delete cascade,
  zone text not null,
  injection_date date not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists injections_treatment_date_idx
  on injections (treatment_id, injection_date desc, created_at desc);

create index if not exists treatments_user_id_idx on treatments (user_id);
create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);
