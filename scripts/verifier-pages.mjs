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
import { readdirSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';

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
      if (clean && !knownPaths.has(clean)) {
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
      ' image(s) deformee(s).'
  );

  if (totalViolations > 0 || deadLinks.length > 0 || orphanAnchors.length > 0 || ratioIssues.length > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
