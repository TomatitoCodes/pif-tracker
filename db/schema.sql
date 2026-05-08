create extension if not exists pgcrypto;

create table if not exists treatments (
  id uuid primary key default gen_random_uuid(),
  cat_name text not null default 'mi gato',
  share_token text not null unique,
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
