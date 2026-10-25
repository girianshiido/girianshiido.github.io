const names = [
  "spark",
  "star",
  "planet",
  "bot",
  "mill",
  "sprout",
  "hive",
  "portal",
  "sun",
  "hand",
  "book",
  "comet",
  "bolt",
  "orbit",
  "rocket",
  "moon",
  "clock",
  "settings",
  "volume",
  "mute",
  "trophy",
  "check",
  "lock",
  "arrow",
  "close",
  "download",
  "upload",
  "info",
  "heart",
  "sugar",
  "chart",
  "leaf",
  "refresh",
  "nebula",
];
export function icon(name: string, cls = ""): string {
  const i = Math.max(0, names.indexOf(name));
  return `<span class="icon ${cls}" data-icon="${names[i]}" aria-hidden="true" style="--ix:${((i % 8) / (8 - 1)) * 100}%;--iy:${(Math.floor(i / 8) / (5 - 1)) * 100}%"></span>`;
}
export function workshopArt(id: number): string {
  return `<img class="workshop-art" src="./images/workshops/${id}.png" width="384" height="384" alt="" draggable="false" decoding="async" loading="lazy">`;
}
/** Seven permanent appearances selected by the existing lifetime planet level. */
export const PLANET_FORMS = [
  { level: 1, name: "La petite pépite" },
  { level: 4, name: "La première maison" },
  { level: 7, name: "Le village gourmand" },
  { level: 10, name: "Le royaume fleuri" },
  { level: 13, name: "La capitale des étoiles" },
  { level: 16, name: "La cité galactique" },
  { level: 20, name: "La citadelle de l’infini" },
] as const;
export function planetForm(level: number): number {
  let form = 0;
  for (let i = 1; i < PLANET_FORMS.length; i++)
    if (level >= PLANET_FORMS[i]!.level) form = i;
  return form;
}
export function planetArt(level = 1): string {
  const form = planetForm(level);
  return `<img class="planet-art world-body" data-form="${form}" src="./images/planets/${form}-480.png" srcset="./images/planets/${form}-480.png 480w, ./images/planets/${form}-960.png 960w" sizes="(max-width:759px) 300px, 500px" width="960" height="960" alt="${PLANET_FORMS[form]!.name}" draggable="false" decoding="async" fetchpriority="high">`;
}
