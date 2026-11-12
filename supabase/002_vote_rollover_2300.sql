-- À exécuter dans SQL Editor après 001_weekly_votes.sql.
-- Le vote passe au jeudi suivant dès jeudi 23 h, heure de Paris.
-- Les anciennes réponses restent enregistrées sous leur date d'événement.

create or replace function public.current_vote_date()
returns date
language sql
stable
set search_path = ''
as $$
    with paris as (
        select now() at time zone 'Europe/Paris' as local_now
    )
    select local_now::date + case
        when extract(isodow from local_now)::integer = 4
            and local_now::time >= time '23:00' then 7
        else (4 - extract(isodow from local_now)::integer + 7) % 7
    end
    from paris;
$$;

select public.current_vote_date() as active_vote_date;
