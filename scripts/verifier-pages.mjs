#!/usr/bin/env node
// Verifie chaque route du build de production avec un vrai navigateur (Playwright) :
// - axe-core (regles WCAG 2.0/2.1 A/AA) ;
// - capture d'ecran a 1280px et 390px (dossier de sortie) ;
// - liens morts internes (chaque <a href> qui commence par "/" doit correspondre
//   a une route reellement construite) ;
// - ancres orphelines (tout href avec un fragment "#id" doit correspondre a un
//   element id="id" reellement present sur la page cible : "/#services" est
//   verifie contre "/", "#faq" est verifie contre la page courante) ;
// - images deformees : toute <img> en object-fit:fill (la valeur par defaut
//   quand object-fit n'est pas precise) dont le ratio affiche s'ecarte de
//   plus de 2% de son ratio naturel est signalee (trouve sur le logo du pied
//   de page : hauteur forcee sans largeur proportionnelle -> logo ecrase
//   verticalement). object-fit:cover/contain sont ignores : recadrer ou
//   letterboxer une photo est voulu, ca ne deforme aucun pixel.
//
// Usage : node scripts/verifier-pages.mjs [--shots=dossier] [--base=http://localhost:4321]
// Prerequis : npm run build && npm run preview (serveur deja lance sur --base).

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

// --- Detecteur de repetitions / quasi-doublons de contenu -----------------
// Chasse trois formes du meme probleme (la meme information ecrite deux fois
// sur le site, decouverte via le "79+" duplique a 1125px d'intervalle sur
// l'accueil) : bloc identique repete, quasi-doublon reformule (>85% de
// similarite), chiffre-cle repete ("79+ enseignants", "5 centres"...).
//
// Elements retenus : p, li, h2, h3, blockquote, figcaption, entre 20 et 200
// caracteres (les fragments plus courts sont trop generiques pour etre
// significatifs, les plus longs sont des paragraphes de fond legitimement
// uniques). header/topbar/menu/footer/bandeau mobile sont exclus : ils se
// repetent sur chaque page par construction, ce n'est pas un doublon de
// contenu. Un element qui contient lui-meme un autre element retenu (ex. un
// blockquote qui contient un p) n'est pas compte en plus de son contenu :
// c'est le piege du premier essai (une section signalee comme doublon de son
// propre .wrap interne).
const BLOCK_SELECTOR = 'p, li, h2, h3, blockquote, figcaption';
const TEMPLATE_SELECTOR = '.topbar, .site-header, footer, .mobile-cta, .breadcrumbs';
const BLOCK_MIN_LEN = 20;
const BLOCK_MAX_LEN = 200;
const NEAR_DUP_THRESHOLD = 0.85;

