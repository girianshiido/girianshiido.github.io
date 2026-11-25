# L’Archipel des nombres

[Ouvrir le jeu](https://girianshiido.github.io/archipel-des-nombres/)

Jeu de comptage en français, installable sur iPhone, iPad, Android et Mac. Le parcours de 0 à 5 comporte six activités par île, soit 36 activités. La validation des six activités d’une île ouvre la suivante. Le parcours existant de 6 à 10 s’ouvre après le grand phare.

| Île | Compétences |
| --- | --- |
| Plage | Compter jusqu’à trois, associer objet à objet, reconnaître les petites quantités et le zéro. |
| Lagon | Compter jusqu’à cinq en ligne, en cercle et en dispersion, lire les doigts et les points du dé. |
| Grotte | Associer quantités, nombres entendus et chiffres avec des cartes, des cadres et des collections jumelles. |
| Jardin | Former des collections, remplir le panier à partir d’une consigne orale, colorier ou modifier une quantité. |
| Pont | Comparer, ordonner, compléter à cinq et retrouver une partie cachée. |
| Phare | Transférer une quantité entre deux quais et réinvestir les compétences dans plusieurs séries. |

Les activités d’apprentissage commencent par un exemple manipulable sans score. Une erreur dans une série déclenche une correction et une nouvelle variante. Pour valider, il faut au moins 80 % de réussites du premier coup. Les anciens profils conservent leurs activités acquises et, le cas échéant, leur accès au parcours de 6 à 10.

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
