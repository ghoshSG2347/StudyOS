create table if not exists public.user_syllabi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  syllabus_key text not null,
  syllabus jsonb not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, syllabus_key)
);

create index if not exists user_syllabi_user_id_idx on public.user_syllabi(user_id);
alter table public.user_syllabi enable row level security;

drop policy if exists "Users can read their syllabi" on public.user_syllabi;
drop policy if exists "Users can create their syllabi" on public.user_syllabi;
drop policy if exists "Users can update their syllabi" on public.user_syllabi;
drop policy if exists "Users can delete their syllabi" on public.user_syllabi;
create policy "Users can read their syllabi" on public.user_syllabi for select using (auth.uid() = user_id);
create policy "Users can create their syllabi" on public.user_syllabi for insert with check (auth.uid() = user_id);
create policy "Users can update their syllabi" on public.user_syllabi for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their syllabi" on public.user_syllabi for delete using (auth.uid() = user_id);
