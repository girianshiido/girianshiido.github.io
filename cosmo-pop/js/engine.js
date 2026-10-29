/** Pure deterministic economy. No browser dependencies. */
export const LIMIT = 1e300;
/** Saturating products keep progression finite without multiplying beyond IEEE-754 range. */
function safeProduct(...values) {
    if (values.some((v) => v === 0))
        return 0;
    let result = 1;
    for (const value of values) {
        if (!Number.isFinite(value) || value > LIMIT / result)
            return LIMIT;
        result *= value;
    }
    return result;
}
const superscript = (n) => String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);
export const BUILDINGS = [
    {
        id: "marmiton",
        name: "Marmiton cosmique",
        plural: "Marmitons",
        desc: "De petites mains, de grandes douceurs.",
        cost: 15,
        rate: 0.4,
        color: "pink",
        icon: "bot",
    },
    {
        id: "moulin",
        name: "Moulin à sucre",
        plural: "Moulins",
        desc: "La poussière de lune, finement moulue.",
        cost: 250,
        rate: 2.4,
        color: "mint",
        icon: "mill",
    },
    {
        id: "serre",
        name: "Serre lunaire",
        plural: "Serres",
        desc: "Ici, les sucettes poussent toutes seules.",
        cost: 6000,
        rate: 14,
        color: "peach",
        icon: "sprout",
    },
    {
        id: "ruche",
        name: "Ruche stellaire",
        plural: "Ruches",
        desc: "Du nectar récolté au cœur des étoiles.",
        cost: 180000,
        rate: 85,
        color: "yellow",
        icon: "hive",
    },
    {
        id: "portail",
        name: "Portail gourmand",
        plural: "Portails",
        desc: "Livraison depuis une autre dimension.",
        cost: 6000000,
        rate: 520,
        color: "violet",
        icon: "portal",
    },
    {
        id: "soleil",
        name: "Soleil confiseur",
        plural: "Soleils",
        desc: "Une étoile entière au service du dessert.",
        cost: 240000000,
        rate: 3400,
        color: "blue",
        icon: "sun",
    },
    {
        id: "forge",
        name: "Forge de météores",
        plural: "Forges",
        desc: "Des recettes qui résistent au vide.",
        cost: 600000000,
        rate: 8000,
        color: "peach",
        icon: "comet",
    },
    {
        id: "ocean",
        name: "Océan de caramel",
        plural: "Océans",
        desc: "Des marées de caramel en apesanteur.",
        cost: 40000000000.0,
        rate: 240000,
        color: "mint",
        icon: "planet",
    },
    {
        id: "pulsar",
        name: "Pulsar praliné",
        plural: "Pulsars",
        desc: "Le cœur battant de votre constellation.",
        cost: 10000000000000.0,
        rate: 8000000.0,
        color: "pink",
        icon: "bolt",
    },
    {
        id: "nebula",
        name: "Nébuleuse dragée",
        plural: "Nébuleuses",
        desc: "Des nuages entiers de nouvelles saveurs.",
        cost: 5000000000000000.0,
        rate: 300000000.0,
        color: "violet",
        icon: "spark",
    },
    {
        id: "galaxie",
        name: "Galaxie pâtissière",
        plural: "Galaxies",
        desc: "Un milliard de mondes à faire grandir.",
        cost: 4e18,
        rate: 15000000000.0,
        color: "yellow",
        icon: "orbit",
    },
    {
        id: "horizon",
        name: "Horizon des délices",
        plural: "Horizons",
        desc: "La dernière frontière de la gourmandise.",
        cost: 8e21,
        rate: 1000000000000.0,
        color: "blue",
        icon: "portal",
    },
    {
        id: "era12",
        name: "Station nougat",
        plural: "Stations",
        desc: "Une escale pour toutes vos cargaisons.",
        cost: 10000000000000000000000000,
        rate: 1.0000000000000002e20,
        color: "pink",
        icon: "bot",
    },
    {
        id: "era13",
        name: "Chantier orbital",
        plural: "Chantiers",
        desc: "Construisez les routes du commerce cosmique.",
        cost: 1000000000000000000000000000,
        rate: 1e22,
        color: "mint",
        icon: "mill",
    },
    {
        id: "era14",
        name: "Arche de pistache",
        plural: "Arches",
        desc: "Un écosystème transporté entre les mondes.",
        cost: 100000000000000000000000000000,
        rate: 1e24,
        color: "peach",
        icon: "sprout",
    },
    {
        id: "era15",
        name: "Essaim de récolte",
        plural: "Essaims",
        desc: "Des milliers de butineurs dans le vide.",
        cost: 10000000000000000000000000000000,
        rate: 1e26,
        color: "yellow",
        icon: "hive",
    },
    {
        id: "era16",
        name: "Relais de chocolat",
        plural: "Relais",
        desc: "Un réseau qui rapproche vos ateliers.",
        cost: 1000000000000000000000000000000000,
        rate: 1e28,
        color: "violet",
        icon: "portal",
    },
    {
        id: "era17",
        name: "Dyson au miel",
        plural: "Sphères",
        desc: "Enveloppez les étoiles de votre savoir-faire.",
        cost: 100000000000000000000000000000000000,
        rate: 1e30,
        color: "blue",
        icon: "sun",
    },
    {
        id: "era18",
        name: "Imprimerie moléculaire",
        plural: "Imprimeries",
        desc: "Assemblez vos douceurs atome par atome.",
        cost: 10000000000000000000000000000000000000,
        rate: 1e32,
        color: "pink",
        icon: "bot",
    },
    {
        id: "era19",
        name: "Tisseur de gravité",
        plural: "Tisseurs",
        desc: "Les lois de la physique deviennent des outils.",
        cost: 1000000000000000000000000000000000000000,
        rate: 1.0000000000000001e34,
        color: "mint",
        icon: "orbit",
    },
    {
        id: "era20",
        name: "Jardin quantique",
        plural: "Jardins",
        desc: "Chaque graine pousse dans plusieurs réalités.",
        cost: 100000000000000000000000000000000000000000,
        rate: 1e36,
        color: "peach",
        icon: "sprout",
    },
    {
        id: "era21",
        name: "Ruche temporelle",
        plural: "Ruches temporelles",
        desc: "Ses abeilles rapportent le nectar de demain.",
        cost: 10000000000000000000000000000000000000000000,
        rate: 1.0000000000000002e38,
        color: "yellow",
        icon: "clock",
    },
    {
        id: "era22",
        name: "Porte des possibles",
        plural: "Portes",
        desc: "Importez les recettes des autres univers.",
        cost: 1000000000000000000000000000000000000000000000,
        rate: 1e40,
        color: "violet",
        icon: "portal",
    },
    {
        id: "era23",
        name: "Four à singularité",
        plural: "Fours",
        desc: "Une chaleur qui déforme l’espace.",
        cost: 100000000000000000000000000000000000000000000000,
        rate: 1.0000000000000002e42,
        color: "blue",
        icon: "sun",
    },
    {
        id: "era24",
        name: "Architecte de mondes",
        plural: "Architectes",
        desc: "Dessinez des planètes entières de dessert.",
        cost: 10000000000000000000000000000000000000000000000000,
        rate: 1e44,
        color: "pink",
        icon: "planet",
    },
    {
        id: "era25",
        name: "Forge des constantes",
        plural: "Forges absolues",
        desc: "Ajustez les constantes de votre cosmos.",
        cost: 1000000000000000000000000000000000000000000000000000,
        rate: 1.0000000000000001e46,
        color: "mint",
        icon: "comet",
    },
    {
        id: "era26",
        name: "Arbre des univers",
        plural: "Arbres",
        desc: "Une branche pour chaque réalité.",
        cost: 100000000000000000000000000000000000000000000000000000,
        rate: 1e48,
        color: "peach",
        icon: "sprout",
    },
    {
        id: "era27",
        name: "Archive des saveurs",
        plural: "Archives",
        desc: "Préservez toutes les recettes jamais inventées.",
        cost: 10000000000000000000000000000000000000000000000000000000,
        rate: 1e50,
        color: "yellow",
        icon: "book",
    },
    {
        id: "era28",
        name: "Matrice originelle",
        plural: "Matrices",
        desc: "Là où prennent naissance les nouveaux mondes.",
        cost: 1000000000000000000000000000000000000000000000000000000000,
        rate: 1.0000000000000001e52,
        color: "violet",
        icon: "portal",
    },
    {
        id: "era29",
        name: "Cœur de l’infini",
        plural: "Cœurs",
        desc: "La gourmandise au-delà du dernier horizon.",
        cost: 100000000000000000000000000000000000000000000000000000000000,
        rate: 1e54,
        color: "blue",
        icon: "heart",
    },
    {
        id: "beyond0",
        name: "Observatoire du néant",
        plural: "Observatoires",
        desc: "Récoltez les dernières lueurs du cosmos.",
        cost: 1e63,
        rate: 1e58,
        color: "violet",
        icon: "moon",
    },
    {
        id: "beyond1",
        name: "Océan de réalités",
        plural: "Océans de réalités",
        desc: "Une marée porteuse de mondes nouveaux.",
        cost: 1e67,
        rate: 1e62,
        color: "mint",
        icon: "planet",
    },
    {
        id: "beyond2",
        name: "Cathédrale des étoiles",
        plural: "Cathédrales",
        desc: "Un atelier aux dimensions du ciel.",
        cost: 1e71,
        rate: 1e66,
        color: "yellow",
        icon: "sun",
    },
    {
        id: "beyond3",
        name: "Semeur de multivers",
        plural: "Semeurs",
        desc: "Chaque graine devient un univers.",
        cost: 1e75,
        rate: 1e70,
        color: "peach",
        icon: "sprout",
    },
    {
        id: "beyond4",
        name: "Atelier de l’éternité",
        plural: "Ateliers éternels",
        desc: "Travaillez au-delà de la dernière seconde.",
        cost: 1e79,
        rate: 1e74,
        color: "pink",
        icon: "clock",
    },
    {
        id: "beyond5",
        name: "Source des origines",
        plural: "Sources",
        desc: "L’origine même des douceurs et du temps.",
        cost: 1e80,
        rate: 1e75,
        color: "blue",
        icon: "heart",
    },
];
const buildingGates = [
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    2,
    3,
    5,
    8,
    12,
    ...Array.from({ length: 24 }, (_, i) => i + 13),
];
export const buildingGate = (id) => buildingGates[id] ?? 99;
export const upgradeGate = (id) => ({
    alloy: 1,
    tide: 2,
    pulse: 3,
    cloud: 5,
    spiral: 8,
    infinity: 12,
})[id] ?? 0;
export const prestigeTarget = (s) => 1e8 * 30 ** Math.min(30, s.prestiges);
export const UPGRADES = [
    {
        id: "gloves",
        name: "Gants de confiseur",
        desc: "Douceurs par récolte × 2.",
        cost: 80,
        unlock: 40,
        icon: "hand",
    },
    {
        id: "spoon",
        name: "Cuillère intersidérale",
        desc: "Douceurs par récolte × 3.",
        cost: 900,
        unlock: 400,
        icon: "spark",
    },
    {
        id: "recipe",
        name: "La recette secrète",
        desc: "Toutes les machines produisent 1,5 fois plus.",
        cost: 2500,
        unlock: 1000,
        icon: "book",
    },
    {
        id: "lucky",
        name: "Une pincée de chance",
        desc: "15 % de récoltes critiques : gains × 5.",
        cost: 6000,
        unlock: 2500,
        icon: "star",
    },
    {
        id: "sugar",
        name: "Sucre de comète",
        desc: "Douceurs par récolte × 5.",
        cost: 18000,
        unlock: 8000,
        icon: "comet",
    },
    {
        id: "turbo",
        name: "Moteurs à caramel",
        desc: "Toutes les machines produisent 2 fois plus.",
        cost: 65000,
        unlock: 25000,
        icon: "bolt",
    },
    {
        id: "echo",
        name: "Écho des étoiles",
        desc: "Ajoute 0,05 seconde de production par récolte.",
        cost: 200000,
        unlock: 100000,
        icon: "orbit",
    },
    {
        id: "galaxy",
        name: "La grande confiserie",
        desc: "Toutes les machines produisent 2 fois plus.",
        cost: 1800000,
        unlock: 500000,
        icon: "planet",
    },
    {
        id: "alloy",
        name: "Alliage de sucre",
        desc: "Production globale × 2 dans cette vie.",
        cost: 500000000.0,
        unlock: 250000000.0,
        icon: "spark",
    },
    {
        id: "tide",
        name: "Marées gourmandes",
        desc: "Production globale × 2 dans cette vie.",
        cost: 100000000000.0,
        unlock: 50000000000.0,
        icon: "spark",
    },
    {
        id: "pulse",
        name: "Pulsation parfaite",
        desc: "Production globale × 2 dans cette vie.",
        cost: 30000000000000.0,
        unlock: 15000000000000.0,
        icon: "spark",
    },
    {
        id: "cloud",
        name: "Nuages cristallins",
        desc: "Production globale × 2 dans cette vie.",
        cost: 1e16,
        unlock: 5000000000000000.0,
        icon: "spark",
    },
    {
        id: "spiral",
        name: "Spirales infinies",
        desc: "Production globale × 2 dans cette vie.",
        cost: 1e19,
        unlock: 5e18,
        icon: "spark",
    },
    {
        id: "infinity",
        name: "La recette de l’infini",
        desc: "Production globale × 2 dans cette vie.",
        cost: 2e22,
        unlock: 1e22,
        icon: "spark",
    },
];
export const RESEARCH = [
    { id: "radiance", name: "Éclat cosmique", desc: "+20 % de production par niveau.", costs: Array.from({ length: 12 }, (_, i) => 3 * (i + 1)), gate: 0, icon: "sun" },
    { id: "touch", name: "Toucher stellaire", desc: "+50 % par récolte par niveau.", costs: Array.from({ length: 12 }, (_, i) => 2 * (i + 1)), gate: 0, icon: "hand" },
    { id: "time", name: "Poches de temps", desc: "+2 h de gains hors ligne par niveau.", costs: Array.from({ length: 12 }, (_, i) => 2 * (i + 1)), gate: 0, icon: "clock" },
    { id: "rhythm", name: "Cadence stellaire", desc: "Plafond du combo : ×4, ×8, puis ×16. Montée progressive : 75, 175, puis 375 clics enchaînés pour atteindre le maximum. Intervalle maximal inchangé : 1,2 s entre deux clics.", costs: [20, 50, 100], gate: 1, icon: "chart" },
    { id: "catalogue", name: "Catalogue des recettes", desc: "Débloque le bouton « Acheter tout » dans Recettes : achat groupé des recettes débloquées et abordables, des moins chères aux plus coûteuses.", costs: [60], gate: 2, icon: "book" },
    { id: "navigation", name: "Cartographie cosmique", desc: "Voyages plus rapides : −10 %, −20 %, puis −25 % au total. Récompenses inchangées.", costs: [20, 45, 80], gate: 2, icon: "orbit" },
    { id: "comets", name: "Veille des comètes", desc: "+5 s pour attraper les comètes par niveau, jusqu’à 33 s. Leur fréquence et leurs récompenses restent identiques.", costs: [10, 25, 45], gate: 1, icon: "comet" },
    { id: "nova", name: "Cœur de Supernova", desc: "+5 s de Supernova par niveau, jusqu’à 45 s. Recharge inchangée : 3 min entre deux activations.", costs: [20, 45, 80], gate: 4, icon: "bolt" },
];
export const AUTOMATION = {
    name: "Intendant des recettes",
    cost: 300,
    gate: 8,
};
export const DESTINATIONS = [
    {
        gate: 0, fuel: 5, benefit: "+50 % aux récoltes manuelles pendant 15 min.",
        name: "La Lune guimauve",
        desc: "Un petit pas pour un marmiton…",
        cost: 500,
        duration: 60,
        dust: 1,
        icon: "moon",
        color: "pink",
    },
    {
        gate: 0, fuel: 15, benefit: "−20 % sur les cinq prochaines unités d’un atelier choisi.",
        name: "Les Anneaux acidulés",
        desc: "Une traversée pétillante.",
        cost: 8000,
        duration: 180,
        dust: 4,
        icon: "orbit",
        color: "mint",
    },
    {
        gate: 0, fuel: 30, benefit: "Le meilleur rendement en poussière pour des départs réguliers.",
        name: "La Nébuleuse vanille",
        desc: "Là où naissent les nouvelles recettes.",
        cost: 100000,
        duration: 600,
        dust: 15,
        icon: "spark",
        color: "violet",
    },
    {
        name: "Les Jardins des comètes", desc: "Un détour pour récolter les étoiles filantes.",
        cost: 1e8, duration: 1800, dust: 40, gate: 3, fuel: 60,
        benefit: "+25 % aux douceurs des comètes pendant 20 min.", icon: "comet", color: "mint",
    },
    {
        name: "La Grande traversée", desc: "Le grand large, pour les longues absences.",
        cost: 1e12, duration: 7200, dust: 120, gate: 6, fuel: 120,
        benefit: "Un long voyage, beaucoup de poussière et moins de relances.", icon: "rocket", color: "violet",
    },
];
export const TIERS = [
    { name: "Pépite naissante", at: 0, color: "#ffabbd" },
    { name: "Petite confiserie", at: 500, color: "#ffb88a" },
    { name: "Jardin des douceurs", at: 5000, color: "#8edac0" },
    { name: "Fabrique orbitale", at: 50000, color: "#96bcf6" },
    { name: "Royaume gourmand", at: 500000, color: "#b4a0ef" },
    { name: "Empire des étoiles", at: 5000000, color: "#ffd16d" },
    { name: "Univers de délices", at: 50000000, color: "#ee9bdc" },
    { name: "Âge des météores", at: 10000000000.0, color: "#ed9b74" },
    { name: "Marées cosmiques", at: 10000000000000.0, color: "#7fdcce" },
    { name: "Cœur du pulsar", at: 1e16, color: "#eaa0cc" },
    { name: "L’ère nébulaire", at: 1e19, color: "#aa9eea" },
    { name: "Dynastie galactique", at: 1e22, color: "#f4ce77" },
    { name: "Au-delà de l’horizon", at: 1e26, color: "#88bff3" },
    { name: "Archipel des galaxies", at: 1e34, color: "#84d6c7" },
    { name: "Symphonie des quasars", at: 1e42, color: "#cc9dec" },
    { name: "Océan des possibles", at: 1e50, color: "#7fbce6" },
    { name: "Jardin du multivers", at: 1e58, color: "#9bd5ac" },
    { name: "Les tisseurs d’éternité", at: 1e66, color: "#e9b8d6" },
    { name: "Aux portes de l’infini", at: 1e74, color: "#edc578" },
    { name: "L’atelier de l’infini", at: 1e82, color: "#b8a2f0" },
];
export function fresh(now = Date.now()) {
    return {
        version: 1,
        dustEconomy: 2,
        sugar: 0,
        total: 0,
        run: 0,
        dust: 0,
        totalDust: 0,
        buildings: BUILDINGS.map(() => 0),
        upgrades: [],
        milestones: [],
        legacyMilestones: [],
        totalMilestones: 0,
        research: { radiance: 0, touch: 0, time: 0, rhythm: 0, catalogue: 0, navigation: 0, comets: 0, nova: 0 },
        automation: { owned: false, enabled: false },
        achievements: [],
        mission: 0,
        clicks: 0,
        expeditions: 0,
        prestiges: 0,
        playSeconds: 0,
        expedition: null,
        voyages: { departures: DESTINATIONS.map(() => 0), reward: null, tapUntil: 0, cometUntil: 0, coupon: null },
        boostUntil: 0,
        boostReady: 0,
        savedAt: now,
        settings: { muted: false, sound: true, volume: 0.45, music: true, musicVolume: 0.35, motion: true, theme: "lavande" },
    };
}
const numberPrecise = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
});
const numberInteger = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
});
export const fmt = (n, precision = 1) => {
    if (!Number.isFinite(n))
        return n === Infinity ? "∞" : "0";
    if (n < 1000)
        return (n < 10 && precision > 0 ? numberPrecise : numberInteger).format(Math.max(0, n));
    const units = [
        "k",
        "M",
        "Md",
        "Bn",
        "Bd",
        "Tn",
        "Td",
        "Qan",
        "Qad",
        "Qin",
        "Qid",
        "Sxn",
        "Sxd",
        "Spn",
        "Spd",
        "Ocn",
        "Ocd",
        "Nvn",
        "Nvd",
        "Dcn",
        "Dcd",
        "Udn",
        "Udd",
        "Ddn",
        "Ddd",
        "Tdn",
        "Tdd",
    ];
    const group = Math.floor(Math.log10(n) / 3);
    if (group > units.length)
        return (numberPrecise.format(n / 1000 ** group) + "×10" + superscript(group * 3));
    return numberPrecise.format(n / 1000 ** group) + " " + units[group - 1];
};
export const timeFmt = (seconds) => {
    const s = Math.max(0, Math.ceil(seconds));
    return s >= 3600
        ? `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`
        : s >= 60
            ? `${Math.floor(s / 60)} min ${s % 60} s`
            : `${s} s`;
};
export const tier = (s) => {
    let found = 0;
    for (let i = 1; i < TIERS.length; i++)
        if (s.total >= TIERS[i].at)
            found = i;
    return found;
};
export function cost(s, id, offset = 0) {
    const b = BUILDINGS[id];
    return b
        ? Math.min(LIMIT, Math.ceil(Math.min(LIMIT, Math.ceil(b.cost * 1.35 ** ((s.buildings[id] ?? 0) + offset))) * (s.voyages.coupon?.building === id && offset < s.voyages.coupon.remaining ? 0.8 : 1)))
        : LIMIT;
}
const milestoneSteps = [10, 25, 50, 100, 200, 400, 800];
const multiplierPatterns = [
    [1.6, 2, 2.5, 3, 4, 6, 10],
    [1.5, 1.8, 2.4, 3, 4, 5, 8],
    [1.5, 2, 2, 2.5, 3, 4, 6],
    [1.4, 1.8, 2.2, 2.6, 3, 4, 5],
    [1.6, 2.2, 3, 3, 3, 4, 5],
    [2, 3, 3, 3, 3, 3, 4],
];
export const MILESTONES = BUILDINGS.flatMap((b, i) => milestoneSteps.map((at, t) => ({
    id: `recipe-${i}-${at}`,
    building: i,
    at,
    multiplier: multiplierPatterns[i % 6][t],
    price: Math.min(LIMIT, Math.ceil(((b.cost * (1.35 ** at - 1)) / 0.35) * 0.18)),
    unlock: 0,
    gate: buildingGate(i),
    name: [
        "La bonne méthode",
        "Recette de maître",
        "Équipe spécialisée",
        "Savoir-faire rare",
        "L’âge d’or",
        "La grande maîtrise",
        "Légende vivante",
    ][t],
    revival: false,
    cap: 0,
})));
for (let stage = 0; stage < 4; stage++)
    for (let i = 0; i < 6; i++) {
        const target = [12, 18, 24, 30][stage], reference = stage === 0 ? i : [12, 18, 24][stage - 1], next = BUILDINGS[target], previous = BUILDINGS[reference];
        MILESTONES.push({
            id: `revival-${i}-${stage}`,
            building: i,
            at: 100 + stage * 50,
            multiplier: Math.max(3, (next.rate / previous.rate) * (stage === 0 ? 0.015 : 1)),
            price: Math.min(LIMIT, next.cost * 40 * (1 + i * 0.25)),
            unlock: next.cost * 10,
            gate: buildingGate(target),
            name: [
                "Seconde jeunesse",
                "Révolution quantique",
                "Renaissance galactique",
                "Héritage de l’éternité",
            ][stage],
            revival: true,
            cap: next.rate * 20,
        });
    }
