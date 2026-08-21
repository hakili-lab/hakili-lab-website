#!/usr/bin/env node
// Pretraite un dossier de photos brutes (export d'appareil photo ou de telephone,
// souvent 3000-6000px de large et plusieurs Mo par fichier) en "images maitresses"
// pretes a etre deposees dans src/assets/photos/.
//
// Ce script NE remplace PAS le pipeline responsive du site : une fois les
// maitresses en place, le composant <Picture> d'Astro (deja utilise dans
// Hero.astro, Centres.astro, Gallery.astro, About.astro, Blog.astro) genere
// lui-meme, a la compilation, les variantes AVIF/WebP/JPEG et les tailles
// (srcset) attendues par chaque emplacement. Ce script sert seulement a
// eviter de commiter des fichiers source demesures et a harmoniser leur poids.
//
// Usage :
//   node scripts/optimiser-images.mjs <dossier_source> <dossier_sortie> [--largeur=1600] [--qualite=82]
//
// Exemple :
//   node scripts/optimiser-images.mjs ./photos-brutes ./photos-pretes --largeur=1600
//   node scripts/optimiser-images.mjs ./photos-brutes/hero ./photos-pretes/hero --largeur=2600
//
// Voir scripts/README-images.md pour la largeur cible recommandee par emplacement.

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function parseArgs(argv) {
  const positional = [];
  let width = 1600;
  let quality = 82;
  for (const arg of argv) {
    if (arg.startsWith('--largeur=')) width = Number(arg.split('=')[1]);
    else if (arg.startsWith('--qualite=')) quality = Number(arg.split('=')[1]);
    else positional.push(arg);
  }
  return { src: positional[0], out: positional[1], width, quality };
}

async function main() {
  const { src, out, width, quality } = parseArgs(process.argv.slice(2));
  if (!src || !out) {
    console.error('Usage : node scripts/optimiser-images.mjs <dossier_source> <dossier_sortie> [--largeur=1600] [--qualite=82]');
    process.exit(1);
  }

  await mkdir(out, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && EXTENSIONS.has(path.extname(e.name).toLowerCase()));

  if (files.length === 0) {
    console.log('Aucune image trouvee dans ' + src);
    return;
  }

  console.log('Largeur cible : ' + width + 'px  |  Qualite JPEG : ' + quality + '\n');

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const inputPath = path.join(src, file.name);
    const outputPath = path.join(out, file.name.replace(/\.(png|webp)$/i, '.jpg'));

    const before = (await stat(inputPath)).size;
    const image = sharp(inputPath).rotate(); // rotate() applique l'orientation EXIF puis la retire
    const meta = await image.metadata();

    const resized = (meta.width && meta.width > width)
      ? image.resize({ width, withoutEnlargement: true })
      : image;

    await resized.jpeg({ quality, mozjpeg: true }).toFile(outputPath);

    const after = (await stat(outputPath)).size;
    totalBefore += before;
    totalAfter += after;

    const beforeDim = meta.width + '×' + meta.height;
    console.log(
      file.name.padEnd(28) +
      beforeDim.padStart(12) + ' -> ' +
      (Math.round(before / 1024) + ' Ko').padStart(9) + '  =>  ' +
      (Math.round(after / 1024) + ' Ko').padStart(9)
    );
  }

  console.log('\nTotal : ' + Math.round(totalBefore / 1024) + ' Ko -> ' + Math.round(totalAfter / 1024) + ' Ko');
  console.log('Images maitresses ecrites dans ' + out);
  console.log('Depose-les ensuite dans src/assets/photos/ (memes noms de fichiers que ceux importes par les composants, ou mets a jour les imports).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
