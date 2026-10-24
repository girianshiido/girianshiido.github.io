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
];
export function icon(name, cls = "") {
    const i = Math.max(0, names.indexOf(name));
    return `<span class="icon ${cls}" aria-hidden="true" style="--ix:${((i % 8) / (8 - 1)) * 100}%;--iy:${(Math.floor(i / 8) / (5 - 1)) * 100}%"></span>`;
}
export function workshopArt(id) {
    return `<span class="workshop-art" aria-hidden="true" style="background-position:${((id % 6) / 5) * 100}% ${(Math.floor(id / 6) / 5) * 100}%"></span>`;
}
export function planetArt() {
    return '<img class="planet-art world-body" src="./images/planet-480.png" srcset="./images/planet-480.png 480w, ./images/planet-960.png 960w" sizes="(max-width:759px) 300px, 500px" width="960" height="960" alt="" draggable="false" decoding="async" fetchpriority="high">';
}
