# Le Dernier Set — projet pour VS Code

Export de la version 8, commit 2a20d97e1073e4dac59a9246b070701c9cce5e7a.
Site d’origine : https://le-dernier-set-gsl.sproutingatlas1.chatgpt.site

## Ouvrir

1. Décompresse l’archive.
2. Dans VS Code : Fichier > Ouvrir le dossier, puis choisis `le-dernier-set`.
3. Ouvre `index.html` dans ton navigateur pour un aperçu rapide.

Pour un serveur local si Python est installé, dans le terminal de VS Code :

```powershell
py -m http.server 5500
```

Sur macOS/Linux : `python3 -m http.server 5500`.
Ouvre ensuite http://localhost:5500. Arrêt du serveur : Ctrl+C.
Après une modification, enregistre puis recharge la page.

## Les fichiers

- `index.html` : structure et textes.
- `styles.css` : base historique conservée, non chargée par la page.
- `custom.css` : feuille active du site ; effectuer les modifications de design ici.
- `app.js` : configuration et textes, état de la session, lecture du stockage local, formulaire, affichage des résultats, animations, événements et démarrage.

Pour la mise en forme du code dans VS Code : Maj+Alt+F sous Windows.
Pour modifier le design, cherche la règle du composant dans `custom.css` et ajuste ses valeurs directement. Évite d’ajouter une seconde règle pour le même élément en fin de fichier. Les variantes (sélection, survol, focus) et les adaptations aux petits écrans restent distinctes.

Dans `app.js`, les sections numérotées indiquent le rôle de chaque bloc. Les textes et participants fictifs sont définis en haut. `render()` coordonne l’affichage des compteurs, des participants, des résultats des bars et des boutons ; `init()` restaure le formulaire et branche les événements.

## Sélecteurs utiles

```css
/* Les trois choix */
.vote-card .choices { }
.vote-card .choice { }
.vote-card .choice[aria-pressed="true"] { }
.vote-card .choice span { } /* Emoji */

/* Les titres, puis l’italique */
.layout h2 { }
.layout h2 em { }

/* Participants et bloc des bars */
.crew-card .person { }
.crew-card .location { }
```

Modifie les règles correspondantes dans `custom.css`. Ne vide pas ce fichier : il contient le design de référence et l’échelle typographique actuelle.
Pour pouvoir conserver plusieurs versions de ton travail, tu peux initialiser ton propre dépôt Git dans ce dossier.

## Données et publication

Cette version reste une démo : les votes sont enregistrés dans le navigateur, par jeudi. Ils ne sont pas synchronisés entre les personnes, ni entre ton site local et le site en ligne.
Le bouton « Voir avec des exemples » affiche des personnes fictives.
Choisir « Je rentre » ouvre une fenêtre de confirmation avec sept motifs facultatifs. Le motif retenu et une réplique s’affichent dans « Le canapé a gagné ». Le bouton « Finalement, je viens » ramène au formulaire : il faut choisir un bar et confirmer pour mettre à jour la réponse enregistrée. Le mode exemples montre les sept motifs et le cas sans motif.
Aucune installation npm n’est nécessaire. Aucun serveur métier ou service externe n’est inclus.
Modifier ce dossier ne modifie pas automatiquement le site publié.
Pour mettre tes retouches en ligne sur le site existant, renvoie `custom.css` à ChatGPT si tu n’as changé que ce fichier ; sinon renvoie le dossier complet en ZIP. Précise de mettre à jour le site existant.
