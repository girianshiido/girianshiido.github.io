# Direction graphique — Cosmo Pop 1.2

La planète est une illustration originale produite avec l’outil intégré ImageGen, sur fond transparent. Les images finales intégrées au jeu sont `public/images/planet-480.png` et `public/images/planet-960.png`. Les pictogrammes et les 36 illustrations d’ateliers sont réexportés en PNG depuis les sources natives dans `scripts/icons.json` par `scripts/assets.mjs` : `public/images/icons.png` et `public/images/workshops.png`.

Le thème Lavande sert de base ; Menthe, Aurore et Minuit utilisent des variables CSS et conservent la même iconographie. Les icônes monochromes utilisent un masque PNG pour rester colorées selon le thème. L’illustration est une image transparente, sans fond aplati ; le halo et les effets de profondeur appartiennent à l’interface.

## Brief de génération de la planète

Use case: stylized-concept. Asset type: premium mobile incremental game main planet sprite, PNG with genuine transparent background. Create a beautiful highly polished whimsical candy planet for the French game Cosmo Pop. A round smiling peach-pink planet, tiny friendly eyes and warm smile, cream frosting on its northern hemisphere, an exquisitely detailed tiny lavender-roof confectionery bakery on top with golden windows, mint-green and pink lollipop trees, miniature adorable lavender helper robot near bakery. A thick glowing warm golden Saturn ring diagonally around the planet, properly occluding sphere front and back. Two small pastel mint and lavender moons and a few tiny gold diamond sparkles. Refined 3D clay render meets exquisite storybook illustration, tactile sugar-glass materials, soft subsurface lighting, tasteful satin textures, crisp readable silhouette, charming without clutter. Orthographic three-quarter view, entire ring and moons fully in frame, centered object occupying 85 percent canvas with comfortable transparent margins. Lighting upper left, delicate ambient occlusion on object only. Colors lavender, strawberry pink, apricot, pale mint and champagne gold. Transparent background, no ground plane, no solid background, no text, no watermark, no UI, no drop shadow outside the subject. Single square game-ready illustration.

## Contrôles visuels

La capture `preview-v12-mobile.jpg` montre une fenêtre de 320 × 568 px, avec le mode installé et la présence d’une mise à jour simulés dans un environnement de contrôle. La navigation reste fixe, les compteurs sont centrés, la planète reste intégralement dans la zone disponible et le bouton de mise à jour est lumineux. Le scénario de contrôle n’est pas publié dans le jeu.
