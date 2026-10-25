import { BUILDINGS, UPGRADES, RESEARCH, DESTINATIONS, TIERS, ACHIEVEMENTS, MISSIONS, fresh, fmt, timeFmt, tier, cost, production, tapValue, tap, quote, buyBuilding, buyUpgrade, buyResearch, researchCost, launch, finishExpedition, boost, prestige, prestigeGain, earn, offline, claimMission, buildingOutput, globalMultiplier, CHAPTERS, synergy, buildingGate, upgradeGate, prestigeTarget, MILESTONES, milestoneVisible, milestoneReady, buyMilestone, upgradeVisible, AUTOMATION, buyAutomation, automateUpgrades, } from "./engine.js";
import { Storage, exportEncrypted, importEncrypted } from "./storage.js";
import { AudioManager } from "./audio.js";
import { icon, planetArt, planetForm, PLANET_FORMS, workshopArt } from "./art.js";
const $ = (q) => document.querySelector(q);
const app = $("#app"), modal = $("#modal"), audio = new AudioManager(), storage = new Storage();
let family = 0;
let state = fresh(), view = "planet", shopTab = "machines", quantity = 1, combo = 0, lastTap = 0, lastFrame = Date.now(), lastPaint = 0, lastAudit = 0, lastSave = 0, nextComet = Date.now() + 35000, cometEnds = 0, readOnly = false, storageFailed = false, initialized = false, saveTimer;
let raf = 0;
let renderedShopSignature = "";
let waitingUpdate = false;
let installed = matchMedia("(display-mode: standalone)").matches ||
    Boolean(navigator.standalone);