// Echos volontaires, verifies un par un et laisses en l'etat : chaque entree
// explique pourquoi ce n'est pas une repetition a corriger. Cle = texte
// normalise (voir normalizeText) du bloc le plus court des deux.
const EXCEPTIONS = new Map([
  // Citation d'ouverture de l'accueil (bandeau photo plein cadre, texte
  // integral) : reprend mot pour mot la premiere phrase du texte de
  // /a-propos. Choix assume : l'accueil cite une phrase entiere plutot que
  // de la reformuler pour ne pas trahir la citation ; /a-propos reste
  // l'endroit ou cette idee est developpee et argumentee.
  [
    'lechec en mathematiques nest presque jamais une question de capacite',
    "Citation reprise mot pour mot depuis /a-propos (bandeau photo de l'accueil) : reformuler une citation la denaturerait, /a-propos developpe l'idee.",
  ],
  // Message de repli quand une fiche centre n'a pas encore d'adresse postale
  // reelle (5 centres concernes). C'est une micro-copie d'interface pour un
  // etat "donnee manquante", au meme titre qu'un message d'erreur de
  // formulaire : la coherence exige qu'elle soit identique partout ou elle
  // s'applique, ce n'est pas du contenu editorial qui devrait varier.
  [
    'pour l adresse exacte et l itineraire appelez nous 57 91 91 91 58 79 50 50 ou contactez nous',
    "Micro-copie de repli pour centre sans adresse publique encore renseignee (comme un message d'etat vide) : coherence voulue, pas un doublon editorial.",
  ],
  // "Enseignants et etablissements" (public vise) + les 3 descripteurs de
  // fabrication ci-dessous sont repetes a l'identique sur les 4 fiches de la
  // Collection Hakili Lab (mathematiques-3e/4e/5e/6e) parce que c'est le
  // meme fait reel pour chaque tome de la collection : le meme editeur, la
  // meme cible, la meme approche pedagogique. Le reformuler tome par tome
  // inventerait une nuance qui n'existe pas entre les niveaux.
  [
    'enseignants et etablissements',
    'Meme public reel pour tous les tomes de la Collection Hakili Lab (manuels 3e/4e/5e/6e) : reformuler creerait une fausse nuance entre niveaux.',
  ],
  [
    'cours structure conforme au programme burkinabe',
    'Meme standard de fabrication pour tous les tomes de la Collection Hakili Lab : caracteristique reelle et identique, pas une reformulation paresseuse.',
  ],
  [
    'encadres methode et rappels',
    'Meme standard de fabrication pour tous les tomes de la Collection Hakili Lab (voir justification ci-dessus).',
  ],
  [
    'approche par les competences',
    'Meme standard de fabrication pour tous les tomes de la Collection Hakili Lab (voir justification ci-dessus).',
  ],
  [
    'parents qui veulent suivre le travail a la maison',
    'Meme public reel pour tous les tomes de la Collection Hakili Lab (voir justification ci-dessus).',
  ],
  [
    'exercices progressifs et situations d integration',
    'Meme standard de fabrication pour tous les tomes de la Collection Hakili Lab (voir justification ci-dessus).',
  ],
  // TEMPORAIRE, a retirer des que les 3 articles de blog ont leur vrai texte
  // (demande explicite du 2026-08-22 : publier les articles tel quel, avec
  // mention "contenu d'exemple", plutot que de les laisser en brouillon).
  // Cette exception ne doit pas devenir permanente : c'est la meme phrase
  // d'attente que le reste du projet evite partout ailleurs.
  [
    'contenu d exemple cet article prefigure la page dediee du site definitif le texte complet reste a rediger avant mise en ligne',
    'Phrase d\'attente identique sur les 3 articles de blog, publies tel quel sur demande explicite en attendant leur vrai texte : a retirer de cette liste des que le contenu reel est ecrit.',
  ],
  // "Comment cela se passe" : intitule de colonne du gabarit "modal-cols" a
  // deux colonnes ("Pour qui" / "Comment cela se passe"), partage par
  // /methode et les 4 pages /services/<formule>. C'est un intitule
  // d'interface (comme un en-tete de colonne de tableau), pas une
  // information de fond qui devrait etre unique par page.
  [
    'comment cela se passe',
    'Intitule de colonne du gabarit "modal-cols" partage par /methode et les fiches /services/<formule> : libelle d\'interface, pas un contenu editorial.',
  ],
]);

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normalizeText(text) {
  return stripAccents(text.toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trigramSet(s) {
  const padded = '  ' + s + ' ';
  const set = new Set();
  for (let i = 0; i < padded.length - 2; i++) set.add(padded.slice(i, i + 3));
  return set;
}

function jaccardSimilarity(a, b) {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

// Correspondance route -> fichier source, par convention de routage Astro
// (evite une table a maintenir a la main pour chaque nouvelle page).
function routeToSourceFile(route) {
  if (route === '/404.html') return 'src/pages/404.astro';
  const clean = route.replace(/^\/|\/$/g, '');
  const parts = clean ? clean.split('/') : [];
  const base = path.join('src', 'pages', ...parts);
  const indexPath = path.join(base, 'index.astro');
  if (existsSync(indexPath)) return indexPath.replace(/\\/g, '/');
  if (parts.length >= 1) {
    const dynamicPath = path.join('src', 'pages', ...parts.slice(0, -1), '[slug].astro');
    if (existsSync(dynamicPath)) return dynamicPath.replace(/\\/g, '/');
  }
  const flat = base + '.astro';
  if (existsSync(flat)) return flat.replace(/\\/g, '/');
  return '(fichier source introuvable)';
}

// "79+ enseignants", "5 centres" : un nombre suivi d'un nom, hors gabarit.
// Repere les chiffres-cles repetes meme quand le reste de la phrase differe.
function extractKeyFigures(rawText) {
  const text = rawText.toLowerCase();
  const re = /(\d+\+?)\s+(\p{L}+)/gu;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    out.push({ number: m[1], noun: stripAccents(m[2]), excerpt: m[0] });
  }
  return out;
}

function excerpt(text, len = 90) {
  return text.length > len ? text.slice(0, len).trim() + '…' : text;
}

function parseArgs(argv) {
  const out = { base: 'http://localhost:4321', shots: null };
  for (const a of argv) {
    if (a.startsWith('--base=')) out.base = a.slice('--base='.length);
    if (a.startsWith('--shots=')) out.shots = a.slice('--shots='.length);
  }
  return out;
}

// Une capture plein cadre (CDP) ne declenche pas de vrais evenements de
// defilement : IntersectionObserver (revelation au defilement) n'y reagit
// jamais, contrairement a un vrai visiteur qui parcourt la page. On simule
// un defilement reel avant de capturer, sinon la capture montrerait des
// sections vides qui n'existent pas pour un utilisateur reel.
//
// window.scrollTo() appele depuis page.evaluate() ne suffit pas : en mode
// headless, Chromium ne planifie pas forcement de vraies frames de rendu
// pendant une boucle evaluate() qui ne rend jamais la main a Playwright,
// et IntersectionObserver ne se declenche donc pas. page.mouse.wheel(),
// en revanche, simule un vrai evenement d'entree entre chaque appel
// (controle rendu a Playwright a chaque waitForTimeout), ce qui force de
// vraies frames - verifie empiriquement avant d'ecrire cette version.
async function scrollThroughPage(page) {
  const maxY = await page.evaluate(() => document.body.scrollHeight);
  let scrolled = 0;
  while (scrolled < maxY) {
    await page.mouse.wheel(0, 700);
    scrolled += 700;
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(500); // laisse les transitions 400ms se terminer
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

function listRoutes(distDir) {
  const routes = [];
  function walk(dir, urlPrefix) {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full, urlPrefix + entry + '/');
      } else if (entry === 'index.html') {
        routes.push(urlPrefix || '/');
      } else if (entry === '404.html') {
        routes.push('/404.html');
      }
    }
  }
  walk(distDir, '/');
  return [...new Set(routes)].sort();
}

async function main() {
  const { base, shots } = parseArgs(process.argv.slice(2));
  const distDir = path.resolve('dist');
  const routes = listRoutes(distDir);
  const knownPaths = new Set(routes.map((r) => (r === '/' ? '/' : r.replace(/\/$/, ''))));

  if (shots) mkdirSync(shots, { recursive: true });

  const browser = await chromium.launch();
  let totalViolations = 0;
  const deadLinks = [];
  const orphanAnchors = [];
  const ratioIssues = [];
  const hrefsByRoute = {};
  const idsByRoute = {};
  const allBlocks = [];

  // Passe 1 : axe-core, captures, collecte des href et des id de chaque route.
  for (const route of routes) {
    const url = base + route;
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

    // Force le chargement des images encore en attente (loading="lazy" hors
    // viewport) avant de mesurer leurs proportions.
    const pageRatioIssues = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      imgs.forEach((img) => { img.loading = 'eager'; });
      await Promise.all(
        imgs.map((img) =>
          img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = img.onerror = resolve; })
        )
      );
      const out = [];
      imgs.forEach((img) => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        // object-fit: cover/contain/scale-down recadrent ou letterboxent sans
        // deformer un seul pixel : une difference entre la boite rendue et le
        // ratio naturel y est normale et voulue. Seul "fill" (la valeur par
        // defaut quand object-fit n'est pas precise) etire l'image de facon
        // non uniforme - c'est le seul cas a signaler.
        const objectFit = getComputedStyle(img).objectFit;
        if (objectFit !== 'fill') return;
        const rect = img.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        const naturalRatio = img.naturalWidth / img.naturalHeight;
        const renderedRatio = rect.width / rect.height;
        const ecart = Math.abs(renderedRatio - naturalRatio) / naturalRatio;
        if (ecart > 0.02) {
          out.push({
            src: img.currentSrc || img.src,
            alt: img.alt,
            naturel: img.naturalWidth + 'x' + img.naturalHeight,
            rendu: Math.round(rect.width) + 'x' + Math.round(rect.height),
            ecart: (ecart * 100).toFixed(1) + '%',
          });
        }
      });
      return out;
    });
    for (const issue of pageRatioIssues) ratioIssues.push({ page: route, ...issue });

    const pageBlocks = await page.evaluate(
      ({ selector, templateSelector, minLen, maxLen }) => {
        const candidates = Array.from(document.querySelectorAll(selector)).filter(
          (el) => !el.closest(templateSelector)
        );
        const out = [];
        for (const el of candidates) {
          // Ne garde que l'element le plus imbrique : un blockquote qui
          // contient un p candidat ne doit pas etre compte en plus de ce p.
          const hasNestedCandidate = candidates.some((other) => other !== el && el.contains(other));
          if (hasNestedCandidate) continue;
          const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
          if (text.length < minLen || text.length > maxLen) continue;
          const rect = el.getBoundingClientRect();
          out.push({ tag: el.tagName.toLowerCase(), text, y: Math.round(rect.top + window.scrollY) });
        }
        return out;
      },
      { selector: BLOCK_SELECTOR, templateSelector: TEMPLATE_SELECTOR, minLen: BLOCK_MIN_LEN, maxLen: BLOCK_MAX_LEN }
    );
    const sourceFile = routeToSourceFile(route);
    for (const b of pageBlocks) allBlocks.push({ route, sourceFile, ...b, norm: normalizeText(b.text) });

    if (shots) {
      await scrollThroughPage(page);
      const name = route === '/' ? 'accueil' : route.replace(/^\/|\/$/g, '').replace(/\//g, '_');
      await page.screenshot({ path: path.join(shots, name + '-1280.png'), fullPage: true });
    }

    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    const ids = await page.$$eval('[id]', (els) => els.map((el) => el.id));
    hrefsByRoute[route] = hrefs;
    idsByRoute[route] = new Set(ids);

    for (const href of hrefs) {
      if (!href || !href.startsWith('/') || href.startsWith('//')) continue;
      const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
      // Un lien peut viser une page (index.html, dans knownPaths) ou un
      // fichier statique servi tel quel (PDF, etc., copie sous dist/ sans
      // passer par listRoutes() qui ne recense que les pages HTML) : on
      // verifie aussi l'existence directe sur disque avant de conclure a
      // un lien mort.
      const isStaticFile = existsSync(path.join(distDir, clean));
      if (clean && !knownPaths.has(clean) && !isStaticFile) {
        deadLinks.push({ page: route, href });
      }
    }

    await context.close();

    if (shots) {
      const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const mpage = await mctx.newPage();
      await mpage.goto(url, { waitUntil: 'networkidle' });
      await scrollThroughPage(mpage);
      const name = route === '/' ? 'accueil' : route.replace(/^\/|\/$/g, '').replace(/\//g, '_');
      await mpage.screenshot({ path: path.join(shots, name + '-390.png'), fullPage: true });
      await mctx.close();
    }

    totalViolations += axe.violations.length;
    console.log(route.padEnd(30) + ' -> ' + axe.violations.length + ' violation(s) axe-core');
    for (const v of axe.violations) {
      console.log('   [' + v.impact + '] ' + v.id + ' (' + v.nodes.length + ' element(s)) : ' + v.help);
    }
  }

  await browser.close();

  // Passe 2 : ancres orphelines, maintenant que les id de toutes les routes sont connus.
  for (const route of routes) {
    for (const href of hrefsByRoute[route]) {
      if (!href || !href.includes('#')) continue;
      const [rawPath, hash] = href.split('#');
      if (!hash) continue;
      let targetRoute;
      if (rawPath === '' || rawPath === '#') {
        targetRoute = route; // "#faq" : ancre sur la page courante
      } else if (rawPath.startsWith('/')) {
        targetRoute = rawPath.replace(/\/$/, '') || '/';
        if (targetRoute !== '/' && !targetRoute.endsWith('/')) targetRoute += '/';
      } else {
        continue; // lien externe ou relatif non standard, hors perimetre
      }
      const targetIds = idsByRoute[targetRoute];
      if (!targetIds) {
        orphanAnchors.push({ page: route, href, raison: 'page cible "' + targetRoute + '" introuvable' });
      } else if (!targetIds.has(hash)) {
        orphanAnchors.push({ page: route, href, raison: 'id="' + hash + '" absent de ' + targetRoute });
      }
    }
  }

  // Passe 3 : repetitions et quasi-doublons de contenu, hors gabarit.
  const exactDuplicates = [];
  const byRouteNorm = new Map();
  const byNorm = new Map();
  for (const b of allBlocks) {
    const rk = b.route + '|' + b.norm;
    if (!byRouteNorm.has(rk)) byRouteNorm.set(rk, []);
    byRouteNorm.get(rk).push(b);
    if (!byNorm.has(b.norm)) byNorm.set(b.norm, []);
    byNorm.get(b.norm).push(b);
  }

  // (a) meme bloc repete deux fois (ou plus) sur la meme page.
  for (const group of byRouteNorm.values()) {
    if (group.length < 2) continue;
    if (EXCEPTIONS.has(group[0].norm)) continue;
    exactDuplicates.push({ type: 'meme page', occurrences: group });
  }

  // (b) meme bloc identique sur plus de 2 pages differentes (hors gabarit).
  for (const [norm, group] of byNorm) {
    const routesInvolved = new Set(group.map((b) => b.route));
    if (routesInvolved.size <= 2) continue;
    if (EXCEPTIONS.has(norm)) continue;
    exactDuplicates.push({ type: 'plus de 2 pages', occurrences: group });
  }

  // (c) quasi-doublons : >= 85% de similarite (trigrammes), textes differents.
  const nearDuplicates = [];
  const withTrigrams = allBlocks.map((b) => ({ ...b, tri: trigramSet(b.norm) }));
  for (let i = 0; i < withTrigrams.length; i++) {
    for (let j = i + 1; j < withTrigrams.length; j++) {
      const a = withTrigrams[i];
      const b = withTrigrams[j];
      if (a.norm === b.norm) continue; // doublon exact, deja couvert en (a)/(b)
      if (EXCEPTIONS.has(a.norm) || EXCEPTIONS.has(b.norm)) continue;
      const sim = jaccardSimilarity(a.tri, b.tri);
      if (sim >= NEAR_DUP_THRESHOLD) nearDuplicates.push({ a, b, sim });
    }
  }

  // (d) chiffre-cle repete ("79+ enseignants", "5 centres") hors gabarit,
  // sur au moins deux blocs distincts de la meme page (un seul bloc qui cite
  // un chiffre une fois n'est pas une repetition).
  const figuresByRouteKey = new Map();
  for (const b of allBlocks) {
    for (const fig of extractKeyFigures(b.text)) {
      const key = b.route + '|' + fig.number + '|' + fig.noun;
      if (!figuresByRouteKey.has(key)) figuresByRouteKey.set(key, []);
      figuresByRouteKey.get(key).push({ block: b, excerpt: fig.excerpt });
    }
  }
  const repeatedFigures = [];
  for (const group of figuresByRouteKey.values()) {
    const distinctBlocks = new Set(group.map((g) => g.block.y + '|' + g.block.text));
    if (distinctBlocks.size < 2) continue;
    repeatedFigures.push({ group });
  }

  console.log('\n=== Liens internes morts ===');
  console.log(deadLinks.length === 0 ? 'Aucun.' : '');
  for (const d of deadLinks) console.log(d.page + ' -> ' + d.href);

  console.log('\n=== Ancres orphelines ===');
  console.log(orphanAnchors.length === 0 ? 'Aucune.' : '');
  for (const o of orphanAnchors) console.log(o.page + ' -> ' + o.href + '  (' + o.raison + ')');

  console.log('\n=== Images deformees (ecart de ratio > 2%) ===');
  console.log(ratioIssues.length === 0 ? 'Aucune.' : '');
  for (const r of ratioIssues) {
    console.log(r.page + ' -> ' + (r.alt || r.src) + '  naturel ' + r.naturel + ' vs rendu ' + r.rendu + '  (ecart ' + r.ecart + ')');
  }

  console.log('\n=== Repetitions de contenu (bloc identique) ===');
  console.log(exactDuplicates.length === 0 ? 'Aucune.' : '');
  for (const d of exactDuplicates) {
    console.log('[' + d.type + '] "' + excerpt(d.occurrences[0].text) + '"');
    for (const o of d.occurrences) {
      console.log('   ' + o.route + '  (' + o.sourceFile + ', y=' + o.y + ')');
    }
  }

  console.log('\n=== Quasi-doublons (similarite >= 85%) ===');
  console.log(nearDuplicates.length === 0 ? 'Aucun.' : '');
  for (const { a, b, sim } of nearDuplicates) {
    console.log('[' + Math.round(sim * 100) + '%]');
    console.log('   ' + a.route + '  (' + a.sourceFile + ', y=' + a.y + ') : "' + excerpt(a.text) + '"');
    console.log('   ' + b.route + '  (' + b.sourceFile + ', y=' + b.y + ') : "' + excerpt(b.text) + '"');
  }

  console.log('\n=== Chiffres-cles repetes hors gabarit (meme page) ===');
  console.log(repeatedFigures.length === 0 ? 'Aucun.' : '');
  for (const { group } of repeatedFigures) {
    console.log('"' + group[0].excerpt + '" sur ' + group[0].block.route);
    for (const g of group) {
      console.log('   (' + g.block.sourceFile + ', y=' + g.block.y + ') : "' + excerpt(g.block.text) + '"');
    }
  }

  console.log('\n=== Resume ===');
  console.log(
    routes.length +
      ' route(s) verifiee(s), ' +
      totalViolations +
      ' violation(s) axe-core, ' +
      deadLinks.length +
      ' lien(s) mort(s), ' +
      orphanAnchors.length +
      ' ancre(s) orpheline(s), ' +
      ratioIssues.length +
      ' image(s) deformee(s), ' +
      exactDuplicates.length +
      ' repetition(s) de contenu, ' +
      nearDuplicates.length +
      ' quasi-doublon(s), ' +
      repeatedFigures.length +
      ' chiffre(s)-cle repete(s).'
  );

  if (
    totalViolations > 0 ||
    deadLinks.length > 0 ||
    orphanAnchors.length > 0 ||
    ratioIssues.length > 0 ||
    exactDuplicates.length > 0 ||
    nearDuplicates.length > 0 ||
    repeatedFigures.length > 0
  )
    process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
