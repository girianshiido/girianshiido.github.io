# Cosmo Pop — L’atelier des étoiles

Jeu incrémental original en français, réalisé en TypeScript strict, HTML, CSS et SVG. Aucun framework, aucune dépendance d’exécution, aucun serveur, aucune télémétrie.

## Jouer

Touchez la planète, recrutez des machines et réalisez les défis. Les combos doublent progressivement les récoltes, les comètes offrent des primes et la Supernova triple temporairement la production. Les expéditions donnent une monnaie permanente ; les renaissances relancent l’économie avec des bonus durables.

- 30 machines, 5 paliers de +50 % par machine et 14 améliorations.
- 13 évolutions visuelles, 3 expéditions, 3 recherches permanentes, 19 défis et 29 succès.
- Achats par 1, par 10 ou au maximum abordable ; le lot est partiel lorsque la réserve est insuffisante.
- Gains hors ligne à 75 % de la production de base, plafonnés à 8 heures, puis 28 heures au maximum avec les recherches.
- Interface adaptée dès 320 px, navigation tactile fixe, clavier, réduction des animations et contrôle du volume.
- 5 bruitages OGG/Vorbis originaux, synthétisés pour ce jeu. Illustration SVG originale.
- Mode hors ligne avec Service Worker ; aucun calcul en arrière-plan quand l’onglet est masqué.

## Sauvegardes chiffrées

Les sauvegardes automatiques et leur copie de secours sont **chiffrées et authentifiées en AES-256-GCM**, avec un IV aléatoire de 96 bits à chaque écriture. La clé locale est un `CryptoKey` non extractible conservé séparément dans IndexedDB. Aucune partie n’est enregistrée en clair dans localStorage.

Les exports `.cosmopop` utilisent un mot de passe d’au moins 10 caractères. Chaque export possède un sel aléatoire de 128 bits ; la clé AES est dérivée avec **PBKDF2-HMAC-SHA-256, 310 000 itérations**. L’import vérifie l’authenticité du fichier, le schéma et la cohérence des valeurs, puis demande confirmation avant de remplacer la partie.

Le chiffrement nécessite un contexte sécurisé (HTTPS ou localhost). La clé locale disparaît avec les données du navigateur : faites un export pour conserver ou transférer une partie. Le mot de passe d’export ne peut pas être récupéré.

Ce mécanisme protège les données au repos et détecte l’altération des fichiers. Il ne constitue pas un système anti-triche : le propriétaire d’un navigateur peut modifier le programme et son état en mémoire. Le jeu ne contient aucune clé secrète globale embarquée.

Les navigateurs compatibles avec Web Locks empêchent deux onglets d’écrire simultanément la même partie. Un onglet secondaire reste consultable et demande de fermer le premier avant de reprendre le jeu.

## Développement

Node.js 22 ou supérieur ; TypeScript est l’unique dépendance de développement.

```sh
npm ci
npm test
npm run dev
```

`npm test` compile puis lance les tests du moteur et de la cryptographie. Le serveur local utilise le port 5173 par défaut, ou `--port 4173` / la variable `PORT`.

```sh
npm run check
npm run build
```

Le dossier `dist/` est autonome. Il peut être publié sous n’importe quel sous-répertoire grâce à des chemins relatifs. Le cache hors ligne est versionné par l’empreinte SHA-256 de ses ressources ; une mise à jour s’applique après fermeture des anciens onglets.

## Organisation du dépôt GitHub Pages

- `projects/cosmo-pop/` : sources et tests.
- `cosmo-pop/` : version compilée publiée par GitHub Pages depuis la branche du site.

Depuis `projects/cosmo-pop/`, après les tests :

```sh
npm run stage:pages
```

Cette commande reconstruit le jeu et copie uniquement les fichiers nécessaires dans `../../cosmo-pop/`. Commitez les sources et les fichiers compilés ensemble, puis poussez la branche du site. Elle ne modifie aucun autre répertoire.

## Architecture et validation

`src/engine.ts` est un moteur déterministe indépendant du navigateur : économie, progression, expéditions, recherches, renaissances et validation de sauvegarde. `src/storage.ts` traite le chiffrement et la sérialisation des écritures. `src/audio.ts` réutilise les buffers audio décodés. `src/art.ts` fournit les icônes et l’illustration vectorielle. `src/main.ts` gère les vues et les interactions.

L’affichage des compteurs est limité à 8 mises à jour par seconde et les animations utilisent le moteur CSS. Les formatteurs numériques sont réutilisés. Les particules sont plafonnées ; la boucle d’animation s’arrête lorsque l’onglet est masqué. Les sauvegardes sont regroupées et sérialisées pour éviter les écritures concurrentes.

Les tests couvrent les achats et les lots, les paliers, les gains hors ligne, les récompenses uniques, les recherches, les renaissances, les défis, la Supernova, les formats numériques, les sauvegardes invalides, le chiffrement/déchiffrement, les IV et sels distincts, les mots de passe erronés et les fichiers altérés.

## Version 1.1 : progression et installation

Les six dernières machines et six nouvelles améliorations se débloquent aux renaissances 1, 2, 3, 5, 8 et 12. Le seuil de la renaissance numéro n est `100 millions × 30^(n−1)` de douceurs produites dans cette vie. Chaque renaissance donne +50 % de production, additivement avec les autres bonus de cycle. Le gain de poussière est logarithmique pour éviter de convertir une ancienne réserve énorme en bonus disproportionné. Les sauvegardes à six machines sont étendues automatiquement à trente sans perdre leur progression. Les prix, productions et multiplicateurs sont recalculés selon la nouvelle économie.

`node scripts/simulate.mjs` exécute des scénarios reproductibles avec investissement par rendement, comètes, Supernova, défis, recherches et expéditions. Ce sont des scénarios théoriques, pas des mesures sur des joueurs. Les régressions vérifient qu’une partie rapide de quinze minutes n’épuise pas le contenu, et que la première renaissance d’un scénario actif arrive entre 30 et 90 minutes.

Le jeu est une PWA installable : manifeste, icônes PNG 192 et 512 px, icône maskable, icône Apple 180 px et cache hors ligne. Le bouton Installer déclenche le dialogue du navigateur lorsqu’il est disponible, sinon affiche les instructions iOS et Android. Sur iOS : Safari → Partager → Sur l’écran d’accueil. Aucun compte développeur ni magasin d’applications n’est nécessaire. L’installation sur un appareil réel reste à vérifier par son utilisateur.

## Cinq chapitres et synergies

Les 30 machines se répartissent en cinq chapitres de six : Le petit atelier, L’empire stellaire, Les routes cosmiques, L’ère quantique et Les créateurs d’univers. L’atelier affiche un chapitre à la fois pour rester utilisable sur un petit téléphone. Les nouvelles machines se débloquent progressivement jusqu’à la trentième renaissance. Chaque chapitre fournit +5 % de production globale lorsque chacune de ses six machines atteint 10 exemplaires, puis +5 % par tranche de 10 supplémentaires, jusqu’à +25 %. La diversification garde ainsi une utilité après le déblocage de machines plus puissantes. Cinq succès de maîtrise et trois défis de chapitre complètent la progression. Les sauvegardes à six ou douze machines sont compatibles.
