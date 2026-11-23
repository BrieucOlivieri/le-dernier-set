-- À exécuter après 006_more_reasons.sql, AVANT de publier le site qui l'utilise.
-- Pour « Je rentre » : un motif « Autre » avec un texte libre de 60 caractères.

alter table public.weekly_votes
    add column if not exists reason_text text;

alter table public.weekly_votes
    drop constraint if exists weekly_votes_reason_check;

alter table public.weekly_votes
    add constraint weekly_votes_reason_check check (
        reason in ('moitie', 'fatigue', 'boulot', 'budget', 'blessure', 'canape', 'tournoi', 'pluie', 'mystere', 'autre')
    );

-- Le texte n'existe que pour « autre », et il est alors obligatoire, court et sur une seule ligne.
alter table public.weekly_votes
    drop constraint if exists weekly_votes_reason_text_check;

alter table public.weekly_votes
    add constraint weekly_votes_reason_text_check check (
        (reason = 'autre'
            and reason_text is not null
            and char_length(trim(reason_text)) between 1 and 60
            and reason_text !~ '[[:cntrl:]]')
        or (reason is distinct from 'autre' and reason_text is null)
    );

select conname, pg_get_constraintdef(oid) as rule
from pg_constraint
where conrelid = 'public.weekly_votes'::regclass
  and conname in ('weekly_votes_reason_check', 'weekly_votes_reason_text_check');
