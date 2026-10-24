# Cosmo Pop 1.2 — L’atelier des étoiles

Jeu incrémental français en TypeScript strict, sans framework, sans serveur ni télémétrie. Publication statique dans le répertoire `/cosmo-pop/` du dépôt GitHub Pages ; sources dans `projects/cosmo-pop/`.

## Progression

- 36 machines réparties en six chapitres, jusqu’à un prix de base de 10^80.
- 14 améliorations générales et 276 recettes d’atelier : 252 paliers et 24 secondes jeunesses.
- 48 succès, 19 défis, trois expéditions et trois recherches permanentes.
- Les paliers 10, 25, 50, 100, 200, 400 et 800 débloquent des recettes **payantes**. Les multiplicateurs varient selon les machines : ×1,4 à ×10, avec plusieurs séries de ×3 pour les ateliers plus coûteux.
- Les recettes des premiers ateliers peuvent retrouver une utilité aux ères plus avancées. Chaque seconde jeunesse impose une quantité minimale, un cycle, une production totale et un prix. Son bonus avant les multiplicateurs globaux est plafonné à vingt fois la production de base de l’atelier de référence de cette ère. Les recettes ne créent aucun revenu en fonction de l’argent dépensé et ne s’activent jamais automatiquement.
- Les prochaines recettes apparaissent à 80 % de la quantité nécessaire ; les découvertes générales apparaissent à 25 % de leur seuil de production. Les acquisitions restent consultables dans un volet repliable.
- Les renaissances remettent les machines et recettes à zéro, conservent recherches, succès et statistiques, et apportent un bonus de cycle additif de +50 %. Le seuil du cycle n est `100 millions × 30^(n−1)` (exposant plafonné à 30). La poussière gagnée est logarithmique, limitant les avantages tirés d’une énorme ancienne réserve.
- Gains hors ligne à 75 %, plafonnés à 8 h, puis 28 h avec les recherches.

Les sauvegardes des versions à 6, 12 ou 30 machines sont migrées. Les anciens paliers automatiques sont conservés avec **leur multiplicateur historique ×1,5**, ce qui évite de gonfler rétrospectivement la production. Les nouveaux paliers doivent être achetés. Les achats et dépenses sont validés dans le moteur, indépendamment de l’état des boutons.

## Interface et application installée

Quatre thèmes persistants : Lavande, Menthe, Aurore et Minuit. Compteurs centrés, production par seconde insécable, navigation mobile fixe et mise en page adaptée dès 320 px. Pincement, gestes Safari, double toucher, zoom par raccourci clavier et Ctrl/molette sont interceptés dans la page. Les fonctions de zoom propres au système d’exploitation et à l’interface du navigateur restent hors du contrôle de la page.

La planète est une illustration PNG originale générée pour ce projet, disponible en 480 et 960 px. Tous les pictogrammes d’exécution et illustrations d’ateliers sont des atlas PNG : aucun SVG n’est inséré dans l’interface. Les sources de pictogrammes restent dans `scripts/icons.json` pour permettre leur réexport. Les deux atlas limitent le nombre de requêtes et conservent les pictogrammes nets sur écrans à forte densité. Les animations respectent la réduction de mouvement de l’appareil et le réglage du jeu.

Le manifeste PWA fournit les icônes 192 et 512 px, une icône maskable et une icône Apple 180 px. Installation : Safari → Partager → Sur l’écran d’accueil sur iOS ; bouton Installer ou menu Chrome sur Android. En mode installé, l’icône d’installation devient un bouton de mise à jour. Il s’éclaire lorsqu’un nouveau Service Worker est prêt ; une activation manuelle sauvegarde la partie avant son application. La détection repose sur le mode standalone iOS/standard et sur le signal d’installation du navigateur, mémorisé sur cet appareil. Une page ne peut pas inventorier universellement les applications installées sur tous les systèmes.

