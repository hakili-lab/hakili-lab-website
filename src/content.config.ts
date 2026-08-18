import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      titre: z.string(),
      description: z.string(),
      date: z.date(),
      categorie: z.enum(['Pédagogie', 'Conseils', 'Actualité']),
      image: image().optional(),
      brouillon: z.boolean().default(false),
    }),
});

export const collections = { blog };
