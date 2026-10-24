# Direction graphique — Cosmo Pop 1.4

La planète est une illustration originale produite avec l’outil intégré ImageGen, sur fond transparent. Les images finales intégrées au jeu sont `public/images/planet-480.png` et `public/images/planet-960.png`. Les pictogrammes sont réexportés dans l’atlas couleur `public/images/icons-v14.png` par `scripts/interface-icons.mjs`, appelé depuis `scripts/assets.mjs`. Depuis la version 1.3, les 36 ateliers ont chacun une illustration originale produite par l’outil intégré ImageGen, dans `public/images/workshops/0.png` à `35.png` (384 × 384 px avec transparence). L’ancien atlas répétitif est retiré.

Le thème Lavande sert de base ; Menthe, Aurore et Minuit utilisent des variables CSS et conservent la même iconographie. Les icônes de l’interface utilisent un atlas PNG couleur, commun aux quatre thèmes. Les commandes actives sont signalées par leur fond, leur état et leur libellé. L’illustration est une image transparente, sans fond aplati ; le halo et les effets de profondeur appartiennent à l’interface.

## Brief de génération de la planète

Use case: stylized-concept. Asset type: premium mobile incremental game main planet sprite, PNG with genuine transparent background. Create a beautiful highly polished whimsical candy planet for the French game Cosmo Pop. A round smiling peach-pink planet, tiny friendly eyes and warm smile, cream frosting on its northern hemisphere, an exquisitely detailed tiny lavender-roof confectionery bakery on top with golden windows, mint-green and pink lollipop trees, miniature adorable lavender helper robot near bakery. A thick glowing warm golden Saturn ring diagonally around the planet, properly occluding sphere front and back. Two small pastel mint and lavender moons and a few tiny gold diamond sparkles. Refined 3D clay render meets exquisite storybook illustration, tactile sugar-glass materials, soft subsurface lighting, tasteful satin textures, crisp readable silhouette, charming without clutter. Orthographic three-quarter view, entire ring and moons fully in frame, centered object occupying 85 percent canvas with comfortable transparent margins. Lighting upper left, delicate ambient occlusion on object only. Colors lavender, strawberry pink, apricot, pale mint and champagne gold. Transparent background, no ground plane, no solid background, no text, no watermark, no UI, no drop shadow outside the subject. Single square game-ready illustration.

## Contrôles visuels

La capture `preview-v12-mobile.jpg` montre une fenêtre de 320 × 568 px, avec le mode installé et la présence d’une mise à jour simulés dans un environnement de contrôle. La navigation reste fixe, les compteurs sont centrés, la planète reste intégralement dans la zone disponible et le bouton de mise à jour est lumineux. Le scénario de contrôle n’est pas publié dans le jeu.

## Illustrations d’ateliers et icône de lancement 1.3

Chaque sujet a fait l’objet d’un appel individuel à l’outil intégré ImageGen, sans recours au mode CLI. Les PNG avec transparence sont exportés en 384 × 384 px pour les ateliers, avec une palette optimisée de 256 couleurs. La composition et la silhouette illustrent la fonction précise de chaque machine : robot pâtissier, moulin à cristaux, serre lunaire, ruche stellaire, etc., jusqu’à la Source des origines. Les briefs complets et chemins de sortie sont consignés dans `generation-v13.json`.

L’icône de lancement est générée séparément sur fond violet opaque, en conservant la planète-confiserie et son anneau doré. Les fichiers versionnés sont `public/icon-192-v13.png`, `public/icon-512-v13.png`, `public/icon-maskable-v13.png` et `public/apple-touch-icon-v13.png`. Les alias historiques servent les nouveaux visuels également ; seules les URL versionnées sont utilisées par l’interface et le manifeste. Le lanceur du téléphone contrôle le renouvellement des icônes des installations existantes.

La capture `preview-v13-mobile.jpg` montre l’interface à 320 × 568 px dans une partie de contrôle : point vert discret, illustrations d’ateliers, et absence des boutons d’amélioration sur les cartes des machines. Les fichiers de contrôle ne sont pas publiés.

## Harmonisation des pictogrammes 1.4

Les captures des recherches, de la comète, de la Supernova et du défi ont mis en évidence l’écart entre les illustrations d’ateliers et les anciens pictogrammes au trait. La version 1.4 remplace entièrement le rendu monochrome par un atlas couleur de 34 pictogrammes, `public/images/icons-v14.png`. Les formes utilitaires sont redessinées directement dans la source native et réexportées en PNG : bords arrondis, aplats en dégradés, détails dorés et ombres légères. Les illustrations de fonctions proviennent de neuf nouvelles créations ImageGen et de huit images déjà intégrées à l’univers du jeu. Les briefs exacts sont dans `generation-v14.json`, les noms et coordonnées dans `interface-icons-catalog.json`.

Les fonctions importantes reçoivent davantage de place (recherches, comète, Supernova, missions et voyages). Les commandes restent compactes et immédiatement reconnaissables ; les succès non obtenus sont désaturés. Le masque CSS monochrome est supprimé. Les PNG générés de 384 px sont conservés dans `public/images/symbols/` ; l’atlas d’exécution les utilise dans des cases de 192 px.
