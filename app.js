(() => {
    'use strict';
    // 1. Configuration et textes
    const $ = (selector) => document.querySelector(selector);
    const VENUES = { pavane: 'La Pavane', bryans: 'Le Bryan’s' };
    const VENUE_LOGOS = { pavane: 'assets/pavane.webp', bryans: 'assets/bryans.jpg' };
    const LOCATION_ICON = '📍';
    const REASONS = {
        moitie: {
            emoji: '💑',
            label: 'Ma moitié m’attend',
            chip: 'Ma moitié',
            jokes: [
                'La moitié passe avant le bad, et surtout avant nous.',
                'Concurrence déloyale : impossible de rivaliser avec ça.',
                'Le couple a gagné. Les copains prennent note.',
            ],
        },
        fatigue: {
            emoji: '😴',
            label: 'Fatigue générale',
            chip: 'Fatigue',
            jokes: [
                'Épuisement après quelques échanges. Les jambes ont voté.',
                'Le corps a quitté la discussion.',
                'Le bad a gagné, et le reste de la soirée perdu.',
            ],
        },
        boulot: {
            emoji: '💼',
            label: 'Boulot demain',
            chip: 'Boulot',
            jokes: [
                'Le réveil de 7 h gagne face au houblon. Victoire triste.',
                'Un jeudi soir responsable. Ça existe, apparemment.',
                'Le travail passe avant les amis. Noté, classé, rancunier.',
            ],
        },
        budget: {
            emoji: '💸',
            label: 'Fin de mois',
            chip: 'Budget',
            jokes: [
                'Le compte en banque a parlé, la bière attendra.',
                'On paiera un verre. Mais on s’en souviendra.',
                'Fin de mois : on ne dit rien, on comprend tout.',
            ],
        },
        blessure: {
            emoji: '🤕',
            label: 'Blessure de guerre',
            chip: 'Blessure',
            jokes: [
                'Blessure de guerre au badminton : un exploit en soi.',
                'Selon la version officielle, du moins.',
                'Le volant n’a fait aucun prisonnier.',
            ],
        },
        canape: {
            emoji: '🛋️',
            label: 'Le canapé m’appelle',
            chip: 'Canapé',
            jokes: [
                'Transfert très attendu : le canapé s’offre un joueur de classe.',
                'Aveu sans honte. C’est presque admirable.',
                'Le plaid remporte la manche.',
            ],
        },
        mystere: {
            emoji: '🙈',
            label: 'Je préfère ne pas dire',
            chip: 'Mystère',
            jokes: [
                'Motif non communiqué. Les rumeurs vont bon train.',
                'Silence radio. L’enquête est ouverte.',
                'Très grave, ou très drôle. Personne ne saura.',
            ],
        },
    };
    const NO_REASON_JOKE = 'Sans motif. Le canapé ne pose pas de questions.';

    const SQUADS = {
        yes: {
            emoji: '🍻',
            title: 'Les légendes <em>sont de sortie</em>',
            empty: 'Premier arrivé, premier héros. La place est libre.',
        },
        maybe: {
            emoji: '🤔',
            title: 'Le comité <em>de réflexion</em>',
            empty: 'Aucun dossier en attente. Une efficacité rare.',
        },
        no: {
            emoji: '🛋️',
            title: 'Le canapé <em>a gagné</em>',
            empty: 'Personne au canapé. Quelle belle équipe.',
        },
    };

    // 2. Date du prochain jeudi et état de la session
    function upcomingThursday() {
        const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
        date.setDate(date.getDate() + ((4 - date.getDay() + 7) % 7));
        return date;
    }

    function dateKey(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
        ].join('-');
    }

    const paris = upcomingThursday();
    const week = dateKey(paris);
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let toastTimer;
    let stampTimer;
    let shakeTimer;
    let pendingNoName = null;
    let response = null;
    let selectedVote = 'yes';
    let sharedPeople = [];
    let voteStore = null;
    let sharedVotesReady = false;
    let sharedVotesError = false;
    let refreshingVotes = false;
    let voteMutationPending = false;
    let voteVersion = 0;

    // 3. Chargement des votes partagés et restauration du formulaire
    function setVoteBusy(busy) {
        $('#save').disabled = busy;
        $('#no-confirm').disabled = busy;
        $('#remove').disabled = busy;
        $('#vote').setAttribute('aria-busy', String(busy));
    }

    function restoreForm() {
        if (!response) return;
        $('#name').value = response.name;
        const venueInput = document.querySelector(
            `input[name="venue"][value="${response.venue}"]`,
        );
        if (venueInput) venueInput.checked = true;
        chooseVote(response.vote);
        syncVenuePicker();
    }

    async function refreshSharedVotes(restoreSavedForm = false) {
        if (refreshingVotes || voteMutationPending) return;
        refreshingVotes = true;
        const version = voteVersion;
        try {
            if (!voteStore) voteStore = await window.createVoteStore(window.GSL_SUPABASE);
            const people = await voteStore.list(week);
            if (version !== voteVersion) return;
            sharedPeople = people;
            response = sharedPeople.find((person) => person.user_id === voteStore.userId) || null;
            sharedVotesReady = true;
            sharedVotesError = false;
            if (restoreSavedForm) restoreForm();
            $('#message').textContent = '';
            setVoteBusy(false);
            render();
        } catch {
            sharedVotesError = true;
            $('#message').textContent = 'Impossible de charger les votes. Réessaie avec le bouton Actualiser.';
            if (!sharedVotesReady) setVoteBusy(true);
            renderActions();
        } finally {
            refreshingVotes = false;
        }
    }

    function refreshCurrentWeek() {
        if (dateKey(upcomingThursday()) !== week) {
            location.reload();
            return;
        }
        void refreshSharedVotes();
    }

    // 4. Sélection dans le formulaire
    function chooseVote(vote) {
        selectedVote = vote;
        if (vote !== 'no') clearForfaitStamp();
        document
            .querySelectorAll('.choice')
            .forEach((button) =>
                button.setAttribute('aria-pressed', String(button.dataset.vote === vote)),
            );
        const isAbsent = vote === 'no';
        $('#venue-field').classList.toggle('hidden', isAbsent);
        document.querySelectorAll('input[name="venue"]').forEach((input) => {
            input.disabled = isAbsent;
            input.required = !isAbsent;
        });
        $('#venue-options').classList.toggle('is-disabled', isAbsent);
    }

    function syncVenuePicker() {
        document.querySelectorAll('input[name="venue"]').forEach((input) => {
            input.closest('.venue-option').classList.toggle('is-selected', input.checked);
        });
    }

    // 5. Calcul et affichage : une fonction par partie de l’interface
    function getResults(people) {
        const counts = { yes: 0, maybe: 0, no: 0 };
        const bars = { pavane: 0, bryans: 0 };
        people.forEach((person) => {
            counts[person.vote]++;
            // Les « Peut-être » ne comptent pas dans les préférences de bar.
            if (person.vote === 'yes' && Object.hasOwn(bars, person.venue)) bars[person.venue]++;
        });
        return { counts, bars };
    }

    function createPerson(person) {
        const row = document.createElement('div');
        row.className = 'person';
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = person.name.slice(0, 2).toUpperCase();
        const info = document.createElement('div');
        info.className = 'person-info';
        const name = document.createElement('div');
        name.className = 'person-name';
        name.textContent = person.name + (person === response ? ' (toi)' : '');
        info.append(name);
        if (person.vote !== 'no') {
            const preference = document.createElement('div');
            preference.className = 'person-pref';
            if (VENUE_LOGOS[person.venue]) {
                const logo = document.createElement('img');
                logo.src = VENUE_LOGOS[person.venue];
                logo.alt = '';
                preference.append(logo);
            }
            const venueName = document.createElement('span');
            venueName.textContent = VENUES[person.venue] || 'Bar non précisé';
            preference.append(venueName);
            info.append(preference);
        } else {
            const reason = REASONS[person.reason];
            const banter = document.createElement('div');
            banter.className = 'person-banter';
            const jokeIndex = Array.from(person.name).reduce(
                (sum, character) => sum + character.codePointAt(0), 0,
            ) % (reason?.jokes.length || 1);
            banter.textContent = reason
                ? reason.jokes[person === response ? 0 : jokeIndex]
                : NO_REASON_JOKE;
            info.append(banter);
            if (reason) {
                const chip = document.createElement('span');
                chip.className = 'person-reason';
                chip.textContent = reason.emoji + ' ' + reason.chip;
                row.append(chip);
            }
        }
        row.prepend(avatar, info);
        if (person === response && person.vote === 'no') row.classList.add('is-mine');
        return row;
    }

    function renderPeople(people) {
        const container = $('#people');
        container.replaceChildren();
        if (!people.length) {
            const empty = document.createElement('div');
            empty.className = 'crew-empty';
            const icon = document.createElement('span');
            icon.className = 'crew-empty-icon';
            icon.textContent = '🍺';
            icon.setAttribute('aria-hidden', 'true');
            const copy = document.createElement('div');
            const title = document.createElement('h3');
            title.textContent = 'Le barman commence à douter.';
            const detail = document.createElement('p');
            detail.textContent = 'Personne n’a encore répondu pour jeudi. À toi de le rassurer !';
            copy.append(title, detail);
            empty.append(icon, copy);
            container.append(empty);
            return;
        }
        for (const vote of ['yes', 'maybe', 'no']) {
            const meta = SQUADS[vote],
                group = people.filter((person) => person.vote === vote);
            const section = document.createElement('section');
            section.className = 'squad squad-' + vote + (group.length ? '' : ' is-empty');
            const head = document.createElement('div');
            head.className = 'squad-head';
            const icon = document.createElement('span');
            icon.className = 'squad-icon';
            icon.textContent = meta.emoji;
            icon.setAttribute('aria-hidden', 'true');
            const title = document.createElement('h3');
            title.innerHTML = meta.title;
            const badge = document.createElement('span');
            badge.className = 'squad-total';
            badge.textContent = group.length;
            head.append(icon, title, badge);
            section.append(head);
            if (!group.length) {
                const empty = document.createElement('p');
                empty.className = 'squad-empty';
                empty.textContent = meta.empty;
                section.append(empty);
            }
            if (group.length) {
                const list = document.createElement('div');
                list.className = 'squad-list';
                group.forEach((person) => list.append(createPerson(person)));
                section.append(list);
            }
            container.append(section);
        }
    }

    function renderVenueResults(counts, bars) {
        const total = bars.pavane + bars.bryans;
        const leader = bars.pavane === bars.bryans
            ? null
            : bars.pavane > bars.bryans ? 'pavane' : 'bryans';
        for (const venue of Object.keys(VENUES)) {
            $('#' + venue + '-count').textContent = bars[venue];
            $('#' + venue + '-team').classList.toggle('is-leading', venue === leader);
        }
        if (!total) {
            $('#venue-result').textContent = 'Le choix du bar reste ouvert.';
        } else if (!leader) {
            $('#venue-result').textContent = 'Égalité : à décider ensemble !';
        } else {
            $('#venue-result').textContent = VENUES[leader] + ' en tête des préférences.';
        }
        const missing = counts.yes - total;
        let detail = total
            ? 'Tendance indicative, rendez-vous à confirmer.'
            : 'Vote pour faire pencher la balance.';
        if (missing) {
            detail +=
                ' ' +
                missing +
                ' partant' +
                (missing > 1 ? 's n’ont' : ' n’a') +
                ' pas encore précisé de bar.';
        }
        if (counts.maybe) detail += ' Les « Peut-être » ne sont pas comptés.';
        $('#venue-detail').textContent = detail;
    }

    function renderActions() {
        $('#refresh-label').textContent = sharedVotesError
            ? 'Votes non actualisés. Réessaie.'
            : sharedVotesReady
              ? 'Votes du jeudi partagés entre les visiteurs.'
              : 'Connexion aux votes en cours.';
        $('#save').textContent = response
            ? 'Mettre à jour ma réponse ↗'
            : 'Allez, je donne ma réponse ↗';
        $('#remove').classList.toggle('hidden', !response);
    }

    function render() {
        const { counts, bars } = getResults(sharedPeople);
        $('#count').textContent = counts.yes + ' partant' + (counts.yes > 1 ? 's' : '');
        renderPeople(sharedPeople);
        renderVenueResults(counts, bars);
        renderActions();
    }

    // 6. Notifications et animations
    function showToast(vote, venue) {
        const notification = $('#toast');
        notification.className = 'toast toast-' + vote;
        const icon = document.createElement('span');
        icon.textContent = { yes: '🍻', maybe: '🤔', no: '🛋️' }[vote];
        icon.setAttribute('aria-hidden', 'true');
        const message = document.createElement('span');
        message.className = 'toast-text';
        const title = document.createElement('strong');
        title.textContent = {
            yes: 'C’est noté, tu viens !',
            maybe: 'Tu gardes le suspense.',
            no: 'Le canapé a gagné.',
        }[vote];
        const detail = document.createElement('small');
        detail.textContent = {
            yes: 'Ton bar préféré : ' + VENUES[venue] + '.',
            maybe: 'On attend le verdict avant de commander.',
            no: 'Tu peux encore changer d’avis.',
        }[vote];
        message.append(title, detail);
        const action = document.createElement('button');
        action.type = 'button';
        action.className = 'toast-action';
        action.textContent = vote === 'yes' ? 'Modifier' : 'Finalement, je viens';
        action.addEventListener('click', switchToYes);
        notification.replaceChildren(icon, message, action);
        void notification.offsetWidth; // relance l'animation si on clique plusieurs fois
        notification.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(
            () => notification.classList.remove('is-visible'),
            vote === 'no' ? 4000 : 3000,
        );
    }

    function clearForfaitStamp() {
        clearTimeout(stampTimer);
        clearTimeout(shakeTimer);
        $('.vote-card .forfait-stamp')?.remove();
        $('.vote-card').classList.remove('is-shaking');
    }

    function showForfaitStamp() {
        clearForfaitStamp();
        const card = $('.vote-card');
        const stamp = document.createElement('span');
        stamp.className = 'forfait-stamp';
        stamp.textContent = 'FORFAIT';
        stamp.setAttribute('aria-hidden', 'true');
        card.append(stamp);
        card.classList.add('is-shaking');
        shakeTimer = setTimeout(() => card.classList.remove('is-shaking'), 600);
        stampTimer = setTimeout(clearForfaitStamp, 5000);
    }

    function showFallingEffect(vote) {
        if (reduceMotion) return;
        const isBoo = vote === 'no';
        const colors = ['#f6c94a', '#315d46', '#24372e', '#fffdf7', '#e8a33d'];
        const booTexts = [
            'BOUUUH !', 'TRAÎTRE !', 'NUL !', 'ZÉRO VOLANT',
            'PLAID > RAQUETTE', 'MOLLASSON !', 'LE CANAPÉ GAGNE',
        ];
        const viewportWidth = innerWidth,
            viewportHeight = innerHeight;
        const total = isBoo
            ? (viewportWidth < 600 ? 8 : 11)
            : Math.min(220, Math.max(90, Math.round(viewportWidth / 6)));
        document.querySelector('.confetti')?.remove();
        const layer = document.createElement('div');
        layer.className = 'confetti';
        layer.setAttribute('aria-hidden', 'true');
        document.body.append(layer);

        for (let i = 0; i < total; i++) {
            const piece = document.createElement('span');
            piece.className = 'confetti-piece' + (isBoo ? ' boo-piece' + (i % 3 === 0 ? ' boo-kraft' : '') : '');
            if (isBoo) {
                piece.textContent = booTexts[i % booTexts.length];
            } else if (i % 12 === 0) {
                piece.textContent = ['🏸', '🍻'][(i / 12) % 2];
            } else {
                piece.style.background = colors[i % colors.length];
                piece.style.width = 6 + Math.random() * 6 + 'px';
                piece.style.height = 10 + Math.random() * 8 + 'px';
            }
            piece.style.left = Math.random() * Math.max(0, viewportWidth - (isBoo ? 170 : 0)) + 'px';
            layer.append(piece);

            const startY = isBoo ? -40 : -40 - Math.random() * viewportHeight * 0.4;
            const drift = (Math.random() - 0.5) * 240;
            const tilt = (Math.random() - 0.5) * 32;
            const sway = (Math.random() - 0.5) * 90;
            const rotation = (Math.random() - 0.5) * 1080;
            const keyframes = isBoo
                ? [
                      { transform: `translate(0, ${startY}px) rotate(${tilt}deg)`, opacity: 1 },
                      {
                          transform: `translate(${sway}px, ${viewportHeight / 2}px) rotate(${tilt + (Math.random() - 0.5) * 40}deg)`,
                          opacity: 1,
                          offset: 0.55,
                      },
                      {
                          transform: `translate(${-sway / 2}px, ${viewportHeight + 40}px) rotate(${tilt + (Math.random() - 0.5) * 80}deg)`,
                          opacity: 0,
                      },
                  ]
                : [
                      { transform: `translate(0, ${startY}px) rotate(0deg)` },
                      {
                          transform: `translate(${drift}px, ${viewportHeight + 40}px) rotate(${rotation}deg)`,
                      },
                  ];
            piece.animate(
                keyframes,
                {
                    duration: 2200 + Math.random() * (isBoo ? 800 : 2000),
                    delay: Math.random() * (isBoo ? 1700 : 700),
                    easing: isBoo ? 'cubic-bezier(.3, .5, .6, 1)' : 'cubic-bezier(.3, .6, .6, 1)',
                    fill: 'both',
                },
            );
        }
        setTimeout(() => layer.remove(), 5600);
    }

    function celebrate(vote, venue) {
        showToast(vote, venue);
        if (vote === 'no') showForfaitStamp();
        if (vote === 'yes' || vote === 'no') showFallingEffect(vote);
    }

    // 7. Enregistrement et événements
    function renderReasons() {
        const choices = $('#no-reasons');
        for (const [key, reason] of Object.entries(REASONS)) {
            const label = document.createElement('label');
            label.className = 'no-reason';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'no-reason';
            input.value = key;
            const emoji = document.createElement('span');
            emoji.className = 'no-reason-emoji';
            emoji.textContent = reason.emoji;
            emoji.setAttribute('aria-hidden', 'true');
            const text = document.createElement('span');
            text.textContent = reason.label;
            label.append(input, emoji, text);
            choices.append(label);
        }
    }

    function openNoDialog(name) {
        pendingNoName = name;
        const savedReason = response?.vote === 'no' ? response.reason : null;
        document.querySelectorAll('input[name="no-reason"]').forEach((input) => {
            input.checked = input.value === savedReason;
        });
        $('#no-dialog').showModal();
    }

    function switchToYes() {
        if ($('#no-dialog').open) $('#no-dialog').close();
        $('#toast').classList.remove('is-visible');
        clearTimeout(toastTimer);
        document.querySelector('.confetti')?.remove();
        chooseVote('yes');
        $('#message').textContent = 'Choisis ton bar, puis confirme ta réponse.';
        $('.vote-card').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        (document.querySelector('input[name="venue"]:checked') ||
            document.querySelector('input[name="venue"]')).focus({ preventScroll: true });
    }

    async function saveResponse(nextResponse) {
        if (!sharedVotesReady || !voteStore || voteMutationPending) return;
        voteMutationPending = true;
        voteVersion++;
        setVoteBusy(true);
        try {
            const saved = await voteStore.save(week, nextResponse);
            sharedPeople = sharedPeople.filter((person) => person.user_id !== voteStore.userId);
            sharedPeople.push(saved);
            sharedPeople.sort((a, b) => a.created_at.localeCompare(b.created_at));
            response = saved;
            $('#message').textContent = '';
            render();
            celebrate(response.vote, response.venue);
        } catch {
            $('#message').textContent = 'Impossible d’enregistrer ta réponse. Réessaie.';
        } finally {
            voteMutationPending = false;
            setVoteBusy(false);
        }
    }

    function confirmNo() {
        if (!pendingNoName || !sharedVotesReady) return;
        const name = pendingNoName;
        const reason = document.querySelector('input[name="no-reason"]:checked')?.value || null;
        $('#no-dialog').close();
        saveResponse({ name, vote: 'no', venue: null, reason });
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!sharedVotesReady || voteMutationPending) return;
        const name = $('#name').value.trim();
        if (!name) {
            $('#name').setCustomValidity('Indique ton prénom pour répondre.');
            $('#name').reportValidity();
            return;
        }
        const venue =
            selectedVote === 'no'
                ? null
                : document.querySelector('input[name="venue"]:checked')?.value;
        if (selectedVote !== 'no' && !Object.hasOwn(VENUES, venue)) {
            document.querySelector('input[name="venue"]').reportValidity();
            return;
        }
        if (selectedVote === 'no') {
            openNoDialog(name);
            return;
        }
        saveResponse({ name, vote: selectedVote, venue, reason: null });
    }

    async function removeResponse() {
        if (!sharedVotesReady || !voteStore || voteMutationPending) return;
        voteMutationPending = true;
        voteVersion++;
        setVoteBusy(true);
        try {
            await voteStore.remove(week);
            sharedPeople = sharedPeople.filter((person) => person.user_id !== voteStore.userId);
            response = null;
            $('#name').value = '';
            document
                .querySelectorAll('input[name="venue"]')
                .forEach((input) => (input.checked = false));
            syncVenuePicker();
            chooseVote('yes');
            $('#message').textContent = 'Ta réponse a été retirée.';
            render();
        } catch {
            $('#message').textContent = 'Impossible de retirer ta réponse. Réessaie.';
        } finally {
            voteMutationPending = false;
            setVoteBusy(false);
        }
    }

    function bindEvents() {
        $('#vote').addEventListener('submit', handleSubmit);
        $('#no-confirm').addEventListener('click', confirmNo);
        $('#no-stay').addEventListener('click', switchToYes);
        $('#no-dialog').addEventListener('close', () => { pendingNoName = null; });
        $('#name').addEventListener('input', () => $('#name').setCustomValidity(''));
        $('#refresh-votes').addEventListener('click', refreshCurrentWeek);
        $('#remove').addEventListener('click', removeResponse);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) refreshCurrentWeek();
        });
        document.querySelectorAll('.choice').forEach((button) => {
            button.addEventListener('click', () => chooseVote(button.dataset.vote));
        });
        document.querySelectorAll('input[name="venue"]').forEach((input) => {
            input.addEventListener('change', syncVenuePicker);
        });
    }

    // 8. Démarrage et restauration du formulaire
    function init() {
        renderReasons();
        $('#date').textContent = paris.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
        $('#location-icon').textContent = LOCATION_ICON;
        chooseVote(selectedVote);
        syncVenuePicker();
        render();

        bindEvents();
        setVoteBusy(true);
        void refreshSharedVotes(true);
    }
    init();
})();
