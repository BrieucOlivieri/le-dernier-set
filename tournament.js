// Easter egg : le code Konami lance le « mode tournoi », une retransmission télé
// d'un match de bad entre les deux bars (pour rire, ça ne compte pas pour le vote).
// Clavier : ↑ ↑ ↓ ↓ ← → ← → B A. Téléphone : glisser ↑ ↑ ↓ ↓ ← → ← →, puis taper deux fois.
(() => {
    'use strict';

    // 1. Réglages et textes
    const WINNING_SCORE = 3;
    const SOUND_KEY = 'le-dernier-set:tournament-sound';
    const TEAMS = {
        pavane: { name: 'La Pavane', logo: 'assets/pavane.webp' },
        bryans: { name: 'Le Bryan’s', logo: 'assets/bryans.jpg' },
    };
    const HIT_LINES = [
        'Quel revers !',
        'Joli dégagé !',
        'Amorti tout en finesse !',
        'Quelle couverture de terrain !',
        'Le volant n’a bientôt plus de plumes !',
        'Échange de folie !',
        'Le barman a arrêté de servir pour regarder !',
        'On n’a jamais vu ça un jeudi !',
        'Le public retient sa bière !',
    ];
    const SMASH_LINES = ['SMASH !', 'BOOM !', 'Volant pulvérisé !', 'Le filet en tremble encore !'];
    const HIT_SOUNDS = ['TCHAK !', 'POC !', 'FLAP !'];
    const POINT_SHOUTS = ['SMASH !', 'BOOM !', 'IMPARABLE !', 'QUEL POINT !'];
    const CROWD = ['clap', 'cheer', 'beer', 'megaphone', 'party', 'clap', 'cheer', 'beers'];
    const KONAMI_KEYS = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    const KONAMI_SWIPES = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'tap', 'tap'];

    // Vrais sons de bad (Freesound, CC0, voir assets/sounds/README.md). Chargés au lancement du tournoi ;
    // en attendant (ou si un fichier manque), des sons de synthèse prennent le relais.
    const SAMPLES = {
        hit: ['hit-1.wav', 'hit-2.wav', 'hit-3.wav', 'hit-4.wav', 'hit-5.wav', 'hit-6.wav'],
        smash: ['smash-1.wav', 'smash-2.wav'],
        whistle: ['whistle.wav'],
        cheer: ['cheer.mp3'],
        ovation: ['ovation.mp3'],
    };

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let match = null; // partie en cours : { root, running, audio, score… }

    function emoji(name, className) {
        const image = document.createElement('img');
        image.src = 'assets/emoji/' + name + '.svg';
        image.alt = '';
        if (className) image.className = className;
        return image;
    }

    // 2. Son généré par le navigateur (Web Audio), sans fichier
    function soundOn() {
        try {
            return localStorage.getItem(SOUND_KEY) !== 'off';
        } catch {
            return true;
        }
    }

    function createAudio() {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return null;
        const ctx = new Context();
        const master = ctx.createGain();
        master.gain.value = soundOn() ? 0.7 : 0;
        master.connect(ctx.destination);
        const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        return { ctx, master, noise };
    }

    async function loadSamples(audio) {
        if (!audio) return;
        audio.samples = {};
        await Promise.all(
            Object.entries(SAMPLES).map(async ([kind, files]) => {
                const buffers = await Promise.all(
                    files.map(async (file) => {
                        try {
                            const response = await fetch('assets/sounds/' + file);
                            return await audio.ctx.decodeAudioData(await response.arrayBuffer());
                        } catch {
                            return null;
                        }
                    }),
                );
                audio.samples[kind] = buffers.filter(Boolean);
            }),
        );
    }

    // Joue un vrai son ; renvoie false s'il n'est pas (encore) disponible.
    function playSample(audio, kind, { volume = 1, at = 0, rate } = {}) {
        const list = audio?.samples?.[kind];
        if (!list?.length) return false;
        const { ctx, master } = audio;
        const source = ctx.createBufferSource();
        source.buffer = pick(list);
        source.playbackRate.value = rate ?? 0.94 + Math.random() * 0.12; // jamais deux frappes identiques
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain).connect(master);
        source.start(ctx.currentTime + at);
        return true;
    }

    function playNoise(audio, { at = 0, duration, type = 'bandpass', frequency, q = 1, volume, attack = 0.005 }) {
        const { ctx, master, noise } = audio;
        const start = ctx.currentTime + at;
        const source = ctx.createBufferSource();
        source.buffer = noise;
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = frequency;
        filter.Q.value = q;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        source.connect(filter).connect(gain).connect(master);
        source.start(start, Math.random());
        source.stop(start + duration + 0.05);
    }

    function playTone(audio, { at = 0, duration, frequency, endFrequency, volume, type = 'sine' }) {
        const { ctx, master } = audio;
        const start = ctx.currentTime + at;
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, start);
        if (endFrequency) osc.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain).connect(master);
        osc.start(start);
        osc.stop(start + duration + 0.05);
    }

    const sounds = {
        whistle(audio, long = false) {
            if (!audio) return;
            if (playSample(audio, 'whistle', { volume: 0.55, rate: 1 })) {
                if (long) playSample(audio, 'whistle', { volume: 0.6, at: 1, rate: 0.97 }); // fin de match : deux coups
                return;
            }
            const { ctx, master } = audio;
            const blasts = long ? [[0, 0.25], [0.35, 0.9]] : [[0, 0.18], [0.26, 0.32]];
            for (const [at, duration] of blasts) {
                const start = ctx.currentTime + at;
                const osc = ctx.createOscillator();
                osc.frequency.value = 2900;
                const trill = ctx.createOscillator(); // la bille du sifflet
                trill.frequency.value = 32;
                const depth = ctx.createGain();
                depth.gain.value = 140;
                trill.connect(depth).connect(osc.frequency);
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
                gain.gain.setValueAtTime(0.12, start + duration - 0.04);
                gain.gain.linearRampToValueAtTime(0, start + duration);
                osc.connect(gain).connect(master);
                osc.start(start);
                trill.start(start);
                osc.stop(start + duration + 0.05);
                trill.stop(start + duration + 0.05);
            }
        },
        hit(audio) {
            if (!audio) return;
            if (playSample(audio, 'hit', { volume: 0.9 })) return;
            playNoise(audio, { duration: 0.07, frequency: 2200, q: 1.4, volume: 0.5 });
            playTone(audio, { duration: 0.08, frequency: 320, endFrequency: 140, volume: 0.25 });
        },
        smash(audio) {
            if (!audio) return;
            // Un vrai smash, plus une basse sourde pour l'effet « télé ».
            if (!playSample(audio, 'smash', { volume: 1, rate: 0.9 + Math.random() * 0.08 })) {
                playNoise(audio, { duration: 0.12, frequency: 1600, q: 0.8, volume: 0.8 });
            }
            playTone(audio, { duration: 0.45, frequency: 120, endFrequency: 45, volume: 0.35 });
        },
        cheer(audio, big = false) {
            if (!audio) return;
            if (playSample(audio, big ? 'ovation' : 'cheer', { volume: big ? 0.75 : 0.6, rate: 1 })) return;
            const length = big ? 2.8 : 1.6;
            playNoise(audio, { duration: length, frequency: 1000, q: 0.4, volume: big ? 0.32 : 0.22, attack: 0.25 });
            for (let i = 0; i < (big ? 26 : 14); i++) {
                // Applaudissements : petits claquements au hasard dans la clameur.
                playNoise(audio, { at: Math.random() * length * 0.8, duration: 0.03, type: 'highpass', frequency: 2500, volume: 0.18 });
            }
        },
    };

    // 3. Mise en scène
    function buildStage() {
        const root = document.createElement('div');
        root.className = 'tournoi';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-label', 'Mode tournoi');
        root.innerHTML = `
            <div class="t-lights" aria-hidden="true"><span></span><span></span></div>
            <div class="t-court" aria-hidden="true"><div class="t-court-lines"></div></div>
            <div class="t-net" aria-hidden="true"></div>
            <div class="t-live"><span class="t-live-dot"></span>En direct · Tournoi du jeudi</div>
            <div class="t-score" aria-live="polite">
                <div class="t-team" data-team="pavane"><img src="${TEAMS.pavane.logo}" alt="" /><span>${TEAMS.pavane.name}</span><b>0</b></div>
                <span class="t-sep">–</span>
                <div class="t-team" data-team="bryans"><b>0</b><span>${TEAMS.bryans.name}</span><img src="${TEAMS.bryans.logo}" alt="" /></div>
            </div>
            <div class="t-controls">
                <button class="t-sound" type="button"></button>
                <button class="t-quit" type="button">Quitter le tournoi</button>
            </div>
            <div class="t-comment" aria-live="polite"><span class="t-comment-text"></span></div>
            <div class="t-crowd" aria-hidden="true"></div>`;
        root.querySelector('.t-comment').prepend(emoji('mic', 't-comment-mic'));
        const players = {};
        for (const team of Object.keys(TEAMS)) {
            const racket = emoji('badminton', 't-player t-player-' + team);
            root.append(racket);
            players[team] = racket;
        }
        const crowd = root.querySelector('.t-crowd');
        const seats = innerWidth < 600 ? 8 : 14;
        for (let i = 0; i < seats; i++) {
            const fan = emoji(CROWD[i % CROWD.length], 't-fan');
            fan.style.animationDelay = (i * 0.07).toFixed(2) + 's';
            crowd.append(fan);
        }
        document.body.append(root);
        return { root, players };
    }

    function renderSoundButton() {
        const on = match?.soundOn;
        const button = match?.root.querySelector('.t-sound');
        if (!button) return;
        button.textContent = on ? '🔊 Son' : '🔇 Muet';
        button.setAttribute('aria-pressed', String(!on));
        button.setAttribute('aria-label', on ? 'Couper le son' : 'Remettre le son');
    }

    function toggleSound() {
        if (!match) return;
        match.soundOn = !match.soundOn;
        try {
            localStorage.setItem(SOUND_KEY, match.soundOn ? 'on' : 'off');
        } catch {
            // Préférence non gardée : tant pis.
        }
        if (match.audio) match.audio.master.gain.value = match.soundOn ? 0.7 : 0;
        renderSoundButton();
    }

    function comment(text) {
        if (!match) return;
        const target = match.root.querySelector('.t-comment-text');
        clearInterval(match.typing);
        target.textContent = '';
        if (reduceMotion) {
            target.textContent = text;
            return;
        }
        let shown = 0;
        match.typing = setInterval(() => {
            target.textContent = text.slice(0, ++shown);
            if (shown >= text.length) clearInterval(match.typing);
        }, 22);
    }

    // Grand texte au centre de l'écran (« SMASH ! », « BALLE DE MATCH »…).
    function shout(text, tone = '') {
        if (!match) return;
        const banner = document.createElement('div');
        banner.className = 't-shout ' + tone;
        banner.textContent = text;
        match.root.append(banner);
        setTimeout(() => banner.remove(), 1400);
    }

    function burst(text, x, y) {
        if (!match || reduceMotion) return;
        const pop = document.createElement('span');
        pop.className = 't-burst';
        pop.textContent = text;
        pop.style.left = x + 'px';
        pop.style.top = y + 'px';
        pop.style.rotate = (Math.random() * 30 - 15).toFixed(0) + 'deg';
        match.root.append(pop);
        setTimeout(() => pop.remove(), 700);
    }

    function restart(element, className) {
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
    }

    // Positions du terrain, recalculées à chaque coup (l'écran a pu tourner).
    function geometry() {
        const w = innerWidth;
        const h = innerHeight;
        return {
            pavane: { x: w * 0.13, y: h * 0.58 },
            bryans: { x: w * 0.87, y: h * 0.58 },
            netTop: h * 0.6,
            floor: h * 0.8,
            w,
            h,
        };
    }

    function swing(team) {
        const racket = match.players[team];
        racket.animate(
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-55deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(0deg)' }],
            { duration: 320, easing: 'ease-out' },
        );
    }

    // Vol du volant (courbe de Bézier), bouchon devant. Renvoie une promesse.
    function fly(from, to, control, duration) {
        const shuttle = match.shuttle;
        const point = (t, axis) => (1 - t) ** 2 * from[axis] + 2 * (1 - t) * t * control[axis] + t ** 2 * to[axis];
        const angle = (t) => {
            const dx = 2 * (1 - t) * (control.x - from.x) + 2 * t * (to.x - control.x);
            const dy = 2 * (1 - t) * (control.y - from.y) + 2 * t * (to.y - control.y);
            return (Math.atan2(dy, dx) * 180) / Math.PI;
        };
        const size = shuttle.offsetWidth || 40;
        const frames = [];
        for (let step = 0; step <= 20; step++) {
            const t = step / 20;
            frames.push({
                transform: `translate(${point(t, 'x') - size / 2}px, ${point(t, 'y') - size / 2}px) rotate(${angle(t)}deg)`,
            });
        }
        return shuttle.animate(frames, { duration, easing: 'linear', fill: 'forwards' }).finished.catch(() => {});
    }

    function updateScore(team) {
        const cell = match.root.querySelector(`.t-team[data-team="${team}"]`);
        cell.querySelector('b').textContent = match.score[team];
        restart(cell, 'is-scoring');
    }

    function rainMugs() {
        if (reduceMotion || !match) return;
        for (let i = 0; i < (innerWidth < 600 ? 18 : 32); i++) {
            const size = 30 + Math.random() * 26;
            const mug = emoji(i % 4 === 0 ? 'party' : 'beer', 't-drop');
            mug.style.width = mug.style.height = size + 'px';
            mug.style.left = Math.random() * (innerWidth - size) + 'px';
            match.root.append(mug);
            mug.animate(
                [
                    { transform: `translateY(-${size + 20}px) rotate(0deg)` },
                    { transform: `translateY(${innerHeight + 40}px) rotate(${(Math.random() - 0.5) * 120}deg)` },
                ],
                { duration: 1800 + Math.random() * 1200, delay: Math.random() * 900, easing: 'cubic-bezier(.45,.05,.7,.4)', fill: 'both' },
            );
        }
    }

    // 4. Déroulé du match
    async function playPoint(m, server) {
        const g = geometry();
        const other = (team) => (team === 'pavane' ? 'bryans' : 'pavane');
        const hits = 2 + Math.floor(Math.random() * 3);
        let hitter = server;
        for (let n = 1; n <= hits; n++) {
            if (!m.running) return null;
            const isSmash = n === hits;
            const from = g[hitter];
            const receiver = other(hitter);
            swing(hitter);
            sounds[isSmash ? 'smash' : 'hit'](match.audio);
            burst(isSmash ? 'SMASH !' : pick(HIT_SOUNDS), from.x, from.y - 70);
            if (n === 1 || isSmash) comment(isSmash ? pick(SMASH_LINES) : pick(HIT_LINES));
            if (isSmash) {
                // Smash : le volant plonge sur le terrain adverse.
                const landX = receiver === 'bryans' ? g.w * (0.6 + Math.random() * 0.2) : g.w * (0.2 + Math.random() * 0.2);
                const start = { x: from.x, y: from.y - 30 };
                const land = { x: landX, y: g.floor };
                await fly(start, land, { x: start.x + (land.x - start.x) * 0.25, y: start.y - 40 }, reduceMotion ? 0 : 420);
            } else {
                const to = g[receiver];
                const apex = g.netTop - g.h * (0.25 + Math.random() * 0.15);
                await fly(from, to, { x: (from.x + to.x) / 2, y: apex }, reduceMotion ? 0 : 640 + Math.random() * 200);
            }
            hitter = receiver;
        }
        return other(hitter); // le dernier à avoir frappé (le smasheur) marque
    }

    async function runMatch() {
        const m = match; // cette partie-là, même si on en relance une autre entre-temps
        // Laisse au plus 1,2 s aux vrais sons pour se charger avant le coup d'envoi.
        await Promise.race([m.samplesReady, sleep(1200)]);
        if (!m.running) return;
        sounds.whistle(m.audio);
        shout('MODE TOURNOI', 'is-huge');
        comment('Mesdames et messieurs, bienvenue au tournoi du jeudi !');
        await sleep(2000);
        if (!m.running) return;
        comment('La Pavane contre Le Bryan’s. Premier à ' + WINNING_SCORE + ' points. Service !');
        await sleep(900);
        let server = Math.random() < 0.5 ? 'pavane' : 'bryans';
        while (m.running && Math.max(m.score.pavane, m.score.bryans) < WINNING_SCORE) {
            const winner = await playPoint(m, server);
            if (!winner || !m.running) return;
            match.score[winner]++;
            updateScore(winner);
            if (!reduceMotion) restart(match.root, 'is-shaking');
            restart(match.root.querySelector('.t-crowd'), 'is-ola');
            sounds.cheer(match.audio);
            const { pavane, bryans } = match.score;
            const lead = Math.max(pavane, bryans);
            if (lead === WINNING_SCORE - 1 && pavane !== bryans) {
                shout('BALLE DE MATCH', 'is-gold');
                comment('Balle de match pour ' + TEAMS[pavane > bryans ? 'pavane' : 'bryans'].name + ' ! ' + pavane + '–' + bryans);
            } else if (lead < WINNING_SCORE) {
                shout(pick(POINT_SHOUTS));
                comment('Point pour ' + TEAMS[winner].name + ' ! ' + pavane + '–' + bryans);
            }
            server = winner;
            await sleep(1300);
        }
        if (m.running) await finale(m);
    }

    async function finale(m) {
        const champion = match.score.pavane > match.score.bryans ? 'pavane' : 'bryans';
        sounds.whistle(match.audio, true);
        sounds.cheer(match.audio, true);
        match.shuttle.style.visibility = 'hidden';
        shout('JEU, SET ET MATCH !', 'is-huge');
        comment(TEAMS[champion].name + ' remporte le tournoi du jeudi ! (Ça ne compte toujours pas pour le vote.)');
        const card = document.createElement('div');
        card.className = 't-champion';
        card.innerHTML = `<img src="${TEAMS[champion].logo}" alt="" /><strong>${TEAMS[champion].name}</strong><span>Champion du jeudi</span>`;
        match.root.append(card);
        restart(match.root.querySelector('.t-crowd'), 'is-ola');
        rainMugs();
        await sleep(5500);
        if (match === m) stopTournament();
    }

    function startTournament() {
        if (match) return;
        const { root, players } = buildStage();
        const shuttle = emoji('shuttle', 't-shuttle');
        root.append(shuttle);
        match = {
            root,
            players,
            shuttle,
            running: true,
            soundOn: soundOn(),
            audio: createAudio(),
            score: { pavane: 0, bryans: 0 },
            typing: null,
        };
        match.samplesReady = loadSamples(match.audio);
        renderSoundButton();
        root.querySelector('.t-sound').addEventListener('click', toggleSound);
        root.querySelector('.t-quit').addEventListener('click', stopTournament);
        document.addEventListener('keydown', onEscape);
        root.querySelector('.t-quit').focus({ preventScroll: true });
        // Volant posé devant le serveur en attendant le premier coup.
        const g = geometry();
        shuttle.style.transform = `translate(${g.w / 2 - 20}px, ${g.floor - 20}px)`;
        runMatch();
    }

    function stopTournament() {
        if (!match) return;
        const ending = match;
        match = null;
        ending.running = false;
        clearInterval(ending.typing);
        document.removeEventListener('keydown', onEscape);
        ending.root.classList.add('is-leaving');
        setTimeout(() => {
            ending.root.remove();
            ending.audio?.ctx.close().catch(() => {});
        }, 450);
    }

    function onEscape(event) {
        if (event.key === 'Escape') stopTournament();
    }

    // 5. Détection du code Konami (clavier et gestes)
    let progress = 0;

    function advance(input, sequence) {
        if (match) return;
        if (input === sequence[progress]) {
            progress++;
            if (progress === sequence.length) {
                progress = 0;
                startTournament();
            }
        } else {
            progress = input === sequence[0] ? 1 : 0;
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.target.closest?.('input, textarea')) return; // on tape son prénom, pas un code
        advance(event.key.toLowerCase(), KONAMI_KEYS);
    });

    // Au doigt, tous les gestes comptent, même commencés sur le champ prénom : en faisant défiler
    // la page, le doigt se pose souvent dessus. Si le navigateur reprend la main pour défiler
    // (touchcancel au lieu de touchend), on calcule le geste depuis la dernière position connue.
    let touchStart = null;
    let touchLast = null;
    const point = (touch) => ({ x: touch.clientX, y: touch.clientY });
    document.addEventListener(
        'touchstart',
        (event) => {
            if (event.touches.length > 1) {
                touchStart = null; // zoom à deux doigts : pas un geste du code
                return;
            }
            touchStart = touchLast = point(event.changedTouches[0]);
        },
        { passive: true },
    );
    document.addEventListener(
        'touchmove',
        (event) => {
            if (touchStart) touchLast = point(event.changedTouches[0]);
        },
        { passive: true },
    );
    const finishGesture = (end) => {
        if (!touchStart) return;
        const dx = end.x - touchStart.x;
        const dy = end.y - touchStart.y;
        touchStart = null;
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        let gesture = 'tap';
        if (distance > 40) {
            gesture = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        } else if (distance > 12) {
            return; // geste trop court : ni balayage, ni tap
        }
        advance(gesture, KONAMI_SWIPES);
    };
    document.addEventListener('touchend', (event) => finishGesture(point(event.changedTouches[0])), { passive: true });
    document.addEventListener('touchcancel', () => touchLast && finishGesture(touchLast), { passive: true });

    // Pour tester depuis la console : leDernierSetTournoi()
    window.leDernierSetTournoi = startTournament;
})();
