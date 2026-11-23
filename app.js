(() => {
    'use strict';
    // 1. Configuration et textes
    const $ = (selector) => document.querySelector(selector);
    const VENUES = { pavane: 'La Pavane', bryans: 'Le Bryan’s', any: 'Peu importe' };
    const VENUE_LOGOS = { pavane: 'assets/pavane.webp', bryans: 'assets/bryans.jpg' };
    // Emojis en SVG (Fluent Emoji de Microsoft, MIT) : même rendu sur iPhone, Android et ordinateur.
    function emoji(name) {
        const image = document.createElement('img');
        image.className = 'emoji';
        image.src = 'assets/emoji/' + name + '.svg';
        image.alt = '';
        return image;
    }
    const REASONS = {
        moitie: {
            emoji: 'couple',
            label: 'Ma moitié m’attend',
            chip: 'Ma moitié',
            jokes: [
                'La moitié passe avant le bad, et surtout avant nous.',
                'Concurrence déloyale : impossible de rivaliser avec ça.',
                'Le couple a gagné. Les copains prennent note.',
            ],
        },
        fatigue: {
            emoji: 'sleeping',
            label: 'Fatigue générale',
            chip: 'Fatigue',
            jokes: [
                'Épuisement après quelques échanges. Les jambes ont voté.',
                'Le corps a quitté la discussion.',
                'Le bad a gagné, et le reste de la soirée perdu.',
            ],
        },
        boulot: {
            emoji: 'briefcase',
            label: 'Boulot demain',
            chip: 'Boulot',
            jokes: [
                'Le réveil de 7 h gagne face au houblon. Victoire triste.',
                'Un jeudi soir responsable. Ça existe, apparemment.',
                'Le travail passe avant les amis. Noté, classé, rancunier.',
            ],
        },
        budget: {
            emoji: 'money',
            label: 'Fin de mois',
            chip: 'Budget',
            jokes: [
                'Le compte en banque a parlé, la bière attendra.',
                'On paiera un verre. Mais on s’en souviendra.',
                'Fin de mois : on ne dit rien, on comprend tout.',
            ],
        },
        blessure: {
            emoji: 'bandage',
            label: 'Blessure de guerre',
            chip: 'Blessure',
            jokes: [
                'Blessure de guerre au badminton : un exploit en soi.',
                'Selon la version officielle, du moins.',
                'Le volant n’a fait aucun prisonnier.',
            ],
        },
        canape: {
            emoji: 'couch',
            label: 'Le canapé m’appelle',
            chip: 'Canapé',
            jokes: [
                'Transfert très attendu : le canapé s’offre un joueur de classe.',
                'Aveu sans honte. C’est presque admirable.',
                'Le plaid remporte la manche.',
            ],
        },
        tournoi: {
            emoji: 'trophy',
            label: 'Tournoi',
            chip: 'Tournoi',
            jokes: [
                'Tournoi : il garde ses forces (et ses excuses).',
                'Repos du guerrier avant la compét’. Très pro.',
                'Le bar attendra la remise des médailles.',
            ],
        },
        pluie: {
            emoji: 'umbrella-rain',
            label: 'Il pleut',
            chip: 'Pluie',
            jokes: [
                'Il pleut. Le badiste est soluble, c’est bien connu.',
                'Trois gouttes et c’est la débandade.',
                'Ni parapluie ni courage ce soir.',
            ],
        },
        mystere: {
            emoji: 'monkey',
            label: 'Je préfère ne pas dire',
            chip: 'Mystère',
            jokes: [
                'Motif non communiqué. Les rumeurs vont bon train.',
                'Silence radio. L’enquête est ouverte.',
                'Très grave, ou très drôle. Personne ne saura.',
            ],
        },
        // Texte libre : c'est l'excuse de la personne (reason_text) qui s'affiche à la place d'une vanne.
        autre: {
            emoji: 'pencil',
            label: 'Autre',
            chip: 'Autre',
            jokes: [],
        },
    };
    const NO_REASON_JOKE = 'Sans motif. Le canapé ne pose pas de questions.';
    const SUBMIT_HELPER = 'Tu peux changer d’avis. Même après avoir dit « je rentre ».';
    const VENUE_HINTS = {
        yes: 'Ta préférence sera affichée avec ta réponse.',
        maybe: 'Pas encore d’avis ? Laisse vide. Touche à nouveau un bar pour le désélectionner.',
    };

    const SQUADS = {
        yes: {
            emoji: 'beers',
            title: 'Les légendes <em>sont de sortie</em>',
            empty: 'Premier arrivé, premier héros. La place est libre.',
        },
        maybe: {
            emoji: 'thinking',
            title: 'Le comité <em>de réflexion</em>',
            empty: 'Aucun dossier en attente. Une efficacité rare.',
        },
        no: {
            emoji: 'couch',
            title: 'Le canapé <em>a gagné</em>',
            empty: 'Personne au canapé. Quelle belle équipe.',
        },
    };

    const MEETUP_HOUR = 20; // fin du créneau de bad, heure de Paris : cible du compte à rebours
    const LIVE_POLL_MS = 30_000; // filet de sécurité si le direct Supabase ne répond pas
    // Annonces quand quelqu'un d'autre vote pendant qu'on regarde la page.
    const LIVE_MESSAGES = {
        arrive: {
            yes: (name) => name + ' vient boire un verre !',
            maybe: (name) => name + ' réfléchit encore…',
            no: (name) => name + ' déclare forfait.',
        },
        change: {
            yes: (name) => name + ' rejoint les légendes !',
            maybe: (name) => name + ' passe au comité de réflexion.',
            no: (name) => name + ' rejoint le canapé.',
        },
    };
    // Phrase de la bulle de l'affiche selon le nombre de partants (seuil minimum, texte).
    const POSTER_LINES = [
        [7, '« Ça déborde ! »'],
        [4, '« Ça se remplit ! »'],
        [2, '« Ça trinque déjà. »'],
        [1, '« Un brave. Qui suit ? »'],
        [0, '« Juste un verre. »'],
    ];

    // 2. Date du prochain jeudi et état de la session
    // Heure de Paris, quel que soit le fuseau de l'appareil.
    function parisNow() {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    }

    function upcomingThursday() {
        const date = parisNow();
        const daysAhead = (4 - date.getDay() + 7) % 7;
        date.setDate(date.getDate() + (daysAhead === 0 && date.getHours() >= 23 ? 7 : daysAhead));
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
    let checkedVenue = null; // bar coché avant le dernier clic, pour pouvoir le décocher
    let sharedPeople = [];
    let voteStore = null;
    let sharedVotesReady = false;
    let sharedVotesError = false;
    let refreshingVotes = false;
    let voteMutationPending = false;
    let voteVersion = 0;
    let voteBusy = true;
    let refreshQueued = false; // un changement est arrivé pendant un chargement : on recharge après
    let liveRefreshTimer;
    let liveStarted = false;
    let lastYesCount = null;
    const freshIds = new Set(); // lignes à faire apparaître en glissant au prochain rendu
    let shifumiWinner = null; // bar désigné par le dernier shifumi (pour rire)
    let shifumiPlaying = false;
    let posterPartants = 0;
    let bubbleOverrideUntil = 0;
    let bubbleTimer;

    // 3. Chargement des votes partagés et restauration du formulaire
    function setVoteBusy(busy) {
        voteBusy = busy;
        $('#no-confirm').disabled = busy;
        $('#remove').disabled = busy;
        $('#vote').setAttribute('aria-busy', String(busy));
        updateSubmitState();
    }

    // Ce qui manque pour valider : le prénom, et le bar pour « Je viens ».
    function missingParts() {
        return {
            name: !$('#name').value.trim(),
            venue: selectedVote === 'yes' && !document.querySelector('input[name="venue"]:checked'),
        };
    }

    function missingRequirement() {
        const { name, venue } = missingParts();
        if (name && venue) return 'Ajoute ton prénom et choisis ton bar pour valider.';
        if (name) return 'Ajoute ton prénom pour valider.';
        if (venue) return 'Choisis ton bar pour valider.';
        return null;
    }

    // [libellé, emoji] du bouton : ce qui manque (main qui montre le haut), sinon envoyer ou mettre à jour.
    function submitLabel() {
        const { name, venue } = missingParts();
        if (name && venue) {
            // Sur les petits écrans, version courte pour tenir sur une ligne.
            return [matchMedia('(max-width: 385px)').matches ? 'Il manque prénom + bar' : 'Il manque ton prénom et ton bar', 'point-up'];
        }
        if (name) return ['Il manque ton prénom', 'point-up'];
        if (venue) return ['Il manque ton bar', 'point-up'];
        return response ? ['Mettre à jour ma réponse', 'pencil'] : ['Allez, je donne ma réponse', 'beers'];
    }

    // Tant que la réponse est incomplète, le bouton dit ce qui manque.
    // Il garde son air de bouton : un appui amène sur le champ à remplir.
    function updateSubmitState() {
        const missing = missingRequirement();
        const save = $('#save');
        save.disabled = voteBusy;
        save.classList.toggle('is-incomplete', Boolean(missing));
        save.setAttribute('aria-disabled', String(voteBusy || Boolean(missing)));
        const [label, icon] = submitLabel();
        save.replaceChildren(label + ' ', emoji(icon));
        const helper = $('#submit-helper');
        helper.textContent = missing || SUBMIT_HELPER;
        helper.classList.toggle('is-missing', Boolean(missing));
    }

    // Appui sur le bouton incomplet : on amène l'œil (et le curseur) sur ce qu'il manque.
    function pointToMissing({ name, venue }) {
        const fields = [name && $('#name'), venue && $('#venue-options')].filter(Boolean);
        fields[0].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        for (const field of fields) {
            field.classList.remove('is-attention');
            void field.offsetWidth; // relance l'animation si on rappuie
            field.classList.add('is-attention');
            clearTimeout(field.attentionTimer);
            field.attentionTimer = setTimeout(() => field.classList.remove('is-attention'), 1400);
        }
        if (name) $('#name').focus({ preventScroll: true });
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
        if (refreshingVotes || voteMutationPending) {
            refreshQueued = true;
            return;
        }
        refreshingVotes = true;
        const version = voteVersion;
        try {
            if (!voteStore) voteStore = await window.createVoteStore(window.GSL_SUPABASE);
            const people = await voteStore.list(week);
            if (version !== voteVersion) return;
            if (sharedVotesReady) announceChanges(sharedPeople, people);
            sharedPeople = people;
            response = sharedPeople.find((person) => person.user_id === voteStore.userId) || null;
            sharedVotesReady = true;
            sharedVotesError = false;
            if (restoreSavedForm) restoreForm();
            $('#message').textContent = '';
            setVoteBusy(false);
            render();
            startLiveUpdates();
        } catch {
            sharedVotesError = true;
            $('#message').textContent = 'Impossible de charger les votes. Réessaie avec le bouton Actualiser.';
            if (!sharedVotesReady) setVoteBusy(true);
            renderActions();
        } finally {
            refreshingVotes = false;
            flushQueuedRefresh();
        }
    }

    function flushQueuedRefresh() {
        if (!refreshQueued || refreshingVotes || voteMutationPending) return;
        refreshQueued = false;
        void refreshSharedVotes();
    }

    // Direct : Supabase prévient à chaque vote, et une actualisation toutes les 30 s
    // sert de filet de sécurité (onglet visible uniquement).
    function startLiveUpdates() {
        if (liveStarted) return;
        liveStarted = true;
        try {
            voteStore.subscribe(() => {
                clearTimeout(liveRefreshTimer);
                liveRefreshTimer = setTimeout(refreshCurrentWeek, 300);
            });
        } catch {
            // L'actualisation périodique prend le relais.
        }
        setInterval(() => {
            if (!document.hidden) refreshCurrentWeek();
        }, LIVE_POLL_MS);
    }

    // Compare l'ancienne et la nouvelle liste pour annoncer les votes des autres.
    function announceChanges(previous, next) {
        const before = new Map(previous.map((person) => [person.user_id, person]));
        let someoneComes = false;
        for (const person of next) {
            if (person.user_id === voteStore.userId) continue;
            const old = before.get(person.user_id);
            if (old && old.vote === person.vote) continue;
            freshIds.add(person.user_id);
            const special = window.leDernierSetSpecial?.find(person.name);
            showLiveNote(
                special?.live[person.vote] ?? LIVE_MESSAGES[old ? 'change' : 'arrive'][person.vote](person.name),
                special?.icon ?? SQUADS[person.vote].emoji,
                person.vote,
            );
            if (person.vote === 'yes') someoneComes = true;
        }
        if (someoneComes) replayAnimation($('.beers'), 'is-cheering');
    }

    function ensureCurrentWeek() {
        if (dateKey(upcomingThursday()) !== week) {
            location.reload();
            return false;
        }
        return true;
    }

    function refreshCurrentWeek() {
        if (!ensureCurrentWeek()) return;
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
            // Le bar n'est obligatoire que pour « Je viens ».
            input.required = vote === 'yes';
        });
        $('#venue-options').classList.toggle('is-disabled', isAbsent);
        $('#venue-optional').hidden = vote !== 'maybe';
        if (VENUE_HINTS[vote]) $('#venue-hint').textContent = VENUE_HINTS[vote];
        updateSubmitState();
    }

    function syncVenuePicker() {
        checkedVenue = null;
        document.querySelectorAll('input[name="venue"]').forEach((input) => {
            input.closest('.venue-option').classList.toggle('is-selected', input.checked);
            if (input.checked) checkedVenue = input.value;
        });
        updateSubmitState();
    }

    function toggleVenue(event) {
        // En « Peut-être », un second clic sur le bar choisi le désélectionne.
        if (selectedVote === 'maybe' && event.target.value === checkedVenue) {
            event.target.checked = false;
        }
        syncVenuePicker();
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
        // Le texte du prénom dans son propre span : c'est lui qui est surligné (pas le badge à côté).
        const nameText = document.createElement('span');
        nameText.className = 'person-name-text';
        nameText.textContent = person.name + (person === response ? ' (toi)' : '');
        name.append(nameText);
        if (person === response) name.classList.add('is-me'); // surligné sur la feuille
        const badge = window.leDernierSetSpecial?.find(person.name)?.badge;
        if (badge) {
            const mark = emoji(badge);
            mark.classList.add('person-badge');
            name.append(' ', mark);
        }
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
            if (person.venue === 'any') {
                // « Peu importe » : les deux logos superposés, comme dans le formulaire.
                const logos = document.createElement('span');
                logos.className = 'pref-logos';
                logos.setAttribute('aria-hidden', 'true');
                for (const src of Object.values(VENUE_LOGOS)) {
                    const logo = document.createElement('img');
                    logo.src = src;
                    logo.alt = '';
                    logos.append(logo);
                }
                preference.append(logos);
                venueName.textContent = 'Peu importe';
            } else if (VENUES[person.venue]) {
                venueName.textContent = VENUES[person.venue];
            } else {
                // « Peut-être » sans bar : la question reste ouverte au comité.
                preference.classList.add('is-undecided');
                const mark = document.createElement('span');
                mark.className = 'pref-mark';
                mark.textContent = '?';
                mark.setAttribute('aria-hidden', 'true');
                preference.append(mark);
                venueName.textContent = 'Bar en délibéré';
            }
            preference.append(venueName);
            info.append(preference);
        } else {
            const reason = REASONS[person.reason];
            const banter = document.createElement('div');
            banter.className = 'person-banter';
            const jokeIndex = Array.from(person.name).reduce(
                (sum, character) => sum + character.codePointAt(0), 0,
            ) % (reason?.jokes.length || 1);
            if (person.reason === 'autre' && person.reason_text) {
                banter.textContent = '« ' + person.reason_text + ' »';
            } else {
                banter.textContent = reason?.jokes.length
                    ? reason.jokes[person === response ? 0 : jokeIndex]
                    : NO_REASON_JOKE;
            }
            info.append(banter);
            if (reason) {
                const chip = document.createElement('span');
                chip.className = 'person-reason';
                chip.append(emoji(reason.emoji), ' ' + reason.chip);
                row.append(chip);
            }
        }
        row.prepend(avatar, info);
        if (person === response && person.vote === 'no') row.classList.add('is-mine');
        if (freshIds.has(person.user_id)) row.classList.add('is-new');
        return row;
    }

    // Le casting est une feuille de présence : chacun « signe » sur une ligne, dans sa rubrique.
    function goToVoteForm() {
        // Va au formulaire et place le curseur dans le prénom ; aucun vote n'est créé.
        $('.vote-card').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        $('#name').focus({ preventScroll: true });
    }

    function attendanceLine(number, { invite = false } = {}) {
        const row = document.createElement('div');
        row.className = 'attendance-line' + (invite ? ' is-invite' : '');
        const index = document.createElement('i');
        index.textContent = number;
        index.setAttribute('aria-hidden', 'true');
        row.append(index);
        if (invite) {
            const me = document.createElement('span');
            me.className = 'attendance-me';
            me.textContent = 'Toi ?';
            const hint = document.createElement('button');
            hint.type = 'button';
            hint.className = 'attendance-hint';
            hint.textContent = 'signe ici';
            hint.addEventListener('click', goToVoteForm);
            row.append(me, hint);
        } else {
            row.setAttribute('aria-hidden', 'true');
        }
        return row;
    }

    function renderPeople(people) {
        const container = $('#people');
        const sheet = document.createElement('section');
        sheet.className = 'attendance-sheet' + (people.length ? '' : ' is-blank');
        sheet.setAttribute('aria-label', 'Feuille de présence');
        const tape = document.createElement('span');
        tape.className = 'attendance-tape';
        tape.setAttribute('aria-hidden', 'true');
        const top = document.createElement('div');
        top.className = 'attendance-top';
        top.setAttribute('aria-hidden', 'true');
        const heading = document.createElement('span');
        heading.textContent = 'Feuille de présence';
        const day = document.createElement('span');
        day.textContent = paris.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        top.append(heading, day);
        sheet.append(tape, top);
        container.replaceChildren(sheet);

        if (!people.length) {
            // Personne n'a répondu : feuille vierge à signer en premier.
            sheet.append(attendanceLine(1, { invite: true }), attendanceLine(2), attendanceLine(3), attendanceLine(4));
            const bottom = document.createElement('div');
            bottom.className = 'attendance-bottom';
            const copy = document.createElement('div');
            const title = document.createElement('b');
            title.textContent = 'Personne n’a encore signé.';
            const detail = document.createElement('span');
            detail.textContent = 'Le barman commence à douter.';
            copy.append(title, detail);
            const sign = document.createElement('button');
            sign.type = 'button';
            sign.className = 'attendance-cta';
            sign.append('Signer en premier ', emoji('nib'));
            sign.addEventListener('click', goToVoteForm);
            bottom.append(copy, sign);
            sheet.append(bottom);
            return;
        }

        // Trois rubriques ; les lignes sont numérotées d'une rubrique à l'autre.
        let number = 0;
        for (const vote of ['yes', 'maybe', 'no']) {
            const meta = SQUADS[vote],
                group = people.filter((person) => person.vote === vote);
            const section = document.createElement('section');
            section.className = 'squad squad-' + vote + (group.length ? '' : ' is-empty');
            const head = document.createElement('div');
            head.className = 'squad-head';
            const icon = document.createElement('span');
            icon.className = 'squad-icon';
            icon.append(emoji(meta.emoji));
            icon.setAttribute('aria-hidden', 'true');
            const title = document.createElement('h3');
            title.innerHTML = meta.title;
            const badge = document.createElement('span');
            badge.className = 'squad-total';
            badge.textContent = group.length;
            head.append(icon, title, badge);
            section.append(head);
            if (group.length) {
                const list = document.createElement('div');
                list.className = 'squad-list';
                group.forEach((person) => {
                    const row = createPerson(person);
                    const index = document.createElement('i');
                    index.className = 'attendance-number';
                    index.textContent = ++number;
                    index.setAttribute('aria-hidden', 'true');
                    row.prepend(index);
                    list.append(row);
                });
                section.append(list);
            } else {
                const note = document.createElement('p');
                note.className = 'attendance-note';
                note.textContent = meta.empty;
                section.append(note);
            }
            sheet.append(section);
        }
        // Tant que tu n'as pas répondu, une ligne t'attend en bas de la feuille.
        if (!response) sheet.append(attendanceLine(number + 1, { invite: true }));
    }

    function renderVenueResults(counts, bars) {
        const total = bars.pavane + bars.bryans;
        const leader = bars.pavane === bars.bryans
            ? null
            : bars.pavane > bars.bryans ? 'pavane' : 'bryans';
        for (const venue of Object.keys(bars)) {
            $('#' + venue + '-count').textContent = bars[venue];
            $('#' + venue + '-team').classList.toggle('is-leading', venue === leader);
        }
        // Easter egg shifumi : proposé en cas d'égalité ; son verdict reste affiché tant que l'égalité dure.
        const isTie = !leader && bars.pavane >= SHIFUMI_MIN_SCORE;
        if (!isTie) shifumiWinner = null;
        $('#shifumi').classList.toggle('hidden', !isTie || shifumiPlaying);
        if (shifumiPlaying) {
            // Le résultat s'affichera à la fin de la partie.
        } else if (isTie && shifumiWinner) {
            $('#venue-result').textContent =
                'Le shifumi a parlé : ' + VENUES[shifumiWinner] + ' ! (pour rire, le vote continue)';
            $('#' + shifumiWinner + '-team').classList.add('is-leading');
        } else if (!total) {
            $('#venue-result').textContent = 'Le choix du bar reste ouvert.';
        } else if (!leader) {
            $('#venue-result').textContent = 'Égalité : à décider ensemble !';
        } else {
            $('#venue-result').textContent = VENUES[leader] + ' en tête des préférences.';
        }
        const flexible = counts.yes - total;
        let detail = total
            ? 'Tendance indicative, rendez-vous à confirmer.'
            : 'Vote pour faire pencher la balance.';
        if (flexible) {
            detail +=
                ' ' +
                flexible +
                ' partant' +
                (flexible > 1 ? 's' : '') +
                ' sans préférence de bar.';
        }
        if (counts.maybe) detail += ' Les « Peut-être » ne sont pas comptés.';
        $('#venue-detail').textContent = detail;
    }

    function renderActions() {
        $('#refresh-label').textContent = sharedVotesError
            ? 'Votes non actualisés. Réessaie.'
            : sharedVotesReady
              ? 'Votes partagés en direct.'
              : 'Connexion aux votes en cours.';
        updateSubmitState(); // libellé du bouton (« donne » / « mets à jour » / ce qui manque)
        $('#remove').classList.toggle('hidden', !response);
    }

    // Partage WhatsApp : un récap qui chambre, prêt à envoyer au groupe.
    const SITE_URL = 'https://brieucolivieri.github.io/le-dernier-set/';
    // Écrit comme un message du groupe. Pas d'emoji : le lien WhatsApp les abîme.
    const SHARE_BARS = { pavane: 'la Pavane', bryans: "le Bryan's" };
    const SHARE_EXCUSES = {
        moitie: 'sa moitié l\'attend',
        fatigue: 'la fatigue, paraît-il',
        boulot: 'boulot demain, comme tout le monde',
        budget: 'fin de mois',
        blessure: 'soi-disant une blessure',
        canape: 'le canapé, au moins c\'est honnête',
        tournoi: 'tournoi demain, soi-disant',
        pluie: 'il pleut, sérieux',
        mystere: 'sans dire pourquoi, c\'est louche',
    };

    function joinNames(names) {
        return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' et ' + names.at(-1);
    }

    function comersLine(names, total) {
        if (!total) return 'Bon, personne d\'inscrit pour le bar jeudi, vous êtes sérieux ?';
        if (!names.length) return 'Pour l\'instant personne au bar jeudi, ça craint';
        if (names.length === 1) return `Pour l'instant y a que ${names[0]} au bar jeudi, ça fait un peu triste`;
        return `Au bar jeudi pour l'instant : ${joinNames(names)}`;
    }

    // Même vanne tant que les réponses ne changent pas.
    function hesitantsLine(names) {
        const who = joinNames(names);
        const many = names.length > 1;
        const seed = Array.from(names.join('')).reduce((sum, character) => sum + character.codePointAt(0), 0);
        return [
            `${who} ${many ? 'hésitent' : 'hésite'} encore, comme d'hab`,
            `${who} ${many ? 'disent' : 'dit'} peut-être, donc non`,
            `${who} ${many ? 'réfléchissent' : 'réfléchit'} encore, on a le temps de vieillir`,
        ][seed % 3];
    }

    function leaversLines(people) {
        if (people.length > 3) return [`${joinNames(people.map((person) => person.name))} nous lâchent`];
        return people.map((person, index) => {
            const excuse = person.reason_text || SHARE_EXCUSES[person.reason] || 'même pas d\'excuse';
            return `${person.name} ${index ? 'aussi' : 'nous lâche'} (${excuse})`;
        });
    }

    function barsLine({ pavane, bryans }) {
        if (!pavane && !bryans) return null;
        if (pavane === bryans) return 'Égalité entre la Pavane et le Bryan\'s, faut trancher';
        const leader = pavane > bryans ? 'pavane' : 'bryans';
        return `Ça part sur ${SHARE_BARS[leader]} pour l'instant (${Math.max(pavane, bryans)}-${Math.min(pavane, bryans)})`;
    }

    function buildRecap(people, bars) {
        const group = (vote) => people.filter((person) => person.vote === vote);
        const yes = group('yes').map((person) => person.name);
        const maybe = group('maybe').map((person) => person.name);
        const lines = [comersLine(yes, people.length)];
        if (maybe.length) lines.push(hesitantsLine(maybe));
        lines.push(...leaversLines(group('no')));
        const bar = barsLine(bars);
        if (bar) lines.push(bar);
        lines.push('', yes.length ? 'Qui d\'autre ?' : 'Qui vient ?', SITE_URL);
        return lines.join('\n');
    }

    function renderShare(bars) {
        const link = $('#share-whatsapp');
        // Réservé à Brieuc (celui qui a voté sous ce prénom depuis ce navigateur),
        // et pas de récap tant que les vrais votes ne sont pas arrivés.
        const isBrieuc = /^brieuc(?![\p{L}])/iu.test(response?.name?.trim() ?? '');
        link.hidden = !isBrieuc || !sharedVotesReady || Boolean(sharedVotesError);
        link.href = 'https://wa.me/?text=' + encodeURIComponent(buildRecap(sharedPeople, bars));
    }

    function render() {
        const { counts, bars } = getResults(sharedPeople);
        $('#count').textContent = counts.yes + ' partant' + (counts.yes > 1 ? 's' : '');
        if (sharedVotesReady) {
            if (lastYesCount !== null && counts.yes !== lastYesCount) {
                replayAnimation($('#count'), 'is-bumped');
            }
            lastYesCount = counts.yes;
        }
        renderPoster(counts.yes);
        renderPeople(sharedPeople);
        freshIds.clear();
        renderVenueResults(counts, bars);
        renderActions();
        renderShare(bars);
    }

    function renderPoster(partants) {
        posterPartants = partants;
        if (Date.now() < bubbleOverrideUntil) return; // un easter egg occupe la bulle
        setBubble(POSTER_LINES.find(([minimum]) => partants >= minimum)[1]);
    }

    function setBubble(line) {
        const bubble = $('.bubble');
        if (bubble.textContent === line) return;
        bubble.textContent = line;
        if (sharedVotesReady) replayAnimation(bubble, 'is-popping');
    }

    // Affiche un texte temporaire dans la bulle, puis revient au texte normal.
    function shoutInBubble(line, duration = 3500) {
        bubbleOverrideUntil = Date.now() + duration;
        setBubble(line);
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => {
            bubbleOverrideUntil = 0;
            renderPoster(posterPartants);
        }, duration);
    }

    // Relance une animation CSS même si la classe est déjà présente.
    function replayAnimation(element, className) {
        if (reduceMotion || !element) return;
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
    }

    // 6. Notifications et animations
    // Petite bulle en haut de l'écran (votes en direct, rallye…). tone : yes, maybe, no ou rally.
    function showLiveNote(text, iconName, tone) {
        const feed = $('#live-feed');
        const note = document.createElement('div');
        note.className = 'live-note live-note-' + tone;
        const icon = document.createElement('span');
        icon.className = 'live-note-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.append(emoji(iconName));
        const label = document.createElement('span');
        label.textContent = text;
        note.append(icon, label);
        feed.append(note);
        while (feed.children.length > 3) feed.firstElementChild.remove();
        setTimeout(() => {
            note.classList.add('is-leaving');
            setTimeout(() => note.remove(), 400);
        }, 4500);
    }

    function showToast(vote, venue) {
        const notification = $('#toast');
        notification.className = 'toast toast-' + vote;
        const icon = document.createElement('span');
        icon.append(emoji(SQUADS[vote].emoji));
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
            yes: venue === 'any'
                ? 'Les deux bars te vont.'
                : 'Ton bar préféré : ' + VENUES[venue] + '.',
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
                piece.append(emoji(['badminton', 'beers'][(i / 12) % 2]));
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
        if (vote === 'no') showForfaitStamp();
        // Prénom spécial (special-names.js) : son animation remplace les confettis du « Je viens »,
        // et la bulle « C'est noté » attend la fin de la scène pour ne pas se superposer.
        const special = window.leDernierSetSpecial?.find(response?.name);
        if (special) {
            special.celebrate(vote).then(() => {
                if (response?.vote === vote) showToast(vote, venue); // sauf si la réponse a changé entre-temps
            });
        } else {
            showToast(vote, venue);
        }
        if (vote === 'no' || (vote === 'yes' && !special)) showFallingEffect(vote);
    }

    // 7. Enregistrement et événements
    function renderReasons() {
        const choices = $('#no-reasons');
        for (const [key, reason] of Object.entries(REASONS)) {
            const label = document.createElement('label');
            label.className = 'no-reason';
            label.dataset.reason = key; // chaque excuse a sa propre animation d'emoji
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'no-reason';
            input.value = key;
            const icon = document.createElement('span');
            icon.className = 'no-reason-emoji';
            icon.append(emoji(reason.emoji));
            icon.setAttribute('aria-hidden', 'true');
            const text = document.createElement('span');
            text.textContent = reason.label;
            label.append(input, icon, text);
            choices.append(label);
        }
    }

    function openNoDialog(name) {
        pendingNoName = name;
        const savedReason = response?.vote === 'no' ? response.reason : null;
        document.querySelectorAll('input[name="no-reason"]').forEach((input) => {
            input.checked = input.value === savedReason;
        });
        $('#no-reason-text').value = savedReason === 'autre' ? response.reason_text ?? '' : '';
        resetCredibility();
        reactToReason(false);
        $('#no-dialog').showModal();
    }

    // Le champ libre n'apparaît que pour « Autre ».
    function syncCustomReason() {
        const isCustom = document.querySelector('input[name="no-reason"]:checked')?.value === 'autre';
        $('#no-reason-custom').hidden = !isCustom;
        $('#no-reason-text').setCustomValidity('');
        return isCustom;
    }

    // Le barman juge l'excuse en direct : une phrase, une jauge de crédibilité, un bouton adapté.
    const NO_DEFAULT_LEAD = 'Le canapé n’a pas besoin de toi. Nous, un peu. Dis-nous au moins pourquoi.';
    const NO_VERDICTS = {
        moitie: { score: 51, line: 'Une chance sur deux que ce soit vrai. On demandera à ta moitié.', confirm: 'Je retrouve ma moitié' },
        fatigue: { score: 38, line: 'Après trois volants ? On y croit moyen.', confirm: 'Je vais me coucher' },
        boulot: { score: 61, line: 'Tout le monde bosse demain. Mais bon, ça passe.', confirm: 'Je mets mon réveil' },
        budget: { score: 89, line: 'Dur à contester. Même si quelqu’un t’en aurait payé une.', confirm: 'Je garde mes sous' },
        blessure: { score: 27, line: 'Une blessure, comme par hasard à l’heure du bar.', confirm: 'Je vais boiter ailleurs' },
        canape: { score: 77, line: 'Au moins c’est honnête. On respecte, sans approuver.', confirm: 'Je retrouve mon canapé' },
        tournoi: { score: 100, line: 'Rien à redire, le tournoi c’est sacré. Ramène une médaille.', confirm: 'Je garde mes forces' },
        pluie: { score: 4, line: 'Il pleut dehors, pas dans le bar.', confirm: 'Je rentre sous la pluie' },
        mystere: { score: 0, line: 'Zéro explication, zéro crédibilité. L’enquête est ouverte.', confirm: 'Je file en douce' },
        autre: { confirm: 'Je rentre quand même' },
    };
    let credValue = 0;
    let credFrame = 0;
    let credTimer = 0;
    let noDialogLeaving = false;

    function setLead(text, animated) {
        const lead = $('#no-dialog-lead');
        if (lead.textContent.trim() === text) return;
        lead.textContent = text;
        if (animated) replayAnimation(lead, 'is-swapped');
    }

    function drawCredibility(value) {
        credValue = value;
        $('#no-cred-fill').style.transform = `scaleX(${value / 100})`;
        $('#no-cred-value').textContent = Math.round(value) + ' %';
    }

    function stopCredibility() {
        cancelAnimationFrame(credFrame);
        clearTimeout(credTimer);
    }

    function resetCredibility() {
        stopCredibility();
        credValue = 0;
        $('#no-cred-fill').style.transform = 'scaleX(0)';
        $('#no-cred-value').textContent = '?';
        $('#no-cred').dataset.level = '';
        $('#no-cred').setAttribute('aria-label', 'Crédibilité de ton excuse : pas encore jugée');
    }

    // La jauge monte à fond, puis retombe sur la vraie note.
    function runCredibility(target, animated) {
        stopCredibility();
        const cred = $('#no-cred');
        const settle = () => {
            drawCredibility(target);
            cred.dataset.level = target < 34 ? 'low' : target < 70 ? 'mid' : 'high';
            cred.setAttribute('aria-label', `Crédibilité de ton excuse : ${target} %`);
        };
        if (!animated || reduceMotion) return settle();
        cred.dataset.level = '';
        const start = credValue;
        const startedAt = performance.now();
        const ease = (t) => 1 - (1 - t) ** 3;
        const tick = (now) => {
            const progress = Math.min((now - startedAt) / 760, 1);
            if (progress >= 1) return settle();
            drawCredibility(progress < 0.42
                ? start + (100 - start) * ease(progress / 0.42)
                : 100 + (target - 100) * ease((progress - 0.42) / 0.58));
            credFrame = requestAnimationFrame(tick);
        };
        credFrame = requestAnimationFrame(tick);
    }

    // « Autre » : la note dépend du texte, donc la même excuse garde la même note.
    function judgeCustomReason(animated) {
        const text = $('#no-reason-text').value.trim();
        if (!text) {
            resetCredibility();
            setLead('Vas-y, on t’écoute. Le comptoir est tout ouïe.', animated);
            return;
        }
        const seed = Array.from(text).reduce((sum, character) => (sum * 31 + character.codePointAt(0)) % 9973, 7);
        const score = 1 + (seed % 99);
        setLead(score < 34
            ? 'Personne n’y croit, mais bel effort.'
            : score < 70 ? 'Ça se tient, à peu près.' : 'Trop beau pour être faux.', animated);
        runCredibility(score, animated);
    }

    function reactToReason(animated = true) {
        const key = document.querySelector('input[name="no-reason"]:checked')?.value;
        const isCustom = syncCustomReason();
        const confirm = $('#no-confirm');
        const label = NO_VERDICTS[key]?.confirm ?? 'Oui, je rentre';
        if (confirm.textContent !== label) {
            confirm.textContent = label;
            if (animated) replayAnimation(confirm, 'is-swapped');
        }
        if (!key) {
            resetCredibility();
            setLead(NO_DEFAULT_LEAD, false);
        } else if (isCustom) {
            judgeCustomReason(animated);
        } else {
            setLead(NO_VERDICTS[key].line, animated);
            runCredibility(NO_VERDICTS[key].score, animated);
        }
    }

    // Pendant qu'on écrit, la jauge s'affole ; elle s'arrête quand on fait une pause.
    function onCustomReasonInput(event) {
        event.target.setCustomValidity('');
        stopCredibility();
        if (!event.target.value.trim() || reduceMotion) {
            judgeCustomReason(false);
            return;
        }
        $('#no-cred').dataset.level = '';
        drawCredibility(Math.random() * 100);
        setLead('Le comptoir délibère…', false);
        credTimer = setTimeout(() => judgeCustomReason(true), 550);
    }

    // Le panneau s'envole si tu viens, tombe si tu rentres.
    function leaveNoDialog(direction) {
        const dialog = $('#no-dialog');
        if (reduceMotion || !dialog.open) {
            dialog.close();
            return Promise.resolve();
        }
        noDialogLeaving = true;
        const end = direction === 'up' ? 'translateY(-110vh) rotate(-5deg)' : 'translateY(110vh) rotate(7deg)';
        const moves = [
            dialog.animate([{ transform: 'none' }, { transform: end }],
                { duration: 320, easing: 'cubic-bezier(0.5, -0.2, 0.85, 0.4)', fill: 'forwards' }),
            dialog.animate([{ opacity: 1 }, { opacity: 0 }],
                { duration: 320, pseudoElement: '::backdrop', fill: 'forwards' }),
        ];
        return Promise.allSettled(moves.map((move) => move.finished)).then(() => {
            dialog.close();
            moves.forEach((move) => move.cancel());
            noDialogLeaving = false;
        });
    }

    async function switchToYes() {
        if (noDialogLeaving) return;
        if ($('#no-dialog').open) await leaveNoDialog('up');
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
            freshIds.add(saved.user_id);
            $('#message').textContent = '';
            render();
            celebrate(response.vote, response.venue);
        } catch {
            $('#message').textContent = 'Impossible d’enregistrer ta réponse. Réessaie.';
        } finally {
            voteMutationPending = false;
            setVoteBusy(false);
            flushQueuedRefresh();
        }
    }

    async function confirmNo() {
        if (noDialogLeaving || !pendingNoName || !sharedVotesReady || !ensureCurrentWeek()) return;
        const name = pendingNoName;
        const reason = document.querySelector('input[name="no-reason"]:checked')?.value || null;
        const field = $('#no-reason-text');
        const reasonText = reason === 'autre' ? field.value.replace(/\s+/g, ' ').trim() : null;
        if (reason === 'autre' && !reasonText) {
            field.setCustomValidity('Écris ton excuse, ou choisis-en une autre.');
            replayAnimation(field, 'is-shaking');
            field.reportValidity();
            return;
        }
        await leaveNoDialog('down');
        saveResponse({ name, vote: 'no', venue: null, reason, reason_text: reasonText });
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!sharedVotesReady || voteMutationPending || !ensureCurrentWeek()) return;
        const missing = missingParts();
        if (missing.name || missing.venue) {
            pointToMissing(missing);
            return;
        }
        const name = $('#name').value.trim();
        if (!name) {
            $('#name').setCustomValidity('Indique ton prénom pour répondre.');
            $('#name').reportValidity();
            return;
        }
        const venue =
            selectedVote === 'no'
                ? null
                : document.querySelector('input[name="venue"]:checked')?.value ?? null;
        if (selectedVote === 'yes' && !Object.hasOwn(VENUES, venue)) {
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
        if (!sharedVotesReady || !voteStore || voteMutationPending || !ensureCurrentWeek()) return;
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
            flushQueuedRefresh();
        }
    }

    function bindEvents() {
        $('#vote').addEventListener('submit', handleSubmit);
        $('#no-confirm').addEventListener('click', confirmNo);
        $('#no-reasons').addEventListener('change', () => {
            reactToReason();
            if (!reduceMotion) navigator.vibrate?.(12); // Android seulement
            if (!$('#no-reason-custom').hidden) $('#no-reason-text').focus();
        });
        $('#no-dialog').addEventListener('touchstart', () => {}, { passive: true }); // active l'effet d'appui sur iPhone
        $('#no-reason-text').addEventListener('input', onCustomReasonInput);
        $('#no-reason-text').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') { event.preventDefault(); confirmNo(); }
        });
        $('#no-stay').addEventListener('click', switchToYes);
        $('#no-dialog').addEventListener('close', () => { pendingNoName = null; stopCredibility(); });
        $('#name').addEventListener('input', () => {
            $('#name').setCustomValidity('');
            updateSubmitState();
        });
        $('#refresh-votes').addEventListener('click', refreshCurrentWeek);
        $('#remove').addEventListener('click', removeResponse);
        $('#rally').addEventListener('click', hitShuttle);
        $('.poster').addEventListener('click', clinkBeers);
        $('#shifumi').addEventListener('click', playShifumi);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) refreshCurrentWeek();
        });
        setInterval(ensureCurrentWeek, 60_000);
        document.querySelectorAll('.choice').forEach((button) => {
            button.addEventListener('click', () => chooseVote(button.dataset.vote));
        });
        document.querySelectorAll('input[name="venue"]').forEach((input) => {
            input.addEventListener('click', toggleVenue);
        });
    }

    // 8. Compte à rebours jusqu'à la fin du créneau (heure de Paris)
    function countdownPart(value, unit, pad = true) {
        const part = document.createElement('span');
        part.className = 'countdown-part';
        const number = document.createElement('b');
        number.textContent = pad ? String(value).padStart(2, '0') : String(value);
        part.append(number, ' ' + unit); // espace fine insécable : « 04 h »
        return part;
    }

    function renderCountdown() {
        const now = parisNow();
        const start = new Date(paris);
        start.setHours(MEETUP_HOUR, 0, 0, 0);
        const left = Math.floor((start - now) / 1000);
        const isLive = left <= 0;
        const isToday = !isLive && dateKey(now) === week;
        const badge = $('.datebadge');
        badge.classList.toggle('is-today', isToday);
        badge.classList.toggle('is-live', isLive);
        $('#countdown-label').textContent = isLive
            ? 'C’est l’heure !'
            : isToday ? 'C’est ce soir !' : 'On se retrouve';
        const countdown = $('#countdown');
        if (isLive) {
            countdown.replaceChildren(emoji('beers'), ' Tout le monde au comptoir');
            return;
        }
        const days = Math.floor(left / 86_400);
        const parts = [];
        if (days) parts.push(countdownPart(days, 'j', false));
        parts.push(
            countdownPart(Math.floor((left % 86_400) / 3600), 'h'),
            countdownPart(Math.floor((left % 3600) / 60), 'min'),
            countdownPart(left % 60, 's'),
        );
        const prefix = document.createElement('span');
        prefix.className = 'countdown-prefix';
        prefix.textContent = 'dans';
        // Les espaces entre les morceaux servent aux lecteurs d'écran ; la mise en page vient du CSS.
        countdown.replaceChildren(prefix, ...parts.flatMap((part) => [' ', part]));
    }

    // 9. Easter egg : rallye de volant. Chaque clic sur le logo envoie un volant ;
    // en enchaînant les clics, on compte l'échange et on garde le record dans le navigateur.
    const RALLY_GAP_MS = 1500; // sans clic pendant ce délai, l'échange est terminé
    const RALLY_RECORD_KEY = 'le-dernier-set:rally-record';
    const RALLY_MILESTONES = {
        10: 'Joli rallye !',
        20: 'Ça tient la cadence !',
        30: 'Tu devrais peut-être aller jouer, non ?',
        50: 'Bon. Le bar, maintenant.',
        100: 'Légende du créneau. Respect.',
    };
    // Volant extrait de l'emoji 🏸 Fluent (assets/emoji/shuttle.svg), bouchon vers la droite :
    // il vole bouchon devant. SHUTTLE_SIZE en px.
    const SHUTTLE_SIZE = 40;
    let rallyHits = 0;
    let rallyTimer;

    function readRallyRecord() {
        try {
            return Number(localStorage.getItem(RALLY_RECORD_KEY)) || 0;
        } catch {
            return 0;
        }
    }

    function saveRallyRecord(hits) {
        try {
            localStorage.setItem(RALLY_RECORD_KEY, String(hits));
        } catch {
            // Navigation privée ou stockage bloqué : le record n'est simplement pas gardé.
        }
    }

    function launchShuttle() {
        if (reduceMotion || document.querySelectorAll('.shuttle').length >= 12) return;
        const origin = $('#rally').getBoundingClientRect();
        const start = { x: origin.left + origin.width / 2, y: origin.top + origin.height / 2 };
        const end = { x: innerWidth + 60, y: innerHeight * (0.35 + Math.random() * 0.55) };
        // Courbe de Bézier : le volant monte un peu puis plonge vers le bord droit.
        const control = {
            x: start.x + (end.x - start.x) * (0.35 + Math.random() * 0.2),
            y: Math.min(start.y, end.y) - 90 - Math.random() * 110,
        };
        const point = (t, axis) =>
            (1 - t) ** 2 * start[axis] + 2 * (1 - t) * t * control[axis] + t ** 2 * end[axis];
        const angle = (t) => {
            const dx = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x);
            const dy = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);
            return (Math.atan2(dy, dx) * 180) / Math.PI;
        };
        const keyframes = [];
        for (let step = 0; step <= 16; step++) {
            const t = 1 - (1 - step / 16) ** 1.5; // part vite puis ralentit, comme un vrai volant
            keyframes.push({
                transform: `translate(${point(t, 'x') - SHUTTLE_SIZE / 2}px, ${point(t, 'y') - SHUTTLE_SIZE / 2}px) rotate(${angle(t)}deg)`,
                offset: step / 16,
            });
        }
        const shuttle = document.createElement('img');
        shuttle.className = 'shuttle';
        shuttle.src = 'assets/emoji/shuttle.svg';
        shuttle.alt = '';
        shuttle.width = SHUTTLE_SIZE;
        shuttle.height = SHUTTLE_SIZE;
        document.body.append(shuttle);
        shuttle
            .animate(keyframes, { duration: 1000 + Math.random() * 350, easing: 'linear', fill: 'forwards' })
            .finished.then(() => shuttle.remove(), () => shuttle.remove());
    }

    function hitShuttle() {
        rallyHits++;
        launchShuttle();
        replayAnimation($('.brandiconbad'), 'is-swinging');
        const counter = $('#rally-count');
        counter.textContent = '×' + rallyHits;
        counter.classList.toggle('is-visible', rallyHits > 1);
        if (rallyHits > 1) replayAnimation(counter, 'is-bumped');
        if (RALLY_MILESTONES[rallyHits]) showLiveNote(RALLY_MILESTONES[rallyHits], 'badminton', 'rally');
        clearTimeout(rallyTimer);
        rallyTimer = setTimeout(endRally, RALLY_GAP_MS);
    }

    function endRally() {
        const hits = rallyHits;
        rallyHits = 0;
        $('#rally-count').classList.remove('is-visible');
        if (hits < 3) return; // un ou deux clics : pas de bilan
        const record = readRallyRecord();
        let verdict = 'Record : ' + record + '.';
        if (hits > record) {
            saveRallyRecord(hits);
            verdict = record ? 'Nouveau record !' : 'Premier record posé.';
        } else if (hits === record) {
            verdict = 'Record égalé !';
        }
        showLiveNote('Échange de ' + hits + ' coups. ' + verdict, 'badminton', 'rally');
    }

    // 10. Easter egg : tournée générale. Cliquer vite sur l'affiche (toute la zone jaune)
    // les fait trinquer ; à 5 clics, tournée générale et pluie de chopes.
    const ROUND_GAP_MS = 1500; // sans clic pendant ce délai, on repart de zéro
    // Des récompenses de plus en plus absurdes pour qui insiste (courtes : 2 lignes max sur téléphone).
    const ROUND_LINES = {
        5: '« Tournée générale ! »',
        10: '« C’est la maison qui offre ! »',
        15: '« Tu gagnes… un sous-bock. »',
        20: '« Le barman t’adopte. »',
        25: '« Ta photo au mur du bar ! »',
        30: '« Bière gratuite à vie ! (non) »',
        40: '« Les chopes ont la gueule de bois. »',
        50: '« Pilier de comptoir officiel. »',
    };
    const ROUND_RAINS = new Set([5, 10, 30]); // paliers avec pluie de chopes
    let roundClicks = 0;
    let roundTimer;

    function clinkBeers() {
        roundClicks++;
        replayAnimation($('.beers'), 'is-cheering');
        const line = ROUND_LINES[roundClicks];
        if (line) {
            shoutInBubble(line);
            if (ROUND_RAINS.has(roundClicks)) rainBeers();
            if (roundClicks === LEGEND_AT) showLegend();
        }
        clearTimeout(roundTimer);
        roundTimer = setTimeout(() => (roundClicks = 0), ROUND_GAP_MS);
    }

    // Palier ultime : scène « Pilier de comptoir » et couronne permanente sur l'affiche.
    const LEGEND_AT = 50;
    const LEGEND_KEY = 'le-dernier-set:legend';

    function isLegend() {
        try {
            return localStorage.getItem(LEGEND_KEY) === '1';
        } catch {
            return false;
        }
    }

    function crownPoster(isNew = false) {
        $('.poster-wrap').classList.add('is-legend');
        if (!isNew || reduceMotion) return;
        $('.poster-wrap').classList.add('is-crowning'); // petite couronne cachée jusqu'à l'impact
        dropCrown();
    }

    // Grosse couronne qui tombe du haut de l'écran et s'écrase lourdement sur le coin de l'affiche.
    function dropCrown() {
        const crown = $('.poster-crown');
        const fall = crown.getBoundingClientRect().bottom + 60; // part d'au-dessus de l'écran
        const duration = 1150;
        const impactAt = 0.6;
        // translate (et non transform) : appliqué avant la rotation, la chute reste verticale à l'écran.
        crown.animate(
            [
                { translate: `0 ${-fall}px`, scale: '1', easing: 'cubic-bezier(.55, 0, 1, .45)' }, // gravité
                { translate: '0 0', scale: '1.2 .75', offset: impactAt, easing: 'ease-out' }, // écrasée
                { translate: '0 -18px', scale: '.94 1.08', offset: 0.75, easing: 'ease-in' }, // rebond
                { translate: '0 0', scale: '1.06 .94', offset: 0.88, easing: 'ease-out' },
                { translate: '0 0', scale: '1' },
            ],
            { duration, fill: 'backwards' },
        );
        setTimeout(crownImpact, duration * impactAt);
    }

    function crownImpact() {
        $('.poster-wrap').classList.remove('is-crowning');
        replayAnimation($('.poster'), 'is-thud');
        try {
            navigator.vibrate?.(80); // Android ; ignoré ailleurs
        } catch {
            // Vibration non disponible.
        }
        replayAnimation($('.legend-crown'), 'is-new'); // la petite couronne apparaît sur la chope
    }

    function showLegend() {
        try {
            localStorage.setItem(LEGEND_KEY, '1');
        } catch {
            // Stockage bloqué : la couronne ne restera que jusqu'au rechargement.
        }
        const overlay = document.createElement('div');
        overlay.className = 'legend';
        overlay.setAttribute('role', 'status');
        overlay.innerHTML =
            '<div class="legend-rays" aria-hidden="true"></div>' +
            '<div class="legend-content">' +
            '<img class="legend-trophy" src="assets/emoji/trophy.svg" alt="" />' +
            '<p class="legend-title">Pilier de comptoir</p>' +
            '<p class="legend-sub">50 tournées. Le comptoir porte ton nom.</p>' +
            '<p class="legend-hint">Une couronne t’attend sur l’affiche.</p>' +
            '<button class="legend-close" type="button">Retour au comptoir</button>' +
            '</div>';
        document.body.append(overlay);
        fountainBeers(overlay);
        let closed = false;
        const close = () => {
            if (closed) return;
            closed = true;
            document.removeEventListener('keydown', onKey);
            overlay.classList.add('is-leaving');
            setTimeout(() => {
                overlay.remove();
                crownPoster(true);
            }, 400);
        };
        // On tape vite pour arriver ici : seul le bouton (qui n'apparaît qu'après 2,5 s) ou Échap
        // ferment la scène, pour ne pas la fermer par accident avec les derniers taps.
        const closeButton = overlay.querySelector('.legend-close');
        closeButton.addEventListener('click', close);
        const onKey = (event) => {
            if (event.key === 'Escape') close();
        };
        document.addEventListener('keydown', onKey);
        setTimeout(() => {
            closeButton.classList.add('is-ready');
            closeButton.focus({ preventScroll: true });
        }, 2500);
        setTimeout(close, 6500);
    }

    // Fontaine : les chopes jaillissent du bas de l'écran, montent puis retombent.
    function fountainBeers(layer) {
        if (reduceMotion) return;
        const total = innerWidth < 600 ? 26 : 44;
        for (let i = 0; i < total; i++) {
            const size = 34 + Math.random() * 30;
            const mug = emoji(i % 3 === 0 ? 'beers' : 'beer');
            mug.className = 'legend-mug';
            mug.style.width = mug.style.height = size + 'px';
            layer.append(mug);
            const startX = innerWidth * (0.2 + Math.random() * 0.6);
            const endX = startX + (Math.random() - 0.5) * innerWidth * 0.7;
            const peakY = innerHeight * (0.05 + Math.random() * 0.4);
            const spin = (Math.random() - 0.5) * 540;
            mug.animate(
                [
                    { transform: `translate(${startX}px, ${innerHeight + 20}px) rotate(0deg)`, easing: 'cubic-bezier(.2,.7,.4,1)' },
                    { transform: `translate(${(startX + endX) / 2}px, ${peakY}px) rotate(${spin / 2}deg)`, offset: 0.45, easing: 'cubic-bezier(.6,0,.8,.5)' },
                    { transform: `translate(${endX}px, ${innerHeight + 80}px) rotate(${spin}deg)` },
                ],
                { duration: 2300 + Math.random() * 900, delay: 300 + Math.random() * 2600, fill: 'both' },
            );
        }
    }

    function rainBeers() {
        if (reduceMotion) return;
        document.querySelector('.beer-rain')?.remove();
        const layer = document.createElement('div');
        layer.className = 'beer-rain';
        layer.setAttribute('aria-hidden', 'true');
        document.body.append(layer);
        const total = innerWidth < 600 ? 16 : 30;
        for (let i = 0; i < total; i++) {
            const size = 30 + Math.random() * 22;
            const mug = emoji(i % 3 === 0 ? 'beers' : 'beer');
            mug.className = 'beer-drop';
            mug.style.width = mug.style.height = size + 'px';
            mug.style.left = Math.random() * (innerWidth - size) + 'px';
            layer.append(mug);
            const sway = (Math.random() - 0.5) * 120;
            const spin = (Math.random() - 0.5) * 70;
            mug.animate(
                [
                    { transform: `translate(0, -${size + 20}px) rotate(${-spin / 2}deg)` },
                    { transform: `translate(${sway}px, ${innerHeight + 40}px) rotate(${spin}deg)` },
                ],
                {
                    duration: 1600 + Math.random() * 1200,
                    delay: Math.random() * 900,
                    easing: 'cubic-bezier(.45, .05, .7, .4)', // accélère en tombant
                    fill: 'both',
                },
            );
        }
        setTimeout(() => layer.remove(), 3800);
    }

    // 11. Easter egg : shifumi pour départager une égalité au match des bars (pour rire).
    // SHIFUMI_MIN_SCORE : score minimum de chaque bar pour proposer le shifumi.
    // 0 = proposé aussi à 0-0, juste pour s'amuser ; 1 le réserverait aux vraies égalités (1-1, 2-2…).
    const SHIFUMI_MIN_SCORE = 0;
    const SHIFUMI_MOVES = {
        fist: { name: 'Pierre', beats: 'victory' },
        hand: { name: 'Feuille', beats: 'fist' },
        victory: { name: 'Ciseaux', beats: 'hand' },
    };
    const SHIFUMI_BEAT_MS = 450;

    function randomMove() {
        const moves = Object.keys(SHIFUMI_MOVES);
        return moves[Math.floor(Math.random() * moves.length)];
    }

    function playShifumi() {
        if (shifumiPlaying) return;
        shifumiPlaying = true;
        shifumiWinner = null;
        $('#shifumi').classList.add('hidden');
        $('#shifumi-arena').classList.remove('hidden');
        document.querySelectorAll('.match-team').forEach((team) => team.classList.remove('is-leading'));
        playShifumiRound(1);
    }

    function playShifumiRound(round) {
        const hands = [$('#shifumi-pavane'), $('#shifumi-bryans')];
        const call = $('#shifumi-call');
        const beat = reduceMotion ? 200 : SHIFUMI_BEAT_MS;
        hands.forEach((hand) => {
            hand.classList.remove('is-winner', 'is-loser');
            replayAnimation(hand, 'is-shaking');
        });
        // À chaque secousse, les deux mains montrent le coup annoncé : ✊ puis ✋ puis ✌️.
        Object.entries(SHIFUMI_MOVES).forEach(([move, { name }], index) =>
            setTimeout(() => {
                call.textContent = name + '…';
                hands.forEach((hand) => (hand.src = 'assets/emoji/' + move + '.svg'));
            }, index * beat),
        );
        $('#venue-result').textContent = round > 1 ? 'Égalité au shifumi, on rejoue !' : 'Shi… fu… mi…';
        setTimeout(() => {
            const pavane = randomMove();
            const bryans = randomMove();
            hands[0].src = 'assets/emoji/' + pavane + '.svg';
            hands[1].src = 'assets/emoji/' + bryans + '.svg';
            call.textContent = SHIFUMI_MOVES[pavane].name + ' contre ' + SHIFUMI_MOVES[bryans].name.toLowerCase();
            if (pavane === bryans) {
                // Même coup : on rejoue (5 manches maximum, puis tirage au sort).
                if (round < 5) {
                    setTimeout(() => playShifumiRound(round + 1), 1100);
                    return;
                }
                finishShifumi(Math.random() < 0.5 ? 'pavane' : 'bryans');
                return;
            }
            const winner = SHIFUMI_MOVES[pavane].beats === bryans ? 'pavane' : 'bryans';
            hands[winner === 'pavane' ? 0 : 1].classList.add('is-winner');
            hands[winner === 'pavane' ? 1 : 0].classList.add('is-loser');
            finishShifumi(winner);
        }, beat * 3);
    }

    function finishShifumi(winner) {
        shifumiWinner = winner;
        shifumiPlaying = false;
        render(); // affiche le verdict et remet le bouton pour une revanche
        replayAnimation($('#' + winner + '-team'), 'is-shifumi-winner');
        setTimeout(() => {
            if (!shifumiPlaying) $('#shifumi-arena').classList.add('hidden');
        }, 4000);
    }

    // 12. Démarrage et restauration du formulaire
    function init() {
        renderReasons();
        $('#date').textContent = paris.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
        $('#location-icon').append(emoji('pin'));
        chooseVote(selectedVote);
        syncVenuePicker();
        render();
        renderCountdown();
        setInterval(renderCountdown, 1000);
        if (isLegend()) crownPoster();

        bindEvents();
        setVoteBusy(true);
        void refreshSharedVotes(true);
    }
    init();
})();