try {
    installed ||=
        localStorage.getItem("cosmo-pop-installed:" + location.pathname) === "1";
}
catch { }
function syncAppControl() {
    const button = $("#app-control");
    if (!button)
        return;
    button.dataset.action = installed || waitingUpdate ? "update" : "install";
    button.innerHTML = icon(installed || waitingUpdate ? "refresh" : "download");
    button.classList.toggle("update-ready", waitingUpdate);
    button.setAttribute("aria-label", waitingUpdate
        ? "Installer la mise à jour"
        : installed
            ? "Rechercher une mise à jour"
            : "Installer le jeu");
    button.title = button.getAttribute("aria-label");
}
function rememberInstallation() {
    installed = true;
    try {
        localStorage.setItem("cosmo-pop-installed:" + location.pathname, "1");
    }
    catch { }
    syncAppControl();
}
let installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
});
window.addEventListener("appinstalled", () => {
    installPrompt = null;
    rememberInstallation();
    toast("Cosmo Pop est installé.", "success");
});
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function toast(message, type = "normal") {
    const box = document.createElement("div");
    box.className = "toast " + type;
    box.innerHTML =
        icon(type === "success" ? "check" : "spark") +
            '<span class="toast-message"></span>';
    box.querySelector(".toast-message").textContent = message;
    while ($("#toasts").children.length >= 2)
        $("#toasts").firstElementChild.remove();
    $("#toasts").append(box);
    setTimeout(() => box.remove(), type === "success" ? 3300 : 4500);
}
function dialog(title, content) {
    modal.innerHTML = `<div class="modal-heading"><h2 id="modal-title">${title}</h2><button class="icon-button" data-action="close" aria-label="Fermer">${icon("close")}</button></div>${content}`;
    if (!modal.open)
        modal.showModal();
}
function syncSettings() {
    document.documentElement.dataset.theme = state.settings.theme;
    document.querySelector("meta[name=theme-color]")?.setAttribute("content", {
        lavande: "#7851e8",
        menthe: "#2d8b78",
        aurore: "#bd6b58",
        minuit: "#171d35",
    }[state.settings.theme]);
    audio.enabled = state.settings.sound;
    audio.volume = state.settings.volume;
    audio.setActive(initialized && !readOnly && !document.hidden);
    audio.setMusic(state.settings.music, state.settings.musicVolume);
    document.documentElement.dataset.motion = String(state.settings.motion && !reduced.matches);
    const sound = $("#sound");
    sound.innerHTML = icon(state.settings.sound ? "volume" : "mute");
    sound.setAttribute("aria-label", state.settings.sound ? "Couper les bruitages" : "Activer les bruitages");
    sound.setAttribute("aria-pressed", String(state.settings.sound));
}
function shell() {
    app.innerHTML = `
<header class="site-header"><a class="brand" href="./" aria-label="Cosmo Pop, accueil"><img src="./icon-192-v13.png" alt="" width="42" height="42"><span>cosmo<span class="brand-pop">pop</span><small>L’ATELIER DES ÉTOILES</small></span></a>
<nav class="desktop-nav" aria-label="Navigation principale">${navItems(false)}</nav>
<div class="header-tools"><button id="app-control" class="icon-button" data-action="install" aria-label="Installer le jeu">${icon("download")}</button><span class="save-status" id="save-status">${icon("lock")} Chiffrée</span><button class="icon-button" id="sound" data-action="sound" aria-label="Couper les bruitages"></button><button class="icon-button" data-action="settings" aria-label="Réglages et sauvegarde">${icon("settings")}</button></div></header>
<main id="main" tabindex="-1"><div class="intro"><div><p class="eyebrow">UN PETIT POP. DES POSSIBILITÉS INFINIES.</p><h1>La tête dans les étoiles.<br class="mobile-break"> Les mains dans le sucre.</h1></div><span class="live-pill"><i></i> Votre univers prend vie</span></div>
<section class="resources" aria-label="Vos ressources"><div class="resource primary"><span class="resource-icon">${icon("sugar")}</span><div><span class="resource-label">Vos douceurs</span><strong id="sugar">0</strong></div><span class="resource-extra">À savourer<br>sans modération.</span></div><div class="resource"><span class="resource-icon mint">${icon("bolt")}</span><div><span class="resource-label">Production</span><strong><span id="rate">0</span><small> / s</small></strong></div></div><div class="resource"><span class="resource-icon peach">${icon("star")}</span><div><span class="resource-label">Poussière d’étoile</span><strong id="dust">0</strong></div><button class="subtle-info" data-action="dust-info" aria-label="À quoi sert la poussière d’étoile ?">${icon("info")}</button></div></section>
<div class="game-layout"><section class="planet-column" aria-label="Votre planète"><div class="scene"><div class="scene-heading"><span class="section-kicker">${icon("planet")} PLANÈTE <span id="planet-number">01</span></span><span class="stage-label" id="stage-label">Niveau 1</span></div><h2 id="planet-name">Pépite naissante</h2><p class="scene-subtitle" id="scene-subtitle">Les plus grands empires commencent tout petits.</p>
<div class="planet-stage"><button id="planet" class="planet-button" data-action="tap" aria-label="Récolter des douceurs">${planetArt(tier(state) + 1)}</button><div id="particles" aria-hidden="true"></div><button class="comet" id="comet" data-action="comet" hidden>${icon("comet")}<span>Une comète !<small>Attrapez-moi</small></span></button><div class="orbit-note note-left">${icon("heart")} 100 % fait avec amour</div><div class="orbit-note note-right">${icon("spark")} Un univers à croquer</div></div>
<div class="tap-caption"><span>Touchez la planète pour récolter</span><b id="tap-value">+1 douceur</b></div><div class="combo"><div class="combo-top"><span>${icon("bolt")} <span id="combo-label">Trouvez votre rythme</span></span><strong id="combo-value">× 1</strong></div><div class="progress combo-progress"><i id="combo-bar"></i></div></div>
<div class="planet-progress"><div><span>Prochaine évolution</span><strong id="evolution-count">0 / 500</strong></div><div class="progress"><i id="evolution-bar"></i></div><p id="evolution-name">Petite confiserie ${icon("arrow")}</p></div>
<button class="boost-button" data-action="boost" id="boost-button" disabled><span class="boost-icon">${icon("bolt")}</span><span><strong>Supernova sucrée</strong><small id="boost-desc">Disponible à 500 douceurs produites</small></span><b id="boost-tag">× 3</b></button>
</div><section class="mission-card" aria-label="Votre objectif"><div class="mission-icon">${icon("rocket")}</div><div class="mission-body"><span class="section-kicker">LE PETIT DÉFI</span><h3 id="mission-title"></h3><p id="mission-desc"></p><div class="mission-bottom"><div class="progress"><i id="mission-bar"></i></div><span id="mission-count"></span></div></div><button id="mission-claim" data-action="mission" class="reward-button" disabled></button></section></section>
<section class="workshop" aria-label="Gestion de votre empire"><div id="panel"></div></section></div>
<footer class="site-footer"><span>${icon("leaf")} Un petit univers, à votre rythme.</span><span id="footer-stat">36 machines · 6 chapitres à explorer · des milliards de douceurs</span><button data-action="help">Comment jouer ${icon("arrow")}</button></footer></main>
<nav class="mobile-nav" aria-label="Navigation mobile">${navItems(true)}</nav><div class="session-banner" id="session-banner" hidden>Cette partie est déjà ouverte dans un autre onglet. Fermez cet onglet, puis actualisez ici.</div>`;
    syncSettings();
    syncAppControl();
    renderPanel();
    setView("planet");
}
function navItems(mobile) {
    return [
        ["planet", "planet", "Planète"],
        ["atelier", "bot", "Atelier"],
        ["voyages", "rocket", "Voyages"],
        ["cosmos", "star", "Cosmos"],
    ]
        .map(([id, i, label]) => `<button data-view="${id}" class="nav-item ${id === "planet" ? "active" : ""}" aria-current="${id === "planet" ? "page" : "false"}">${icon(i)}<span>${label}</span>${mobile ? "" : "<i></i>"}</button>`)
        .join("");
}
function setView(v) {
    view = v;
    document.body.dataset.view = v;
    document.querySelectorAll("[data-view]").forEach((n) => {
        const active = n.dataset.view === v;
        n.classList.toggle("active", active);
        n.setAttribute("aria-current", active ? "page" : "false");
    });
    if (v === "planet")
        shopTab = "machines";
    if (v === "atelier")
        shopTab = "machines";
    renderPanel();
    if (innerWidth < 760)
        window.scrollTo({ top: 0, behavior: "instant" });
}
function renderPanel() {
    if (view === "planet" || view === "atelier")
        renderShop();
    else if (view === "voyages")
        renderVoyages();
    else
        renderCosmos();
    paint(Date.now());
}
function visibleRecipes() {
    return BUILDINGS.flatMap((_, i) => {
        const base = MILESTONES.find((m) => m.building === i && !m.revival && !state.milestones.includes(m.id));
        const revival = MILESTONES.find((m) => m.building === i && m.revival && !state.milestones.includes(m.id));
        return [base, revival].filter((m) => Boolean(m && milestoneVisible(state, m)));
    });
}
function shopSignature() {
    return [
        ...UPGRADES.filter((u) => upgradeVisible(state, u.id)).map((u) => u.id),
        ...visibleRecipes().map((m) => m.id),
        String(state.upgrades.length),
        String(state.milestones.length),
    ].join("|");
}
function renderShop() {
    renderedShopSignature = shopSignature();
    const recipes = visibleRecipes(), ideas = UPGRADES.filter((u) => upgradeVisible(state, u.id));
    $("#panel").innerHTML =
        `<div class="panel-heading"><div><span class="eyebrow">UN EMPIRE QUI GRANDIT</span><h2>Votre atelier<span class="title-dot">.</span></h2></div><span class="badge">${icon("bot")} <span id="total-machines">0</span></span></div>
 <div class="shop-tabs" role="tablist" aria-label="Catégories de l’atelier"><button role="tab" data-shop="machines" aria-selected="${shopTab === "machines"}" class="${shopTab === "machines" ? "active" : ""}">${icon("bot")} Machines</button><button role="tab" data-shop="upgrades" aria-selected="${shopTab === "upgrades"}" class="${shopTab === "upgrades" ? "active" : ""}">${icon("book")} Recettes <span class="tab-dot" id="upgrade-dot"></span></button></div>
 ${shopTab === "machines"
            ? `<div class="shop-toolbar"><span>Un peu d’aide pour voir grand.</span><div class="quantity" role="group" aria-label="Quantité à acheter">${[1, 10, "max"].map((q) => `<button data-quantity="${q}" aria-pressed="${quantity === q}" class="${quantity === q ? "active" : ""}">${q === "max" ? "Max" : "×" + q}</button>`).join("")}</div></div>
 <div class="chapter-tabs" role="group" aria-label="Chapitres de l’atelier">${CHAPTERS.map((name, i) => `<button data-family="${i}" aria-pressed="${family === i}" title="${name}" class="${family === i ? "active" : ""}">${i + 1}</button>`).join("")}</div><p class="chapter-description"><strong>${CHAPTERS[family]}</strong> · synergie : +${fmt(synergy(state, family) * 100)} %.<br>10 de chaque machine : +5 % de production globale, jusqu’à +25 %.</p>
 <div class="machine-list">${BUILDINGS.map((b, i) => (Math.floor(i / 6) === family ? `<article class="machine" id="machine-${i}"><div class="machine-icon artwork">${workshopArt(i)}<i class="machine-ready" id="machine-ready-${i}" hidden aria-hidden="true"></i></div><div class="machine-body"><div class="machine-title"><h3>${b.name}</h3><span class="owned" id="owned-${i}">0</span></div><p>${b.desc}</p><div class="machine-meta"><span>${icon("bolt")} <b id="machine-rate-${i}">0</b> / s</span><span class="milestone" id="milestone-${i}"></span></div></div><button class="buy-button" data-buy="${i}" id="buy-${i}" disabled><span>${icon("sugar")} <b id="price-${i}">${fmt(b.cost)}</b></span><small id="buy-label-${i}">Recruter</small></button></article>` : "")).join("")}</div><div class="shop-tip">${icon("book")}<p>Les paliers débloquent des <strong>recettes à acheter</strong>. Les effets varient selon l’atelier ; certaines découvertes redonnent un rôle aux premiers marmitons.</p></div>`
            : `<p class="panel-description">Les découvertes apparaissent quand vous vous en approchez. Une recette de palier s’achète avec des douceurs et agit sur son atelier jusqu’à la prochaine renaissance.</p>
 ${ideas.length ? '<h3 class="subheading">Les nouvelles idées</h3>' : ""}<div class="upgrade-list">${ideas.map((u) => `<article class="upgrade-card" id="upgrade-${u.id}"><span class="machine-icon violet">${icon(u.icon)}</span><div><h3>${u.name}</h3><p>${u.desc}</p><small class="unlock-hint" id="unlock-${u.id}"></small></div><button class="buy-button" data-upgrade="${u.id}" id="upgrade-buy-${u.id}"><span>${icon("sugar")}${fmt(u.cost)}</span><small>Améliorer</small></button></article>`).join("")}</div>
 ${recipes.length ? '<h3 class="subheading">Le savoir-faire des ateliers</h3>' : ""}<div class="upgrade-list">${recipes.map((m) => `<article class="upgrade-card ${m.revival ? "revival-card" : ""}"><span class="machine-icon artwork">${workshopArt(m.building)}</span><div><h3>${m.name}</h3><p>${BUILDINGS[m.building].name} · production × ${fmt(m.multiplier)}</p><small class="unlock-hint">${m.at} exemplaires${m.unlock ? " · " + fmt(m.unlock) + " produites" : ""}${m.revival ? " · bonus limité à " + fmt(m.cap) + "/s avant bonus globaux" : ""}</small></div><button class="buy-button" data-milestone="${m.id}" id="milestone-buy-${m.id}"><span>${icon("sugar")}${fmt(m.price)}</span><small>Acheter</small></button></article>`).join("")}</div>
 ${!ideas.length && !recipes.length ? `<div class="empty-discovery">${icon("spark")}<h3>Une idée est en train de germer…</h3><p>Développez vos ateliers pour découvrir les prochaines recettes.</p></div>` : ""}
 <details class="acquired-recipes"><summary>Recettes acquises dans cette vie · ${state.upgrades.length + state.milestones.length}</summary><ul>${state.upgrades.map((id) => `<li>${UPGRADES.find((u) => u.id === id)?.name ?? ""}</li>`).join("")}${state.milestones
                .map((id) => {
                const m = MILESTONES.find((m) => m.id === id);
                return `<li>${BUILDINGS[m.building].name} · ${m.name} × ${fmt(state.legacyMilestones.includes(id) ? 1.5 : m.multiplier)}</li>`;
            })
                .join("")}</ul></details>`}`;
}
function renderVoyages() {
    $("#panel").innerHTML =
        `<div class="panel-heading"><div><span class="eyebrow">L’UNIVERS A BON GOÛT</span><h2>Les grands voyages<span class="title-dot">.</span></h2></div><span class="badge">${icon("rocket")}</span></div><p class="panel-description">Envoyez votre équipage explorer le cosmos.<br>Rapportez de la poussière pour grandir durablement.</p><div id="expedition-status" class="expedition-status"></div><div class="destination-list">${DESTINATIONS.map((d, i) => `<article class="destination"><div class="destination-art ${d.color}">${icon(i === 2 ? "nebula" : d.icon)}<i></i><i></i><i></i><span>0${i + 1}</span></div><div class="destination-body"><h3>${d.name}</h3><p>${d.desc}</p><div class="destination-meta"><span>${icon("clock")} ${timeFmt(d.duration)}</span><span>${icon("star")} +${d.dust} poussière${d.dust > 1 ? "s" : ""}</span></div><button class="wide-buy" data-launch="${i}" id="launch-${i}"><span>Explorer ${icon("arrow")}</span><b>${icon("sugar")}${fmt(d.cost)}</b></button></div></article>`).join("")}</div><div class="shop-tip">${icon("star")}<p>Chaque poussière <strong>gagnée</strong> ajoute définitivement <strong>+2 %</strong> aux récoltes et à la production, même après avoir été dépensée.</p></div>`;
}
function automationCard() {
    const owned = state.automation.owned;
    return `<section class="automation-card research-card"><span class="machine-icon mint">${icon("bot")}</span><div><h3>${AUTOMATION.name}<small>Recherche permanente · achat unique</small></h3><p>Achète les recettes générales et celles des ateliers avec vos douceurs, des moins chères aux plus coûteuses. Jusqu’à 3 achats par seconde. Les recherches à poussière restent manuelles.</p>${!owned ? `<small class="unlock-hint">À partir de ${AUTOMATION.gate} renaissances · conservé à chaque renaissance</small>` : ""}</div>${owned ? `<button class="automation-toggle secondary-button" ${readOnly ? "disabled" : ""} data-action="toggle-automation" aria-pressed="${state.automation.enabled}">${state.automation.enabled ? "Actif" : "En pause"}</button>` : `<button class="buy-button" id="buy-automation" data-action="buy-automation"><span>${icon("star")} ${fmt(AUTOMATION.cost)}</span><small>Débloquer</small></button>`}</section>`;
}
function renderCosmos() {
    $("#panel").innerHTML =
        `<div class="panel-heading"><div><span class="eyebrow">PLUS LOIN, PLUS LONGTEMPS</span><h2>Votre constellation<span class="title-dot">.</span></h2></div><span class="badge peach">${icon("star")} ${fmt(state.dust)}</span></div><div class="cosmos-summary"><span>Bonus permanent de poussière</span><strong>+${fmt(state.totalDust * 2)} %</strong><p>Chaque étoile compte. Même celles déjà dépensées.</p></div><h3 class="subheading">Les recherches permanentes</h3><div class="research-list">${RESEARCH.map((r) => `<article class="research-card"><span class="machine-icon ${r.id === "radiance" ? "yellow" : r.id === "touch" ? "pink" : "mint"}">${icon(r.icon)}</span><div><h3>${r.name}<small>Niv. ${state.research[r.id]} / 10</small></h3><p>${r.desc}</p></div><button data-research="${r.id}" class="buy-button" id="research-${r.id}"><span>${icon("star")} ${state.research[r.id] >= 10 ? "MAX" : researchCost(state, r.id)}</span><small>Rechercher</small></button></article>`).join("")}</div>${automationCard()}<section class="prestige-card"><p>Prochaine étape : ${BUILDINGS.find((_, i) => buildingGate(i) > state.prestiges)?.name ?? "Maîtrise de toutes les machines"}. Seuil : ${fmt(prestigeTarget(state))} douceurs dans cette vie.</p><span class="prestige-visual">${icon("orbit")}</span><h3>Une planète. Un nouveau départ.</h3><p>Recommencez avec une pluie de poussière d’étoile. Vos recherches, succès et bonus permanents vous accompagnent.</p><button class="primary-button" data-action="prestige" id="prestige">${icon("spark")} Renaître <span id="prestige-gain"></span></button><small id="prestige-hint"></small></section><div class="subheading achievement-heading"><h3>Vos petits exploits</h3><span id="achievement-count">0 / ${ACHIEVEMENTS.length}</span></div><p class="achievement-hint">Chaque succès débloqué ajoute +2 % de production.</p><div class="achievement-grid">${ACHIEVEMENTS.map((a) => `<div class="achievement ${state.achievements.includes(a.id) ? "earned" : ""}" id="achievement-${a.id}" title="${a.desc}">${icon(a.icon)}<strong>${a.name}</strong><span>${a.desc}</span></div>`).join("")}</div><button class="text-button" data-action="stats">${icon("chart")} Voir les statistiques</button>`;
}
let pendingPlanetForm = -1;
let planetRetryAt = 0;
function syncPlanetArt(level) {
    const form = planetForm(level);
    const current = $("#planet .planet-art");
    if (!current || Number(current.dataset.form) === form || pendingPlanetForm === form || Date.now() < planetRetryAt)
        return;
    pendingPlanetForm = form;
    const template = document.createElement("template");
    template.innerHTML = planetArt(level);
    const markup = template.content.firstElementChild;
    const image = new Image();
    for (const attr of Array.from(markup.attributes))
        if (attr.name !== "src")
            image.setAttribute(attr.name, attr.value);
    image.src = markup.getAttribute("src");
    // Decode before replacing: retain the previous planet during load or network failure.
    void image.decode().then(() => {
        if (planetForm(tier(state) + 1) !== form)
            return;
        $("#planet .planet-art")?.replaceWith(image);
        toast("Votre planète évolue : " + PLANET_FORMS[form].name, "success");
    }).catch(() => { planetRetryAt = Date.now() + 30000; }).finally(() => {
        if (pendingPlanetForm === form)
            pendingPlanetForm = -1;
    });
}
function paint(now) {
    if (!initialized)
        return;
    $("#sugar").textContent = fmt(state.sugar);
    $("#rate").textContent = fmt(production(state, now));
    $("#dust").textContent = fmt(state.dust);
    $("#sugar").title = state.sugar.toExponential(4);
    $("#rate").title =
        production(state, now).toExponential(4) + " douceurs par seconde";
    const t = tier(state), next = TIERS[t + 1];
    syncPlanetArt(t + 1);
    $("#planet-name").textContent = TIERS[t].name;
    $("#planet-number").textContent = String(t + 1).padStart(2, "0");
    $("#stage-label").textContent = "Niveau " + (t + 1);
    document.documentElement.style.setProperty("--planet-color", TIERS[t].color);
    $("#evolution-count").textContent = next
        ? `${fmt(state.total)} / ${fmt(next.at)}`
        : "L’univers vous appartient";
    $("#evolution-bar").style.width = next
        ? `${Math.max(0, Math.min(100, ((state.total - TIERS[t].at) / (next.at - TIERS[t].at)) * 100))}%`
        : "100%";
    $("#evolution-name").innerHTML =
        (next?.name ?? "Évolution maximale") + " " + icon("arrow");
    $("#tap-value").textContent =
        "+" + fmt(tapValue(state, combo)) + " par récolte";
    const comboPercent = Math.min(100, (combo / 25) * 100) * (now - lastTap < 1200 ? 1 : 0);
    $("#combo-bar").style.width = comboPercent + "%";
    $("#combo-value").textContent = "× " + fmt(1 + combo / 25);
    $("#combo-label").textContent =
        combo >= 25
            ? "Vous êtes en orbite !"
            : combo > 0
                ? "Encore un petit pop…"
                : "Trouvez votre rythme";
    const boosted = now < state.boostUntil;
    $("#boost-button").classList.toggle("boosting", boosted);
    $("#boost-button").disabled =
        readOnly || state.total < 500 || now < state.boostReady;
    $("#boost-desc").textContent =
        state.total < 500
            ? "Disponible à 500 douceurs produites"
            : boosted
                ? "Production triplée · " + timeFmt((state.boostUntil - now) / 1000)
                : now < state.boostReady
                    ? "Recharge · " + timeFmt((state.boostReady - now) / 1000)
                    : "30 secondes de production triplée";
    $("#boost-tag").textContent = boosted ? "ACTIF" : "× 3";
    const mission = MISSIONS[state.mission];
    $("#mission-title").textContent =
        mission?.title ?? "Tous les défis accomplis !";
    $("#mission-desc").textContent =
        mission?.desc ?? "Le cosmos n’a plus de secrets pour vous.";
    const progress = mission ? Math.min(mission.target, mission.read(state)) : 1;
    $("#mission-bar").style.width =
        (mission ? (progress / mission.target) * 100 : 100) + "%";
    $("#mission-count").textContent = mission
        ? `${fmt(progress, 0)} / ${fmt(mission.target, 0)}`
        : "Bravo !";
    const claim = $("#mission-claim");
    claim.disabled = readOnly || !mission || progress < mission.target;
    claim.innerHTML = mission
        ? `<span>+${fmt(mission.reward)}</span><small>${progress >= mission.target ? "Récupérer" : "Récompense"}</small>`
        : icon("trophy");
    if (view === "planet" || view === "atelier") {
        if (shopTab === "upgrades" && shopSignature() !== renderedShopSignature)
            renderShop();
        $("#total-machines").textContent = fmt(state.buildings.reduce((a, b) => a + b, 0));
        $("#upgrade-dot").classList.toggle("available", visibleRecipes().some((m) => milestoneReady(state, m) && state.sugar >= m.price) ||
            UPGRADES.some((u) => !state.upgrades.includes(u.id) &&
                state.prestiges >= upgradeGate(u.id) &&
                state.total >= u.unlock &&
                state.sugar >= u.cost));
        if (shopTab === "machines")
            BUILDINGS.forEach((b, i) => {
                if (!$("#machine-" + i))
                    return;
                const count = state.buildings[i] ?? 0, q = quote(state, i, quantity), gate = buildingGate(i), locked = state.prestiges < gate;
                $("#owned-" + i).textContent = String(count);
                $("#machine-rate-" + i).textContent = fmt(buildingOutput(state, i) * globalMultiplier(state));
                $("#price-" + i).textContent = fmt(q.count ? q.price : cost(state, i));
                $("#buy-label-" + i).textContent = locked
                    ? "Verrouillé"
                    : q.count > 1
                        ? `Acheter × ${q.count}`
                        : count === 0
                            ? "Recruter"
                            : "Acheter";
                const btn = $("#buy-" + i);
                btn.disabled = readOnly || q.count === 0;
                btn.setAttribute("aria-label", `Acheter ${q.count || 1} ${b.name} pour ${fmt(q.count ? q.price : cost(state, i))} douceurs`);
                $("#milestone-" + i).textContent = locked
                    ? `${gate} renaissances requises`
                    : "";
                $("#machine-ready-" + i).hidden =
                    locked ||
                        !MILESTONES.some((m) => m.building === i &&
                            milestoneReady(state, m) &&
                            state.sugar >= m.price);
                $("#machine-" + i).classList.toggle("affordable", q.count > 0);
            });
        else {
            UPGRADES.forEach((u) => {
                if (!$("#upgrade-buy-" + u.id))
                    return;
                const owned = state.upgrades.includes(u.id), locked = state.total < u.unlock || state.prestiges < upgradeGate(u.id);
                $("#upgrade-buy-" + u.id).disabled =
                    readOnly || owned || locked || state.sugar < u.cost;
                $("#unlock-" + u.id).textContent = owned
                    ? "Acquise"
                    : state.prestiges < upgradeGate(u.id)
                        ? `${upgradeGate(u.id)} renaissances requises`
                        : locked
                            ? `Débloquée à ${fmt(u.unlock)} douceurs produites`
                            : "";
                $("#upgrade-" + u.id).classList.toggle("locked", locked);
            });
            visibleRecipes().forEach((m) => {
                const button = $("#milestone-buy-" + m.id);
                if (button)
                    button.disabled =
                        readOnly || !milestoneReady(state, m) || state.sugar < m.price;
            });
        }
    }
    if (view === "voyages") {
        const e = state.expedition;
        $("#expedition-status").innerHTML = e
            ? `${icon("rocket")}<div><strong>En route vers ${DESTINATIONS[e.id].name}</strong><span>Retour dans ${timeFmt((e.ends - now) / 1000)}</span><div class="progress"><i style="width:${Math.max(0, 100 - (e.ends - now) / 10 / DESTINATIONS[e.id].duration)}%"></i></div></div>`
            : `${icon("check")}<div><strong>Votre équipage est prêt</strong><span>Choisissez une destination.</span></div>`;
        DESTINATIONS.forEach((d, i) => {
            $("#launch-" + i).disabled =
                readOnly || Boolean(e) || state.sugar < d.cost;
        });
    }
    if (view === "cosmos") {
        RESEARCH.forEach((r) => {
            $("#research-" + r.id).disabled =
                readOnly ||
                    state.research[r.id] >= 10 ||
                    state.dust < researchCost(state, r.id);
        });
        const autoButton = $("#buy-automation");
        if (autoButton)
            autoButton.disabled =
                readOnly ||
                    state.prestiges < AUTOMATION.gate ||
                    state.dust < AUTOMATION.cost;
        const gain = prestigeGain(state);
        $("#prestige").disabled =
            readOnly || gain < 5 || Boolean(state.expedition);
        $("#prestige-gain").textContent = "+" + gain + " ✦";
        $("#prestige-hint").textContent = state.expedition
            ? "Votre équipage doit d’abord rentrer."
            : gain < 5
                ? `${fmt(state.run)} / ${fmt(prestigeTarget(state))} dans cette vie`
                : `Renaissance ${state.prestiges + 1} · bonus permanent de cycle +50 %.`;
        $("#achievement-count").textContent =
            state.achievements.length + " / " + ACHIEVEMENTS.length;
        ACHIEVEMENTS.forEach((a) => $("#achievement-" + a.id).classList.toggle("earned", state.achievements.includes(a.id)));
    }
}
function particles(amount, critical) {
    if (document.documentElement.dataset.motion !== "true")
        return;
    const layer = $("#particles");
    if (layer.children.length > 26)
        return;
    const p = document.createElement("span");
    p.className = "pop-number" + (critical ? " critical" : "");
    p.textContent = "+" + fmt(amount) + (critical ? " ✦" : "");
    p.style.left = 44 + Math.random() * 12 + "%";
    p.style.top = 44 + Math.random() * 12 + "%";
    layer.append(p);
    p.addEventListener("animationend", () => p.remove(), { once: true });
    for (let i = 0; i < 4; i++) {
        const dot = document.createElement("i");
        dot.className = "pop-spark";
        const angle = Math.random() * Math.PI * 2;
        dot.style.setProperty("--x", Math.cos(angle) * (50 + Math.random() * 70) + "px");
        dot.style.setProperty("--y", Math.sin(angle) * (50 + Math.random() * 70) + "px");
        dot.style.setProperty("--c", ["#f3b9d3", "#a5dfc8", "#ffc969", "#aa93e9"][i]);
        layer.append(dot);
        dot.addEventListener("animationend", () => dot.remove(), { once: true });
    }
}
function audit() {
    for (const a of ACHIEVEMENTS) {
        if (!state.achievements.includes(a.id) && a.test(state)) {
            state.achievements.push(a.id);
            toast("Succès : " + a.name + " · +2 % de production", "success");
            audio.play("reward");
        }
    }
}
async function save() {
    if (readOnly || !initialized || storageFailed)
        return;
    try {
        state.savedAt = Date.now();
        await storage.save(state);
        $("#save-status").innerHTML = icon("lock") + " Chiffrée";
    }
    catch {
        storageFailed = true;
        $("#save-status").textContent = "Non enregistrée";
        toast("La sauvegarde est indisponible. Exportez votre partie depuis les réglages.");
    }
}
function queueSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void save(), 300);
}
function settle(now) {
    const dt = Math.max(0, (now - lastFrame) / 1000);
    lastFrame = now;
    if (readOnly || !initialized)
        return;
    if (dt > 10) {
        const old = state.savedAt;
        state.savedAt = now - dt * 1000;
        const result = offline(state, now);
        if (result.amount > 1)
            toast(`Pendant votre absence : +${fmt(result.amount)} douceurs`, "success");
        if (result.dust)
            toast(`Expédition terminée : +${result.dust} poussière`, "success");
        state.savedAt = Math.max(old, state.savedAt);
    }
    else {
        const active = Math.max(0, Math.min(dt, (state.boostUntil - (now - dt * 1000)) / 1000));
        earn(state, production(state) * (dt + active * 2));
        state.playSeconds += dt;
    }
    const dust = finishExpedition(state, now);
    if (dust) {
        toast(`L’équipage est rentré ! +${dust} poussière d’étoile`, "success");
        audio.play("reward");
        queueSave();
    }
}
function frame() {
    const now = Date.now();
    settle(now);
    if (now - lastTap > 1200)
        combo = 0;
    if (now > nextComet && cometEnds === 0) {
        cometEnds = now + 18000;
        $("#comet").hidden = false;
        audio.play("comet");
    }
    if (cometEnds && now > cometEnds) {
        cometEnds = 0;
        nextComet = now + 60000;
        $("#comet").hidden = true;
    }
    if (now - lastPaint > 125) {
        paint(now);
        lastPaint = now;
    }
    if (now - lastAudit > 1000) {
        if (!readOnly) {
            const purchases = automateUpgrades(state);
            if (purchases.length) {
                if (view === "planet" || view === "atelier")
                    renderShop();
                queueSave();
            }
        }
        audit();
        lastAudit = now;
    }
    if (now - lastSave > 5000) {
        void save();
        lastSave = now;
    }
    if (!document.hidden)
        raf = requestAnimationFrame(frame);
}
function help() {
    dialog("Bienvenue dans l’atelier", `<div class="help-intro">${icon("planet")}<p>Une petite planète, des douceurs…<br>et tout un univers à inventer.</p></div><ol class="help-steps"><li><strong>Faites un petit pop.</strong><p>Touchez votre planète. Enchaînez les récoltes à moins de 1,2 seconde d’intervalle pour monter votre combo jusqu’à × 2.</p></li><li><strong>Laissez travailler les marmitons.</strong><p>Achetez des machines. Les paliers révèlent des recettes payantes : ×1,5, ×3 ou de grandes secondes jeunesses plus tardives. L’intendant des recettes pourra les acheter automatiquement plus tard, une fois sa recherche permanente acquise.</p></li><li><strong>Gardez un œil sur le ciel.</strong><p>Attrapez les comètes et activez la Supernova pour accélérer la production.</p></li><li><strong>Voyagez, puis recommencez.</strong><p>Les expéditions et renaissances offrent de la poussière d’étoile. Chaque poussière gagnée donne +2 % à vie. Investissez-la dans les recherches du Cosmos.</p></li></ol><p class="modal-note">Votre atelier continue hors ligne à 75 % de sa production, pendant 8 h au maximum (jusqu’à 28 h avec les recherches). Sur ordinateur : Entrée ou Espace lorsque la planète est sélectionnée.</p><button class="primary-button full" data-action="close">C’est parti ${icon("arrow")}</button>`);
}
function settings() {
    dialog("Votre petit univers", `<div class="setting-row"><div><strong>Les petits bruitages</strong><p>Des notes douces, au format OGG.</p></div><button class="toggle ${state.settings.sound ? "on" : ""}" data-action="settings-sound" role="switch" aria-checked="${state.settings.sound}" aria-label="Bruitages"><i></i></button></div><label class="volume-control">Bruitages <input id="volume" type="range" min="0" max="100" value="${state.settings.volume * 100}" aria-label="Volume des bruitages"></label><div class="setting-row"><div><strong>La musique des étoiles</strong><p>La ronde des constellations · une valse en boucle.</p></div><button class="toggle ${state.settings.music ? "on" : ""}" data-action="music" role="switch" aria-checked="${state.settings.music}" aria-label="Musique"><i></i></button></div><label class="volume-control" for="music-volume">Musique <input id="music-volume" type="range" min="0" max="100" step="1" value="${Math.round(state.settings.musicVolume * 100)}" aria-label="Volume de la musique" aria-valuetext="${Math.round(state.settings.musicVolume * 100)} %"><output id="music-volume-value" for="music-volume">${Math.round(state.settings.musicVolume * 100)} %</output></label><div class="setting-row"><div><strong>Animations</strong><p>Respecte aussi les réglages de votre appareil.</p></div><button class="toggle ${state.settings.motion ? "on" : ""}" data-action="motion" role="switch" aria-checked="${state.settings.motion}" aria-label="Animations"><i></i></button></div>
<details class="number-help"><summary>Lire les très grandes quantités</summary><p>k = mille ; M = million ; Md = milliard. Les grandes unités nommées vont jusqu’à 10⁸¹. Au-delà, la notation devient scientifique : 2,5×10⁸⁴ représente 2,5 multiplié par 10 puissance 84, jusqu’à 10³⁰⁰.</p></details><section class="theme-section"><h3>Les couleurs de votre univers</h3><div class="theme-picker" role="group" aria-label="Thème de couleurs">${["lavande", "menthe", "aurore", "minuit"].map((t) => `<button data-theme="${t}" aria-pressed="${state.settings.theme === t}" class="theme-option ${t}"><i></i><span>${{ lavande: "Lavande", menthe: "Menthe", aurore: "Aurore", minuit: "Minuit" }[t]}</span>${state.settings.theme === t ? icon("check") : ""}</button>`).join("")}</div></section><section class="save-section"><h3>${icon("lock")} Sauvegarde chiffrée</h3><p>Enregistrement automatique AES-256-GCM sur cet appareil. Pour transférer votre partie, exportez une copie protégée par un mot de passe.</p><label class="input-label" for="password">Mot de passe de l’export ou de l’import</label><input id="password" type="password" autocomplete="new-password" minlength="10" maxlength="256" placeholder="Au moins 10 caractères"><p class="field-help">Conservez ce mot de passe : il ne peut pas être récupéré.</p><div class="save-actions"><button class="secondary-button" data-action="export">${icon("download")} Exporter</button><button class="secondary-button" data-action="import">${icon("upload")} Importer</button></div><input type="file" id="import-file" accept=".cosmopop,application/json" hidden><p id="save-feedback" class="save-feedback" role="status"></p></section><button class="secondary-button full" data-action="update">Vérifier les mises à jour</button><div class="settings-links"><button class="text-button" data-action="help">${icon("info")} Comment jouer</button><button class="text-button" data-action="stats">${icon("chart")} Statistiques</button></div><p class="modal-note">Cosmo Pop · 1.7 · Sans publicité ni suivi. Vos données restent sur votre appareil.</p>`);
}
function stats() {
    dialog("Votre histoire en chiffres", `<div class="stats-grid">${[
        ["Douceurs produites", fmt(state.total)],
        ["Dans cette vie", fmt(state.run)],
        ["Récoltes manuelles", fmt(state.clicks)],
        ["Machines en activité", fmt(state.buildings.reduce((a, b) => a + b, 0))],
        ["Expéditions terminées", String(state.expeditions)],
        ["Poussières gagnées", fmt(state.totalDust)],
        ["Renaissances", String(state.prestiges)],
        ["Temps de jeu actif", timeFmt(state.playSeconds)],
        ["Évolution de la planète", `${tier(state) + 1} / ${TIERS.length}`],
    ]
        .map(([a, b]) => `<div><span>${a}</span><strong>${b}</strong></div>`)
        .join("")}</div><button class="primary-button full" data-action="close">Retour aux étoiles</button>`);
}
async function action(target) {
    const act = target.dataset.action;
    if (act === "install") {
        if (installPrompt) {
            const prompt = installPrompt;
            installPrompt = null;
            await prompt.prompt();
            await prompt.userChoice;
        }
        else {
            dialog("Installer Cosmo Pop", `<div class="help-intro">${icon("download")}<p>Votre atelier, comme une application : plein écran et disponible hors ligne après une première ouverture connectée.</p></div><h3>Sur iPhone ou iPad</h3><p>Ouvrez ce jeu dans <strong>Safari</strong>, touchez <strong>Partager</strong>, puis <strong>Sur l’écran d’accueil</strong> et <strong>Ajouter</strong>.</p><h3>Sur Android</h3><p>Ouvrez ce jeu dans <strong>Chrome</strong>, puis utilisez son menu <strong>⋮ → Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>.</p><p class="modal-note">Si vous jouez depuis une autre application, ouvrez d’abord le lien dans votre navigateur. Pour transférer une partie entre Safari, une application installée ou un autre appareil, utilisez l’export chiffré.</p><button class="primary-button full" data-action="close">Compris</button>`);
        }
        return;
    }
    if (act === "close") {
        modal.close();
        return;
    }
    if (act === "update") {
        await checkUpdate(true);
        return;
    }
    if (act === "help") {
        help();
        return;
    }
    if (act === "settings") {
        settings();
        return;
    }
    if (act === "stats") {
        stats();
        return;
    }
    if (act === "dust-info") {
        dialog("Les étoiles vous font grandir", `<div class="help-intro">${icon("star")}<p>Chaque poussière gagnée donne <strong>+2 %</strong> de production et de récolte, définitivement.</p></div><p>Gagnez-en grâce aux expéditions, aux défis et aux renaissances. Dépensez-les dans les recherches du Cosmos : leur bonus de +2 % est conservé.</p><button class="primary-button full" data-action="close">Bien compris</button>`);
        return;
    }
    if (act === "sound" || act === "settings-sound") {
        state.settings.sound = !state.settings.sound;
        syncSettings();
        if (act === "settings-sound")
            settings();
        if (state.settings.sound) {
            await audio.unlock();
            audio.play("pop");
        }
        queueSave();
        return;
    }
    if (act === "music") {
        state.settings.music = !state.settings.music;
        syncSettings();
        settings();
        queueSave();
        return;
    }
    if (act === "motion") {
        state.settings.motion = !state.settings.motion;
        syncSettings();
        settings();
        queueSave();
        return;
    }
    if (act === "export") {
        const pass = $("#password").value;
        const feedback = $("#save-feedback");
        try {
            feedback.textContent = "Chiffrement en cours…";
            const raw = await exportEncrypted(state, pass), url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `cosmo-pop-${new Date().toISOString().slice(0, 10)}.cosmopop`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            feedback.textContent = "Copie chiffrée exportée.";
        }
        catch (e) {
            feedback.textContent = e.message;
        }
        return;
    }
    if (act === "import") {
        if (readOnly)
            return;
        const pass = $("#password").value;
        if (pass.length < 10) {
            $("#save-feedback").textContent =
                "Saisissez le mot de passe de la copie (10 caractères minimum).";
            return;
        }
        $("#import-file").click();
        return;
    }
    if (target.dataset.theme) {
        state.settings.theme = target.dataset.theme;
        syncSettings();
        settings();
        queueSave();
        return;
    }
    if (target.dataset.family !== undefined) {
        family = Number(target.dataset.family);
        renderPanel();
        return;
    }
    if (target.dataset.view) {
        setView(target.dataset.view);
        return;
    }
    if (target.dataset.shop) {
        shopTab = target.dataset.shop;
        renderPanel();
        return;
    }
    if (target.dataset.quantity) {
        quantity =
            target.dataset.quantity === "max"
                ? "max"
                : target.dataset.quantity === "10"
                    ? 10
                    : 1;
        renderPanel();
        return;
    }
    if (readOnly)
        return;
    const now = Date.now();
    settle(now);
    if (act === "tap") {
        if (now - lastTap < 45)
            return;
        combo = now - lastTap < 1200 ? Math.min(25, combo + 1) : 0;
        lastTap = now;
        const result = tap(state, combo);
        particles(result.amount, result.critical);
        audio.play("pop");
        const planet = $("#planet");
        planet.classList.remove("tapped");
        void planet.offsetWidth;
        planet.classList.add("tapped");
    }
    if (target.dataset.buy !== undefined) {
        const id = Number(target.dataset.buy), bought = buyBuilding(state, id, quantity);
        if (bought) {
            audio.play("buy");
        }
    }
    if (target.dataset.milestone &&
        buyMilestone(state, target.dataset.milestone)) {
        audio.play("reward");
        const recipe = MILESTONES.find((m) => m.id === target.dataset.milestone);
        toast(`${BUILDINGS[recipe.building].name} : ${recipe.name} achetée`, "success");
        renderPanel();
    }
    if (target.dataset.upgrade && buyUpgrade(state, target.dataset.upgrade)) {
        audio.play("reward");
        renderPanel();
        toast("Recette acquise : " +
            UPGRADES.find((u) => u.id === target.dataset.upgrade).name, "success");
    }
    if (target.dataset.launch !== undefined &&
        launch(state, Number(target.dataset.launch), now)) {
        audio.play("launch");
        toast("Bon voyage, petit équipage !", "success");
        renderPanel();
    }
    if (target.dataset.research &&
        buyResearch(state, target.dataset.research)) {
        audio.play("reward");
        renderPanel();
        const research = RESEARCH.find((r) => r.id === target.dataset.research);
        toast(`${research.name} · niveau ${state.research[research.id]} acquis`, "success");
    }
    if (act === "boost" && boost(state, now)) {
        audio.play("launch");
        toast("Supernova ! Production × 3 pendant 30 secondes.", "success");
    }
    if (act === "comet" && cometEnds > now) {
        const amount = Math.max(30, production(state, now) * 35 + tapValue(state) * 15);
        earn(state, amount);
        particles(amount, true);
        cometEnds = 0;
        nextComet = now + 65000;
        $("#comet").hidden = true;
        audio.play("reward");
        toast("Comète attrapée ! +" + fmt(amount) + " douceurs", "success");
    }
    if (act === "mission") {
        const mission = MISSIONS[state.mission];
        if (mission && claimMission(state)) {
            audio.play("reward");
            toast(`Défi accompli : ${mission.title} · +${fmt(mission.reward)} douceurs`, "success");
        }
    }
    if (act === "buy-automation" && buyAutomation(state)) {
        audio.play("reward");
        renderPanel();
        toast(`${AUTOMATION.name} débloqué pour toutes vos vies`, "success");
    }
    if (act === "toggle-automation" && state.automation.owned) {
        state.automation.enabled = !state.automation.enabled;
        renderPanel();
    }
    if (act === "prestige") {
        const gain = prestigeGain(state);
        if (gain < 5 || state.expedition)
            return;
        dialog("Un nouveau ciel vous attend", `<div class="help-intro">${icon("orbit")}<p>Cette renaissance vous offre <strong>${gain} poussières d’étoile</strong>, soit <strong>+${gain * 2} %</strong> de bonus de poussière, et un bonus permanent de cycle de <strong>+50 %</strong>. Les nouveaux ateliers s’ouvrent progressivement jusqu’au cycle 36.</p></div><p>Votre réserve de douceurs, vos machines et les améliorations de l’atelier repartent de zéro. Les recherches, les succès, les défis accomplis et toute votre poussière sont conservés.</p><div class="save-actions"><button class="secondary-button" data-action="close">Continuer cette vie</button><button class="primary-button" data-action="confirm-prestige">Renaître ${icon("spark")}</button></div>`);
        return;
    }
    if (act === "confirm-prestige" && prestige(state, now)) {
        combo = 0;
        modal.close();
        audio.play("reward");
        setView("planet");
        toast("Bienvenue dans votre nouvelle vie !", "success");
    }
    audit();
    paint(now);
    queueSave();
}
document.addEventListener("click", (e) => {
    const target = e.target.closest("button");
    if (!target || target.hasAttribute("disabled"))
        return;
    void audio.unlock();
    void action(target).catch(() => toast("Cette action n’a pas pu aboutir. Réessayez."));
});
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        const r = modal.getBoundingClientRect();
        if (e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom)
            modal.close();
    }
});
document.addEventListener("input", (e) => {
    const input = e.target;
    if (input.id === "music-volume") {
        state.settings.musicVolume = Number(input.value) / 100;
        input.setAttribute("aria-valuetext", `${input.value} %`);
        $("#music-volume-value").textContent = `${input.value} %`;
        syncSettings();
        void audio.unlock();
        queueSave();
    }
    if (input.id === "volume") {
        state.settings.volume = Number(input.value) / 100;
        syncSettings();
        queueSave();
    }
});
document.addEventListener("change", (e) => {
    const file = e.target;
    if (file.id !== "import-file" || !file.files?.[0] || readOnly)
        return;
    const f = file.files[0], pass = $("#password").value;
    file.value = "";
    if (f.size > 200000) {
        $("#save-feedback").textContent = "Ce fichier est trop volumineux.";
        return;
    }
    $("#save-feedback").textContent = "Déchiffrement et vérification…";
    void f
        .text()
        .then((raw) => importEncrypted(raw, pass))
        .then((imported) => {
        dialog("Restaurer cette partie ?", `<p>Cette copie contient <strong>${fmt(imported.total)} douceurs produites</strong> et <strong>${imported.totalDust} poussières gagnées</strong>. Elle remplacera la partie actuelle sur cet appareil.</p><div class="save-actions"><button class="secondary-button" id="cancel-import">Annuler</button><button class="primary-button" id="confirm-import">Restaurer</button></div>`);
        $("#cancel-import").onclick = () => modal.close();
        $("#confirm-import").onclick = () => {
            state = imported;
            storageFailed = false;
            const result = offline(state, Date.now());
            combo = 0;
            lastFrame = Date.now();
            syncSettings();
            renderPanel();
            modal.close();
            queueSave();
            toast(`Partie restaurée${result.amount > 1 ? " · +" + fmt(result.amount) + " hors ligne" : ""}.`, "success");
        };
    })
        .catch((e) => {
        if ($("#save-feedback"))
            $("#save-feedback").textContent = e.message;
    });
});
reduced.addEventListener("change", () => {
    if (initialized)
        syncSettings();
});
document.addEventListener("visibilitychange", () => {
    if (!initialized)
        return;
    audio.setActive(!readOnly && !document.hidden);
    if (document.hidden) {
        cancelAnimationFrame(raf);
        settle(Date.now());
        void save();
    }
    else {
        cancelAnimationFrame(raf);
        lastPaint = 0;
        raf = requestAnimationFrame(frame);
    }
});
window.addEventListener("pageshow", () => {
    audio.setActive(initialized && !readOnly && !document.hidden);
});
window.addEventListener("pagehide", () => {
    audio.setActive(false);
    void save();
});
async function init() {
    if (navigator.locks) {
        await new Promise((resolve) => {
            void navigator.locks.request("cosmo-pop:" + location.pathname.replace(/index\.html$/, ""), { ifAvailable: true }, async (lock) => {
                if (!lock) {
                    readOnly = true;
                    resolve();
                    return;
                }
                resolve();
                await new Promise(() => { });
            });
        });
    }
    let result = null, newPlayer = true;
    try {
        const loaded = await storage.load();
        if (loaded.state) {
            state = loaded.state;
            newPlayer = false;
            result = offline(state, Date.now());
            if (loaded.recovered)
                setTimeout(() => toast("Copie de secours restaurée.", "success"), 300);
        }
    }
    catch {
        storageFailed = true;
        setTimeout(() => toast("Stockage chiffré indisponible ou sauvegarde illisible. Utilisez l’export dans les réglages."), 500);
    }
    shell();
    initialized = true;
    lastFrame = Date.now();
    syncSettings();
    paint(Date.now());
    if (storageFailed)
        $("#save-status").textContent = "Export conseillé";
    if (readOnly) {
        $("#session-banner").hidden = false;
        $("#planet").disabled = true;
    }
    else if (!storageFailed)
        void save();
    if (result && (result.amount > 5 || result.dust > 0))
        dialog("Vos marmitons ont bien travaillé", `<div class="offline-reward">${icon("moon")}<span>De retour après ${timeFmt(result.seconds)}</span><strong>+${fmt(result.amount)}</strong><span>douceurs récoltées${result.dust ? " · +" + result.dust + " poussière" : ""}</span></div><p class="modal-note">Production hors ligne à 75 %, plafonnée à ${8 + state.research.time * 2} heures. Votre équipage voyage aussi pendant votre absence.</p><button class="primary-button full" data-action="close">C’est bon de rentrer ${icon("heart")}</button>`);
    if (newPlayer)
        setTimeout(() => toast("Bienvenue ! Touchez la planète, puis recrutez votre premier marmiton."), 900);
    raf = requestAnimationFrame(frame);
    if (installed)
        rememberInstallation();
    if ("serviceWorker" in navigator) {
        const hadController = Boolean(navigator.serviceWorker.controller);
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (hadController) {
                settle(Date.now());
                void save().finally(() => location.reload());
            }
        });
        navigator.serviceWorker
            .register("./sw.js", { scope: "./", updateViaCache: "none" })
            .then((reg) => {
            const notify = () => {
                waitingUpdate = Boolean(reg.waiting);
                syncAppControl();
                if (waitingUpdate)
                    toast("Mise à jour disponible : touchez le bouton lumineux en haut.");
            };
            notify();
            reg.addEventListener("updatefound", () => reg.installing?.addEventListener("statechange", notify));
        })
            .catch(() => { });
        setInterval(() => {
            if (!document.hidden && navigator.onLine)
                void checkUpdate(false);
        }, 300000);
    }
}
void init().catch(() => {
    app.innerHTML =
        '<div class="loading"><h1>Une étoile a trébuché.</h1><p>Actualisez la page pour relancer l’atelier.</p><button class="primary-button" onclick="location.reload()">Réessayer</button></div>';
});
async function checkUpdate(manual) {
    if (!("serviceWorker" in navigator)) {
        if (manual)
            toast("La mise à jour nécessite un navigateur compatible.");
        return;
    }
    try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg)
            return;
        if (!reg.waiting) {
            await reg.update();
            const worker = reg.installing;
            if (worker)
                await new Promise((resolve) => {
                    const done = () => {
                        if (worker.state === "installed" || worker.state === "redundant") {
                            clearTimeout(timer);
                            resolve();
                        }
                    };
                    const timer = setTimeout(resolve, 10000);
                    worker.addEventListener("statechange", done);
                    done();
                });
        }
        waitingUpdate = Boolean(reg.waiting);
        syncAppControl();
        if (manual && reg.waiting) {
            settle(Date.now());
            await save();
            reg.waiting.postMessage("ACTIVATE");
        }
        else if (manual)
            toast(waitingUpdate ? "Mise à jour prête." : "Votre atelier est à jour.");
    }
    catch {
        if (manual)
            toast("Vérification impossible. Vérifiez votre connexion.");
    }
}
// Rapid harvesting should not trigger double-tap zoom; native pinch remains available.
document.addEventListener("dblclick", (e) => {
    if (!e.target.closest('input, textarea, [contenteditable="true"]'))
        e.preventDefault();
}, { passive: false });
