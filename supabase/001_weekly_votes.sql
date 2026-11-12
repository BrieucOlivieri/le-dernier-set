-- À exécuter une fois dans l'éditeur SQL du projet Supabase.
-- Les utilisateurs anonymes de Supabase Auth ont le rôle `authenticated`.

create function public.current_vote_date()
returns date
language sql
stable
set search_path = ''
as $$
    select (now() at time zone 'Europe/Paris')::date
        + ((4 - extract(isodow from (now() at time zone 'Europe/Paris')::date)::integer + 7) % 7);
$$;

create table public.weekly_votes (
    event_date date not null,
    user_id uuid not null references auth.users (id) on delete cascade,
    name text not null check (char_length(trim(name)) between 1 and 28),
    vote text not null check (vote in ('yes', 'maybe', 'no')),
    venue text check (venue in ('pavane', 'bryans')),
    reason text check (reason in ('moitie', 'fatigue', 'boulot', 'budget', 'blessure', 'canape', 'mystere')),
    created_at timestamptz not null default now(),
    primary key (event_date, user_id),
    constraint weekly_votes_thursday check (extract(isodow from event_date) = 4),
    constraint weekly_votes_choice check (
        (vote = 'no' and venue is null)
        or (vote in ('yes', 'maybe') and venue is not null and reason is null)
    )
);

alter table public.weekly_votes enable row level security;

revoke all on public.weekly_votes from public, anon, authenticated;
grant select, insert, update, delete on public.weekly_votes to authenticated;
revoke all on function public.current_vote_date() from public, anon;
grant execute on function public.current_vote_date() to authenticated;

create policy "Read votes for the weekly event"
on public.weekly_votes for select
to authenticated
using (event_date = public.current_vote_date());

create policy "Create own vote"
on public.weekly_votes for insert
to authenticated
with check (user_id = (select auth.uid()) and event_date = public.current_vote_date());

create policy "Change own vote"
on public.weekly_votes for update
to authenticated
using (user_id = (select auth.uid()) and event_date = public.current_vote_date())
with check (user_id = (select auth.uid()) and event_date = public.current_vote_date());

create policy "Remove own vote"
on public.weekly_votes for delete
to authenticated
using (user_id = (select auth.uid()) and event_date = public.current_vote_date());
