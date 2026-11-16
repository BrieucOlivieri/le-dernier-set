-- À exécuter après 003_any_venue.sql, AVANT de publier le site qui l'utilise.
-- Le bar devient facultatif pour « Peut-être » ; il reste obligatoire pour « Je viens ».

alter table public.weekly_votes
    drop constraint weekly_votes_choice;

alter table public.weekly_votes
    add constraint weekly_votes_choice check (
        (vote = 'no' and venue is null)
        or (vote = 'yes' and venue is not null and reason is null)
        or (vote = 'maybe' and reason is null)
    );

select pg_get_constraintdef(oid) as choice_rule
from pg_constraint
where conrelid = 'public.weekly_votes'::regclass
  and conname = 'weekly_votes_choice';
