-- FinancedHub: per-user progress with row level security, plus self-service account deletion.
create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  save jsonb not null default '{}'::jsonb,
  age_confirmed boolean not null default false,
  terms_accepted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Read own progress" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own progress" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own progress" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own progress" on public.progress
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Lets a signed-in user delete their own account; progress goes with it via the cascade.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
