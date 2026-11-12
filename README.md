# Le Dernier Set

Site statique du rendez-vous badminton du jeudi. La version 1 fonctionne avec HTML, CSS et JavaScript natif ; aucun build ni paquet npm n'est nécessaire.

## Fichiers du site

- `index.html` : contenu et structure.
- `custom.css` : styles et adaptations aux écrans.
- `app.js` : date, formulaire, affichage et animations.
- `vote-store.js` : connexion Supabase et lecture/écriture des votes partagés.
- `config.js` : URL du projet Supabase et clé publiable ; vide tant que le projet n'est pas créé.
- `supabase/001_weekly_votes.sql` : table et règles d'accès à appliquer dans Supabase.
- `assets/` : images des bars.

Pour modifier un composant, ajuste sa règle existante dans `custom.css`. Les sections numérotées de `app.js` regroupent la configuration, le stockage, le formulaire et le rendu.

## Tester en local

Ouvre `index.html` dans un navigateur. Pour servir le dossier en HTTP si Python est installé :

```powershell
py -m http.server 5500
```

Puis ouvre http://localhost:5500.

Pour tester les votes partagés, utilise une adresse HTTP locale comme celle-ci ou l'aperçu d'un hébergeur ; évite d'ouvrir le fichier directement avec `file://`.

Vérifie les trois réponses, le choix du bar, la confirmation « Je rentre », le bouton « Finalement, je viens », le mode exemples et l'affichage sur mobile.

## Données

Tant que `config.js` ne contient pas de projet Supabase, le site conserve son mode démonstration : une réponse par jeudi dans le `localStorage` du navigateur et des exemples fictifs facultatifs. Ces anciennes réponses locales ne sont pas transférées automatiquement vers Supabase.

Une fois Supabase connecté, le site affiche les votes communs du jeudi courant ou à venir. Les joueurs n'ont pas de compte à créer : Supabase leur attribue une identité anonyme dans leur navigateur. Chacun peut modifier ou retirer son vote depuis ce navigateur. Une même personne peut voter de nouveau avec un autre navigateur ou après avoir effacé ses données. Les prénoms et motifs du jeudi affiché sont visibles par tous ceux qui accèdent au site.

## Activer les votes partagés

1. Créer un projet Supabase et activer **Authentication > Sign In / Providers > Anonymous Sign-Ins**.
2. Exécuter `supabase/001_weekly_votes.sql` une fois dans l'éditeur SQL du projet.
3. Copier l'URL du projet et sa clé **publishable** (`sb_publishable_...`) dans `config.js`. Ne jamais y mettre une clé **secret** ou `service_role`.
4. Ouvrir la page dans deux navigateurs distincts et vérifier l'ajout, la modification, la suppression et l'actualisation des votes.

Si Supabase est inaccessible, le site affiche une erreur et n'enregistre pas de faux vote en ligne. Le bouton « Actualiser les votes » permet de réessayer.

## Mise en ligne

Publier `index.html`, `custom.css`, `app.js`, `vote-store.js`, `config.js` et le dossier `assets/` sur un hébergement de fichiers statiques. Conserver les chemins relatifs et servir le dossier depuis une même racine. Le dossier `supabase/` sert à configurer la base et n'a pas besoin d'être hébergé. Aucun hébergement n'est configuré ici.
