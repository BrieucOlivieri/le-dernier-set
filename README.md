# Le Dernier Set

Site statique du rendez-vous badminton du jeudi. La version 1 fonctionne avec HTML, CSS et JavaScript natif ; aucun build ni paquet npm n'est nécessaire.

## Fichiers du site

- `index.html` : contenu et structure.
- `custom.css` : styles et adaptations aux écrans.
- `app.js` : date, formulaire, affichage et animations.
- `special-names.js` : animations dédiées à certains prénoms quand la personne vote (Naya : éruption du Piton de la Fournaise et drapeau réunionnais ; Maxime : vétéran sépia, chargement poussif et médaille ; Roman : « Taxi Roman », le chauffeur du club qui embarque les copains au bar ; Olivier (ou Roques) : rando en lacets jusqu'au sommet, panneau de sentier et bivouac ; Thibaut (ou Thib, Thibs) : blind test, puis karaoké, échecs ou chats selon la réponse ; Brieuc : vue depuis le train, arrivée directement dans la pinte et billet composté). Ajouter un prénom : une entrée dans `PEOPLE`.
- `tournament.js` : easter egg « mode tournoi », lancé par le code Konami (clavier : ↑ ↑ ↓ ↓ ← → ← → B A ; téléphone : glisser ↑ ↑ ↓ ↓ ← → ← → puis taper deux fois). Depuis la console : `leDernierSetTournoi()`.
- `vote-store.js` : connexion Supabase et lecture/écriture des votes partagés.
- `config.js` : URL du projet Supabase et clé publiable utilisées par le navigateur.
- `supabase/001_weekly_votes.sql` : table et règles d'accès à appliquer dans Supabase.
- `supabase/002_vote_rollover_2300.sql` : passage au jeudi suivant dès 23 h, heure de Paris.
- `supabase/003_any_venue.sql` : choix « Peu importe » pour les deux bars.
- `supabase/004_optional_maybe_venue.sql` : bar facultatif pour « Peut-être ».
- `supabase/005_realtime_votes.sql` : votes diffusés en direct (Supabase Realtime).
- `supabase/006_more_reasons.sql` : motifs « Tournoi demain » et « Il pleut » pour « Je rentre ».
- `assets/` : images des bars et `og-image.png` (aperçu 1200×630 affiché quand le lien est partagé ; incrémenter `?v=` dans `index.html` quand on la change).
- `assets/emoji/` : emojis en SVG (Fluent Emoji de Microsoft, licence MIT, style Windows 11) pour un rendu identique sur tous les appareils.
- `assets/sounds/` : vrais sons de bad du mode tournoi (Freesound, CC0, crédits dans son README).

Pour modifier un composant, ajuste sa règle existante dans `custom.css`. Les sections numérotées de `app.js` regroupent la configuration, le stockage, le formulaire et le rendu.

## Tester en local

Pour un essai rapide dans Chrome, ouvre `index.html`. Pour tester dans les mêmes conditions qu'un site publié, sers le dossier en HTTP. Si Python est installé :

```powershell
py -m http.server 5500
```

Puis ouvre http://localhost:5500.

Un aperçu en `file://` a fonctionné dans Chrome, mais un serveur HTTP local est plus fiable pour comparer plusieurs navigateurs.

Pour tester seul, ouvre l'adresse dans une fenêtre normale et une fenêtre privée. Vote dans la première, puis actualise les votes dans la seconde : les deux fenêtres doivent montrer le même résultat. Chaque fenêtre possède sa propre identité anonyme, donc elle peut modifier uniquement sa réponse. Vérifie aussi les trois choix, la confirmation « Je rentre » et le retrait d'un vote.

Pour tester avec quelqu'un à distance, partage l'adresse publique ci-dessous. Un lien `localhost` ne fonctionne que sur ton ordinateur.

## Données

Le site affiche les votes communs du jeudi courant ou à venir. Chaque jeudi à 23 h, heure de Paris, il passe automatiquement au jeudi suivant : les anciens votes restent enregistrés sous leur date, mais disparaissent du nouveau vote. Les joueurs n'ont pas de compte à créer : Supabase leur attribue une identité anonyme dans leur navigateur. Chacun peut modifier ou retirer son vote depuis ce navigateur. Une même personne peut voter de nouveau avec un autre navigateur ou après avoir effacé ses données. Les prénoms et motifs du jeudi affiché sont visibles par tous ceux qui accèdent au site. Les anciennes réponses locales de la démo ne sont pas importées.

## Configuration Supabase

Le projet « Bar Jeudi ? » est configuré dans `config.js`. Les connexions anonymes sont activées. Appliquer les migrations `supabase/001_weekly_votes.sql`, `supabase/002_vote_rollover_2300.sql`, `supabase/003_any_venue.sql`, `supabase/004_optional_maybe_venue.sql`, `supabase/005_realtime_votes.sql`, puis `supabase/006_more_reasons.sql` dans cet ordre dans l'éditeur SQL. Le choix « Peu importe » compte comme partant, sans ajouter de point à l'un des bars. Le bar est obligatoire pour « Je viens » et facultatif pour « Peut-être » ; les « Peut-être » ne comptent jamais dans le match des bars. Avec la migration 005, les votes des autres apparaissent en direct ; sans elle, la page se met à jour toutes les 30 secondes quand elle est visible. Le compte à rebours vise jeudi 20 h (`MEETUP_HOUR` dans `app.js`). Le fichier de configuration du navigateur contient uniquement la clé **publishable** ; n'y ajoute jamais une clé **secret** ou `service_role`.

Si Supabase est inaccessible, le site affiche une erreur et n'enregistre pas de faux vote en ligne. Le bouton « Actualiser les votes » permet de réessayer.

## Mise en ligne

Le lien à partager est **https://brieucolivieri.github.io/le-dernier-set/**. GitHub Pages publie la branche `main` depuis la racine du dépôt ; `.nojekyll` sert directement les fichiers statiques. Le dossier `supabase/` contient la migration de la base et n'est pas utilisé par la page publiée.

L'ancien hébergement Sites reste configuré dans `.openai/hosting.json`, mais GitHub Pages est désormais l'adresse principale.
