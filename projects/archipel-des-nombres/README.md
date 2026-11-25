# L’Archipel des nombres

[Ouvrir le jeu](https://girianshiido.github.io/archipel-des-nombres/)

Jeu éducatif en français. Le premier parcours entraîne à compter de 0 à 5, puis le phare ouvre un parcours de 6 à 10. Chaque chapitre contient cinq ateliers et une synthèse. Un profil local garde la progression et les réglages sur l’appareil utilisé.

## Progression

- **Plage** — pointer chaque objet une fois, entendre les mots-nombres et donner le total. Le zéro est représenté par une collection vide.
- **Grotte** — passer d’un mot entendu à un chiffre ou à une collection. Les nombres sont enregistrés et disponibles hors ligne. Le mot écrit est accessible à la demande.
- **Lagon** — reconnaître des configurations de dé, des rangées, des collections dispersées et des cadres de cinq. Passer d’une disposition à une autre en conservant le nombre.
- **Jardin** — construire une collection exacte à partir d’une quantité, en déplaçant les objets du doigt, avec la souris ou au clavier. Colorier juste le nombre de cases demandé.
- **Pont** — mettre une lumière par feuille, ajouter ou retirer un objet, ranger les nombres.
- **Phare** — reprendre les différentes mécaniques dans une série de dix activités.

Une série valide l’île si au moins 80 % des activités prévues sont réussies au premier essai. Une erreur donne lieu à une correction puis à une variante en fin de série. La variante sert à s’exercer. Les erreurs sont enregistrées au moment de la réponse. Les figures éclair peuvent être revues et désactivées dans les réglages.

Repères pédagogiques : [Éduscol, premiers outils mathématiques](https://eduscol.education.gouv.fr/4674/acquerir-les-premiers-outils-mathematiques-cycle-1), [What Works Clearinghouse, Teaching Math to Young Children](https://ies.ed.gov/ncee/wwc/practiceguide/18).

## Installation et données

Le bouton **Installer** détaille la marche à suivre sur Android, iPhone et Mac. Après la première ouverture connectée et la mise en cache, le jeu fonctionne hors connexion. Une voix française installée localement peut lire les consignes. La lecture des nombres utilise les fichiers audio inclus. Les profils sont séparés et effaçables. Les données ne transitent par aucun serveur.

## Développement et publication

Avec Node.js 22.12 ou une version ultérieure :

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Le moteur est écrit en TypeScript strict. L’interface utilise des modules ES, Canvas 2D et Vite, avec des actifs locaux. Le paquet `dist/` peut être copié dans `archipel-des-nombres/` à la racine du dépôt Pages. Conserver le reste du site. Le service worker ne gère que la portée de l’application et conserve un cache distinct par version.
