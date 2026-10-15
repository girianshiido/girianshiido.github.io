# Apprendre son auto-dictée

Jeu tactile et accessible en TypeScript, sans dépendances : lecture avec synthèse vocale française du navigateur, puzzle de tous les mots, saisie et correction intégrale. Les étoiles sont conservées sur l’appareil. Aucun texte saisi n’est envoyé à un serveur.

## Ajouter une dictée
Ajouter une entrée dans `dictations.json`, avec un `id` unique, `title`, `label` et la liste `sentences`. Le sélecteur et les trois activités se mettent à jour automatiquement.

## Développement
Node.js 24 ou ultérieur : `node build.mjs` génère `app.js` depuis `app.ts`. Servir ce dossier avec un serveur HTTP. Les fichiers statiques sont publiés directement par GitHub Pages. Aucune installation nécessaire.

La voix dépend des voix françaises disponibles sur l’appareil. Les apostrophes droites et courbes et les variations d’espacement sont acceptées ; accents, casse et ponctuation sont contrôlés.

`includeTitle: true` intègre le titre à la lecture, au puzzle et au champ dédié du mode écriture. Dans le puzzle, toucher un mot placé permet de le déplacer avec les flèches, de le retirer ou d’insérer le prochain mot après lui. La saisie est répartie entre le titre et les phrases.

Les illustrations originales ont été générées par IA : scène de vote en classe et vignette carnet/crayon à la gouache, palette lavande, abricot et sauge. Versions WebP optimisées dans `assets/` (environ 32 Ko au total). La lecture vocale est limitée au mode apprentissage, avec 850 ms de pause entre le titre et les phrases ; les deux modes d’exercice ne comportent aucun bouton d’écoute.

## Application installable (PWA)
Installer depuis Safari sur iOS (Partager → Sur l’écran d’accueil) ou Chrome sur Android (Installer l’application). Le manifeste et les icônes ouvrent le jeu en fenêtre autonome. Le service worker, limité à ce dossier, conserve tous les fichiers pour un usage hors connexion après une première ouverture connectée. Les voix de synthèse hors connexion dépendent de l’appareil.

À chaque publication modifiant des fichiers du jeu, incrémenter `CACHE` dans `sw.js` et ajouter au précache tout nouvel asset indispensable. Le chargement essaie d’abord le réseau, puis les fichiers conservés. `node build.mjs` compile aussi `pwa.ts`.

Le catalogue `dictations.json` est chargé sans cache HTTP. La liste est actualisée à l’ouverture, au retour au premier plan après une minute et au rétablissement de la connexion. Une actualisation conserve le texte saisi et le puzzle en cours ; les nouvelles entrées apparaissent dans le sélecteur. En cas de panne réseau, le service worker rend le catalogue téléchargé.
