# Emojis

SVG issus de [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (Microsoft, style « Color », celui de Windows 11),
distribués sous [licence MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE) :

> Copyright (c) Microsoft Corporation. Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files, to deal in the Software without restriction […].
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

Ils remplacent les emojis système pour que le site ait le même rendu sur iPhone, Android et ordinateur.
`shuttle.svg` (le volant du rallye, easter egg du logo) est extrait de l'emoji 🏸 Badminton Fluent et pivoté bouchon vers la droite.
`flag-reunion.svg` (drapeau de La Réunion « Lo Mahavéli ») est dessiné pour le site dans le style Fluent : Fluent ne publie pas de drapeaux de pays.
`couple.svg` (💑) n'existe pas dans le jeu Fluent publié : il est recomposé à partir de deux « Person » et du « Red heart » Fluent (même licence MIT).

Pour en ajouter un : télécharger `assets/<Nom>/Color/<nom>_color.svg` depuis le dépôt Fluent Emoji
(par ex. `Clinking beer mugs/Color/clinking_beer_mugs_color.svg` pour 🍻), le renommer ici, puis l'afficher avec
`emoji('nom')` dans `app.js` ou `<img class="emoji" src="assets/emoji/nom.svg" alt="" />` dans `index.html`.
