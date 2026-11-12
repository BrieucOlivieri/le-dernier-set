# Le Dernier Set

Site statique du rendez-vous badminton du jeudi. La version 1 fonctionne avec HTML, CSS et JavaScript natif ; aucun build ni paquet npm n'est nécessaire.

## Fichiers du site

- `index.html` : contenu et structure.
- `custom.css` : styles et adaptations aux écrans.
- `app.js` : date, formulaire, affichage et animations.
- `vote-store.js` : connexion Supabase et lecture/écriture des votes partagés.
- `config.js` : URL du projet Supabase et clé publiable utilisées par le navigateur.
- `supabase/001_weekly_votes.sql` : table et règles d'accès à appliquer dans Supabase.
- `assets/` : images des bars.

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

Le site affiche les votes communs du jeudi courant ou à venir. Les joueurs n'ont pas de compte à créer : Supabase leur attribue une identité anonyme dans leur navigateur. Chacun peut modifier ou retirer son vote depuis ce navigateur. Une même personne peut voter de nouveau avec un autre navigateur ou après avoir effacé ses données. Les prénoms et motifs du jeudi affiché sont visibles par tous ceux qui accèdent au site. Les anciennes réponses locales de la démo ne sont pas importées.

## Configuration Supabase

Le projet « Bar Jeudi ? » est configuré dans `config.js`. Les connexions anonymes sont activées et `supabase/001_weekly_votes.sql` a été appliqué dans l'éditeur SQL. Le fichier de configuration du navigateur contient uniquement la clé **publishable** ; n'y ajoute jamais une clé **secret** ou `service_role`.

Si Supabase est inaccessible, le site affiche une erreur et n'enregistre pas de faux vote en ligne. Le bouton « Actualiser les votes » permet de réessayer.

## Mise en ligne

Le site est publié sur **https://le-dernier-set-gsl.sproutingatlas1.chatgpt.site** via Sites. Son identifiant et son dossier statique sont déclarés dans `.openai/hosting.json`. Le dossier `dist/` est généré pour la publication à partir de `index.html`, `custom.css`, `app.js`, `vote-store.js`, `config.js` et `assets/` ; il est ignoré par le dépôt local. Le dossier `supabase/` sert à configurer la base et n'est pas publié.
