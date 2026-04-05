create extension if not exists pgcrypto with schema extensions;

create table if not exists public.games (
  id text primary key,
  gm_token text not null unique,
  title text not null,
  description text,
  card_pool jsonb not null default '[]'::jsonb,
  players jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  status text not null check (status in ('active', 'completed')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.completions (
  id uuid primary key default extensions.gen_random_uuid(),
  game_id text not null references public.games(id) on delete cascade,
  player_id text not null,
  card_id text not null,
  completed_at timestamptz not null default timezone('utc'::text, now()),
  constraint completions_game_player_card_key unique (game_id, player_id, card_id)
);

create index if not exists completions_game_id_idx on public.completions (game_id);
create index if not exists completions_game_id_player_id_idx
  on public.completions (game_id, player_id);

grant usage on schema public to anon, authenticated;
grant select, insert on public.completions to anon, authenticated;

alter table public.games enable row level security;
alter table public.completions enable row level security;

drop policy if exists "Public completions are readable" on public.completions;
create policy "Public completions are readable"
  on public.completions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Players can mark their dealt cards complete" on public.completions;
create policy "Players can mark their dealt cards complete"
  on public.completions
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.games g
      cross join lateral jsonb_array_elements(g.players) as player
      cross join lateral jsonb_array_elements(coalesce(player -> 'cards', '[]'::jsonb)) as card
      where g.id = completions.game_id
        and player ->> 'id' = completions.player_id
        and card ->> 'id' = completions.card_id
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-art',
  'card-art',
  true,
  5242880,
  array['image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  alter publication supabase_realtime add table public.completions;
exception
  when duplicate_object then null;
end
$$;
