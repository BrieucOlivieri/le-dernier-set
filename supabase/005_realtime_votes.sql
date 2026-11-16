-- À exécuter après 004_optional_maybe_venue.sql.
-- Diffuse les changements de votes en direct (Supabase Realtime) : les visiteurs voient
-- arriver les réponses des autres sans recharger la page. Les règles d'accès (RLS) restent
-- appliquées : chacun ne reçoit que ce qu'il a déjà le droit de lire.

alter publication supabase_realtime add table public.weekly_votes;

select pubname, schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and tablename = 'weekly_votes';