const recipesByBuilding = BUILDINGS.map((_, i) => MILESTONES.filter((m) => m.building === i));
export function buildingMultiplier(s, id) {
    return (recipesByBuilding[id] ?? []).reduce((n, m) => s.milestones.includes(m.id)
        ? n * (s.legacyMilestones.includes(m.id) ? 1.5 : m.multiplier)
        : n, 1);
}
export function buildingOutput(s, id) {
    const b = BUILDINGS[id];
    if (!b)
        return 0;
    const count = s.buildings[id] ?? 0;
    let normal = b.rate * count, revived = 1, cap = 0;
    for (const m of recipesByBuilding[id] ?? []) {
        if (!s.milestones.includes(m.id))
            continue;
        if (m.revival) {
            revived *= m.multiplier;
            cap = Math.max(cap, m.cap);
        }
        else
            normal *= s.legacyMilestones.includes(m.id) ? 1.5 : m.multiplier;
    }
    return normal + (cap ? Math.min(normal * (revived - 1), cap) : 0);
}
export function milestoneReady(s, m) {
    return (!s.milestones.includes(m.id) &&
        s.prestiges >= m.gate &&
        (s.buildings[m.building] ?? 0) >= m.at &&
        s.total >= m.unlock);
}
export function milestoneVisible(s, m) {
    return (!s.milestones.includes(m.id) &&
        s.prestiges >= m.gate &&
        (s.buildings[m.building] ?? 0) >= Math.ceil(m.at * 0.8) &&
        s.total >= m.unlock * 0.5);
}
export function buyMilestone(s, id) {
    const m = MILESTONES.find((m) => m.id === id);
    if (!m || !milestoneReady(s, m) || s.sugar < m.price)
        return false;
    s.sugar = Math.max(0, s.sugar - m.price);
    s.milestones.push(id);
    s.totalMilestones++;
    return true;
}
export function nextMilestone(s, id) {
    return MILESTONES.filter((m) => m.building === id &&
        !s.milestones.includes(m.id) &&
        (!m.revival || (s.prestiges >= m.gate && s.total >= m.unlock * 0.5))).sort((a, b) => a.at - b.at || a.price - b.price)[0];
}
export const upgradeVisible = (s, id) => {
    const u = UPGRADES.find((u) => u.id === id);
    return Boolean(u &&
        !s.upgrades.includes(id) &&
        s.prestiges >= upgradeGate(id) &&
        s.total >= u.unlock * 0.25);
};
export const CHAPTERS = [
    "Le petit atelier",
    "L’empire stellaire",
    "Les routes cosmiques",
    "L’ère quantique",
    "Les créateurs d’univers",
    "Au-delà de l’éternité",
];
export function synergy(s, chapter) {
    const counts = s.buildings.slice(chapter * 6, chapter * 6 + 6);
    return counts.length === 6
        ? Math.min(5, Math.floor(Math.min(...counts) / 10)) * 0.05
        : 0;
}
export function synergyMultiplier(s) {
    return 1 + CHAPTERS.reduce((total, _, i) => total + synergy(s, i), 0);
}
export function globalMultiplier(s) {
    return safeProduct(synergyMultiplier(s), 1 + s.research.radiance * 0.2, 1 + s.totalDust * 0.02, 1 + s.achievements.length * 0.02, s.upgrades.includes("recipe") ? 1.5 : 1, s.upgrades.includes("turbo") ? 2 : 1, s.upgrades.includes("galaxy") ? 2 : 1, 2 ** s.upgrades.filter((id) => upgradeGate(id) > 0).length, 1 + s.prestiges * 0.5);
}
export function production(s, now = 0) {
    return safeProduct(BUILDINGS.reduce((v, _, i) => v + buildingOutput(s, i), 0), globalMultiplier(s), now > 0 && now < s.boostUntil ? 3 : 1);
}
/** Each 25 uninterrupted clicks unlocks one additional multiplier step. */
export const comboMaximum = (s) => 2 ** (1 + s.research.rhythm);
export const comboLimit = (s) => 25 * (comboMaximum(s) - 1);
export const comboMultiplier = (s, combo = 0) => 1 + Math.min(comboLimit(s), Math.max(0, Number.isFinite(combo) ? combo : 0)) / 25;
export function tapValue(s, combo = 0, now = Date.now()) {
    return safeProduct(comboMultiplier(s, combo), now > 0 && now < s.voyages.tapUntil ? 1.5 : 1, Math.min(LIMIT, safeProduct(1 + s.research.touch * 0.5, s.upgrades.includes("gloves") ? 2 : 1, s.upgrades.includes("spoon") ? 3 : 1, s.upgrades.includes("sugar") ? 5 : 1, 1 + s.totalDust * 0.02) + (s.upgrades.includes("echo") ? production(s) * 0.05 : 0)));
}
export function earn(s, amount) {
    if (!Number.isFinite(amount) || amount < 0)
        return;
    s.sugar = Math.min(LIMIT, s.sugar + amount);
    s.total = Math.min(LIMIT, s.total + amount);
    s.run = Math.min(LIMIT, s.run + amount);
}
export function tap(s, combo, random = Math.random(), now = Date.now()) {
    const critical = s.upgrades.includes("lucky") && random < 0.15;
    const amount = safeProduct(tapValue(s, combo, now), critical ? 5 : 1);
    earn(s, amount);
    s.clicks++;
    return { amount, critical };
}
export function quote(s, id, quantity) {
    let price = 0, count = 0;
    if (s.prestiges < buildingGate(id))
        return { count, price };
    const max = quantity === "max" ? 5000 : quantity;
    while (count < max && (s.buildings[id] ?? 5000) + count < 5000) {
        const next = cost(s, id, count);
        if (price + next > s.sugar + 1e-8)
            break;
        price += next;
        count++;
    }
    return { count, price };
}
export function buyBuilding(s, id, quantity) {
    if (!BUILDINGS[id] || s.prestiges < buildingGate(id))
        return 0;
    const q = quote(s, id, quantity);
    s.sugar = Math.max(0, s.sugar - q.price);
    s.buildings[id] = (s.buildings[id] ?? 0) + q.count;
    const coupon = s.voyages.coupon;
    if (coupon?.building === id) {
        coupon.remaining = Math.max(0, coupon.remaining - q.count);
        if (!coupon.remaining)
            s.voyages.coupon = null;
    }
    return q.count;
}
export function buyUpgrade(s, id) {
    const u = UPGRADES.find((u) => u.id === id);
    if (!u ||
        s.prestiges < upgradeGate(id) ||
        s.upgrades.includes(id) ||
        s.total < u.unlock ||
        s.sugar < u.cost)
        return false;
    s.sugar -= u.cost;
    s.upgrades.push(id);
    return true;
}
export const researchCost = (s, id) => {
    const r = RESEARCH.find((r) => r.id === id);
    return r.costs[s.research[id]] ?? Infinity;
};
export function buyResearch(s, id) {
    const r = RESEARCH.find((r) => r.id === id);
    if (!r || s.research[id] >= r.costs.length || s.prestiges < r.gate)
        return false;
    const c = researchCost(s, id);
    if (s.dust < c)
        return false;
    s.dust -= c;
    s.research[id]++;
    return true;
}
/** A one-time permanent purchase. The assistant only spends sweets, never dust. */
export function buyAutomation(s) {
    if (s.automation.owned ||
        s.prestiges < AUTOMATION.gate ||
        s.dust < AUTOMATION.cost)
        return false;
    s.dust -= AUTOMATION.cost;
    s.automation = { owned: true, enabled: true };
    return true;
}
/** One catalogue pass: normal eligibility and payment rules, cheapest recipes first. */
function purchaseRecipes(s, limit) {
    const candidates = [
        ...UPGRADES.filter((u) => !s.upgrades.includes(u.id) &&
            s.prestiges >= upgradeGate(u.id) &&
            s.total >= u.unlock).map((u) => ({
            price: u.cost,
            name: u.name,
            buy: () => buyUpgrade(s, u.id),
        })),
        ...MILESTONES.filter((m) => milestoneReady(s, m)).map((m) => ({
            price: m.price,
            name: BUILDINGS[m.building].name + " · " + m.name,
            buy: () => buyMilestone(s, m.id),
        })),
    ].sort((a, b) => a.price - b.price);
    const purchased = [];
    for (const item of candidates) {
        if (purchased.length >= limit || item.price > s.sugar)
            break;
        if (item.buy())
            purchased.push(item.name);
    }
    return purchased;
}
/** Continuous assistant is still limited to three purchases per second. */
export function automateUpgrades(s) {
    return s.automation.owned && s.automation.enabled ? purchaseRecipes(s, 3) : [];
}
export function availableRecipes(s) {
    return UPGRADES.some(u => !s.upgrades.includes(u.id) && s.prestiges >= upgradeGate(u.id) && s.total >= u.unlock && s.sugar >= u.cost)
        || MILESTONES.some(m => milestoneReady(s, m) && s.sugar >= m.price);
}
/** Explicit manual purchase, never workshops, dust research or undiscovered recipes. */
export function buyAllRecipes(s) {
    return s.research.catalogue > 0 ? purchaseRecipes(s, UPGRADES.length + MILESTONES.length) : [];
}
export const voyageDuration = (s, id) => Math.round((DESTINATIONS[id]?.duration ?? 0) * [1, 0.9, 0.8, 0.75][s.research.navigation]);
export const cometDuration = (s) => 18 + 5 * s.research.comets;
export const boostDuration = (s) => 30 + 5 * s.research.nova;
/** Prices use normal production, never Supernova, stock size or temporary perks.
 * Each route's departure surcharge is linear (+2%), capped at +50%, reset on rebirth. */
