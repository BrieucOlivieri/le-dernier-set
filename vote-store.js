(() => {
    'use strict';

    function loadSupabaseSdk() {
        if (window.supabase?.createClient) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
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

        const columns = 'event_date,user_id,name,vote,venue,reason,created_at';
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
                    }, { onConflict: 'event_date,user_id' })
                    .select(columns)
                    .single();
                if (error) throw error;
                return data;
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
