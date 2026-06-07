-- Admin AI Code Generator: one row per generation

create table if not exists public.generated_code (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_description text not null,
  framework text not null,
  output_type text not null,
  code_content text not null,
  language text not null default 'typescript',
  created_at timestamptz not null default now()
);

alter table public.generated_code enable row level security;

create policy "Users read own generated code"
  on public.generated_code
  for select
  using (auth.uid() = user_id);

create policy "Users insert own generated code"
  on public.generated_code
  for insert
  with check (auth.uid() = user_id);

create policy "Users delete own generated code"
  on public.generated_code
  for delete
  using (auth.uid() = user_id);

create index if not exists generated_code_user_created_idx
  on public.generated_code (user_id, created_at desc);