Les ressources PNG, scripts et cinq bruitages OGG sont préchargés dans un cache hors ligne versionné par empreinte SHA-256. Les vérifications automatiques de mise à jour sont espacées de cinq minutes et limitées aux onglets visibles et connectés. Les sauvegardes peuvent être exportées pour transférer une partie entre le navigateur, l’application installée et un autre appareil.

## Sauvegardes chiffrées

Enregistrement automatique et copie de secours en **AES-256-GCM**, avec un IV aléatoire de 96 bits par écriture. Clé locale non extractible dans IndexedDB ; aucun état de partie en clair dans localStorage. Les exports `.cosmopop` sont protégés par un mot de passe de dix caractères minimum : PBKDF2-HMAC-SHA-256, 310 000 itérations, sel aléatoire de 128 bits, puis AES-256-GCM. L’import vérifie l’authenticité, le schéma et la cohérence des données avant confirmation de remplacement.

HTTPS ou localhost est nécessaire pour Web Crypto. La suppression des données du navigateur supprime aussi la clé locale : conservez un export. Le mot de passe d’export est irrécupérable. Le chiffrement protège les fichiers enregistrés et leur intégrité ; il ne peut pas empêcher le propriétaire du navigateur de modifier le programme exécuté. Web Locks empêche deux onglets compatibles d’écrire simultanément la même partie.

## Développer et publier

Node.js 22 ou supérieur. TypeScript est la seule dépendance nécessaire à la compilation.

```sh
npm ci
npm test
npm run dev
```

Le serveur utilise le port 5173 par défaut, accepte `--port` et `PORT`. Le dossier `dist/` est autonome et utilise uniquement des chemins relatifs.

Depuis `projects/cosmo-pop/` dans le dépôt :

```sh
npm run stage:pages
```

Cette commande reconstruit puis copie les ressources dans `../../cosmo-pop/`, en excluant les pages de contrôle QA. Commitez les sources et la version compilée ensemble puis poussez la branche du site.

`node scripts/assets.mjs` réexporte les atlas PNG avec Sharp (dans l’environnement de création ou installé séparément). Avec un chemin PNG en argument, il redimensionne également l’illustration de la planète ; le PNG haute définition original est une création générée, non un rendu vectoriel.

## Vérification et architecture

`src/engine.ts` contient l’économie déterministe et la validation des sauvegardes. `storage.ts` sérialise les écritures chiffrées. `audio.ts` réutilise les buffers OGG décodés. `art.ts` référence les atlas PNG. `main.ts` gère vues, interactions, thèmes et cycle de mise à jour. Les compteurs sont actualisés au maximum huit fois par seconde, les particules sont plafonnées et la boucle s’arrête lorsque l’onglet est masqué.

Les tests couvrent les achats, lots, dépenses uniques, paliers payants, plafonds des secondes jeunesses, déblocages progressifs, migrations historiques, valeurs à 10^80, gains hors ligne, renaissances, chiffrement, mots de passe erronés, altération des fichiers et ressources PWA.

`node scripts/simulate.mjs` lance des scénarios reproductibles avec investissement par rendement, achats des recettes, récoltes, comètes, Supernova, défis, recherches et expéditions. Les scénarios rapides de quinze minutes n’épuisent pas le contenu ; le scénario actif atteint une première renaissance entre 30 et 90 minutes. Ce sont des simulations de stratégie, pas des mesures de joueurs. L’installation et les gestes natifs doivent aussi être vérifiés sur les appareils réels ciblés.

## Très grandes quantités

Les unités abrégées couvrent les échelles françaises jusqu’à 10^81. Au-delà, les exposants sont affichés en notation scientifique compacte et exacte quant à leur ordre de grandeur, jusqu’à 10^300. La précision relative des nombres reste celle des nombres JavaScript (environ quinze chiffres significatifs). Les produits et revenus saturent à 10^300 pour rester finis ; ils ne débordent pas en Infinity. La limite technique de 10^300 ne signifie pas que le contenu actuel oblige à l’atteindre.