export function voyageCost(s, id) {
    const d = DESTINATIONS[id];
    if (!d)
        return LIMIT;
    return Math.min(LIMIT, Math.ceil(safeProduct(Math.max(d.cost, safeProduct(production(s), d.fuel)), 1 + Math.min(25, s.voyages.departures[id] ?? 0) * 0.02)));
}
export function claimVoyageBonus(s, now, building = 0) {
    const id = s.voyages.reward;
    if (id === null)
        return false;
    if (id === 1) {
        if (!Number.isInteger(building) || !BUILDINGS[building] || s.prestiges < buildingGate(building))
            return false;
        s.voyages.coupon = { building, remaining: 5 };
    }
    else if (id === 0)
        s.voyages.tapUntil = now + 15 * 60000;
    else if (id === 3)
        s.voyages.cometUntil = now + 20 * 60000;
    else
        return false;
    s.voyages.reward = null;
    return true;
}
export function cometReward(s, now) {
    return safeProduct(Math.max(30, production(s, now) * 35 + tapValue(s, 0, 0) * 15), now < s.voyages.cometUntil ? 1.25 : 1);
}
export function launch(s, id, now) {
    const d = DESTINATIONS[id];
    if (!d || !Number.isInteger(id) || s.prestiges < d.gate || s.expedition || s.voyages.reward !== null)
        return false;
    const price = voyageCost(s, id);
    if (s.sugar < price)
        return false;
    s.sugar -= price;
    s.voyages.departures[id] = Math.min(25, (s.voyages.departures[id] ?? 0) + 1);
    const duration = voyageDuration(s, id);
    s.expedition = { id, ends: now + duration * 1000, duration };
    return true;
}
export function recallExpedition(s) {
    if (!s.expedition)
        return false;
    s.expedition = null;
    return true; // Departure fees stay spent; no dust, no advantage, no completed-trip credit.
}
export function finishExpedition(s, now) {
    if (!s.expedition || now < s.expedition.ends)
        return 0;
    const id = s.expedition.id;
    const d = DESTINATIONS[id];
    s.expedition = null;
    if (!d)
        return 0;
    s.dust += d.dust;
    s.totalDust += d.dust;
    s.expeditions++;
    if (id === 0 || id === 1 || id === 3)
        s.voyages.reward = id;
    return d.dust;
}
export function boost(s, now) {
    if (s.total < 500 || now < s.boostReady)
        return false;
    s.boostUntil = now + boostDuration(s) * 1000;
    s.boostReady = now + 180000;
    return true;
}
export const prestigeGain = (s) => s.run < prestigeTarget(s)
    ? 0
    : 5 * (1 + Math.floor(Math.log10(s.run / prestigeTarget(s))));
