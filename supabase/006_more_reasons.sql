-- À exécuter après 005_realtime_votes.sql, AVANT de publier le site qui l'utilise.
-- Deux nouveaux motifs pour « Je rentre » : « Tournoi demain » (tournoi) et « Il pleut » (pluie).

alter table public.weekly_votes
    drop constraint if exists weekly_votes_reason_check;

alter table public.weekly_votes
    add constraint weekly_votes_reason_check check (
        reason in ('moitie', 'fatigue', 'boulot', 'budget', 'blessure', 'canape', 'tournoi', 'pluie', 'mystere')
    );

select pg_get_constraintdef(oid) as reason_rule
from pg_constraint
where conrelid = 'public.weekly_votes'::regclass
  and conname = 'weekly_votes_reason_check';
