// Vérificateur de contraste WCAG 2.1 — Hakili Lab
// Calcule le ratio de contraste (luminance relative) pour chaque paire texte/fond
// relevée dans le CSS du site, et compare au seuil requis par la taille/graisse du texte.

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function blend(fg, fgAlpha, bg) {
  // fg, bg: [r,g,b] 0-255 ; fgAlpha: 0-1
  return fg.map((c, i) => Math.round(c * fgAlpha + bg[i] * (1 - fgAlpha)));
}

function relLuminance([r, g, b]) {
  const chan = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
}

function contrast(rgbA, rgbB) {
  const L1 = relLuminance(rgbA);
  const L2 = relLuminance(rgbB);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function threshold(sizePx, bold, kind) {
  if (kind === 'ui') return 3.0;
  const isLarge = sizePx >= 24 || (sizePx >= 18.66 && bold);
  return isLarge ? 3.0 : 4.5;
}

// Jetons de couleur du projet (src/styles/tokens.css, après correction)
const T = {
  blue: hexToRgb('#005CB9'),
  blueDeep: hexToRgb('#003E7E'),
  green: hexToRgb('#2F7A2C'),
  greenLight: hexToRgb('#49A145'),
  greenBrochureEnd: hexToRgb('#1E5A1B'),
  lime: hexToRgb('#84B92E'),
  ink: hexToRgb('#14233A'),
  slate: hexToRgb('#5B6B7C'),
  cloud: hexToRgb('#F4F8FC'),
  line: hexToRgb('#E1E9F2'),
  danger: hexToRgb('#C0392B'),
  white: hexToRgb('#FFFFFF'),
  footerBg: hexToRgb('#0B1B2E'),
  bookTeal: hexToRgb('#2E7D6B'),
  topbarTagInk: hexToRgb('#1B2A05'),
};

// Fond effectif du hero au niveau du texte (overlay le plus sombre du dégradé,
// rgba(0,62,126,.94), plaqué sur le pire cas : une zone de photo blanche)
const heroBg94 = blend(hexToRgb('#003E7E'), 0.94, T.white);
// Fond effectif de la légende vidéo (voile ~.74 d'opacité à la position de la légende,
// plaqué sur le pire cas : une zone de photo blanche)
const videoCapBg = blend(T.footerBg, 0.74, T.white);

const cases = [
  ['Texte courant (ink) / fond blanc', T.ink, T.white, 16.5, false, 'text'],
  ['Texte courant (ink) / fond nuage (--cloud)', T.ink, T.cloud, 16.5, false, 'text'],
  ['Paragraphes .lead / .slate / fond blanc (plus petite occurrence, 12px)', T.slate, T.white, 12, false, 'text'],
  ['Paragraphes .lead / .slate / fond nuage', T.slate, T.cloud, 12, false, 'text'],
  ['Titres H2 (.h2) bleu / fond blanc', T.blue, T.white, 29, false, 'text'],
  ['Titres H2 (.h2) bleu / fond nuage', T.blue, T.cloud, 29, false, 'text'],
  ['Bouton .btn-primary blanc / fond bleu', T.white, T.blue, 15, true, 'text'],
  ['Bouton .btn-green blanc / fond vert (corrigé)', T.white, T.green, 15, true, 'text'],
  ['Bouton .btn-outline bleu / fond blanc', T.blue, T.white, 15, true, 'text'],
  ['Lien "Nous rendre visite" / EN MATHEMATIQUES / vert (corrigé) / fond blanc', T.green, T.white, 12, false, 'text'],
  ['Baseline "EN MATHEMATIQUES" agrandie (12px) vert (corrigé) / fond blanc', T.green, T.white, 12, false, 'text'],
  ['.eyebrow-light blanc 72% / fond bleu (section contact)', blend(T.white, 0.85, T.blue), T.blue, 12.5, false, 'text'],
  ['.contact-lead blanc 84% / fond bleu', blend(T.white, 0.84, T.blue), T.blue, 16.5, false, 'text'],
  ['.contact-items span blanc 78% / fond bleu', blend(T.white, 0.78, T.blue), T.blue, 15, false, 'text'],
  ['Pied de page texte blanc 72% / fond marine (#0B1B2E)', blend(T.white, 0.72, T.footerBg), T.footerBg, 15, false, 'text'],
  ['Bandeau .topbar-contact blanc 80% / fond bleu profond', blend(T.white, 0.8, T.blueDeep), T.blueDeep, 14, false, 'text'],
  ['.topbar-tag texte foncé / fond citron vert (lime)', T.topbarTagInk, T.lime, 11.5, true, 'text'],
  ['Bloc plaquette : paragraphe blanc opaque (corrigé) / fond vert clair du dégradé', T.white, T.green, 16.5, false, 'text'],
  ['Bloc plaquette : mention légale blanche opaque (corrigée) / fond vert foncé du dégradé', T.white, T.greenBrochureEnd, 13, false, 'text'],
  ['Bouton "Télécharger" vert (corrigé) / fond blanc', T.green, T.white, 15, true, 'text'],
  ['Message de succès formulaire vert (corrigé) / fond blanc', T.green, T.white, 14.5, false, 'text'],
  ['Message d\'erreur formulaire (danger) / fond blanc', T.danger, T.white, 14.5, false, 'text'],
  ['Contour focus clavier bleu (corrigé) / fond blanc (composant UI, seuil 3:1)', T.blue, T.white, 0, false, 'ui'],
  ['Hero — texte h1/lead blanc sur överlay le plus sombre (pire cas photo blanche)', T.white, heroBg94, 36, true, 'text'],
  ['Hero-lead blanc 86% sur overlay (pire cas photo blanche)', blend(T.white, 0.86, heroBg94), heroBg94, 19, false, 'text'],
  ['Hero-meta blanc 70% sur overlay (pire cas photo blanche)', blend(T.white, 0.7, heroBg94), heroBg94, 14.5, false, 'text'],
  ['Légende vidéo "Une journée..." blanc opaque sur voile renforcé (pire cas photo blanche)', T.white, videoCapBg, 14.5, false, 'text'],
  ['Couverture manuel 6e (bleu) : "small" blanc 80%', blend(T.white, 0.8, T.blue), T.blue, 11.5, false, 'text'],
  ['Couverture manuel 5e (vert, corrigé) : "small" blanc 80%', T.white, T.green, 11.5, false, 'text'],
  ['Couverture manuel 4e (bleu profond) : "small" blanc 80%', blend(T.white, 0.8, T.blueDeep), T.blueDeep, 11.5, false, 'text'],
  ['Couverture manuel 3e (sarcelle) : "small" blanc 80%', T.white, T.bookTeal, 11.5, false, 'text'],
  ['Bloc "chiffres cles" (.stats) : nombre blanc / degrade bleu->bleu profond', T.white, T.blueDeep, 44, true, 'text'],
  ['Bloc "chiffres cles" (.stats) : libelle blanc 82% / degrade bleu->bleu profond', blend(T.white, 0.82, T.blueDeep), T.blueDeep, 14.5, false, 'text'],
  ['Lien "Nous rendre visite" unifie en bleu / fond blanc', T.blue, T.white, 14.5, false, 'text'],
  ['Lien d\'evitement ".skip-link" (visible au focus) blanc / fond bleu', T.white, T.blue, 15, true, 'text'],
  ['Sur-titre serif italique (.eyebrow, vert) / fond blanc', T.green, T.white, 19, false, 'text'],
  ['Sur-titre serif italique (.eyebrow, vert) / fond nuage', T.green, T.cloud, 19, false, 'text'],
  ['Sur-titre serif italique (.eyebrow-light, blanc opaque) / fond bleu (bloc contact)', T.white, T.blue, 19, false, 'text'],
  ['Barre du haut : phrase 85% / fond bleu profond (corrige, avant blanc opaque)', blend(T.white, 0.85, T.blueDeep), T.blueDeep, 12.5, false, 'text'],
  ['Barre du haut : telephone/e-mail 70% / fond bleu profond (corrige, avant 80%)', blend(T.white, 0.7, T.blueDeep), T.blueDeep, 12.5, false, 'text'],
  ['Respiration "chiffre cle" : 79+ blanc / degrade bleu->bleu profond', T.white, T.blueDeep, 56, true, 'text'],
  ['Respiration "chiffre cle" : phrase blanc 90% / degrade bleu->bleu profond', blend(T.white, 0.9, T.blueDeep), T.blueDeep, 18, false, 'text'],
  ['Respiration "citation" : blanc opaque italique / voile marine (pire cas photo blanche, ~.74)', T.white, blend(T.footerBg, 0.74, T.white), 24, true, 'text'],
];

const rows = cases.map(([label, fg, bg, size, bold, kind]) => {
  const ratio = contrast(fg, bg);
  const req = threshold(size, bold, kind);
  return { label, ratio: Math.round(ratio * 100) / 100, req, verdict: ratio >= req ? 'OK' : 'ECHEC' };
});

const w1 = Math.max(...rows.map((r) => r.label.length));
console.log('| Combinaison'.padEnd(w1 + 2) + '| Ratio | Seuil | Verdict |');
console.log('|' + '-'.repeat(w1 + 1) + '|-------|-------|---------|');
for (const r of rows) {
  console.log(
    '| ' + r.label.padEnd(w1) + ' | ' + r.ratio.toFixed(2).padStart(5) + ' | ' + (r.req.toFixed(1) + ':1').padStart(5) + ' | ' + r.verdict.padEnd(7) + ' |'
  );
}
const fails = rows.filter((r) => r.verdict === 'ECHEC');
console.log('\n' + (fails.length === 0 ? 'Toutes les combinaisons passent.' : fails.length + ' échec(s).'));
