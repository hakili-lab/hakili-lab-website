// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/data/site.js';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL, // defini dans src/data/site.js
  server: { port: 3000 },
  integrations: [
    sitemap({
      // Les articles de blog en brouillon et toute entree de collection avec
      // pretPourPublication:false sont deja exclus de getStaticPaths ; ils ne
      // produisent donc jamais de page et n'apparaissent jamais ici.
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
