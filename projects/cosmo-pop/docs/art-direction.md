# Direction graphique — Cosmo Pop 1.3

La planète est une illustration originale produite avec l’outil intégré ImageGen, sur fond transparent. Les images finales intégrées au jeu sont `public/images/planet-480.png` et `public/images/planet-960.png`. Les pictogrammes de navigation sont réexportés en PNG depuis les sources natives de `scripts/icons.json` par `scripts/assets.mjs`, dans `public/images/icons.png`. Depuis la version 1.3, les 36 ateliers ont chacun une illustration originale produite par l’outil intégré ImageGen, dans `public/images/workshops/0.png` à `35.png` (384 × 384 px avec transparence). L’ancien atlas répétitif est retiré.

Le thème Lavande sert de base ; Menthe, Aurore et Minuit utilisent des variables CSS et conservent la même iconographie. Les icônes monochromes utilisent un masque PNG pour rester colorées selon le thème. L’illustration est une image transparente, sans fond aplati ; le halo et les effets de profondeur appartiennent à l’interface.

## Brief de génération de la planète

Use case: stylized-concept. Asset type: premium mobile incremental game main planet sprite, PNG with genuine transparent background. Create a beautiful highly polished whimsical candy planet for the French game Cosmo Pop. A round smiling peach-pink planet, tiny friendly eyes and warm smile, cream frosting on its northern hemisphere, an exquisitely detailed tiny lavender-roof confectionery bakery on top with golden windows, mint-green and pink lollipop trees, miniature adorable lavender helper robot near bakery. A thick glowing warm golden Saturn ring diagonally around the planet, properly occluding sphere front and back. Two small pastel mint and lavender moons and a few tiny gold diamond sparkles. Refined 3D clay render meets exquisite storybook illustration, tactile sugar-glass materials, soft subsurface lighting, tasteful satin textures, crisp readable silhouette, charming without clutter. Orthographic three-quarter view, entire ring and moons fully in frame, centered object occupying 85 percent canvas with comfortable transparent margins. Lighting upper left, delicate ambient occlusion on object only. Colors lavender, strawberry pink, apricot, pale mint and champagne gold. Transparent background, no ground plane, no solid background, no text, no watermark, no UI, no drop shadow outside the subject. Single square game-ready illustration.

## Contrôles visuels

La capture `preview-v12-mobile.jpg` montre une fenêtre de 320 × 568 px, avec le mode installé et la présence d’une mise à jour simulés dans un environnement de contrôle. La navigation reste fixe, les compteurs sont centrés, la planète reste intégralement dans la zone disponible et le bouton de mise à jour est lumineux. Le scénario de contrôle n’est pas publié dans le jeu.

## Illustrations d’ateliers et icône de lancement 1.3

Chaque sujet a fait l’objet d’un appel individuel à l’outil intégré ImageGen, sans recours au mode CLI. Les PNG avec transparence sont exportés en 384 × 384 px pour les ateliers, avec une palette optimisée de 256 couleurs. La composition et la silhouette illustrent la fonction précise de chaque machine : robot pâtissier, moulin à cristaux, serre lunaire, ruche stellaire, etc., jusqu’à la Source des origines. Les briefs complets et chemins de sortie sont consignés dans `generation-v13.json`.

L’icône de lancement est générée séparément sur fond violet opaque, en conservant la planète-confiserie et son anneau doré. Les fichiers versionnés sont `public/icon-192-v13.png`, `public/icon-512-v13.png`, `public/icon-maskable-v13.png` et `public/apple-touch-icon-v13.png`. Les alias historiques servent les nouveaux visuels également ; seules les URL versionnées sont utilisées par l’interface et le manifeste. Le lanceur du téléphone contrôle le renouvellement des icônes des installations existantes.

La capture `preview-v13-mobile.jpg` montre l’interface à 320 × 568 px dans une partie de contrôle : point vert discret, illustrations d’ateliers, et absence des boutons d’amélioration sur les cartes des machines. Les fichiers de contrôle ne sont pas publiés.