export function prestige(s, now) {
    const gain = prestigeGain(s);
    if (gain < 5 || s.expedition)
        return false;
    const n = fresh(now);
    Object.assign(n, {
        total: s.total,
        dust: s.dust + gain,
        totalDust: s.totalDust + gain,
        research: { ...s.research },
        automation: { ...s.automation },
        achievements: [...s.achievements],
        clicks: s.clicks,
        expeditions: s.expeditions,
        prestiges: s.prestiges + 1,
        mission: s.mission,
        playSeconds: s.playSeconds,
        totalMilestones: s.totalMilestones,
        settings: { ...s.settings },
    });
    Object.assign(s, n);
    return true;
}
export const offlineCap = (s) => (8 + s.research.time * 2) * 3600;
export function offline(s, now) {
    const seconds = Math.max(0, Math.min(offlineCap(s), (now - s.savedAt) / 1000));
    const amount = production(s) * seconds * 0.75;
    earn(s, amount);
    const dust = finishExpedition(s, now);
    s.savedAt = now;
    s.boostUntil = 0;
    return { amount, seconds, dust };
}
export const ACHIEVEMENTS = [
    {
        id: "first",
        name: "Premier pop",
        desc: "Récolter une première douceur.",
        icon: "spark",
        test: (s) => s.clicks >= 1,
    },
    {
        id: "helper",
        name: "Un coup de main",
        desc: "Recruter un marmiton.",
        icon: "bot",
        test: (s) => (s.buildings[0] ?? 0) >= 1,
    },
    {
        id: "hundred",
        name: "Ça crépite !",
        desc: "Effectuer 100 récoltes.",
        icon: "hand",
        test: (s) => s.clicks >= 100,
    },
    {
        id: "thousand",
        name: "La voie sucrée",
        desc: "Produire 1 000 douceurs.",
        icon: "planet",
        test: (s) => s.total >= 1000,
    },
    {
        id: "ten",
        name: "Travail d’équipe",
        desc: "Posséder 10 marmitons.",
        icon: "bot",
        test: (s) => (s.buildings[0] ?? 0) >= 10,
    },
    {
        id: "moon",
        name: "Voyage, voyage",
        desc: "Terminer une expédition.",
        icon: "rocket",
        test: (s) => s.expeditions >= 1,
    },
    {
        id: "factory",
        name: "Ça tourne rond",
        desc: "Atteindre 100 douceurs par seconde.",
        icon: "mill",
        test: (s) => production(s) >= 100,
    },
    {
        id: "collector",
        name: "Collection sucrée",
        desc: "Acquérir les six types de machines.",
        icon: "hive",
        test: (s) => s.buildings.slice(0, 6).every((n) => n > 0),
    },
    {
        id: "million",
        name: "Million de mercis",
        desc: "Produire un million de douceurs.",
        icon: "star",
        test: (s) => s.total >= 1e6,
    },
    {
        id: "explorer",
        name: "Sans frontières",
        desc: "Terminer 10 expéditions.",
        icon: "comet",
        test: (s) => s.expeditions >= 10,
    },
    {
        id: "rebirth",
        name: "Un nouveau départ",
        desc: "Accomplir une renaissance.",
        icon: "orbit",
        test: (s) => s.prestiges >= 1,
    },
    {
        id: "universe",
        name: "L’infini gourmand",
        desc: "Produire 100 millions de douceurs.",
        icon: "sun",
        test: (s) => s.total >= 1e8,
    },
    {
        id: "forge",
        name: "Feu nouveau",
        desc: "Construire une forge de météores.",
        icon: "star",
        test: (s) => (s.buildings[6] ?? 0) > 0,
    },
    {
        id: "ocean",
        name: "La grande marée",
        desc: "Construire un océan de caramel.",
        icon: "star",
        test: (s) => (s.buildings[7] ?? 0) > 0,
    },
    {
        id: "pulsar",
        name: "Battement cosmique",
        desc: "Construire un pulsar praliné.",
        icon: "star",
        test: (s) => (s.buildings[8] ?? 0) > 0,
    },
    {
        id: "nebula",
        name: "Au-delà des nuages",
        desc: "Construire une nébuleuse dragée.",
        icon: "star",
        test: (s) => (s.buildings[9] ?? 0) > 0,
    },
    {
        id: "spiral",
        name: "À l’échelle des galaxies",
        desc: "Construire une galaxie pâtissière.",
        icon: "star",
        test: (s) => (s.buildings[10] ?? 0) > 0,
    },
    {
        id: "horizon",
        name: "La dernière frontière",
        desc: "Construire un horizon des délices.",
        icon: "star",
        test: (s) => (s.buildings[11] ?? 0) > 0,
    },
    {
        id: "cycles3",
        name: "Trois vies",
        desc: "Accomplir 3 renaissances.",
        icon: "star",
        test: (s) => s.prestiges >= 3,
    },
    {
        id: "cycles8",
        name: "Les huit ciels",
        desc: "Accomplir 8 renaissances.",
        icon: "star",
        test: (s) => s.prestiges >= 8,
    },
    {
        id: "cycles12",
        name: "Le grand voyage",
        desc: "Accomplir 12 renaissances.",
        icon: "star",
        test: (s) => s.prestiges >= 12,
    },
    {
        id: "fleet",
        name: "La flotte des étoiles",
        desc: "Terminer 50 expéditions.",
        icon: "star",
        test: (s) => s.expeditions >= 50,
    },
    {
        id: "researcher",
        name: "La mémoire du cosmos",
        desc: "Atteindre le niveau 10 en éclat cosmique.",
        icon: "star",
        test: (s) => s.research.radiance >= 10,
    },
    {
        id: "beyond",
        name: "Au-delà de l’infini",
        desc: "Produire 10 puissance 25 douceurs.",
        icon: "star",
        test: (s) => s.total >= 1e25,
    },
    {
        id: "chapter0",
        name: "Maître des ateliers",
        desc: "Posséder 10 exemplaires de chaque machine du chapitre 1.",
        icon: "trophy",
        test: (s) => synergy(s, 0) > 0,
    },
    {
        id: "chapter1",
        name: "Maître des étoiles",
        desc: "Posséder 10 exemplaires de chaque machine du chapitre 2.",
        icon: "trophy",
        test: (s) => synergy(s, 1) > 0,
    },
    {
        id: "chapter2",
        name: "Maître des routes",
        desc: "Posséder 10 exemplaires de chaque machine du chapitre 3.",
        icon: "trophy",
        test: (s) => synergy(s, 2) > 0,
    },
    {
        id: "chapter3",
        name: "Maître quantique",
        desc: "Posséder 10 exemplaires de chaque machine du chapitre 4.",
        icon: "trophy",
        test: (s) => synergy(s, 3) > 0,
    },
    {
        id: "chapter4",
        name: "Créateur d’univers",
        desc: "Posséder 10 exemplaires de chaque machine du chapitre 5.",
        icon: "trophy",
        test: (s) => synergy(s, 4) > 0,
    },
    {
        id: "recipes1",
        name: "Le livre aux 1 recettes",
        desc: "Acheter 1 recettes de palier au total.",
        icon: "book",
        test: (s) => s.totalMilestones >= 1,
    },
    {
        id: "recipes10",
        name: "Le livre aux 10 recettes",
        desc: "Acheter 10 recettes de palier au total.",
        icon: "book",
        test: (s) => s.totalMilestones >= 10,
    },
    {
        id: "recipes25",
        name: "Le livre aux 25 recettes",
        desc: "Acheter 25 recettes de palier au total.",
        icon: "book",
        test: (s) => s.totalMilestones >= 25,
    },
    {
        id: "recipes50",
        name: "Le livre aux 50 recettes",
        desc: "Acheter 50 recettes de palier au total.",
        icon: "book",
        test: (s) => s.totalMilestones >= 50,
    },
    {
        id: "recipes100",
        name: "Le livre aux 100 recettes",
        desc: "Acheter 100 recettes de palier au total.",
        icon: "book",
        test: (s) => s.totalMilestones >= 100,
    },
    {
        id: "recipes200",
        name: "Le livre aux 200 recettes",
        desc: "Acheter 200 recettes de palier au total.",
        icon: "book",
        test: (s) => s.totalMilestones >= 200,
    },
    {
        id: "wealth12",
        name: "Le cap des 10 puissance 12",
        desc: "Produire 10 puissance 12 douceurs au total.",
        icon: "spark",
        test: (s) => s.total >= 1e12,
    },
    {
        id: "wealth18",
        name: "Le cap des 10 puissance 18",
        desc: "Produire 10 puissance 18 douceurs au total.",
        icon: "spark",
        test: (s) => s.total >= 1e18,
    },
    {
        id: "wealth30",
        name: "Le cap des 10 puissance 30",
        desc: "Produire 10 puissance 30 douceurs au total.",
        icon: "spark",
        test: (s) => s.total >= 1e30,
    },
    {
        id: "wealth40",
        name: "Le cap des 10 puissance 40",
        desc: "Produire 10 puissance 40 douceurs au total.",
        icon: "spark",
        test: (s) => s.total >= 1e40,
    },
    {
        id: "wealth50",
        name: "Le cap des 10 puissance 50",
        desc: "Produire 10 puissance 50 douceurs au total.",
        icon: "spark",
        test: (s) => s.total >= 1e50,
    },
    {
        id: "wealth60",
        name: "Le cap des 10 puissance 60",
        desc: "Produire 10 puissance 60 douceurs au total.",
        icon: "spark",
        test: (s) => s.total >= 1e60,
    },
    {
        id: "wealth70",
        name: "Le cap des 10 puissance 70",
        desc: "Produire 10 puissance 70 douceurs au total.",
        icon: "spark",
        test: (s) => s.total >= 1e70,
    },
    {
        id: "wealth80",
        name: "Le cap des 10 puissance 80",
        desc: "Produire 10 puissance 80 douceurs au total.",
        icon: "spark",
        test: (s) => s.total >= 1e80,
    },
    {
        id: "fullchapter2",
        name: "Les six horizons — 3",
        desc: "Construire chaque machine du chapitre 3.",
        icon: "planet",
        test: (s) => s.buildings.slice(12, 18).every((n) => n > 0),
    },
    {
        id: "fullchapter3",
        name: "Les six horizons — 4",
        desc: "Construire chaque machine du chapitre 4.",
        icon: "planet",
        test: (s) => s.buildings.slice(18, 24).every((n) => n > 0),
    },
    {
        id: "fullchapter4",
        name: "Les six horizons — 5",
        desc: "Construire chaque machine du chapitre 5.",
        icon: "planet",
        test: (s) => s.buildings.slice(24, 30).every((n) => n > 0),
    },
    {
        id: "fullchapter5",
        name: "Les six horizons — 6",
        desc: "Construire chaque machine du chapitre 6.",
        icon: "planet",
        test: (s) => s.buildings.slice(30, 36).every((n) => n > 0),
    },
    {
        id: "revivalrecipe",
        name: "Le retour des anciens",
        desc: "Acheter une recette de seconde jeunesse.",
        icon: "bot",
        test: (s) => s.milestones.some((id) => id.startsWith("revival-")),
    },
];
export const MISSIONS = [
    {
        title: "Tout commence par un pop",
        desc: "Récoltez 15 fois votre planète.",
        target: 15,
        read: (s) => s.clicks,
        reward: 35,
        dust: 0,
    },
    {
        title: "Votre tout premier équipage",
        desc: "Recrutez 3 marmitons cosmiques.",
        target: 3,
        read: (s) => s.buildings[0] ?? 0,
        reward: 120,
        dust: 0,
    },
    {
        title: "Le bonheur tourne en boucle",
        desc: "Construisez votre premier moulin.",
        target: 1,
        read: (s) => s.buildings[1] ?? 0,
        reward: 300,
        dust: 0,
    },
    {
        title: "Mille et une douceurs",
        desc: "Produisez 1 000 douceurs au total.",
        target: 1000,
        read: (s) => s.total,
        reward: 600,
        dust: 1,
    },
    {
        title: "La petite armée sucrée",
        desc: "Recrutez 10 marmitons. Production × 1,5 !",
        target: 10,
        read: (s) => s.buildings[0] ?? 0,
        reward: 1000,
        dust: 1,
    },
    {
        title: "Un aller-retour dans les étoiles",
        desc: "Terminez votre première expédition.",
        target: 1,
        read: (s) => s.expeditions,
        reward: 3000,
        dust: 2,
    },
    {
        title: "Un petit jardin extraterrestre",
        desc: "Construisez 3 serres lunaires.",
        target: 3,
        read: (s) => s.buildings[2] ?? 0,
        reward: 6000,
        dust: 2,
    },
    {
        title: "Vitesse de croisière",
        desc: "Atteignez 100 douceurs par seconde.",
        target: 100,
        read: (s) => production(s),
        reward: 15000,
        dust: 3,
    },
    {
        title: "Votre premier million",
        desc: "Produisez un million de douceurs.",
        target: 1e6,
        read: (s) => s.total,
        reward: 100000,
        dust: 5,
    },
    {
        title: "Un nouvel horizon",
        desc: "Faites renaître votre planète.",
        target: 1,
        read: (s) => s.prestiges,
        reward: 500,
        dust: 5,
    },
    {
        title: "L’ère : Forge de météores",
        desc: "Construisez votre premier forge de météores.",
        target: 1,
        read: (s) => s.buildings[6] ?? 0,
        reward: 10000000.0,
        dust: 5,
    },
    {
        title: "L’ère : Océan de caramel",
        desc: "Construisez votre premier océan de caramel.",
        target: 1,
        read: (s) => s.buildings[7] ?? 0,
        reward: 2000000000.0,
        dust: 10,
    },
    {
        title: "L’ère : Pulsar praliné",
        desc: "Construisez votre premier pulsar praliné.",
        target: 1,
        read: (s) => s.buildings[8] ?? 0,
        reward: 500000000000.0,
        dust: 15,
    },
    {
        title: "L’ère : Nébuleuse dragée",
        desc: "Construisez votre premier nébuleuse dragée.",
        target: 1,
        read: (s) => s.buildings[9] ?? 0,
        reward: 250000000000000.0,
        dust: 20,
    },
    {
        title: "L’ère : Galaxie pâtissière",
        desc: "Construisez votre premier galaxie pâtissière.",
        target: 1,
        read: (s) => s.buildings[10] ?? 0,
        reward: 2e17,
        dust: 25,
    },
    {
        title: "L’ère : Horizon des délices",
        desc: "Construisez votre premier horizon des délices.",
        target: 1,
        read: (s) => s.buildings[11] ?? 0,
        reward: 4e20,
        dust: 30,
    },
    {
        title: "La maîtrise du chapitre 3",
        desc: "Possédez 10 exemplaires des 6 machines de ce chapitre.",
        target: 1,
        read: (s) => (synergy(s, 2) > 0 ? 1 : 0),
        reward: 10000000000000000000000000,
        dust: 200,
    },
    {
        title: "La maîtrise du chapitre 4",
        desc: "Possédez 10 exemplaires des 6 machines de ce chapitre.",
        target: 1,
        read: (s) => (synergy(s, 3) > 0 ? 1 : 0),
        reward: 10000000000000000000000000000000000000,
        dust: 300,
    },
    {
        title: "La maîtrise du chapitre 5",
        desc: "Possédez 10 exemplaires des 6 machines de ce chapitre.",
        target: 1,
        read: (s) => (synergy(s, 4) > 0 ? 1 : 0),
        reward: 10000000000000000000000000000000000000000000000000,
        dust: 400,
    },
];
export function claimMission(s) {
    const m = MISSIONS[s.mission];
    if (!m || m.read(s) < m.target)
        return false;
    earn(s, m.reward);
    s.dust += m.dust;
    s.totalDust += m.dust;
    s.mission++;
    return true;
}
function finite(v, max = LIMIT) {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > max)
        throw new Error("Valeur de sauvegarde invalide.");
    return v;
}
export function parseSave(text, now = Date.now()) {
    if (text.length > 100000)
        throw new Error("Fichier trop volumineux.");
    const v = JSON.parse(text);
    if (!v || typeof v !== "object")
        throw Error("Sauvegarde invalide.");
    const x = v;
    if (x.version !== 1)
        throw Error("Version de sauvegarde inconnue.");
    const s = fresh(now);
    if (x.automation && typeof x.automation === "object") {
        const a = x.automation;
        s.automation = {
            owned: a.owned === true,
            enabled: a.owned === true && a.enabled === true,
        };
    }
    for (const k of [
        "sugar",
        "total",
        "run",
        "dust",
        "totalDust",
        "clicks",
        "expeditions",
        "prestiges",
        "playSeconds",
    ])
        s[k] = finite(x[k]);
    if (s.sugar > s.total || s.run > s.total || s.dust > s.totalDust)
        throw Error("Sauvegarde incohérente.");
    if (!Array.isArray(x.buildings) ||
        ![6, 12, 30, BUILDINGS.length].includes(x.buildings.length))
        throw Error("Machines invalides.");
    s.buildings = x.buildings.map((n) => {
        finite(n, 5000);
        if (!Number.isInteger(n))
            throw Error("Machines invalides.");
        return n;
    });
    while (s.buildings.length < BUILDINGS.length)
        s.buildings.push(0);
    if (x.milestones === undefined) {
        s.milestones = MILESTONES.filter((m) => !m.revival && m.at <= 200 && (s.buildings[m.building] ?? 0) >= m.at).map((m) => m.id);
    }
    else {
        if (!Array.isArray(x.milestones))
            throw Error("Recettes invalides.");
        s.milestones = [
            ...new Set(x.milestones.filter((id) => typeof id === "string" && MILESTONES.some((m) => m.id === id))),
        ];
    }
    s.legacyMilestones =
        x.milestones === undefined
            ? [...s.milestones]
            : Array.isArray(x.legacyMilestones)
                ? x.legacyMilestones.filter((id) => typeof id === "string" &&
                    s.milestones.includes(id) &&
                    MILESTONES.some((m) => m.id === id && !m.revival && m.at <= 200))
                : [];
    s.totalMilestones =
        x.totalMilestones === undefined ? 0 : finite(x.totalMilestones);
    if (!Array.isArray(x.upgrades) || !Array.isArray(x.achievements))
        throw Error("Collection invalide.");
    s.upgrades = [
        ...new Set(x.upgrades.filter((n) => typeof n === "string" && UPGRADES.some((u) => u.id === n))),
    ];
    s.achievements = [
        ...new Set(x.achievements.filter((n) => typeof n === "string" && ACHIEVEMENTS.some((a) => a.id === n))),
    ];
    if (!x.research || typeof x.research !== "object")
        throw Error("Recherches invalides.");
    for (const r of RESEARCH) {
        const raw = x.research[r.id];
        const n = raw === undefined && r.gate > 0 ? 0 : raw;
        finite(n, r.costs.length);
        if (!Number.isInteger(n))
            throw Error("Recherche invalide.");
        s.research[r.id] = n;
    }
    if (x.dustEconomy !== undefined && x.dustEconomy !== 1 && x.dustEconomy !== 2)
        throw Error("Version de l’économie de poussière inconnue.");
    if (x.dustEconomy !== 2) {
        // Return the price reduction once, without minting earned dust or increasing its multiplier.
        let refund = s.automation.owned ? 1200 : 0;
        for (const [id, base] of [["radiance", 3], ["touch", 2], ["time", 2]]) {
            const level = s.research[id];
            if (level > 10)
                throw Error("Niveau de recherche historique invalide.");
            refund += base * (2 ** level - 1 - level * (level + 1) / 2);
        }
        s.dust += Math.min(refund, Math.max(0, s.totalDust - s.dust));
    }
    s.mission = finite(x.mission, MISSIONS.length);
    if (!Number.isInteger(s.mission))
        throw Error("Mission invalide.");
    s.savedAt = Math.min(now, finite(x.savedAt, 1e15));
    s.boostUntil = Math.min(now + boostDuration(s) * 1000, finite(x.boostUntil, 1e15));
    s.boostReady = Math.min(now + 180000, finite(x.boostReady, 1e15));
    if (x.expedition !== null) {
        if (!x.expedition || typeof x.expedition !== "object")
            throw Error("Expédition invalide.");
        const e = x.expedition;
        const id = finite(e.id, DESTINATIONS.length - 1);
        if (!Number.isInteger(id))
            throw Error("Destination invalide.");
        const duration = e.duration === undefined ? DESTINATIONS[id].duration : finite(e.duration, DESTINATIONS[id].duration);
        if (duration < DESTINATIONS[id].duration * 0.75)
            throw Error("Durée de voyage invalide.");
        s.expedition = {
            id,
            duration,
            ends: Math.min(now + duration * 1000, finite(e.ends, 1e15)),
        };
    }
    if (x.voyages !== undefined) {
        if (!x.voyages || typeof x.voyages !== "object")
            throw Error("Voyages invalides.");
        const v = x.voyages;
        if (!Array.isArray(v.departures) || v.departures.length !== DESTINATIONS.length)
            throw Error("Départs invalides.");
        s.voyages.departures = v.departures.map(n => {
            const count = finite(n, 25);
            if (!Number.isInteger(count))
                throw Error("Départs invalides.");
            return count;
        });
        if (v.reward !== null) {
            if (![0, 1, 3].includes(v.reward) || s.expedition)
                throw Error("Retour de voyage invalide.");
            s.voyages.reward = v.reward;
        }
        s.voyages.tapUntil = Math.min(now + 15 * 60000, finite(v.tapUntil, 1e15));
        s.voyages.cometUntil = Math.min(now + 20 * 60000, finite(v.cometUntil, 1e15));
        if (v.coupon !== null) {
            if (!v.coupon || typeof v.coupon !== "object")
                throw Error("Bon invalide.");
            const c = v.coupon;
            const building = finite(c.building, BUILDINGS.length - 1), remaining = finite(c.remaining, 5);
            if (!Number.isInteger(building) || !Number.isInteger(remaining) || remaining < 1 || s.prestiges < buildingGate(building))
                throw Error("Bon invalide.");
            s.voyages.coupon = { building, remaining };
        }
    }
    if (x.settings && typeof x.settings === "object") {
        const o = x.settings;
        s.settings = {
            muted: typeof o.muted === "boolean" ? o.muted : false,
            sound: typeof o.sound === "boolean" ? o.sound : true,
            music: typeof o.music === "boolean" ? o.music : true,
            musicVolume: typeof o.musicVolume === "number" && Number.isFinite(o.musicVolume)
                ? Math.max(0, Math.min(1, o.musicVolume))
                : 0.35,
            motion: typeof o.motion === "boolean" ? o.motion : true,
            theme: ["lavande", "menthe", "aurore", "minuit"].includes(String(o.theme))
                ? o.theme
                : "lavande",
            volume: typeof o.volume === "number" && Number.isFinite(o.volume)
                ? Math.max(0, Math.min(1, o.volume))
                : 0.45,
        };
    }
    return s;
}
