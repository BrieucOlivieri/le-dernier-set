# Le Dernier Set

Site statique du rendez-vous badminton du jeudi. La version 1 fonctionne avec HTML, CSS et JavaScript natif ; aucun build ni paquet npm n'est nécessaire.

## Fichiers du site

- `index.html` : contenu et structure.
- `custom.css` : styles et adaptations aux écrans.
- `app.js` : date, formulaire, votes, affichage et animations.
- `assets/` : images des bars.

Pour modifier un composant, ajuste sa règle existante dans `custom.css`. Les sections numérotées de `app.js` regroupent la configuration, le stockage, le formulaire et le rendu.

## Tester en local

Ouvre `index.html` dans un navigateur. Pour servir le dossier en HTTP si Python est installé :

```powershell
py -m http.server 5500
```

Puis ouvre http://localhost:5500.

Vérifie les trois réponses, le choix du bar, la confirmation « Je rentre », le bouton « Finalement, je viens », le mode exemples et l'affichage sur mobile.

## Données

Une réponse est enregistrée dans le `localStorage` du navigateur pour le jeudi concerné. Les votes des autres personnes ne sont **pas partagés** : chaque navigateur voit seulement sa propre réponse et, si le mode exemples est activé, des participants fictifs. Le site ne comporte ni compte utilisateur ni serveur de données. Le bouton « Retirer ma réponse » efface la réponse locale.

## Mise en ligne

Publier `index.html`, `custom.css`, `app.js` et le dossier `assets/` sur un hébergement de fichiers statiques. Conserver les chemins relatifs et servir le dossier depuis une même racine. Le dépôt Git local garde l'historique des changements ; aucun hébergement ni synchronisation des votes n'est configuré ici.
