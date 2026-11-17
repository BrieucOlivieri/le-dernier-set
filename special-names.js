// Easter egg : animations dédiées à certains prénoms quand la personne vote.
// Ajouter un prénom : une entrée dans PEOPLE (clé en minuscules, sans accent).
(() => {
    'use strict';

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rand = (min, max) => min + Math.random() * (max - min);

    // « Naya B. », « NAYA », « Nayà » → « naya »
    function firstNameKey(name) {
        return String(name || '')
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .trim()
            .toLowerCase()
            .split(/[\s.,-]+/)[0];
    }

    function emoji(name, className) {
        const image = document.createElement('img');
        image.src = 'assets/emoji/' + name + '.svg';
        image.alt = '';
        if (className) image.className = className;
        return image;
    }

    // Naya, Réunionnaise : le Piton de la Fournaise et les rayons du drapeau « Lo Mahavéli ».
    const NAYA_TEXTS = {
        yes: { title: 'Ayo, Naya lé la !', detail: 'Le Piton de la Fournaise entre en éruption.' },
        maybe: { title: 'Naya i réfléchit…', detail: 'Le volcan gronde, on attend le verdict.' },
        no: { title: 'Naya i rentre…', detail: 'Lé dommage ! Le volcan s’endort.' },
    };
    const ERUPTION = ['hibiscus', 'pineapple', 'palm', 'beer', 'hibiscus', 'beers'];

    function celebrateNaya(vote) {
        document.querySelector('.naya')?.remove();
        const text = NAYA_TEXTS[vote] || NAYA_TEXTS.yes;
        const layer = document.createElement('div');
        layer.className = 'naya naya-' + vote;
        layer.setAttribute('role', 'status');
        const sky = document.createElement('div');
        sky.className = 'naya-sky';
        const rays = document.createElement('div');
        rays.className = 'naya-rays';
        for (let i = 0; i < 5; i++) {
            const ray = document.createElement('span');
            ray.style.setProperty('--angle', (i - 2) * 24 + 'deg');
            ray.style.animationDelay = 0.35 + i * 0.06 + 's';
            rays.append(ray);
        }
        const mount = document.createElement('div');
        mount.className = 'naya-mount';
        const volcano = emoji('volcano', 'naya-volcano');
        mount.append(volcano);
        const banner = document.createElement('div');
        banner.className = 'naya-banner';
        const title = document.createElement('strong');
        title.append(emoji('flag-reunion', 'naya-banner-flag'), text.title); // 🇷🇪 devant le titre
        const detail = document.createElement('span');
        detail.textContent = text.detail;
        banner.append(title, detail);
        sky.setAttribute('aria-hidden', 'true');
        rays.setAttribute('aria-hidden', 'true');
        layer.append(sky, rays, mount, banner);
        document.body.append(layer);

        if (!reduceMotion) {
            if (vote === 'yes') {
                setTimeout(() => erupt(layer, volcano), 700);
                setTimeout(() => rumble(9), 700);
            } else if (vote === 'maybe') {
                setTimeout(() => rumble(4), 700);
                setTimeout(() => rumble(4), 1500);
            }
        }
        setTimeout(() => {
            layer.classList.add('is-leaving');
            setTimeout(() => layer.remove(), 600);
        }, vote === 'yes' ? 5200 : 3800);
    }

    // La page tremble sous l'éruption.
    function rumble(strength) {
        const page = document.querySelector('main');
        page?.animate(
            [
                { translate: '0 0' },
                { translate: `${-strength}px ${strength / 2}px` },
                { translate: `${strength}px ${-strength / 2}px` },
                { translate: `${-strength / 2}px ${strength / 3}px` },
                { translate: '0 0' },
            ],
            { duration: 450, easing: 'ease-out' },
        );
    }

    // Le volcan crache de la lave, des hibiscus, des ananas, des palmiers et des chopes.
    function erupt(layer, volcano) {
        const box = volcano.getBoundingClientRect();
        const craterX = box.left + box.width * 0.5;
        const craterY = box.top + box.height * 0.22;
        const lava = innerWidth < 600 ? 22 : 34;
        const treats = innerWidth < 600 ? 12 : 18;
        for (let i = 0; i < lava + treats; i++) {
            const isTreat = i >= lava;
            const size = isTreat ? rand(30, 50) : rand(8, 16);
            const piece = isTreat ? emoji(ERUPTION[i % ERUPTION.length], 'naya-treat') : document.createElement('span');
            if (!isTreat) {
                piece.className = 'naya-lava';
                piece.style.background = ['#ff6b2c', '#ffb02e', '#e8402a', '#ffd25a'][i % 4];
            }
            piece.style.width = piece.style.height = size + 'px';
            layer.append(piece);
            const startX = craterX - size / 2;
            const startY = craterY - size / 2;
            const endX = startX + rand(-0.55, 0.55) * innerWidth;
            const peakY = innerHeight * rand(isTreat ? 0.06 : 0.12, isTreat ? 0.4 : 0.5);
            const spin = rand(-360, 360);
            piece.animate(
                [
                    { transform: `translate(${startX}px, ${startY}px) rotate(0deg) scale(.4)`, easing: 'cubic-bezier(.2,.7,.4,1)' },
                    { transform: `translate(${(startX + endX) / 2}px, ${peakY}px) rotate(${spin / 2}deg) scale(1)`, offset: 0.45, easing: 'cubic-bezier(.6,0,.8,.5)' },
                    { transform: `translate(${endX}px, ${innerHeight + 60}px) rotate(${spin}deg) scale(1)` },
                ],
                { duration: rand(1900, 2800), delay: rand(0, 1500), fill: 'both' },
            ).finished.then(() => piece.remove(), () => piece.remove());
        }
    }

    // Maxime, tout juste vétéran au bad (catégorie +35) et qui en parle sans arrêt :
    // photo sépia d'époque, chargement poussif, médaille et pluie… au ralenti.
    const MAXIME_TEXTS = {
        yes: {
            title: 'Le vétéran est de sortie !',
            details: [
                'Catégorie +35 : on est au courant, Maxime.',
                'Échauffement prévu : 45 minutes minimum.',
                'Il va te raconter sa licence vétéran au bar.',
            ],
            steps: ['Démarrage du vétéran…', 'Dérouillage des genoux…', 'Pose de la genouillère…', 'Prêt (à en parler) !'],
            progress: 100,
        },
        maybe: {
            title: 'Maxime consulte ses genoux…',
            details: ['Réponse attendue sous 3 à 5 jours ouvrés.'],
            steps: ['Démarrage du vétéran…', 'Analyse des articulations…', 'Analyse des articulations… en attente'],
            progress: 47,
        },
        no: {
            title: '« Je suis vétéran, moi. »',
            details: ['Excuse homologuée par la Fédération des vétérans.'],
            steps: ['Vérification de l’excuse…', 'Excuse vétéran détectée.'],
            progress: 100,
            stamp: 'EXCUSE VALIDÉE',
        },
    };
    const VETERAN_RAIN = ['glasses', 'pill', 'hourglass', 'beer', 'glasses', 'pill'];

    function celebrateMaxime(vote) {
        document.querySelector('.vet')?.remove();
        const text = MAXIME_TEXTS[vote] || MAXIME_TEXTS.yes;
        const layer = document.createElement('div');
        layer.className = 'vet vet-' + vote;
        layer.setAttribute('role', 'status');
        const sepia = document.createElement('div');
        sepia.className = 'vet-sepia'; // vieille photo : sépia + grain
        sepia.setAttribute('aria-hidden', 'true');

        // Chargement rétro, aussi lent qu'un vétéran au réveil.
        const loader = document.createElement('div');
        loader.className = 'vet-loader';
        const step = document.createElement('span');
        step.className = 'vet-step';
        step.textContent = text.steps[0];
        const bar = document.createElement('span');
        bar.className = 'vet-bar';
        const fill = document.createElement('i');
        bar.append(fill);
        const percent = document.createElement('b');
        percent.textContent = '0 %';
        loader.append(step, bar, percent);
        layer.append(sepia, loader);
        document.body.append(layer);

        const loading = reduceMotion ? 0 : 2200;
        text.steps.forEach((label, index) =>
            setTimeout(() => (step.textContent = label), (loading / text.steps.length) * index),
        );
        fill.animate([{ width: '0%' }, { width: text.progress + '%' }], {
            duration: loading,
            easing: vote === 'maybe' ? 'cubic-bezier(.2,.9,.3,1)' : 'steps(9, end)', // poussif, par à-coups
            fill: 'forwards',
        });
        const start = performance.now();
        const tick = setInterval(() => {
            const t = Math.min(1, (performance.now() - start) / Math.max(loading, 1));
            percent.textContent = Math.round(text.progress * (vote === 'maybe' ? 1 - (1 - t) ** 3 : t)) + ' %';
            if (t >= 1) clearInterval(tick);
        }, 80);

        // Puis la bannière ; s'il vient, la carte de chargement laisse sa place à la médaille.
        setTimeout(() => {
            if (vote === 'yes') {
                loader.classList.add('is-done');
                const medal = document.createElement('div');
                medal.className = 'vet-medal';
                medal.setAttribute('aria-hidden', 'true');
                medal.append(emoji('medal'));
                layer.append(medal);
            }
            const banner = document.createElement('div');
            banner.className = 'vet-banner';
            const title = document.createElement('strong');
            title.textContent = text.title;
            const detail = document.createElement('span');
            detail.textContent = text.details[Math.floor(Math.random() * text.details.length)];
            banner.append(title, detail);
            if (text.stamp) {
                const stamp = document.createElement('em');
                stamp.className = 'vet-stamp';
                stamp.textContent = text.stamp;
                banner.append(stamp);
            }
            layer.append(banner);
            if (vote === 'yes' && !reduceMotion) slowRain(layer);
        }, loading + 150);

        setTimeout(() => {
            clearInterval(tick);
            layer.classList.add('is-leaving');
            setTimeout(() => layer.remove(), 700);
        }, loading + (vote === 'yes' ? 5200 : 3800));
    }

    // Pluie de lunettes, pilules et sabliers… au ralenti, évidemment.
    function slowRain(layer) {
        const total = innerWidth < 600 ? 12 : 20;
        for (let i = 0; i < total; i++) {
            const size = rand(30, 48);
            const item = emoji(VETERAN_RAIN[i % VETERAN_RAIN.length], 'vet-drop');
            item.style.width = item.style.height = size + 'px';
            item.style.left = rand(0, innerWidth - size) + 'px';
            layer.append(item);
            const sway = rand(-40, 40);
            item.animate(
                [
                    { transform: `translate(0, -${size + 20}px) rotate(${rand(-20, 20)}deg)` },
                    { transform: `translate(${sway}px, ${innerHeight * 0.5}px) rotate(${rand(-30, 30)}deg)`, offset: 0.5 },
                    { transform: `translate(${-sway / 2}px, ${innerHeight + 50}px) rotate(${rand(-40, 40)}deg)` },
                ],
                { duration: rand(5200, 6800), delay: rand(0, 1800), easing: 'linear', fill: 'both' },
            ).finished.then(() => item.remove(), () => item.remove());
        }
    }

    // Brieuc, qui a créé le site : « Le Dernier Set » finit comme un film, avec son générique.
    const BRIEUC_CREDITS = [
        ['Réalisation', 'Brieuc'],
        ['Scénario', 'Brieuc'],
        ['Code', 'Brieuc'],
        ['Assistant de réalisation', 'Claude'],
        ['Direction artistique des emojis', 'Microsoft Fluent'],
        ['Bruitages', 'Freesound (CC0)'],
        ['Effets spéciaux volcaniques', 'Naya'],
        ['Conseiller technique vétéran', 'Maxime'],
        ['Décors', 'La Pavane & Le Bryan’s'],
        ['Cascades', 'Le volant'],
        ['Avec la participation du', 'Canapé'],
        ['', 'Aucun canapé n’a été maltraité pendant le tournage.'],
    ];
    const BRIEUC_ENDINGS = {
        yes: 'Le réalisateur sera au bar.',
        maybe: 'Fin alternative en cours d’écriture…',
        no: 'Le réalisateur rentre. Le film continue sans lui.',
    };

    function celebrateBrieuc(vote) {
        document.querySelector('.cine')?.remove();
        const layer = document.createElement('div');
        layer.className = 'cine';
        layer.setAttribute('role', 'dialog');
        layer.setAttribute('aria-label', 'Générique de fin');
        const day = document.querySelector('#date')?.textContent || 'jeudi';

        const clap = document.createElement('div');
        clap.className = 'cine-clap';
        clap.append(emoji('clapper'));
        const clapText = document.createElement('span');
        clapText.textContent = 'Clap de fin !';
        clap.append(clapText);

        const title = document.createElement('div');
        title.className = 'cine-title';
        title.innerHTML = '<strong>Le Dernier Set</strong><span>un film de Brieuc</span>';

        const roll = document.createElement('div');
        roll.className = 'cine-roll';
        for (const [role, name] of BRIEUC_CREDITS) {
            const line = document.createElement('p');
            if (role) {
                const r = document.createElement('small');
                r.textContent = role;
                line.append(r);
            }
            const n = document.createElement('span');
            n.textContent = name;
            if (!role) n.className = 'cine-disclaimer';
            line.append(n);
            roll.append(line);
        }

        const ending = document.createElement('div');
        ending.className = 'cine-ending';
        const fin = document.createElement('strong');
        fin.textContent = 'Fin';
        const message = document.createElement('span');
        message.textContent = BRIEUC_ENDINGS[vote] || BRIEUC_ENDINGS.yes;
        const next = document.createElement('small');
        next.textContent = 'Prochain épisode : ' + day + '.';
        ending.append(fin, message, next);
        if (vote === 'yes') ending.prepend(emoji('popcorn', 'cine-popcorn'));

        const skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'cine-skip';
        skip.textContent = 'Passer le générique ›';

        const bars = '<span class="cine-bar cine-bar-top"></span><span class="cine-bar cine-bar-bottom"></span>';
        layer.innerHTML = '<div class="cine-screen" aria-hidden="true"></div>' + bars;
        layer.append(clap, title, roll, ending, skip);
        document.body.append(layer);

        let closed = false;
        const timers = [];
        const close = () => {
            if (closed) return;
            closed = true;
            timers.forEach(clearTimeout);
            document.removeEventListener('keydown', onKey);
            layer.classList.add('is-leaving');
            setTimeout(() => layer.remove(), 700);
        };
        const onKey = (event) => {
            if (event.key === 'Escape') close();
        };
        skip.addEventListener('click', close);
        document.addEventListener('keydown', onKey);

        // Déroulé : clap (0 s), titre (1,2 s), générique qui défile (3,4 s), « Fin » (12 s), fermeture (16,5 s).
        const at = (ms, fn) => timers.push(setTimeout(fn, reduceMotion ? Math.min(ms, 300) : ms));
        const rollDuration = 8500;
        at(1200, () => layer.classList.add('show-title'));
        at(3400, () => {
            layer.classList.add('show-roll');
            if (!reduceMotion) {
                roll.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(calc(-100% - 100vh))' }], {
                    duration: rollDuration,
                    easing: 'linear',
                    fill: 'forwards',
                });
            }
        });
        at(3400 + rollDuration + 100, () => layer.classList.add('show-ending')); // une fois le générique sorti
        at(3400 + rollDuration + 4600, close);
    }

    const PEOPLE = {
        naya: {
            celebrate: celebrateNaya,
            icon: 'flag-reunion', // icône de l'annonce en direct
            badge: 'flag-reunion', // petit drapeau à côté du prénom sur la feuille
            live: { yes: 'Naya lé la !', maybe: 'Naya i réfléchit…', no: 'Naya i rentre… lé dommage !' },
        },
        brieuc: {
            celebrate: celebrateBrieuc,
            icon: 'clapper',
            badge: 'clapper',
            live: {
                yes: 'Le réalisateur a voté : il vient !',
                maybe: 'Le réalisateur hésite sur la fin du film.',
                no: 'Le réalisateur rentre. Le film continue.',
            },
        },
        maxime: {
            celebrate: celebrateMaxime,
            icon: 'medal',
            badge: 'medal',
            live: {
                yes: 'Le vétéran Maxime arrive (doucement).',
                maybe: 'Maxime demande l’avis de ses genoux.',
                no: 'Maxime invoque son statut de vétéran.',
            },
        },
    };

    window.leDernierSetSpecial = {
        find: (name) => PEOPLE[firstNameKey(name)] || null,
    };
})();
