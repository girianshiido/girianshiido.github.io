# Apprendre son auto-dictée

Jeu tactile et accessible en TypeScript, sans dépendances : lecture avec synthèse vocale française du navigateur, puzzle de tous les mots, saisie et correction intégrale. Les étoiles sont conservées sur l’appareil. Aucun texte saisi n’est envoyé à un serveur.

## Ajouter une dictée
Ajouter une entrée dans `dictations.json`, avec un `id` unique, `title`, `label` et la liste `sentences`. Le sélecteur et les trois activités se mettent à jour automatiquement.

## Développement
Node.js 24 ou ultérieur : `node build.mjs` génère `app.js` depuis `app.ts`. Servir ce dossier avec un serveur HTTP. Les fichiers statiques sont publiés directement par GitHub Pages. Aucune installation nécessaire.

La voix dépend des voix françaises disponibles sur l’appareil. Les apostrophes droites et courbes et les variations d’espacement sont acceptées ; accents, casse et ponctuation sont contrôlés.

`includeTitle: true` intègre le titre à la lecture, au puzzle et au champ dédié du mode écriture. Dans le puzzle, toucher un mot placé permet de le déplacer avec les flèches, de le retirer ou d’insérer le prochain mot après lui. La saisie est répartie entre le titre et les phrases.
