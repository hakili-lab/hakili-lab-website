// Configuration Astro du site : URL de production (pour le sitemap et les
// URLs canoniques) et generation du sitemap-index.xml au build.
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/data/site.js';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL, // defini dans src/data/site.js
  server: { port: 3000 },
  // /dr-maya a ete renomme en /maya. L'ancienne adresse a pu etre partagee ou
  // indexee depuis la mise en ligne : en mode static, Astro construit pour
  // chaque entree une vraie page de redirection (meta refresh + canonical),
  // donc l'ancien lien continue d'aboutir au lieu de tomber en 404.
  redirects: {
    '/dr-maya': '/maya',
  },
  integrations: [
    sitemap({
      // Les articles de blog en brouillon et toute entree de collection avec
      // pretPourPublication:false sont deja exclus de getStaticPaths ; ils ne
      // produisent donc jamais de page et n'apparaissent jamais ici.
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
