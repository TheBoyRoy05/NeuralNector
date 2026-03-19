-- Create leaderboard_entries table (matches backend/api/leaderboard.py schema)
create table public.leaderboard_entries (
  id bigint primary key generated always as identity,
  name text not null,
  difficulty text not null,
  ratio text not null,
  score float not null,
  devicetype text not null,
  date_time timestamptz default now() not null
);

-- Enable RLS; Edge Functions use service role and bypass RLS
alter table public.leaderboard_entries enable row level security;
