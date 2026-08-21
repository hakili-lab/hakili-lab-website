#!/usr/bin/env node
// Verifie chaque route du build de production avec un vrai navigateur (Playwright) :
// - axe-core (regles WCAG 2.0/2.1 A/AA) ;
// - capture d'ecran a 1280px et 390px (dossier de sortie) ;
// - liens morts internes (chaque <a href> qui commence par "/" doit correspondre
//   a une route reellement construite).
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
  const results = [];

  for (const route of routes) {
    const url = base + route;
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

    if (shots) {
      const name = route === '/' ? 'accueil' : route.replace(/^\/|\/$/g, '').replace(/\//g, '_');
      await page.screenshot({ path: path.join(shots, name + '-1280.png'), fullPage: true });
    }

    // Liens internes morts
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    for (const href of hrefs) {
      if (!href || !href.startsWith('/') || href.startsWith('//')) continue;
      const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
      if (clean && !knownPaths.has(clean)) {
        deadLinks.push({ page: route, href });
      }
    }

    await context.close();

    // Mobile : capture uniquement (axe deja fait en desktop, evite de doubler le temps)
    if (shots) {
      const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const mpage = await mctx.newPage();
      await mpage.goto(url, { waitUntil: 'networkidle' });
      const name = route === '/' ? 'accueil' : route.replace(/^\/|\/$/g, '').replace(/\//g, '_');
      await mpage.screenshot({ path: path.join(shots, name + '-390.png'), fullPage: true });
      await mctx.close();
    }

    totalViolations += axe.violations.length;
    results.push({ route, violations: axe.violations });
    console.log(route.padEnd(30) + ' -> ' + axe.violations.length + ' violation(s) axe-core');
    for (const v of axe.violations) {
      console.log('   [' + v.impact + '] ' + v.id + ' (' + v.nodes.length + ' element(s)) : ' + v.help);
    }
  }

  await browser.close();

  console.log('\n=== Liens internes morts ===');
  if (deadLinks.length === 0) {
    console.log('Aucun.');
  } else {
    for (const d of deadLinks) console.log(d.page + ' -> ' + d.href);
  }

  console.log('\n=== Resume ===');
  console.log(routes.length + ' route(s) verifiee(s), ' + totalViolations + ' violation(s) axe-core au total, ' + deadLinks.length + ' lien(s) mort(s).');

  if (totalViolations > 0 || deadLinks.length > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
