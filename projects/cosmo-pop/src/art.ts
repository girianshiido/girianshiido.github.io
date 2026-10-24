const paths:Record<string,string>={
 spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
 star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
 planet:'<circle cx="12" cy="12" r="7"/><path d="M5.8 8.5C1 10-1 13 2 14.5s9 .8 14-1.5 8-5 6-6-4-.6-6 0"/>',
 bot:'<rect x="4" y="7" width="16" height="13" rx="5"/><path d="M12 7V3m-2 0h4M1 12v4m22-4v4M8 20v2m8-2v2"/><path d="M8 12h.1m7.9 0h.1M9 16h6"/>',
 mill:'<path d="m8 12-2 9h12l-2-9M12 3v9m0-5L5 2 2 6l10 6m0 0 7-9 3 4-10 5m0 0L3 19l-1-5 10-2m0 0 9 7 1-5-10-2"/>',
 sprout:'<path d="M12 21V11m0 5C4 17 2 12 3 7c7-1 10 3 9 9Zm0-5c0-6 4-8 9-8 1 6-2 10-9 8Z"/>',
 hive:'<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="M3 7h18M3 12h18M3 17h18"/><path d="M10 21v-5a2 2 0 0 1 4 0v5"/>',
 portal:'<ellipse cx="12" cy="11" rx="7" ry="9"/><ellipse cx="12" cy="11" rx="3" ry="5"/><path d="m5 18-3 4h20l-3-4"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M20 4l-2 2M6 18l-2 2"/>',
 hand:'<path d="M8 12V5a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9a7 7 0 0 1-13 4l-4-6a2 2 0 0 1 3-2l3 3"/>',
 book:'<path d="M12 5C7 2 3 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1v15"/>',
 comet:'<path d="m12 4 8-2-2 8M10 7 17 0M17 14l7-7M7 4l4-4"/><circle cx="8" cy="16" r="6"/><path d="m6 16 2-2"/>',
 bolt:'<path d="m14 2-9 12h6l-1 8 9-12h-6Z"/>',
 orbit:'<ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-30 12 12)"/><circle cx="12" cy="12" r="5"/>',
 rocket:'<path d="M9 15C4 9 13 1 22 2c1 9-7 18-13 13ZM9 8l-5 1-2 5 5-1m9 2-1 5-5 2 1-5M7 17l-4 4m1-5-2 2m6 2-2 2"/><circle cx="16" cy="8" r="2"/>',
 moon:'<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 settings:'<path d="m10 2-1 3-3 1-3-1-2 4 2 2v3l-2 2 2 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-2-2v-3l2-2-2-4-3 1-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
 volume:'<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 mute:'<path d="m11 4-6 5H2v6h3l6 5Zm5 5 6 6m0-6-6 6"/>',
 trophy:'<path d="M7 3h10v5a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 1v6m-5 2h10"/>',
 check:'<path d="m5 12 4 4L20 5"/>',
 lock:'<rect x="4" y="10" width="16" height="12" rx="3"/><path d="M7 10V7a5 5 0 0 1 10 0v3m-5 5v3"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 download:'<path d="M12 2v13m-5-5 5 5 5-5M3 16v5h18v-5"/>',
 upload:'<path d="M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
 heart:'<path d="M12 21 3 12C-3 5 6-2 12 5c6-7 15 0 9 7Z"/>',
 sugar:'<path d="m12 2 8 5v10l-8 5-8-5V7Zm0 0v20M4 7l8 5 8-5"/>',
 chart:'<path d="M4 3v18h18M8 16v-4m5 4V8m5 8V4"/>',
 leaf:'<path d="M4 20C-2 3 12 1 22 2c1 12-6 20-18 18Zm0 0L17 7"/>'
};
export function icon(name:string,cls=''):string{return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]??paths.spark}</svg>`;}
export function planetArt():string {return `<svg class="planet-art" viewBox="0 0 600 500" fill="none" aria-hidden="true">
<defs>
  <radialGradient id="body" cx=".32" cy=".2" r=".85"><stop stop-color="#ffd7b9"/><stop offset=".42" stop-color="var(--planet-color,#ffabbd)"/><stop offset="1" stop-color="#e27dba"/></radialGradient>
  <linearGradient id="ring" x1="100" y1="300" x2="490" y2="200" gradientUnits="userSpaceOnUse"><stop stop-color="#f5c56f"/><stop offset=".5" stop-color="#ffe8ab"/><stop offset="1" stop-color="#f7c688"/></linearGradient>
  <linearGradient id="cream" x1="250" y1="125" x2="320" y2="240" gradientUnits="userSpaceOnUse"><stop stop-color="#fff9e7"/><stop offset="1" stop-color="#ffe9c5"/></linearGradient>
  <linearGradient id="roof" x1="240" y1="120" x2="330" y2="180" gradientUnits="userSpaceOnUse"><stop stop-color="#a08be9"/><stop offset="1" stop-color="#7052bd"/></linearGradient>
  <radialGradient id="glow"><stop stop-color="#c5b8ef" stop-opacity=".55"/><stop offset="1" stop-color="#e8e0fa" stop-opacity="0"/></radialGradient>
  <filter id="planet-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#8a6bba" flood-opacity=".17"/></filter>
