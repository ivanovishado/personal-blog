import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(110),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    authors: z.array(z.string()).min(1).default(['Ivan Galaviz']),
    tags: z.array(z.string()).min(1).max(5),
    lang: z.enum(['en', 'es']),
    translationSlug: z.string().optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
    tldr: z.string().max(200).optional(),
  }),
});

export const collections = { blog };
