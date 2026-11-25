# L’Archipel des nombres

[Ouvrir le jeu](https://girianshiido.github.io/archipel-des-nombres/)

Jeu de comptage en français, installable sur iPhone, iPad, Android et Mac. Le premier parcours couvre les nombres de 0 à 5. Après la traversée du phare, le second parcours aborde les nombres de 6 à 10.

## Un geste par île

- **La plage** — toucher chaque objet une fois et donner le total. Le zéro apparaît comme une collection vide.
- **La grotte** — associer un nombre entendu à son chiffre.
- **Le lagon** — reconnaître des quantités sur un dé, dans un cadre de cinq ou dans des groupes. Le mode avec des figures qui disparaissent reste facultatif.
- **Le jardin** — préparer la quantité demandée. Les graines peuvent être déplacées ou sélectionnées d’un toucher.
- **Le pont** — poser exactement une lanterne sous chaque feuille. Il y a toujours au moins une feuille.
- **La traversée du phare** — observer la collection sur un quai, traverser et préparer autant de perles sur l’autre. Le premier quai peut être revu à volonté.

Chaque atelier s’ouvre sur un exemple manipulable sans score. Au cours d’une série, une erreur donne une correction et une nouvelle variante. Au moins 80 % de réponses justes du premier coup sont nécessaires pour valider la série. L’ordre croissant, la mosaïque et les changements de quantité sont proposés comme ateliers indépendants après la traversée. Ils n’entrent pas dans la validation du parcours de comptage.

Les profils et les validations sont conservés localement, y compris lors de la migration de la première version. Les consignes et les nombres sont des fichiers audio préproduits avec une seule voix française et mis en cache pour le jeu hors ligne. [Crédits de la voix](public/audio/CREDITS.txt).

## Développement

Avec Node.js 24 et npm :

```sh
npm install
npm test
npm run build
npx playwright install chromium
npm run test:interface
npm run dev
```

Le moteur est en TypeScript strict. Les collections et objets à déplacer sont dessinés dans Canvas 2D. Les six décors d’île sont des illustrations WebP issues d’une planche en gouache. Les portraits des compagnons sont recréables avec `scripts/draw-portraits.py`.

Le jeu est servi sous `/archipel-des-nombres/` à la racine du dépôt Pages. Le cache est borné à la portée du jeu. Le site peut être installé depuis le menu **Installer**, après une première visite connectée.