</defs>
<ellipse cx="300" cy="271" rx="252" ry="211" fill="url(#glow)"/>
<g class="orbit-lines" stroke="#d8ccec" stroke-dasharray="3 9"><ellipse cx="300" cy="267" rx="262" ry="100" transform="rotate(-22 300 267)"/><ellipse cx="300" cy="267" rx="225" ry="175" transform="rotate(28 300 267)"/></g>
<g class="float-one"><circle cx="98" cy="160" r="28" fill="#c3eade"/><path d="M77 157c14 6 28 6 41-3" stroke="#92d4c3" stroke-width="7"/><ellipse cx="98" cy="160" rx="40" ry="9" transform="rotate(-30 98 160)" stroke="#a3d4c6" stroke-width="5"/><circle cx="88" cy="150" r="5" fill="#dff8eb"/></g>
<g class="float-two"><circle cx="497" cy="325" r="18" fill="#b3a1ed"/><path d="M482 322c9 2 18 3 30-2" stroke="#d2c5fa" stroke-width="5"/><circle cx="495" cy="317" r="4" fill="#dbd1fa"/></g>
<g fill="#e8c05d"><path d="m466 130 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z"/><path d="m135 351 2 7 8 3-8 2-2 8-3-8-7-2 7-3Z"/></g>
<g fill="#ba9de4"><circle cx="148" cy="100" r="3"/><circle cx="516" cy="228" r="4"/><circle cx="211" cy="412" r="3"/><path d="m409 404 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/></g>
<g filter="url(#planet-shadow)" class="world-body">
<ellipse cx="300" cy="273" rx="214" ry="53" transform="rotate(-20 300 273)" stroke="url(#ring)" stroke-width="22"/>
<circle cx="300" cy="259" r="137" fill="url(#body)"/>
<path d="M176 204c15-38 54-74 98-78 55-10 103 18 130 54 13 18 3 37-13 40-18 2-13-24-28-13-8 7 4 32-17 32-19 0-12-35-30-29-11 4 0 30-18 33-18 3-11-29-27-24-13 4-7 27-25 25-12-2-11-26-24-23-15 4-17 12-29 5-9-5-15-12-17-22Z" fill="url(#cream)"/>
<ellipse cx="251" cy="305" rx="17" ry="9" fill="#ed86a8" opacity=".65"/><ellipse cx="351" cy="305" rx="17" ry="9" fill="#ed86a8" opacity=".65"/>
<path d="M267 286v7m64-7v7" stroke="#6d486f" stroke-width="9" stroke-linecap="round"/><path d="M287 309q13 12 26-1" stroke="#9c557b" stroke-width="4" stroke-linecap="round"/>
<path d="m202 253 9 5m143-102 6 9m-118 85-5 7m120-12 10-1m-127 85 8 5m102 3-5 7m-65 23 11-1" stroke="#fff2d3" stroke-width="5" stroke-linecap="round"/>
<path d="m202 277 9-2m170-24-7 6m-100 80 3 8m75-2 5 3" stroke="#c37ca6" stroke-width="4" stroke-linecap="round"/>
<path d="M107 323c7 23 100 11 207-28s192-90 186-113" stroke="url(#ring)" stroke-width="22" stroke-linecap="round"/><path d="M108 320c8 17 100 6 203-31s190-85 188-105" stroke="#fff0c2" stroke-width="3" stroke-linecap="round"/>
<g class="bakery"><path d="M250 161h93v53c-25 13-66 10-93-3Z" fill="#fff2d0"/><path d="m250 161 47-30 46 30-45 21Z" fill="#f4dcae"/><path d="m243 160 51-45 57 45-53 22Z" fill="url(#roof)"/><path d="m251 158 44-34 44 34-42 16Z" fill="#b7a1ec"/>
<path d="M266 170v38m16-33v38m16-34v37m16-44v38m16-44v38" stroke="#f8c9b6" stroke-width="8"/><path d="M245 175q10 10 19 4 10 10 20 4 10 8 20 1 9 5 18-3 10 4 24-9v-13l-48 21-53-21Z" fill="#fcf3dc"/>
<path d="M288 220v-21a10 10 0 0 1 20 0v22" fill="#bfa4dd"/><circle cx="303" cy="208" r="1.5" fill="#fff2cb"/><path d="M322 193v12l11-4v-12Z" fill="#9cc9ce"/>
<path d="M321 135v-26h12v34" fill="#f2d1bd"/><path d="M318 109h18v6h-18" fill="#ffefda"/><g class="steam" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"><path d="M326 99c-12-9 9-11-1-22m13 18c-7-7 6-7 0-14"/></g>
<circle cx="296" cy="147" r="8" fill="#fff1d4"/><path d="m296 141 1 4 4 2-4 1-1 4-2-4-3-1 3-2Z" fill="#d995ae"/>
</g>
<g><path d="M207 187v-34m-2 28c-18-4-18-20-12-24 13 1 20 11 12 24" stroke="#69ad95" stroke-width="4"/><circle cx="208" cy="148" r="17" fill="#f7a9c5"/><path d="M199 148c0-13 21-11 18 2-4 12-21 3-13-3" stroke="#fff4de" stroke-width="4" stroke-linecap="round"/>
<path d="M375 203v-35" stroke="#b7a17b" stroke-width="4"/><circle cx="376" cy="157" r="19" fill="#99d5c3"/><path d="M365 158c0-13 22-13 21 0-1 12-18 8-16 0" stroke="#e4f6ce" stroke-width="4" stroke-linecap="round"/></g>
<g class="tiny-bot"><path d="m222 215-2 7m19-7 2 7" stroke="#7e749e" stroke-width="4" stroke-linecap="round"/><rect x="214" y="194" width="30" height="24" rx="9" fill="#baa4e8"/><rect x="218" y="197" width="22" height="13" rx="5" fill="#f9f1e9"/><path d="M224 202v2m10-2v2" stroke="#77638e" stroke-width="3" stroke-linecap="round"/><path d="M229 194v-5" stroke="#a58ac6" stroke-width="3"/><circle cx="229" cy="187" r="3" fill="#ffd279"/></g>
</g></svg>`;}
