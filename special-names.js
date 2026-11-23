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
                setTimeout(() => { if (layer.isConnected) rumble(9); }, 700);
            } else if (vote === 'maybe') {
                setTimeout(() => { if (layer.isConnected) rumble(4); }, 700);
                setTimeout(() => { if (layer.isConnected) rumble(4); }, 1500);
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

    // Brieuc, qui a créé le site, ingénieur dans le ferroviaire et éternel instigateur de l'apéro.
    // L'écran devient l'intérieur d'un wagon : le paysage défile par la fenêtre, la page tremble au rythme
    // des rails. Je viens : le train arrive… directement dans la pinte. Peut-être : arrêt en pleine voie,
    // une vache le fixe. Je rentre : tunnel, tout devient noir, direction son lit.
    // Le texte final prend la forme d'un billet de train composté (ou annulé).
    // Animations légères (transform et opacity seulement) pour rester fluide sur téléphone.
    const RIDE_TEXTS = {
        yes: {
            display: 'Prochain arrêt : LE BAR',
            says: 'Bon… on se boit un verre en arrivant ?',
            to: 'Le bar',
            stamp: 'Composté',
            title: 'Terminus : le bar !',
            details: [
                'Brieuc a encore convaincu tout le monde.',
                'Ingénieur ferroviaire : il a optimisé le trajet jusqu’au comptoir.',
                'Correspondance assurée avec l’apéro.',
            ],
        },
        maybe: {
            display: 'Arrêt en pleine voie. Merci de votre patience.',
            says: 'On s’arrête boire un verre… ou pas ?',
            to: '???',
            stamp: 'En attente',
            title: 'Arrêt en pleine voie…',
            details: ['Brieuc réfléchit. La vache aussi.'],
        },
        no: {
            display: 'Prochain arrêt : TON LIT',
            says: 'Pas d’apéro ce soir…',
            to: 'Ton lit',
            stamp: 'Annulé',
            title: 'Direction : ton lit.',
            details: ['Pour une fois, ce n’est pas Brieuc qui propose un verre.', 'Le bar n’est pas desservi ce soir.'],
        },
    };

    // Le billet de train qui sert de texte final.
    function rideTicket(vote, text) {
        const ticket = document.createElement('div');
        ticket.className = 'ride-ticket ride-ticket-' + vote;
        const main = document.createElement('div');
        main.className = 'ride-ticket-main';
        const head = document.createElement('p');
        head.className = 'ride-ticket-head';
        head.innerHTML = '<b>Billet</b><span>Bar Express · 20:00</span>';
        const route = document.createElement('p');
        route.className = 'ride-ticket-route';
        const from = document.createElement('span');
        from.textContent = 'Badminton';
        const to = document.createElement('span');
        to.textContent = text.to;
        route.append(from, emoji('train'), to);
        const title = document.createElement('strong');
        title.textContent = text.title;
        const detail = document.createElement('span');
        detail.className = 'ride-ticket-detail';
        detail.textContent = text.details[Math.floor(Math.random() * text.details.length)];
        main.append(head, route, title, detail);
        const stub = document.createElement('div');
        stub.className = 'ride-ticket-stub';
        stub.innerHTML = '<small>Voit.</small><b>3</b><small>Place</small><b>42</b>';
        const stamp = document.createElement('span');
        stamp.className = 'ride-ticket-stamp';
        stamp.textContent = text.stamp;
        ticket.append(main, stub, stamp);
        return ticket;
    }

    function celebrateBrieuc(vote) {
        document.querySelector('.ride')?.remove();
        const text = RIDE_TEXTS[vote] || RIDE_TEXTS.yes;
        const layer = document.createElement('div');
        layer.className = 'ride ride-' + vote;
        layer.setAttribute('role', 'status');
        layer.innerHTML = `
            <div class="ride-cabin" aria-hidden="true">
                <p class="ride-display"><span></span></p>
                <div class="ride-window">
                    <span class="ride-far"></span>
                    <span class="ride-near"></span>
                    <span class="ride-poles"></span>
                </div>
                <span class="ride-seat ride-seat-left"></span>
                <span class="ride-seat ride-seat-right"></span>
            </div>`;
        const cabin = layer.querySelector('.ride-cabin');
        const view = layer.querySelector('.ride-window');
        const display = layer.querySelector('.ride-display span');
        const showDisplay = (words) => { display.textContent = words + '   ·   ' + words; };
        showDisplay(text.display);

        // Brieuc dépasse de son siège, et propose (évidemment) un verre.
        const brieuc = document.createElement('span');
        brieuc.className = 'ride-brieuc';
        const face = emoji('grin');
        brieuc.append(face);
        cabin.append(brieuc);
        document.body.append(layer);
        const at = (ms, fn) => setTimeout(fn, reduceMotion ? 0 : ms);
        const say = (words, ms = 2200) => {
            const bubble = document.createElement('span');
            bubble.className = 'ride-say';
            bubble.textContent = words;
            cabin.append(bubble);
            setTimeout(() => bubble.remove(), reduceMotion ? 3000 : ms);
        };

        // Le paysage défile : trois plans à des vitesses différentes (parallaxe), plus le tremblement.
        const scroll = (selector, duration) => (reduceMotion ? null : layer.querySelector(selector).animate(
            [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration, iterations: Infinity },
        ));
        const layers = [scroll('.ride-far', 9000), scroll('.ride-near', 1800), scroll('.ride-poles', 700)].filter(Boolean);
        const shake = reduceMotion ? null : cabin.animate(
            [{ translate: '0 0' }, { translate: '0 2px' }, { translate: '0 0' }, { translate: '0 1px' }, { translate: '0 0' }],
            { duration: 520, iterations: Infinity },
        );
        // Ralentir jusqu'à l'arrêt (les vitesses de défilement baissent progressivement).
        const brake = (duration) => {
            if (reduceMotion) return;
            const start = performance.now();
            const step = (now) => {
                const rate = Math.max(0, 1 - (now - start) / duration);
                layers.forEach((animation) => animation.updatePlaybackRate(rate));
                if (rate > 0 && layer.isConnected) requestAnimationFrame(step);
                else shake?.cancel();
            };
            requestAnimationFrame(step);
        };
        const slideIn = (el, from, duration, delay) => {
            if (reduceMotion) { el.style.transform = 'none'; return; }
            el.animate([{ transform: from }, { transform: 'none' }],
                { duration, delay, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'both' });
        };

        at(900, () => say(text.says));
        let bannerAt;
        if (vote === 'yes') {
            // Terminus… directement dans la pinte : la bière monte dans la fenêtre, mousse, bulles, « SANTÉ ! ».
            const beer = document.createElement('span');
            beer.className = 'ride-beer';
            beer.innerHTML = '<span class="ride-foam"></span>';
            for (let i = 0; i < 14; i++) {
                const bubble = document.createElement('i');
                bubble.style.left = Math.random() * 96 + '%';
                bubble.style.width = bubble.style.height = 4 + Math.random() * 8 + 'px';
                beer.append(bubble);
                if (!reduceMotion) {
                    bubble.animate([{ transform: 'translateY(0)', opacity: 0 }, { opacity: 0.9, offset: 0.2 },
                        { transform: 'translateY(-260px)', opacity: 0 }],
                    { duration: 1400 + Math.random() * 1200, delay: Math.random() * 1500, iterations: Infinity });
                }
            }
            view.append(beer);
            at(2000, () => brake(1400));
            slideIn(beer, 'translateY(100%)', 1500, 2100);
            if (!reduceMotion) {
                beer.querySelector('.ride-foam').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
                    { duration: 2600, iterations: Infinity });
            }
            at(3000, () => showDisplay('Terminus : LE BAR. Tout le monde descend !'));
            at(3400, () => {
                face.src = 'assets/emoji/party-face.svg';
                const cheers = document.createElement('div');
                cheers.className = 'ride-cheers';
                cheers.innerHTML = '<img class="emoji ride-mug-left" src="assets/emoji/beer.svg" alt="">'
                    + '<strong>SANTÉ !</strong><img class="emoji ride-mug-right" src="assets/emoji/beer.svg" alt="">';
                view.append(cheers);
            });
            bannerAt = 4600;
        } else if (vote === 'maybe') {
            // Arrêt en pleine campagne… une vache vient voir ce qui se passe.
            at(1900, () => brake(1300));
            const cow = emoji('cow', 'ride-cow');
            view.append(cow);
            slideIn(cow, 'translateX(220%)', 1300, 1900);
            at(3400, () => { cow.classList.add('is-staring'); face.src = 'assets/emoji/thinking.svg'; });
            bannerAt = 3900;
        } else {
            // Le train entre dans un tunnel : tout devient noir… direction ton lit.
            const tunnel = document.createElement('span');
            tunnel.className = 'ride-tunnel';
            view.append(tunnel);
            if (reduceMotion) {
                tunnel.style.transform = 'none';
            } else {
                tunnel.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }],
                    { duration: 450, delay: 2000, easing: 'ease-in', fill: 'both' });
            }
            at(2450, () => layer.classList.add('is-dark'));
            at(3000, () => { face.src = 'assets/emoji/sleeping.svg'; say('Zzz…', 1500); });
            bannerAt = 3700;
        }

        at(bannerAt, () => layer.append(rideTicket(vote, text)));
        setTimeout(() => {
            layer.classList.add('is-leaving');
            setTimeout(() => layer.remove(), 600);
        }, (reduceMotion ? 0 : bannerAt) + 3000);
    }

    // Roman, chauffeur officiel du club : tout le monde s'inscrit aux mêmes tournois que lui pour qu'il les emmène.
    // « Taxi Roman » arrive en dérapage, les copains s'entassent, Maxime finit sur le toit, départ en wheelie.
    // Animations légères (transform et opacity seulement) pour rester fluide sur téléphone.
    const TAXI_TEXTS = {
        yes: {
            title: 'Taxi Roman : départ pour le bar !',
            details: [
                'Tout le monde s’inscrit aux mêmes tournois que lui. Pur hasard.',
                'Roman, chauffeur officiel du club (non rémunéré).',
                'Prochain arrêt : le bar. Terminus : le bar.',
            ],
        },
        maybe: { title: 'Taxi Roman en attente…', details: ['Toute la team croise les doigts : sans lui, on rentre comment ?'] },
        no: { title: 'Taxi Roman hors service.', details: ['Brieuc et Maxime rentrent à pied.', 'La porte de secours est fermée ce soir.'] },
    };

    function celebrateRoman(vote) {
        document.querySelector('.taxi')?.remove();
        const text = TAXI_TEXTS[vote] || TAXI_TEXTS.yes;
        const layer = document.createElement('div');
        layer.className = 'taxi taxi-' + vote;
        layer.setAttribute('role', 'status');
        layer.innerHTML = '<span class="taxi-shade" aria-hidden="true"></span><span class="taxi-road" aria-hidden="true"></span>'
            + '<span class="taxi-sign" aria-hidden="true"><b>Le bar</b><small>400 m</small></span>';
        const W = innerWidth;
        const gap = Math.min(56, W * 0.13);
        const at = (ms, fn) => setTimeout(fn, reduceMotion ? 0 : ms);

        // Un copain sur le trottoir (visage + prénom éventuel).
        const friend = (face, name, x) => {
            const seat = document.createElement('span');
            seat.className = 'taxi-friend';
            seat.style.left = x + 'px';
            seat.append(emoji(face));
            if (name) {
                const tag = document.createElement('small');
                tag.textContent = name;
                seat.append(tag);
            }
            layer.append(seat);
            return seat;
        };
        // Une bulle de dialogue au-dessus d'un élément.
        const say = (el, words, ms = 1300) => {
            if (!layer.isConnected) return;
            const box = el.getBoundingClientRect();
            const bubble = document.createElement('span');
            bubble.className = 'taxi-say';
            bubble.textContent = words;
            bubble.style.left = Math.max(6, Math.min(W - 150, box.left + box.width / 2 - 20)) + 'px';
            bubble.style.top = box.top - 34 + 'px';
            layer.append(bubble);
            setTimeout(() => bubble.remove(), reduceMotion ? 2500 : ms);
        };

        const brieuc = friend('grin', 'Brieuc', 10);
        const buddy = friend('party-face', '', 10 + gap);

        // La voiture : Roman au volant, lumineux « TAXI ROMAN », galerie pour les raquettes.
        const car = document.createElement('div');
        car.className = 'taxi-car';
        const body = emoji('car', 'taxi-body');
        const driver = emoji('cool', 'taxi-driver');
        const light = document.createElement('span');
        light.className = 'taxi-light';
        light.textContent = 'TAXI ROMAN';
        const roof = document.createElement('span');
        roof.className = 'taxi-roof';
        car.append(roof, light, body, driver);
        layer.append(car);
        document.body.append(layer);

        const carWidth = car.offsetWidth;
        // La voiture s'arrête à droite des copains (au milieu de l'écran sur ordinateur).
        const stopX = Math.min(W - carWidth - 14, Math.max(10 + gap * 2 + 40, W * 0.5 - carWidth * 0.2));
        const bounce = () => body.animate([{ translate: '0 0' }, { translate: '0 7px' }, { translate: '0 0' }], { duration: 260 });
        const addBag = () => {
            const bag = emoji('badminton', 'taxi-bag');
            bag.style.bottom = roof.children.length * 6 + 'px';
            roof.append(bag);
        };
        // Un saut en cloche d'un élément vers les vitres de la voiture, puis il disparaît dedans.
        const dive = (el, i) => {
            if (reduceMotion) {
                el.style.opacity = 0;
                addBag();
                return;
            }
            const target = body.getBoundingClientRect();
            const from = el.getBoundingClientRect();
            const tx = target.left + target.width * (0.35 + i * 0.12) - (from.left + from.width / 2);
            const ty = target.top + target.height * 0.5 - (from.top + from.height / 2);
            el.animate(
                [
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: `translate(${tx * 0.5}px, ${Math.min(ty, 0) - 90}px) scale(1.05) rotate(-20deg)`, opacity: 1, offset: 0.5 },
                    { transform: `translate(${tx}px, ${ty}px) scale(0.4) rotate(-40deg)`, opacity: 0 },
                ],
                { duration: 480, easing: 'ease-in', fill: 'both' },
            );
            setTimeout(() => { addBag(); bounce(); car.classList.add('is-loaded-' + roof.children.length); }, 460);
        };
        const puffs = (delay, count, from = 'right') => {
            for (let i = 0; i < count; i++) {
                at(delay + i * 140, () => {
                    if (!layer.isConnected) return;
                    const box = car.getBoundingClientRect();
                    const puff = emoji('dash', 'taxi-puff');
                    puff.style.left = (from === 'right' ? box.right - 16 : box.left + box.width * 0.2) + 'px';
                    layer.append(puff);
                    puff.animate(
                        [{ transform: 'scale(-0.6, 0.6)', opacity: 0.9 }, { transform: 'translate(46px, -16px) scale(-1.3, 1.3)', opacity: 0 }],
                        { duration: 700, easing: 'ease-out', fill: 'both' },
                    ).finished.then(() => puff.remove(), () => {});
                });
            }
        };

        let bannerAt;
        if (vote === 'no') {
            // Il arrive tranquillement, s'arrête devant les copains… puis repart sans personne.
            const maxime = friend('older', 'Maxime', 10 + gap * 2);
            if (reduceMotion) {
                car.style.transform = `translateX(${-carWidth - 60}px)`;
            } else {
                car.animate([{ transform: `translateX(${W + 20}px)` }, { transform: `translateX(${stopX}px)` }], {
                    duration: 1200, delay: 500, easing: 'ease-out', fill: 'both',
                });
            }
            at(700, () => say(brieuc, 'Le voilà !'));
            at(1800, () => {
                light.textContent = 'HORS SERVICE';
                light.classList.add('is-off');
                say(car, 'Désolé, entraînement !', 1700);
            });
            at(2700, () => {
                if (reduceMotion) return;
                car.animate([{ transform: `translateX(${stopX}px)` }, { transform: `translateX(${-carWidth - 60}px)` }], {
                    duration: 1500, easing: 'ease-in', fill: 'both',
                });
                puffs(0, 7);
            });
            at(3400, () => {
                for (const seat of [brieuc, buddy, maxime]) {
                    if (seat !== maxime) seat.querySelector('img').src = 'assets/emoji/pleading.svg';
                    seat.classList.add('is-sad');
                }
                say(buddy, 'Roman ?!');
            });
            at(4000, () => say(maxime, 'À pied… avec mes genoux ?', 1800));
            bannerAt = 4400;
        } else {
            // Il arrive en dérapage (la voiture pique du nez), poussière et crissement de pneus.
            if (reduceMotion) {
                car.style.transform = `translateX(${stopX}px)`;
            } else {
                car.animate(
                    [
                        { transform: `translateX(${W + 20}px)` },
                        { transform: `translateX(${stopX - 14}px) rotate(-4deg)`, offset: 0.8 },
                        { transform: `translateX(${stopX + 4}px) rotate(1deg)`, offset: 0.92 },
                        { transform: `translateX(${stopX}px) rotate(0deg)` },
                    ],
                    { duration: 900, delay: 300, easing: 'ease-out', fill: 'both' },
                );
                puffs(950, 3, 'left');
            }
            at(950, () => {
                const screech = document.createElement('span');
                screech.className = 'taxi-screech';
                screech.textContent = 'SCRIIIITCH !';
                screech.style.left = Math.max(8, stopX - 40) + 'px';
                layer.append(screech);
                setTimeout(() => screech.remove(), 1200);
            });
            at(1350, () => say(car, vote === 'yes' ? 'TUT TUT !' : 'TUT… ?'));

            if (vote === 'maybe') {
                at(1500, () => {
                    driver.src = 'assets/emoji/thinking.svg';
                    light.classList.add('is-hazard');
                    brieuc.classList.add('is-waiting');
                    buddy.classList.add('is-waiting');
                });
                at(1900, () => say(brieuc, 'Alors, on part ?'));
                bannerAt = 2300;
            } else {
                at(1700, () => say(brieuc, 'Je monte devant !'));
                at(2000, () => dive(brieuc, 0));
                at(2300, () => dive(buddy, 1));
                // Un troisième tombe du ciel, direct dans la voiture.
                const flyer = friend('zany', '', stopX + carWidth * 0.5);
                flyer.classList.add('is-flying');
                at(2600, () => {
                    if (reduceMotion) { flyer.style.opacity = 0; addBag(); return; }
                    const target = body.getBoundingClientRect();
                    const from = flyer.getBoundingClientRect();
                    flyer.style.opacity = 1;
                    flyer.animate(
                        [{ transform: `translateY(${-from.top - 80}px) rotate(0deg)` },
                            { transform: `translateY(${target.top + target.height * 0.5 - from.top - from.height / 2}px) rotate(540deg) scale(0.5)` }],
                        { duration: 650, easing: 'ease-in', fill: 'both' },
                    );
                    setTimeout(() => { flyer.style.opacity = 0; addBag(); bounce(); car.classList.add('is-loaded-3'); }, 640);
                    say(car, 'YOUHOUUU !', 1000);
                });
                // Maxime, le vétéran, arrive en dernier en clopinant… et finit sur le toit.
                const maxime = friend('older', 'Maxime', -60);
                maxime.classList.add('is-limping');
                const maximeX = Math.max(10, stopX - gap - 10);
                if (!reduceMotion) {
                    maxime.animate([{ translate: '0 0' }, { translate: `${maximeX + 60}px 0` }],
                        { duration: 1400, delay: 2900, easing: 'ease-out', fill: 'both' });
                }
                at(3200, () => say(maxime, 'Attendez-moi !'));
                at(4100, () => say(car, 'TUT ! TUT !', 900));
                at(4400, () => {
                    maxime.getAnimations().forEach((animation) => animation.cancel());
                    maxime.remove();
                    maxime.classList.remove('is-limping');
                    maxime.style.left = '';
                    maxime.classList.add('is-on-roof');
                    car.append(maxime);
                    bounce();
                });
                // Départ en wheelie (trop lourd à l'arrière), une raquette tombe de la galerie.
                const leave = 5100;
                at(leave, () => {
                    if (reduceMotion) return;
                    car.animate(
                        [
                            { transform: `translateX(${stopX}px) rotate(0deg)` },
                            { transform: `translateX(${stopX + 6}px) rotate(9deg)`, offset: 0.18 },
                            { transform: `translateX(${stopX - 80}px) rotate(6deg)`, offset: 0.45 },
                            { transform: `translateX(${-carWidth - 80}px) rotate(0deg)` },
                        ],
                        { duration: 1500, easing: 'ease-in', fill: 'both' },
                    );
                    puffs(0, 8);
                    const lost = roof.lastElementChild;
                    if (lost) {
                        const box = lost.getBoundingClientRect();
                        const fallen = emoji('badminton', 'taxi-fallen');
                        fallen.style.left = box.left + 'px';
                        fallen.style.top = box.top + 'px';
                        lost.remove();
                        layer.append(fallen);
                        const ground = innerHeight - 40 - box.top;
                        fallen.animate(
                            [
                                { transform: 'translate(0, 0) rotate(0deg)' },
                                { transform: `translate(40px, ${ground}px) rotate(200deg)`, offset: 0.55 },
                                { transform: `translate(70px, ${ground - 30}px) rotate(300deg)`, offset: 0.75 },
                                { transform: `translate(90px, ${ground}px) rotate(360deg)` },
                            ],
                            { duration: 900, delay: 250, easing: 'ease-in', fill: 'both' },
                        );
                    }
                });
                bannerAt = leave + 700;
            }
        }

        at(bannerAt, () => {
            const banner = document.createElement('div');
            banner.className = 'taxi-banner';
            const title = document.createElement('strong');
            title.textContent = text.title;
            const detail = document.createElement('span');
            detail.textContent = text.details[Math.floor(Math.random() * text.details.length)];
            banner.append(title, detail);
            layer.append(banner);
        });

        setTimeout(() => {
            layer.classList.add('is-leaving');
            setTimeout(() => layer.remove(), 600);
        }, (reduceMotion ? 0 : bannerAt) + 4000);
    }

    // Olivier, montagnard roots : rando en lacets jusqu'au sommet, panneau jaune de sentier, refuge = bar.
    // Comme le volcan de Naya, la montagne se dresse en bas de l'écran et le ciel laisse deviner la page.
    const RANDO_TEXTS = {
        yes: {
            title: 'Sommet atteint !',
            details: [
                'Olivier a trouvé le meilleur refuge : le bar.',
                'Dénivelé positif : une pinte. Un vrai roots.',
                'Pas de télésiège : même au bar, il monte à pied.',
            ],
            signs: [['right', 'Le Bar', '0 h 20', true], ['right', 'Sommet de la Soif', '1 h 00'], ['left', 'Le gymnase', 'déjà fait']],
            stop: 1,
            altitude: 2914,
        },
        maybe: {
            title: 'Brouillard en altitude…',
            details: ['Olivier attend que ça se lève pour décider.'],
            signs: [['right', 'Le Bar', '? h ??', true], ['left', 'La vallée', 'peut-être']],
            stop: 0.5,
            altitude: 1457,
        },
        no: {
            title: 'Olivier bivouaque.',
            details: ['Une nuit à la belle étoile plutôt qu’au bar. Roots.'],
            signs: [['none', 'Bivouac', 'ici', true], ['right', 'Le Bar', 'pas ce soir']],
            stop: 0.1,
            altitude: 312,
        },
    };

    // Le dessin fait 400 × 350 unités ; les reliefs débordent sur les côtés pour couvrir tout l'écran.
    const RANDO_W = 400;
    const RANDO_H = 350;
    // Le sentier en lacets, de la prairie au sommet.
    const RANDO_TRAIL = [[204, 268], [236, 234], [168, 204], [246, 176], [196, 140], [238, 110], [215, 56]];
    const RANDO_LANDSCAPE = `
        <svg class="rando-art" viewBox="0 0 ${RANDO_W} ${RANDO_H}" aria-hidden="true">
            <defs>
                <linearGradient id="rando-lit" x1="0" y1="50" x2="0" y2="250" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#9db8a6"/><stop offset="1" stop-color="#6f9580"/>
                </linearGradient>
                <linearGradient id="rando-shade" x1="0" y1="50" x2="0" y2="250" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#6d8d7b"/><stop offset="1" stop-color="#4b6d5a"/>
                </linearGradient>
                <linearGradient id="rando-ground" x1="0" y1="230" x2="0" y2="350" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#5c9a6c"/><stop offset="0.5" stop-color="#3d7653"/><stop offset="1" stop-color="#2a5640"/>
                </linearGradient>
            </defs>
            <g class="rando-range rando-range-far">
                <path d="M-1000 215 L-780 150 L-560 205 L-330 140 L-120 198 L-20 160 L50 192 L95 146 L140 186 L300 182 L345 128 L395 176 L470 138 L620 205 L820 145 L1050 200 L1400 152 V${RANDO_H} H-1000Z" fill="#c9dbe6"/>
            </g>
            <g class="rando-range rando-range-mid">
                <path d="M-1000 245 L-700 188 L-420 238 L-200 178 L-40 232 L30 182 L75 208 L118 128 L160 196 L250 205 L300 112 L352 194 L420 162 L560 232 L760 176 L1000 238 L1400 190 V${RANDO_H} H-1000Z" fill="#a9c3d3"/>
                <path d="M118 128 L160 196 L138 200 L128 160Z M300 112 L352 194 L330 198 L310 150Z M-700 188 L-420 238 L-520 240 L-640 205Z M760 176 L1000 238 L900 240 L800 200Z" fill="#91aec1"/>
                <path d="M118 128 L130 147 L124 144 L118 151 L112 145 L105 148Z M300 112 L313 132 L306 128 L300 136 L293 129 L287 133Z" fill="#fff"/>
            </g>
            <g class="rando-range rando-range-main">
                <path d="M30 250 L120 170 L150 152 L215 50 L262 108 L282 98 L380 250Z" fill="url(#rando-lit)"/>
                <path d="M215 50 L262 108 L282 98 L380 250 L236 250 L250 168 L224 104Z" fill="url(#rando-shade)"/>
                <path d="M150 152 L172 170 L160 176Z M282 98 L300 140 L288 132Z" fill="#5f8270" opacity="0.6"/>
                <path d="M215 50 L190 92 L201 86 L208 96 L216 87 L224 97 L233 88 L243 95 L232 72Z" fill="#fff"/>
                <path d="M215 50 L232 72 L243 95 L233 88 L224 97 L221 70Z" fill="#dbe7ee"/>
                <polyline class="rando-trail" points="${RANDO_TRAIL.map((p) => p.join(',')).join(' ')}"
                    fill="none" stroke="#f6efdc" stroke-width="2.5" stroke-dasharray="5 6" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g class="rando-range rando-range-front">
                <path d="M-1000 ${RANDO_H} V250 Q-500 212 0 250 Q70 226 140 246 T290 240 T400 248 Q700 216 1400 250 V${RANDO_H}Z" fill="url(#rando-ground)"/>
                <path d="M-1000 ${RANDO_H} V300 Q-400 280 60 304 Q200 290 330 306 T1400 296 V${RANDO_H}Z" fill="#2f5e45" opacity="0.6"/>
            </g>
        </svg>`;

    function celebrateOlivier(vote) {
        document.querySelector('.rando')?.remove();
        const text = RANDO_TEXTS[vote] || RANDO_TEXTS.yes;
        const layer = document.createElement('div');
        layer.className = 'rando rando-' + vote;
        layer.setAttribute('role', 'status');
        layer.innerHTML = '<span class="rando-sky" aria-hidden="true"></span><span class="rando-night" aria-hidden="true"></span>';

        const scene = document.createElement('div');
        scene.className = 'rando-scene';
        scene.innerHTML = '<span class="rando-sun" aria-hidden="true"></span>' + RANDO_LANDSCAPE;
        for (const [x, y, size] of [[4, 73, 7], [66, 75, 8], [77, 79, 11], [87, 73, 9], [95, 80, 8]]) {
            const tree = emoji('tree', 'rando-tree');
            tree.style.left = x + '%';
            tree.style.top = y + '%';
            tree.style.width = size + '%';
            scene.append(tree);
        }

        // L'altimètre de la montre de rando
        const altimeter = document.createElement('p');
        altimeter.className = 'rando-alti';
        altimeter.innerHTML = '<small>Altitude</small>';
        const meters = document.createElement('b');
        meters.textContent = '0 m';
        altimeter.append(meters);
        scene.append(altimeter);

        // Le panneau jaune des sentiers, planté dans la prairie
        const sign = document.createElement('div');
        sign.className = 'rando-sign';
        for (const [direction, place, time, main] of text.signs) {
            const board = document.createElement('p');
            board.className = 'rando-board rando-board-' + direction + (main ? ' is-main' : '');
            const name = document.createElement('b');
            name.textContent = place;
            const duration = document.createElement('span');
            duration.textContent = time;
            board.append(name, duration);
            sign.append(board);
        }
        scene.append(sign);

        const hiker = emoji('hiker', 'rando-hiker');
        scene.append(hiker);
        layer.append(scene);
        document.body.append(layer);

        // Olivier suit le sentier : son trajet est calculé à l'échelle de la scène.
        const scale = scene.clientWidth / RANDO_W;
        const size = scene.clientWidth * 0.11; // largeur CSS du marcheur (emoji carré)
        const points = RANDO_TRAIL.map(([x, y]) => [x * scale, y * scale]);
        const place = ([x, y], flip) => `translate(${x - size / 2}px, ${y - size * 0.94}px) scaleX(${flip})`;
        const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
        const total = lengths.reduce((a, b) => a + b, 0);
        // L'emoji marche vers la gauche : on le retourne sur les lacets qui partent à droite.
        const frames = [];
        let walked = 0;
        lengths.forEach((length, i) => {
            const [a, b] = [points[i], points[i + 1]];
            const flip = b[0] > a[0] ? -1 : 1;
            const from = walked / total;
            walked += length;
            if (from >= text.stop) return;
            const end = Math.min(walked / total, text.stop);
            const k = (end - from) * total / length; // part du lacet parcourue
            const stopAt = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
            frames.push({ offset: from / text.stop, transform: place(a, flip) });
            frames.push({ offset: end / text.stop, transform: place(stopAt, flip) });
        });
        const walkTime = reduceMotion ? 0 : Math.max(500, 2600 * text.stop);
        const walkStart = 1100;
        if (reduceMotion) {
            hiker.style.transform = frames[frames.length - 1].transform;
            meters.textContent = text.altitude.toLocaleString('fr-FR') + ' m';
        } else {
            hiker.classList.add('is-walking');
            hiker.animate(frames, { duration: walkTime, delay: walkStart, easing: 'linear', fill: 'both' })
                .finished.then(() => hiker.classList.remove('is-walking'), () => {});
            const start = performance.now() + walkStart;
            const tick = (now) => {
                const t = Math.max(0, Math.min(1, (now - start) / walkTime));
                meters.textContent = Math.round(text.altitude * t).toLocaleString('fr-FR') + ' m';
                if (t < 1 && layer.isConnected) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }

        const at = (ms, fn) => setTimeout(fn, reduceMotion ? 0 : ms);
        const arrival = walkStart + walkTime;
        if (vote === 'maybe') {
            at(walkStart + walkTime * 0.4, () => layer.classList.add('is-foggy'));
            for (let i = 0; i < 3; i++) {
                const fog = document.createElement('span');
                fog.className = 'rando-fog';
                fog.setAttribute('aria-hidden', 'true');
                scene.append(fog);
            }
        }
        if (vote === 'no') {
            at(900, () => layer.classList.add('is-night'));
            scene.append(emoji('tent', 'rando-tent'));
            at(arrival, () => hiker.classList.add('is-in-tent'));
        }
        if (vote === 'yes') {
            at(arrival, () => {
                // La chope est plantée dans la pente, juste à droite du sommet, et Olivier se tourne vers elle.
                const beer = emoji('beer', 'rando-flag');
                beer.style.left = (240 / RANDO_W) * 100 + '%';
                beer.style.top = (84 / RANDO_H) * 100 + '%';
                scene.append(beer);
                hiker.getAnimations().forEach((animation) => animation.cancel());
                hiker.style.transform = place(points[points.length - 1], -1);
                layer.classList.add('is-summit');
                if (!reduceMotion) summitParty(layer, scene, points[points.length - 1], hiker);
            });
        }

        // Au sommet, on laisse d'abord la fête se voir avant la bannière.
        const bannerAt = arrival + (vote === 'yes' ? 1300 : 150);
        at(bannerAt, () => {
            const banner = document.createElement('div');
            banner.className = 'rando-banner';
            const title = document.createElement('strong');
            title.textContent = text.title;
            const detail = document.createElement('span');
            detail.textContent = text.details[Math.floor(Math.random() * text.details.length)];
            banner.append(title, detail);
            layer.append(banner);
        });

        setTimeout(() => {
            layer.classList.add('is-leaving');
            setTimeout(() => layer.remove(), 700);
        }, (reduceMotion ? 0 : bannerAt) + 4200);
    }

    // La fête au sommet, sur toute la page : rayons de lumière, gerbe de bières et d'étoiles,
    // saut de joie, écho de la montagne, puis pluie d'étoiles.
    const SUMMIT_BURST = ['beer', 'star', 'party', 'beers', 'star', 'beer', 'party', 'star'];
    const SUMMIT_ECHO = [
        // [texte, x (vw), y (vh), taille, délai]
        ['SANTÉ !', 50, 36, 'clamp(1.8rem, 8vw, 3.2rem)', 0],
        ['…anté !', 20, 47, 'clamp(1.3rem, 5.5vw, 2.2rem)', 600],
        ['…té !', 80, 41, 'clamp(1.05rem, 4.5vw, 1.7rem)', 1150],
        ['…é…', 30, 28, 'clamp(0.9rem, 3.5vw, 1.3rem)', 1650],
    ];

    function summitParty(layer, scene, [x, y], hiker) {
        const box = scene.getBoundingClientRect();
        const sx = box.left + x;
        const sy = box.top + y;

        // Les rayons partent du pic et balaient tout l'écran, derrière les montagnes.
        const glory = document.createElement('span');
        glory.className = 'rando-glory';
        glory.setAttribute('aria-hidden', 'true');
        glory.style.left = sx + 'px';
        glory.style.top = sy + 'px';
        scene.before(glory);

        hiker.animate(
            [{ translate: '0 0' }, { translate: '0 -18px', offset: 0.3 }, { translate: '0 0', offset: 0.55 },
                { translate: '0 -9px', offset: 0.78 }, { translate: '0 0' }],
            { duration: 750, easing: 'ease-in-out' },
        );

        // La gerbe monte jusqu'en haut de la page puis retombe, comme l'éruption du volcan de Naya.
        const gravity = 1100;
        for (let i = 0; i < 26; i++) {
            const piece = emoji(SUMMIT_BURST[i % SUMMIT_BURST.length], 'rando-burst');
            const size = rand(26, 46);
            piece.style.width = size + 'px';
            piece.style.left = sx - size / 2 + 'px';
            piece.style.top = sy - size / 2 + 'px';
            layer.append(piece);
            const peak = sy * rand(0.45, 1);
            const vy = -Math.sqrt(2 * gravity * peak);
            const duration = 2.4;
            const vx = rand(-0.5, 0.5) * innerWidth / 1.2;
            const spin = rand(-360, 360);
            const frames = [];
            for (let k = 0; k <= 12; k++) {
                const t = (k / 12) * duration;
                frames.push({
                    transform: `translate(${vx * t}px, ${vy * t + 0.5 * gravity * t * t}px) rotate(${spin * t}deg)`,
                });
            }
            piece.animate(frames, { duration: duration * 1000, delay: rand(0, 300), easing: 'linear', fill: 'both' })
                .finished.then(() => piece.remove(), () => {});
        }

        // L'écho : Olivier crie « Santé ! » et la montagne répond, de plus en plus loin.
        for (const [text, ex, ey, fontSize, delay] of SUMMIT_ECHO) {
            const echo = document.createElement('span');
            echo.className = 'rando-echo';
            echo.textContent = text;
            echo.style.left = ex + 'vw';
            echo.style.top = ey + 'vh';
            echo.style.fontSize = fontSize;
            echo.style.animationDelay = 250 + delay + 'ms';
            layer.append(echo);
        }

        // Puis une pluie d'étoiles retombe doucement sur toute la page.
        for (let i = 0; i < 16; i++) {
            const star = emoji('star', 'rando-starfall');
            star.style.width = rand(14, 26) + 'px';
            star.style.left = rand(2, 96) + 'vw';
            layer.append(star);
            star.animate(
                [
                    { transform: `translateY(-40px) rotate(0deg)`, opacity: 0 },
                    { opacity: 1, offset: 0.15 },
                    { transform: `translateY(${innerHeight * rand(0.55, 0.9)}px) rotate(${rand(-180, 180)}deg)`, opacity: 0 },
                ],
                { duration: rand(2200, 3200), delay: 900 + rand(0, 1400), easing: 'ease-in', fill: 'both' },
            );
        }
    }

    // Thibaut : échecs, karaoké, blind tests et chats. Une passion par réponse, après une ouverture en blind test.
    // Je viens : karaoké sous la boule disco, un chat au micro. Peut-être : partie d'échecs, le cavalier hésite
    // entre le bar et le canapé. Je rentre : il rentre retrouver ses chats, qui envahissent l'écran.
    // Animations légères (transform et opacity seulement) pour rester fluide sur téléphone.
    const THIB_TEXTS = {
        yes: {
            lyrics: ['Ce', 'soir', 'on', 'va', 'au', 'bar,', 'et', 'c’est', 'Thibaut', 'qui', 'chante', '!'],
            title: 'Thibaut au micro !',
            details: [
                'Karaoké au bar ce soir. Prévoyez des bouchons d’oreilles.',
                'Score parfait. Les chats du quartier applaudissent.',
                'Blind test, karaoké… et une tournée de plus.',
            ],
        },
        maybe: {
            title: 'Thibaut réfléchit à son coup…',
            details: ['Bar ou canapé : la partie est serrée.', 'Le cavalier hésite. Thibaut aussi.'],
        },
        no: {
            title: 'Thibaut rentre voir ses chats.',
            details: ['Ils l’attendaient (surtout pour les croquettes).', 'Ce soir, c’est soirée ronron.'],
        },
    };
    const THIB_CATS = ['grinning-cat', 'heart-cat', 'grinning-cat', 'heart-cat'];

    function celebrateThibaut(vote) {
        document.querySelector('.thib')?.remove();
        const text = THIB_TEXTS[vote] || THIB_TEXTS.yes;
        const layer = document.createElement('div');
        layer.className = 'thib thib-' + vote;
        layer.setAttribute('role', 'status');
        layer.innerHTML = '<span class="thib-stage" aria-hidden="true"></span><span class="thib-lights" aria-hidden="true"></span>';
        const at = (ms, fn) => setTimeout(fn, reduceMotion ? 0 : ms);
        const W = innerWidth;
        const H = innerHeight;

        // Ouverture : blind test, on buzze la réponse de Thibaut.
        const quiz = document.createElement('div');
        quiz.className = 'thib-quiz';
        quiz.innerHTML = '<p class="thib-quiz-title">Blind test</p>'
            + '<span class="thib-buzzer"><span>BUZZ</span></span>'
            + '<p class="thib-quiz-q">Quelle est la réponse de Thibaut ?</p>';
        layer.append(quiz);
        document.body.append(layer);
        at(900, () => quiz.classList.add('is-buzzed'));
        at(1450, () => quiz.classList.add('is-gone'));

        // Notes de musique qui s'envolent (karaoké et blind test).
        const notes = (count, delay) => {
            if (reduceMotion) return;
            for (let i = 0; i < count; i++) {
                const note = emoji('notes', 'thib-note');
                note.style.left = 5 + Math.random() * 85 + 'vw';
                layer.append(note);
                note.animate(
                    [{ transform: 'translateY(0) rotate(0deg)', opacity: 0 }, { opacity: 1, offset: 0.2 },
                        { transform: `translate(${Math.random() * 60 - 30}px, ${-H * 0.6}px) rotate(${Math.random() * 60 - 30}deg)`, opacity: 0 }],
                    { duration: 2200 + Math.random() * 1200, delay: delay + Math.random() * 2400, easing: 'ease-out', fill: 'both' },
                );
            }
        };
        notes(4, 0);

        let bannerAt;
        let banner;
        if (vote === 'yes') {
            // Karaoké : boule disco, lumières qui tournent, un chat au micro, paroles mot à mot.
            at(1400, () => layer.classList.add('is-disco'));
            const ball = emoji('mirror-ball', 'thib-ball');
            layer.append(ball);
            const singer = document.createElement('div');
            singer.className = 'thib-singer';
            singer.append(emoji('grinning-cat', 'thib-cat'), emoji('mic', 'thib-mic'));
            layer.append(singer);
            const lyrics = document.createElement('p');
            lyrics.className = 'thib-lyrics';
            const words = text.lyrics.map((word) => {
                const span = document.createElement('span');
                span.textContent = word;
                lyrics.append(span, ' ');
                return span;
            });
            layer.append(lyrics);
            words.forEach((word, i) => at(2000 + i * 260, () => word.classList.add('is-sung')));
            notes(8, 1600);
            bannerAt = 2000 + words.length * 260 + 300;
            banner = () => {
                const score = document.createElement('div');
                score.className = 'thib-score';
                score.innerHTML = '<p class="thib-score-label">Score</p><p class="thib-score-value"><b>0</b><small>/100</small></p>'
                    + '<p class="thib-score-stars">★★★★★</p>';
                const title = document.createElement('strong');
                title.textContent = text.title;
                const detail = document.createElement('span');
                detail.textContent = text.details[Math.floor(Math.random() * text.details.length)];
                score.append(title, detail);
                const value = score.querySelector('b');
                const start = performance.now();
                const tick = (now) => {
                    const t = reduceMotion ? 1 : Math.min(1, (now - start) / 900);
                    value.textContent = Math.round(98 * (1 - Math.pow(1 - t, 3)));
                    if (t < 1 && layer.isConnected) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                return score;
            };
        } else if (vote === 'maybe') {
            // Échecs : la pendule tourne, le cavalier hésite entre le bar et le canapé.
            const game = document.createElement('div');
            game.className = 'thib-game';
            game.innerHTML = '<p class="thib-clock"><span>Thibaut</span><b>0:10</b></p>'
                + '<div class="thib-board"><span class="thib-square is-bar">Bar</span><span class="thib-square is-couch">Canapé</span>'
                + '<span class="thib-knight">♞</span></div>';
            layer.append(game);
            const clock = game.querySelector('.thib-clock b');
            let seconds = 10;
            const timer = setInterval(() => {
                if (!layer.isConnected || seconds <= 3) return clearInterval(timer);
                seconds -= 1;
                clock.textContent = '0:' + String(seconds).padStart(2, '0');
            }, reduceMotion ? 10 : 450);
            // Le cavalier (case b1) part vers le bar (c3)… revient… part vers le canapé (d2)… revient.
            const knight = game.querySelector('.thib-knight');
            // Positions en cases depuis b1 : un saut va d'une case à l'autre, en se soulevant à mi-chemin.
            const hop = ([x1, y1], [x2, y2]) => [
                { transform: `translate(${x1 * 100}%, ${y1 * 100}%) scale(1)` },
                { transform: `translate(${(x1 + x2) * 50}%, ${(y1 + y2) * 50}%) scale(1.25)`, offset: 0.5 },
                { transform: `translate(${x2 * 100}%, ${y2 * 100}%) scale(1)` },
            ];
            const home = [0, 0];
            const bar = [1, -2];
            const couch = [2, -1];
            const moves = [hop(home, bar), hop(bar, home), hop(home, couch), hop(couch, home)];
            if (!reduceMotion) {
                moves.forEach((frames, i) => at(1900 + i * 560, () => knight.animate(frames, { duration: 450, easing: 'ease-in-out', fill: 'forwards' })));
            }
            at(4200, () => game.classList.add('is-thinking'));
            bannerAt = 4300;
            banner = () => {
                const sheet = document.createElement('div');
                sheet.className = 'thib-notation';
                sheet.innerHTML = '<p class="thib-notation-head"><span>Feuille de partie</span><span>Coup 42</span></p>'
                    + '<p class="thib-notation-move"><b>Blancs</b><span>♞ ?? (réflexion en cours)</span></p>';
                const title = document.createElement('strong');
                title.textContent = text.title;
                const detail = document.createElement('span');
                detail.className = 'thib-notation-detail';
                detail.textContent = text.details[Math.floor(Math.random() * text.details.length)];
                sheet.append(title, detail);
                return sheet;
            };
        } else {
            // Les chats : ils arrivent de partout, s'installent, et un chat traverse l'écran.
            at(1400, () => layer.classList.add('is-cosy'));
            for (let i = 0; i < 11; i++) {
                const cat = emoji(THIB_CATS[i % THIB_CATS.length], 'thib-head');
                cat.style.left = 4 + ((i * 37) % 88) + 'vw';
                cat.style.top = 30 + ((i * 53) % 55) + 'vh';
                cat.style.width = 40 + ((i * 13) % 26) + 'px';
                cat.style.animationDelay = (reduceMotion ? 0 : 1.5 + i * 0.12) + 's';
                cat.style.rotate = ((i * 29) % 30) - 15 + 'deg';
                layer.append(cat);
            }
            const walker = emoji('cat', 'thib-walker');
            layer.append(walker);
            if (!reduceMotion) {
                walker.animate([{ transform: `translateX(${W + 40}px)` }, { transform: 'translateX(-140px)' }],
                    { duration: 3200, delay: 1600, easing: 'linear', fill: 'both' });
            }
            // Traces de pattes qui traversent la page.
            for (let i = 0; i < 6; i++) {
                const paw = emoji('paws', 'thib-paw');
                paw.style.left = 8 + i * 15 + 'vw';
                paw.style.top = 78 - i * 9 + 'vh';
                paw.style.animationDelay = (reduceMotion ? 0 : 1.6 + i * 0.22) + 's';
                layer.append(paw);
            }
            const meow = (left, top, delay) => at(delay, () => {
                const bubble = document.createElement('span');
                bubble.className = 'thib-meow';
                bubble.textContent = 'Miaou !';
                bubble.style.left = left;
                bubble.style.top = top;
                layer.append(bubble);
                setTimeout(() => bubble.remove(), 1400);
            });
            meow('14vw', '36vh', 2300);
            meow('60vw', '52vh', 2900);
            bannerAt = 3500;
            banner = () => {
                const card = document.createElement('div');
                card.className = 'thib-paws-card';
                const title = document.createElement('strong');
                title.textContent = text.title;
                const detail = document.createElement('span');
                detail.textContent = text.details[Math.floor(Math.random() * text.details.length)];
                card.append(emoji('paws', 'thib-paws-icon'), title, detail);
                return card;
            };
        }

        at(bannerAt, () => layer.append(banner()));
        setTimeout(() => {
            layer.classList.add('is-leaving');
            setTimeout(() => layer.remove(), 600);
        }, (reduceMotion ? 0 : bannerAt) + 2900);
    }

    // Alex, le rageux du terrain (et N3 en mixte) : il fait une faute, « OUT ! », insultes (censurées) et le site tremble.
    // Je viens : il se maîtrise, pose la raquette et va boire un coup pour décompresser.
    // Peut-être : il arme, stoppe trop tard et fêle l'écran. Je rentre : la raquette finit sur sa cheville.
    // Animations légères (transform et opacity) pour rester fluide sur téléphone.
    const RAGE_TEXTS = {
        yes: {
            title: 'Alex se maîtrise. Il vient !',
            details: [
                'N3 en mixte, et une bière pour décompresser.',
                'Aucune raquette n’a été blessée ce soir.',
                'Thérapie du jour : une pinte.',
            ],
        },
        maybe: {
            title: 'Alex hésite…',
            details: ['L’écran a eu chaud.', 'Il décidera quand sa raquette aura arrêté de trembler.'],
        },
        no: {
            title: 'Alex rentre.',
            details: ['Motif : agression de cheville avec sa propre raquette.', 'La cheville porte plainte. La raquette aussi.'],
        },
    };
    const RAGE_RACKET_TOP = `
        <svg viewBox="0 0 120 170" aria-hidden="true">
            <defs>
                <linearGradient id="rage-frame" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#ff7a59"/><stop offset="1" stop-color="#c8202a"/>
                </linearGradient>
            </defs>
            <ellipse cx="60" cy="72" rx="47" ry="64" fill="rgb(255 255 255 / 18%)"/>
            <path d="M28 20V124M44 10V134M60 8V136M76 10V134M92 20V124M14 42H106M13 58H107M13 74H107M14 90H106M20 106H100" stroke="#fffdf7" stroke-width="2"/>
            <ellipse cx="60" cy="72" rx="47" ry="64" fill="none" stroke="url(#rage-frame)" stroke-width="9"/>
            <path d="M44 132 L60 150 L76 132 L68 136 L60 142 L52 136Z" fill="#c8202a"/>
            <path d="M56 146H64V162L60 158L56 170Z" fill="#3a3f48"/>
        </svg>`;
    const RAGE_RACKET_BOTTOM = `
        <svg viewBox="0 0 120 130" aria-hidden="true">
            <path d="M56 12L60 0L64 6V72H56Z" fill="#3a3f48"/>
            <rect x="51" y="70" width="18" height="56" rx="6" fill="#315d46"/>
            <path d="M51 82L69 74M51 96L69 88M51 110L69 102" stroke="#f6c94a" stroke-width="3"/>
        </svg>`;

    // La carte finale : licence N3 (oui), carton jaune (peut-être) ou carton rouge (non).
    function rageCard(vote, text) {
        const card = document.createElement('div');
        card.className = 'rage-card rage-card-' + vote;
        const head = document.createElement('p');
        head.className = 'rage-card-head';
        const big = document.createElement('b');
        big.className = 'rage-card-big';
        const facts = document.createElement('p');
        facts.className = 'rage-card-facts';
        if (vote === 'yes') {
            head.textContent = 'Licence joueur · Alex · Mixte';
            big.textContent = 'N3';
            facts.textContent = 'Classement rouge · Raquettes cassées ce soir : 0';
        } else if (vote === 'maybe') {
            head.textContent = 'Carton jaune · Alex';
            big.textContent = '1er avertissement';
            facts.textContent = 'Motif : écran légèrement fissuré';
        } else {
            head.textContent = 'Carton rouge · Alex';
            big.textContent = 'Disqualifié';
            facts.textContent = 'Victime : sa propre cheville';
        }
        const title = document.createElement('strong');
        title.textContent = text.title;
        const detail = document.createElement('span');
        detail.textContent = text.details[Math.floor(Math.random() * text.details.length)];
        card.append(head, big, title, detail, facts);
        return card;
    }

    // Fissures qui rayonnent depuis le point d'impact, avec quelques éclats de verre.
    function rageCracks(layer, x, y, small = false) {
        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'rage-cracks');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
        const reach = Math.hypot(innerWidth, innerHeight);
        const rings = [[], []];
        const rays = small ? 6 : 15;
        for (let i = 0; i < rays; i++) {
            let angle = (i / rays) * Math.PI * 2 + rand(-0.25, 0.25);
            let distance = 0;
            let px = x;
            let py = y;
            let d = `M${x} ${y}`;
            const length = small ? rand(45, 115) : reach * rand(0.28, 0.72);
            let step = 0;
            while (distance < length) {
                distance += rand(26, 74);
                angle += rand(-0.3, 0.3);
                px = x + Math.cos(angle) * distance;
                py = y + Math.sin(angle) * distance;
                d += ` L${px.toFixed(1)} ${py.toFixed(1)}`;
                if (step < 2) rings[step].push([px, py]);
                step++;
            }
            const path = document.createElementNS(NS, 'path');
            path.setAttribute('d', d);
            svg.append(path);
        }
        for (const ring of small ? [] : rings) {
            const path = document.createElementNS(NS, 'path');
            path.setAttribute('d', 'M' + ring.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(' L') + 'Z');
            path.setAttribute('class', 'rage-crack-ring');
            svg.append(path);
        }
        layer.append(svg);
        if (reduceMotion) return;
        svg.style.transformOrigin = `${x}px ${y}px`;
        svg.animate([{ transform: 'scale(0.15)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
            { duration: 130, easing: 'ease-out' });
        for (let i = 0; i < (small ? 0 : 7); i++) {
            const shard = document.createElement('span');
            shard.className = 'rage-shard';
            shard.style.left = x + 'px';
            shard.style.top = y + 'px';
            layer.append(shard);
            const dx = rand(-0.42, 0.42) * innerWidth;
            shard.animate(
                [{ transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                    { transform: `translate(${dx * 0.6}px, ${rand(-80, 10)}px) rotate(${rand(-150, 150)}deg)`, opacity: 1, offset: 0.3 },
                    { transform: `translate(${dx}px, ${innerHeight * 0.7}px) rotate(${rand(-540, 540)}deg)`, opacity: 0 }],
                { duration: rand(900, 1400), easing: 'ease-in', fill: 'both' },
            ).finished.then(() => shard.remove(), () => {});
        }
    }

    function celebrateAlex(vote) {
        document.querySelector('.rage')?.remove();
        const text = RAGE_TEXTS[vote] || RAGE_TEXTS.yes;
        const layer = document.createElement('div');
        layer.className = 'rage rage-' + vote;
        layer.setAttribute('role', 'status');
        layer.innerHTML = '<span class="rage-tint" aria-hidden="true"></span><span class="rage-zen" aria-hidden="true"></span>'
            + '<div class="rage-meter" aria-hidden="true"><p><span>Rage-o-mètre</span><b>0 %</b></p><span class="rage-bar"><i></i></span></div>'
            + '<div class="rage-court" aria-hidden="true"><span class="rage-line"></span><span class="rage-out">OUT !</span></div>';
        const face = emoji('steam', 'rage-face');
        const bubble = document.createElement('span');
        bubble.className = 'rage-say';
        layer.append(face, bubble);
        document.body.append(layer);

        const W = innerWidth;
        const H = innerHeight;
        const at = (ms, fn) => setTimeout(() => { if (layer.isConnected) fn(); }, ms);
        const meterValue = layer.querySelector('.rage-meter b');
        const meterCover = layer.querySelector('.rage-bar i');
        const setRage = (percent, label = percent + ' %') => {
            meterValue.textContent = label;
            meterCover.style.transform = `scaleX(${1 - Math.min(percent, 100) / 100})`;
            layer.style.setProperty('--rage', Math.min(percent, 100) / 100);
        };
        const say = (words) => {
            bubble.textContent = words;
            bubble.classList.remove('is-shown');
            void bubble.offsetWidth;
            bubble.classList.add('is-shown');
        };
        const setFace = (name) => { face.src = 'assets/emoji/' + name + '.svg'; };

        const showCard = () => {
            layer.classList.add('is-calm');
            bubble.classList.remove('is-shown');
            layer.append(rageCard(vote, text));
        };
        const leave = (delay) => setTimeout(() => {
            layer.classList.add('is-leaving');
            pageShakes.forEach((animation) => animation.cancel());
            setTimeout(() => layer.remove(), 600);
        }, delay);

        // Sans animation : directement le verdict.
        const pageShakes = [];
        if (reduceMotion) {
            layer.querySelector('.rage-court').remove();
            if (vote === 'yes') layer.classList.add('is-zen');
            setRage(vote === 'yes' ? 0 : vote === 'maybe' ? 62 : 100, vote === 'yes' ? '0 %' : vote === 'maybe' ? '62 %' : '9 000 %');
            setFace(vote === 'yes' ? 'relieved' : vote === 'maybe' ? 'exhale' : 'pleading');
            showCard();
            leave(3600);
            return;
        }

        // C'est tout le site qui tremble avec lui.
        const shakePage = (strength, duration) => {
            for (const block of document.querySelectorAll('body > header, body > main')) {
                const frames = [];
                for (let i = 0; i < 8; i++) {
                    frames.push({ translate: `${rand(-strength, strength)}px ${rand(-strength, strength)}px` });
                }
                frames.unshift({ translate: '0 0' });
                frames.push({ translate: '0 0' });
                pageShakes.push(block.animate(frames, { duration, easing: 'linear' }));
            }
        };

        // 1. Le volant tombe pile sur la ligne… « OUT ! »
        const court = layer.querySelector('.rage-court');
        const shuttle = emoji('shuttle', 'rage-shuttle');
        court.append(shuttle);
        shuttle.animate(
            [{ transform: `translateY(${-H * 0.32}px) rotate(70deg)` }, { transform: 'translateY(0) rotate(90deg)' },
                { transform: 'translateY(-10px) rotate(96deg)', offset: 0.86 }, { transform: 'translateY(0) rotate(90deg)' }],
            { duration: 620, delay: 200, easing: 'ease-in', fill: 'both' },
        );
        at(880, () => court.classList.add('is-called'));
        at(1250, () => { face.classList.add('is-in'); say('NON MAIS SÉRIEUX ?!'); setRage(18); });
        at(1750, () => { setFace('angry'); say('TA M█RE LA P███ !!!'); setRage(47); shakePage(2, 450); });
        at(2350, () => { setFace('rage'); say('#@%§ DE VOLANT DE M███E !'); setRage(86); shakePage(4, 550); });

        // La raquette, en deux morceaux pour pouvoir casser.
        const racket = document.createElement('div');
        racket.className = 'rage-racket';
        racket.innerHTML = `<span class="rage-racket-top">${RAGE_RACKET_TOP}</span><span class="rage-racket-bottom">${RAGE_RACKET_BOTTOM}</span>`;
        layer.append(racket);
        const length = racket.offsetHeight;
        const width = racket.offsetWidth;
        // Place la raquette pour que sa tête touche le point (hx, hy) avec l'angle voulu.
        const aimed = (hx, hy, degrees, shiftX = 0, shiftY = 0) => {
            const rad = (degrees * Math.PI) / 180;
            const pivotX = hx - Math.sin(rad) * length * 0.75;
            const pivotY = hy + Math.cos(rad) * length * 0.75;
            return `translate(${pivotX - width / 2 + shiftX}px, ${pivotY - length + shiftY}px) rotate(${degrees}deg)`;
        };
        const raise = (hx, hy) => racket.animate(
            [{ transform: aimed(hx, hy, 95, W * 1.7, -H * 0.1) }, { transform: aimed(hx, hy, 58, W * 0.2, -H * 0.05) }],
            { duration: 320, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)', fill: 'both' },
        );
        const slam = (hx, hy, then) => {
            racket.animate(
                [{ transform: aimed(hx, hy, 58, W * 0.2, -H * 0.05) }, { transform: aimed(hx, hy, -14) }],
                { duration: 130, easing: 'cubic-bezier(0.7, 0, 1, 0.6)', fill: 'forwards' },
            ).finished.then(() => {
                if (!layer.isConnected) return;
                const boom = emoji('boom', 'rage-boom');
                boom.style.left = hx + 'px';
                boom.style.top = hy + 'px';
                layer.append(boom);
                boom.animate([{ transform: 'translate(-50%, -50%) scale(0.2)', opacity: 1 },
                    { transform: 'translate(-50%, -50%) scale(1.25)', opacity: 1, offset: 0.45 },
                    { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 }], { duration: 480, fill: 'both' });
                // La raquette casse en deux et les morceaux tombent.
                racket.querySelector('.rage-racket-top').animate(
                    [{ transform: 'none', opacity: 1 }, { transform: `translate(${-W * 0.3}px, ${H * 0.8}px) rotate(-260deg)`, opacity: 0.9 }],
                    { duration: 950, easing: 'cubic-bezier(0.4, 0, 0.9, 0.7)', fill: 'forwards' },
                );
                racket.querySelector('.rage-racket-bottom').animate(
                    [{ transform: 'none', opacity: 1 }, { transform: `translate(${W * 0.28}px, ${H * 0.7}px) rotate(210deg)`, opacity: 0.9 }],
                    { duration: 850, easing: 'cubic-bezier(0.4, 0, 0.9, 0.7)', fill: 'forwards' },
                );
                then();
            }, () => {});
        };

        let cardAt;
        const hit = [W / 2, H * 0.44];
        const lowerRacket = () => {
            racket.classList.remove('is-trembling');
            racket.animate([{ transform: aimed(...hit, 58, W * 0.2, -H * 0.05) }, { transform: aimed(...hit, 95, W * 1.7, H * 0.2) }],
                { duration: 320, easing: 'ease-in', fill: 'forwards' });
        };
        if (vote === 'yes') {
            // 2. Il arme… se retient, respire, pose la raquette et va boire un coup.
            at(2850, () => { setRage(100, '9 000 %'); layer.classList.add('is-maxed'); court.classList.add('is-gone'); say('JE VAIS LA CASSER…'); shakePage(5, 420); raise(...hit); });
            at(3170, () => racket.classList.add('is-trembling'));
            const beer = emoji('beer', 'rage-beer');
            const ring = document.createElement('span');
            ring.className = 'rage-breath';
            at(3380, () => layer.append(ring));
            at(3440, () => { layer.classList.remove('is-maxed'); ring.classList.add('is-in'); setFace('angry'); say('Inspire…'); setRage(58); });
            at(4050, () => { ring.classList.remove('is-in'); setFace('exhale'); say('Expire…'); setRage(16); lowerRacket(); });
            at(4600, () => {
                ring.remove();
                setRage(0);
                layer.classList.add('is-zen');
                setFace('relieved');
                say('Bon. Je vais boire un coup.');
                layer.append(beer);
            });
            at(5350, () => {
                const b = beer.getBoundingClientRect();
                const f = face.getBoundingClientRect();
                const dx = Math.min(f.right + b.width * 0.2, W - b.width * 0.34) - (b.left + b.width / 2);
                const dy = f.top + f.height / 2 - (b.top + b.height / 2);
                beer.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(0.6) rotate(-12deg)` }],
                    { duration: 380, easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)', fill: 'forwards' });
            });
            cardAt = 5450;
        } else if (vote === 'maybe') {
            // 2. Il arme, stoppe trop tard : l'écran se fêle juste un peu.
            at(2850, () => { setRage(100, '9 000 %'); layer.classList.add('is-maxed'); court.classList.add('is-gone'); say('JE LA CASSE OU PAS ?'); raise(...hit); });
            at(3170, () => racket.classList.add('is-trembling'));
            at(3850, () => {
                racket.classList.remove('is-trembling');
                racket.animate([{ transform: aimed(...hit, 58, W * 0.2, -H * 0.05) }, { transform: aimed(...hit, -14) }],
                    { duration: 130, easing: 'cubic-bezier(0.7, 0, 1, 0.6)', fill: 'forwards' });
            });
            at(3985, () => { layer.classList.remove('is-maxed'); rageCracks(layer, ...hit, true); shakePage(3, 180); setFace('exhale'); say('…oups.'); setRage(62); });
            at(4700, () => racket.animate([{ transform: aimed(...hit, -14) }, { transform: aimed(...hit, 95, W * 1.7, H * 0.2) }],
                { duration: 340, easing: 'ease-in', fill: 'forwards' }));
            cardAt = 5000;
        } else {
            // 2. Il frappe sa propre cheville. CLONK.
            const foot = emoji('foot', 'rage-foot');
            layer.append(foot);
            at(2950, () => { setRage(100, '9 000 %'); layer.classList.add('is-maxed'); court.classList.add('is-gone'); foot.classList.add('is-in'); say('RAAAH !!!'); });
            const hitPoint = () => [W / 2 - foot.offsetWidth * 0.08, foot.offsetTop + foot.offsetHeight * 0.3];
            at(3100, () => raise(...hitPoint()));
            at(3600, () => slam(...hitPoint(), () => {
                layer.classList.add('is-flash');
                foot.classList.add('is-hit');
                const clonk = document.createElement('span');
                clonk.className = 'rage-clonk';
                clonk.textContent = 'CLONK !';
                layer.append(clonk);
                shakePage(9, 420);
                setFace('pleading');
                say('AÏE AÏE AÏE !');
            }));
            at(4300, () => {
                const bandage = emoji('bandage', 'rage-bandage');
                bandage.style.left = W / 2 + 'px';
                bandage.style.top = foot.offsetTop + foot.offsetHeight * 0.34 + 'px';
                layer.append(bandage);
            });
            cardAt = 5000;
        }

        at(cardAt, showCard);
        leave(cardAt + 3100);
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
            icon: 'train',
            badge: 'train',
            live: {
                yes: 'Le train de Brieuc entre en gare.',
                maybe: 'Le train de Brieuc est annoncé en retard.',
                no: 'Le train de Brieuc est supprimé.',
            },
        },
        roman: {
            celebrate: celebrateRoman,
            icon: 'car',
            badge: 'car',
            live: {
                yes: 'Le taxi Roman est en route.',
                maybe: 'Le taxi Roman hésite à démarrer.',
                no: 'Taxi Roman hors service ce soir.',
            },
        },
        olivier: {
            celebrate: celebrateOlivier,
            icon: 'mountain',
            badge: 'mountain',
            live: {
                yes: 'Olivier a pris le sentier du bar.',
                maybe: 'Olivier consulte la météo en montagne.',
                no: 'Olivier part bivouaquer.',
            },
        },
        thibaut: {
            celebrate: celebrateThibaut,
            icon: 'grinning-cat',
            badge: 'grinning-cat',
            live: {
                yes: 'Thibaut prend le micro !',
                maybe: 'Thibaut réfléchit à son coup…',
                no: 'Thibaut rentre voir ses chats.',
            },
        },
        alex: {
            celebrate: celebrateAlex,
            icon: 'rage',
            badge: 'rage',
            live: {
                yes: 'Alex vient décompresser au bar.',
                maybe: 'Alex hésite (planquez les raquettes).',
                no: 'Alex rentre soigner sa cheville.',
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

    // Surnoms et noms de famille reconnus n'importe où dans le nom saisi (« O. Roques », « Oliv »…).
    const ALIASES = {
        max : 'maxime', maxime: 'maxime', maxou: 'maxime',
        olivier: 'olivier', oliv: 'olivier', roques: 'olivier', oli : 'olivier',
        alex: 'alex', alexandre: 'alex',
        thib: 'thibaut', thibs: 'thibaut', thibault: 'thibaut', thibaud: 'thibaut',
    };

    function findPerson(name) {
        const key = firstNameKey(name);
        if (PEOPLE[key]) return PEOPLE[key];
        const words = String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z]+/);
        const alias = words.map((word) => ALIASES[word]).find(Boolean);
        return alias ? PEOPLE[alias] : null;
    }

    // Chaque scène ajoute un calque à la page puis le retire à la fin (ou quand on la passe) :
    // celebrate() renvoie une promesse résolue à ce moment-là, pour que la bulle « C'est noté » attende.
    function untilRemoved(layer) {
        return new Promise((resolve) => {
            if (!layer?.isConnected) return resolve();
            const done = () => { observer.disconnect(); clearTimeout(safety); resolve(); };
            const observer = new MutationObserver(() => { if (!layer.isConnected) done(); });
            observer.observe(document.body, { childList: true });
            const safety = setTimeout(done, 20000); // au cas où
        });
    }

    // Un tap n'importe où (ou Échap) coupe la scène. Le tap est absorbé : il n'active rien sous l'animation.
    function allowSkip(layer) {
        if (!layer?.isConnected) return () => {};
        const startedAt = performance.now();
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'scene-skip';
        button.textContent = 'Passer la scène';
        layer.append(button);

        let skipped = false;
        const skip = () => {
            if (skipped || !layer.isConnected) return;
            skipped = true;
            // Le site reprend sa place tout de suite s'il était en train de trembler.
            for (const block of document.querySelectorAll('body > header, body > main')) {
                block.getAnimations().forEach((animation) => {
                    if (!(animation instanceof CSSAnimation) && !(animation instanceof CSSTransition)) animation.cancel();
                });
            }
            if (reduceMotion) return layer.remove();
            layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' })
                .finished.finally(() => layer.remove());
        };
        const onClick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (performance.now() - startedAt >= 350) skip(); // évite qu'un double tap sur « valider » coupe la scène
        };
        const onKey = (event) => { if (event.key === 'Escape') skip(); };
        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKey);
        };
    }

    window.leDernierSetSpecial = {
        find(name) {
            const person = findPerson(name);
            if (!person) return null;
            return {
                ...person,
                celebrate(vote) {
                    const before = new Set(document.body.children);
                    person.celebrate(vote);
                    const layer = [...document.body.children].find((el) => !before.has(el));
                    const stopSkip = allowSkip(layer);
                    return untilRemoved(layer).then(stopSkip);
                },
            };
        },
    };
})();
