(() => {
    'use strict';

    function loadSupabaseSdk() {
        if (window.supabase?.createClient) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            // Version figée (et non « @2 », qui suit toujours la dernière) : une mise à jour de la bibliothèque
            // ne peut pas casser le vote du jeudi sans prévenir. L'empreinte (integrity) fait refuser le fichier
            // au navigateur s'il était modifié sur le CDN. Pour monter de version : changer l'URL ET l'empreinte.
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js';
            script.integrity = 'sha384-uteMfOloLDGt042uDz+xHGF3ym63/WQ6rFq7murQRG8Ih7QrXGEGNtWd8688sb4O';
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                if (window.supabase?.createClient) resolve();
                else reject(new Error('Le client Supabase est indisponible.'));
            };
            script.onerror = () => reject(new Error('Impossible de charger le client Supabase.'));
            document.head.append(script);
        });
    }

    window.createVoteStore = async (config) => {
        await loadSupabaseSdk();
        const client = window.supabase.createClient(config.url, config.publishableKey);
        const { data: sessionData, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;

        let user = sessionData.session?.user;
        if (!user) {
            const { data, error } = await client.auth.signInAnonymously();
            if (error) throw error;
            user = data.user;
        }
        if (!user?.id) throw new Error('Identité anonyme indisponible.');

        const columns = 'event_date,user_id,name,vote,venue,reason,reason_text,created_at';
        return {
            userId: user.id,

            async list(eventDate) {
                const { data, error } = await client
                    .from('weekly_votes')
                    .select(columns)
                    .eq('event_date', eventDate)
                    .order('created_at', { ascending: true });
                if (error) throw error;
                return data;
            },

            async save(eventDate, response) {
                const { data, error } = await client
                    .from('weekly_votes')
                    .upsert({
                        event_date: eventDate,
                        user_id: user.id,
                        name: response.name,
                        vote: response.vote,
                        venue: response.venue,
                        reason: response.reason,
                        reason_text: response.reason_text ?? null,
                    }, { onConflict: 'event_date,user_id' })
                    .select(columns)
                    .single();
                if (error) throw error;
                return data;
            },

            // Prévient dès qu'un vote est ajouté, modifié ou retiré (Supabase Realtime).
            // Nécessite la migration 005 ; sans elle, l'app retombe sur l'actualisation périodique.
            subscribe(onChange) {
                const channel = client
                    .channel('weekly-votes')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_votes' }, () => onChange())
                    .subscribe();
                return () => client.removeChannel(channel);
            },

            async remove(eventDate) {
                const { error } = await client
                    .from('weekly_votes')
                    .delete()
                    .eq('event_date', eventDate)
                    .eq('user_id', user.id);
                if (error) throw error;
            },
        };
    };
})();
