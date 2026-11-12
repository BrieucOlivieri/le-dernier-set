-- À exécuter après 002_vote_rollover_2300.sql.
-- « Peu importe » est une préférence valide sans donner de point à un bar.

alter table public.weekly_votes
    drop constraint weekly_votes_venue_check;

alter table public.weekly_votes
    add constraint weekly_votes_venue_check
    check (venue in ('pavane', 'bryans', 'any'));

select pg_get_constraintdef(oid) as venue_rule
from pg_constraint
where conrelid = 'public.weekly_votes'::regclass
  and conname = 'weekly_votes_venue_check';
